const allowedProductionBranch = process.env.PRODUCTION_BRANCH || "master";
const legacyBranch = "webflow-static-build-phase-6-launch-readiness";

const detectedBranch =
  process.env.CF_PAGES_BRANCH ||
  process.env.CLOUDFLARE_BRANCH ||
  process.env.GITHUB_HEAD_REF ||
  process.env.GITHUB_REF_NAME ||
  "";

const isCiBuild =
  process.env.CF_PAGES === "1" ||
  process.env.CLOUDFLARE_ENV ||
  process.env.GITHUB_ACTIONS === "true";

if (!isCiBuild || !detectedBranch) {
  process.exit(0);
}

if (process.env.ALLOW_LEGACY_DEPLOY_BRANCH === "1") {
  console.warn(
    `Deployment branch guard bypassed for ${detectedBranch} because ALLOW_LEGACY_DEPLOY_BRANCH=1.`
  );
  process.exit(0);
}

if (detectedBranch === legacyBranch) {
  console.error(
    `Refusing to build production from legacy branch "${legacyBranch}". Use "${allowedProductionBranch}" instead.`
  );
  process.exit(1);
}

if (detectedBranch !== allowedProductionBranch) {
  console.error(
    `Refusing to build production from "${detectedBranch}". Expected "${allowedProductionBranch}".`
  );
  process.exit(1);
}
