
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollTo } from "@/components/ui/scroll-to";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "next-themes";
import intellibusLogo from "../assets/intellibus-logo.png";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getSetting } = useSettings();
  const { theme } = useTheme();

  const siteName = getSetting("siteName", "Screen App");
  const lightLogo = getSetting("siteLogo");
  const darkLogo = getSetting("darkSiteLogo");
  const logoToUse = theme === "dark" && darkLogo ? darkLogo : lightLogo;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-4 left-0 right-0 w-full z-50 flex justify-center"
      >
        <motion.div
          className={`
            rounded-2xl backdrop-blur-lg w-[95%] max-w-4xl
            ${isScrolled ? 'bg-white/90 dark:bg-gray-950/90 shadow-lg' : 'bg-white/50 dark:bg-gray-950/50'}
            transition-all duration-300
          `}
        >
          <div className="w-full px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              {logoToUse ? (
                <img 
                  src={`/image/${logoToUse}`} 
                  alt={siteName} 
                  className="h-8 object-contain cursor-pointer" 
                />
              ) : (
                <img 
                  src={intellibusLogo} 
                  alt={siteName} 
                  className="h-6 cursor-pointer" 
                />
              )}
              <span className="ml-2 font-semibold text-lg">{siteName}</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <ScrollTo targetId="join" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
                Join Waitlist
              </ScrollTo>
              <ThemeToggle />
            </nav>

            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-neutral-100 dark:border-gray-800"
              >
                <div className="w-full px-4 py-2 space-y-3">
                  <ScrollTo
                    targetId="join"
                    className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Join Waitlist
                  </ScrollTo>
                  
                  <div className="py-2 border-t border-neutral-100 dark:border-gray-800 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600 dark:text-neutral-300">Theme</span>
                      <ThemeToggle variant="compact" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.header>
    </AnimatePresence>
  );
}
