import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "icon-only" | "full";
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, variant = "full", size = "md" }: LogoProps) {
  // We use different sizes depending on if it includes text or just the icon
  // The full logo is wider than the icon-only version
  const sizeClasses = {
    "icon-only": {
      sm: "w-5 h-5",
      md: "w-6 h-6",
      lg: "w-10 h-10",
      xl: "w-16 h-16",
    },
    full: {
      sm: "w-20 h-5",
      md: "w-24 h-6",
      lg: "w-40 h-10",
      xl: "w-64 h-16",
    },
  };

  const dimensions = {
    "icon-only": {
      sm: { width: 20, height: 20 },
      md: { width: 24, height: 24 },
      lg: { width: 40, height: 40 },
      xl: { width: 64, height: 64 },
    },
    full: {
      sm: { width: 80, height: 20 },
      md: { width: 96, height: 24 },
      lg: { width: 160, height: 40 },
      xl: { width: 256, height: 64 },
    },
  };

  const width = dimensions[variant][size].width;
  const height = dimensions[variant][size].height;

  const lightSrc = variant === "full" ? "/logo-full-dark.svg" : "/logo-dark.svg";
  const darkSrc = variant === "full" ? "/logo-full-light.svg" : "/logo-light.svg";

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeClasses[variant][size]} ${className || ""}`}
    >
      {/* Light Mode Logo */}
      <Image
        src={lightSrc}
        alt="Tatalaku Logo"
        width={width}
        height={height}
        className="w-full h-full object-contain dark:hidden"
        priority
      />
      {/* Dark Mode Logo */}
      <Image
        src={darkSrc}
        alt="Tatalaku Logo"
        width={width}
        height={height}
        className="w-full h-full object-contain hidden dark:block"
        priority
      />
    </div>
  );
}
