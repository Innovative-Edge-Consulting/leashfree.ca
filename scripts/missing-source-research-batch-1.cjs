const fs = require('fs');

const queuePath = 'reports/missing-source-queue.json';
const csvPath = 'reports/missing-source-queue.csv';
const reportPath = 'reports/missing-source-research-batch-1.md';

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const reviewedOn = '2026-05-29';

const updates = {
  '/dog-parks/king-city/': {
    recommendedSourceUrl: 'https://www.king.ca/recreation-living/parks-trails-and-forestry/parks/king-city-leash-dog-park',
    sourceTitle: 'King City Off-Leash Dog Park | Township Of King',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.99,
    sourceNotes: 'Official Township of King page dedicated to the King City off-leash dog park.'
  },
  '/dog-parks/mission/': {
    recommendedSourceUrl: 'https://www.mission.ca/community-environment/about-mission/mission-wayfinder',
    sourceTitle: 'Mission Wayfinder | City of Mission',
    sourceType: 'official city or municipality website',
    sourceStatus: 'likely-official-needs-review',
    sourceConfidenceScore: 0.68,
    sourceNotes: 'Official City of Mission page that references off-leash dog park access, but not a dedicated off-leash policy page.'
  },
  '/dog-parks/yorkton/': {
    recommendedSourceUrl: 'https://www.yorkton.ca/our-government/animal-services/enforcement/',
    sourceTitle: 'Enforcement | City of Yorkton',
    sourceType: 'official bylaw or animal services page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.94,
    sourceNotes: 'City of Yorkton Animal Services enforcement page explicitly references off-leash dog park use.'
  },
  '/dog-parks/battleford/': {
    recommendedSourceUrl: 'https://battleford.ca/off-leash-dog-park',
    sourceTitle: 'Off Leash Dog Park - Battleford, SK',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.98,
    sourceNotes: 'Official Town of Battleford off-leash dog park page.'
  },
  '/dog-parks/estevan/': {
    recommendedSourceUrl: 'https://estevan.ca/wp-content/uploads/2021/05/MAY-31-2021-WEBSITE.pdf',
    sourceTitle: 'City of Estevan Council Minutes (Dog Park Rules Discussion)',
    sourceType: 'official city or municipality website',
    sourceStatus: 'likely-official-needs-review',
    sourceConfidenceScore: 0.63,
    sourceNotes: 'Official Estevan-hosted council document discussing off-leash dog park rules; dedicated evergreen city dog park page was not clearly found.'
  },
  '/dog-parks/gatineau/': {
    recommendedSourceUrl: 'https://www.gatineau.ca/portail/default.aspx?p=guichet_municipal/animaux/chiens/chiens_dans_parcs',
    sourceTitle: 'Chiens dans les parcs - Ville de Gatineau',
    sourceType: 'official bylaw or animal services page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.97,
    sourceNotes: 'Official Ville de Gatineau dogs-in-parks guidance including off-leash and on-leash rules.'
  },
  '/dog-parks/humboldt/': {
    recommendedSourceUrl: 'https://humboldt.ca/parks-and-trails/',
    sourceTitle: 'Parks, Trails & Outdoor Activities - City of Humboldt',
    sourceType: 'official parks and recreation page',
    sourceStatus: 'likely-official-needs-review',
    sourceConfidenceScore: 0.66,
    sourceNotes: 'Official City of Humboldt parks page; direct off-leash dog park listing requires manual verification.'
  },
  '/dog-parks/laval/': {
    recommendedSourceUrl: 'https://www.laval.ca/conseils/tout-savoir-parcs-chiens-laval/',
    sourceTitle: 'Tout savoir sur les parcs à chiens | Ville de Laval',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.98,
    sourceNotes: 'Official Ville de Laval page specifically about dog parks and rules.'
  },
  '/dog-parks/lloydminster/': {
    recommendedSourceUrl: 'https://www.lloydminster.ca/home-property-utilities/animal-services/',
    sourceTitle: 'Animal Services | City of Lloydminster',
    sourceType: 'official bylaw or animal services page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.95,
    sourceNotes: 'Official City of Lloydminster animal services page referencing off-leash dog park and bylaw context.'
  },
  '/dog-parks/martensville/': {
    recommendedSourceUrl: 'https://www.martensville.ca/pages/off_leash_dog_park.html',
    sourceTitle: 'Off-Leash Dog Park | City of Martensville',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.99,
    sourceNotes: 'Official City of Martensville page for the off-leash dog park.'
  },
  '/dog-parks/meadow-lake/': {
    recommendedSourceUrl: 'https://www.meadowlake.ca/p/animal-control',
    sourceTitle: 'Animal Control | City of Meadow Lake',
    sourceType: 'official bylaw or animal services page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.9,
    sourceNotes: 'Official city animal control page includes dog bylaw and off-leash dog park behaviour expectations.'
  },
  '/dog-parks/amherst/': {
    recommendedSourceUrl: 'https://pub-amherst.escribemeetings.com/filestream.ashx?DocumentId=14062',
    sourceTitle: 'Companion Animal By-law | Town of Amherst',
    sourceType: 'official bylaw or animal services page',
    sourceStatus: 'human-review-required',
    sourceConfidenceScore: 0.55,
    sourceNotes: 'Official bylaw document appears to mention leash rules, but a stable official dog-park page for Amherst should be confirmed manually.'
  },
  '/dog-parks/barrie/': {
    recommendedSourceUrl: 'https://www.barrie.ca/community-recreation-environment/parks-trails-waterfront/dog-leash-recreation-areas',
    sourceTitle: 'Dog Off-Leash Recreation Areas | City of Barrie',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.98,
    sourceNotes: 'Official City of Barrie page for dog off-leash recreation areas.'
  },
  '/dog-parks/belleville/': {
    recommendedSourceUrl: 'https://belleville.net/facilities/facility/details/Dog-Park-at-Rotary-Park-16',
    sourceTitle: 'Dog Park at Rotary Park | City of Belleville',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.97,
    sourceNotes: 'Official City of Belleville facility page for the municipal dog park.'
  },
  '/dog-parks/brampton/': {
    recommendedSourceUrl: 'https://www.brampton.ca/EN/residents/Animal-Services/Pages/Off-Leash-Parks.aspx',
    sourceTitle: 'Off-Leash Dog Areas | City of Brampton',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.99,
    sourceNotes: 'Official City of Brampton off-leash parks page with rules.'
  },
  '/dog-parks/brandon/': {
    recommendedSourceUrl: 'https://www.brandon.ca/home-property-environment/animal-control/off-leash-dog-parks/',
    sourceTitle: 'Off Leash Dog Parks | City of Brandon',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.99,
    sourceNotes: 'Official City of Brandon off-leash dog parks page.'
  },
  '/dog-parks/burnaby/': {
    recommendedSourceUrl: 'https://www.burnaby.ca/Things-To-Do/Explore-Outdoors/Dogs-in-Parks/Off-Leash-Areas.html',
    sourceTitle: 'Dog Off-leash Areas | City of Burnaby',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.9,
    sourceNotes: 'Official City of Burnaby off-leash areas URL captured from municipal link references; path should be re-checked for current site routing.'
  },
  '/dog-parks/campbellford/': {
    recommendedSourceUrl: 'https://www.trenthills.ca/parks-recreation-community/',
    sourceTitle: 'Parks, Recreation & Community | Municipality of Trent Hills',
    sourceType: 'official parks and recreation page',
    sourceStatus: 'human-review-required',
    sourceConfidenceScore: 0.52,
    sourceNotes: 'Official municipality parks page found, but no clearly identified Campbellford off-leash dog park source on first pass.'
  },
  '/dog-parks/coquitlam/': {
    recommendedSourceUrl: 'https://www.coquitlam.ca/464/Pets-Animals',
    sourceTitle: 'Pets & Animals | City of Coquitlam',
    sourceType: 'official bylaw or animal services page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.9,
    sourceNotes: 'Official City of Coquitlam pets page linking leash/off-leash guidance and animal services.'
  },
  '/dog-parks/courtice/': {
    recommendedSourceUrl: 'https://www.clarington.net/community-and-people/animal-services/leash-free-dog-parks/',
    sourceTitle: 'Leash-Free Dog Parks | Municipality of Clarington',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.98,
    sourceNotes: 'Official Clarington page explicitly includes Courtice leash-free dog park information.'
  },
  '/dog-parks/edmonton/': {
    recommendedSourceUrl: 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-area-updates',
    sourceTitle: 'Off-Leash Areas and Dog Parks | City of Edmonton',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.99,
    sourceNotes: 'Official City of Edmonton off-leash areas and dog parks page.'
  },
  '/dog-parks/etobicoke/': {
    recommendedSourceUrl: 'https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dog-off-leash-areas/',
    sourceTitle: 'Dogs Off-Leash Areas | City of Toronto',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.95,
    sourceNotes: 'Official City of Toronto dog off-leash areas page; applicable for Etobicoke pages within Toronto city limits.'
  },
  '/dog-parks/gimli/': {
    recommendedSourceUrl: 'https://www.gimli.ca/p/animal-control',
    sourceTitle: 'Animal Control | Rural Municipality of Gimli',
    sourceType: 'official bylaw or animal services page',
    sourceStatus: 'likely-official-needs-review',
    sourceConfidenceScore: 0.64,
    sourceNotes: 'Official RM of Gimli animal control page and bylaw reference found; dedicated municipal off-leash dog park page should be confirmed.'
  },
  '/dog-parks/grande-prairie/': {
    recommendedSourceUrl: 'https://cityofgp.com/economic-development/lifestyle-community/outdoor-dog-parks',
    sourceTitle: 'Outdoor - Dog Parks | City of Grande Prairie',
    sourceType: 'official dog park / off-leash area page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.99,
    sourceNotes: 'Official City of Grande Prairie dog parks page.'
  },
  '/dog-parks/grimsby/': {
    recommendedSourceUrl: 'https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/parks-and-pavilions/',
    sourceTitle: 'Parks and Pavilions | Town of Grimsby',
    sourceType: 'official parks and recreation page',
    sourceStatus: 'verified-official',
    sourceConfidenceScore: 0.92,
    sourceNotes: 'Official Town of Grimsby parks page includes Steve McDonnell Dog Park listing.'
  }
};

