"use client";

import { buildGoogleMapsDirectionUrl } from "@/lib/maps";
import { Train, Bus, Car, Footprints, ArrowRight, ExternalLink } from "lucide-react";

export interface Transit {
  from: string;
  to: string;
  transport_type: string;
  duration: string;
  bus_from_stop?: string;
  bus_to_stop?: string;
}

interface TransitSegmentProps {
  transit: Transit;
}

const transportIcons: Record<string, React.ReactNode> = {
  MRT: <Train className="h-3.5 w-3.5" />,
  輕軌: <Train className="h-3.5 w-3.5" />,
  公車: <Bus className="h-3.5 w-3.5" />,
  步行: <Footprints className="h-3.5 w-3.5" />,
  開車: <Car className="h-3.5 w-3.5" />,
};

export function TransitSegment({ transit }: TransitSegmentProps) {
  const mapsUrl = buildGoogleMapsDirectionUrl(
    transit.from,
    transit.to,
    transit.transport_type
  );
  const icon =
    transportIcons[transit.transport_type] ?? <Train className="h-3.5 w-3.5" />;
  const isBus = transit.transport_type === "公車";
  const hasStops = isBus && transit.bus_from_stop && transit.bus_to_stop;

  return (
    <div className="flex gap-3 items-stretch my-0.5">
      {/* 左側時間軸（對齊 SpotCard 的 w-14） */}
      <div className="flex flex-col items-center w-14 shrink-0">
        <div className="w-0.5 flex-1 bg-gray-200" />
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
        <div className="w-0.5 flex-1 bg-gray-200" />
      </div>

      {/* 交通資訊列 */}
      <div className="flex-1 rounded-md bg-gray-50 border border-gray-100 px-3 py-2 text-xs mb-1">
        {/* 第一行：交通方式 + 時間 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-gray-600">{transit.transport_type}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">{transit.duration}</span>
        </div>

        {/* 公車站點 */}
        {hasStops && (
          <div className="flex items-center gap-1 mt-0.5 text-gray-500">
            <Bus className="h-3 w-3 text-orange-400 shrink-0" />
            <span className="text-orange-600 font-medium">{transit.bus_from_stop}</span>
            <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="text-orange-600 font-medium">{transit.bus_to_stop}</span>
          </div>
        )}

        {/* Google Maps 超連結 */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-1 text-ocean-blue hover:text-ocean-blue-dark underline underline-offset-2 font-medium"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          在 Google Maps 查看路線
        </a>
      </div>
    </div>
  );
}
