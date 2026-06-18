const { Resend } = require('resend');

const resend = new Resend('re_HvZTKgXp_41ZFT5ND6MvfRNYh2kREYMvV');

async function testEmail() {
  try {
    const data = await resend.emails.send({
      from: 'RASA <notify@rasastore.com>',
      to: ['YOUR_EMAIL_ADDRESS_HERE'], // Replace with your email or mail-tester.com email
      subject: 'Test Email from RASA',
      html: '<strong>This is a test email to check if it lands in Inbox or Spam.</strong>',
    });

    console.log('Email sent successfully!', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
