import { forwardRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | number;
  onChange?: (value: string) => void;
}

const formatDisplayValue = (value: string): string => {
  // Remove all non-numeric characters except dots and commas
  const cleaned = value.replace(/[^\d,]/g, '');
  
  if (!cleaned) {
    return '';
  }
  
  // Split by comma to handle decimal part
  const parts = cleaned.split(',');
  const integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  // Format integer part with thousand separators (dots)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Combine with decimal part (limit to 2 decimal places)
  if (decimalPart.length > 0) {
    const limitedDecimal = decimalPart.substring(0, 2);
    return `${formattedInteger},${limitedDecimal}`;
  }
  
  return formattedInteger;
};

const parseToNumericString = (formattedValue: string): string => {
  // Remove thousand separators (dots) but keep decimal comma
  let cleaned = formattedValue.replace(/\./g, '');
  
  // Convert decimal comma to dot for JavaScript parsing
  cleaned = cleaned.replace(',', '.');
  
  // Handle edge cases
  if (!cleaned || cleaned === '.' || cleaned === '') {
    return '0';
  }
  
  return cleaned;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    
    // Update display value when prop value changes
    useEffect(() => {
      if (value !== undefined && value !== null) {
        const stringValue = value.toString();
        if (stringValue !== '0' && stringValue !== '') {
          // Format the value for display
          const formatted = formatDisplayValue(stringValue.replace('.', ','));
          setDisplayValue(formatted);
        } else {
          setDisplayValue('');
        }
      } else {
        setDisplayValue('');
      }
    }, [value]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow only numbers, commas, and dots
      const cleanInput = inputValue.replace(/[^\d.,]/g, '');
      
      // If user is clearing the field
      if (cleanInput === '') {
        setDisplayValue('');
        onChange?.('0');
        return;
      }
      
      // Format for display
      const formatted = formatDisplayValue(cleanInput);
      setDisplayValue(formatted);
      
      // Parse to numeric string for onChange
      const numericValue = parseToNumericString(formatted);
      onChange?.(numericValue);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="0,00"
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";