// src/hooks/useApi.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import apiService from '../services/api.service';

interface MutationConfig<TVariables> {
  invalidateKeys?: QueryKey[];
  optimisticUpdater?: (payload: {
    key: QueryKey;
    previousData: unknown;
    variables: TVariables;
  }) => unknown;
}

interface MutationContext {
  snapshots: Array<{ key: QueryKey; data: unknown }>; // restore point por clave
}

const emitAuthError = (error: Error) => {
  if (error.message.includes('401') || error.message.includes('Session expired')) {
    window.dispatchEvent(
      new CustomEvent('auth-error', {
        detail: { message: error.message, status: 401 },
      }),
    );
    return true;
  }
  return false;
};

export const useApiGet = <T>(
  key: string[],
  endpoint: string,
  enabled: boolean = true
) => {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => apiService.get<T>(endpoint),
    enabled,
    retry: (failureCount, error) => {
      // No reintentar si es error 401 (no autorizado)
      if (emitAuthError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useApiPost = <TData, TVariables>(
  endpoint: string,
  config: MutationConfig<TVariables> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, MutationContext>({
    mutationFn: (data: TVariables) => apiService.post<TData>(endpoint, data),
    onMutate: async (variables) => {
      if (!config.invalidateKeys || config.invalidateKeys.length === 0) {
        return { snapshots: [] };
      }

      const context: MutationContext = { snapshots: [] };
      for (const key of config.invalidateKeys) {
        await queryClient.cancelQueries({ queryKey: key, exact: false });
        const previousData = queryClient.getQueryData(key);
        context.snapshots.push({ key, data: previousData });
        if (config.optimisticUpdater) {
          const updated = config.optimisticUpdater({
            key,
            previousData,
            variables,
          });
          if (updated !== undefined) {
            queryClient.setQueryData(key, updated);
          }
        }
      }
      return context;
    },
    onError: (error, _variables, context) => {
      emitAuthError(error);
      context?.snapshots.forEach(({ key, data }) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!config.invalidateKeys) return;
      for (const key of config.invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key, exact: false });
      }
    },
  });
};

export const useApiPut = <TData, TVariables>(
  endpoint: string,
  config: MutationConfig<TVariables> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, MutationContext>({
    mutationFn: (data: TVariables) => apiService.put<TData>(endpoint, data),
    onMutate: async (variables) => {
      if (!config.invalidateKeys || config.invalidateKeys.length === 0) {
        return { snapshots: [] };
      }
      const context: MutationContext = { snapshots: [] };
      for (const key of config.invalidateKeys) {
        await queryClient.cancelQueries({ queryKey: key, exact: false });
        const previousData = queryClient.getQueryData(key);
        context.snapshots.push({ key, data: previousData });
        if (config.optimisticUpdater) {
          const updated = config.optimisticUpdater({
            key,
            previousData,
            variables,
          });
          if (updated !== undefined) {
            queryClient.setQueryData(key, updated);
          }
        }
      }
      return context;
    },
    onError: (error, _variables, context) => {
      emitAuthError(error);
      context?.snapshots.forEach(({ key, data }) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!config.invalidateKeys) return;
      for (const key of config.invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key, exact: false });
      }
    },
  });
};

export const useApiDelete = <TData>(
  endpoint: string,
  config: MutationConfig<void> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, void, MutationContext>({
    mutationFn: () => apiService.delete<TData>(endpoint),
    onMutate: async () => {
      if (!config.invalidateKeys || config.invalidateKeys.length === 0) {
        return { snapshots: [] };
      }
      const context: MutationContext = { snapshots: [] };
      for (const key of config.invalidateKeys) {
        await queryClient.cancelQueries({ queryKey: key, exact: false });
        const previousData = queryClient.getQueryData(key);
        context.snapshots.push({ key, data: previousData });
        if (config.optimisticUpdater) {
          const updated = config.optimisticUpdater({
            key,
            previousData,
            variables: undefined as void,
          });
          if (updated !== undefined) {
            queryClient.setQueryData(key, updated);
          }
        }
      }
      return context;
    },
    onError: (error, _variables, context) => {
      emitAuthError(error);
      context?.snapshots.forEach(({ key, data }) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!config.invalidateKeys) return;
      for (const key of config.invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key, exact: false });
      }
    },
  });
}

// Este hook useApi.ts esta diseñado para simplificar las llamadas a la API, por ejemplo cuando se 
// necesita realizar una consulta GET, POST, PUT o DELETE de manera más sencilla y con manejo de errores integrado.
// la diferencia con el se servicio (apiService) es que este hook usa React Query para el manejo de estado,
// caché y reintentos automáticos, además de integrar la lógica de autenticación mediante el contexto AuthContext.
// Mientras apiService se enfoca solo en hacer las llamadas HTTP básicas.


/*
  -useQuery se usa para obtener datos (GET) y maneja el estado de carga, error y datos en caché.
  -useMutation se usa para enviar datos (POST, PUT, DELETE) y maneja el estado de la mutación.
  -useQueryClient permite invalidar o actualizar la caché después de mutaciones exitosas.
  -El hook también maneja errores de autenticación disparando un evento personalizado que el contexto de autenticación puede escuchar para cerrar sesión si es necesario.
  -Esto hace que las llamadas a la API sean más fáciles y consistentes en toda la aplicación React.
*/


/*
⚙️ useApi (useApi.ts)
👉 Es la capa alta para React.
Se encarga de:
Usar ApiService para hablar con el backend.
Integrar esa petición con React Query.
Darte en un componente React:
data (los datos).
isLoading (estado de carga).
error (si algo falló).
Invalidar queries tras POST/PUT/DELETE → refresca automáticamente la UI.
Capturar errores 401 y disparar un evento global auth-error.
*/