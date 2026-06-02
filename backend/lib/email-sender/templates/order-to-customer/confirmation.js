const orderConfirmationBody = (option) => {
  return `
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Order Confirmation - ${option.shop_name}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 22px; }
        .logo { width: 64px; height: 64px; object-fit: contain; margin: 0 auto 10px; display:block; }
        .header h1 { color: #16a34a; margin: 0; font-size: 24px; }
        .order-details { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
        .order-details table { width: 100%; }
        .order-details td { padding: 5px 0; }
        .label { font-weight: bold; color: #6b7280; width: 40%; }
        .value { color: #111827; font-weight: 600; }
        .footer { text-align: center; font-size: 13px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        .btn { display: inline-block; padding: 12px 25px; background: #10b981; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img class="logo" src="${option.logo || "https://farmacykart.com/favicon.png"}" alt="${option.shop_name}" />
            <h1>Order confirmed</h1>
            <p style="margin-top:8px;color:#475569;">Hi ${option.name}, your order has been successfully placed.</p>
        </div>

        <div class="order-details">
            <table>
                <tr><td class="label">Order ID:</td><td class="value">#${option.invoice}</td></tr>
                <tr><td class="label">Date:</td><td class="value">${option.date}</td></tr>
                <tr><td class="label">Amount:</td><td class="value">${option.currency}${option.total}</td></tr>
                <tr><td class="label">Payment Status:</td><td class="value">${option.paymentStatus}</td></tr>
                <tr><td class="label">Order Status:</td><td class="value">${option.status}</td></tr>
            </table>
        </div>

        <p>We are processing your order and will notify you as soon as it's shipped. You can track your order status in your dashboard.</p>

        <div style="text-align: center;">
            <a href="${option.trackingUrl}" class="btn">Track your order</a>
        </div>

        <p style="margin-top: 25px;color:#475569;">If you have any questions, reply to this email or contact us at ${option.contact_email}.</p>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${option.shop_name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
};

module.exports = { orderConfirmationBody };
