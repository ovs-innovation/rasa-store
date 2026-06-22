import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    const metaTitle = "RASA — Premium Sneakers & Streetwear";
    const metaDescription =
      "Authenticated sneakers, bags, and streetwear essentials. Premium drops from curated global collections.";
    const favicon = "/rasaLogo.png";

    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content="#050505" />
          <meta name="color-scheme" content="dark" />
          <link rel="icon" href={favicon} />
          <link rel="shortcut icon" href={favicon} />
          <link rel="apple-touch-icon" href={favicon} />
          <link rel="preload" href="/rasaLogo.png" as="image" />
          <link rel="preload" href="/shoes1.png" as="image" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800;900&family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={metaDescription} />
          <meta name="description" content={metaDescription} />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                html, body {
                  margin: 0;
                  padding: 0;
                  background: #050505;
                  color: #ffffff;
                  min-height: 100%;
                }
                #__next { min-height: 100vh; background: #050505; }
              `,
            }}
          />
        </Head>
        <body className="bg-[#050505] text-white antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
