import { Link } from "wouter";
import { BriefcaseBusiness, Linkedin, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-10 bg-neutral-50 border-t border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                <BriefcaseBusiness className="text-white h-5 w-5" />
              </div>
              <span className="text-lg font-semibold text-neutral-900">TalentMatch</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 mb-6 md:mb-0 items-center">
              <Link href="#">
                <a className="text-neutral-600 hover:text-primary transition-colors">Privacy Policy</a>
              </Link>
              <Link href="#">
                <a className="text-neutral-600 hover:text-primary transition-colors">Terms of Service</a>
              </Link>
              <Link href="#">
                <a className="text-neutral-600 hover:text-primary transition-colors">Contact Us</a>
              </Link>
            </div>
            
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-primary hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-primary hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
            <p className="text-neutral-500 text-sm">
              &copy; {new Date().getFullYear()} TalentMatch. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
