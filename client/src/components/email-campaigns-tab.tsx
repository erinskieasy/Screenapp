import { useState } from "react";
import { 
  useEmailCampaigns, 
  useCreateEmailCampaign,
  useUpdateEmailCampaign,
  useDeleteEmailCampaign,
  useSendEmailCampaign
} from "@/hooks/use-email-campaigns";
import { useEmailTemplates } from "@/hooks/use-email-templates";
import { type EmailCampaign, emailCampaignFormSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Send, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EmailCampaignsTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useEmailCampaigns();
  const { data: templatesData, isLoading: isLoadingTemplates } = useEmailTemplates();
  const createCampaignMutation = useCreateEmailCampaign();
  const updateCampaignMutation = useUpdateEmailCampaign(selectedCampaign?.id || 0);
  const deleteCampaignMutation = useDeleteEmailCampaign();
  const sendCampaignMutation = useSendEmailCampaign();
  
  const campaigns = campaignsData?.data?.campaigns || [];
  const templates = templatesData?.data?.templates || [];
  
  const form = useForm({
    resolver: zodResolver(emailCampaignFormSchema),
    defaultValues: {
      name: selectedCampaign?.name || "",
      description: selectedCampaign?.description || "",
      templateId: selectedCampaign?.templateId || undefined,
      triggerType: selectedCampaign?.triggerType || "immediate",
      triggerValue: selectedCampaign?.triggerValue || "",
      status: selectedCampaign?.status || "draft",
      audience: selectedCampaign?.audience || {}
    }
  });
  
  const openCreateDialog = () => {
    setSelectedCampaign(null);
    form.reset({
      name: "",
      description: "",
      templateId: undefined,
      triggerType: "immediate",
      triggerValue: "",
      status: "draft",
      audience: {}
    });
    setIsCreateDialogOpen(true);
  };
  
  const openEditDialog = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    form.reset({
      name: campaign.name,
      description: campaign.description || "",
      templateId: campaign.templateId,
      triggerType: campaign.triggerType,
      triggerValue: campaign.triggerValue || "",
      status: campaign.status,
      audience: campaign.audience || {}
    });
    setIsCreateDialogOpen(true);
  };
  
  const handleDeleteCampaign = (id: number) => {
    deleteCampaignMutation.mutate(id);
  };
  
  const handleSendCampaign = (id: number) => {
    sendCampaignMutation.mutate(id);
  };
  
  const onSubmit = (data: Record<string, any>) => {
    // Log the templateId value
    console.log('Raw templateId:', data.templateId);
    console.log('templateId type:', typeof data.templateId);
    
    // Ensure templateId is a number
    const formData = {
      ...data,
      templateId: Number(data.templateId)
    };
    
    console.log('Converted templateId:', formData.templateId);
    console.log('Converted templateId type:', typeof formData.templateId);
    
    if (selectedCampaign) {
      updateCampaignMutation.mutate(formData as any);
    } else {
      createCampaignMutation.mutate(formData as any);
    }
    setIsCreateDialogOpen(false);
  };
  
  const isLoading = isLoadingCampaigns || isLoadingTemplates;
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading email campaigns...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Campaigns</h2>
        <Button onClick={openCreateDialog} disabled={templates.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-md">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <p>You need to create at least one email template before creating a campaign.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Go to the Email Templates tab to create your first template.
          </p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-md">
          <p>No email campaigns found. Create your first campaign to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign: EmailCampaign) => {
            const template = templates.find((t: any) => t.id === campaign.templateId);
            
            return (
              <Card key={campaign.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{campaign.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          campaign.status === 'active' ? 'default' :
                          campaign.status === 'draft' ? 'outline' :
                          campaign.status === 'paused' ? 'secondary' : 'destructive'
                        }>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                        <CardDescription>{template?.name || 'Unknown template'}</CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(campaign)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              email campaign "{campaign.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                  )}
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-semibold">Trigger Type:</span> {
                      campaign.triggerType === 'immediate' ? 'Send immediately' :
                      campaign.triggerType === 'scheduled' ? 'Scheduled' :
                      campaign.triggerType === 'delay' ? 'Delay after signup' :
                      campaign.triggerType === 'sequence' ? 'Sequence' : campaign.triggerType
                    }
                  </div>
                  {campaign.triggerValue && (
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-semibold">Trigger Value:</span> {
                        campaign.triggerType === 'scheduled' ? new Date(campaign.triggerValue).toLocaleString() :
                        campaign.triggerType === 'delay' ? `${campaign.triggerValue} days after signup` :
                        campaign.triggerValue
                      }
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 justify-between">
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    disabled={campaign.status !== 'active' && campaign.status !== 'draft'}
                    onClick={() => handleSendCampaign(campaign.id)}
                  >
                    <Send className="w-3 h-3 mr-2" />
                    Send Now
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>{selectedCampaign ? "Edit Email Campaign" : "Create New Email Campaign"}</DialogTitle>
            <DialogDescription>
              {selectedCampaign 
                ? "Update the details of your email campaign." 
                : "Fill out the form below to create a new email campaign."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Welcome Campaign" {...field} />
                    </FormControl>
                    <FormDescription>
                      Internal name for this campaign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Campaign description..." 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of this campaign's purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Template</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates.map((template: any) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Template to use for this campaign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Campaign status
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="triggerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset triggerValue when type changes
                          form.setValue('triggerValue', '');
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Send immediately</SelectItem>
                          <SelectItem value="scheduled">Scheduled date/time</SelectItem>
                          <SelectItem value="delay">Delay after signup</SelectItem>
                          <SelectItem value="sequence">Part of sequence</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        When to send this campaign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="triggerValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Value</FormLabel>
                      <FormControl>
                        {form.watch('triggerType') === 'scheduled' ? (
                          <Input 
                            type="datetime-local" 
                            {...field} 
                          />
                        ) : form.watch('triggerType') === 'delay' ? (
                          <Input 
                            type="number" 
                            placeholder="Days after signup" 
                            {...field} 
                          />
                        ) : (
                          <Input 
                            placeholder={form.watch('triggerType') === 'immediate' ? 'Not required' : 'Trigger value'} 
                            disabled={form.watch('triggerType') === 'immediate'}
                            {...field} 
                          />
                        )}
                      </FormControl>
                      <FormDescription>
                        {form.watch('triggerType') === 'scheduled' 
                          ? 'Date and time to send the campaign' 
                          : form.watch('triggerType') === 'delay'
                          ? 'Number of days to wait after signup'
                          : form.watch('triggerType') === 'immediate'
                          ? 'No trigger value needed'
                          : 'Value for the trigger'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}>
                  {selectedCampaign ? "Update Campaign" : "Create Campaign"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}