import { NextResponse } from "next/server";
import { signUploadRequest } from "@saakshi/media";

export async function POST(req: Request) {
  try {
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
