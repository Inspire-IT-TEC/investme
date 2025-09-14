import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator, TrendingUp, FileText, Save, Play, Trash2, ArrowLeft, Download, Building2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// DCF Form Schema
const dcfFormSchema = z.object({
  projectionYears: z.number().min(3).max(15).default(5),
  revenues: z.array(z.number()),
  costs: z.array(z.number()),
  operatingExpenses: z.array(z.number()),
  capex: z.array(z.number()),
  workingCapitalChange: z.array(z.number()),
  costOfEquity: z.number().min(0).max(1),
  costOfDebt: z.number().min(0).max(1),
  taxRate: z.number().min(0).max(1),
  debtWeight: z.number().min(0).max(1),
  equityWeight: z.number().min(0).max(1),
  terminalGrowthRate: z.number().min(0).max(0.1),
  netDebt: z.number().optional(),
  sharesOutstanding: z.number().optional(),
});

// Multiples Form Schema
const multiplesFormSchema = z.object({
  peLuMultiple: z.number().optional(),
  evEbitdaMultiple: z.number().optional(),
  pvVpMultiple: z.number().optional(),
  evRevenueMultiple: z.number().optional(),
  netIncome: z.number().optional(),
  ebitda: z.number().optional(),
  bookValue: z.number().optional(),
  revenue: z.number().optional(),
  enterpriseValue: z.number().optional(),
  liquidityDiscount: z.number().min(0).max(1).default(0),
  controlPremium: z.number().min(0).max(1).default(0),
  comparablesSources: z.string().optional(),
});

// Componente para input de valor com máscara R$
const CurrencyMultipleInput = ({ field, placeholder }: { field: any; placeholder?: string }) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (field.value) {
      setDisplayValue(field.value.toString());
    }
  }, [field.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, '');
    setDisplayValue(value);
    const numericValue = parseFloat(value.replace(',', '.')) || undefined;
    field.onChange(numericValue);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-2.5 text-sm text-gray-500">R$</span>
      <Input
        type="text"
        className="pl-10"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        data-testid={`input-${field.name}`}
      />
    </div>
  );
};