const top25 = queue.slice(0, 25);
let processed = 0;
for (const entry of top25) {
  const update = updates[entry.routePath];
  if (!update) continue;
  Object.assign(entry, update, { reviewedOnCandidate: reviewedOn });
  processed += 1;
}

fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2) + '\n');

const headers = [
  'routePath','city','province','currentTitle','currentMetaDescription','priorityScore','qualityCompletionScore','missingRequiredFields','suggestedSearchQuery','sourceStatus','recommendedSourceUrl','sourceTitle','sourceType','sourceConfidenceScore','sourceNotes','reviewStatus','reviewedOnCandidate'
];

const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
};

const rows = queue.map((e) => [
  e.routePath,
  e.city,
  e.province,
  e.currentTitle,
  e.currentMetaDescription,
  e.priorityScore,
  e.qualityCompletionScore,
  (e.missingRequiredFields || []).join('; '),
  (e.suggestedSearchQuery || []).join(' | '),
  e.sourceStatus,
  e.recommendedSourceUrl,
  e.sourceTitle || '',
  e.sourceType || '',
  e.sourceConfidenceScore ?? '',
  e.sourceNotes || '',
  e.reviewStatus,
  e.reviewedOnCandidate || ''
]);

fs.writeFileSync(csvPath, [headers, ...rows].map(r => r.map(esc).join(',')).join('\n') + '\n');

