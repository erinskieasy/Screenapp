import { motion } from "framer-motion";
import { ScrollTo } from "@/components/ui/scroll-to";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import heroBackground from "../assets/hero-background.jpeg";

export function HeroSection() {
  const { getSetting } = useSettings();
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  // Get hero settings with defaults
  const heroTitle = getSetting("heroTitle", "Find the Job That Finds You.");
  const heroSubtitle = getSetting("heroSubtitle", "Let AI match you with your next software engineering opportunity.");

  // Get hero background media if it exists
  const heroBackgroundMedia = getSetting("heroBackgroundImage");

  // Determine media type synchronously
  const isVideo = heroBackgroundMedia ? 
    ['mp4', 'webm', 'mov', 'ogg'].includes(heroBackgroundMedia.split('.').pop()?.toLowerCase() || '') : 
    false;

  // Import dynamically loaded media if available
  const determineBackgroundMedia = () => {
    if (!heroBackgroundMedia) {
      return heroBackground;
    }

    try {
      // If we have a stored media path, use it
      // For media uploaded through the admin panel, it will be in the assets directory
      // and accessible via the /image route
      return `/image/${heroBackgroundMedia}`;
    } catch (e) {
      console.error("Error loading background media:", e);
      return heroBackground;
    }
  };

  const backgroundMediaUrl = determineBackgroundMedia();

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-24 relative bg-slate-900">
      {/* Loading State */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 z-0 transition-opacity duration-500 ${isMediaLoaded ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Background Media with Overlay */}
      {isVideo ? (
        <div className={`absolute inset-0 z-0 overflow-hidden transition-opacity duration-500 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <video 
            className="absolute top-0 left-0 min-w-full min-h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
            src={backgroundMediaUrl}
            onLoadedData={() => setIsMediaLoaded(true)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
      ) : (
        <div 
          className={`absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-500 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${backgroundMediaUrl})` }}
          onLoad={() => setIsMediaLoaded(true)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
      )}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 relative z-10"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            variants={fadeIn("up", 0)}
            className="text-4xl md:text-6xl font-bold text-neutral-100 mb-6 leading-tight bg-gray-900 bg-opacity-0 px-4 py-6 rounded-md inline-block" 
          >
            {heroTitle}
          </motion.h1>

          <motion.div
            variants={fadeIn("up", 0.2)}
            className="text-xl md:text-2xl text-neutral-300 mb-10 bg-gray-900 bg-opacity-0 px-6 py-2 rounded-md flex md:w-max mx-auto break-words"
          >
            <div className="prose-invert max-w-none prose-p:m-0 prose-p:leading-normal prose-headings:m-0">
              <ReactMarkdown>
                {heroSubtitle}
              </ReactMarkdown>
            </div>
          </motion.div>

          <motion.div variants={fadeIn("up", 0.4)}>
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