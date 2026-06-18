import React from 'react';

const Tags = ({ product }) => {
  return (
    <>
      {product?.tag && product.tag.length !== 0 && (() => {
        let tagsArray = [];
        if (Array.isArray(product.tag)) {
          tagsArray = product.tag;
        } else if (typeof product.tag === 'string') {
          const trimmed = product.tag.trim();
          if (trimmed.startsWith('[')) {
            try {
              tagsArray = JSON.parse(trimmed);
            } catch (e) {
              tagsArray = trimmed.replace(/[\[\]"]/g, '').split(',').map(t => t.trim());
            }
          } else {
            tagsArray = trimmed.split(',').map(t => t.trim());
          }
        }

        if (!tagsArray || tagsArray.length === 0) return null;

        return (
          <div className="flex flex-row items-center">
            <div>
               <span className="text-gray-800 font-semibold text-sm mr-2">Net Quantity : </span>
            </div>
            {tagsArray.map((t, i) => (
              <span
                key={i + 1}
                className="bg-gray-50 mr-2 border text-gray-600 rounded-full inline-flex items-center justify-center px-3 py-1 text-xs font-semibold font-serif mt-2"
              >
                {t}
              </span>
            ))}
          </div>
        );
      })()}
    </>
  );
};

export default Tags;
