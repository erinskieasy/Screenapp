import * as React from "react";

type ScrollToProps = {
  targetId: string;
  children: React.ReactNode;
  className?: string;
  behavior?: ScrollBehavior;
  onClick?: () => void;
};

export function ScrollTo({
  targetId,
  children,
  className,
  behavior = "smooth",
  onClick,
}: ScrollToProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior });
    }
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
