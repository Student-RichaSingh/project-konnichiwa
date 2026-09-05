"use client";

import { Highlighter } from "@/components/ui/highlighter";

const TESTIMONIALS = [
  {
    id: "t1",
    name: "Aarav Mehta",
    role: "GSoC '25 @CNCF",
    quote:
      "PTSC completely changed how I approach coding. The community pushes you to build real-world systems rather than just passing tests.",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  },
  {
    id: "t2",
    name: "Riya Sen",
    role: "Software Engineer @Google",
    quote:
      "The hackathons and dev sprints at PTSC gave me the confidence to coordinate projects under tight deadlines. A fantastic place to learn!",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    id: "t3",
    name: "Kabir Malhotra",
    role: "ICPC Regionalist",
    quote:
      "The CP culture here is unmatched. Mentorship from seniors who've been there made cracking hard algorithmic challenges feel achievable.",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative bg-transparent py-32 bg-zinc-950 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-zinc-950 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-mono font-bold text-[#F47174] uppercase tracking-widest mb-3">
            Voices of PTSC
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
            What Our{" "}
            <Highlighter action="underline" color="#F47174" strokeWidth={4}>
              <span className="text-white">Alumni Say</span>
            </Highlighter>
          </h2>
          <p className="mt-4 text-base text-[#8C93B0] max-w-xl mx-auto leading-relaxed">
            Stories of growth, mentorship, and career acceleration directly from
            the club members.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="group relative rounded-[2rem] border-2 border-white/10 bg-[#0f0f0f] p-8 transition-all duration-500 hover:scale-[1.05]  flex flex-col justify-between"
            >
              {/* Quote bubble decor */}
              <div className="absolute top-6 right-8 text-7xl font-serif text-white/5 pointer-events-none">
                “
              </div>

              <p className="text-[#A0A8C0] text-sm sm:text-base leading-relaxed italic relative z-10 mb-8">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4 border-t border-white/5 pt-6 mt-auto">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="size-12 rounded-full border border-white/20 object-cover"
                />
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-[#F47174] transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs text-[#00F0FF] font-semibold mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
