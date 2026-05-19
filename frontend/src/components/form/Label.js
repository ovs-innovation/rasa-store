import React from "react";

const Label = ({ label, required }) => {
  return (
    <label className="block text-gray-500 font-medium text-sm leading-none mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  );
};

export default Label;
