import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useLocation } from "wouter";

interface ValuationButtonProps {
  companyId: number;
  className?: string;
}

export const ValuationButton = ({ companyId, className }: ValuationButtonProps) => {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/companies/${companyId}/valuation`);
  };

  return (
    <Button
      onClick={handleClick}
      className={`bg-green-600 hover:bg-green-700 ${className || ""}`}
    >
      <Calculator className="w-4 h-4 mr-2" />
      Valuation
    </Button>
  );
};

export default ValuationButton;