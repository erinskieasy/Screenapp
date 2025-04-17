import * as React from "react";

type ScrollToProps = {
  targetId: string;
  children: React.ReactNode;
  className?: string;
  behavior?: ScrollBehavior;
};

export function ScrollTo({
  targetId,
  children,
  className,
  behavior = "smooth",
}: ScrollToProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior });
    }
  };

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
