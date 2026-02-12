import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { cloud_storage_path } = await request.json();

    if (!cloud_storage_path) {
      return NextResponse.json(
        { error: "cloud_storage_path is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, cloud_storage_path });
  } catch (error) {
    console.error("Error completing upload:", error);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
