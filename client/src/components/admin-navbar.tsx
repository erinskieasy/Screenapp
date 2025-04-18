import { Link } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "next-themes";
import intellibusLogo from "../assets/intellibus-logo.png";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AdminNavbar() {
  const { getSetting } = useSettings();
  const { theme } = useTheme();
  const { logoutMutation } = useAuth();
  
  // Get site name and logos with defaults
  const siteName = getSetting("siteName", "TalentMatch AI");
  const lightLogo = getSetting("siteLogo");
  const darkLogo = getSetting("darkSiteLogo");
  
  // Decide which logo to use based on theme
  const logoToUse = theme === "dark" && darkLogo ? darkLogo : lightLogo;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 dark:text-white shadow-sm border-b border-neutral-200 dark:border-gray-800">
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
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}