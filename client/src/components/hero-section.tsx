import { motion } from "framer-motion";
import { ScrollTo } from "@/components/ui/scroll-to";
import { appEventBus } from "@/lib/eventBus";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import heroBackground from "../assets/hero-background.jpeg";

// Logo Ticker Component
function LogoTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  
  // Sample partner logos as inline SVGs - in production, these would be loaded from a database or CMS
  const partnerLogos = [
    { 
      id: 1, 
      name: "Acme Inc", 
      svg: (
        <svg viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 10L35 40H15L25 10Z" fill="currentColor" />
          <path d="M45 25H75" stroke="currentColor" strokeWidth="4" />
          <path d="M85 15H115V35H85V15Z" stroke="currentColor" strokeWidth="4" />
        </svg>
      )
    },
    { 
      id: 2, 
      name: "TechCorp", 
      svg: (
        <svg viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="10" width="30" height="30" rx="15" stroke="currentColor" strokeWidth="4"/>
          <path d="M60 25H90" stroke="currentColor" strokeWidth="4" />
          <path d="M100 10L130 40M100 40L130 10" stroke="currentColor" strokeWidth="4" />
        </svg>
      )
    },
    { 
      id: 3, 
      name: "Innovate Labs", 
      svg: (
        <svg viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10V40M30 10V40M40 10V40" stroke="currentColor" strokeWidth="4" />
          <circle cx="75" cy="25" r="15" fill="currentColor" />
          <path d="M100 10H130V40H100V10Z" stroke="currentColor" strokeWidth="4" />
        </svg>
      )
    },
    { 
      id: 4, 
      name: "Quantum AI", 
      svg: (
        <svg viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 25C20 16.7157 26.7157 10 35 10C43.2843 10 50 16.7157 50 25C50 33.2843 43.2843 40 35 40C26.7157 40 20 33.2843 20 25Z" stroke="currentColor" strokeWidth="4"/>
          <path d="M60 10L90 40M60 40L90 10" stroke="currentColor" strokeWidth="4" />
          <path d="M110 15L110 35M100 25H120" stroke="currentColor" strokeWidth="4" />
        </svg>
      ) 
    },
    { 
      id: 5, 
      name: "Global Systems", 
      svg: (
        <svg viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="35" cy="25" r="15" stroke="currentColor" strokeWidth="4"/>
          <path d="M60 10H90V40H60V10Z" stroke="currentColor" strokeWidth="4" />
          <path d="M100 40L130 10M100 25H130M115 10V40" stroke="currentColor" strokeWidth="4" />
        </svg>
      )
    },
    { 
      id: 6, 
      name: "Future Tech", 
      svg: (
        <svg viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10H50V25H35V40" stroke="currentColor" strokeWidth="4" />
          <path d="M60 25C60 16.7157 66.7157 10 75 10C83.2843 10 90 16.7157 90 25C90 33.2843 83.2843 40 75 40C66.7157 40 60 33.2843 60 25Z" stroke="currentColor" strokeWidth="4"/>
          <rect x="100" y="10" width="30" height="30" stroke="currentColor" strokeWidth="4"/>
        </svg>
      )
    },
    { 
      id: 7, 
      name: "Smart Solutions", 
      svg: (
        <svg viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10C20 10 35 40 50 10" stroke="currentColor" strokeWidth="4" />
          <circle cx="75" cy="25" r="15" fill="currentColor" />
          <path d="M100 10L115 25L130 10M100 40L115 25L130 40" stroke="currentColor" strokeWidth="4" />
        </svg>
      )
    },
    { 
      id: 8, 
      name: "Connect Partners", 
      svg: (
        <svg viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25" cy="25" r="10" fill="currentColor" />
          <circle cx="125" cy="25" r="10" fill="currentColor" />
          <path d="M35 25H115" stroke="currentColor" strokeWidth="4" strokeDasharray="8 4" />
        </svg>
      )
    },
  ];
  
  useEffect(() => {
    if (!containerRef.current || !innerRef.current) return;
    
    // Set initial width 
    const containerWidth = containerRef.current.offsetWidth;
    const innerWidth = innerRef.current.scrollWidth;
    
    // Animation function for smooth scrolling
    const animate = () => {
      // Reset position when we've scrolled the full width
      if (Math.abs(translateX) >= innerWidth / 2) {
        setTranslateX(0);
      } else {
        // Move logos by 0.5px each frame
        setTranslateX(prev => prev - 0.5);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    const animationRef = { current: requestAnimationFrame(animate) };
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [translateX]);
  
  // Double the logos to create a seamless loop
  const doubledLogos = [...partnerLogos, ...partnerLogos];
  
  return (
    <div className="relative w-full overflow-hidden lg:[mask-image:linear-gradient(to_right,#0000,#000_64px,#000_calc(100%-64px),#0000)]" ref={containerRef}>
      <div 
        className="flex items-center gap-[40px] md:gap-[64px]"
        ref={innerRef}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <div className="flex shrink-0 gap-[40px] md:gap-[64px]">
          {doubledLogos.map((logo, index) => (
            <div 
              key={`${logo.id}-${index}`} 
              className="flex items-center justify-center w-[100px] h-[50px] md:w-[150px] md:h-[75px] bg-white/5 rounded-md overflow-hidden"
              title={logo.name}
            >
              <div className="w-full h-full flex items-center justify-center text-white/70 hover:text-white/90 transition-colors">
                {logo.svg}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <section className="h-screen relative bg-slate-900 flex items-center rounded-xl overflow-hidden">
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
        <div className="max-w-3xl mx-auto text-center">
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
                document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="relative flex w-full max-w-md items-center gap-2 py-2 pr-2 pl-4 rounded-xl bg-white transition-[box-shadow] duration-350 ease-in-out shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-hover)] has-[input:focus]:shadow-[var(--shadow-focus)]" 
                style={{
                  '--shadow-default': '0px 0px 1.5px 0px rgba(24, 16, 14, 0.26), 0px 0px 0px 2px rgba(48, 90, 196, 0), 0px 12px 11px -8px rgba(24, 16, 14, 0.10), 0px 1px 3px 0px rgba(24, 16, 14, 0.10)',
                  '--shadow-hover': '0px 0px 1.5px 0px rgba(24, 16, 14, 0.46), 0px 0px 0px 2px rgba(48, 90, 196, 0), 0px 12px 11px -8px rgba(24, 16, 14, 0.10), 0px 1px 3px 0px rgba(24, 16, 14, 0.10)',
                  '--shadow-focus': '0px 0px 8px 1px rgba(48, 90, 196, 0.10), 0px 0px 0px 2px rgba(48, 90, 196, 0.20), 0px 2.5px 6px 0px rgba(24, 16, 14, 0.07), 0px 0px 2px 0px rgba(24, 16, 14, 0.20)',
                  '--shadow-error': '0px 0px 8px 1px rgba(195, 97, 63, 0.80), 0px 0px 0px 2px rgba(195, 97, 63, 0.40), 0px 2.5px 6px 0px rgba(24, 16, 14, 0.07), 0px 0px 2px 0px rgba(24, 16, 14, 0.20)'
                } as React.CSSProperties}
              >
                <input 
                  id="contact-input" 
                  className="min-w-0 flex-1 lg:text-sm placeholder:text-neutral-500/50 placeholder:text-sm bg-transparent outline-none text-neutral-800" 
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
                    <span>Register Now</span>
                  </span>
                </button>
              </div>
            </form>
          </motion.div>


        </div>
      </motion.div>
      
      {/* Partners Logo Ticker */}
      {/*
      <motion.div 
        variants={fadeIn("up", 0.6)}
        className="absolute bottom-10 left-0 right-0 z-10"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h3 className="text-sm uppercase tracking-wider text-neutral-400 font-medium">Trusted by Leading Companies</h3>
          </div>
          <LogoTicker />
        </div>
      </motion.div>
      */}
    </section>
  );
}