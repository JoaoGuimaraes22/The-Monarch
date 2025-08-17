"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Scroll, Sword } from "lucide-react";
import { Button, Badge, Logo } from "../components/ui";

// Reusable Navigation Component
const Navigation = () => {
  return (
    <nav className="relative z-10 flex items-center justify-between p-6">
      <Logo size="md" />

      <div className="hidden md:flex items-center space-x-8">
        <a
          href="#features"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Features
        </a>
        <a
          href="#about"
          className="text-gray-300 hover:text-white transition-colors"
        >
          About
        </a>
        <Button variant="primary" size="md">
          Sign In
        </Button>
      </div>
    </nav>
  );
};

// Reusable Background Pattern Component
const BackgroundPattern = () => {
  return (
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-20 left-20">
        <Crown className="w-32 h-32 text-amber-300 opacity-30" />
      </div>
      <div className="absolute top-40 right-32">
        <Scroll className="w-24 h-24 text-red-300 opacity-25" />
      </div>
      <div className="absolute bottom-32 left-1/4">
        <Sword className="w-28 h-28 text-amber-400 opacity-20" />
      </div>
    </div>
  );
};

// Reusable Feature Pills Component
const FeaturePills = () => {
  const features = [
    { emoji: "📚", label: "Manuscript Manager" },
    { emoji: "👥", label: "Character Vault" },
    { emoji: "🧭", label: "Plot Tracking" },
    { emoji: "🤖", label: "AI Assistance" },
    { emoji: "🔍", label: "Continuity Checker" },
  ];

  return (
    <div className="mt-16 flex flex-wrap justify-center gap-4">
      {features.map((feature, index) => (
        <Badge
          key={index}
          variant="default"
          size="md"
          className="bg-white bg-opacity-10 backdrop-blur-sm text-white border-none"
        >
          {feature.emoji} {feature.label}
        </Badge>
      ))}
    </div>
  );
};

// Reusable Scroll Indicator Component
interface ScrollIndicatorProps {
  text?: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  text = "Explore Features",
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 animate-bounce">
      <div className="flex flex-col items-center">
        <span className="text-sm mb-2">{text}</span>
        <div className="w-1 h-8 bg-gradient-to-b from-transparent via-gray-400 to-transparent rounded-full"></div>
      </div>
    </div>
  );
};

// Main Landing Header Component
const LandingHeader = () => {
  const router = useRouter();

  const handleStartWriting = () => {
    router.push("/novels");
  };

  const handleSeeHowItWorks = () => {
    // Scroll to features section (when we build it) or go to about page
    // For now, just console log
    console.log("See how it works clicked");
  };
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 overflow-hidden">
      <BackgroundPattern />
      <Navigation />

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Crown Icon */}
          <div className="mb-8">
            <Crown className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Craft Your Epic Fantasy
            <span className="block text-amber-400">With Confidence</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Organize complex characters, track intricate plotlines, build
            immersive worlds, and maintain perfect continuity. Your story
            development command center with AI assistance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="xl"
              className="shadow-xl hover:shadow-2xl transform hover:scale-105"
              onClick={handleStartWriting}
            >
              Start Your Story
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900"
              onClick={handleSeeHowItWorks}
            >
              See How It Works
            </Button>
          </div>

          <FeaturePills />
        </div>
      </div>

      <ScrollIndicator />
    </div>
  );
};

export default LandingHeader;
