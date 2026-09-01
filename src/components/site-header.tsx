"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { NAV } from "@/components/landing/landing-data";
import { Highlighter } from "@/components/ui/highlighter";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let isMounted = true;
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.success && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (isMounted) setUser(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (pathname.startsWith('/admin')) {
    if (pathname !== '/admin') return null;
    return (
      <header className="absolute top-0 inset-x-0 z-50 bg-transparent font-sans">
        <nav className="mx-auto flex h-24 max-w-7xl items-center px-6 lg:px-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#8C93B0] transition-all group-hover:border-[#F47174]/50 group-hover:bg-[#F47174]/10 group-hover:text-white">
              <FiArrowLeft className="size-5" />
            </div>
            <span className="font-sans font-medium text-sm text-[#8C93B0] transition-colors group-hover:text-white">
              Back to Home
            </span>
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="absolute top-0 inset-x-0 z-50 bg-transparent font-sans">
      {/* Top Left: Pixelated PTSC Logo */}
      <div className="absolute left-4 top-2.5 z-30 sm:left-6 sm:top-3 md:left-8 md:top-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-105"
          title="PTSC Home"
        >
          <div className="relative size-8 sm:size-9 md:size-10 overflow-hidden rounded-lg bg-black/50 p-1 border border-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300 group-hover:border-[#FF355E]/60 group-hover:shadow-[0_0_20px_rgba(255,53,94,0.4)]">
            <Image
              src="/logo-pixel.png"
              alt="PTSC Pixel Logo"
              width={40}
              height={40}
              className="size-full object-contain [image-rendering:pixelated]"
              priority
            />
          </div>
          <span
            className="hidden text-[11px] font-bold tracking-wider text-white transition-colors group-hover:text-[#FF355E] sm:inline-block md:text-xs"
            style={{ fontFamily: "var(--font-press-start), monospace" }}
          >
            PTSC
          </span>
        </Link>
      </div>

      <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[10px] transition-colors sm:text-xs md:text-sm"
              style={{ color: "rgba(225, 224, 204, 0.8)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")
              }
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl px-6 py-6 md:hidden font-sans">
          <div className="flex flex-col gap-3">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white font-bold border-l-2 border-[#F47174]"
                      : "text-[#C4C9E2] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label === "Hire Us" ? (
                    <Highlighter
                      action="underline"
                      color="#F47174"
                      strokeWidth={3}
                    >
                      <span className="font-bold">{item.label}</span>
                    </Highlighter>
                  ) : (
                    item.label
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
