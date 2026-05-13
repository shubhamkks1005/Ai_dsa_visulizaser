// lib/ai/ai-utils.ts

/**
 * Shared AI utility functions.
 * Used by analyzer.ts, prompt-generator.ts, generator.ts, repair-html route.
 *
 * Provides:
 *  - Gemini multi-key rotation with cooldown
 *  - Exponential backoff with jitter
 *  - Generic model chain runner
 *  - Retryable error detection
 */

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface ModelCallResult<T> {
  result:  T;
  model:   string;
  attempt: number;
}

export interface RetryConfig {
  maxRetries:   number;   // max retry attempts per model
  baseDelayMs:  number;   // base delay in ms (doubles each retry)
  maxDelayMs:   number;   // max delay cap
  jitterMs:     number;   // random jitter range
}

export interface ModelFn<T> {
  name: string;           // model name for logging
  fn:   () => Promise<T>; // actual model call
}

// ═══════════════════════════════════════════════════
// DEFAULT RETRY CONFIG
// ═══════════════════════════════════════════════════

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries:  3,
  baseDelayMs: 1000,
  maxDelayMs:  16000,
  jitterMs:    400,
};

// ═══════════════════════════════════════════════════
// RETRYABLE ERROR DETECTION
// ═══════════════════════════════════════════════════

/**
 * isRetryableError(error)
 * Returns true if error is transient and worth retrying.
 */
export function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error
    ? error.message
    : String(error);

  const retryablePatterns = [
    '429',
    'rate limit',
    'Rate limit',
    'rate_limit',
    'RATE_LIMIT',
    'RESOURCE_EXHAUSTED',
    'quota',
    'Quota',
    'too many requests',
    'Too Many Requests',
    '503',
    '502',
    '500',
    'timeout',
    'Timeout',
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'socket hang up',
    'network',
    'Network',
    'overloaded',
    'Service Unavailable',
    'temporarily unavailable',
    'Internal Server Error',
    'Gateway',
  ];

  return retryablePatterns.some(p => msg.includes(p));
}

/**
 * is429Error(error)
 * Specifically detects 429 / quota errors.
 */
export function is429Error(error: unknown): boolean {
  const msg = error instanceof Error
    ? error.message
    : String(error);

  return (
    msg.includes('429')                ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota')              ||
    msg.includes('Quota')              ||
    msg.includes('rate limit')         ||
    msg.includes('Rate limit')         ||
    msg.includes('too many requests')
  );
}

/**
 * extractRetryDelay(error)
 * Tries to extract suggested retry delay from error message.
 * Returns ms or null if not found.
 */
