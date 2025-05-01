import { useState } from "react";
import { 
  useEmailTemplates, 
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate
} from "@/hooks/use-email-templates";
import { type EmailTemplate, emailTemplateFormSchema } from "@shared/schema";
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
import { Plus, Edit, Trash2, Mail } from "lucide-react";

export function EmailTemplatesTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  const { data: templatesData, isLoading } = useEmailTemplates();
  const createTemplateMutation = useCreateEmailTemplate();
  const updateTemplateMutation = useUpdateEmailTemplate(selectedTemplate?.id || 0);
  const deleteTemplateMutation = useDeleteEmailTemplate();
  
  const templates = templatesData?.templates || [];
  
  const form = useForm({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: {
      name: selectedTemplate?.name || "",
      subject: selectedTemplate?.subject || "",
      body: selectedTemplate?.body || "",
      plainText: selectedTemplate?.plainText || "",
      fromName: selectedTemplate?.fromName || "",
      fromEmail: selectedTemplate?.fromEmail || "",
      status: selectedTemplate?.status || "draft"
    }
  });
  
  const openCreateDialog = () => {
    setSelectedTemplate(null);
    form.reset({
      name: "",
      subject: "",
      body: "",
      plainText: "",
      fromName: "",
      fromEmail: "",
      status: "draft"
    });
    setIsCreateDialogOpen(true);
  };
  
  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    form.reset({
      name: template.name,
      subject: template.subject,
      body: template.body,
      plainText: template.plainText || "",
      fromName: template.fromName,
      fromEmail: template.fromEmail,
      status: template.status
    });
    setIsCreateDialogOpen(true);
  };
  
  const handleDeleteTemplate = (id: number) => {
    deleteTemplateMutation.mutate(id);
  };
  
  const onSubmit = (data: Record<string, any>) => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate(data as any);
    } else {
      createTemplateMutation.mutate(data as any);
    }
    setIsCreateDialogOpen(false);
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading email templates...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-md">
          <p>No email templates found. Create your first template to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.subject}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(template)}
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
                            email template "{template.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteTemplate(template.id)}
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
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-semibold">From:</span> {template.fromName} &lt;{template.fromEmail}&gt;
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  <span className="font-semibold">Status:</span> {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                </div>
                <div className="text-xs text-muted-foreground h-24 overflow-hidden">
                  <p className="line-clamp-5">{template.body.replace(/<[^>]*>/g, ' ')}</p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="text-xs text-muted-foreground w-full text-right">
                  Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Edit Email Template" : "Create New Email Template"}</DialogTitle>
            <DialogDescription>
              {selectedTemplate 
                ? "Update the details of your email template." 
                : "Fill out the form below to create a new email template."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Welcome Email" {...field} />
                      </FormControl>
                      <FormDescription>
                        Internal name for this template
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
                        Template status
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input placeholder="Welcome to our platform!" {...field} />
                    </FormControl>
                    <FormDescription>
                      Email subject line
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company" {...field} />
                      </FormControl>
                      <FormDescription>
                        Sender name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email</FormLabel>
                      <FormControl>
                        <Input placeholder="hello@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Sender email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Body (HTML)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="<p>Hello {{name}},</p><p>Welcome to our platform!</p>" 
                        className="font-mono text-sm h-48"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      HTML content of the email. Use {{name}} or {{email}} as placeholders.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="plainText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plain Text Version (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Hello {{name}}, Welcome to our platform!" 
                        className="font-mono text-sm h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Plain text alternative for email clients that don't support HTML.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
                  {selectedTemplate ? "Update Template" : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}