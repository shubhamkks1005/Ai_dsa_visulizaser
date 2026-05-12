import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateVisualization } from "@/lib/ai/generator";
import { AnalysisResult } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please log in to generate visualizations." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const analysis: AnalysisResult = body.analysis;

    if (
      !analysis ||
      !analysis.algorithmName ||
      !analysis.steps ||
      analysis.steps.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid analysis data. Please analyze the code first.",
        },
        { status: 400 }
      );
    }

    const html = await generateVisualization(analysis);

    return NextResponse.json(
      {
        success: true,
        data: { html },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Generate API error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (
      message.includes("API_KEY") ||
      message.includes("not set") ||
      message.includes("configured")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI generator is not configured yet. Please add your API keys in .env.local.",
        },
        { status: 500 }
      );
    }

    if (message.includes("All generator models failed")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "All AI models are currently unavailable. Please try again in a few minutes.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while generating the visualization. Please try again.",
      },
      { status: 500 }
    );
  }
}