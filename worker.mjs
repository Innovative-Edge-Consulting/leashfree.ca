class HeadInjector {
  constructor(gaId) {
    this.gaId = gaId;
  }

  element(head) {
    if (!this.gaId) return;
    const escapedId = String(this.gaId).replace(/'/g, "\\'");
    head.append(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapedId}"></script>`,
      { html: true }
    );
    head.append(
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapedId}');</script>`,
      { html: true }
    );
  }
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    const gaId =
      env.PUBLIC_GA_MEASUREMENT_ID ||
      env.GA_MEASUREMENT_ID ||
      env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (!gaId || !contentType.includes("text/html")) {
      return response;
    }

    return new HTMLRewriter()
      .on("head", new HeadInjector(gaId))
      .transform(response);
  }
};
