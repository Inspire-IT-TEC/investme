export function formatCpf(cpf: string): string {
  // Remove all non-digits
  const cleaned = cpf.replace(/\D/g, '');
  
  // Apply CPF mask: XXX.XXX.XXX-XX
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
  if (match) {
    return !match[2] ? match[1] 
      : !match[3] ? `${match[1]}.${match[2]}`
      : !match[4] ? `${match[1]}.${match[2]}.${match[3]}`
      : `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
}

export function formatCnpj(cnpj: string): string {
  // Remove all non-digits
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Apply CNPJ mask: XX.XXX.XXX/XXXX-XX
  const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
  if (match) {
    return !match[2] ? match[1]
      : !match[3] ? `${match[1]}.${match[2]}`
      : !match[4] ? `${match[1]}.${match[2]}.${match[3]}`
      : !match[5] ? `${match[1]}.${match[2]}.${match[3]}/${match[4]}`
      : `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
  }
  return cnpj;
}

export function formatCep(cep: string): string {
  // Remove all non-digits
  const cleaned = cep.replace(/\D/g, '');
  
  // Apply CEP mask: XXXXX-XXX
  const match = cleaned.match(/^(\d{0,5})(\d{0,3})$/);
  if (match) {
    return !match[2] ? match[1] : `${match[1]}-${match[2]}`;
  }
  return cep;
}

export function formatPhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Apply phone mask: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (match) {
    if (cleaned.length <= 10) {
      // Landline format: (XX) XXXX-XXXX
      const landlineMatch = cleaned.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/);
      if (landlineMatch) {
        return !landlineMatch[2] ? landlineMatch[1] 
          : !landlineMatch[3] ? `(${landlineMatch[1]}) ${landlineMatch[2]}`
          : `(${landlineMatch[1]}) ${landlineMatch[2]}-${landlineMatch[3]}`;
      }
    } else {
      // Mobile format: (XX) XXXXX-XXXX
      return !match[2] ? match[1]
        : !match[3] ? `(${match[1]}) ${match[2]}`
        : `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  return phone;
}

export function formatCurrency(value: string): string {
  // Remove all non-digits and decimal separators
  const cleaned = value.replace(/[^\d]/g, '');
  
  if (!cleaned) return '';
  
  // Convert to number (considering cents)
  const numericValue = parseFloat(cleaned) / 100;
  
  // Format as currency
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericValue);
}

export function validateCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  
  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

export function validateCnpj(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  
  // Check for known invalid CNPJs
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validate check digits
  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Deve conter pelo menos um símbolo');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCep(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

export function parseCurrencyToNumber(currency: string): number {
  return parseFloat(currency.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

export function formatNumberToDisplay(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
