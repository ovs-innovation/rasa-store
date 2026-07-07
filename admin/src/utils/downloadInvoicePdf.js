import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const waitForImages = (element) => {
  const images = element.querySelectorAll("img");
  return Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = resolve;
          img.onerror = resolve;
        })
    )
  );
};

/**
 * Downloads a pixel-accurate PDF from the rendered invoice DOM node.
 */
export async function downloadInvoicePdf(element, fileName = "Invoice") {
  if (!element) {
    throw new Error("Invoice element not found");
  }

  await waitForImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#FFF5F6",
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 6;
  const contentWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  let position = margin;
  let heightLeft = imgHeight;
  const pageContentHeight = pageHeight - margin * 2;

  pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
  heightLeft -= pageContentHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    position = margin - (imgHeight - heightLeft);
    pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
    heightLeft -= pageContentHeight;
  }

  pdf.save(`${fileName}.pdf`);
}
