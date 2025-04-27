import { motion } from "framer-motion";
import { ScrollTo } from "@/components/ui/scroll-to";
import { appEventBus } from "@/lib/eventBus";
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
            className="font-display text-4xl leading-[2.75rem] tracking-[-0.033em] sm:text-5xl sm:leading-[3.125rem] sm:tracking-[-0.0435em] md:text-[72px] md:leading-[4rem] text-neutral-100 font-medium" 
          >
            {heroTitle}
          </motion.h1>

          <motion.div
            variants={fadeIn("up", 0.2)}
            className="text-xl md:text-2xl text-neutral-300 mt-8 mb-10 bg-gray-900 bg-opacity-0 px-6 py-2 rounded-md flex md:w-max mx-auto break-words"
          >
            <div className="prose-invert max-w-none prose-p:m-0 prose-p:leading-normal prose-headings:m-0">
              <ReactMarkdown>
                {heroSubtitle}
              </ReactMarkdown>
            </div>
          </motion.div>

          <motion.div variants={fadeIn("up", 0.4)} className="w-full max-w-xl mx-auto">
            <form 
              className="relative flex w-full flex-col items-center"
              onSubmit={(e) => {
                e.preventDefault();
                const emailInput = e.currentTarget.email.value;
                console.log('[Hero Form] Email input value:', emailInput);
                
                if (emailInput.trim()) {
                  console.log('[Hero Form] Emitting prefillEmail event with:', emailInput);
                  appEventBus.emit('prefillEmail', emailInput);
                }
                console.log('[Hero Form] Scrolling to waitlist form');
                document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="relative flex w-full items-center gap-2 py-2 pr-2 pl-4 rounded-xl bg-white transition-[box-shadow] duration-350 ease-in-out shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-hover)] has-[input:focus]:shadow-[var(--shadow-focus)]" 
                style={{
                  '--shadow-default': '0px 0px 1.5px 0px rgba(24, 16, 14, 0.26), 0px 0px 0px 2px rgba(48, 90, 196, 0), 0px 12px 11px -8px rgba(24, 16, 14, 0.10), 0px 1px 3px 0px rgba(24, 16, 14, 0.10)',
                  '--shadow-hover': '0px 0px 1.5px 0px rgba(24, 16, 14, 0.46), 0px 0px 0px 2px rgba(48, 90, 196, 0), 0px 12px 11px -8px rgba(24, 16, 14, 0.10), 0px 1px 3px 0px rgba(24, 16, 14, 0.10)',
                  '--shadow-focus': '0px 0px 8px 1px rgba(48, 90, 196, 0.10), 0px 0px 0px 2px rgba(48, 90, 196, 0.20), 0px 2.5px 6px 0px rgba(24, 16, 14, 0.07), 0px 0px 2px 0px rgba(24, 16, 14, 0.20)',
                  '--shadow-error': '0px 0px 8px 1px rgba(195, 97, 63, 0.80), 0px 0px 0px 2px rgba(195, 97, 63, 0.40), 0px 2.5px 6px 0px rgba(24, 16, 14, 0.07), 0px 0px 2px 0px rgba(24, 16, 14, 0.20)'
                } as React.CSSProperties}
              >
                <input 
                  id="contact-input" 
                  className="min-w-0 flex-1 lg:text-sm placeholder:text-neutral-500/50 placeholder:text-sm bg-transparent outline-none" 
                  type="email" 
                  autoComplete="email" 
                  placeholder="hi@company.com" 
                  name="email"
                />
                <button 
                  type="submit"
                  className="px-3 py-[5px] inline-block rounded-md text-sm font-medium tracking-[-0.035px] transition-[background-color,box-shadow,color,outline] ease-out duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-3 bg-primary text-white shadow-[0px_1px_1px_0px_rgba(0,0,0,0.20),_0px_8px_4px_-8px_rgba(48,90,196,0.80),_0px_0px_0px_1px_#305AC4] hover:bg-primary-dark active:bg-primary-dark/90 active:shadow-[0px_1px_1px_0px_rgba(0,0,0,0),_0px_8px_4px_-8px_rgba(48,90,196,0),_0px_0px_0px_1px_#305AC4] active:text-white/[0.90]"
                >
                  <span className="grid *:col-start-1 *:row-start-1">
                    <span>Join Waitlist</span>
                  </span>
                </button>
              </div>
            </form>
          </motion.div>


        </div>
      </motion.div>
    </section>
  );
}