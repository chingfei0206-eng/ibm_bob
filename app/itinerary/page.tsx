"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DayCard, type Day } from "@/components/itinerary/DayCard";
import { type Spot } from "@/components/itinerary/SpotCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, MapPin, Ticket, Hotel, Receipt, Wallet, AlertTriangle, CheckCircle } from "lucide-react";

interface Itinerary {
  estimated_min_cost?: number;
  days: Day[];
}

/** 計算全程費用 */
function calcTotalCost(days: Day[], totalPeople: number) {
  let ticket = 0;
  let hotel = 0;
  for (const day of days) {
    for (const s of day.spots) {
      ticket += ((s as Spot).ticket_price ?? 0) * totalPeople;
      hotel += ((s as Spot).hotel_price_per_night ?? 0) * totalPeople;
    }
  }
  return { ticket, hotel, total: ticket + hotel };
}

function ItineraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themes = searchParams.get("themes")?.split(",") ?? [];
  const adults = searchParams.get("adults") ?? "2";
  const children = searchParams.get("children") ?? "0";
  const transport = searchParams.get("transport") ?? "大眾運輸";
  const days = searchParams.get("days") ?? "2";
  const notes = searchParams.get("notes") ?? "";
  const mustVisits = searchParams.get("mustVisits") ?? "";
  const budget = searchParams.get("budget") ?? "";
  const totalPeople = Number(adults) + Number(children);
  const budgetNum = budget ? Number(budget) : 0;

  const fetchItinerary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themes, adults, children, transport, days, notes, mustVisits, budget }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "未知錯誤");
      }
      const data = await res.json();
      setItinerary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤，請重試");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cost = itinerary ? calcTotalCost(itinerary.days, totalPeople) : null;

  return (
    <div className="min-h-screen bg-sand-white">
      {/* 頂部 Header */}
      <div className="bg-gradient-to-r from-ocean-blue to-ocean-blue-dark text-white px-4 py-5 shadow-md">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <button
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            重新規劃
          </button>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-coral-orange" />
            <span className="font-semibold">高雄 {days} 天行程</span>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            onClick={fetchItinerary}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            重新生成
          </button>
        </div>
      </div>

      {/* 主內容 */}
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
        {/* 行程標籤 */}
        {!loading && !error && (
          <div className="flex flex-wrap gap-2 text-sm">
            {themes.map((t) => (
              <span
                key={t}
                className="rounded-full bg-ocean-blue/10 text-ocean-blue px-3 py-1 font-medium"
              >
                {t}
              </span>
            ))}
            <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1">
              {transport}
            </span>
            <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1">
              大人 {adults} 位{Number(children) > 0 ? `、小孩 ${children} 位` : ""}
            </span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-ocean-blue text-sm font-medium">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Agnes AI 正在為您規劃專屬行程…
              </div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-md">
                <Skeleton className="h-14 rounded-none" />
                <div className="bg-white p-5 space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex gap-4">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 錯誤狀態 */}
        {error && !loading && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
            <Button
              variant="outline"
              className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
              onClick={fetchItinerary}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              重試
            </Button>
          </div>
        )}

        {/* 行程內容 */}
        {itinerary && !loading && (
          <>
            {itinerary.days.map((day) => (
              <DayCard key={day.day} day={day} totalPeople={totalPeople} />
            ))}

            {/* 全程費用摘要 */}
            {cost && cost.total > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-4 py-3">
                  <Receipt className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-700 text-sm">
                    全程費用預估（{totalPeople} 人）
                  </span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {cost.ticket > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Ticket className="h-4 w-4 text-amber-500" />
                        景點門票合計
                      </span>
                      <span className="font-semibold text-amber-600">
                        NT${cost.ticket.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {cost.hotel > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Hotel className="h-4 w-4 text-purple-500" />
                        住宿費用合計
                      </span>
                      <span className="font-semibold text-purple-600">
                        NT${cost.hotel.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm font-bold">
                    <span className="text-gray-800">預估總花費</span>
                    <span className="text-ocean-blue text-base">
                      NT${cost.total.toLocaleString()}
                    </span>
                  </div>

                  {/* 預算比對 */}
                  {budgetNum > 0 && (
                    <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm mt-1 ${
                      budgetNum >= cost.total
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {budgetNum >= cost.total ? (
                        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold flex items-center gap-1.5">
                          <Wallet className="h-3.5 w-3.5" />
                          您的預算：NT${budgetNum.toLocaleString()}
                        </span>
                        {budgetNum >= cost.total ? (
                          <p className="text-xs mt-0.5">
                            預算充裕！剩餘約 NT${(budgetNum - cost.total).toLocaleString()}，可用於餐飲或其他消費
                          </p>
                        ) : (
                          <p className="text-xs mt-0.5">
                            預算低於最低花費 NT${(cost.total - budgetNum).toLocaleString()}，AI 已為您安排最低花費版本行程
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 pt-1">
                    ＊不含餐飲費用，實際費用以現場為準
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 pb-8 text-center">
              <Button
                variant="outline"
                className="mr-3"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                重新規劃
              </Button>
              <Button onClick={fetchItinerary}>
                <RefreshCw className="mr-2 h-4 w-4" />
                重新生成行程
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-ocean-blue" />
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  );
}