export function extractRetryDelay(error: unknown): number | null {
  const msg = error instanceof Error
    ? error.message
    : String(error);

  // Pattern: "retry in X.XXs" or "retryDelay":"Xs"
  const patterns = [
    /retry[^\d]*(\d+(?:\.\d+)?)\s*s/i,
    /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i,
    /please retry in (\d+(?:\.\d+)?)/i,
    /try again in (\d+(?:\.\d+)?)\s*s/i,
  ];

  for (const pattern of patterns) {
    const match = msg.match(pattern);
    if (match) {
      const seconds = parseFloat(match[1]);
      // Cap at 35 seconds — if longer, skip and try next key/model
      if (seconds <= 35) {
        return Math.ceil(seconds * 1000);
      }
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════
// EXPONENTIAL BACKOFF
// ═══════════════════════════════════════════════════

/**
 * sleep(ms)
 * Simple sleep utility.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * calcBackoffDelay(attempt, config)
 * Calculates exponential backoff delay with jitter.
 *
 * attempt: 1-based attempt number
 * Returns ms to wait before next retry.
 */
export function calcBackoffDelay(
  attempt: number,
  config:  RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  // Exponential: baseDelay * 2^(attempt-1)
  const exponential = config.baseDelayMs * Math.pow(2, attempt - 1);

  // Cap at maxDelay
  const capped = Math.min(exponential, config.maxDelayMs);

  // Add random jitter
  const jitter = Math.random() * config.jitterMs;

  return Math.round(capped + jitter);
}

/**
 * withExponentialBackoff(fn, config?, label?)
 * Wraps a function call with exponential backoff retry logic.
 *
 * - Retries only on retryable errors
 * - Respects suggested retry delay if present in error
 * - Gives up after maxRetries
 */
export async function withExponentialBackoff<T>(
  fn:      () => Promise<T>,
  config:  RetryConfig = DEFAULT_RETRY_CONFIG,
  label:   string      = 'model'
): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        console.log(`[Backoff] ✅ ${label} succeeded on attempt ${attempt}`);
      }
      return result;

    } catch (error) {
      lastError = error;

      const isLast = attempt === config.maxRetries + 1;

      if (isLast || !isRetryableError(error)) {
        // Either last attempt or non-retryable error — give up
        throw error;
      }

      // Check if error suggests a specific retry delay
      const suggestedDelay = extractRetryDelay(error);
      const backoffDelay   = calcBackoffDelay(attempt, config);

      // Use suggested delay if reasonable, else use backoff
      // If suggested > 30s, skip it and use shorter backoff
      const delay = suggestedDelay && suggestedDelay < 30000
        ? suggestedDelay
        : backoffDelay;

      console.warn(
        `[Backoff] ⚠ ${label} attempt ${attempt} failed: ${
          error instanceof Error ? error.message.slice(0, 100) : String(error).slice(0, 100)
        }`
      );
      console.log(`[Backoff] Waiting ${delay}ms before retry...`);

      await sleep(delay);
    }
  }

  throw lastError;
}

// ═══════════════════════════════════════════════════
// GEMINI KEY ROTATION
// ═══════════════════════════════════════════════════

/**
 * GeminiKeyRotator
 * Manages multiple Gemini API keys with cooldown tracking.
 *
 * .env.local format:
 *   GEMINI_API_KEYS=key1,key2,key3
 *   or
 *   GEMINI_API_KEY=key1   (single key, backwards compat)
 */
class GeminiKeyRotatorClass {
  private keys:         string[]              = [];
  private cooldowns:    Map<string, number>   = new Map();
  private currentIndex: number                = 0;
  private cooldownMs:   number                = 65000; // 65 seconds

  constructor() {
    this.loadKeys();
  }

  private loadKeys(): void {
    // Try multi-key format first
    const multiKey = process.env.GEMINI_API_KEYS;
    if (multiKey) {
      this.keys = multiKey
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
    }

    // Fallback: single key
    if (this.keys.length === 0) {
      const singleKey = process.env.GEMINI_API_KEY;
      if (singleKey) {
        this.keys = [singleKey.trim()];
      }
    }

    if (this.keys.length === 0) {
      console.warn('[GeminiKeyRotator] No Gemini API keys found in environment');
    } else {
      console.log(`[GeminiKeyRotator] Loaded ${this.keys.length} Gemini key(s)`);
    }
  }

  /**
   * getNextKey()
   * Returns next available key that is not in cooldown.
   * Returns null if all keys are in cooldown.
   */
  getNextKey(): string | null {
    if (this.keys.length === 0) return null;

    const now = Date.now();

    // Try keys starting from currentIndex
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      const key = this.keys[idx];

      const cooldownUntil = this.cooldowns.get(key) || 0;

      if (now >= cooldownUntil) {
        // This key is available
        this.currentIndex = (idx + 1) % this.keys.length;
        return key;
      }
    }

