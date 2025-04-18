import { motion } from "framer-motion";
import { Bot, UserRoundCheck, Clock, Shield, ArrowRight } from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { ScrollTo } from "@/components/ui/scroll-to";
import { Button } from "@/components/ui/button";

export function BenefitsSection() {
  const benefits = [
    {
      icon: <Bot className="text-primary text-xl" />,
      title: "Instant AI-Powered Matches",
      description: "Our advanced algorithms analyze your skills and experience to find perfect job opportunities instantly.",
    },
    {
      icon: <UserRoundCheck className="text-primary text-xl" />,
      title: "Recruiters Come to You",
      description: "Reverse the traditional hiring process. Qualified recruiters reach out to you with pre-vetted opportunities.",
    },
    {
      icon: <Clock className="text-primary text-xl" />,
      title: "No More Wasted Applications",
      description: "Stop sending resumes into the void. Every introduction comes with a high match probability.",
    },
  ];

  return (
    <section id="benefits" className="py-20 bg-gradient dark:bg-gray-950 dark:bg-none">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="container mx-auto px-4"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            variants={fadeIn("up", 0.2)}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              Focus on Your Career, Not Applications
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Our AI-powered platform transforms how software engineers find their next role.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeIn("up", 0.2 + index * 0.1)}
                className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md dark:shadow-xl hover:shadow-lg dark:hover:shadow-2xl transition-shadow border border-transparent dark:border-gray-800"
              >
                <div className="w-14 h-14 rounded-full bg-primary bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-5 dark:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">{benefit.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            variants={fadeIn("up", 0.5)}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center bg-white dark:bg-gray-900 px-6 py-3 rounded-lg shadow dark:shadow-xl border border-neutral-200 dark:border-gray-800 mb-8">
              <Shield className="text-neutral-500 dark:text-neutral-400 mr-3 h-5 w-5" />
              <span className="text-neutral-700 dark:text-neutral-300">Your data is secure and private. You control who sees your profile.</span>
            </div>
            
            <div className="mt-6">
              <ScrollTo targetId="join">
                <Button size="lg" variant="outline" className="group border-primary text-primary dark:border-primary dark:text-primary-foreground hover:bg-primary hover:text-white font-medium transition-all shadow-md dark:shadow-xl">
                  Join the Waitlist
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </ScrollTo>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
