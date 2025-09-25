import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | number;
  onChange?: (value: string) => void;
}

const formatCurrency = (value: string) => {
  // Remove all non-numeric characters except dots and commas
  const numbers = value.replace(/[^\d.,]/g, '');
  
  // Handle empty or invalid input
  if (!numbers || numbers === '.' || numbers === ',') {
    return 'R$ 0,00';
  }
  
  // Handle large numbers safely by working with strings
  let cleanNumber = numbers.replace(',', '.');
  
  // Split into integer and decimal parts
  const parts = cleanNumber.split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = (parts[1] || '00').padEnd(2, '0').substring(0, 2);
  
  // Format integer part with thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `R$ ${formattedInteger},${decimalPart}`;
};

const parseCurrency = (formattedValue: string): string => {
  // Remove currency symbol and thousand separators, keep decimal
  let cleaned = formattedValue
    .replace(/[^\d,]/g, '')
    .replace(',', '.');
  
  // Handle edge cases
  if (!cleaned || cleaned === '.') {
    return '0';
  }
  
  return cleaned;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // If user is clearing the field
      if (inputValue === '') {
        onChange?.('');
        return;
      }
      
      // Parse and reformat the currency
      const numericValue = parseCurrency(inputValue);
      const formatted = formatCurrency(numericValue);
      
      onChange?.(numericValue);
      
      // Update the display value
      e.target.value = formatted;
    };

    const displayValue = value ? formatCurrency(value.toString()) : '';

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="R$ 0,00"
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";