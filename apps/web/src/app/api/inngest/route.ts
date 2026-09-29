import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processAssetFunction } from "@/inngest/functions/processAsset";
import { missingEvidenceFunction } from "@/inngest/functions/missingEvidence";
import { usageMonitorFunction } from "@/inngest/functions/usageMonitor";

// Inngest serve handler for Next.js App Router
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processAssetFunction,
    missingEvidenceFunction,
    usageMonitorFunction
  ]
});
