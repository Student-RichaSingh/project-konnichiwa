"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FiCalendar, 
  FiClock, 
  FiArrowRight, 
  FiUsers, 
  FiUser, 
  FiImage, 
  FiMapPin, 
  FiGlobe, 
  FiSearch, 
  FiBookOpen, 
  FiAward,
  FiLoader
} from "react-icons/fi";
import { Highlighter } from "@/components/ui/highlighter";
import { type EventItem, getEventDynamicStatus } from "@/lib/event-status";
import { EventCoverImage } from "@/components/events/event-cover-image";

interface EventsPageContentProps {
  upcomingEvents: EventItem[];
  pastEvents: EventItem[];
  liveEvents?: EventItem[];
}

export function EventsPageContent({
  upcomingEvents,
  pastEvents,
  liveEvents = [],
}: EventsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "live" | "upcoming" | "past" | "online" | "offline"
  >("all");

  const [clientEvents, setClientEvents] = useState<EventItem[] | null>(null);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);
  const initialServerCount = liveEvents.length + upcomingEvents.length + pastEvents.length;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Background live sync ensures latest events on Vercel deployment even if edge cache is stale
    if (initialServerCount === 0) {
      setLoadingLive(true);
    }

    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.events) && data.events.length > 0) {
          setClientEvents(data.events);
        }
      })
      .catch((err) => {
        console.error("Events live sync error:", err);
      })
      .finally(() => {
        setLoadingLive(false);
      });
  }, [initialServerCount]);

  const allEvents = useMemo(() => {
    if (clientEvents && clientEvents.length > 0) {
      return clientEvents;
    }
    return [...liveEvents, ...upcomingEvents, ...pastEvents];
  }, [clientEvents, liveEvents, upcomingEvents, pastEvents]);

  // Dynamically partition and track timing
  const liveList = useMemo(() => {
    return allEvents.filter((e) => getEventDynamicStatus(e).status === "live");
  }, [allEvents]);

  const upcomingList = useMemo(() => {
    return allEvents.filter((e) => getEventDynamicStatus(e).status === "upcoming");
  }, [allEvents]);

  const pastList = useMemo(() => {
    return allEvents.filter((e) => getEventDynamicStatus(e).status === "past");
  }, [allEvents]);

  // Filtered list with intelligent sorting: Live first, then upcoming (closest date), then past (newest)
  const filteredEvents = useMemo(() => {
    const filtered = allEvents.filter((event) => {
      const timing = getEventDynamicStatus(event);
      const isLive = timing.status === "live";
      const isUpcoming = timing.status === "upcoming";
      const isPast = timing.status === "past";
      const isOnline = event.eventType === "online";
      const isOffline = event.eventType === "offline" || !event.eventType;

      // Filter by category tab
      if (filterType === "live" && !isLive) return false;
      if (filterType === "upcoming" && !isUpcoming) return false;
      if (filterType === "past" && !isPast) return false;
      if (filterType === "online" && !isOnline) return false;
      if (filterType === "offline" && !isOffline) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(q);
        const descMatch = event.description?.toLowerCase().includes(q);
        const venueMatch = event.venue?.toLowerCase().includes(q);
        const platformMatch = event.platform?.toLowerCase().includes(q);
        return titleMatch || descMatch || venueMatch || platformMatch;
      }

      return true;
    });

    // If viewing all, online, or offline, sort: Live first -> Upcoming (earliest first) -> Past (latest first)
    return filtered.sort((a, b) => {
      const timingA = getEventDynamicStatus(a);
      const timingB = getEventDynamicStatus(b);

      const rank = (status: string) => (status === "live" ? 0 : status === "upcoming" ? 1 : 2);
      const rankA = rank(timingA.status);
      const rankB = rank(timingB.status);

      if (rankA !== rankB) return rankA - rankB;

      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;

      if (rankA === 1) {
        // Upcoming: soonest event first
        return dateA - dateB;
      }
      // Past or Live: newest date first
      return dateB - dateA;
    });
  }, [allEvents, filterType, searchQuery]);

  // Featured flagship spotlight: Live event first, then next upcoming event, or most recent
  const featuredEvent = useMemo(() => {
    if (liveList.length > 0) return liveList[0];
    if (upcomingList.length > 0) return upcomingList[0];
    if (allEvents.length > 0) return allEvents[0];
    return null;
  }, [liveList, upcomingList, allEvents]);

  const featuredTiming = useMemo(() => {
    return featuredEvent ? getEventDynamicStatus(featuredEvent) : null;
  }, [featuredEvent]);

  // Dynamic filter tabs
  const filterTabs = useMemo(() => {
    const tabs: {
      id: "all" | "live" | "upcoming" | "past" | "online" | "offline";
      label: string;
      count: number;
      isLiveTab?: boolean;
    }[] = [{ id: "all", label: "All Events", count: allEvents.length }];

    if (liveList.length > 0) {
      tabs.push({
        id: "live",
        label: "Live Now",
        count: liveList.length,
        isLiveTab: true,
      });
    }

    tabs.push(
      { id: "upcoming", label: "Upcoming", count: upcomingList.length },
      { id: "past", label: "Archived Vault", count: pastList.length },
      {
        id: "online",
        label: "Online",
        count: allEvents.filter((e) => e.eventType === "online").length,
      },
      {
        id: "offline",
        label: "Campus Offline",
        count: allEvents.filter((e) => e.eventType !== "online").length,
      }
    );

    return tabs;
  }, [allEvents, liveList.length, upcomingList.length, pastList.length]);

  return (
    <div className="relative min-h-screen bg-[#0f0f0f] pt-24 pb-20 flex flex-col selection:bg-[#F47174]/30">
      {/* Hero Header */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-12 pb-10 w-full text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-sans leading-tight">
          Our{" "}
          <Highlighter action="underline" color="#F47174" strokeWidth={4}>
            <span className="text-[#F47174]">Events.</span>
          </Highlighter>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-[#8C93B0] max-w-2xl mx-auto font-sans leading-relaxed">
          Discover upcoming flagship hackathons, technical bootcamps, and
          networking summits — or explore the legacy of our past events.
        </p>
      </div>

      {/* UPCOMING & ACTIVE EVENTS */}
      <div className="relative z-10 w-full mt-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              Currently Upcoming & Active
            </h2>
            <p className="text-xs font-mono text-[#8C93B0] mt-1">
              Live hackathons, workshops, and upcoming competitions
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            {upcomingEvents.length}{" "}
            {upcomingEvents.length === 1 ? "Event" : "Events"}
          </span>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="mx-auto max-w-7xl px-6 lg:px-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {upcomingEvents.map((event) => (
              <div
                key={event._id || event.slug}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121528]"
              >
                {/* Compact Banner Container */}
                <div className="relative w-full h-48 sm:h-52 bg-[#07080F] border-b border-white/10 flex items-center justify-center overflow-hidden">
                  {event.coverImageUrl ? (
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      priority
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="size-full flex flex-col items-center justify-center p-4 text-center bg-[#0E101D]">
                      <div className="grid size-12 place-items-center rounded-xl bg-white/5 border border-white/10">
                        <FiImage className="size-6 text-[#F47174]/70" />
                      </div>
                      <span className="mt-2 text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase">
                        PTSC Event Poster
                      </span>
                    </div>
                  )}
                </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="rounded bg-[#F47174] px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-white shadow-md">
                      {event.status || "Upcoming"}
                    </span>
                    <span className="rounded bg-[#07080F]/90 border border-white/20 px-2.5 py-1 text-xs font-mono text-white flex items-center gap-1.5">
                      <FiCalendar className="size-3 text-[#F47174]" />
                      {event.date
                        ? new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "TBA"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-white/70 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded uppercase tracking-wider">
                        {event.registrationType === "team" ? (
                          <>
                            <FiUsers className="size-3 text-[#F47174]" /> Team
                            Event
                          </>
                        ) : (
                          <>
                            <FiUser className="size-3 text-[#F47174]" />{" "}
                            Individual Entry
                          </>
                        )}
                      </span>
                    </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-white transition-colors">
                          {event.title}
                        </h3>

                        {/* Description snippet */}
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                      </div>

                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href={`/events/${event.slug || event._id}`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F47174] py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-sm"
                    >
                      View Details & Register{" "}
                      <FiArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-6 lg:px-12 py-16 text-center text-white/40 font-mono text-sm border border-white/10 rounded-2xl bg-[#121528]">
            No upcoming events currently scheduled. Check back soon for exciting
            announcements!
          </div>
        )}
      </div>

      {/* PAST EVENTS VAULT */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-24 pb-12 w-full">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-10 border-b border-white/10 pb-6 flex items-center justify-between">
          <span>Past Events Vault</span>
          <span className="text-xs font-mono font-bold text-[#8C93B0] bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {pastEvents.length} Archived
          </span>
        </h2>

        {pastEvents.length > 0 ? (
          <div className="grid gap-4">
            {pastEvents.map((event, index) => (
              <div
                key={event._id || event.slug}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 p-5 rounded-2xl border border-white/10 bg-[#121528]"
              >
                <span className="hidden sm:block text-4xl font-black text-white/20 font-mono tabular-nums shrink-0 w-12 text-center">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="relative w-full sm:w-32 h-36 sm:h-24 shrink-0 overflow-hidden rounded-xl bg-[#07080F] border border-white/10 flex items-center justify-center">
                  {event.coverImageUrl ? (
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 128px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-xs font-mono font-bold text-white/30 uppercase tracking-widest bg-[#0E101D]">
                      PTSC
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded">
                      Past Event
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-[#8C93B0]">
                      <FiCalendar className="size-3 shrink-0 text-[#F47174]" />
                      {event.date
                        ? new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-[#8C93B0] leading-relaxed line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <Link
                  href={`/events/${event.slug || event._id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white shrink-0"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
