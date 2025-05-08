import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ValueProposition } from "@/components/value-proposition";
import { BenefitsSection } from "@/components/benefits-section";
import { WaitlistForm } from "@/components/waitlist-form";
import { Footer } from "@/components/footer";
import { LoadingProvider } from "@/hooks/use-loading-context";
import { useState } from "react";

export default function Home() {
  return (
    <LoadingProvider>
      <div className="font-sans text-neutral-800 bg-white">
        <Navbar />
        <HeroSection />
        <WaitlistForm />
        {/* <ValueProposition /> */}
        {/* <BenefitsSection /> */}
        <Footer />
      </div>
    </LoadingProvider>
  );
}
