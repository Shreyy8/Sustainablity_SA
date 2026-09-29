import QRCode from "qrcode";

export interface ReportTemplateData {
  reportId: string;
  title: string;
  corporateName: string;
  ngoName: string;
  period: string;
  generatedAt: string;
  evidenceBaseUrl?: string;
  summary: {
    totalProjects: number;
    totalAssets: number;
    verifiedPercent: number;
    avgTrustScore: number;
  };
  narrative: string;
  projects: Array<{
    id: string;
    name: string;
    district: string;
    state: string;
    milestones: Array<{
      id: string;
      title: string;
      targetDate: string;
      evidenceCount: number;
      trustScore: number;
      assets: Array<{
        id: string;
        shortId: string;
        caption: string;
        thumbnailUrl: string;
        trustScore: number;
        capturedAt: string;
      }>;
    }>;
  }>;
}

export async function generateQuarterlyReportHtml(data: ReportTemplateData): Promise<string> {
  const publicEvidenceUrl = `${data.evidenceBaseUrl || "https://pluribus.app"}/reports/${data.reportId}`;
  const qrCodeDataUri = await QRCode.toDataURL(publicEvidenceUrl, {
    width: 140,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" }
  });

  // Highlight citation tags like [asset:ast-001]
  const formattedNarrative = data.narrative.replace(
    /\[asset:([a-zA-Z0-9_-]+)\]/g,
    '<span class="citation">#$1</span>'
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .header-left h1 {
      margin: 0 0 4px 0;
      font-size: 24px;
      color: #064e3b;
      font-weight: 700;
    }
    .header-left .meta {
      font-size: 13px;
      color: #64748b;
    }
    .qr-box {
      text-align: right;
    }
    .qr-box img {
      width: 72px;
      height: 72px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .qr-box span {
      display: block;
      font-size: 9px;
      color: #64748b;
      margin-top: 2px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .kpi-value {
      font-size: 22px;
      font-weight: 700;
      color: #059669;
    }
    .kpi-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 2px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      border-left: 4px solid #059669;
      padding-left: 8px;
      margin: 24px 0 12px 0;
    }
    .narrative-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;
      font-size: 13px;
      line-height: 1.6;
      color: #14532d;
      margin-bottom: 24px;
    }
    .citation {
      display: inline-block;
      background: #059669;
      color: #ffffff;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      margin: 0 2px;
    }
    .project-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .project-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .project-name {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }
    .project-location {
      font-size: 12px;
      color: #64748b;
    }
    .asset-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .asset-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }
    .asset-item img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      display: block;
    }
    .asset-meta {
      padding: 8px;
    }
    .asset-caption {
      font-size: 11px;
      color: #334155;
      margin-bottom: 4px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .asset-badges {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
    }
    .badge-verified {
      background: #dcfce7;
      color: #166534;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="header-left">
      <h1>${data.title}</h1>
      <div class="meta">
        <strong>Funder:</strong> ${data.corporateName} &nbsp;|&nbsp; 
        <strong>Implementation Partner:</strong> ${data.ngoName} &nbsp;|&nbsp; 
        <strong>Period:</strong> ${data.period}
      </div>
    </div>
    <div class="qr-box">
      <img src="${qrCodeDataUri}" alt="Verify Evidence" />
      <span>Scan to verify evidence</span>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">${data.summary.totalProjects}</div>
      <div class="kpi-label">Active Projects</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${data.summary.totalAssets}</div>
      <div class="kpi-label">Verified Evidences</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${data.summary.verifiedPercent}%</div>
      <div class="kpi-label">Verification Rate</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${data.summary.avgTrustScore}/100</div>
      <div class="kpi-label">Average Trust Score</div>
    </div>
  </div>

  <div class="section-title">Verified Impact Narrative</div>
  <div class="narrative-box">
    ${formattedNarrative}
  </div>

  <div class="section-title">Field Projects & Milestone Evidence</div>
  ${data.projects
    .map(
      (p) => `
    <div class="project-card">
      <div class="project-header">
        <span class="project-name">${p.name}</span>
        <span class="project-location">${p.district}, ${p.state}</span>
      </div>
      ${p.milestones
        .map(
          (m) => `
        <div style="margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px;">
            Milestone: ${m.title} <span style="font-size: 11px; color: #64748b; font-weight: normal;">(Target: ${m.targetDate} · Score: ${m.trustScore}/100)</span>
          </div>
          <div class="asset-gallery">
            ${m.assets
              .map(
                (a) => `
              <div class="asset-item">
                <img src="${a.thumbnailUrl}" alt="${a.caption}" />
                <div class="asset-meta">
                  <div class="asset-caption">${a.caption}</div>
                  <div class="asset-badges">
                    <span class="badge-verified">Trust: ${a.trustScore}</span>
                    <span style="color: #64748b;">${a.shortId}</span>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("")}

  <div class="footer">
    <span>Pluribus CSR Evidence Platform · Cryptographically verified & geofenced provenance</span>
    <span>Report ID: ${data.reportId} · Generated: ${data.generatedAt}</span>
  </div>
</body>
</html>`;
}
