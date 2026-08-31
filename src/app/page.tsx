import { PrismaHero } from "@/components/landing/newHero";
import { EventsSection } from "@/components/landing/events-section";
import { GallerySection } from "@/components/landing/gallery-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FreelanceSection } from "@/components/landing/freelance-section";
import { ContactSection } from "@/components/landing/contact-section";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { getEvents } from "@/lib/events";
import { getEventDynamicStatus } from "@/lib/event-status";
import { TeamSection } from "@/components/landing/team-section";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fetch events once at the server level — prioritize live and upcoming
export default async function Home() {
  const allEvents = await getEvents();
  const now = new Date();

  const sortedForLanding = [...allEvents].sort((a, b) => {
    const timingA = getEventDynamicStatus(a, now);
    const timingB = getEventDynamicStatus(b, now);

    const rank = (s: string) => (s === "live" ? 0 : s === "upcoming" ? 1 : 2);
    const rankA = rank(timingA.status);
    const rankB = rank(timingB.status);

    if (rankA !== rankB) return rankA - rankB;

    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;

    if (rankA === 1) {
      return dateA - dateB; // Soonest upcoming first
    }
    return dateB - dateA; // Newest date first for live / past
  });

  const landingEvents = sortedForLanding.slice(0, 4);

  return (
    <div
      className="relative overflow-x-clip min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ color: "zinc-950" }}
    >
      {/* Global Noise Texture Overlay */}
      <NoiseTexture
        className="opacity-[0.22] mix-blend-overlay"
        noiseOpacity={0.5}
      />

      <PrismaHero />
      <EventsSection events={landingEvents} />
      <GallerySection />
      <TestimonialsSection />
      <FreelanceSection />
      <TeamSection />
      <ContactSection />
    </div>
  );
}
