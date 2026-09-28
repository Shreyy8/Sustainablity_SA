import { z } from "zod";

export const CaptionSchema = z.object({
  caption: z.string().max(250),
  people_count: z.number().int().nullable().default(null),
  visual_elements: z.array(z.string()).default([])
});
export type CaptionData = z.infer<typeof CaptionSchema>;

export const ChangeItemSchema = z.object({
  type: z.enum(["added", "removed", "improved", "degraded"]),
  object: z.string(),
  evidence: z.string()
});

export const ChangeSummarySchema = z.object({
  changes: z.array(ChangeItemSchema),
  counts: z
    .record(
      z.object({
        before: z.number(),
        after: z.number()
      })
    )
    .optional(),
  summary: z.string(),
  confidence: z.number().min(0).max(1)
});
export type ChangeSummaryData = z.infer<typeof ChangeSummarySchema>;

export const QueryParseSchema = z.object({
  text: z.string(),
  filters: z.object({
    activity: z.string().optional(),
    state: z.string().optional(),
    district: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    trustMin: z.number().optional(),
    mediaType: z.enum(["image", "video"]).optional()
  })
});
export type QueryParseData = z.infer<typeof QueryParseSchema>;

export const ReportNarrativeSchema = z.object({
  executiveSummary: z.string(),
  projectNarratives: z.record(z.string()),
  complianceNote: z.string()
});
export type ReportNarrativeData = z.infer<typeof ReportNarrativeSchema>;
