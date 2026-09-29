import { NextResponse } from "next/server";
import { signUploadRequest } from "@pluribus/media";
import { rateLimit } from "@pluribus/core";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client";
    const limiter = await rateLimit(`sign:${ip}`, { maxRequests: 120, windowSeconds: 60 });

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many upload sign requests. Rate limit exceeded." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { paramsToSign, projectId } = body;

    if (!paramsToSign) {
      return NextResponse.json({ error: "Missing paramsToSign" }, { status: 400 });
    }

    // Sign the parameters with Cloudinary API secret
    const signature = signUploadRequest(paramsToSign);
    const timestamp = Math.round(new Date().getTime() / 1000);

    return NextResponse.json({
      signature,
      timestamp,
      projectId: projectId || null
    });
  } catch (err: any) {
    console.error("Cloudinary sign error:", err);
    return NextResponse.json({ error: err.message || "Failed to sign upload request" }, { status: 500 });
  }
}
