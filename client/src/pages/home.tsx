import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ValueProposition } from "@/components/value-proposition";
import { BenefitsSection } from "@/components/benefits-section";
import { WaitlistForm } from "@/components/waitlist-form";
import { Footer } from "@/components/footer";

export default function Home() {
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);
  
  return (
    <div className="font-sans text-neutral-800 bg-white">
      <Navbar isMediaLoaded={isHeroLoaded} />
      <HeroSection onMediaLoad={() => setIsHeroLoaded(true)} />
      <WaitlistForm />
      {/* <ValueProposition /> */}
      {/* <BenefitsSection /> */}
      <Footer />
    </div>
  );
}
