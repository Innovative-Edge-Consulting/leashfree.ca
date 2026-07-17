import fs from "node:fs";

const reportPath = "reports/content-health.json";
const csvPath = "reports/thin-page-backlog.csv";
const mdPath = "reports/thin-page-backlog-summary.md";
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const pages = report.pages.filter((page) => page.thinContent);

const sectionWeight = {
  "dog-park-locations": 5,
  "dog-parks": 4,
  directory: 3,
  "dog-breeds": 2,
  "dog-names": 1,
  core: 1,
  blog: 1
};

function hasIntegrityRisk(page) {
  return page.possibleDuplicateCount > 1 || page.canonicalRiskType?.length > 0;
}

function tierFor(page) {
  if (hasIntegrityRisk(page)) return "T0-integrity-review";
  if (page.missingSourceUrl) return "T1-source-research";
  if (page.priorityScore >= 100 || page.wordCount < 100) return "T2-high-value-expansion";
  return "T3-standard-expansion";
}

function workstreamFor(page) {
  if (page.contentType === "City Pages") return "city-guide";
  if (page.contentType === "Dog Parks") return "park-profile";
  if (page.contentType === "Dog Breeds") return "breed-profile";
  if (page.contentType === "Dog Names") return "name-guide";
  if (page.contentType === "Directories") return "directory-profile";
  return "general-page";
}

function imagePlanFor(page) {
  if (page.contentType === "City Pages") return "original-location-context";
  if (page.contentType === "Dog Parks") return "rights-gated-park-photo-or-independent-original";
  return "original-editorial-image";
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const backlog = pages
  .map((page) => ({
    tier: tierFor(page),
    workstream: workstreamFor(page),
    imagePlan: imagePlanFor(page),
    status: "queued",
    section: page.section,
    contentType: page.contentType,
    name: page.name,
    route: page.routePath,
    canonicalUrl: page.canonicalUrl,
    province: page.rawProvince,
    city: page.rawCity,
    priorityScore: page.priorityScore,
    qualityCompletionScore: page.qualityCompletionScore,
    wordCount: page.wordCount,
    thinThreshold: page.thinWordThreshold,
    stale: page.stale,
    reviewAgeDays: page.reviewAgeDays,
    missingSourceUrl: page.missingSourceUrl,
    sourceUrl: page.sourceUrl,
    missingFields: page.missingRequiredFields,
    missingInternalLinks: page.missingInternalLinks,
    dataQualityFlags: page.dataQualityFlags,
    canonicalRiskType: page.canonicalRiskType,
    issueClassifications: page.issueClassifications,
    researchStatus: "not-started",
    validationStatus: "not-started",
    seoStatus: "not-started",
    imageStatus: "not-started",
    publishStatus: "not-started"
  }))
  .sort((a, b) => {
    const tierOrder = a.tier.localeCompare(b.tier);
    if (tierOrder !== 0) return tierOrder;
    const scoreOrder = b.priorityScore - a.priorityScore;
    if (scoreOrder !== 0) return scoreOrder;
    const sectionOrder = (sectionWeight[b.section] || 0) - (sectionWeight[a.section] || 0);
    if (sectionOrder !== 0) return sectionOrder;
    return a.wordCount - b.wordCount;
  });

const headers = Object.keys(backlog[0]);
const csv = [headers.join(","), ...backlog.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n";
fs.writeFileSync(csvPath, csv);

const countBy = (field) => Object.entries(Object.groupBy(backlog, (row) => row[field])).sort((a, b) => b[1].length - a[1].length);
const tierRows = countBy("tier").map(([key, rows]) => `| ${key} | ${rows.length} |`).join("\n");
const sectionRows = countBy("contentType").map(([key, rows]) => `| ${key} | ${rows.length} |`).join("\n");
const topRows = backlog.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl ? "yes" : "no"} |`).join("\n");

const summary = `# Thin Page Improvement Backlog

Generated from \`reports/content-health.json\` on ${report.generatedAt.slice(0, 10)}.

This backlog contains all ${backlog.length} pages currently flagged as thin. The CSV is the working queue; this document explains prioritization and shows the first 50 records.

## Backlog counts

| Tier | Pages |
| --- | ---: |
${tierRows}

| Content type | Pages |
| --- | ---: |
${sectionRows}

## Prioritization

- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.
- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.
- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.
- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.

Do not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.

## First 50 pages

| # | Tier | Type | Page | Score | Words | Missing source |
| ---: | --- | --- | --- | ---: | ---: | --- |
${topRows}

## Required page workflow

1. Research the municipality, park operator, or authoritative breed/service source.
2. Record URLs, access dates, and which facts each source supports.
3. Resolve duplicate/canonical issues before writing.
4. Write unique page-specific copy and metadata.
5. Generate or license an image only after the factual brief and rights status are clear.
6. Validate the page against the source packet, then build and run QA.
7. Publish only when research, validation, SEO, image, and editorial statuses are complete.

The image plan is deliberately rights-aware: city pages use original location-context images; park pages use a real source image only when reuse/adaptation rights are documented, otherwise an independently generated original scene.
`;
fs.writeFileSync(mdPath, summary);
console.log(`Wrote ${backlog.length} thin pages to ${csvPath}`);
