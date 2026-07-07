import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import dayjs from "dayjs";

import { pickBrandLogo } from "@/utils/brandAssets";
import { resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "DejaVu Sans",
  fonts: [
    {
      src: "https://kendo.cdn.telerik.com/2017.2.621/styles/fonts/DejaVu/DejaVuSans.ttf",
    },
    {
      src: "https://kendo.cdn.telerik.com/2017.2.621/styles/fonts/DejaVu/DejaVuSans-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const PINK = "#d67b8c";
const PINK_BG = "#FFF5F6";
const PINK_LIGHT = "#FDF0F2";
const PINK_BORDER = "#f5d6da";

const styles = StyleSheet.create({
  page: {
    backgroundColor: PINK_BG,
    padding: 28,
    fontFamily: "Open Sans",
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: PINK_BORDER,
  },
  brandTag: {
    fontSize: 6,
    letterSpacing: 1.5,
    color: PINK,
    fontWeight: 700,
    marginTop: 4,
    textTransform: "uppercase",
  },
  thankYouTitle: {
    fontSize: 22,
    color: PINK,
    fontWeight: 700,
    marginBottom: 2,
  },
  thankYouSub: {
    fontSize: 8,
    fontWeight: 700,
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  thankYouItalic: {
    fontSize: 7,
    color: "#6b7280",
    marginTop: 2,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: PINK_LIGHT,
    color: PINK,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PINK_BORDER,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 7,
    fontWeight: 700,
    color: PINK,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 8,
    fontWeight: 700,
    color: "#111827",
  },
  infoValuePink: {
    fontSize: 8,
    fontWeight: 700,
    color: PINK,
  },
  deliverBox: {
    borderWidth: 1,
    borderColor: PINK_BORDER,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  deliverTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: PINK,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  table: {
    borderWidth: 1,
    borderColor: PINK_BORDER,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#ffffff",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: PINK_LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: PINK_BORDER,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeadCell: {
    fontSize: 7,
    fontWeight: 700,
    color: "#1f2937",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 8,
    color: "#374151",
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: 700,
    color: "#111827",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productThumb: {
    width: 28,
    height: 28,
    borderRadius: 4,
    objectFit: "cover",
  },
  messageBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#e8a0ad",
    backgroundColor: "rgba(253,240,242,0.55)",
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
  },
  totalsBox: {
    width: "42%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: PINK_BORDER,
    paddingTop: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 10,
  },
  footerCol: {
    width: "30%",
  },
  stamp: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: PINK,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    padding: 4,
  },
  currency: {
    fontFamily: "DejaVu Sans",
  },
});

const absUrl = (url) => {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (trimmed.startsWith("http")) return trimmed;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  }
  return trimmed;
};

const formatInvoiceNumber = (invoice, createdAt) => {
  if (!invoice) return "-";
  const invStr = String(invoice).trim();
  if (invStr.startsWith("FK/")) return invStr;
  const year = createdAt
    ? dayjs(createdAt).format("YYYY")
    : dayjs().format("YYYY");
  return `FK/${year}/${invStr}`;
};

const InvoiceForDownload = ({
  data,
  currency,
  getNumberTwo,
  logo,
  greetingMessage,
}) => {
  const mrpTotal =
    data?.cart?.reduce((sum, item) => {
      const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
      const qty = item.quantity || 1;
      return sum + mrp * qty;
    }, 0) || 0;

  const totalDiscount =
    data?.cart?.reduce((sum, item) => {
      const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
      const salePrice = item.price ?? 0;
      const qty = item.quantity || 1;
      return sum + (mrp - salePrice) * qty;
    }, 0) || 0;

  const shippingCharge = data?.shippingCost || 0;
  const payableAmount = data?.total || 0;
  const brandLogo = absUrl(pickBrandLogo(logo));
  const illustration = absUrl("/invoice_illustration.png");
  const stampLogo = absUrl("/rasaLogo.png");

  const greeting =
    greetingMessage || "We pack every order with love and care. ♥";

  const InfoLine = ({ label, value, pink }) => (
    <View style={{ flexDirection: "row", marginBottom: 3 }}>
      <Text style={[styles.infoLabel, { width: "34%" }]}>{label}</Text>
      <Text style={pink ? styles.infoValuePink : styles.infoValue}>
        : {value}
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ width: "48%" }}>
            {brandLogo ? (
              <Image src={brandLogo} style={{ width: 90, height: 28, objectFit: "contain", marginBottom: 4 }} />
            ) : null}
            <Text style={styles.brandTag}>SNEAKERS • BAGS • ACCESSORIES</Text>
          </View>
          <View style={{ width: "48%", flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
            <View style={{ marginRight: 8, alignItems: "flex-end" }}>
              <Text style={styles.thankYouTitle}>Thank You ♥</Text>
              <Text style={styles.thankYouSub}>FOR SHOPPING WITH US!</Text>
              <Text style={styles.thankYouItalic}>Your style, our passion.</Text>
            </View>
            {illustration ? (
              <Image src={illustration} style={{ width: 72, height: 52, objectFit: "contain" }} />
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 14 }}>
          <View style={{ width: "48%", paddingRight: 10 }}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>INVOICE</Text>
            </View>
            <InfoLine
              label="Invoice No."
              value={formatInvoiceNumber(data?.invoice, data?.createdAt)}
              pink
            />
            <InfoLine
              label="Order ID"
              value={data?._id ? data._id.slice(-8).toUpperCase() : "-"}
            />
            <InfoLine
              label="Date"
              value={
                data?.createdAt
                  ? dayjs(data.createdAt).format("DD MMMM YYYY")
                  : "-"
              }
            />
            <InfoLine
              label="Payment Method"
              value={data?.paymentMethod || "RazorPay"}
            />
          </View>

          <View style={{ width: "48%", borderLeftWidth: 1, borderLeftColor: PINK_BORDER, paddingLeft: 14 }}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>BILL TO</Text>
            </View>
            <InfoLine label="Name" value={data?.user_info?.name || "-"} />
            <InfoLine label="Phone" value={data?.user_info?.contact || "-"} />
            <InfoLine
              label="Address"
              value={`${data?.user_info?.address || ""}, ${data?.user_info?.city || ""}, ${data?.user_info?.country || ""} - ${data?.user_info?.zipCode || ""}`}
            />
          </View>
        </View>

        <View style={styles.deliverBox}>
          <Text style={styles.deliverTitle}>🎁 Deliver To:</Text>
          <Text style={{ fontSize: 9, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
            {data?.user_info?.name || "-"}
          </Text>
          {data?.user_info?.contact ? (
            <Text style={{ fontSize: 8, marginBottom: 2 }}>📞 {data.user_info.contact}</Text>
          ) : null}
          <Text style={{ fontSize: 8, lineHeight: 1.4 }}>
            📍 {data?.user_info?.address}, {data?.user_info?.city},{" "}
            {data?.user_info?.country} - {data?.user_info?.zipCode}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, { width: "6%", textAlign: "center" }]}>Sr.</Text>
            <Text style={[styles.tableHeadCell, { width: "38%" }]}>Product</Text>
            <Text style={[styles.tableHeadCell, { width: "16%", textAlign: "center" }]}>Size / Color</Text>
            <Text style={[styles.tableHeadCell, { width: "8%", textAlign: "center" }]}>Qty</Text>
            <Text style={[styles.tableHeadCell, { width: "16%", textAlign: "right" }]}>Price</Text>
            <Text style={[styles.tableHeadCell, { width: "16%", textAlign: "right" }]}>Total</Text>
          </View>

          {data?.cart?.map((item, index) => {
            const productImg = absUrl(resolveCloudinaryUrl(item.image) || "/rasaLogo.png");
            return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCell, { width: "6%", textAlign: "center" }]}>
                  {index + 1}
                </Text>
                <View style={{ width: "38%" }}>
                  <View style={styles.productRow}>
                    {productImg ? (
                      <Image src={productImg} style={styles.productThumb} />
                    ) : null}
                    <View>
                      <Text style={styles.tableCellBold}>{item.title}</Text>
                      <Text style={{ fontSize: 6, color: "#9ca3af", marginTop: 1 }}>
                        {item.categoryName || "Premium Item"}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.tableCell, { width: "16%", textAlign: "center", fontWeight: 600 }]}>
                  {item.variantName || "-"}
                </Text>
                <Text style={[styles.tableCellBold, { width: "8%", textAlign: "center" }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.currency, { width: "16%", textAlign: "right" }]}>
                  {currency}
                  {getNumberTwo(item.price)}
                </Text>
                <Text style={[styles.tableCellBold, styles.currency, { width: "16%", textAlign: "right" }]}>
                  {currency}
                  {getNumberTwo(item.itemTotal || item.price * item.quantity)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={styles.messageBox}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: "#1f2937", lineHeight: 1.5 }}>
              {greeting}
            </Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 8, textTransform: "uppercase" }}>Subtotal</Text>
              <Text style={[styles.tableCellBold, styles.currency]}>
                {currency}
                {getNumberTwo(mrpTotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 8, textTransform: "uppercase" }}>Shipping</Text>
              <Text style={[styles.tableCellBold, styles.currency, { color: shippingCharge > 0 ? "#111827" : PINK }]}>
                {shippingCharge > 0
                  ? `${currency}${getNumberTwo(shippingCharge)}`
                  : "FREE"}
              </Text>
            </View>
            {totalDiscount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 8, textTransform: "uppercase", color: "#ef4444" }}>Discount</Text>
                <Text style={[styles.currency, { color: "#ef4444", fontWeight: 700 }]}>
                  -{currency}
                  {getNumberTwo(totalDiscount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.grandTotalRow}>
              <Text style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>
                Grand Total
              </Text>
              <Text style={[styles.currency, { fontSize: 10, fontWeight: 700, color: PINK }]}>
                {currency}
                {getNumberTwo(payableAmount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: PINK, marginBottom: 3 }}>
              Need Help? 💬
            </Text>
            <Text style={{ fontSize: 8, fontWeight: 700, color: "#111827" }}>
              WhatsApp: +91 9731308713
            </Text>
            <Text style={{ fontSize: 7, color: "#6b7280", marginTop: 2 }}>
              workwithrasa@gmail.com
            </Text>
          </View>

          <View style={{ width: "30%", alignItems: "center" }}>
            <View style={styles.stamp}>
              <Text style={{ fontSize: 5, fontWeight: 700, textTransform: "uppercase" }}>Rasa Store</Text>
              {stampLogo ? (
                <Image src={stampLogo} style={{ width: 12, height: 12, marginVertical: 2 }} />
              ) : null}
              <Text style={{ fontSize: 5, fontWeight: 700, textTransform: "uppercase" }}>Thank You</Text>
            </View>
          </View>

          <View style={[styles.footerCol, { alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
              Stay Connected With Us
            </Text>
            <Text style={{ fontSize: 8, fontWeight: 700, color: PINK, marginBottom: 2 }}>
              Instagram: @kicksbyrasaa
            </Text>
            <Text style={{ fontSize: 7, color: "#6b7280" }}>www.therasastore.in</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceForDownload;
