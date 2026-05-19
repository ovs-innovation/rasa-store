import React, { useState } from "react";
import Label from "@components/form/Label";
import useGetSetting from "@hooks/useGetSetting";
import { FiEye, FiEyeOff } from "react-icons/fi";

const InputArea = ({
  name,
  label,
  type,
  Icon,
  register,
  readOnly,
  defaultValue,
  autocomplete,
  placeholder,
  required = true,
  pattern, // Added pattern as a prop
  patternMessage = "Invalid input", // Optional: Custom error message for pattern validation
  maxLength,
  onInput,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  return (
    <>
      <Label label={label} required={required} />
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-800 focus-within:text-gray-900 sm:text-base">
              <Icon />
            </span>
          </div>
        )}
        <input
          {...register(`${name}`, {
            required: required ? `${label} is required!` : false,
            pattern: pattern
              ? {
                  value: pattern,
                  message: patternMessage, // Show a custom error message for pattern mismatch
                }
              : undefined,
          })}
          type={isPassword && showPassword ? "text" : type}
          name={name}
          readOnly={readOnly}
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete={autocomplete}
          maxLength={maxLength}
          onInput={onInput}
          className={`$${
            Icon ? "py-2 pl-10" : "py-2 px-4 md:px-5"
          } w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-white border-gray-200 focus:outline-none focus:border-${(useGetSetting()?.storeCustomizationSetting?.theme?.color) || 'green'}-500 h-11 md:h-12 $${
            readOnly ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
          }`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
    </>
  );
};

export default InputArea;
