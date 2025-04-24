import { motion } from "framer-motion";
import { ScrollTo } from "@/components/ui/scroll-to";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

export function HeroSection() {
  const { getSetting } = useSettings();
  const [isVideo, setIsVideo] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Get hero settings with defaults
  const heroTitle = getSetting("heroTitle", "Find the Job That Finds You.");
  const heroSubtitle = getSetting("heroSubtitle", "Let AI match you with your next software engineering opportunity.");
  
  // Get hero background media if it exists
  const heroBackgroundMedia = getSetting("heroBackgroundImage");
  
  // Handle video loaded event
  const handleVideoLoaded = () => {
    setIsMediaLoaded(true);
    setIsMediaLoading(false);
  };
  
  // Handle video error event
  const handleVideoError = () => {
    setIsMediaLoading(false);
    console.error("Error loading video");
  };
  
  // Handle image loaded event
  const handleImageLoaded = () => {
    setIsMediaLoaded(true);
    setIsMediaLoading(false);
  };
  
  // Handle image error event
  const handleImageError = () => {
    setIsMediaLoading(false);
    console.error("Error loading image");
  };
  
  // Determine if the background media is a video or image based on file extension
  useEffect(() => {
    if (heroBackgroundMedia) {
      setIsMediaLoading(true);
      setIsMediaLoaded(false);
      const extension = heroBackgroundMedia.split('.').pop()?.toLowerCase();
      setIsVideo(
        extension === 'mp4' || 
        extension === 'webm' || 
        extension === 'mov' || 
        extension === 'ogg'
      );
    }
  }, [heroBackgroundMedia]);
  
  // Get the URL for the background media
  const determineBackgroundMedia = () => {
    if (!heroBackgroundMedia) {
      return "";
    }

    try {
      // If we have a stored media path, use it
      // For media uploaded through the admin panel, it will be in the assets directory
      // and accessible via the /image route
      return `/image/${heroBackgroundMedia}`;
    } catch (e) {
      console.error("Error loading background media:", e);
      return "";
    }
  };

  const backgroundMediaUrl = determineBackgroundMedia();

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-24 relative bg-slate-900">
      {/* Loading Spinner */}
      {isMediaLoading && backgroundMediaUrl && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center space-y-4 bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-white text-center">Loading media...</p>
          </div>
        </div>
      )}
      
      {/* Background Media with Overlay */}
      {isVideo ? (
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
          {backgroundMediaUrl && (
            <video 
              ref={videoRef}
              className="absolute top-0 left-0 min-w-full min-h-full object-cover"
              autoPlay 
              muted 
              loop 
              playsInline
              src={backgroundMediaUrl}
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
            />
          )}
          {/* Additional overlay div for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden z-0 bg-slate-900">
          {backgroundMediaUrl && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundMediaUrl})` }}
              />
              <img 
                ref={imageRef}
                src={backgroundMediaUrl}
                alt="Background" 
                className="opacity-0 absolute"
                onLoad={handleImageLoaded}
                onError={handleImageError}
              />
            </>
          )}
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
          <div className="relative">
            <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-80"></div>
            <motion.h1
              variants={fadeIn("up", 0)}
              className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 leading-tight bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-80 inline-block relative"
            >
              {heroTitle}
            </motion.h1>
          </div>
          
          <motion.div
            variants={fadeIn("up", 0.2)}
            className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 mb-10 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-80 px-4 py-2 rounded-md block w-max mx-auto"
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
              className="absolute w-24 h-24 rounded-full bg-white dark:bg-gray-400 bg-opacity-30 dark:bg-opacity-20 -top-10 left-1/4"
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
              className="absolute w-16 h-16 rounded-full bg-white dark:bg-gray-400 bg-opacity-30 dark:bg-opacity-20 top-0 left-1/2"
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
              className="absolute w-20 h-20 rounded-full bg-white dark:bg-gray-400 bg-opacity-30 dark:bg-opacity-20 -top-5 right-1/4"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
