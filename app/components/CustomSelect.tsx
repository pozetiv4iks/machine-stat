"use client";

import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Выберите...",
  label,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Прокручиваем к выбранному элементу при открытии
      setTimeout(() => {
        if (selectedOptionRef.current && dropdownRef.current) {
          selectedOptionRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = value && options.find((opt) => opt === value) ? value : placeholder;

  return (
    <div className="relative" ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent text-left flex items-center justify-between ${
          value ? "bg-[#E1F5C6] text-white" : "bg-white text-black"
        }`}
      >
        <span>
          {selectedOption}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${
            value ? "text-white" : "text-gray-500"
          } ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {options.map((option) => (
            <button
              key={option}
              ref={value === option ? selectedOptionRef : null}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-[#E1F5C6] transition-colors ${
                value === option ? "bg-[#E1F5C6] text-white" : "text-black"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

