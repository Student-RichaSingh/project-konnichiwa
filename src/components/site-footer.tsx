"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SOCIAL_PLATFORMS } from "@/components/landing/landing-data";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full relative overflow-hidden bg-transparent pt-20 pb-12 mt-auto border-t-[3px] border-[#F47174]/40">
      {/* Decorative Anime Background Accents */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-[40%] h-[100px] bg-[#F47174]/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[30%] h-[150px] bg-[#00F0FF]/20 blur-[120px] rounded-full" />
        {/* Floating Stars */}
        <div className="absolute top-12 left-[10%] text-[#FFB800] opacity-50 animate-pulse text-xl">✦</div>
        <div className="absolute top-8 right-[15%] text-[#00F0FF] opacity-40 animate-pulse text-2xl delay-75">✦</div>
        <div className="absolute bottom-16 right-[30%] text-[#F47174] opacity-30 animate-pulse text-lg delay-150">✦</div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:px-12">
        
        {/* Call to Action / Brand Vibe */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/" className="group flex flex-col items-center gap-4 transition-transform hover:scale-105 duration-300">
            <div className="relative size-16 bg-[#140D26] rounded-2xl border-2 border-white/10 p-2 shadow-[0_0_20px_rgba(244,113,116,0.3)] group-hover:border-[#F47174]/50 group-hover:shadow-[0_0_30px_rgba(244,113,116,0.6)] transition-all">
               <Image
                 src="/logo.png"
                 alt="PTSC logo"
                 fill
                 className="object-contain p-2"
               />
            </div>
            <span className="text-3xl font-black tracking-tight text-white font-sans flex items-center gap-1">
              PTSC<span className="text-[#F47174]">.</span>
            </span>
          </Link>
          <p className="text-sm font-semibold tracking-wider text-[#8C93B0] max-w-sm leading-relaxed">
            Building the next generation of builders, hackers, and creators at KNIT Sultanpur.
          </p>
        </div>

        {/* Social platform icons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {SOCIAL_PLATFORMS.slice(0, 8).map((platform) => {
            const IconComponent = platform.icon;
            return (
              <a
                key={platform.name}
                href={platform.link}
                className="group relative grid size-12 place-items-center rounded-2xl border-2 border-white/5 bg-[#140D26] text-[#8C93B0] transition-all duration-300 hover:border-[#F47174]/60 hover:bg-[#F47174]/10 hover:text-white hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(244,113,116,0.2)]"
                title={platform.name}
                aria-label={platform.name}
              >
                <IconComponent className="size-5 transition-transform group-hover:scale-110" />
              </a>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom Details */}
        <div className="flex flex-col md:flex-row w-full items-center justify-between gap-4 text-xs font-mono font-semibold text-[#8C93B0]/70">
          <p>
            © {new Date().getFullYear()} PTSC. 
            <span className="text-white/50 ml-1">Built by students, for students.</span>
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white hover:underline transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white hover:underline transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#F47174] transition-colors flex items-center gap-1">
               Level Up <span className="text-base leading-none">↗</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
