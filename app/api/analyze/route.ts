import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeCode } from "@/lib/ai/analyzer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please log in to analyze code." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const code =
      typeof body.code === "string" ? body.code.trim() : "";
    const language =
      typeof body.language === "string" && body.language.trim()
        ? body.language.trim()
        : "javascript";

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Please paste some code first." },
        { status: 400 }
      );
    }

    if (code.length > 20000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your code is too large right now. Please try a smaller example.",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeCode(code, language);

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analyze API error:", error);

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
            "AI analysis is not configured yet. Please add your API keys in .env.local.",
        },
        { status: 500 }
      );
    }

    if (
      message.includes("JSON") ||
      message.includes("Invalid analysis")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We couldn't understand that code clearly. Please try again or simplify the input.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while analyzing your code. Please try again.",
      },
      { status: 500 }
    );
  }
}