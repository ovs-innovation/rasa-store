import React from "react";

const InvoiceOrderTable = ({ data, currency, getNumberTwo }) => {
  return (
    <tbody className="bg-white text-serif text-sm print:bg-white">
      {data?.cart?.map((item, i) => {
        const quantity = item.quantity || 1;
        const mrpForCalc = Math.abs(Number(item.mrp)) || Math.abs(Number(item.originalPrice)) || Math.abs(Number(item.price)) || 0;
        const itemPrice = Math.abs(Number(item.price)) || 0;
        const hasValidPrice = !isNaN(itemPrice) && itemPrice > 0;

        let discountPerItem = 0;
        if (hasValidPrice) {
          discountPerItem = mrpForCalc - itemPrice;
        } else if (typeof item.discount === "number") {
          discountPerItem = (mrpForCalc * item.discount) / 100;
        }

        const gstRateVal = Math.abs(Number(item.taxRate || item.gstRate || item.gstPercentage || 0)) || 0;
        const sellingPrice = Math.abs(Number(item.price)) || 0;
        const gstAmt = Math.abs(((sellingPrice * quantity * gstRateVal) / 100) || 0);
        const lineTotal = Math.abs(Number(item.itemTotal)) || Math.abs((sellingPrice * quantity) + gstAmt) || 0;

        return (
          <tr
            key={i}
            className={`${
              i % 2 === 0 ? "bg-white" : "bg-gray-50"
            } border-t border-gray-100 print:bg-white print:border-gray-300`}
          >
            <th className="px-2 py-1 whitespace-nowrap font-normal text-gray-700 text-left border-r border-gray-200 print:px-1 print:py-1 print:text-xs">
              {i + 1}
            </th>
            <td className="product-column px-2 py-1 font-normal text-gray-700 border-r border-gray-200 print:px-1 print:py-1 print:text-xs print:break-words">
              {item.title}
            </td>
            <td className="px-2 py-1 whitespace-nowrap font-normal text-gray-700 text-center border-r border-gray-200 print:px-1 print:py-1 print:text-xs">
              {item.hsn || "-"}
            </td>
            <td className="px-2 py-1 whitespace-nowrap font-bold text-center border-r border-gray-200 print:px-1 print:py-1 print:text-xs">
              {item.quantity}
            </td>
            <td className="px-2 py-1 whitespace-nowrap font-bold text-center font-DejaVu border-r border-gray-200 print:px-1 print:py-1 print:text-xs">
              {currency}
              {getNumberTwo(mrpForCalc)}
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-center font-normal border-r border-gray-200 print:px-1 print:py-1 print:text-xs">
              {discountPerItem > 0
                ? `${currency}${getNumberTwo(discountPerItem * quantity)}`
                : `${currency}0.00`}
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-center font-normal border-r border-gray-200 print:px-1 print:py-1 print:text-xs">
              {gstRateVal}%
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-center font-normal border-r border-gray-200 print:px-1 print:py-1 print:text-xs">
              {currency}{getNumberTwo(gstAmt)}
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-right font-bold font-DejaVu text-gray-600 print:px-1 print:py-1 print:text-xs">
              {currency}{getNumberTwo(lineTotal)}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default InvoiceOrderTable;
