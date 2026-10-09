"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SOCIAL_PLATFORMS } from "@/components/landing/landing-data";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="relative mt-auto w-full overflow-hidden border-t border-[#F47174]/40 bg-[#0f0f0f]">
      {/* One soft brand glow along the top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[60%] -translate-x-1/2 rounded-full bg-[#F47174]/10 blur-[100px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-12">
        <div className="grid gap-10 py-14 sm:py-16 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-16">
          {/* Brand + socials */}
          <div className="flex flex-col items-start gap-6">
            <Link href="/" className="group flex items-center gap-3" aria-label="PTSC home">
              <span className="relative block size-12 rounded-xl border border-white/10 bg-[#141414] p-2 transition-[border-color,box-shadow] duration-200 group-hover:border-[#F47174]/50 group-hover:shadow-[0_0_24px_rgba(244,113,116,0.3)]">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  className="object-contain p-2"
                />
              </span>
              <span className="flex items-center gap-0.5 font-sans text-2xl font-black tracking-tight text-white">
                PTSC<span className="text-[#F47174]">.</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-[#8C93B0]">
              Building the next generation of builders, hackers, and creators at KNIT Sultanpur.
            </p>

            <ul className="flex flex-wrap items-center gap-2.5">
              {SOCIAL_PLATFORMS.slice(0, 8).map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <li key={platform.name}>
                    <a
                      href={platform.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid size-11 place-items-center rounded-xl border border-white/10 bg-[#141414] text-[#8C93B0] transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#F47174]/60 hover:bg-[#F47174]/10 hover:text-white"
                      title={platform.name}
                      aria-label={platform.name}
                    >
                      <IconComponent className="size-5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Site navigation */}
          <nav aria-label="Footer" className="md:justify-self-end">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Explore
            </p>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[#8C93B0] transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-6 text-xs text-[#8C93B0] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} PTSC.
            <span className="ml-1 text-white/55">Built by students, for students.</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white">Terms of Service</a>
            <a href="#" className="flex items-center gap-1 transition-colors hover:text-[#F47174]">
              Level Up <span aria-hidden="true" className="text-base leading-none">↗</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
