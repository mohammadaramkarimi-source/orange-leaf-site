export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/kv/")) {
      const key = decodeURIComponent(url.pathname.slice("/api/kv/".length));

      if (!key) {
        return new Response("کلید مشخص نشده است", { status: 400 });
      }

      if (request.method === "GET") {
        const value = await env.SITE_KV.get(key);
        if (value === null) {
          return new Response(null, { status: 404 });
        }
        return new Response(value, {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      if (request.method === "POST" || request.method === "PUT") {
        const body = await request.text();
        await env.SITE_KV.put(key, body);
        return new Response("ok", { status: 200 });
      }

      if (request.method === "DELETE") {
        await env.SITE_KV.delete(key);
        return new Response("ok", { status: 200 });
      }

      return new Response("متد پشتیبانی نمی‌شود", { status: 405 });
    }

    // اگر آدرس ریشه یا مسیر ناشناخته بود، فایل Index.html را برگردان
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const fixedUrl = new URL(request.url);
      fixedUrl.pathname = "/Index.html";
      return env.ASSETS.fetch(new Request(fixedUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};
