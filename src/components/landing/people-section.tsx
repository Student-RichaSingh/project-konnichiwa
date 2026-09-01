"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { PeopleCard } from "@/components/people/people-card";
import { Highlighter } from "@/components/ui/highlighter";
import { FiCalendar, FiChevronDown, FiCheck, FiX, FiUsers } from "react-icons/fi";

export type PeopleMember = {
  _id?: string;
  id?: string;
  name: string;
  batch: string;
  company: string;
  role: string;
  domain: string;
  imageSrc: string;
  github?: string;
  linkedin?: string;
  isPTSCAlumni?: boolean;
};

export const INITIAL_PEOPLE_MEMBERS: PeopleMember[] = [
  {
    id: "aseem-srivastava",
    name: "Aseem Srivastava",
    batch: "Batch of '17",
    company: "MBZUAI",
    role: "Postdoctoral Researcher",
    domain: "AI & LLMs",
    imageSrc: "/peoples/aseem.jpg",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "prashant-tripathi",
    name: "Prashant Tripathi",
    batch: "Batch of '21",
    company: "Google",
    role: "Software Engineer",
    domain: "CP & Algorithms",
    imageSrc: "/peoples/prashant-tripathi.jpg",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "sudhi-awasthi",
    name: "Sudhi Awasthi",
    batch: "Batch of '21",
    company: "Bloomberg",
    role: "Senior Software Engineer",
    domain: "High-Performance Systems",
    imageSrc: "/peoples/sudhi-awasthi.jpg",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
];

export function formatBatchYear(batchInput: string | number | undefined): string {
  if (!batchInput) return "Batch of '25";
  const str = String(batchInput).trim();
  if (str.startsWith("Batch of")) return str;
  const num = parseInt(str.replace(/\D/g, ""), 10);
  if (!isNaN(num)) {
    const shortYear = num > 2000 ? String(num).slice(-2) : String(num);
    return `Batch of '${shortYear}`;
  }
  return str;
}

function getBatchSortKey(batchStr: string): number {
  if (batchStr === "ALL BATCHES") return 99999;
  const match = batchStr.match(/(\d{2,4})/);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  if (n < 100) {
    return n <= 50 ? 2000 + n : 1900 + n;
  }
  return n;
}

export function PeopleSection() {
  const [members, setMembers] = useState<PeopleMember[]>(INITIAL_PEOPLE_MEMBERS);
  const [selectedBatch, setSelectedBatch] = useState("ALL BATCHES");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetch("/api/people")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.people) && data.people.length > 0) {
          setMembers(data.people);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute dynamic batches with counts and descending year sorting
  const dynamicBatchOptions = useMemo(() => {
    const batchCounts: Record<string, number> = {};
    members.forEach((m) => {
      const formatted = formatBatchYear(m.batch);
      batchCounts[formatted] = (batchCounts[formatted] || 0) + 1;
    });

    const sortedBatches = Object.keys(batchCounts).sort((a, b) => {
      return getBatchSortKey(b) - getBatchSortKey(a); // Most recent graduating year first
    });

    return [
      { label: "All Batches", value: "ALL BATCHES", count: members.length },
      ...sortedBatches.map((batch) => ({
        label: batch,
        value: batch,
        count: batchCounts[batch],
      })),
    ];
  }, [members]);

  const filteredPeople = useMemo(() => {
    if (selectedBatch === "ALL BATCHES") return members;
    return members.filter((person) => formatBatchYear(person.batch) === selectedBatch);
  }, [members, selectedBatch]);

  const selectedOption = useMemo(() => {
    return (
      dynamicBatchOptions.find((opt) => opt.value === selectedBatch) ||
      dynamicBatchOptions[0]
    );
  }, [dynamicBatchOptions, selectedBatch]);

  return (
    <section
      id="people"
      className="relative bg-[#0f0f0f] py-24 border-b border-white/5 font-sans"
    >
      {/* Vertical Dashed Guidelines Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="mx-auto h-full max-w-7xl px-6 lg:px-12 grid grid-cols-5 border-x border-dashed border-white/5">
          <div className="border-r border-dashed border-white/5 h-full" />
          <div className="border-r border-dashed border-white/5 h-full" />
          <div className="border-r border-dashed border-white/5 h-full" />
          <div className="border-r border-dashed border-white/5 h-full" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans leading-tight">
            Cracked Minds of{" "}
            <Highlighter action="underline" color="#F47174" strokeWidth={4}>
              <span className="text-[#F47174]">KNIT</span>
            </Highlighter>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#8C93B0] max-w-2xl mx-auto font-sans leading-relaxed">
            Spotlighting top cracked seniors, alumni, and high achievers driving
            engineering excellence across top tech companies worldwide.
          </p>
        </div>

        {/* Previous horizontal tabs filter bar (hidden as alumni years scale) */}
        {/*
        <div className="flex justify-center mb-16">
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 border-b border-white/10">
            {dynamicBatchOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedBatch(opt.value)}
                className={`relative pb-4 -mb-[1px] text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  selectedBatch === batch
                    ? "text-white"
                    : "text-[#8C93B0] hover:text-white/80"
                }`}
              >
                {batch}
                {selectedBatch === batch && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#F47174] shadow-[0_0_15px_rgba(244,113,116,0.6)] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
        */}

        {/* Scalable Controls Toolbar: Year/Batch Dropdown on the Left */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          {/* Year Dropdown Filter (Left) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#121626] border transition-all duration-200 shadow-md ${
                isDropdownOpen
                  ? "border-[#F47174] shadow-[0_0_15px_rgba(244,113,116,0.25)] ring-1 ring-[#F47174]/40"
                  : "border-white/15 hover:border-white/30 hover:bg-[#161a2e]"
              }`}
            >
              <div className="grid size-7 place-items-center rounded-xl bg-white/5 border border-white/10 text-[#F47174]">
                <FiCalendar className="size-3.5" />
              </div>
              <div className="flex items-baseline gap-1.5 text-left">
                <span className="text-xs text-[#8C93B0] font-medium hidden sm:inline">
                  Graduation Year:
                </span>
                <span className="text-xs font-bold text-white tracking-wide">
                  {selectedOption.label}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#8C93B0] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {selectedOption.count}
              </span>
              <FiChevronDown
                className={`size-4 text-slate-400 transition-transform duration-200 ml-1 ${
                  isDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Panel */}
            {isDropdownOpen && (
              <div
                role="listbox"
                className="absolute left-0 top-full mt-2 w-64 sm:w-72 rounded-2xl bg-[#0D101D] border border-white/15 shadow-2xl z-50 overflow-hidden backdrop-blur-xl py-1.5 animate-in fade-in-50 zoom-in-95 duration-150"
              >
                <div className="px-3.5 py-2 border-b border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <span>Select Batch Year</span>
                  <span>{dynamicBatchOptions.length - 1} Batches</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
                  {dynamicBatchOptions.map((opt) => {
                    const isSelected = selectedBatch === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSelectedBatch(opt.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors ${
                          isSelected
                            ? "bg-[#F47174]/15 text-white font-bold"
                            : "text-slate-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`size-1.5 rounded-full ${
                              isSelected ? "bg-[#F47174]" : "bg-white/20"
                            }`}
                          />
                          <span>{opt.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              isSelected
                                ? "bg-[#F47174]/20 border-[#F47174]/40 text-[#F47174]"
                                : "bg-white/5 border-white/10 text-slate-400"
                            }`}
                          >
                            {opt.count}
                          </span>
                          {isSelected && <FiCheck className="size-3.5 text-[#F47174]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Total Count and Quick Reset */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#8C93B0] bg-[#121626] border border-white/10 px-3.5 py-1.5 rounded-full shadow-sm">
              Showing{" "}
              <strong className="text-white font-sans">{filteredPeople.length}</strong>{" "}
              {filteredPeople.length === 1 ? "Alum" : "Alumni"}
            </span>
            {selectedBatch !== "ALL BATCHES" && (
              <button
                type="button"
                onClick={() => setSelectedBatch("ALL BATCHES")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#F47174] hover:text-white hover:bg-[#F47174]/20 border border-[#F47174]/30 transition-all duration-200"
              >
                <FiX className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Cracked People Cards Grid */}
        {filteredPeople.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPeople.map((person) => (
              <PeopleCard
                key={person._id || person.id}
                name={person.name}
                batch={person.batch}
                company={person.company}
                role={person.role}
                imageSrc={person.imageSrc}
                github={person.github}
                linkedin={person.linkedin}
                isPTSCAlumni={person.isPTSCAlumni}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-white/10 rounded-2xl bg-[#121626] space-y-3">
            <FiUsers className="size-10 text-slate-500 mx-auto" />
            <p className="text-base font-semibold text-white">
              No alumni found for {selectedOption.label}
            </p>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              We haven't added records for this graduating batch yet. Select another batch
              or view all alumni.
            </p>
            <button
              type="button"
              onClick={() => setSelectedBatch("ALL BATCHES")}
              className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
            >
              View All Batches
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
