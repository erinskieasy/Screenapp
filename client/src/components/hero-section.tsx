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
  const [isVideo, setIsVideo] = useState(false);

  // Get hero settings with defaults
  const heroTitle = getSetting("heroTitle", "Find the Job That Finds You.");
  const heroSubtitle = getSetting("heroSubtitle", "Let AI match you with your next software engineering opportunity.");

  // Get hero background media if it exists
  const heroBackgroundMedia = getSetting("heroBackgroundImage");

  // Determine if the background media is a video or image based on file extension
  useEffect(() => {
    if (heroBackgroundMedia) {
      const extension = heroBackgroundMedia.split('.').pop()?.toLowerCase();
      setIsVideo(
        extension === 'mp4' || 
        extension === 'webm' || 
        extension === 'mov' || 
        extension === 'ogg'
      );
    }
  }, [heroBackgroundMedia]);

  // Import dynamically loaded media if available
  const determineBackgroundMedia = () => {
    if (!heroBackgroundMedia) {
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </>
      );
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
      {/* Background Media with Overlay */}
      {isVideo ? (
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
          <video 
            className="absolute top-0 left-0 min-w-full min-h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
            src={backgroundMediaUrl}
          />
          {/* Additional overlay div for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 bg-slate-900"
          style={{ backgroundImage: `url(${backgroundMediaUrl})` }}
        >
          {/* Additional overlay div for better text visibility */}
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
            className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 leading-tight bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-80 px-4 py-6 rounded-md inline-block" 
          >
            {heroTitle}
          </motion.h1>

          <motion.div
            variants={fadeIn("up", 0.2)}
            className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 mb-10 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-80 px-6 py-2 rounded-md flex md:w-max mx-auto break-words"
          >
            <div className="prose dark:prose-invert max-w-none prose-p:m-0 prose-p:leading-normal prose-headings:m-0">
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