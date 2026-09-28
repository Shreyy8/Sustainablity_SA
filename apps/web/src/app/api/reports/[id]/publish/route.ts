import { NextResponse } from "next/server";
import { store } from "@saakshi/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const published = store.publishReport(id);

  if (!published) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    report: published
  });
}
