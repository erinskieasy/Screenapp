import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type EmailCampaign, type InsertEmailCampaign } from "@shared/schema";

// Hook for fetching all email campaigns
export function useEmailCampaigns() {
  return useQuery<any, Error, { data: { campaigns: any[] } }, string[]>({
    queryKey: ['/api/email-campaigns'],
    staleTime: 60 * 1000, // 1 minute
    select: (data: any) => {
      return {
        data: {
          campaigns: data.campaigns || []
        }
      };
    }
  });
}

// Hook for fetching a single email campaign
export function useEmailCampaign(id: number) {
  return useQuery({
    queryKey: ['/api/email-campaigns', id],
    staleTime: 60 * 1000, // 1 minute
    enabled: !!id,
  });
}

// Hook for creating an email campaign
export function useCreateEmailCampaign() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaign: InsertEmailCampaign) => {
      const res = await apiRequest('POST', '/api/email-campaigns', campaign);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email campaign created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create email campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook for updating an email campaign
export function useUpdateEmailCampaign(id: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaign: Partial<InsertEmailCampaign>) => {
      const res = await apiRequest('PATCH', `/api/email-campaigns/${id}`, campaign);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email campaign updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update email campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook for deleting an email campaign
export function useDeleteEmailCampaign() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/email-campaigns/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email campaign deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete email campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook for sending an email campaign
export function useSendEmailCampaign() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/email-campaigns/${id}/send`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Emails sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-logs'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send emails: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook for fetching email logs
export function useEmailLogs(campaignId?: number) {
  return useQuery<any, Error, { data: { logs: any[] } }, any>({
    queryKey: campaignId ? ['/api/email-logs', campaignId] : ['/api/email-logs'],
    staleTime: 60 * 1000, // 1 minute,
    select: (data: any) => {
      return {
        data: {
          logs: data.logs || []
        }
      };
    }
  });
}

// Hook for fetching email logs by recipient
export function useEmailLogsByRecipient(email: string) {
  return useQuery<any, Error, { data: { logs: any[] } }, any>({
    queryKey: ['/api/email-logs/recipient', email],
    staleTime: 60 * 1000, // 1 minute
    enabled: !!email,
    select: (data: any) => {
      return {
        data: {
          logs: data.logs || []
        }
      };
    }
  });
}