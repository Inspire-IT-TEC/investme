import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useEntrepreneurNavigation() {
  const queryClient = useQueryClient();

  const refreshData = useCallback(() => {
    // Invalidate all entrepreneur-related queries to force fresh data
    queryClient.invalidateQueries({ queryKey: ['/api/entrepreneur/profile'] });
    queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    queryClient.invalidateQueries({ queryKey: ['/api/credit-requests'] });
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    queryClient.invalidateQueries({ queryKey: ['/api/entrepreneur/unread-messages'] });
    queryClient.invalidateQueries({ queryKey: ['/api/entrepreneur/pending-profile-changes'] });
    queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    queryClient.invalidateQueries({ queryKey: ['/api/network/companies'] });
    
    console.log('✅ Dados do empreendedor atualizados automaticamente');
  }, [queryClient]);

  return { refreshData };
}