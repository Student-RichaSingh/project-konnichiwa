"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiUser, FiLogOut, FiEdit2, FiCheck, FiCamera, FiTrash2, FiLoader, FiAward, FiBriefcase, FiShield, FiExternalLink
} from "react-icons/fi";
import { MyAchievementsSection } from "@/components/profile/my-achievements-section";
import { OpenToWorkSection } from "@/components/profile/open-to-work-section";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const profileEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  mobile: z.string().min(10, "Mobile must be at least 10 digits"),
  rollNo: z.string().optional(),
  imageSrc: z.string().optional(),
  password: z.string().optional(),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"personal" | "hire-us" | "achievements">("personal");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  const profileForm = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      mobile: "",
      rollNo: "",
      imageSrc: "",
      password: "",
    },
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        profileForm.reset({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          username: data.user.username || "",
          mobile: String(data.user.mobile || ""),
          rollNo: data.user.rollNo || "",
          imageSrc: data.user.imageSrc || "",
          password: "",
        });
        setImageSrc(data.user.imageSrc || "");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchProfile();
  }, []);

  const handlePhotoUpload = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPEG, PNG, WebP or GIF image formats are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be smaller than 5 MB.");
      return;
    }

    setUploadingPhoto(true);
    setError(null);
    setSuccess(null);

    try {
      let finalUrl = "";
      const signRes = await fetch("/api/upload/sign", { method: "POST" });
      
      if (signRes.ok) {
        const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.secure_url) {
          finalUrl = uploadData.secure_url;
        }
      }

      if (!finalUrl) {
        const reader = new FileReader();
        finalUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const updateRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageSrc: finalUrl }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.message || "Failed to update profile picture");

      setImageSrc(finalUrl);
      setUser(updateData.user);
      setSuccess("Profile picture updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      const updateRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageSrc: "" }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.message || "Failed to remove photo");

      setImageSrc("");
      setUser(updateData.user);
      setSuccess("Profile photo removed.");
    } catch (err: any) {
      setError(err.message || "Failed to remove photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdate = async (values: ProfileEditFormValues) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          mobile: Number(values.mobile),
          rollNo: values.rollNo,
          password: values.password ? values.password : undefined,
          imageSrc: values.imageSrc,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUser(data.user);
      setImageSrc(data.user.imageSrc || "");
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0B0D19] flex items-center justify-center text-white/50 text-xs font-mono">
        <FiLoader className="size-6 animate-spin text-[#F47174] mr-3" /> Loading profile...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-[#0B0D19] text-white pt-24 pb-16 font-sans selection:bg-[#F47174]/30">
      <div className="max-w-6xl mx-auto px-6 font-sans">
        
        {/* Hidden File Picker Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePhotoUpload(file);
          }}
        />

        {/* Sidebar + Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Profile Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 rounded-3xl border border-white/10 bg-[#141414] p-6 shadow-2xl space-y-6 font-sans">
            
            {/* User Profile Card Header */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-white/10 space-y-3">
              <div className="relative group size-20 rounded-2xl bg-[#F47174]/10 border border-[#F47174]/30 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                {uploadingPhoto ? (
                  <FiLoader className="size-6 text-[#F47174] animate-spin" />
                ) : user.imageSrc || imageSrc ? (
                  <Image
                    src={user.imageSrc || imageSrc}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xl font-black text-[#F47174] uppercase font-sans">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold uppercase tracking-wider gap-1"
                >
                  <FiCamera className="size-4" />
                  <span>Change</span>
                </button>
              </div>

              <div>
                <h2 className="text-lg font-black text-white tracking-tight font-sans">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-xs text-[#8C93B0]">@{user.username}</p>
                {user.showInHireUs && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    #OpenToWork
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="text-[11px] font-bold text-[#F47174] hover:underline flex items-center gap-1"
                >
                  <FiCamera className="size-3" /> Photo
                </button>
                {(user.imageSrc || imageSrc) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="text-[11px] font-bold text-red-400/80 hover:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <FiTrash2 className="size-3" /> Remove
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Navigation Menu */}
            <nav className="space-y-1.5 font-sans">
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                  activeTab === "personal"
                    ? "bg-[#F47174] text-white shadow-lg"
                    : "text-[#8C93B0] hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FiUser className="size-4" /> Personal Details
                </span>
                {activeTab === "personal" && <FiCheck className="size-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("hire-us")}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                  activeTab === "hire-us"
                    ? "bg-[#F47174] text-white shadow-lg"
                    : "text-[#8C93B0] hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FiBriefcase className="size-4" /> #OpenToWork / Hire Me
                </span>
                {user.showInHireUs && (
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("achievements")}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                  activeTab === "achievements"
                    ? "bg-[#F47174] text-white shadow-lg"
                    : "text-[#8C93B0] hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FiAward className="size-4" /> Achievements
                </span>
                {user.achievements?.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-white/10 text-white font-bold">
                    {user.achievements.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Admin Dashboard & Logout Links */}
            <div className="pt-4 border-t border-white/10 space-y-2 font-sans">
              {(user.role === "admin" || user.role === "member") && (
                <Link
                  href="/admin/dashboard"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <FiShield className="size-4 text-[#F47174]" /> Admin Dashboard
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <FiLogOut className="size-4 text-red-400" /> Log Out Account
              </button>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 w-full rounded-3xl border border-white/10 bg-[#141414] p-6 sm:p-8 shadow-2xl space-y-6 font-sans">
            
            {/* Alert Notification Messages */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center font-sans">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 font-sans">
                <FiCheck className="size-4" /> {success}
              </div>
            )}

            {/* Tab 1: Personal Details */}
            {activeTab === "personal" && (
              <div className="space-y-6 font-sans">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FiUser className="text-[#F47174]" /> Personal & Academic Info
                  </h2>
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <FiEdit2 className="size-3.5" /> Edit Profile
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-4 font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-[#8C93B0] uppercase block mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-[#0B0D19] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#F47174]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#8C93B0] uppercase block mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-[#0B0D19] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#F47174]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-[#8C93B0] uppercase block mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[#0B0D19] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#F47174]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#8C93B0] uppercase block mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          className="w-full bg-[#0B0D19] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#F47174]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-[#8C93B0] uppercase block mb-1">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          placeholder="24305"
                          value={rollNo}
                          onChange={(e) => setRollNo(e.target.value)}
                          className="w-full bg-[#0B0D19] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#F47174]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#8C93B0] uppercase block mb-1">
                          Profile Photo URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={imageSrc}
                          onChange={(e) => setImageSrc(e.target.value)}
                          className="w-full bg-[#0B0D19] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#F47174]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#8C93B0] uppercase block mb-1">
                        New Password (leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0B0D19] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#F47174]"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-[#F47174] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#FF4D70] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <FiLoader className="size-4 animate-spin" /> : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setError(null);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold uppercase hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#0f0f0f] p-6 rounded-2xl border border-white/10 font-sans text-xs">
                    <div>
                      <span className="text-[#8C93B0] block mb-1">Email Address</span>
                      <span className="text-white font-bold">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-[#8C93B0] block mb-1">Roll Number</span>
                      <span className="text-white font-bold">{user.rollNo || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-[#8C93B0] block mb-1">Mobile Number</span>
                      <span className="text-white font-bold">{user.mobile || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-[#8C93B0] block mb-1">Username</span>
                      <span className="text-white font-bold">@{user.username}</span>
                    </div>
                    <div>
                      <span className="text-[#8C93B0] block mb-1">Account Status</span>
                      <span className="text-emerald-400 font-bold uppercase">{user.status}</span>
                    </div>
                    <div>
                      <span className="text-[#8C93B0] block mb-1">Open To Work</span>
                      <span className={user.showInHireUs ? "text-emerald-400 font-bold uppercase" : "text-white/40 font-bold uppercase"}>
                        {user.showInHireUs ? "Active on /hire-us" : "Disabled"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Open To Work / Hire Me */}
            {activeTab === "hire-us" && (
              <OpenToWorkSection
                user={user}
                onSuccess={(msg) => {
                  setSuccess(msg);
                  setError(null);
                  fetchProfile();
                }}
                onError={(msg) => {
                  setError(msg);
                  setSuccess(null);
                }}
              />
            )}

            {/* Tab 3: Achievements */}
            {activeTab === "achievements" && (
              <MyAchievementsSection
                initialAchievements={user.achievements || []}
                onSuccess={(msg) => {
                  setSuccess(msg);
                  setError(null);
                  fetchProfile();
                }}
                onError={(msg) => {
                  setError(msg);
                  setSuccess(null);
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
