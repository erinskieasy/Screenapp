import { motion } from "framer-motion";
import { ScrollTo } from "@/components/ui/scroll-to";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer } from "@/lib/animations";
import heroBackground from "../assets/hero-background.jpeg";

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-24 relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        
      </div>
      
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 relative z-10"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            variants={fadeIn("up", 0)}
            className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight bg-white bg-opacity-70 inline-block"
          >
            Find the Job That Finds You.
          </motion.h1>
          
          <motion.p
            variants={fadeIn("up", 0.2)}
            className="text-xl md:text-2xl text-neutral-700 mb-10 bg-white bg-opacity-70 px-4 py-2 rounded-md inline-block"
          >
            Let AI match you with your next software engineering opportunity.
          </motion.p>
          
          <motion.div variants={fadeIn("up", 0.4)}>
            <ScrollTo
              targetId="join"
              className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Join the Waitlist
            </ScrollTo>
          </motion.div>
          
          {/* Simple animated background elements with reduced opacity */}
          <div className="relative h-16 mt-16 overflow-hidden">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-24 h-24 rounded-full bg-white bg-opacity-30 -top-10 left-1/4"
            />
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute w-16 h-16 rounded-full bg-white bg-opacity-30 top-0 left-1/2"
            />
            <motion.div
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute w-20 h-20 rounded-full bg-white bg-opacity-30 -top-5 right-1/4"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
