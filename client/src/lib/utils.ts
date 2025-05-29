import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR');
}

export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
}

export function formatCurrencyInput(value: string): string {
  // Remove everything except digits and decimal separator
  const numericValue = value.replace(/[^\d]/g, '');
  
  if (!numericValue) return '';
  
  // Convert to number and format
  const floatValue = parseFloat(numericValue) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(floatValue);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

export function getStatusColor(status: string): string {
  const statusColors = {
    pendente_analise: 'bg-gray-100 text-gray-800',
    pendente: 'bg-gray-100 text-gray-800',
    em_analise: 'bg-yellow-100 text-yellow-800',
    aprovada: 'bg-green-100 text-green-800',
    reprovada: 'bg-red-100 text-red-800',
    incompleto: 'bg-orange-100 text-orange-800',
  };
  
  return statusColors[status as keyof typeof statusColors] || statusColors.pendente;
}

export function getStatusLabel(status: string): string {
  const statusLabels = {
    pendente_analise: 'Pendente de Análise',
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    aprovada: 'Aprovada',
    reprovada: 'Reprovada',
    incompleto: 'Incompleto',
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  if (filename) {
    link.download = filename;
  }
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject(new Error('Failed to copy text'));
      }
      document.body.removeChild(textArea);
    });
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
