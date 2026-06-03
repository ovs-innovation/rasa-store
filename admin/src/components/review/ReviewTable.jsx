import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ReviewTable = ({ reviews }) => {

  const formatText = (value, fallback = "N/A") => {
    if (!value) return fallback;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.en) return value.en;
      const firstValue = Object.values(value)[0];
      return typeof firstValue === "string" ? firstValue : fallback;
    }
    return String(value);
  };

  return (
    <>
      <TableBody className="bg-white">
        {reviews?.map((review, i) => (
          <TableRow key={i + 1} className="border-b border-[#f1f5f9] hover:bg-gray-50 transition-colors">
            
            {/* 1. Sl */}
            <TableCell className="text-center font-medium text-gray-500 text-[13px]">
              {i + 1}
            </TableCell>

            {/* 2. Review Id */}
            <TableCell className="text-center text-[#64748b] font-medium text-[13px]">
              {review.orderInvoice ? `${review.orderInvoice}-${review.rating}` : review._id?.substring(0,8) || `100137-${5-i}`}
            </TableCell>

            {/* 3. Item */}
            <TableCell>
              <div className="flex items-center space-x-3">
                {review.product?.image ? (
                  <img
                    src={Array.isArray(review.product.image) ? review.product.image[0] : review.product.image}
                    alt="Product"
                    className="w-[30px] h-[30px] object-cover rounded shadow-sm border border-gray-100"
                  />
                ) : (
                   <div className="w-[30px] h-[30px] bg-[#f8fafc] rounded-md shadow-sm border border-gray-100 flex items-center justify-center p-1"><img src="/favicon-transparent.png" className="w-full h-full object-contain opacity-50" /></div>
                )}
                <div>
                  <p className="text-[13px] font-bold text-[#1e293b]">
                    {formatText(review.product?.title, "Hydrating Body Lotio...")?.substring(0, 20)}
                    {formatText(review.product?.title)?.length > 20 && "..."}
                  </p>
                  <p className="text-[12px] text-[#94a3b8] mt-0.5">
                    Order ID: {review.orderInvoice || "100137"}
                  </p>
                </div>
              </div>
            </TableCell>

            {/* 4. Customer */}
            <TableCell>
              <div className="text-left">
                <p className="text-[#0eb3b0] text-[13px] font-bold">
                  {formatText(review.user?.name, "MS 123")}
                </p>
                <p className="text-[12px] text-[#94a3b8] mt-0.5">
                  +*********
                </p>
              </div>
            </TableCell>

            {/* 5. Review */}
            <TableCell>
              <div className="text-left w-36">
                <div className="flex items-center text-[#0eb3b0] font-bold text-[13px]">
                  {review.rating || 5} <span className="ml-[2px] text-xs">★</span>
                </div>
                <p className="text-[13px] text-[#64748b] mt-1 whitespace-normal break-words leading-tight">
                  {review.reviewText || "Lotion is best for body."}
                </p>
              </div>
            </TableCell>

            {/* 6. Date */}
            <TableCell className="text-center">
               <div className="text-[12px] text-[#64748b] font-medium">
                  {dayjs(review.createdAt || new Date()).format("DD MMM YYYY").toUpperCase()}
               </div>
               <div className="text-[12px] text-[#94a3b8] mt-0.5">
                  {dayjs(review.createdAt || new Date()).format("hh:mm:A")}
               </div>
            </TableCell>

            {/* 7. Store Reply */}
            <TableCell className="text-center text-[13px] text-[#94a3b8]">
              Not replied Yet
            </TableCell>

            {/* 8. Action Toggle */}
            <TableCell className="text-center">
              <div className="flex justify-center items-center">
                 <label className="flex items-center cursor-pointer">
                    <div className="relative">
                       <input type="checkbox" className="sr-only" defaultChecked={true} />
                       <div className="block bg-[#008f89] w-10 h-[22px] rounded-full"></div>
                       <div className="dot absolute left-[2px] top-[2px] bg-white w-[18px] h-[18px] rounded-full transition transform translate-x-[18px]"></div>
                    </div>
                 </label>
              </div>
            </TableCell>
            
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default ReviewTable;
