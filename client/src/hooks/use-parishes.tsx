import { useQuery } from "@tanstack/react-query";
import { Parish } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type ParishesResponse = {
  success: boolean;
  parishes: Parish[];
};

export function useParishes() {
  return useQuery<ParishesResponse>({
    queryKey: ["/api/parishes"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAllParishes() {
  return useQuery<ParishesResponse>({
    queryKey: ["/api/parishes/all"],
    queryFn: getQueryFn({ on401: "throw" }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}