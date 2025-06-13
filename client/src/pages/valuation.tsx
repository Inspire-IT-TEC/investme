import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator, TrendingUp, FileText, Save, Play, Trash2, ArrowLeft, Download } from "lucide-react";
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

const ValuationPage = () => {
  const [, params] = useRoute("/companies/:companyId/valuation/:valuationId?");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeMethod, setActiveMethod] = useState<"dcf" | "multiples">("dcf");
  const [calculationResults, setCalculationResults] = useState<any>(null);

  const companyId = params?.companyId ? parseInt(params.companyId) : null;
  const valuationId = params?.valuationId ? parseInt(params.valuationId) : null;

  // Fetch company data
  const { data: company } = useQuery({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId,
  });

  // Fetch existing valuation if editing
  const { data: existingValuation, isLoading: valuationLoading } = useQuery({
    queryKey: ["/api/valuations", valuationId],
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
        return apiRequest(`/api/valuations/${valuationId}`, {
          method: "PUT",
          body: data,
        });
      } else {
        return apiRequest(`/api/companies/${companyId}/valuations`, {
          method: "POST",
          body: data,
        });
      }
    },
    onSuccess: (data) => {
      toast({ title: "Valuation salvo com sucesso" });
      if (!valuationId) {
        setLocation(`/companies/${companyId}/valuation/${data.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "valuations"] });
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
      return apiRequest(`/api/valuations/${valuationId}/calculate/dcf`, {
        method: "POST",
        body: { dcfData },
      });
    },
    onSuccess: (data) => {
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
      return apiRequest(`/api/valuations/${valuationId}/calculate/multiples`, {
        method: "POST",
        body: { multiplesData },
      });
    },
    onSuccess: (data) => {
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
      return apiRequest(`/api/valuations/${valuationId}`, {
        method: "DELETE",
      });
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
      setActiveMethod(existingValuation.method);
      
      if (existingValuation.method === "dcf" && existingValuation.dcfData) {
        dcfForm.reset(existingValuation.dcfData);
      } else if (existingValuation.method === "multiples" && existingValuation.multiplesData) {
        multiplesForm.reset(existingValuation.multiplesData);
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
    const currentValues = dcfForm.getValues()[fieldName as keyof typeof dcfForm.getValues] as number[];
    
    return (
      <div className="space-y-2">
        <FormLabel>{label}</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Array.from({ length: years }, (_, i) => (
            <FormField
              key={i}
              control={dcfForm.control}
              name={`${fieldName}.${i}` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Ano {i + 1}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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

  if (valuationLoading) {
    return <div className="p-6">Carregando valuation...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/companies/${companyId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Valuation</h1>
            <p className="text-muted-foreground">{company?.razaoSocial}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {valuationId && (
            <Button
              variant="outline"
              onClick={() => deleteValuationMutation.mutate()}
              disabled={deleteValuationMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          )}
          <Button variant="outline" onClick={saveDraft} disabled={createValuationMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={calculate} disabled={calculateDcfMutation.isPending || calculateMultiplesMutation.isPending}>
            <Play className="w-4 h-4 mr-2" />
            Calcular
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Method Selection and Forms */}
        <div className="lg:col-span-2">
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
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
                      {/* Multiples */}
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                                <FormLabel>Desconto por Iliquidez (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                <FormLabel>Prêmio por Controle (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
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

                      {/* Sources */}
                      <FormField
                        control={multiplesForm.control}
                        name="comparablesSources"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fontes dos Múltiplos</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descreva as fontes utilizadas para obter os múltiplos comparáveis..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Valuation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Status</span>
                {existingValuation && (
                  <Badge variant={existingValuation.status === "completed" ? "default" : "secondary"}>
                    {existingValuation.status === "completed" ? "Concluído" : "Rascunho"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {existingValuation ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Método: {existingValuation.method === "dcf" ? "DCF" : "Múltiplos"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Criado: {new Date(existingValuation.createdAt).toLocaleDateString()}
                  </p>
                  {existingValuation.updatedAt !== existingValuation.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      Atualizado: {new Date(existingValuation.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Novo valuation</p>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {calculationResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Resultados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeMethod === "dcf" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">WACC</p>
                      <p className="text-2xl font-bold">
                        {(calculationResults.wacc * 100).toFixed(2)}%
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Valor da Empresa</p>
                      <p className="text-2xl font-bold">
                        R$ {calculationResults.enterpriseValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Valor do Equity</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {calculationResults.equityValue.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Sensitivity Analysis */}
                    {calculationResults.sensitivityMatrix && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Análise de Sensibilidade</p>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>WACC\Terminal Growth</TableHead>
                                <TableHead>-1%</TableHead>
                                <TableHead>-0.5%</TableHead>
                                <TableHead>Base</TableHead>
                                <TableHead>+0.5%</TableHead>
                                <TableHead>+1%</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {calculationResults.sensitivityMatrix.map((row: number[], i: number) => (
                                <TableRow key={i}>
                                  <TableCell>{["-1%", "-0.5%", "Base", "+0.5%", "+1%"][i]}</TableCell>
                                  {row.map((value, j) => (
                                    <TableCell key={j} className={i === 2 && j === 2 ? "bg-blue-50 font-bold" : ""}>
                                      R$ {(value / 1000000).toFixed(1)}M
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeMethod === "multiples" && (
                  <div className="space-y-4">
                    {calculationResults.peValuation && (
                      <div>
                        <p className="text-sm font-medium">Valuation P/L</p>
                        <p className="text-lg font-semibold">
                          R$ {calculationResults.peValuation.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {calculationResults.evEbitdaValuation && (
                      <div>
                        <p className="text-sm font-medium">Valuation EV/EBITDA</p>
                        <p className="text-lg font-semibold">
                          R$ {calculationResults.evEbitdaValuation.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {calculationResults.pvVpValuation && (
                      <div>
                        <p className="text-sm font-medium">Valuation P/VP</p>
                        <p className="text-lg font-semibold">
                          R$ {calculationResults.pvVpValuation.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {calculationResults.evRevenueValuation && (
                      <div>
                        <p className="text-sm font-medium">Valuation EV/Receita</p>
                        <p className="text-lg font-semibold">
                          R$ {calculationResults.evRevenueValuation.toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium">Valuation Médio</p>
                      <p className="text-xl font-bold">
                        R$ {calculationResults.averageValuation.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Valuation Ajustado</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {calculationResults.adjustedValuation.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationPage;