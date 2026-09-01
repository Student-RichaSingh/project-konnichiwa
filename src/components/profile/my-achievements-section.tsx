"use client";

import { useState } from "react";
import Link from "next/link";
import { FiAward, FiTrash2, FiPlus, FiCheck, FiLoader } from "react-icons/fi";

const CATEGORY_OPTIONS = ["HACKATHONS", "GSOC", "LFX", "SIH", "ICPC", "ACM", "CP", "OTHER"];

export type MyAchievementsSectionProps = {
  initialAchievements: any[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
};

export function MyAchievementsSection({
  initialAchievements,
  onSuccess,
  onError,
}: MyAchievementsSectionProps) {
  const [achievements, setAchievements] = useState<any[]>(initialAchievements || []);
  const [newAchEvent, setNewAchEvent] = useState("");
  const [newAchStatus, setNewAchStatus] = useState("");
  const [newAchCategory, setNewAchCategory] = useState("HACKATHONS");
  const [savingAch, setSavingAch] = useState(false);

  const handleAddAchievement = () => {
    if (!newAchEvent.trim() || !newAchStatus.trim()) return;
    setAchievements((prev) => [
      ...prev,
      { event: newAchEvent.trim(), status: newAchStatus.trim(), category: newAchCategory },
    ]);
    setNewAchEvent("");
    setNewAchStatus("");
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveAchievements = async () => {
    setSavingAch(true);
    try {
      const res = await fetch("/api/user/profile/achievements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievements }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save achievements");

      onSuccess("Achievements updated! Validated achievements are displayed on the Showcase page.");
      if (data.achievements) setAchievements(data.achievements);
    } catch (err: any) {
      onError(err.message || "Failed to save achievements");
    } finally {
      setSavingAch(false);
    }
  };

  return (
    <div className="pt-6 border-t border-white/10 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
            <FiAward className="text-[#F47174]" /> My Achievements & Milestones
          </h2>
          <p className="text-xs text-[#8C93B0] mt-0.5 font-sans">
            Add your hackathons, open source contributions, and competitive programming achievements to be featured on the showcase page.
          </p>
        </div>

        <Link
          href="/achievements"
          className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-colors font-sans"
        >
          View Showcase
        </Link>
      </div>

      {/* List of current achievements */}
      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
          {achievements.map((ach, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#0f0f0f] border border-white/10 flex items-center justify-between group"
            >
              <div className="space-y-0.5 min-w-0 font-sans">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F47174]/10 border border-[#F47174]/20 text-[#F47174]">
                    {ach.category}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{ach.event}</h4>
                </div>
                <p className="text-[11px] text-[#8C93B0] truncate pl-0.5">{ach.status}</p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveAchievement(idx)}
                className="size-7 grid place-items-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0 ml-2"
                title="Remove Achievement"
              >
                <FiTrash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/10 text-center text-xs text-[#8C93B0] font-sans">
          You haven&apos;t added any achievements yet. Use the form below to add hackathon wins, GSoC, LFX, or CP ranks!
        </div>
      )}

      {/* Add New Achievement Form */}
      <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-4 font-sans">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add Achievement</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-[#8C93B0] uppercase block mb-1">
              Event / Hackathon Name
            </label>
            <input
              type="text"
              placeholder="e.g. SIH 2024 / GSoC '25"
              value={newAchEvent}
              onChange={(e) => setNewAchEvent(e.target.value)}
              className="w-full bg-[#121528] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#F47174]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8C93B0] uppercase block mb-1">
              Status / Rank / Org
            </label>
            <input
              type="text"
              placeholder="e.g. Winner / @Google / Candidate Master"
              value={newAchStatus}
              onChange={(e) => setNewAchStatus(e.target.value)}
              className="w-full bg-[#121528] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#F47174]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8C93B0] uppercase block mb-1">
              Category
            </label>
            <select
              value={newAchCategory}
              onChange={(e) => setNewAchCategory(e.target.value)}
              className="w-full bg-[#121528] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#F47174]"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddAchievement}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors font-sans"
          >
            <FiPlus className="size-4 text-[#F47174]" /> Add to List
          </button>
        </div>
      </div>

      {/* Save Achievements Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSaveAchievements}
          disabled={savingAch}
          className="px-6 py-3 rounded-xl bg-[#F47174] hover:bg-[#FF4D70] text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 font-sans"
        >
          {savingAch ? (
            <FiLoader className="size-4 animate-spin" />
          ) : (
            <>
              <FiCheck className="size-4" /> Save Achievements
            </>
          )}
        </button>
      </div>
    </div>
  );
}
