import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | number;
  onChange?: (value: string) => void;
}

const formatCurrency = (value: string) => {
  // Remove all non-numeric characters except dots and commas
  const numbers = value.replace(/[^\d.,]/g, '');
  
  // Convert to number and format
  const numValue = parseFloat(numbers.replace(',', '.')) || 0;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

const parseCurrency = (formattedValue: string): string => {
  // Remove currency symbol and thousand separators, keep decimal
  return formattedValue
    .replace(/[^\d,]/g, '')
    .replace(',', '.');
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