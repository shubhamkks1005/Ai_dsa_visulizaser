import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import History from "@/lib/models/History";

// GET — fetch all history for logged in user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const history = await History.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select("-generatedHTML")
      .lean();

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

// POST — save new visualization to history
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, language, originalCode, generatedHTML } = body;

    // Validate required fields
    if (!title || !language || !originalCode || !generatedHTML) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Count existing history for this user
    const count = await History.countDocuments({ userId: session.user.id });

    // If at limit (20), delete the oldest one
    if (count >= 20) {
      const oldest = await History.findOne({ userId: session.user.id })
        .sort({ createdAt: 1 });

      if (oldest) {
        await History.findByIdAndDelete(oldest._id);
      }
    }

    // Save new history item
    const historyItem = await History.create({
      userId: session.user.id,
      title,
      language,
      originalCode,
      generatedHTML,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Visualization saved",
        data: {
          _id: historyItem._id.toString(),
          title: historyItem.title,
          language: historyItem.language,
          createdAt: historyItem.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json(
      { error: "Failed to save visualization" },
      { status: 500 }
    );
  }
}