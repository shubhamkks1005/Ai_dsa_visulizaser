// test-config.js
// Run: node test-config.js

const analysis = {
  algorithmName: "Bubble Sort",
  category: "Sorting",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(1)",
  steps: new Array(20).fill({}),
};

const technicalSpec = {
  templateType: "array",
  baseInterval: 1200,
};

// Simulate what prompt will look like
const prompt = `You are a technical architect.

ALGORITHM DETAILS:
Name:          ${analysis.algorithmName}
Category:      ${analysis.category}
Time:          ${analysis.timeComplexity}
Space:         ${analysis.spaceComplexity}
Steps count:   ${analysis.steps.length}
Template type: ${technicalSpec.templateType}`;

console.log("Prompt length:", prompt.length);
console.log("Prompt preview:\n", prompt);

// Simulate what Gemini might return
const mockResponse = JSON.stringify({
  templateType: "array",
  sceneConfig: {
    algorithmName: "Bubble Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    stats: [
      { key: "comparisons", label: "Comparisons", value: 0, side: "left" },
      { key: "swaps", label: "Swaps", value: 0, side: "left" },
      { key: "currentStep", label: "Step", value: 0, side: "right" }
    ],
    boldKeywords: ["swap", "compare", "sorted"],
    baseInterval: 1200,
    completionConfig: {
      emoji: "🎉",
      title: "Sorted!",
      subtitle: "Bubble Sort complete!",
      stats: []
    }
  }
});

// Test JSON parse
try {
  const parsed = JSON.parse(mockResponse);
  console.log("\n✅ JSON parse successful");
  console.log("templateType:", parsed.templateType);
  console.log("algorithmName:", parsed.sceneConfig.algorithmName);
} catch (e) {
  console.log("\n❌ JSON parse failed:", e.message);
}