import SettingServices from "@services/SettingServices";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    // Fetch general metadata from backend API (best-effort, guard failures)
    let setting = null;
    try {
      setting = await SettingServices.getStoreSeoSetting();
    } catch (err) {
      // Avoid blocking document render on SEO fetch failures
      console.error("SEO setting fetch failed:", err?.message || err);
    }

    return { ...initialProps, setting };
  }

  render() {
    const setting = this.props.setting;
    const favicon ="/favicon.png" || setting?.favicon ;
    const metaTitle = setting?.meta_title || "Farmacykart – Customized Promotional Items & Advertising Products Online Store";
    const metaDescription = setting?.meta_description || "Discover personalized merchandise, branded giveaways, and advertising essentials. Ideal for businesses, events, and promotions";
    const metaKeywords = setting?.meta_keywords || "ecommerce online store";
    const metaUrl = setting?.meta_url || "";
    const metaImage = setting?.meta_img || "/logo/logo.png";

    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href={favicon} />
          <link rel="shortcut icon" href={favicon} />
          <link rel="apple-touch-icon" href={favicon} />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:type" content="eCommerce Website" />
          <meta property="og:description" content={metaDescription} />
          <meta name="keywords" content={metaKeywords} />
          <meta property="og:url" content={metaUrl} />
          <meta property="og:image" content={metaImage} />
          {/* Dev-only: prevent stale PWA cache showing old UI on refresh */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  try {
                    if (!/localhost|127\\.0\\.0\\.1/.test(location.hostname)) return;
                    if (!('serviceWorker' in navigator)) return;
                    var key = '__sw_cleared_once__';
                    if (sessionStorage.getItem(key)) return;
                    sessionStorage.setItem(key, '1');
                    navigator.serviceWorker.getRegistrations()
                      .then(function (regs) { return Promise.all(regs.map(function (r) { return r.unregister(); })); })
                      .catch(function () {});
                    if ('caches' in window) {
                      caches.keys()
                        .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
                        .catch(function () {});
                    }
                    if (navigator.serviceWorker.controller) {
                      // If a SW was controlling, reload once to get fresh assets.
                      setTimeout(function () { location.reload(); }, 50);
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
