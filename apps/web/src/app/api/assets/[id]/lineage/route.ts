import { NextResponse } from "next/server";
import { store } from "@saakshi/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lineage = store.getLineage(id);

  if (!lineage || !lineage.asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const { asset, derivatives, pairs, reports, stories } = lineage;

  // Build DAG Graph Nodes and Edges
  const nodes: Array<{
    id: string;
    type: "original" | "derivative" | "report" | "story" | "pair";
    label: string;
    data: Record<string, any>;
  }> = [];

  const edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
  }> = [];

  // Root node: Original Asset
  nodes.push({
    id: `node-orig-${asset.id}`,
    type: "original",
    label: `Original: #${asset.shortId}`,
    data: {
      publicId: asset.cldPublicId,
      version: asset.cldVersion,
      sha256: asset.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      capturedAt: asset.capturedAt,
      trustScore: asset.trustScore,
      trustBand: asset.trustBand
    }
  });

  // Derivatives
  for (const der of derivatives) {
    const derNodeId = `node-der-${der.id}`;
    nodes.push({
      id: derNodeId,
      type: "derivative",
      label: `Transformation: ${der.transformation}`,
      data: {
        transformation: der.transformation,
        purpose: der.purpose,
        url: der.url
      }
    });

    edges.push({
      id: `edge-${asset.id}-${der.id}`,
      source: `node-orig-${asset.id}`,
      target: derNodeId,
      label: der.purpose
    });
  }

  // Before / After Pairs
  for (const p of pairs) {
    const pairNodeId = `node-pair-${p.id}`;
    nodes.push({
      id: pairNodeId,
      type: "pair",
      label: `Before/After Pair (${p.score * 100}%)`,
      data: {
        score: p.score,
        summary: p.change.summary,
        compositeUrl: p.compositeUrl
      }
    });

    edges.push({
      id: `edge-${asset.id}-${p.id}`,
      source: `node-orig-${asset.id}`,
      target: pairNodeId,
      label: "paired with"
    });
  }

  // Reports
  for (const rep of reports) {
    const repNodeId = `node-rep-${rep.id}`;
    nodes.push({
      id: repNodeId,
      type: "report",
      label: `Report: ${rep.title}`,
      data: {
        period: rep.period,
        status: rep.status,
        pdfUrl: rep.pdfUrl
      }
    });

    edges.push({
      id: `edge-${asset.id}-${rep.id}`,
      source: `node-orig-${asset.id}`,
      target: repNodeId,
      label: "cited in"
    });
  }

  // Stories / Reels
  for (const sty of stories) {
    const styNodeId = `node-sty-${sty.id}`;
    nodes.push({
      id: styNodeId,
      type: "story",
      label: `Reel Story: ${sty.format}`,
      data: {
        format: sty.format,
        status: sty.status,
        url: sty.url
      }
    });

    edges.push({
      id: `edge-${asset.id}-${sty.id}`,
      source: `node-orig-${asset.id}`,
      target: styNodeId,
      label: "featured in"
    });
  }

  return NextResponse.json({
    assetId: asset.id,
    nodes,
    edges
  });
}
