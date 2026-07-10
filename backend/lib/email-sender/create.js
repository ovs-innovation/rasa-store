const PDFDocument = require("pdfkit");
const Setting = require("../../models/Setting");

const DEFAULT_GREETING =
  "Thank you for choosing The Rasa Store. Your order means the world to us — every piece is packed with love, care, and a little extra magic. We cannot wait for you to unbox your new favorites!";

const getFirstName = (name) => {
  if (!name) return "Friend";
  return String(name).trim().split(/\s+/)[0] || "Friend";
};

const resolveGreeting = async (invoice) => {
  if (invoice?.greetingMessage) {
    return String(invoice.greetingMessage).trim();
  }

  try {
    const store = await Setting.findOne({ name: "storeCustomizationSetting" });
    const msg = store?.setting?.dashboard?.invoice_greeting_message?.en;
    if (msg && String(msg).trim()) return String(msg).trim();
  } catch (_) {
    /* use default */
  }

  return DEFAULT_GREETING;
};

const generateGreetingPdf = (doc, invoice, greeting) => {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;

  doc.rect(0, 0, pageWidth, pageHeight).fill("#FFF5F6");

  const firstName = getFirstName(invoice?.user_info?.name);
  const centerY = pageHeight * 0.38;

  doc
    .fillColor("#d67b8c")
    .font("Helvetica-Oblique")
    .fontSize(14)
    .text("with love", margin, centerY - 70, {
      width: contentWidth,
      align: "center",
    });

  doc
    .fillColor("#d67b8c")
    .font("Helvetica-BoldOblique")
    .fontSize(34)
    .text(`Dear ${firstName},`, margin, centerY - 40, {
      width: contentWidth,
      align: "center",
    });

  doc
    .fillColor("#374151")
    .font("Helvetica")
    .fontSize(16)
    .text(greeting, margin, centerY + 30, {
      width: contentWidth,
      align: "center",
      lineGap: 8,
    });

  doc
    .fillColor("#d67b8c")
    .font("Helvetica")
    .fontSize(22)
    .text("♥", margin, pageHeight - margin - 80, {
      width: contentWidth,
      align: "center",
    });

  doc
    .fillColor("#6b7280")
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("THE RASA STORE", margin, pageHeight - margin - 48, {
      width: contentWidth,
      align: "center",
      characterSpacing: 3,
    });
};

const handleCreateInvoice = async (invoice) => {
  const greeting = await resolveGreeting(invoice);

  const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      resolve(new Uint8Array(Buffer.concat(buffers)));
    });
    doc.on("error", reject);

    generateGreetingPdf(doc, invoice, greeting);
    doc.end();
  });

  return pdfBuffer;
};

module.exports = {
  handleCreateInvoice,
};
