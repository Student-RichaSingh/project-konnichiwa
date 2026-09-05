import { buttonVariants } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EventItem } from "@/lib/events";
import Link from "next/link";

interface Card5Props {
  event: EventItem;
}

const Card5 = ({ event }: Card5Props) => {
  const timing = getEventDynamicStatus(event);
  const { isLive, isPast, label } = timing;

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBA";

  return (
    <Card className="group relative border-2 border-white/10 bg-[#0f0f0f] backdrop-blur-md rounded-3xl overflow-hidden pt-0 shadow-lg shadow-black/40 hover:scale-[1.05]  transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-full">
      {/* Decorative gradient orb behind content */}

      <div className="relative z-10">
        <CardContent className="px-0 relative overflow-hidden m-2 rounded-2xl">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            {event.coverImageUrl ? (
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#1A1033] to-[#0B0D19]">
                <div className="grid size-16 place-items-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(244,113,116,0.3)]">
                  <span className="text-[#F47174] font-bold tracking-widest">
                    PTSC
                  </span>
                </div>
              </div>
            )}

            {/* Playful Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80" />
          </div>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none z-20">
            <span className="rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_1px_1px_white] border border-white/20 ">
              {event.status || "Upcoming"}
            </span>
            <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-xs font-bold font-mono text-white flex items-center gap-1.5 shadow-lg">
              {formattedDate}
            </span>
          </div>
        </CardContent>

        <CardHeader className="space-y-2 pb-4 pt-4 px-6 relative z-10">
          <CardTitle className="text-xl font-black text-white font-sans tracking-tight group-hover:text-[#00F0FF] transition-colors duration-300">
            {event.title}
          </CardTitle>
          <CardDescription className="leading-relaxed text-[#A0A8C0] line-clamp-3 text-sm font-medium">
            {event.description}
          </CardDescription>
        </CardHeader>
      </div>

      <CardFooter className="border-t-2 border-white/5 gap-3 pt-5 pb-6 px-6 max-sm:flex-col max-sm:items-stretch bg-transparent relative z-10">
        <Link
          href={`/events/${event.slug || event._id}`}
          className={buttonVariants({
            variant: "sleek",
            size: "sm",
            className:
              "flex-1 text-center justify-center py-5 text-sm rounded-2xl shadow-[0_4px_15px_rgba(244,113,116,0.3)] hover:shadow-[0_6px_20px_rgba(244,113,116,0.5)] bg-gradient-to-r from-[#F47174] to-[#FF4D70] border-none",
          })}
        >
          {isLive ? "Join Event" : isPast ? "View Archive" : "View Event"}
        </Link>
        {event.ruleBookUrl && (
          <a
            href={event.ruleBookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "sleekNoBgSecondary",
              size: "sm",
              className:
                "flex-1 text-center justify-center py-5 text-sm rounded-2xl border-2 border-white/10 hover:border-[#00F0FF]/60 hover:bg-[#00F0FF]/10 hover:text-[#00F0FF] transition-all",
            })}
          >
            Rulebook
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default Card5;
