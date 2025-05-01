import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type EmailTemplate, type InsertEmailTemplate } from "@shared/schema";

// Hook for fetching all email templates
export function useEmailTemplates() {
  return useQuery({
    queryKey: ['/api/email-templates'],
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook for fetching a single email template
export function useEmailTemplate(id: number) {
  return useQuery({
    queryKey: ['/api/email-templates', id],
    staleTime: 60 * 1000, // 1 minute
    enabled: !!id,
  });
}

// Hook for creating an email template
export function useCreateEmailTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: InsertEmailTemplate) => {
      return await apiRequest('/api/email-templates', {
        method: 'POST',
        body: JSON.stringify(template),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create email template: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook for updating an email template
export function useUpdateEmailTemplate(id: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Partial<InsertEmailTemplate>) => {
      return await apiRequest(`/api/email-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(template),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email template updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates', id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update email template: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook for deleting an email template
export function useDeleteEmailTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest<{ success: boolean }>(`/api/email-templates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete email template: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}