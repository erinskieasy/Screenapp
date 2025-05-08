import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { appEventBus } from "@/lib/eventBus";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Loader2, Calendar, MapPin, ExternalLink } from "lucide-react";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { waitlistFormSchema } from "@shared/schema";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { useParishes } from "@/hooks/use-parishes";
import { format } from "date-fns";

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
    console.log('[Waitlist Form] Subscribing to prefillEmail event');
    
    const handlePrefillEmail = (email: string) => {
      console.log('[Waitlist Form] Received prefillEmail event with:', email);
      if (email.trim()) {
        form.setValue('email', email, {
          shouldValidate: true,
          shouldDirty: true
        });
      }
    };

    appEventBus.on('prefillEmail', handlePrefillEmail);

    return () => {
      console.log('[Waitlist Form] Unsubscribing from prefillEmail event');
      appEventBus.off('prefillEmail', handlePrefillEmail);
    };
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
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0 }}
        className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24"
      >
        <motion.div 
          variants={fadeIn("up", 0.2)}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Register for Our Event</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Join us for an exclusive Tech event with industry leaders and networking opportunities.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Event Details - Left Column */}
          <motion.div
            variants={fadeIn("up", 0.3)}
            className="flex flex-col"
          >
            <div className="relative rounded-lg overflow-hidden shadow-lg mb-6 h-64 md:h-72">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="AI Conference keynote presentation" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50"></div>
              <div className="absolute top-0 left-0 m-4">
                <div className="bg-accent/90 px-4 py-1 rounded-full">
                  <p className="text-white font-medium uppercase tracking-wide text-sm">AI PIONEER</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">EVENT 2025</h3>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-neutral-100 dark:border-gray-700 p-6 flex-grow">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Event Details</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="text-accent text-xl mr-4">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium text-lg">May 10</p>
                    <p className="text-neutral-600 dark:text-neutral-400">12 PM - 4 PM (JAMAICA TIME)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-accent text-xl mr-4">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium text-lg">AI Academy | AC Hotel Kingston</p>
                    <p className="text-neutral-600 dark:text-neutral-400">38-42 Lady Musgrave Rd, Kingston 5, Jamaica</p>
                  </div>
                </div>
                
                <div className="pt-4 space-y-4">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">What to Expect:</h4>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Are you a Pioneer Software Dev, ready to change the world with tech? Then this is the event you've been waiting for.</p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                    Step into the future at The Screen Launch, the premiere gathering for AI pioneers—a vibrant fusion of networking, innovation, and real-world breakthroughs.
                  </p>
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">What to Bring:</h4>
                  <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2 pl-1">
                    <li>Laptop or tablet (charged and ready)</li>
                    <li>Mobile phone with internet access</li>
                    <li>Government-issued photo ID</li>
                  </ul>
                </div>
                
                <div className="pt-2 flex space-x-4">
                  <button 
                    onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Registration Form - Right Column */}
          <motion.div 
            id="registration-form"
            variants={fadeIn("up", 0.5)}
            className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg border border-neutral-100 dark:border-gray-700"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Registration Form</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Reserve your spot at our exclusive event.
              </p>
            </div>
            
            {!success ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                            <SelectItem value="project_manager">Project Management</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full px-6 py-4 bg-accent hover:bg-accent-dark text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Submitting..." : "Register Now"}
                  </Button>
                  
                  <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Limited seating available. Secure your spot today!
                  </div>
                </form>
              </Form>
            ) : (
              <div className="py-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-500 dark:text-green-400 h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Registration Confirmed!</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Thank you for registering for our event. Your spot is reserved!
                  </p>
                </div>
                
                {/* Event Card Component */}
                <div className="event-container mb-8">
                  <div className="event-date">
                    <div className="month">May</div>
                    <div className="day">10</div>
                    <div className="weekday">Fri</div>
                  </div>
                  <div className="event-details">
                    <h2>The Screen AI Launch Event</h2>
                    <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=Intellibus+Pioneer+AI+Network+Event&dates=20250510T170000Z/20250510T220000Z&details=Are+you+a+Pioneer+Software+Dev%2C+ready+to+change+the+world+with+tech%3F+Then+this+is+the+event+you%E2%80%99ve+been+waiting+for.%0A%0AStep+into+the+future+at+The+Screen+Launch%2C+the+premiere+gathering+for+AI+pioneers%E2%80%94a+vibrant+fusion+of+networking%2C+innovation%2C+and+real-world+breakthroughs.+Rub+shoulders+with+talent+scouts%2C+recruiters%2C+and+decision-makers+from+Fortune+500+tech+giants+and+bold+international+startups+hungry+for+fresh+minds+like+yours.%0A%0AThis+isn%27t+your+average+meet-and-greet.+This+is+your+launchpad.%0A%0ACome+Prepared%3A%0A%E2%9C%94+Laptop+or+tablet+%28charged+and+ready%29%0A%E2%9C%94+Mobile+phone+with+internet+access%0A%E2%9C%94+Government-issued+photo+ID%0A%0AThis+is+a+high-opportunity+zone.+Expect+insight.+Expect+access.+Expect+to+be+seen.&location=AC+Hotel+Kingston%2C+Jamaica%2C+38-42+Lady+Musgrave+Rd%2C+Kingston%2C+Jamaica" className="view-on-calendar">
                      Add to calendar <ExternalLink className="h-3 w-3 inline-block ml-1" />
                    </a>
                    <div className="info-row">
                      <span className="label">When:</span>
                      <span className="value">Friday, May 10, 2025 12:00 PM - 4:00 PM (Jamaica Time)</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Where:</span>
                      <span className="value">AI Academy | AC Hotel Kingston<br />38-42 Lady Musgrave Rd, Kingston 5, Jamaica</span>
                    </div>
                    <a 
                      href="https://www.google.com/calendar/render?action=TEMPLATE&text=Intellibus+Pioneer+AI+Network+Event&dates=20250510T170000Z/20250510T220000Z&details=Are+you+a+Pioneer+Software+Dev%2C+ready+to+change+the+world+with+tech%3F+Then+this+is+the+event+you%E2%80%99ve+been+waiting+for.%0A%0AStep+into+the+future+at+The+Screen+Launch%2C+the+premiere+gathering+for+AI+pioneers%E2%80%94a+vibrant+fusion+of+networking%2C+innovation%2C+and+real-world+breakthroughs.+Rub+shoulders+with+talent+scouts%2C+recruiters%2C+and+decision-makers+from+Fortune+500+tech+giants+and+bold+international+startups+hungry+for+fresh+minds+like+yours.%0A%0AThis+isn%27t+your+average+meet-and-greet.+This+is+your+launchpad.%0A%0ACome+Prepared%3A%0A%E2%9C%94+Laptop+or+tablet+%28charged+and+ready%29%0A%E2%9C%94+Mobile+phone+with+internet+access%0A%E2%9C%94+Government-issued+photo+ID%0A%0AThis+is+a+high-opportunity+zone.+Expect+insight.+Expect+access.+Expect+to+be+seen.&location=AC+Hotel+Kingston%2C+Jamaica%2C+38-42+Lady+Musgrave+Rd%2C+Kingston%2C+Jamaica" 
                      className="add-to-calendar-btn"
                      onClick={() => {
                        // Create calendar event
                        toast({
                          title: "Calendar event created",
                          description: "The event has been added to your calendar",
                        });
                      }}
                    >
                      Add to Calendar
                    </a>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={resetForm} 
                    variant="outline" 
                    className="text-accent hover:text-accent-dark font-medium"
                  >
                    Back to Form
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}