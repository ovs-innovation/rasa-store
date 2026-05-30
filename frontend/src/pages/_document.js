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
