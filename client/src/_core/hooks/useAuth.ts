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
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    // @ts-ignore
    onError: (err: any) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        queryClient.setQueryData(['auth', 'me'], null);
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await endpoints.auth.logout();
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      console.error("Logout failed:", error);
    } finally {
      queryClient.setQueryData(['auth', 'me'], null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.resetQueries({ queryKey: ['auth', 'me'] });
    }
  }, [logoutMutation, queryClient]);

  const state = useMemo(() => {
    const userData = (meQuery.data as any)?.user ?? meQuery.data ?? null;

    return {
      user: userData,
      loading: (meQuery.isLoading || (meQuery.isFetching && !meQuery.data)) || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
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

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
