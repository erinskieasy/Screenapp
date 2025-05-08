import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WaitlistEntry } from "@shared/schema";

type WaitlistResponse = {
  success: boolean;
  entries: WaitlistEntry[];
};

export function useWaitlistEntries() {
  return useQuery<WaitlistResponse>({
    queryKey: ["/api/waitlist"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDeleteWaitlistEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/waitlist/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the waitlist entries query to refetch after deletion
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
    },
  });
}