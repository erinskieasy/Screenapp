import { motion } from "framer-motion";
import { Check, Building, User } from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { ScrollTo } from "@/components/ui/scroll-to";
import { Button } from "@/components/ui/button";

export function ValueProposition() {
  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="container mx-auto px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div 
              variants={fadeIn("right", 0.2)}
              className="order-2 md:order-1"
            >
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                Say goodbye to endless job applications.
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                Our AI connects software engineers directly with recruiters who are looking for them. Smart, fast, and relevant.
              </p>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                We analyze your skills, experience, and preferences to create the perfect match between you and potential employers.
              </p>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mr-3">
                    <Check className="text-primary h-5 w-5" />
                  </div>
                  <span className="text-neutral-700 dark:text-neutral-300">80% less time spent applying</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mr-3">
                    <Check className="text-primary h-5 w-5" />
                  </div>
                  <span className="text-neutral-700 dark:text-neutral-300">93% matching accuracy</span>
                </div>
              </div>
              
              <ScrollTo targetId="join">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white font-medium shadow-md hover:shadow-lg transition-all">
                  Join the Waitlist
                </Button>
              </ScrollTo>
            </motion.div>
            
            <motion.div 
              variants={fadeIn("left", 0.2)}
              className="order-1 md:order-2"
            >
              <div className="bg-neutral-50 dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="relative aspect-[4/3] rounded overflow-hidden border border-neutral-200 dark:border-gray-700">
                  <div className="absolute inset-0 bg-gradient-blue p-6 flex flex-col">
                    {/* App Dashboard Mockup */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm text-neutral-500">Welcome back,</div>
                        <div className="text-lg font-medium">Alex Morgan</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                        <User className="text-neutral-400 h-5 w-5" />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Match Quality</div>
                        <div className="text-primary font-medium">92%</div>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: "92%" }}></div>
                      </div>
                      <div className="mt-3 text-sm text-neutral-500">Based on your profile and preferences</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                      <div className="text-sm font-medium mb-2">New Match</div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white mr-3">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">Senior Frontend Developer</div>
                          <div className="text-sm text-neutral-500">TechCorp • $140-160k</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="text-sm font-medium mb-2">New Match</div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-neutral-700 flex items-center justify-center text-white mr-3">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">Full Stack Engineer</div>
                          <div className="text-sm text-neutral-500">StartupX • $120-140k</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
