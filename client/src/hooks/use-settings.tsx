import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useSettings() {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const settings = data?.success ? data.settings : {};

  return {
    settings,
    isLoading,
    error,
    getSetting: (key: string, defaultValue: string = "") => {
      return settings[key] || defaultValue;
    }
  };
}