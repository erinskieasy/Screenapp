import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Loader2 } from "lucide-react";
import { waitlistFormSchema } from "@shared/schema";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { useParishes } from "@/hooks/use-parishes";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = {
  fullName: string;
  email: string;
  phone?: string;
  parish?: string;
  role: string;
};

export function WaitlistForm() {
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  
  // Fetch parishes for the dropdown
  const { data: parishesData, isLoading: isLoadingParishes } = useParishes();

  const form = useForm<FormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      parish: "",
      role: "",
    },
  });

  useEffect(() => {
    console.log('[Waitlist Form] Checking sessionStorage for email');
    const prefillEmail = sessionStorage.getItem('prefillEmail');
    console.log('[Waitlist Form] Found email in storage:', prefillEmail);
    
    if (prefillEmail) {
      console.log('[Waitlist Form] Setting email value:', prefillEmail);
      form.setValue('email', prefillEmail, {
        shouldValidate: true,
        shouldDirty: true
      });
      console.log('[Waitlist Form] Removing email from sessionStorage');
      sessionStorage.removeItem('prefillEmail');
    }
  }, [form.setValue]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
      toast({
        title: "Success!",
        description: "You've been added to our waitlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setSuccess(false);
  };

  return (
    <section id="join" className="py-20 bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900">
      <motion.div
        variants={staggerContainer}
        initial="show"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="container mx-auto px-4"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div 
            variants={fadeIn("up", 0.2)}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Join the Waitlist</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Be among the first to experience the future of tech hiring. We'll send you an exclusive invite to our launch event.
            </p>
          </motion.div>
          
          <motion.div 
            variants={fadeIn("up", 0.3)}
            className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-lg shadow-lg border border-neutral-100 dark:border-gray-700"
          >
            {!success ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parish (optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingParishes}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your parish" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingParishes ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading parishes...</span>
                              </div>
                            ) : (
                              <>
                                <SelectItem value=" ">-- Select a parish --</SelectItem>
                                {parishesData?.parishes.map((parish) => (
                                  <SelectItem key={parish.id} value={parish.name}>
                                    {parish.name}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the parish you are located in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Current Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="frontend">Frontend Developer</SelectItem>
                            <SelectItem value="backend">Backend Developer</SelectItem>
                            <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                            <SelectItem value="mobile">Mobile Developer</SelectItem>
                            <SelectItem value="devops">DevOps Engineer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full px-6 py-6 bg-primary hover:bg-primary-dark text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Submitting..." : "Join the Waitlist"}
                  </Button>
                  
                  <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                    We'll send you an exclusive invite to our launch event.
                  </div>
                </form>
              </Form>
            ) : (
              <div className="py-10 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-500 dark:text-green-400 h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">You're on the list!</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Thank you for joining our waitlist. We'll be in touch soon with exclusive updates.
                </p>
                <Button 
                  onClick={resetForm} 
                  variant="ghost" 
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Back to Form
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
