// این Worker دو کار انجام می‌دهد:
// ۱) سرو کردن فایل‌های استاتیک سایت (پوشه public، شامل index.html)
// ۲) ارائه‌ی یک API ساده (/api/kv/...) که روی Cloudflare KV ذخیره می‌کند
//    تا اطلاعات سایت (کاربرها، پروژه‌ها، قراردادها و ...) بین همه‌ی
//    گوشی‌ها و مرورگرها مشترک باشد و دیگر به localStorage وابسته نباشد.

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
          // معادل نبود مقدار در localStorage
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

    // هر درخواست دیگری: سرو فایل استاتیک متناظر (index.html و غیره)
    return env.ASSETS.fetch(request);
  },
};
