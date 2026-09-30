import {
  ChangeSummarySchema,
  type ChangeSummaryData,
  QueryParseSchema,
  type QueryParseData,
  ReportNarrativeSchema,
  type ReportNarrativeData
} from "./schemas.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

async function generateGeminiJson<T>(
  prompt: string,
  schema: { parse: (value: unknown) => T },
  extraParts: GeminiPart[] = []
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, ...extraParts] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} ${details}`);
    }

    const body = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!text) throw new Error("Gemini returned an empty response");

    const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    return schema.parse(JSON.parse(jsonText));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Gemini")) throw error;
    throw new Error(`Gemini request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function imagePartFromUrl(url: string): Promise<GeminiPart> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch comparison image: ${response.status}`);
  }

  const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  if (!mimeType.startsWith("image/")) {
    throw new Error(`Comparison URL is not an image: ${mimeType}`);
  }

  const data = Buffer.from(await response.arrayBuffer()).toString("base64");
  return { inline_data: { mime_type: mimeType, data } };
}

/**
 * Parses natural-language search query into structured search filters.
 * e.g., "girls using new toilets in Barmer after March" ->
 * { text: "girls using toilets", filters: { activity: "toilet_block", district: "Barmer", dateFrom: "2026-03-01", trustMin: 70 } }
 */
export async function parseSearchQuery(query: string): Promise<QueryParseData> {
  return generateGeminiJson(
    `Parse this evidence-vault search query into JSON. Return only an object matching this shape: {"text": string, "filters": {"activity"?: string, "state"?: string, "district"?: string, "dateFrom"?: string, "dateTo"?: string, "trustMin"?: number, "mediaType"?: "image" | "video"}}. Preserve unknown terms in text. Use ISO dates when a date is clear. Query: ${query}`,
    QueryParseSchema
  );
}

/**
 * Generates structured before/after comparison change summary.
 */
export async function generateChangeSummary(params: {
  beforeLabel?: string;
  afterLabel?: string;
  activity?: string;
  compositeUrl?: string;
}): Promise<ChangeSummaryData> {
  if (!params.compositeUrl) {
    throw new Error("A composite image URL is required for Gemini comparison analysis");
  }

  const image = await imagePartFromUrl(params.compositeUrl);
  return generateGeminiJson(
    `Analyze this before/after CSR evidence composite. The image contains a baseline image on the left and a later image on the right. Return only JSON matching the requested schema. Describe only visible changes. Do not invent people counts, object counts, dates, outcomes, or functionality. Use confidence below 0.7 when the comparison is ambiguous. Activity context: ${params.activity || "infrastructure"}. Baseline label: ${params.beforeLabel || "before"}. Completion label: ${params.afterLabel || "after"}.`,
    ChangeSummarySchema,
    [image]
  );
}

/**
 * Generates grounded narrative for reports, embedding exact [asset:ID] citations.
 */
export async function generateReportNarrative(factsBundle: any): Promise<ReportNarrativeData> {
  return generateGeminiJson(
    `Write a grounded CSR report narrative from the supplied facts. Return only JSON matching this shape: {"executiveSummary": string, "projectNarratives": {"projectId": string}, "complianceNote": string}. Use only facts present in the input. Every factual claim about evidence must include the exact asset citation format [asset:SHORT_ID]. Do not invent metrics, locations, dates, beneficiaries, or project outcomes. Facts: ${JSON.stringify(factsBundle)}`,
    ReportNarrativeSchema
  );
}
