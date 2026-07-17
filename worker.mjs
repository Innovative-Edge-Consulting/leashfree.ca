function gaSnippet(gaId) {
  const escapedId = String(gaId).replace(/'/g, "\\'");
  return [
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapedId}"></script>`,
    `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapedId}');</script>`
  ].join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.leashfree.ca") {
      url.hostname = "leashfree.ca";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/26d88966f7a74cddaf13e59cc8015171.txt") {
      return new Response("26d88966f7a74cddaf13e59cc8015171\n", {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    const gaId =
      env.EDGE_GA_MEASUREMENT_ID ||
      env.EDGE_PUBLIC_GA_MEASUREMENT_ID;

    if (!gaId || !contentType.includes("text/html")) {
      return response;
    }

    const fallback = response.clone();
    try {
      const html = await response.text();
      const snippet = gaSnippet(gaId);
      const body = html.includes("</head>")
        ? html.replace("</head>", `${snippet}</head>`)
        : `${snippet}${html}`;
      const headers = new Headers(response.headers);
      headers.delete("content-length");
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch {
      return fallback;
    }
  }
};
