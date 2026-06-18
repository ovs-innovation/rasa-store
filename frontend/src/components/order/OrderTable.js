import useUtilsFunction from "@hooks/useUtilsFunction";
import React from "react";

const OrderTable = ({ data, currency }) => {
  const { getNumberTwo } = useUtilsFunction();

  return (
    <tbody className="bg-white text-serif text-sm print:bg-white">
      {data?.cart?.map((item, i) => {
        const quantity = item.quantity || 1;
        const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;

        const itemPrice = Number(item.price);
        const hasValidPrice = !isNaN(itemPrice) && itemPrice > 0;

        let discountPerItem = 0;
        if (hasValidPrice) {
          discountPerItem = mrp - itemPrice;
        } else if (typeof item.discount === "number") {
          discountPerItem = (mrp * item.discount) / 100;
        }

        const gstRateVal = Number(item.taxRate || item.gstRate || item.gstPercentage || 0) || 0;
        const sellingPrice = hasValidPrice ? itemPrice : mrp - discountPerItem;
        const gstAmt = ((sellingPrice * quantity * gstRateVal) / 100) || 0;

        const lineTotal =
          item.itemTotal ??
          sellingPrice * quantity + gstAmt;

        return (
          <tr
            key={i}
            className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-t border-gray-100 print:bg-white print:border-0`}
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
              {getNumberTwo(mrp)}
            </td>
            <td className="px-2 py-1 whitespace-nowrap text-center font-normal border-r border-gray-200 print:px-1 print:py-1 print:text-xs">
              {typeof discountPerItem === "number"
                ? `${currency}${getNumberTwo(discountPerItem * quantity)}`
                : "-"}
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

export default OrderTable;
