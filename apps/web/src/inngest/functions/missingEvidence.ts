import { inngest } from "../client";
import { store } from "@pluribus/db";

/**
 * P9-5 Missing evidence job: daily cron flags milestones past their target date
 * with 0 verified assets.
 */
export const missingEvidenceFunction = inngest.createFunction(
  {
    id: "check-missing-evidence",
    name: "Check Overdue Milestones Missing Evidence",
    retries: 2,
    triggers: [{ cron: "0 0 * * *" }]
  },
  async ({ step }) => {
    const overdueMilestones = await step.run("query-overdue-milestones", async () => {
      const milestones = store.getMilestones();
      const assets = store.getAssets();
      const now = new Date();

      const flaggedList: any[] = [];

      for (const ms of milestones) {
        const expectedDate = new Date(ms.expectedDate);
        if (expectedDate < now) {
          // Check verified assets
          const verifiedAssets = assets.filter(
            (a) => a.milestoneId === ms.id && a.trustScore >= 75 && a.status !== "rejected" && a.trustBand !== "flagged"
          );

          if (verifiedAssets.length === 0) {
            flaggedList.push({
              milestoneId: ms.id,
              projectId: ms.projectId,
              title: ms.name,
              expectedDate: ms.expectedDate,
              daysOverdue: Math.floor((now.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24))
            });
          }
        }
      }

      return flaggedList;
    });

    await step.run("log-missing-evidence-alerts", async () => {
      if (overdueMilestones.length > 0) {
        console.warn(`[Inngest Alert] Found ${overdueMilestones.length} milestones past due with 0 verified evidence:`, overdueMilestones);
      } else {
        console.log("[Inngest Alert] All past-due milestones have verified evidence.");
      }
      return { count: overdueMilestones.length };
    });

    return {
      success: true,
      flaggedCount: overdueMilestones.length,
      overdueMilestones
    };
  }
);
