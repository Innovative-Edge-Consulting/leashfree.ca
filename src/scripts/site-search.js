const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9'&-]+/g, " ")
    .trim();

const escapeHtml = (value) =>
  String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function queryParts(query) {
  const phrases = [...String(query).matchAll(/"([^"]+)"/g)].map((match) => normalize(match[1])).filter(Boolean);
  const remainder = String(query).replace(/"[^"]+"/g, " ");
  const terms = normalize(remainder).split(/\s+/).filter((term) => term.length > 1 || /\d/.test(term));
  return { phrases, terms: [...new Set(terms)] };
}

function scoreItem(item, query) {
  const title = normalize(item.title);
  const description = normalize(item.description);
  const keywords = normalize(item.keywords);
  const all = `${title} ${description} ${keywords}`;
  const { phrases, terms } = queryParts(query);
  const requirements = [...phrases, ...terms];
  if (!requirements.length || requirements.some((part) => !all.includes(part))) return 0;

  let score = 10;
  const normalizedQuery = normalize(query.replaceAll('"', ""));
  if (title === normalizedQuery) score += 220;
  else if (title.startsWith(normalizedQuery)) score += 130;
  else if (title.includes(normalizedQuery)) score += 90;
  for (const phrase of phrases) {
    if (title.includes(phrase)) score += 90;
    else if (description.includes(phrase)) score += 45;
    else score += 20;
  }
  for (const term of terms) {
    if (title.split(" ").some((word) => word === term)) score += 45;
    else if (title.includes(term)) score += 28;
    if (description.includes(term)) score += 12;
    if (keywords.includes(term)) score += 5;
  }
  if (requirements.every((part) => title.includes(part))) score += 35;
  return score;
}

function highlight(value, query) {
  const terms = [...queryParts(query).phrases, ...queryParts(query).terms].sort((a, b) => b.length - a.length);
  if (!terms.length) return escapeHtml(value);
  const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return escapeHtml(value).replace(pattern, "<mark>$1</mark>");
}

let indexPromise;
function loadIndex() {
  indexPromise ||= fetch("/search-index.json").then((response) => {
    if (!response.ok) throw new Error("Search index unavailable");
    return response.json();
  });
  return indexPromise;
}

function resultMarkup(item, query) {
  return `<a class="site-search-result" href="${escapeHtml(item.url)}" role="option">
    <span class="site-search-result-top"><strong>${highlight(item.title, query)}</strong><span>${escapeHtml(item.type)}</span></span>
    ${item.description ? `<small>${highlight(item.description, query)}</small>` : ""}
  </a>`;
}

export function initializeSiteSearch() {
  document.querySelectorAll("[data-site-search-root]").forEach((root) => {
    if (root.dataset.searchReady) return;
    root.dataset.searchReady = "true";
    const input = root.querySelector("[data-site-search-input]");
    const results = root.querySelector("[data-site-search-results]");
    const status = root.querySelector("[data-site-search-status]");
    const filters = [...root.querySelectorAll("[data-site-search-filter]")];
    const limit = Number(root.dataset.searchLimit || 24);
    if (!input || !results || !status) return;
    let items = [];
    let activeType = "All";

    const render = () => {
      const query = input.value.trim();
      const url = new URL(window.location.href);
      if (root.dataset.searchPage === "true") {
        query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
        activeType !== "All" ? url.searchParams.set("type", activeType) : url.searchParams.delete("type");
        history.replaceState({}, "", `${url.pathname}${url.search}`);
      }
      if (!query) {
        results.innerHTML = root.querySelector("template")?.innerHTML || "";
        status.textContent = "Start typing to search across LeashFree.ca.";
        return;
      }
      const ranked = items
        .map((item) => ({ ...item, score: scoreItem(item, query) }))
        .filter((item) => item.score > 0 && (activeType === "All" || item.type === activeType))
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
      const visible = ranked.slice(0, limit);
      results.innerHTML = visible.length
        ? visible.map((item) => resultMarkup(item, query)).join("")
        : `<div class="site-search-empty"><strong>No matches found</strong><span>Try fewer words, a broader term, or a different category.</span></div>`;
      const countLabel = ranked.length > visible.length ? `Showing ${visible.length} of ${ranked.length} results` : `${ranked.length} ${ranked.length === 1 ? "result" : "results"}`;
      status.textContent = `${countLabel} for “${query}”${activeType === "All" ? "" : ` in ${activeType}`}.`;
    };

    const params = new URLSearchParams(window.location.search);
    if (root.dataset.searchPage === "true") {
      input.value = params.get("q") || "";
      activeType = params.get("type") || "All";
    }
    filters.forEach((filter) => {
      filter.setAttribute("aria-pressed", String(filter.dataset.siteSearchFilter === activeType));
      filter.addEventListener("click", () => {
        activeType = filter.dataset.siteSearchFilter || "All";
        filters.forEach((button) => button.setAttribute("aria-pressed", String(button === filter)));
        render();
      });
    });
    input.addEventListener("input", render);
    input.addEventListener("keydown", (event) => {
      const links = [...results.querySelectorAll("a")];
      if (event.key === "ArrowDown" && links.length) {
        event.preventDefault();
        links[0].focus();
      }
    });
    results.addEventListener("keydown", (event) => {
      const links = [...results.querySelectorAll("a")];
      const current = links.indexOf(document.activeElement);
      if (event.key === "ArrowDown" && current < links.length - 1) { event.preventDefault(); links[current + 1].focus(); }
      if (event.key === "ArrowUp") { event.preventDefault(); current > 0 ? links[current - 1].focus() : input.focus(); }
    });

    status.textContent = "Loading search…";
    loadIndex().then((data) => { items = data; render(); }).catch(() => {
      status.textContent = "Search is temporarily unavailable. Please try again.";
    });
  });
}