const processedEntries = top25.filter((x) => x.reviewedOnCandidate === reviewedOn);
const byStatus = processedEntries.reduce((acc, x) => {
  acc[x.sourceStatus] = (acc[x.sourceStatus] || 0) + 1;
  return acc;
}, {});

const report = [];
report.push('# Missing Source Research Batch 1');
report.push('');
report.push(`Generated on: ${reviewedOn}`);
report.push('Scope: Top 25 highest-priority city/location pages from `reports/missing-source-queue.json`.');
report.push('');
report.push('## Results Summary');
report.push('');
report.push(`- Pages processed: ${processedEntries.length}`);
report.push(`- Verified official sources found: ${byStatus['verified-official'] || 0}`);
report.push(`- Likely official (needs review): ${byStatus['likely-official-needs-review'] || 0}`);
report.push(`- Not found: ${byStatus['not-found'] || 0}`);
report.push(`- Human review required: ${byStatus['human-review-required'] || 0}`);
report.push('');
report.push('## Pages Requiring Human Review');
report.push('');
for (const e of processedEntries.filter((x) => x.sourceStatus === 'human-review-required')) {
  report.push(`- ${e.routePath}: ${e.sourceNotes}`);
}
if (!processedEntries.some((x) => x.sourceStatus === 'human-review-required')) {
  report.push('- None');
}
report.push('');
report.push('## Source Confidence Concerns');
report.push('');
for (const e of processedEntries.filter((x) => Number(x.sourceConfidenceScore || 0) < 0.75)) {
  report.push(`- ${e.routePath} (${e.sourceConfidenceScore}): ${e.sourceNotes}`);
}
if (!processedEntries.some((x) => Number(x.sourceConfidenceScore || 0) < 0.75)) {
  report.push('- None');
}
report.push('');
report.push('## Next Recommended Batch');
report.push('');
report.push('- Process ranks 26-50 from `reports/missing-source-queue.json`, starting with remaining `missing-source` city pages at priority score 107.');
report.push('- Resolve low-confidence and human-review-required entries from Batch 1 before writing source URLs into live city records.');

fs.writeFileSync(reportPath, report.join('\n') + '\n');

console.log(JSON.stringify({ processed, byStatus, reportPath }, null, 2));
