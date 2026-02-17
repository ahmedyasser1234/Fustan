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
    initialData: () => {
      if (typeof window === "undefined") return undefined;
      const saved = localStorage.getItem("manus-runtime-user-info");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          return undefined;
        }
      }
      return undefined;
    },
    retry: false,
    refetchOnWindowFocus: false,
    // @ts-ignore
    onError: (err: any) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("manus-runtime-user-info");
        localStorage.removeItem("app_token"); // Clear token
        queryClient.setQueryData(['auth', 'me'], null);
      }
    }
  });

  // Since useAuth uses tanstack query and endpoints.auth.login isn't directly shown as a mutation in this file,
  // but many components use useAuth, I need to check where the login logic is.
  // Wait, useAuth.ts doesn't have login/register mutations, only logout.
  // It seems they are in individual components.

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
      localStorage.removeItem("manus-runtime-user-info");
      queryClient.setQueryData(['auth', 'me'], null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.resetQueries({ queryKey: ['auth', 'me'] });
    }
  }, [logoutMutation, queryClient]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      );
    }
  }, [meQuery.data]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: (meQuery.isLoading || (meQuery.isFetching && !meQuery.data)) || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
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
