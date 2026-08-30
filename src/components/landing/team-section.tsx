"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { Highlighter } from "@/components/ui/highlighter";
import gsap from "gsap";

export type PositionHolder = {
  id: string;
  name: string;
  role: string;
  imageSrc: string;
  github?: string;
  linkedin?: string;
};

type RawMember = {
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  post?: string;
  role?: string;
  imageSrc?: string;
  github?: string;
  linkedin?: string;
};

type CoreMember = PositionHolder & { rank: number };

// Core leadership positions hierarchy rank:
// 1. Secretary
// 2. Joint Secretary
// 3. Web Dev Head
// 4. CP Head
// 5. Cyber Security Head
function getCoreLeadershipRank(post?: string): number {
  if (!post) return 999;
  const p = post.toLowerCase().trim();
  if (p.includes("joint secretary") || p.includes("joint-secretary")) return 2;
  if (p.includes("secretary")) return 1;
  if (p.includes("web") && (p.includes("head") || p.includes("dev") || p.includes("lead"))) return 3;
  if ((p.includes("competitive programming") || p.includes("cp")) && (p.includes("head") || p.includes("lead"))) return 4;
  if ((p.includes("cyber") || p.includes("security")) && (p.includes("head") || p.includes("lead"))) return 5;
  return 999;
}

export function TeamSection() {
  const [members, setMembers] = useState<PositionHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/members?coreOnly=true")
      .then((response) => response.json())
      .then((data: { success?: boolean; members?: RawMember[] }) => {
        if (!data.success || !Array.isArray(data.members)) return;

        const coreMembers: CoreMember[] = data.members.map((member, index) => ({
          id: member._id || `${member.firstName || member.name || "member"}-${index}`,
          name: member.name || [member.firstName, member.lastName].filter(Boolean).join(" ") || "PTSC Member",
          role: member.post || member.role || "Member",
          imageSrc: member.imageSrc || "/teams/default-avatar.png",
          github: member.github,
          linkedin: member.linkedin,
          rank: getCoreLeadershipRank(member.post),
        }));

        setMembers(
          coreMembers
            .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
            .map(({ rank: _rank, ...member }) => member)
        );
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    const handleScroll = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;
      const progress = container.scrollLeft / maxScroll;
      const activeIdx = Math.min(
        members.length - 1,
        Math.max(0, Math.round(progress * (members.length - 1)))
      );
      setHoveredIndex(activeIdx);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [members.length]);

  // GSAP fluid 3D depth animation for centered card and neighboring cards
  useEffect(() => {
    cardsRef.current.forEach((card, idx) => {
      if (!card) return;

      if (hoveredIndex === idx) {
        gsap.to(card, {
          scale: 1.15,
          y: -20,
          opacity: 1,
          zIndex: 30,
          duration: 0.5,
          ease: "power2.out",
        });
      } else if (hoveredIndex !== null && Math.abs(hoveredIndex - idx) === 1) {
        gsap.to(card, {
          scale: 0.95,
          y: -4,
          opacity: 0.8,
          zIndex: 20,
          duration: 0.5,
          ease: "power2.out",
        });
      } else {
        gsap.to(card, {
          scale: 0.88,
          y: 0,
          opacity: 0.55,
          zIndex: 10,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    });
  }, [hoveredIndex, members]);

  return (
    <div ref={targetRef} id="team" className="relative bg-transparent py-24 border-b border-white/5 overflow-hidden">
      
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FF355E]/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#00F0FF]/10 blur-[150px] rounded-full" />
        <div className="mx-auto h-full max-w-7xl px-6 lg:px-12 grid grid-cols-5 border-x border-dashed border-white/5">
          <div className="border-r border-dashed border-white/5 h-full" />
          <div className="border-r border-dashed border-white/5 h-full" />
          <div className="border-r border-dashed border-white/5 h-full" />
          <div className="border-r border-dashed border-white/5 h-full" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-12">
        {/* Section Header with tighter spacing */}
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-mono font-bold text-[#FF355E] uppercase tracking-widest mb-1.5">
            Character Select
          </p>
          <h2 className="mx-auto max-w-4xl text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl font-sans leading-tight">
            Meet the heroes behind the{" "}
            <Highlighter action="underline" color="#FF355E" strokeWidth={4}>
              <span className="font-serif italic font-normal text-white">
                magic happen
              </span>
            </Highlighter>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[#8C93B0]">
            From competitive coders to full-stack architects — meet the student leads driving technical excellence across KNIT Sultanpur.
          </p>
        </div>

        {/* Scrollable Horizontal Scrolling Track */}
        <div 
          ref={scrollContainerRef}
          className="relative z-10 w-full overflow-x-auto scrollbar-none [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-6 select-none"
        >
          <div 
            ref={trackRef}
            className="flex items-center gap-8 py-6 px-12 w-max transform-gpu"
          >
            {loading ? (
              <div className="px-12 py-10 text-sm text-[#8C93B0]">Loading team...</div>
            ) : members.length === 0 ? (
              <div className="px-12 py-10 text-sm text-[#8C93B0]">Team members will appear here soon.</div>
            ) : members.map((member, index) => (
              <div
                key={member.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                className="group relative shrink-0 w-56 sm:w-64"
              >
                {/* Anime Sticker/Badge overlay */}
                <div className="absolute -top-3 -right-3 z-20 size-10 rounded-full bg-[#FF355E] text-white flex items-center justify-center font-black text-lg shadow-lg border-2 border-[#1A1033] transform rotate-12 group-hover:scale-110 transition-transform">
                  ★
                </div>

                {/* Photo Area with slightly smaller aspect ratio to save vertical space */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-[#090A14] border border-white/5">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 z-10 mix-blend-overlay" />
                  <Image
                    src={member.imageSrc}
                    alt={member.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 224px, 256px"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#090A14] via-[#090A14]/80 to-transparent z-20">
                    <h3 className="text-xl font-black text-white tracking-tight font-sans drop-shadow-md">
                      {member.name}
                    </h3>
                    <div className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#00F0FF]">
                      {member.role}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[#8C93B0]">
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="transition-colors hover:text-[#FF355E]">
                          <FiGithub className="size-3.5" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="transition-colors hover:text-[#FF355E]">
                          <FiLinkedin className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

