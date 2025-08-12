"use client";

import { Combobox } from "@headlessui/react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

export default function CustomSelect({
  options = [],
  selected,
  setSelected,
  label,
  error,
  placeholder = "Type to search...",
}) {
  const [query, setQuery] = useState("");
  const comboboxRef = useRef(null);

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.toLowerCase().includes(query.toLowerCase())
        );

  const handleInputClick = () => {
    setQuery("");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full" ref={comboboxRef}>
      <Combobox value={selected} onChange={setSelected}>
        {label && (
          <Combobox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </Combobox.Label>
        )}

        <div className="relative">
          <div className="relative w-full cursor-default overflow-visible">
            <Combobox.Input
              className="w-full px-4 py-2.5 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(option) => option}
              onClick={handleInputClick}
              placeholder={placeholder}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <FaChevronDown className="h-4 w-4 text-gray-400" />
            </Combobox.Button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {filteredOptions.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 text-base shadow-lg ring-1 ring-neutral-300 ring-opacity-5 focus:outline-none">
              {filteredOptions.map((option) => (
                <Combobox.Option
                  key={option}
                  value={option}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active
                        ? "rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        : "text-gray-900 dark:text-gray-100"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {option}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <FaCheck className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
