// components/FeaturesCarousel.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

// SVG Icon Components
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a4 4 0 00-5.197-5.197" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

const features = [
  {
    icon: UsersIcon,
    title: "Real-time Sync",
    description: "See changes instantly as your team collaborates. No refresh needed.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: CheckCircleIcon,
    title: "Lists & Notes",
    description: "Create todo lists or rich text notes with embedded tasks.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: ShareIcon,
    title: "Easy Sharing",
    description: "Share with anyone. Control who can view or edit.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: ZapIcon,
    title: "Fast",
    description: "Optimized for speed.",
    color: "from-blue-500 to-cyan-600",
  },
];

export default function FeaturesCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0.3);
  const [isInView, setIsInView] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  // Fix hydration mismatch by only activating scroll after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }

          const section = containerRef.current;
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const sectionHeight = section.offsetHeight;

          // Check if section is in viewport
          const isVisible = rect.top < windowHeight && rect.bottom > 0;
          setIsInView(isVisible);

          if (isVisible) {
            // Calculate progress based on how far through the section we've scrolled
            const scrollTop = window.scrollY;
            const sectionTop = section.offsetTop;
            const sectionStart = sectionTop - windowHeight;
            const sectionEnd = sectionTop + sectionHeight;
            
            // Progress from 0 to 1 as we scroll through the section
            let progress = ((scrollTop - sectionStart) / (sectionEnd - sectionStart)) + 0.2;
            progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
            
            setScrollProgress(progress);
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isMounted]);

  // Calculate horizontal offset based on scroll progress
  const totalFeaturesWidth = features.length * 320 + (features.length - 1) * 24; // 320px per card + 24px gap
  const viewportWidth = isMounted ? window.innerWidth : 1200;
  const maxOffset = Math.max(0, totalFeaturesWidth - viewportWidth + 200); // Extra 200px to scroll off-screen
  
  // Start at right side (positive offset) and move left (negative offset) as we scroll down
  // Default to initial position for SSR
  const horizontalOffset = !isMounted 
    ? maxOffset // Server-side default
    : isInView 
      ? maxOffset - (scrollProgress * (maxOffset * 2)) // Go from +maxOffset to -maxOffset
      : maxOffset;

  return (
    <section ref={containerRef} className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">
            Everything you need,
            <br />
            <span className="text-[#4F46E5]">
              nothing you don't
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Designed for simplicity. Built for collaboration.
          </p>
        </div>

        {/* Horizontal scrolling features */}
        <div className="relative h-[400px] md:h-[450px] overflow-hidden">
          <div 
            className="flex gap-6 absolute top-0 left-0 transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(${horizontalOffset}px)`,
              willChange: isMounted && isInView ? 'transform' : 'auto'
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="w-80 flex-shrink-0"
              >
                <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}