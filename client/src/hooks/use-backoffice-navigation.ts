import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para gerenciar recarregamento automático de dados no backoffice
 * baseado na navegação do usuário entre as telas
 */
export function useBackofficeNavigation() {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Mapeamento de rotas para as queries que devem ser invalidadas
    const routeQueryMap: Record<string, string[]> = {
      '/backoffice': [
        '/api/admin/stats',
        '/api/admin/companies',
        '/api/admin/credit-requests',
        '/api/admin/investors',
        '/api/admin/users'
      ],
      '/backoffice/dashboard': [
        '/api/admin/stats',
        '/api/admin/companies',
        '/api/admin/credit-requests',
        '/api/admin/investors',
        '/api/admin/users'
      ],
      '/backoffice/companies': [
        '/api/admin/companies',
        '/api/admin/stats'
      ],
      '/backoffice/credit-requests': [
        '/api/admin/credit-requests',
        '/api/admin/companies',
        '/api/admin/stats'
      ],
      '/backoffice/investors': [
        '/api/admin/investors',
        '/api/admin/stats'
      ],
      '/backoffice/entrepreneurs': [
        '/api/admin/entrepreneurs',
        '/api/admin/users',
        '/api/admin/stats'
      ],
      '/backoffice/approvals': [
        '/api/admin/companies',
        '/api/admin/investors',
        '/api/admin/entrepreneurs',
        '/api/admin/users',
        '/api/admin/stats'
      ],
      '/backoffice/network': [
        '/api/admin/companies',
        '/api/network/posts',
        '/api/network/companies'
      ],
      '/backoffice/messages': [
        '/api/admin/messages',
        '/api/admin/conversations'
      ],
      '/backoffice/admin-users': [
        '/api/admin/admin-users'
      ],
      '/backoffice/audit': [
        '/api/admin/audit-logs'
      ],
      '/backoffice/notifications': [
        '/api/admin/notifications'
      ]
    };

    // Invalidar queries específicas para a rota atual
    const queriesToInvalidate = routeQueryMap[location];
    
    if (queriesToInvalidate) {
      console.log(`Invalidating queries for route ${location}:`, queriesToInvalidate);
      
      // Invalidar cada query específica
      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      // Para queries com parâmetros adicionais, invalidar por prefixo
      if (location === '/backoffice/approvals') {
        // Invalidar todas as queries de investidores e usuários com diferentes status
        queryClient.invalidateQueries({ queryKey: ['/api/admin/investors'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      }
    }
  }, [location, queryClient]);

  return { location };
}