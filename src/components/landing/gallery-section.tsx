"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Highlighter } from "@/components/ui/highlighter";
import { useScroll, useSpring, motion, AnimatePresence } from "motion/react";

const GALLERY_ITEMS = [
  {
    id: "g1",
    src: "https://images.unsplash.com/photo-1644329466213-6ff58fb5d9c3?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Hackathon Night",
    subtitle: "36 hours of pure adrenaline",
    desc: "When the sun goes down, the real coding begins. Our annual hackathon brings together the sharpest minds on campus for a marathon of innovation — fueled by caffeine, collaboration, and the thrill of building something from nothing.",
  },
  {
    id: "g2",
    src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1200",
    title: "Bootcamp Sessions",
    subtitle: "From zero to deployed",
    desc: "Eight-week intensive tracks that take students from writing their first line of code to shipping production-ready full-stack applications. Mentored by seniors, powered by real-world projects.",
  },
  {
    id: "g3",
    src: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200",
    title: "CP Showdown",
    subtitle: "Where logic meets speed",
    desc: "Weekly rated contests with custom problem sets, real-time leaderboards, and editorial deep-dives. Our competitive programmers consistently rank among the best in national-level competitions.",
  },
  {
    id: "g4",
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200",
    title: "Community Meetups",
    subtitle: "Ideas, coffee, and code",
    desc: "Monthly gatherings where members share project demos, discuss emerging tech trends, and collaborate on open-source contributions. The best ideas always start with a good conversation.",
  },
];

export function GallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
    restDelta: 0.0001,
  });

  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      const idx = Math.min(
        GALLERY_ITEMS.length - 1,
        Math.max(0, Math.floor(latest * GALLERY_ITEMS.length))
      );
      setActiveIndex(idx);
    });
  }, [smoothProgress]);

  const current = GALLERY_ITEMS[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="relative bg-transparent"
      style={{ height: `${GALLERY_ITEMS.length * 100}vh` }}
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="relative h-full w-full grid grid-cols-1 lg:grid-cols-2">

          {/* ─── Left Column: Text Description ─── */}
          <div className="relative z-10 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24  order-2 lg:order-1">
            {/* Section label */}
            <div className="relative z-10 mb-8">
              <p className="text-xs font-mono font-bold text-[#F47174] uppercase tracking-widest mb-3">
                Moments in Time
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans leading-tight">
                Our Club{" "}
                <Highlighter action="underline" color="#F47174" strokeWidth={4}>
                  <span className="text-white font-serif italic font-normal">Gallery</span>
                </Highlighter>
              </h2>
            </div>

            {/* Active item content with AnimatePresence */}
            <div className="relative z-10 min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Counter */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-4xl font-black font-mono text-[#F47174]">
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-mono text-white/30">
                      / {String(GALLERY_ITEMS.length).padStart(2, "0")}
                    </span>
                    <div className="flex-1 h-px bg-white/10 ml-3" />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                    {current.title}
                  </h3>
                  <p className="text-sm font-medium text-[#00F0FF] mb-4 tracking-wide uppercase font-mono">
                    {current.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-base text-[#8C93B0] leading-relaxed max-w-lg">
                    {current.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="relative z-10 flex items-center gap-2 mt-10">
              {GALLERY_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: idx === activeIndex ? "40px" : "12px",
                    backgroundColor:
                      idx === activeIndex
                        ? "#F47174"
                        : "rgba(255, 255, 255, 0.15)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* ─── Right Column: Full-bleed Image ─── */}
          <div className="relative h-full order-1 lg:order-2">
            {/* All images stacked, crossfade via opacity */}
            {GALLERY_ITEMS.map((item, idx) => (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: idx === activeIndex ? 1 : 0,
                  scale: idx === activeIndex ? 1 : 1.08,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={idx === 0}
                />
                {/* Dark gradient overlay from left for text readability on mobile */}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0B0D19] via-[#0B0D19]/60 to-transparent" />
              </motion.div>
            ))}

            {/* Corner accent badge */}
            <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs font-mono font-bold text-white/60 tracking-widest uppercase">
              {current.title}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
