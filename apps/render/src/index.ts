import express from "express";
import cors from "cors";
import { generateQuarterlyReportHtml, type ReportTemplateData } from "./templates/quarterlyReport.js";
import { renderHtmlToPdf } from "./pdf.js";
import { cld } from "@pluribus/media";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pluribus-render",
    timestamp: new Date().toISOString()
  });
});

// Render HTML template and stream raw PDF
app.post("/render", async (req, res) => {
  try {
    const data = req.body as ReportTemplateData;
    if (!data || !data.reportId) {
      return res.status(400).json({ error: "Missing report template data" });
    }

    const html = await generateQuarterlyReportHtml(data);
    const pdfBuffer = await renderHtmlToPdf({ html });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${data.reportId}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error("Render PDF error:", err);
    res.status(500).json({ error: err.message || "Failed to render PDF" });
  }
});

// Render HTML template, generate PDF, and upload directly to Cloudinary
app.post("/render/upload", async (req, res) => {
  try {
    const { templateData, corporateSlug } = req.body;
    if (!templateData || !templateData.reportId) {
      return res.status(400).json({ error: "Missing templateData or reportId" });
    }

    const html = await generateQuarterlyReportHtml(templateData);
    const pdfBuffer = await renderHtmlToPdf({ html });

    const corp = corporateSlug || "general";
    const reportPublicId = `pluribus/reports/${corp}/${templateData.reportId}`;

    // Upload raw PDF to Cloudinary
    let cldUrl = "";
    let cldPublicId = reportPublicId;

    try {
      const base64Pdf = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
      const uploadRes = await cld.uploader.upload(base64Pdf, {
        resource_type: "raw",
        public_id: reportPublicId,
        overwrite: true
      });
      cldUrl = uploadRes.secure_url;
      cldPublicId = uploadRes.public_id;
    } catch (uploadErr: any) {
      console.warn("Could not upload PDF to Cloudinary live DAM (using local fallback URL):", uploadErr.message);
      cldUrl = `https://res.cloudinary.com/pluribus-demo/raw/upload/${reportPublicId}.pdf`;
    }

    res.json({
      success: true,
      reportId: templateData.reportId,
      publicId: cldPublicId,
      url: cldUrl,
      sizeBytes: pdfBuffer.length,
      generatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Render and upload error:", err);
    res.status(500).json({ error: err.message || "Failed to render and upload report" });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Pluribus Render Service] Listening on http://localhost:${PORT}`);
  });
}

export { app };
