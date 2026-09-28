import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const asset = store.getAssetById(id);

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const project = asset.projectId ? store.getProjectById(asset.projectId) : undefined;
  const site = asset.siteId ? store.getSiteById(asset.siteId) : undefined;
  const milestone = asset.milestoneId ? store.getMilestoneById(asset.milestoneId) : undefined;
  const derivatives = store.getDerivatives(asset.id);

  return NextResponse.json({
    asset,
    project,
    site,
    milestone,
    derivatives
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = store.updateAsset(id, {
      status: body.status,
      projectId: body.projectId,
      siteId: body.siteId,
      milestoneId: body.milestoneId,
      consent: body.consent,
      caption: body.caption
    });

    if (!updated) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, asset: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}
