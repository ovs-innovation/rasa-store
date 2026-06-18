const otpEmailBody = (option) => {
  return `
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${option.shop_name}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
      body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f2f3f8; }
      .container { max-width: 600px; margin: 30px auto; background: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .logo { text-align: center; margin-bottom: 30px; }
      .logo img { width: 80px; }
      .content { line-height: 1.6; color: #333333; }
      .otp-container { text-align: center; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0; }
      .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #10b981; margin: 0; }
      .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #8a8a8a; border-top: 1px solid #eeeeee; padding-top: 20px; }
      .btn { display: inline-block; padding: 12px 24px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
         <img src="${option.logo || "https://res.cloudinary.com/dse9adftu/image/upload/v1780479335/rasa/brand/logo.png"}" alt="${option.shop_name}" />
      </div>
      <div class="content">
        <h2 style="margin-top: 0;">Hello ${option.name},</h2>
        <p>Thank you for choosing <strong>${option.shop_name}</strong>. To complete your registration, please use the following One-Time Password (OTP) to verify your email address:</p>
        
        <div class="otp-container">
          <p style="margin-bottom: 10px; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase;">Your Verification Code</p>
          <h1 class="otp-code">${option.otp}</h1>
        </div>

        <p>This code is valid for <strong>15 minutes</strong>. If the code expires, you can request a new one from the verification page.</p>
        
        <p>If you did not create an account, no further action is required. You can safely ignore this email.</p>
        
        <p style="margin-top: 30px;">Best regards,<br/><strong>The ${option.shop_name} Team</strong></p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${option.shop_name}. All rights reserved.</p>
        <p>If you have any questions, contact us at ${option.contact_email}</p>
      </div>
    </div>
  </body>
</html>
`;
};

module.exports = { otpEmailBody };
