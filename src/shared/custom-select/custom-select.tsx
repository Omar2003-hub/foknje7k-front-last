import React from "react";

interface CustomSelectProps {
  label?: string;
  options: Array<{ value: string | number; label: string }>;
  width?: string;
  iconPrefix?: React.ReactNode;
  customStyle?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  placeholder?: string;
  labelClasses?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options = [],
  width = "w-full",
  iconPrefix,
  customStyle,
  value,
  onChange,
  name,
  placeholder,
  labelClasses,
}) => {
  return (
    <div className={`relative ${width} ${customStyle}`}>
      <label className={`${labelClasses ? labelClasses : "block text-title text-xs font-montserrat_regular mb-2"}`}>
        {label}
      </label>
      <div className="relative">
        {iconPrefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {iconPrefix}
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`border text-xs font-montserrat_regular active:border-border border-border h-12 rounded-lg pl-6 w-full pr-8 ${
            iconPrefix ? "pl-12" : ""
          } appearance-none bg-transparent`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.292 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CustomSelect;
