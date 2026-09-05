"use client";

import { Highlighter } from "@/components/ui/highlighter";
import { ArrowUpRight } from "lucide-react";

const FREELANCE_PROJECTS = [
  {
    id: "f1",
    title: "College ERP Portal",
    type: "Web Development",
    desc: "A centralized academic and administrative portal designed for streamlined campus operations.",
    link: "#",
    tech: ["Next.js", "Express", "PostgreSQL"],
  },
  {
    id: "f2",
    title: "Alumni Network Platform",
    type: "Platform & Community",
    desc: "Connecting thousands of KNIT graduates globally with current students for mentorship and job referrals.",
    link: "#",
    tech: ["React", "Node.js", "MongoDB"],
  },
  {
    id: "f3",
    title: "Department E-Library",
    type: "Resource Management",
    desc: "Digital repository hosting research papers, lectures, and semester archives for student access.",
    link: "#",
    tech: ["TailwindCSS", "Next.js", "Supabase"],
  },
];

export function FreelanceSection() {
  return (
    <section
      id="freelance"
      className="relative bg-transparent py-32  overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-[#0f0f0f] blur-[130px]" />
     
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-mono font-bold text-[#F47174] uppercase tracking-widest mb-3">
            Freelance & Consultancy
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
            Our Freelance{" "}
            <Highlighter action="underline" color="#F47174" strokeWidth={4}>
              <span className="text-white">Work</span>
            </Highlighter>
          </h2>
          <p className="mt-4 text-base text-[#8C93B0] max-w-xl mx-auto leading-relaxed">
            Professional projects built by PTSC talent for institutional
            clients, departments, and community partners.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {FREELANCE_PROJECTS.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-[2rem] border-2 border-white/10 bg-[#0f0f0f] p-8 transition-all duration-500 hover:scale-[1.05] flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#00F0FF] mb-6">
                  {p.type}
                </span>
                <h3 className="text-2xl font-black text-white group-hover:text-[#00F0FF] transition-colors mb-4">
                  {p.title}
                </h3>
                <p className="text-sm text-[#A0A8C0] leading-relaxed mb-8">
                  {p.desc}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono text-[#8C93B0] bg-white/5 px-2.5 py-1 rounded-md border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <a
                  href={p.link}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white hover:text-[#00F0FF] transition-colors"
                >
                  View Case Study <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
