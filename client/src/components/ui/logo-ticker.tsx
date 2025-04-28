
import { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";

export function LogoTicker() {
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef(0);
  const speed = 0.5;

  useAnimationFrame((time) => {
    if (containerRef.current) {
      const nextX = (translateX - speed) % (containerRef.current.scrollWidth / 2);
      setTranslateX(nextX);
    }
  });

  const logos = [
    { src: "/image/logo1.png", width: 192, height: 96 },
    { src: "/image/logo2.png", width: 244, height: 96 },
    { src: "/image/logo3.png", width: 380, height: 96 },
    { src: "/image/logo4.png", width: 368, height: 96 },
    { src: "/image/logo5.png", width: 244, height: 96 },
    { src: "/image/logo6.png", width: 192, height: 96 },
  ];

  const LogoGroup = () => (
    <div className="flex shrink-0 gap-[var(--logo-ticker-gap)]">
      {logos.map((logo, index) => (
        <img
          key={index}
          src={logo.src}
          alt=""
          loading="lazy"
          width={logo.width}
          height={logo.height}
          className="h-6 w-fit opacity-50 dark:opacity-40 grayscale"
        />
      ))}
    </div>
  );

  return (
    <div className="relative flex w-full overflow-hidden [--logo-ticker-gap:40px] md:[--logo-ticker-gap:64px] lg:[mask-image:linear-gradient(to_right,#0000,#000_64px,#000_calc(100%-64px),#0000)]">
      <div
        ref={containerRef}
        className="flex shrink-0 items-center gap-[var(--logo-ticker-gap)]"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <LogoGroup />
        <LogoGroup />
        <LogoGroup />
      </div>
    </div>
  );
}
