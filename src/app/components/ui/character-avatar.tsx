// app/components/ui/character-avatar.tsx
// Character avatar component with graceful image error handling

import React, { useState } from "react";
import Image from "next/image";

interface CharacterAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  name,
  imageUrl,
  size = "md",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      text: "text-xs",
    },
    md: {
      container: "w-12 h-12",
      text: "text-lg",
    },
    lg: {
      container: "w-16 h-16",
      text: "text-2xl",
    },
    xl: {
      container: "w-24 h-24",
      text: "text-3xl",
    },
  };

  const config = sizeConfig[size];

  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if URL is potentially valid (basic validation)
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      // Only allow http/https protocols
      if (!["http:", "https:"].includes(urlObj.protocol)) return false;

      // Check for common image extensions (optional but helpful)
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension =
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|$)/i.test(pathname);

      // Allow URLs without extensions (for services like Gravatar, CDNs, etc.)
      return true;
    } catch {
      return false;
    }
  };

  const shouldShowImage = imageUrl && !imageError && isValidImageUrl(imageUrl);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`${config.container} bg-gray-700 rounded-full flex items-center justify-center overflow-hidden ${className}`}
    >
      {shouldShowImage ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-full flex items-center justify-center">
              <span className={`${config.text} font-semibold text-gray-400`}>
                {getInitials(name)}
              </span>
            </div>
          )}
          <Image
            src={imageUrl}
            alt={`${name}'s avatar`}
            width={
              parseInt(config.container.split("w-")[1]?.split(" ")[0] || "48") *
              4
            }
            height={
              parseInt(config.container.split("h-")[1]?.split(" ")[0] || "48") *
              4
            }
            className={`w-full h-full object-cover ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-200`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            unoptimized // This allows external URLs without Next.js optimization
          />
        </>
      ) : (
        <span className={`${config.text} font-semibold text-gray-300`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
