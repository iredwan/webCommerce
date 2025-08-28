'use client';

import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';

/* ---------------- Utility Functions ---------------- */
const convert24to12 = (time24) => {
  if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) {
    return { hours: '12', minutes: '00', period: 'AM' };
  }

  const [hours24, minutes = '00'] = time24.split(':').map((s) => s.trim());
  const h = parseInt(hours24, 10);

  if (isNaN(h) || h < 0 || h > 23) return { hours: '12', minutes: '00', period: 'AM' };

  const hours12 = h % 12 || 12;
  return {
    hours: hours12.toString().padStart(2, '0'),
    minutes: minutes.padStart(2, '0'),
    period: h >= 12 ? 'PM' : 'AM',
  };
};

const convert12to24 = (hours12, minutes, period) => {
  let h = parseInt(hours12, 10);
  if (isNaN(h) || h < 1 || h > 12) h = 12;

  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;

  const m = parseInt(minutes, 10);
  const validMinutes = !isNaN(m) && m >= 0 && m < 60 ? m.toString().padStart(2, '0') : '00';

  return `${h.toString().padStart(2, '0')}:${validMinutes}`;
};

/* ---------------- TimeInput Component ---------------- */
const TimeInput = ({
  control,
  name,
  label = 'Select Time',
  required = false,
  disabled = false,
  className = '',
  defaultValue = '00:00',
}) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={{
        required: required ? `${label} is required` : false,
      }}
      render={({ field, fieldState }) => {
        const { value, onChange, onBlur } = field;
        const { error } = fieldState;

        // Initialize state with either the field value or default
        const timeValue = value || defaultValue;
        const { hours: initHours, minutes: initMinutes, period: initPeriod } = convert24to12(timeValue);

        const [hours, setHours] = useState(initHours);
        const [minutes, setMinutes] = useState(initMinutes);
        const [period, setPeriod] = useState(initPeriod);

        // Update local state when the form value changes externally
        useEffect(() => {
          if (value) {
            const { hours: h, minutes: m, period: p } = convert24to12(value);
            setHours(h);
            setMinutes(m);
            setPeriod(p);
          }
        }, [value, name]);

        // Update form value when local state changes
        const updateFormValue = () => {
          // If hours field is empty, don't submit an empty form value immediately
          // This allows the user to clear and type a new value
          if (hours === '') {
            return; // Don't update the form value while the user is typing
          }
          
          const hoursToUse = hours || '12'; // Default to 12 if completely empty
          const minutesToUse = minutes || '00'; // Default to 00 if empty
          
          const time24 = convert12to24(hoursToUse, minutesToUse, period);
          onChange(time24);
          onBlur(); // Trigger validation
        };

        // Debounce form updates to prevent excessive re-renders
        useEffect(() => {
          const handler = setTimeout(() => {
            // Only update form if we have actual hours input or if we've left the field (onBlur)
            if (hours !== '') {
              updateFormValue();
            }
          }, 300);
          
          return () => clearTimeout(handler);
        }, [hours, minutes, period]);

        return (
          <div className={`flex flex-col space-y-1 ${className} relative`}>
            <label
              htmlFor={`${name}-hours`}
              className="text-md font-medium text-gray-700 dark:text-gray-300"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="flex items-center space-x-2">
              {/* Hours */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{2}"
                minLength={1}
                maxLength={2}
                id={`${name}-hours`}
                value={hours}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length > 2) val = val.slice(-2);
                  setHours(val); // Keep raw input temporarily
                }}
                onBlur={() => {
                  // Only validate if there's actually input
                  if (hours.trim() !== '') {
                    let num = parseInt(hours, 10);
                    if (isNaN(num) || num < 1) num = 12;
                    if (num > 12) num = 12;
                    setHours(num.toString().padStart(2, '0'));
                  } else {
                    // If completely empty, set to placeholder instead of forcing a value
                    setHours('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    let num = parseInt(hours, 10) || 12;
                    num = num >= 12 ? 1 : num + 1;
                    setHours(num.toString().padStart(2, '0'));
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    let num = parseInt(hours, 10) || 12;
                    num = num <= 1 ? 12 : num - 1;
                    setHours(num.toString().padStart(2, '0'));
                  }
                  if (e.key === 'Tab' && !e.shiftKey) {
                    // Allow automatic focus to next field
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById(`${name}-minutes`)?.focus();
                  }
                }}
                disabled={disabled}
                aria-label="Hours"
                className="w-14 px-3 py-2 text-center border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <span className="mx-1 text-gray-700 dark:text-gray-300">:</span>

              {/* Minutes */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{2}"
                minLength={1}
                maxLength={2}
                id={`${name}-minutes`}
                value={minutes}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length > 2) val = val.slice(-2);
                  setMinutes(val); // Keep raw input temporarily
                }}
                onBlur={() => {
                  // Only validate if there's actually input
                  if (minutes.trim() !== '') {
                    let num = parseInt(minutes, 10);
                    if (isNaN(num) || num < 0) num = 0;
                    if (num > 59) num = 59;
                    setMinutes(num.toString().padStart(2, '0'));
                  } else {
                    // If completely empty, allow it as a temporary state
                    setMinutes('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    let num = parseInt(minutes, 10) || 0;
                    num = num >= 59 ? 0 : num + 1;
                    setMinutes(num.toString().padStart(2, '0'));
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    let num = parseInt(minutes, 10) || 0;
                    num = num <= 0 ? 59 : num - 1;
                    setMinutes(num.toString().padStart(2, '0'));
                  }
                  if (e.key === 'Tab' && e.shiftKey) {
                    // Allow automatic focus to previous field
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    document.querySelector(`select[aria-label="${name}-period"]`)?.focus();
                  }
                }}
                disabled={disabled}
                aria-label="Minutes"
                className="w-14 px-3 py-2 text-center border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />

              {/* AM/PM */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                onBlur={() => updateFormValue()}
                disabled={disabled}
                aria-label={`${name}-period`}
                className="w-20 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
            
            {/* Hidden container that validates on container blur */}
            <div 
              tabIndex="-1" 
              onBlur={(e) => {
                // Only run if we're not focusing on another element inside this component
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  // Validate entire time input when leaving component
                  if (hours === '') setHours('12');
                  if (minutes === '') setMinutes('00');
                  
                  // Ensure form gets updated with valid values
                  const time24 = convert12to24(hours || '12', minutes || '00', period);
                  onChange(time24);
                  onBlur();
                }
              }}
              className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
            />
          </div>
        );
      }}
    />
  );
};

export default TimeInput;
