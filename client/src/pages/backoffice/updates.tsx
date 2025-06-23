import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Plus, 
  Wrench, 
  X,
  Calendar,
  Tag,
  History
} from "lucide-react";
import { updates, Update } from "@/data/updates";

const BackofficeUpdates = () => {
  const [openVersions, setOpenVersions] = useState<Set<string>>(new Set());

  const toggleVersion = (version: string) => {
    const newOpenVersions = new Set(openVersions);
    if (newOpenVersions.has(version)) {
      newOpenVersions.delete(version);
    } else {
      newOpenVersions.add(version);
    }
    setOpenVersions(newOpenVersions);
  };

  const getVersionBadgeVariant = (type: Update['type']) => {
    switch (type) {
      case 'major':
        return 'destructive';
      case 'minor':
        return 'default';
      case 'patch':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getVersionIcon = (type: Update['type']) => {
    switch (type) {
      case 'major':
        return <Zap className="h-4 w-4" />;
      case 'minor':
        return <Plus className="h-4 w-4" />;
      case 'patch':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderChangesList = (changes: Update['changes']) => {
    return (
      <div className="space-y-4">
        {changes.added && changes.added.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
              <Plus className="h-3 w-3" />
              Adicionado
            </h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-5">
              {changes.added.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {changes.changed && changes.changed.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
              <Wrench className="h-3 w-3" />
              Alterado
            </h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-5">
              {changes.changed.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {changes.fixed && changes.fixed.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
              <Wrench className="h-3 w-3" />
              Corrigido
            </h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-5">
              {changes.fixed.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {changes.removed && changes.removed.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
              <X className="h-3 w-3" />
              Removido
            </h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-5">
              {changes.removed.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            Atualizações da Plataforma
          </h1>
          <p className="text-muted-foreground mt-2">
            Histórico de versões e mudanças implementadas na plataforma Investme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {updates.length} versões
          </Badge>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda do Versionamento Semântico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <Badge variant="destructive" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                MAJOR
              </Badge>
              <div className="text-sm">
                <div className="font-semibold">Mudanças Importantes</div>
                <div className="text-muted-foreground">Quebras de compatibilidade</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Badge variant="default" className="flex items-center gap-1">
                <Plus className="h-3 w-3" />
                MINOR
              </Badge>
              <div className="text-sm">
                <div className="font-semibold">Novas Funcionalidades</div>
                <div className="text-muted-foreground">Retrocompatível</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                PATCH
              </Badge>
              <div className="text-sm">
                <div className="font-semibold">Correções de Bugs</div>
                <div className="text-muted-foreground">Sem novas funcionalidades</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      <div className="space-y-4">
        {updates.map((update) => (
          <Card key={update.version} className="overflow-hidden">
            <Collapsible 
              open={openVersions.has(update.version)} 
              onOpenChange={() => toggleVersion(update.version)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={getVersionBadgeVariant(update.type)}
                        className="flex items-center gap-1 text-xs"
                      >
                        {getVersionIcon(update.type)}
                        v{update.version}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(update.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {openVersions.has(update.version) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{update.description}</p>
                    {renderChangesList(update.changes)}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BackofficeUpdates;