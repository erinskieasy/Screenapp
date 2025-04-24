import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollTo } from "@/components/ui/scroll-to";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "next-themes";
import intellibusLogo from "../assets/intellibus-logo.png";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getSetting } = useSettings();
  const { theme } = useTheme();
  
  // Get site name and logos with defaults
  const siteName = getSetting("siteName", "Screen App");
  const lightLogo = getSetting("siteLogo");
  const darkLogo = getSetting("darkSiteLogo");
  
  // Decide which logo to use based on theme
  const logoToUse = theme === "dark" && darkLogo ? darkLogo : lightLogo;

  // Add scroll listener to detect when the user scrolls
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
    <header className={`fixed w-full bg-white dark:bg-gray-900 dark:text-white z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-sm bg-opacity-95 dark:bg-opacity-95' : ''}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {logoToUse ? (
            <img 
              src={`/image/${logoToUse}`} 
              alt={siteName} 
              className="h-10 object-contain cursor-pointer" 
            />
          ) : (
            <img 
              src={intellibusLogo} 
              alt={siteName} 
              className="h-8 cursor-pointer" 
            />
          )}
          <span className="ml-2 font-semibold text-xl">{siteName}</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <ScrollTo targetId="how-it-works" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
            How It Works
          </ScrollTo>
          <ScrollTo targetId="benefits" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
            Benefits
          </ScrollTo>
          <ScrollTo targetId="join" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
            Join Waitlist
          </ScrollTo>
          <ThemeToggle />
        </nav>
        
        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="ml-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
      <div className={`md:hidden bg-white dark:bg-gray-900 border-t border-neutral-100 dark:border-gray-800 shadow-sm ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-2 space-y-3">
          <ScrollTo
            targetId="how-it-works"
            className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </ScrollTo>
          <ScrollTo
            targetId="benefits"
            className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Benefits
          </ScrollTo>
          <ScrollTo
            targetId="join"
            className="block py-2 text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Join Waitlist
          </ScrollTo>
        </div>
      </div>
    </header>
  );
}
