import { Link } from "wouter";
import { BriefcaseBusiness, Linkedin, Twitter, Mail, Facebook, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "next-themes";

export function Footer() {
  const { getSetting } = useSettings();
  const { theme } = useTheme();
  const siteName = getSetting("siteName", "TalentMatch");
  const lightLogo = getSetting("siteLogo");
  const darkLogo = getSetting("darkSiteLogo");
  
  // Decide which logo to use based on theme
  const logoToUse = theme === "dark" && darkLogo ? darkLogo : lightLogo;
  
  // Fetch social links
  const { data: socialLinksData } = useQuery<any>({
    queryKey: ["/api/social-links"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const socialLinks = socialLinksData?.success && socialLinksData.links ? socialLinksData.links : [];
  
  // Get the proper icon component based on platform name
  const getIconComponent = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  return (
    <footer className="py-10 bg-neutral-50 dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              {logoToUse ? (
                <img 
                  src={`/image/${logoToUse}`} 
                  alt={siteName} 
                  className="h-8 w-auto object-contain" 
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                  <BriefcaseBusiness className="text-white h-5 w-5" />
                </div>
              )}
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{siteName}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 mb-6 md:mb-0 items-center">
              <Link href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link href="/admin" className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors">
                Admin
              </Link>
            </div>
            
            <div className="flex space-x-4">
              {socialLinks.length > 0 ? (
                socialLinks.map((link: any) => (
                  <a 
                    key={link.platform}
                    href={link.url || "#"} 
                    className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-gray-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-primary hover:text-white transition-colors"
                    aria-label={link.platform}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getIconComponent(link.platform)}
                  </a>
                ))
              ) : (
                <>
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-gray-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-primary hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-gray-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-primary hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-gray-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-primary hover:text-white transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-gray-800 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
