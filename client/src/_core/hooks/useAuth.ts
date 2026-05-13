import { getLoginUrl } from "@/const";
import { endpoints } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await endpoints.auth.me();
      // The response interceptor unwraps the NestJS envelope, so response.data = { user, token }
      // We only care about the user field
      return response.data?.user ?? null;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.setQueryData(['auth', 'me'], null);
    };
    window.addEventListener('fustan-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('fustan-unauthorized', handleUnauthorized);
  }, [queryClient]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await endpoints.auth.logout();
      return response.data;
    },
  });

  const logout = useCallback(async () => {
    try {
      // 1. Set local state to null immediately
      queryClient.setQueryData(['auth', 'me'], null);
      
      // 2. Call the server to clear the session cookie
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      // logout request error silently handled
    } finally {
      // 3. Clear all queries and redirect to home
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, [logoutMutation, queryClient]);

  const state = useMemo(() => {
    // meQuery.data is now directly the user object (or null)
    const userData = meQuery.data ?? null;
    const isLoading = meQuery.isLoading || (meQuery.isFetching && meQuery.data === undefined);

    return {
      user: userData,
      loading: isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    meQuery.isFetching,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  const setUser = useCallback((userData: any) => {
    // Store only the user object in cache, not the full { user, token } response
    const user = userData?.user ?? userData;
    queryClient.setQueryData(['auth', 'me'], user);
  }, [queryClient]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    logoutMutation,
    setUser,
  };
}
