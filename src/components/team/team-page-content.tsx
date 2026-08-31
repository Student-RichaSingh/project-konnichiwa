"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FiGithub, FiLinkedin, FiMail, FiLoader } from "react-icons/fi";
import { Highlighter } from "@/components/ui/highlighter";
import { MOCK_MEMBERS } from "./team-details";

export type ExecutiveMember = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  batch?: number | string;
  post?: string;
  role?: string;
  domain?: string;
  category?: string;
  imageSrc?: string;
  github?: string;
  linkedin?: string;
};

function getLayerMetadata(batchNum?: number | string, category?: string) {
  const b = Number(batchNum);

  if (b === 2027 || category === "Final Year") {
    return {
      priority: 1,
      title: "Final Year Post Holders",
      filterLabel: "Final Year ('27)",
    };
  }
  if (b === 2028 || category === "Pre-Final Year") {
    return {
      priority: 2,
      title: "Pre-Final Year Post Holders",
      filterLabel: "Pre-Final Year ('28)",
    };
  }
  return {
    priority: 999,
    title: "PTSC Executive Members",
    filterLabel: "Executives",
  };
}

export function TeamPageContent() {
  const [members, setMembers] = useState<ExecutiveMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("All Members");
  // Initial state: All batches collapsed by default
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        if (
          data.success &&
          Array.isArray(data.members) &&
          data.members.length > 0
        ) {
          setMembers(data.members);
        } else {
          // fall back to mock data if API returns empty during development
          setMembers(MOCK_MEMBERS);
        }
      })
      .catch(() => setMembers(MOCK_MEMBERS))
      .finally(() => setLoading(false));
  }, []);

  // Restrict to Final Year ('27) and Pre-Final Year ('28) only
  const scopedMembers = useMemo(() => {
    return members.filter((m) => {
      const b = Number(m.batch);
      return (
        b === 2027 ||
        b === 2028 ||
        m.category === "Final Year" ||
        m.category === "Pre-Final Year"
      );
    });
  }, [members]);

  const availableTabs = useMemo(() => {
    const labels = new Set<string>();
    scopedMembers.forEach((m) => {
      const meta = getLayerMetadata(m.batch, m.category);
      labels.add(meta.filterLabel);
    });
    return ["All Members", ...Array.from(labels)];
  }, [scopedMembers]);

  const filteredMembers = useMemo(() => {
    if (selectedFilter === "All Members") return scopedMembers;
    return scopedMembers.filter((m) => {
      const meta = getLayerMetadata(m.batch, m.category);
      return meta.filterLabel === selectedFilter;
    });
  }, [scopedMembers, selectedFilter]);

  const groupedHierarchy = useMemo(() => {
    const groups: {
      [title: string]: { priority: number; list: ExecutiveMember[] };
    } = {};

    filteredMembers.forEach((m) => {
      const meta = getLayerMetadata(m.batch, m.category);
      if (!groups[meta.title]) {
        groups[meta.title] = { priority: meta.priority, list: [] };
      }
      groups[meta.title].list.push(m);
    });

    return Object.entries(groups).sort(
      ([, a], [, b]) => a.priority - b.priority,
    );
  }, [filteredMembers]);

  // Toggle individual section expansion
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  // Toggle all sections
  const allExpanded = groupedHierarchy.length > 0 && groupedHierarchy.every(([title]) => expandedSections[title]);
  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedSections({});
    } else {
      const nextOpen: Record<string, boolean> = {};
      groupedHierarchy.forEach(([title]) => {
        nextOpen[title] = true;
      });
      setExpandedSections(nextOpen);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 py-24 selection:bg-[#FF355E]/30">
      {/* Background Grid Pattern — matches landing page's dark + red-glow vibe */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.15]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#FF355E] opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-sans leading-tight">
            Meet the{" "}
            <Highlighter action="underline" color="#FF355E" strokeWidth={4}>
              <span className="text-[#FF355E]">Crew.</span>
            </Highlighter>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#8C93B0] max-w-3xl mx-auto font-sans leading-relaxed">
            The passionate minds and dedicated leaders driving technical
            excellence at KNIT Sultanpur
          </p>
        </div>

        {/* Filter Tabs */}
        {availableTabs.length > 1 && (
          <div className="flex justify-center mb-16">
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 border-b border-white/10 pb-1">
              {availableTabs.map((tabLabel) => (
                <button
                  key={tabLabel}
                  type="button"
                  onClick={() => setSelectedFilter(tabLabel)}
                  className={`relative pb-3 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors duration-300 ${selectedFilter === tabLabel
                      ? "text-white"
                      : "text-[#8C93B0] hover:text-white/80"
                    }`}
                >
                  {tabLabel}
                  {selectedFilter === tabLabel && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FF355E] shadow-[0_0_15px_rgba(255,53,94,0.6)] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expand/Collapse All Button */}
        {groupedHierarchy.length > 0 && (
          <button
            type="button"
            onClick={handleToggleAll}
            className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            {allExpanded ? "Collapse All Batches" : "Expand All Batches"}
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 text-center text-white/40 font-mono text-sm flex items-center justify-center gap-3 border border-white/10 rounded-2xl bg-[#121528]">
          <FiLoader className="size-6 animate-spin text-[#FF355E]" /> Loading
          team hierarchy...
        </div>
      ) : groupedHierarchy.length > 0 ? (
        <div className="space-y-20">
          {groupedHierarchy.map(([sectionTitle, groupData]) => (
            <div key={sectionTitle} className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3 font-sans">
                  <span className="h-3.5 w-3.5 rounded-full bg-[#FF355E] shadow-[0_0_12px_#FF355E]" />
                  {sectionTitle}
                </h2>
                <span className="text-xs font-mono font-bold text-[#8C93B0] bg-white/5 border border-white/10 px-3.5 py-1 rounded-full">
                  {groupData.list.length}{" "}
                  {groupData.list.length === 1 ? "Member" : "Members"}
                </span>
              </div>

              {/* 4-column grid, matching the poster-card reference */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {groupData.list.map((person, index) => {
                  const fullName =
                    person.name ||
                    `${person.firstName || ""} ${person.lastName || ""}`.trim() ||
                    "PTSC Member";
                  const userImage =
                    person.imageSrc || "/teams/default-avatar.png";

                  return (
                    <div
                      key={person._id || person.id || index}
                      className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-black border border-white/10 transition-all duration-300 hover:border-[#FF355E]/60 hover:-translate-y-1"
                    >
                      {/* KNIT wordmark, top-left */}
                      <span className="absolute top-4 left-4 z-30 text-white font-black text-sm tracking-widest uppercase">
                        KNIT
                      </span>

                      {/* PTSC logo mark, top-right */}
                      <span className="absolute top-3 right-4 z-30 h-7 w-7 rounded-full border-2 border-[#00E5FF]/80 flex items-center justify-center">
                        <span className="text-[8px] font-black text-[#00E5FF]">
                          PTSC
                        </span>
                      </span>

                      {/* Giant faded "PTSC" watermark behind the portrait */}
                      <div className="absolute inset-0 z-0 flex items-start justify-center pt-6 select-none pointer-events-none">
                        <span
                          className="text-[6.5rem] sm:text-[7.5rem] font-black uppercase leading-none tracking-tighter"
                          style={{
                            background:
                              "linear-gradient(180deg, #6b6b6b 0%, #1a1a1a 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          PTSC
                        </span>
                      </div>

                      {/* Portrait */}
                      <div className="absolute inset-0 z-10 flex items-end justify-center">
                        <img
                          src={userImage}
                          alt={fullName}
                          className="h-[78%] w-auto object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Bottom gradient for text legibility */}
                      <div className="absolute inset-x-0 bottom-0 z-20 h-40 bg-black" />

                      {/* Name (script-style) + role */}
                      <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4 text-center">
                        <h3
                          className="text-2xl sm:text-[1.65rem] leading-none text-[#FF355E]"
                          style={{
                            fontFamily: "'Brush Script MT', cursive",
                            textShadow: "0 2px 10px rgba(255,53,94,0.35)",
                          }}
                        >
                          {fullName}
                        </h3>
                        <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-white uppercase tracking-[0.15em]">
                          {person.post || person.role || "Executive Member"}
                        </p>

                        {/* Socials */}
                        <div className="mt-3 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {person.github && (
                            <a
                              href={person.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/70 hover:text-white transition-colors"
                            >
                              <FiGithub className="size-4" />
                            </a>
                          )}
                          {person.linkedin && (
                            <a
                              href={person.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/70 hover:text-[#0077b5] transition-colors"
                            >
                              <FiLinkedin className="size-4" />
                            </a>
                          )}
                          {person.email && (
                            <a
                              href={`mailto:${person.email}`}
                              className="text-white/70 hover:text-[#EA4335] transition-colors"
                            >
                              <FiMail className="size-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
              ))}
          </div>
          ) : (
        <div className="text-center py-24 border border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-[#8C93B0] font-mono text-sm uppercase tracking-widest">
            No members found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
