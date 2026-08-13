"use client";

import { buildGoogleMapsSearchUrl } from "@/lib/maps";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Utensils, Hotel, Ticket } from "lucide-react";

export interface Spot {
  name: string;
  spot_type: "景點" | "餐廳" | "住宿";
  address: string;
  description: string;
  lat: number;
  lng: number;
  start_time: string;
  duration: string;
  ticket_price: number;
  hotel_price_per_night: number;
}

interface SpotCardProps {
  spot: Spot;
  index: number;
  totalPeople: number;
}

const TYPE_CONFIG = {
  景點: {
    icon: <MapPin className="h-3.5 w-3.5" />,
    badge: "bg-ocean-blue/10 text-ocean-blue",
    dot: "bg-ocean-blue",
  },
  餐廳: {
    icon: <Utensils className="h-3.5 w-3.5" />,
    badge: "bg-coral-orange/10 text-coral-orange",
    dot: "bg-coral-orange",
  },
  住宿: {
    icon: <Hotel className="h-3.5 w-3.5" />,
    badge: "bg-purple-100 text-purple-600",
    dot: "bg-purple-500",
  },
};

export function SpotCard({ spot, index, totalPeople }: SpotCardProps) {
  const mapsUrl = buildGoogleMapsSearchUrl(`${spot.name} ${spot.address}`);
  const type = spot.spot_type ?? "景點";
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG["景點"];
  const hotelTotal =
    spot.hotel_price_per_night > 0
      ? spot.hotel_price_per_night * totalPeople
      : null;
  const ticketTotal =
    spot.ticket_price > 0 ? spot.ticket_price * totalPeople : null;

  return (
    <div className="flex gap-3">
      {/* 時間軸 */}
      <div className="flex flex-col items-center w-14 shrink-0">
        <span className="text-xs font-semibold text-gray-500 tabular-nums leading-none mb-1">
          {spot.start_time}
        </span>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${config.dot}`}
        >
          {index + 1}
        </div>
        <div className="mt-1 w-0.5 flex-1 bg-gray-200 min-h-2" />
      </div>

      {/* 卡片內容 */}
      <div className="mb-3 flex-1 rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow">
        {/* 標題列 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${config.badge}`}
            >
              {config.icon}
              {type}
            </span>
            <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {spot.name}
            </h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-xs h-7 px-2 border-gray-300"
            onClick={() => window.open(mapsUrl, "_blank")}
          >
            <MapPin className="h-3 w-3 mr-1" />
            導航
          </Button>
        </div>

        <p className="mt-1 text-xs text-gray-500">{spot.address}</p>
        <p className="mt-1.5 text-xs text-gray-700 leading-relaxed">
          {spot.description}
        </p>

        {/* 底部資訊列 */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {spot.duration}
          </span>
          {ticketTotal !== null && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
              <Ticket className="h-3 w-3" />
              門票 NT${spot.ticket_price.toLocaleString()}／人
              <span className="text-gray-400">
                （{totalPeople}人合計 NT${ticketTotal.toLocaleString()}）
              </span>
            </span>
          )}
          {ticketTotal === null && type === "景點" && (
            <span className="text-xs text-green-600 font-medium">✓ 免費入場</span>
          )}
          {hotelTotal !== null && (
            <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
              <Hotel className="h-3 w-3" />
              NT${spot.hotel_price_per_night.toLocaleString()}／人晚
              <span className="text-gray-400">
                （{totalPeople}人合計 NT${hotelTotal.toLocaleString()}）
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