    // All keys in cooldown
    return null;
  }

  /**
   * getAllAvailableKeys()
   * Returns all keys not currently in cooldown.
   */
  getAllAvailableKeys(): string[] {
    const now = Date.now();
    return this.keys.filter(key => {
      const cooldownUntil = this.cooldowns.get(key) || 0;
      return now >= cooldownUntil;
    });
  }

  /**
   * markKeyExhausted(key, cooldownMs?)
   * Puts a key in cooldown after 429 error.
   */
  markKeyExhausted(key: string, customCooldownMs?: number): void {
    const cd = customCooldownMs || this.cooldownMs;
    this.cooldowns.set(key, Date.now() + cd);
    console.warn(
      `[GeminiKeyRotator] Key ...${key.slice(-6)} in cooldown for ${cd / 1000}s`
    );
  }

  /**
   * getCooldownStatus()
   * Returns current status of all keys.
   */
  getCooldownStatus(): { key: string; available: boolean; cooldownRemaining: number }[] {
    const now = Date.now();
    return this.keys.map(key => {
      const cooldownUntil  = this.cooldowns.get(key) || 0;
      const available      = now >= cooldownUntil;
      const cooldownRemaining = available ? 0 : Math.ceil((cooldownUntil - now) / 1000);
      return {
        key:     `...${key.slice(-6)}`,
        available,
        cooldownRemaining,
      };
    });
  }

  /**
   * hasAnyKey()
   * True if at least one key is configured (not necessarily available).
   */
  hasAnyKey(): boolean {
    return this.keys.length > 0;
  }

  /**
   * hasAvailableKey()
   * True if at least one key is not in cooldown.
   */
  hasAvailableKey(): boolean {
    return this.getAllAvailableKeys().length > 0;
  }

  /**
   * getMinCooldownWait()
   * Returns ms until earliest key becomes available.
   * Returns 0 if a key is already available.
   */
  getMinCooldownWait(): number {
    if (this.hasAvailableKey()) return 0;

    const now = Date.now();
    let minWait = Infinity;

    this.keys.forEach(key => {
      const cooldownUntil = this.cooldowns.get(key) || 0;
      const wait = Math.max(0, cooldownUntil - now);
      if (wait < minWait) minWait = wait;
    });

    return minWait === Infinity ? 0 : minWait;
  }
}

// Singleton instance
export const GeminiKeyRotator = new GeminiKeyRotatorClass();

// ═══════════════════════════════════════════════════
// GEMINI CALL WITH KEY ROTATION + BACKOFF
// ═══════════════════════════════════════════════════

/**
 * callWithGeminiRotation(modelName, callFn, retryConfig?)
 *
 * Tries all available Gemini keys for a given model.
 * If a key gets 429, marks it as exhausted and tries next key.
 * After all keys exhausted, applies backoff and retries.
 *
 * callFn receives the API key to use.
 */