const ValuationPage = () => {
  const [, params] = useRoute("/companies/:companyId/valuation/:valuationId?");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeMethod, setActiveMethod] = useState<"dcf" | "multiples">("dcf");
  const [calculationResults, setCalculationResults] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const companyId = params?.companyId ? parseInt(params.companyId) : null;
  const valuationId = params?.valuationId ? parseInt(params.valuationId) : null;

  // Fetch company data
  const { data: company } = useQuery({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  // Fetch existing valuation if editing
  const { data: existingValuation, isLoading: valuationLoading } = useQuery({
    queryKey: [`/api/valuations/${valuationId}`],
    enabled: !!valuationId,
  });

  // DCF Form
  const dcfForm = useForm({
    resolver: zodResolver(dcfFormSchema),
    defaultValues: {
      projectionYears: 5,
      revenues: [0, 0, 0, 0, 0],
      costs: [0, 0, 0, 0, 0],
      operatingExpenses: [0, 0, 0, 0, 0],
      capex: [0, 0, 0, 0, 0],
      workingCapitalChange: [0, 0, 0, 0, 0],
      costOfEquity: 0.12,
      costOfDebt: 0.06,
      taxRate: 0.34,
      debtWeight: 0.3,
      equityWeight: 0.7,
      terminalGrowthRate: 0.025,
      netDebt: 0,
      sharesOutstanding: 1000000,
    },
  });

  // Multiples Form
  const multiplesForm = useForm({
    resolver: zodResolver(multiplesFormSchema),
    defaultValues: {
      liquidityDiscount: 0,
      controlPremium: 0,
    },
  });

  // Create/Update Valuation Mutation
  const createValuationMutation = useMutation({
    mutationFn: async (data: any) => {
      if (valuationId) {
        return apiRequest("PUT", `/api/valuations/${valuationId}`, data);
      } else {
        return apiRequest("POST", `/api/companies/${companyId}/valuations`, data);
      }
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({ title: "Valuation salvo com sucesso" });
      if (!valuationId) {
        setLocation(`/companies/${companyId}/valuation/${data.id}`);
      }
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/valuations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/valuations/latest`] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar valuation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate DCF Mutation
  const calculateDcfMutation = useMutation({
    mutationFn: async (dcfData: any) => {
      return apiRequest("POST", `/api/valuations/${valuationId}/calculate/dcf`, { dcfData });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setCalculationResults(data);
      toast({ title: "Cálculo DCF realizado com sucesso" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cálculo DCF",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate Multiples Mutation
  const calculateMultiplesMutation = useMutation({
    mutationFn: async (multiplesData: any) => {
      return apiRequest("POST", `/api/valuations/${valuationId}/calculate/multiples`, { multiplesData });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setCalculationResults(data);
      toast({ title: "Cálculo por múltiplos realizado com sucesso" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cálculo por múltiplos",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete Valuation Mutation
  const deleteValuationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/valuations/${valuationId}`);
    },
    onSuccess: () => {
      toast({ title: "Valuation excluído com sucesso" });
      setLocation(`/companies/${companyId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir valuation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Load existing valuation data
  useEffect(() => {
    if (existingValuation) {
      setActiveMethod((existingValuation as any).method);
      
      if ((existingValuation as any).method === "dcf" && (existingValuation as any).dcfData) {
        dcfForm.reset((existingValuation as any).dcfData);
      } else if ((existingValuation as any).method === "multiples" && (existingValuation as any).multiplesData) {
        multiplesForm.reset((existingValuation as any).multiplesData);
      }
    }
  }, [existingValuation]);

  // Save as draft
  const saveDraft = async () => {
    const data = {
      method: activeMethod,
      status: "draft",
      ...(activeMethod === "dcf" ? { dcfData: dcfForm.getValues() } : { multiplesData: multiplesForm.getValues() }),
    };
    createValuationMutation.mutate(data);
  };

  // Perform calculation
  const calculate = async () => {
    if (!valuationId) {
      // Create valuation first
      const data = {
        method: activeMethod,
        status: "draft",
        ...(activeMethod === "dcf" ? { dcfData: dcfForm.getValues() } : { multiplesData: multiplesForm.getValues() }),
      };
      createValuationMutation.mutate(data);
      return;
    }

    if (activeMethod === "dcf") {
      calculateDcfMutation.mutate(dcfForm.getValues());
    } else {
      calculateMultiplesMutation.mutate(multiplesForm.getValues());
    }
  };

  // Generate array inputs for DCF projections
  const generateArrayInputs = (fieldName: string, label: string, years: number) => {
    return (
      <div className="space-y-2">
        <FormLabel className="text-sm font-medium">{label}</FormLabel>
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-5'}`}>
          {Array.from({ length: years }, (_, i) => (
            <FormField
              key={i}
              control={dcfForm.control}
              name={`${fieldName}.${i}` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-gray-600">Ano {i + 1}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      {...field}
                      onChange={(value) => field.onChange(parseFloat(value) || 0)}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  // Componente das tabs mobile
  const MobileTabs = () => (
    <div className="bg-white rounded-lg border border-gray-200 sticky top-16 z-10">
      <div className="overflow-x-auto">
        <div className="flex space-x-1 p-2 min-w-max">
          {[
            { value: 'dcf', label: 'DCF', icon: TrendingUp },
            { value: 'multiples', label: 'Múltiplos', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.value}
                variant={activeMethod === tab.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveMethod(tab.value as "dcf" | "multiples")}
                className={`whitespace-nowrap flex items-center space-x-1 flex-shrink-0 ${
                  activeMethod === tab.value 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                data-testid={`tab-${tab.value}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Componente do conteúdo das tabs
  const TabContent = ({ tabValue, children }: { tabValue: string; children: React.ReactNode }) => {
    if (isMobile && activeMethod !== tabValue) return null;
    return <div className="space-y-4">{children}</div>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (valuationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando valuation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile-First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation(`/companies/${companyId}`)}
              size="sm"
              className="p-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 mx-3 min-w-0">
              <h1 className={`font-bold text-gray-900 truncate ${
                isMobile ? 'text-lg' : 'text-xl'
              }`} data-testid="text-valuation-title">
                Valuation
              </h1>
              {(company as any)?.razaoSocial && (
                <p className="text-sm text-gray-600 truncate" data-testid="text-company-name">
                  {(company as any).razaoSocial}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {!isMobile && (
                <>
                  {valuationId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteValuationMutation.mutate()}
                      disabled={deleteValuationMutation.isPending}
                      data-testid="button-delete"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={saveDraft} 
                    disabled={createValuationMutation.isPending}
                    data-testid="button-save-draft"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                </>
              )}
              
              <Button 
                onClick={calculate} 
                size="sm"
                disabled={calculateDcfMutation.isPending || calculateMultiplesMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-calculate"
              >
                <Play className="w-4 h-4" />
                {!isMobile && <span className="ml-1">Calcular</span>}
              </Button>
            </div>
          </div>
          
          {/* Ações extras no mobile */}
          {isMobile && (
            <div className="mt-3 flex space-x-2">
              {valuationId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteValuationMutation.mutate()}
                  disabled={deleteValuationMutation.isPending}
                  className="flex-1"
                  data-testid="button-delete-mobile"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={saveDraft} 
                disabled={createValuationMutation.isPending}
                className="flex-1"
                data-testid="button-save-draft-mobile"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Rascunho
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Container principal */}
      <div className={`${
        isMobile ? 'px-4 py-4' : 'container mx-auto p-6'
      } space-y-4`}>
        
        {/* Tabs Mobile */}
        {isMobile && <MobileTabs />}
        
        {/* Layout responsivo */}
        <div className={isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
          
          {/* Formulários principais */}
          <div className={isMobile ? 'space-y-4' : 'lg:col-span-2 space-y-6'}>
            {isMobile ? (
              // Layout mobile - uma tab por vez
              <>
                <TabContent tabValue="dcf">
                  <Card data-testid="card-dcf-form">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        DCF - Fluxo de Caixa Descontado
                      </CardTitle>
                      <CardDescription>
                        Método de valuation baseado em fluxos de caixa futuros
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...dcfForm}>
                        <div className="space-y-6">
                          {/* Anos de projeção */}
                          <FormField
                            control={dcfForm.control}
                            name="projectionYears"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anos de Projeção</FormLabel>
                                <FormControl>
                                  <Select
                                    value={field.value.toString()}
                                    onValueChange={(value) => {
                                      const years = parseInt(value);
                                      field.onChange(years);
                                      // Reset arrays to match new projection years
                                      const emptyArray = Array(years).fill(0);
                                      dcfForm.setValue("revenues", emptyArray);
                                      dcfForm.setValue("costs", emptyArray);
                                      dcfForm.setValue("operatingExpenses", emptyArray);
                                      dcfForm.setValue("capex", emptyArray);
                                      dcfForm.setValue("workingCapitalChange", emptyArray);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                          {year} anos
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Separator />

                          {/* Projeções financeiras */}
                          <div className="space-y-4">
                            <h3 className="text-base font-semibold">Projeções Financeiras</h3>
                            {generateArrayInputs("revenues", "Receitas", dcfForm.getValues("projectionYears"))}
                            {generateArrayInputs("costs", "Custos", dcfForm.getValues("projectionYears"))}
                            {generateArrayInputs("operatingExpenses", "Despesas Operacionais", dcfForm.getValues("projectionYears"))}
                            {generateArrayInputs("capex", "CAPEX", dcfForm.getValues("projectionYears"))}
                            {generateArrayInputs("workingCapitalChange", "Variação Capital de Giro", dcfForm.getValues("projectionYears"))}
                          </div>

                          <Separator />

                          {/* Custo de capital */}
                          <div className="space-y-4">
                            <h3 className="text-base font-semibold">Custo de Capital</h3>
                            <div className="space-y-3">
                              <FormField
                                control={dcfForm.control}
                                name="costOfEquity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Custo do Capital Próprio (Ke)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.12"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dcfForm.control}
                                name="costOfDebt"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Custo da Dívida (Kd)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.06"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dcfForm.control}
                                name="taxRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Alíquota de IR</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.34"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dcfForm.control}
                                name="terminalGrowthRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Taxa de Crescimento Perpetuidade</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.025"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </Form>
                    </CardContent>
                  </Card>
                </TabContent>

                <TabContent tabValue="multiples">
                  <Card data-testid="card-multiples-form">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Múltiplos de Mercado
                      </CardTitle>
                      <CardDescription>
                        Método de valuation baseado em múltiplos de empresas comparáveis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...multiplesForm}>
                        <div className="space-y-6">
                          {/* Múltiplos com máscara de valor */}
                          <div className="space-y-4">
                            <h3 className="text-base font-semibold">Múltiplos Comparáveis</h3>
                            <div className="space-y-3">
                              <FormField
                                control={multiplesForm.control}
                                name="peLuMultiple"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>P/L (Preço/Lucro)</FormLabel>
                                    <FormControl>
                                      <CurrencyMultipleInput 
                                        field={field} 
                                        placeholder="15,50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="evEbitdaMultiple"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>EV/EBITDA</FormLabel>
                                    <FormControl>
                                      <CurrencyMultipleInput 
                                        field={field} 
                                        placeholder="8,50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="pvVpMultiple"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>P/VP (Preço/Valor Patrimonial)</FormLabel>
                                    <FormControl>
                                      <CurrencyMultipleInput 
                                        field={field} 
                                        placeholder="2,50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="evRevenueMultiple"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>EV/Receita</FormLabel>
                                    <FormControl>
                                      <CurrencyMultipleInput 
                                        field={field} 
                                        placeholder="3,20"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Dados financeiros */}
                          <div className="space-y-4">
                            <h3 className="text-base font-semibold">Dados Financeiros da Empresa</h3>
                            <div className="space-y-3">
                              <FormField
                                control={multiplesForm.control}
                                name="netIncome"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lucro Líquido</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="ebitda"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>EBITDA</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="bookValue"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Valor Patrimonial</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="revenue"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Receita</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Ajustes */}
                          <div className="space-y-4">
                            <h3 className="text-base font-semibold">Ajustes</h3>
                            <div className="space-y-3">
                              <FormField
                                control={multiplesForm.control}
                                name="liquidityDiscount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Desconto de Liquidez (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) / 100 || 0)}
                                        value={field.value ? (field.value * 100).toString() : ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="controlPremium"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Prêmio de Controle (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) / 100 || 0)}
                                        value={field.value ? (field.value * 100).toString() : ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Fontes */}
                          <div className="space-y-4">
                            <h3 className="text-base font-semibold">Fontes dos Múltiplos</h3>
                            <FormField
                              control={multiplesForm.control}
                              name="comparablesSources"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fontes dos Dados</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ex: B3, Bloomberg, Capital IQ..."
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </Form>
                    </CardContent>
                  </Card>
                </TabContent>
              </>
            ) : (
              // Layout desktop - tabs tradicionais
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Método de Valuation
                  </CardTitle>
                  <CardDescription>
                    Selecione o método de valuation e insira os dados necessários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeMethod} onValueChange={(value) => setActiveMethod(value as "dcf" | "multiples")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="dcf">DCF (Fluxo de Caixa Descontado)</TabsTrigger>
                      <TabsTrigger value="multiples">Múltiplos de Mercado</TabsTrigger>
                    </TabsList>

                    {/* DCF Tab */}
                    <TabsContent value="dcf" className="space-y-6">
                      <Form {...dcfForm}>
                        <div className="space-y-6">
                          {/* Projection Years */}
                          <FormField
                            control={dcfForm.control}
                            name="projectionYears"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anos de Projeção</FormLabel>
                                <FormControl>
                                  <Select
                                    value={field.value.toString()}
                                    onValueChange={(value) => {
                                      const years = parseInt(value);
                                      field.onChange(years);
                                      // Reset arrays to match new projection years
                                      const emptyArray = Array(years).fill(0);
                                      dcfForm.setValue("revenues", emptyArray);
                                      dcfForm.setValue("costs", emptyArray);
                                      dcfForm.setValue("operatingExpenses", emptyArray);
                                      dcfForm.setValue("capex", emptyArray);
                                      dcfForm.setValue("workingCapitalChange", emptyArray);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                          {year} anos
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Separator />

                          {/* Financial Projections */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Projeções Financeiras (em R$)</h3>
                            {generateArrayInputs("revenues", "Receitas", dcfForm.getValues("projectionYears"))}
                            {generateArrayInputs("costs", "Custos", dcfForm.getValues("projectionYears"))}
                            {generateArrayInputs("operatingExpenses", "Despesas Operacionais", dcfForm.getValues("projectionYears"))}
                            {generateArrayInputs("capex", "CAPEX", dcfForm.getValues("projectionYears"))}
                            {generateArrayInputs("workingCapitalChange", "Variação Capital de Giro", dcfForm.getValues("projectionYears"))}
                          </div>

                          <Separator />

                          {/* Cost of Capital */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Custo de Capital</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={dcfForm.control}
                                name="costOfEquity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Custo do Capital Próprio (Ke)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.12"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dcfForm.control}
                                name="costOfDebt"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Custo da Dívida (Kd)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.06"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dcfForm.control}
                                name="taxRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Alíquota de IR</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.34"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dcfForm.control}
                                name="terminalGrowthRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Taxa de Crescimento Perpetuidade</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.025"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={dcfForm.control}
                                name="debtWeight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>% Dívida</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.30"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dcfForm.control}
                                name="equityWeight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>% Patrimônio Líquido</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.70"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Additional Data */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Dados Adicionais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={dcfForm.control}
                                name="netDebt"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Dívida Líquida (R$)</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dcfForm.control}
                                name="sharesOutstanding"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ações em Circulação</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="1"
                                        placeholder="1000000"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </Form>
                    </TabsContent>

                    {/* Multiples Tab */}
                    <TabsContent value="multiples" className="space-y-6">
                      <Form {...multiplesForm}>
                        <div className="space-y-6">
                          {/* Multiples com máscaras */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Múltiplos Comparáveis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={multiplesForm.control}
                                name="peLuMultiple"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>P/L (Preço/Lucro)</FormLabel>
                                    <FormControl>
                                      <CurrencyMultipleInput 
                                        field={field} 
                                        placeholder="15,50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="evEbitdaMultiple"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>EV/EBITDA</FormLabel>
                                    <FormControl>
                                      <CurrencyMultipleInput 
                                        field={field} 
                                        placeholder="8,50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="pvVpMultiple"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>P/VP (Preço/Valor Patrimonial)</FormLabel>
                                    <FormControl>
                                      <CurrencyMultipleInput 
                                        field={field} 
                                        placeholder="2,50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="evRevenueMultiple"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>EV/Receita</FormLabel>
                                    <FormControl>
                                      <CurrencyMultipleInput 
                                        field={field} 
                                        placeholder="3,20"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Financial Data */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Dados Financeiros da Empresa (R$)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={multiplesForm.control}
                                name="netIncome"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lucro Líquido</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="ebitda"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>EBITDA</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="bookValue"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Valor Patrimonial</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="revenue"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Receita</FormLabel>
                                    <FormControl>
                                      <CurrencyInput
                                        {...field}
                                        onChange={(value) => field.onChange(parseFloat(value) || undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Adjustments */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Ajustes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={multiplesForm.control}
                                name="liquidityDiscount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Desconto de Liquidez (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) / 100 || 0)}
                                        value={field.value ? (field.value * 100).toString() : ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={multiplesForm.control}
                                name="controlPremium"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Prêmio de Controle (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) / 100 || 0)}
                                        value={field.value ? (field.value * 100).toString() : ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Sources */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Fontes dos Múltiplos</h3>
                            <FormField
                              control={multiplesForm.control}
                              name="comparablesSources"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fontes dos Dados</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ex: B3, Bloomberg, Capital IQ..."
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Resultados */}
          <div className={isMobile ? 'space-y-4' : 'space-y-4'}>
            {calculationResults ? (
              <Card data-testid="card-results">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Resultados
                  </CardTitle>
                  <CardDescription>
                    Resultado do cálculo de valuation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calculationResults.enterpriseValue && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor da Empresa</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(calculationResults.enterpriseValue)}
                      </p>
                    </div>
                  )}
                  
                  {calculationResults.equityValue && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor do Equity</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(calculationResults.equityValue)}
                      </p>
                    </div>
                  )}
                  
                  {calculationResults.pricePerShare && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Preço por Ação</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(calculationResults.pricePerShare)}
                      </p>
                    </div>
                  )}
                  
                  <Badge variant="default" className="w-full justify-center">
                    Método: {activeMethod.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ) : (
              <Card data-testid="card-no-results">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Cálculo de Valuation
                  </CardTitle>
                  <CardDescription>
                    Preencha os dados e execute o cálculo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Preencha os dados do método escolhido e clique em "Calcular" para obter a avaliação da empresa.
                  </p>
                  <Button
                    onClick={calculate}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={calculateDcfMutation.isPending || calculateMultiplesMutation.isPending}
                    data-testid="button-calculate-sidebar"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calcular Valuation
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Status card */}
            <Card data-testid="card-status">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Método:</span>
                  <Badge variant="outline">{activeMethod.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={(existingValuation as any)?.status === 'completed' ? 'default' : 'secondary'}>
                    {(existingValuation as any)?.status === 'completed' ? 'Concluído' : 'Rascunho'}
                  </Badge>
                </div>
                {(existingValuation as any)?.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Criado:</span>
                    <span className="text-sm font-medium">
                      {new Date((existingValuation as any).createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationPage;