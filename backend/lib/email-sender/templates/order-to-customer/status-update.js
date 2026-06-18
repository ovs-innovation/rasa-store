const orderStatusUpdateBody = (option) => {
  const {
    shop_name = "RASA",
    logo,
    name,
    invoice,
    status,
    message,
    trackingUrl,
    contact_email,
  } = option || {};

  return `
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Order update – ${shop_name}</title>
    <style>
      body { margin:0; padding:0; background:#f4f7fb; font-family:Segoe UI, Roboto, Arial, sans-serif; color:#0f172a; }
      .wrap { max-width:640px; margin:0 auto; padding:24px; }
      .card { background:#fff; border:1px solid #e7eef6; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(2,6,23,.06); }
      .head { padding:22px; background:linear-gradient(135deg,#16a34a,#0ea5e9); color:#fff; }
      .logo { width:42px; height:42px; object-fit:contain; background:rgba(255,255,255,.16); border-radius:14px; padding:8px; }
      .title { font-size:18px; font-weight:800; margin:8px 0 0; }
      .sub { opacity:.9; margin:6px 0 0; font-size:13px; }
      .body { padding:22px; }
      .pill { display:inline-block; padding:6px 10px; border-radius:999px; background:#ecfeff; color:#0369a1; font-weight:700; font-size:12px; }
      .muted { color:#64748b; font-size:13px; }
      .btn { display:inline-block; margin-top:16px; background:#16a34a; color:#fff; text-decoration:none; padding:12px 16px; border-radius:12px; font-weight:800; }
      .foot { padding:16px 22px; border-top:1px solid #eef2f7; background:#f8fafc; text-align:center; color:#64748b; font-size:12px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="head">
          <div style="display:flex;align-items:center;gap:12px;">
            <img class="logo" src="${logo || "https://rasastore.com/favicon.png"}" alt="${shop_name}" />
            <div style="flex:1;min-width:0;">
              <div style="letter-spacing:.14em;text-transform:uppercase;font-weight:800;font-size:12px;">Order update</div>
              <div class="title">Order #${invoice}</div>
              <div class="sub">Hi ${name || "there"}, here is your latest update.</div>
            </div>
          </div>
        </div>
        <div class="body">
          <div class="pill">${status || "Updated"}</div>
          ${message ? `<p style="margin:14px 0 0;font-size:14px;line-height:1.6;">${message}</p>` : ""}
          <p class="muted" style="margin:14px 0 0;">You can view your order timeline in your dashboard.</p>
          ${trackingUrl ? `<a class="btn" href="${trackingUrl}">View order</a>` : ""}
          <p class="muted" style="margin-top:18px;">Need help? Contact us at ${contact_email || ""}</p>
        </div>
        <div class="foot">${shop_name} – Transactional notification</div>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = { orderStatusUpdateBody };

