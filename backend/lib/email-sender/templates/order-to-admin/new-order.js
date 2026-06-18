const buildItemsHtml = (cart = [], currency = "₹") => {
  const rows = (cart || [])
    .map((item) => {
      const title = item?.title || item?.product?.title || item?.productId?.title || "Item";
      const qty = item?.quantity || 1;
      const price = item?.price || item?.prices?.price || 0;
      const line = Number(qty) * Number(price || 0);
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;">${String(
            title
          )}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:center;">${qty}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:right;">${currency}${Number(
            price || 0
          ).toFixed(2)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:right;font-weight:700;">${currency}${Number(
            line
          ).toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #eef2f7;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #eef2f7;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;">Item</th>
          <th style="text-align:center;padding:10px 12px;border-bottom:1px solid #eef2f7;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;">Qty</th>
          <th style="text-align:right;padding:10px 12px;border-bottom:1px solid #eef2f7;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;">Price</th>
          <th style="text-align:right;padding:10px 12px;border-bottom:1px solid #eef2f7;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows || ""}
      </tbody>
    </table>
  `;
};

const newOrderAdminEmailBody = (option) => {
  const {
    shop_name = "RASA",
    logo,
    invoice,
    currency = "₹",
    total,
    paymentMethod,
    createdAt,
    customerName,
    customerPhone,
    customerEmail,
    address,
    trackingUrl,
    cart,
  } = option || {};

  return `
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New order – ${shop_name}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Segoe UI, Roboto, Arial, sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e7eef6;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(2,6,23,.06);">
        <div style="padding:22px 22px 14px;background:linear-gradient(135deg,#16a34a,#0ea5e9);color:#fff;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;overflow:hidden;">
              ${logo ? `<img src="${logo}" alt="${shop_name}" style="width:34px;height:34px;object-fit:contain;" />` : ""}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;opacity:.9;letter-spacing:.14em;text-transform:uppercase;font-weight:700;">New order</div>
              <div style="font-size:18px;font-weight:800;margin-top:4px;">Order #${invoice}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px;opacity:.9;">Amount</div>
              <div style="font-size:18px;font-weight:800;">${currency}${Number(total || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div style="padding:22px;">
          <div style="display:flex;gap:14px;flex-wrap:wrap;">
            <div style="flex:1;min-width:240px;border:1px solid #eef2f7;border-radius:14px;padding:14px 14px 12px;background:#fbfdff;">
              <div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;font-weight:800;">Customer</div>
              <div style="margin-top:8px;font-weight:800;">${customerName || "-"}</div>
              <div style="margin-top:6px;color:#334155;font-size:13px;">${customerPhone || "-"}</div>
              ${customerEmail ? `<div style="margin-top:6px;color:#334155;font-size:13px;">${customerEmail}</div>` : ""}
            </div>
            <div style="flex:1;min-width:240px;border:1px solid #eef2f7;border-radius:14px;padding:14px 14px 12px;background:#fbfdff;">
              <div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;font-weight:800;">Order</div>
              <div style="margin-top:8px;color:#0f172a;font-size:13px;"><strong>Payment:</strong> ${paymentMethod || "-"}</div>
              <div style="margin-top:6px;color:#0f172a;font-size:13px;"><strong>Date:</strong> ${createdAt || "-"}</div>
              ${trackingUrl ? `<div style="margin-top:6px;color:#0f172a;font-size:13px;"><strong>Dashboard:</strong> <a href="${trackingUrl}" style="color:#0ea5e9;text-decoration:none;">Open</a></div>` : ""}
            </div>
          </div>

          <div style="margin-top:14px;border:1px solid #eef2f7;border-radius:14px;padding:14px;background:#ffffff;">
            <div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;font-weight:800;">Delivery address</div>
            <div style="margin-top:8px;color:#0f172a;font-size:13px;line-height:1.5;">${address || "-"}</div>
          </div>

          <div style="margin-top:16px;">
            ${buildItemsHtml(cart, currency)}
          </div>
        </div>

        <div style="padding:16px 22px;border-top:1px solid #eef2f7;background:#f8fafc;color:#64748b;font-size:12px;text-align:center;">
          ${shop_name} – Transactional notification
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = { newOrderAdminEmailBody };

