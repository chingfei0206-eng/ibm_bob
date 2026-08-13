"use client";

import { SpotCard, type Spot } from "./SpotCard";
import { TransitSegment, type Transit } from "./TransitSegment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Ticket, Hotel, MoveRight } from "lucide-react";

export interface Day {
  day: number;
  title: string;
  spots: Spot[];
  transits: Transit[];
  overnight_transit?: Transit; // 當天最後景點 → 隔天第一景點的交通
}

interface DayCardProps {
  day: Day;
  totalPeople: number;
}

function calcDayCost(spots: Spot[], totalPeople: number) {
  let ticket = 0;
  let hotel = 0;
  for (const s of spots) {
    ticket += (s.ticket_price ?? 0) * totalPeople;
    hotel += (s.hotel_price_per_night ?? 0) * totalPeople;
  }
  return { ticket, hotel };
}

export function DayCard({ day, totalPeople }: DayCardProps) {
  const { ticket, hotel } = calcDayCost(day.spots, totalPeople);
  const hasTicket = ticket > 0;
  const hasHotel = hotel > 0;

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      {/* 日期 Header */}
      <CardHeader className="bg-gradient-to-r from-ocean-blue to-ocean-blue-dark text-white py-3 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4" />
            第 {day.day} 天｜{day.title}
          </CardTitle>
          {(hasTicket || hasHotel) && (
            <div className="flex items-center gap-3 text-xs text-white/80">
              {hasTicket && (
                <span className="flex items-center gap-1">
                  <Ticket className="h-3 w-3" />
                  門票 NT${ticket.toLocaleString()}
                </span>
              )}
              {hasHotel && (
                <span className="flex items-center gap-1">
                  <Hotel className="h-3 w-3" />
                  住宿 NT${hotel.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 px-4 pb-3">
        {day.spots.map((spot, i) => (
          <div key={i}>
            <SpotCard spot={spot} index={i} totalPeople={totalPeople} />
            {day.transits[i] && (
              <TransitSegment transit={day.transits[i]} />
            )}
          </div>
        ))}

        {/* 跨日交通：當天最後景點 → 隔天第一景點 */}
        {day.overnight_transit && (
          <div className="mt-3 rounded-lg border border-dashed border-ocean-blue/30 bg-ocean-blue/5 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-ocean-blue font-semibold mb-1.5">
              <MoveRight className="h-3.5 w-3.5" />
              前往隔天起點的交通規劃
            </div>
            <TransitSegment transit={day.overnight_transit} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
