'use client';

import { useFormContext, Controller } from 'react-hook-form';
import TimeInput from './TimeInput';

/**
 * TimeInputWithForm component for use with react-hook-form's FormProvider
 * This component automatically connects with the parent form context
 */
const TimeInputWithForm = ({
  name,
  label = 'Select Time',
  required = false,
  disabled = false,
  className = '',
  defaultValue = '00:00',
}) => {
  // Get the form context from the parent FormProvider
  const { control } = useFormContext();

  return (
    <TimeInput
      control={control}
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
      defaultValue={defaultValue}
    />
  );
};

export default TimeInputWithForm;
