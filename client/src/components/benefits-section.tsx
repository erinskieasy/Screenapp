import { motion } from "framer-motion";
import { Bot, UserRoundCheck, Clock, Shield } from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/animations";

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
    <section id="benefits" className="py-20 bg-gradient">
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
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              Focus on Your Career, Not Applications
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Our AI-powered platform transforms how software engineers find their next role.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeIn("up", 0.2 + index * 0.1)}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-5">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">{benefit.title}</h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            variants={fadeIn("up", 0.5)}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-lg shadow border border-neutral-200">
              <Shield className="text-neutral-500 mr-3 h-5 w-5" />
              <span className="text-neutral-700">Your data is secure and private. You control who sees your profile.</span>
            </div>
          </motion.div>
          <motion.div
            variants={fadeIn("up", 0.6)}
            className="text-center mt-12"
          >
            <ScrollTo
              targetId="join"
              className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Join the Waitlist
            </ScrollTo>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
