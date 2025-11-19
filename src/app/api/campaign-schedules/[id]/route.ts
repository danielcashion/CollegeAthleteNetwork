import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}/campaign_schedules/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Failed to delete schedule" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Schedule deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting campaign schedule:", error);
    return NextResponse.json(
      { message: "Failed to delete campaign schedule", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

