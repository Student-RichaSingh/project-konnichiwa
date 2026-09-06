"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiGlobe,
  FiUsers,
  FiUser,
  FiBookOpen,
  FiMessageCircle,
  FiShare2,
  FiCheck,
  FiExternalLink,
  FiVideo,
  FiFileText,
  FiLink,
  FiShield,
  FiAward,
  FiCheckCircle
} from "react-icons/fi";
import { type EventItem, getEventDynamicStatus } from "@/lib/event-status";
import { EventCoverImage } from "@/components/events/event-cover-image";

interface EventDetailContentProps {
  event: EventItem;
}

export function EventDetailContent({ event }: EventDetailContentProps) {
  const [copied, setCopied] = useState(false);

  const timing = getEventDynamicStatus(event);
  const { isPast, isLive, isUpcoming, label, isRegistrationClosed } = timing;
  const isOnline = event.eventType === "online";

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(`Check out "${event.title}" organized by PTSC KNIT Sultanpur: ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D19] text-white pt-24 pb-16 selection:bg-[#F47174]/30">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-8">
        {/* Back Link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8C93B0] hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft className="size-4" /> Back to Events
        </Link>

        {/* Cover Image Banner */}
        {event.coverImageUrl && (
          <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
            />
          </div>
        )}

        {/* Event Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider bg-[#F47174] text-white">
              {event.status}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider bg-white/10 border border-white/10 text-white/80">
              {event.registrationType === "team"
                ? `Team (${event.teamMinSize ?? 1}–${event.teamMaxSize ?? 4} Members)`
                : "Individual"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-6 pt-2 text-sm text-[#8C93B0] font-mono">
            {event.date && (
              <span className="flex items-center gap-2">
                <FiCalendar className="size-4 text-[#F47174]" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            )}
            {event.time && (
              <span className="flex items-center gap-2">
                <FiClock className="size-4 text-[#F47174]" />
                {event.time}
              </span>
            )}
            <span className="flex items-center gap-2">
              <FiMapPin className="size-4 text-[#F47174]" />
              KNIT Sultanpur Campus
            </span>
          </div>
        </div>

        {/* 2-Column Content + Registration Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Description & Event Brief */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#121626] border border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <FiCalendar className="size-3.5 text-[#FF355E]" /> Date
                </span>
                <p className="text-sm font-semibold text-white">
                  {event.date
                    ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "TBA"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <FiClock className="size-3.5 text-amber-400" /> Time
                </span>
                <p className="text-sm font-semibold text-white">
                  {event.time || "Schedule TBA"}
                </p>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <FiMapPin className="size-3.5 text-blue-400" /> Location / Arena
                </span>
                <p className="text-sm font-semibold text-white truncate">
                  {isOnline ? (event.platform || "Virtual Arena") : (event.venue || "KNIT Sultanpur Campus")}
                </p>
              </div>
            </div>

            {/* About Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121626] border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#FF355E]" />
                <span>About the Event</span>
              </h2>

              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-4 font-sans">
                {event.description || "Details for this event will be published shortly."}
              </div>
            </div>

            {/* Official Rule Book Card */}
            {event.ruleBookUrl && (
              <div className="p-6 rounded-3xl bg-[#121626] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#FF355E] flex items-center gap-1.5">
                    <FiShield className="size-3.5" /> Official Competition Guide
                  </span>
                  <h3 className="text-base font-bold text-white">Rulebook & Evaluation Criteria</h3>
                  <p className="text-xs text-slate-400">Review full scoring metrics, submission formats, and judging rubrics.</p>
                </div>

                <a
                  href={event.ruleBookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all shrink-0 shadow-md"
                >
                  <FiBookOpen className="size-4" /> Open Rulebook <FiExternalLink className="size-3.5" />
                </a>
              </div>
            )}

            {/* Resources & Attachments */}
            {Array.isArray(event.resources) && event.resources.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#121626] border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <FiFileText className="size-4 text-blue-400" />
                  <span>Resources & Reference Materials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 border border-white/10 hover:border-white/25 rounded-2xl bg-[#090B14] transition-all flex items-center justify-between group"
                    >
                      <span className="text-xs font-mono font-medium text-white group-hover:text-[#F47174] transition-colors">
                        {res.label || `Resource #${idx + 1}`}
                      </span>
                      <FiLink className="size-3.5 text-white/40 group-hover:text-[#F47174] transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action & Registration Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/15 shadow-2xl space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white">Registration Hub</h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
                      isPast
                        ? "bg-white/10 text-slate-400"
                        : isRegistrationClosed
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : isLive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {isLive && !isRegistrationClosed && (
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                    {isPast
                      ? "Archived"
                      : isRegistrationClosed
                      ? "Registration Closed"
                      : isLive
                      ? "Happening Now"
                      : "Open for Entries"}
                  </span>
                </div>
              </div>

              {/* Deadline Badge if present */}
              {event.registrationDeadline && !isPast && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    isRegistrationClosed
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-[#0f0f0f] border-amber-500/30 text-amber-300"
                  }`}
                >
                  <FiClock
                    className={`size-4 shrink-0 mt-0.5 ${
                      isRegistrationClosed ? "text-red-400" : "text-amber-400 animate-pulse"
                    }`}
                  />
                  <div>
                    <span
                      className={`block font-semibold text-xs ${
                        isRegistrationClosed ? "text-red-400" : "text-amber-400"
                      }`}
                    >
                      {isRegistrationClosed ? "Registration Closed" : "Registration Deadline"}
                    </span>
                    <span className={isRegistrationClosed ? "text-red-200/90" : "text-amber-200"}>
                      {isRegistrationClosed ? "Deadline passed on " : "Closes: "}
                      {new Date(event.registrationDeadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Specification Table */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Participation Fee:</span>
                  <span className="text-emerald-400 font-semibold">100% Free</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Team Structure:</span>
                  <span className="text-white font-medium">
                    {event.registrationType === "team" 
                      ? `${event.teamMinSize || 2} - ${event.teamMaxSize || 4} Members`
                      : "Individual Entry"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Mode:</span>
                  <span className="text-white font-medium capitalize">
                    {event.eventType || "Offline Campus"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Eligibility:</span>
                  <span className="text-slate-200 font-medium">All KNIT Students</span>
                </div>
              </div>

              {isUpcoming ? (
                <div className="space-y-3 pt-2">
                  {event.googleFormLink ? (
                    <a
                      href={event.googleFormLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-[#F47174] hover:bg-[#FF4D70] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#F47174]/20 flex items-center justify-center gap-2"
                    >
                      Register Now <FiExternalLink className="size-4" />
                    </a>
                  ) : (
                    <div className="w-full py-3 bg-[#F47174]/20 border border-[#F47174]/30 text-[#F47174] font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2">
                      <FiCheckCircle className="size-4" /> Registration Opening Soon
                    </div>
                  )}

                  {event.whatsappGroupLink && (
                    <a
                      href={event.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      Join WhatsApp Group
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center font-mono text-xs text-white/50">
                  This event has concluded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