export async function callWithGeminiRotation<T>(
  modelName: string,
  callFn:    (apiKey: string) => Promise<T>,
  config:    RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  const label = `Gemini ${modelName}`;

  // Round 1: Try each available key once (fast rotation)
  const availableKeys = GeminiKeyRotator.getAllAvailableKeys();

  if (availableKeys.length === 0) {
    const waitMs = GeminiKeyRotator.getMinCooldownWait();
    if (waitMs > 0 && waitMs < 35000) {
      console.log(`[GeminiRotation] All keys in cooldown. Waiting ${waitMs}ms...`);
      await sleep(waitMs + 500);
    } else {
      throw new Error(`Gemini: all API keys are in cooldown. Try again in ~1 minute.`);
    }
  }

  let lastError: unknown = null;

  // Try each available key
  const keysToTry = GeminiKeyRotator.getAllAvailableKeys();

  for (const key of keysToTry) {
    try {
      console.log(`[GeminiRotation] Trying ${label} with key ...${key.slice(-6)}`);
      const result = await callFn(key);
      console.log(`[GeminiRotation] ✅ ${label} succeeded with key ...${key.slice(-6)}`);
      return result;

    } catch (error) {
      lastError = error;

      if (is429Error(error)) {
        // Extract suggested delay for cooldown
        const suggestedDelay = extractRetryDelay(error);
        GeminiKeyRotator.markKeyExhausted(key, suggestedDelay || undefined);
        console.log(`[GeminiRotation] Key exhausted, trying next key...`);
        continue; // Try next key immediately
      }

      // Non-429 error — don't try other keys
      throw error;
    }
  }

  // All keys failed with 429
  // Apply backoff and retry once more if wait is reasonable
  const waitMs = GeminiKeyRotator.getMinCooldownWait();
  if (waitMs > 0 && waitMs < 35000) {
    console.log(`[GeminiRotation] All keys exhausted. Waiting ${waitMs}ms for cooldown...`);
    await sleep(waitMs + 500);

    // One final retry with first available key
    const retryKey = GeminiKeyRotator.getNextKey();
    if (retryKey) {
      try {
        console.log(`[GeminiRotation] Final retry with key ...${retryKey.slice(-6)}`);
        return await callFn(retryKey);
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError || new Error(`${label}: all key rotations failed`);
}

// ═══════════════════════════════════════════════════
// GENERIC MODEL CHAIN RUNNER
// ═══════════════════════════════════════════════════

/**
 * runModelChain(models, retryConfig?, label?)
 *
 * Runs a chain of model functions in order.
 * Each model gets retried with backoff on transient errors.
 * Falls back to next model on persistent failure.
 *
 * Usage:
 *   const result = await runModelChain([
 *     { name: 'Qwen Coder', fn: () => callQwen(prompt) },
 *     { name: 'GPT-OSS',    fn: () => callGPTOSS(prompt) },
 *     { name: 'Groq Llama', fn: () => callGroq(prompt) },
 *   ]);
 */
export async function runModelChain<T>(
  models:  ModelFn<T>[],
  config:  RetryConfig = DEFAULT_RETRY_CONFIG,
  label:   string      = 'task'
): Promise<ModelCallResult<T>> {
  if (models.length === 0) {
    throw new Error(`[ModelChain] No models provided for ${label}`);
  }

  const errors: string[] = [];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`[ModelChain] ${label}: trying ${model.name} (${i + 1}/${models.length})`);

    try {
      const result = await withExponentialBackoff(
        model.fn,
        config,
        `${label}::${model.name}`
      );

      console.log(`[ModelChain] ✅ ${label}: ${model.name} succeeded`);
      return {
        result,
        model:   model.name,
        attempt: i + 1,
      };

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`${model.name}: ${msg.slice(0, 150)}`);
      console.error(`[ModelChain] ❌ ${label}: ${model.name} failed: ${msg.slice(0, 150)}`);

      // Continue to next model
    }
  }

  // All models failed
  throw new Error(
    `[ModelChain] All models failed for ${label}.\n` +
    errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')
  );
}

// ═══════════════════════════════════════════════════
// OPENROUTER HELPERS
// ═══════════════════════════════════════════════════

/**
 * getOpenRouterKey()
 * Returns OpenRouter API key or throws.
 */
export function getOpenRouterKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not set or empty');
  return key;
}

/**
 * getGroqKey()
 * Returns Groq API key or throws.
 */
export function getGroqKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set or empty');
  return key;
}

/**
 * OPENROUTER_HEADERS
 * Standard headers for OpenRouter requests.
 */
export const OPENROUTER_HEADERS = {
  'HTTP-Referer': 'https://dsa-visualizer.vercel.app',
  'X-Title':      'DSA AI Visualizer',
};

// ═══════════════════════════════════════════════════
// MODEL SLUGS — Single source of truth
// Update here when model slugs change
// ═══════════════════════════════════════════════════

export const MODELS = {
  // ── Gemini (via Google SDK) ──────────────────────
  gemini: {
    flash:     'gemini-2.5-flash',
    flashLite: 'gemini-2.5-flash-lite',
    pro:       'gemini-2.5-pro',         // escalation only
  },

  // ── Groq ────────────────────────────────────────
  groq: {
    llama70B: 'llama-3.3-70b-versatile',
  },

  // ── OpenRouter Free ──────────────────────────────
  openrouter: {
    qwenCoder:      'qwen/qwen3-coder:free',
    llama70BInstruct: 'meta-llama/llama-3.3-70b-instruct:free',
    gptOSS120B:     'openai/gpt-oss-120b:free',
    gptOSS20B:      'openai/gpt-oss-20b:free',
    gemma31B:       'google/gemma-4-31b-it:free',
  },
} as const;