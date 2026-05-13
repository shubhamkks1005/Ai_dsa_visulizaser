// lib/ai/ai-utils.ts

/**
 * Shared AI utility functions.
 * Used by analyzer.ts, prompt-generator.ts, generator.ts, repair-html route.
 *
 * Providers:
 *  - Gemini (primary — paid tier)
 *  - Groq   (fallback — free)
 *
 * OpenRouter: REMOVED
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
  maxRetries:  number;
  baseDelayMs: number;
  maxDelayMs:  number;
  jitterMs:    number;
}

export interface ModelFn<T> {
  name: string;
  fn:   () => Promise<T>;
}

// ═══════════════════════════════════════════════════
// RETRY CONFIGS
// ═══════════════════════════════════════════════════

// Gemini paid — light retry (429 rare now)
export const GEMINI_RETRY_CONFIG: RetryConfig = {
  maxRetries:  2,
  baseDelayMs: 1000,
  maxDelayMs:  8000,
  jitterMs:    300,
};

// Groq — light retry
export const GROQ_RETRY_CONFIG: RetryConfig = {
  maxRetries:  1,
  baseDelayMs: 1000,
  maxDelayMs:  5000,
  jitterMs:    200,
};

// General chain config
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries:  1,
  baseDelayMs: 1000,
  maxDelayMs:  8000,
  jitterMs:    300,
};

// ═══════════════════════════════════════════════════
// ERROR DETECTION
// ═══════════════════════════════════════════════════

export function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error
    ? error.message
    : String(error);

  const retryablePatterns = [
    '429',
    'rate limit',
    'Rate limit',
    'RESOURCE_EXHAUSTED',
    'quota',
    'Quota',
    'too many requests',
    '503',
    '502',
    'timeout',
    'Timeout',
    'ETIMEDOUT',
    'ECONNRESET',
    'socket hang up',
    'overloaded',
    'Service Unavailable',
    'Internal Server Error',
  ];

  return retryablePatterns.some(p => msg.includes(p));
}

export function is429Error(error: unknown): boolean {
  const msg = error instanceof Error
    ? error.message
    : String(error);

  return (
    msg.includes('429')                ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota')              ||
    msg.includes('rate limit')         ||
    msg.includes('too many requests')
  );
}

export function extractRetryDelay(error: unknown): number | null {
  const msg = error instanceof Error
    ? error.message
    : String(error);

  const patterns = [
    /retry[^\d]*(\d+(?:\.\d+)?)\s*s/i,
    /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i,
    /please retry in (\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = msg.match(pattern);
    if (match) {
      const seconds = parseFloat(match[1]);
      if (seconds <= 35) {
        return Math.ceil(seconds * 1000);
      }
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════
// SLEEP
// ═══════════════════════════════════════════════════

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function calcBackoffDelay(
  attempt: number,
  config:  RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const exponential = config.baseDelayMs * Math.pow(2, attempt - 1);
  const capped      = Math.min(exponential, config.maxDelayMs);
  const jitter      = Math.random() * config.jitterMs;
  return Math.round(capped + jitter);
}

// ═══════════════════════════════════════════════════
// EXPONENTIAL BACKOFF
// ═══════════════════════════════════════════════════

export async function withExponentialBackoff<T>(
  fn:     () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  label:  string      = 'model'
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
        throw error;
      }

      const suggestedDelay = extractRetryDelay(error);
      const backoffDelay   = calcBackoffDelay(attempt, config);
      const delay          = suggestedDelay && suggestedDelay < 30000
        ? suggestedDelay
        : backoffDelay;

      console.warn(
        `[Backoff] ⚠ ${label} attempt ${attempt} failed: ${
          error instanceof Error
            ? error.message.slice(0, 100)
            : String(error).slice(0, 100)
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

class GeminiKeyRotatorClass {
  private keys:         string[]            = [];
  private cooldowns:    Map<string, number> = new Map();
  private currentIndex: number              = 0;
  private cooldownMs:   number              = 65000;

  constructor() {
    this.loadKeys();
  }

  private loadKeys(): void {
    const multiKey = process.env.GEMINI_API_KEYS;
    if (multiKey) {
      this.keys = multiKey
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
    }

    if (this.keys.length === 0) {
      const singleKey = process.env.GEMINI_API_KEY;
      if (singleKey) {
        this.keys = [singleKey.trim()];
      }
    }

    if (this.keys.length === 0) {
      console.warn('[GeminiKeyRotator] No Gemini API keys found');
    } else {
      console.log(`[GeminiKeyRotator] Loaded ${this.keys.length} Gemini key(s)`);
    }
  }

  getNextKey(): string | null {
    if (this.keys.length === 0) return null;

    const now = Date.now();

    for (let i = 0; i < this.keys.length; i++) {
      const idx            = (this.currentIndex + i) % this.keys.length;
      const key            = this.keys[idx];
      const cooldownUntil  = this.cooldowns.get(key) || 0;

      if (now >= cooldownUntil) {
        this.currentIndex = (idx + 1) % this.keys.length;
        return key;
      }
    }

    return null;
  }

  getAllAvailableKeys(): string[] {
    const now = Date.now();
    return this.keys.filter(key => {
      const cooldownUntil = this.cooldowns.get(key) || 0;
      return now >= cooldownUntil;
    });
  }

  markKeyExhausted(key: string, customCooldownMs?: number): void {
    const cd = customCooldownMs || this.cooldownMs;
    this.cooldowns.set(key, Date.now() + cd);
    console.warn(
      `[GeminiKeyRotator] Key ...${key.slice(-6)} cooldown for ${cd / 1000}s`
    );
  }

  hasAnyKey(): boolean {
    return this.keys.length > 0;
  }

  hasAvailableKey(): boolean {
    return this.getAllAvailableKeys().length > 0;
  }

  getMinCooldownWait(): number {
    if (this.hasAvailableKey()) return 0;

    const now    = Date.now();
    let minWait  = Infinity;

    this.keys.forEach(key => {
      const cooldownUntil = this.cooldowns.get(key) || 0;
      const wait          = Math.max(0, cooldownUntil - now);
      if (wait < minWait) minWait = wait;
    });

    return minWait === Infinity ? 0 : minWait;
  }
}

export const GeminiKeyRotator = new GeminiKeyRotatorClass();

// ═══════════════════════════════════════════════════
// GEMINI CALL WITH ROTATION
// ═══════════════════════════════════════════════════

export async function callWithGeminiRotation<T>(
  modelName: string,
  callFn:    (apiKey: string) => Promise<T>,
  config:    RetryConfig = GEMINI_RETRY_CONFIG
): Promise<T> {
  const label = `Gemini ${modelName}`;

  const availableKeys = GeminiKeyRotator.getAllAvailableKeys();

  if (availableKeys.length === 0) {
    const waitMs = GeminiKeyRotator.getMinCooldownWait();
    if (waitMs > 0 && waitMs < 35000) {
      console.log(`[GeminiRotation] All keys in cooldown. Waiting ${waitMs}ms...`);
      await sleep(waitMs + 500);
    } else {
      throw new Error(`Gemini: all keys in cooldown. Try again shortly.`);
    }
  }

  let lastError: unknown = null;
  const keysToTry        = GeminiKeyRotator.getAllAvailableKeys();

  for (const key of keysToTry) {
    try {
      console.log(`[GeminiRotation] Trying ${label} with key ...${key.slice(-6)}`);

      // Use backoff for each key attempt
      const result = await withExponentialBackoff(
        () => callFn(key),
        config,
        `${label} key ...${key.slice(-6)}`
      );

      console.log(`[GeminiRotation] ✅ ${label} succeeded`);
      return result;

    } catch (error) {
      lastError = error;

      if (is429Error(error)) {
        const suggestedDelay = extractRetryDelay(error);
        GeminiKeyRotator.markKeyExhausted(key, suggestedDelay || undefined);
        console.log(`[GeminiRotation] Key exhausted, trying next...`);
        continue;
      }

      // Non-429 — don't try other keys
      throw error;
    }
  }

  // All keys 429 — wait for cooldown + final retry
  const waitMs = GeminiKeyRotator.getMinCooldownWait();
  if (waitMs > 0 && waitMs < 35000) {
    console.log(`[GeminiRotation] All keys exhausted. Waiting ${waitMs}ms...`);
    await sleep(waitMs + 500);

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
    console.log(
      `[ModelChain] ${label}: trying ${model.name} (${i + 1}/${models.length})`
    );

    try {
      // Gemini models handle their own retry via callWithGeminiRotation
      // Groq models use withExponentialBackoff via runModelChain
      const result = await model.fn();

      console.log(`[ModelChain] ✅ ${label}: ${model.name} succeeded`);
      return {
        result,
        model:   model.name,
        attempt: i + 1,
      };

    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : String(error);

      errors.push(`${model.name}: ${msg.slice(0, 150)}`);
      console.error(
        `[ModelChain] ❌ ${label}: ${model.name} failed: ${msg.slice(0, 150)}`
      );
    }
  }

  throw new Error(
    `[ModelChain] All models failed for ${label}.\n` +
    errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')
  );
}

// ═══════════════════════════════════════════════════
// GROQ KEY HELPER
// ═══════════════════════════════════════════════════

export function getGroqKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set or empty');
  return key;
}

// ═══════════════════════════════════════════════════
// MODEL SLUGS — Single source of truth
// ═══════════════════════════════════════════════════

export const MODELS = {
  // ── Gemini ──────────────────────────────────────
  gemini: {
    pro:       'gemini-2.5-pro',
    flash:     'gemini-2.5-flash',
    flashLite: 'gemini-2.5-flash-lite',
  },

  // ── Groq ────────────────────────────────────────
  groq: {
    llama70B: 'llama-3.3-70b-versatile',
  },
} as const;