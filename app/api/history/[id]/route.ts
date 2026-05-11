import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import History from "@/lib/models/History";

// GET — fetch single history item with full HTML
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const historyItem = await History.findById(id).lean();

    if (!historyItem) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (historyItem.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: historyItem });
  } catch (error) {
    console.error("History GET [id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// DELETE — delete a history item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const historyItem = await History.findById(id);

    if (!historyItem) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (historyItem.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await History.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Visualization deleted",
    });
  } catch (error) {
    console.error("History DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}