import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pair = store.getPairById(id);

  if (!pair) {
    return NextResponse.json({ error: "Pair not found" }, { status: 404 });
  }

  const beforeAsset = store.getAssetById(pair.beforeAssetId);
  const afterAsset = store.getAssetById(pair.afterAssetId);
  const site = store.getSiteById(pair.siteId);

  return NextResponse.json({
    pair,
    beforeAsset,
    afterAsset,
    site
  });
}
