import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'gradient';
}

interface ModernCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ModernCardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ModernCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModernCard({ children, className, variant = 'default' }: ModernCardProps) {
  return (
    <div className={cn(
      "modern-card",
      {
        "shadow-lg": variant === 'elevated',
        "gradient-secondary border-0": variant === 'gradient',
      },
      className
    )}>
      {children}
    </div>
  );
}

export function ModernCardHeader({ children, className }: ModernCardHeaderProps) {
  return (
    <div className={cn("modern-card-header", className)}>
      {children}
    </div>
  );
}

export function ModernCardContent({ children, className }: ModernCardContentProps) {
  return (
    <div className={cn("modern-card-content", className)}>
      {children}
    </div>
  );
}

export function ModernCardFooter({ children, className }: ModernCardFooterProps) {
  return (
    <div className={cn("modern-card-footer", className)}>
      {children}
    </div>
  );
}