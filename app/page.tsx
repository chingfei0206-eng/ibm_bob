"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Sparkles, Plus, X, Wallet } from "lucide-react";

const THEMES = [
  { id: "港灣文青", label: "🌊 港灣文青" },
  { id: "歷史文化", label: "🏯 歷史文化" },
  { id: "美食探索", label: "🍜 美食探索" },
  { id: "親子樂園", label: "🎡 親子樂園" },
  { id: "自然生態", label: "🌿 自然生態" },
];

const TRANSPORT_OPTIONS = [
  { value: "大眾運輸", label: "🚇 大眾運輸（MRT、輕軌、公車）" },
  { value: "開車", label: "🚗 開車" },
  { value: "步行", label: "🚶 步行為主" },
  { value: "混合", label: "🔀 混合方式" },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [transport, setTransport] = useState("");
  const [days, setDays] = useState("");
  const [notes, setNotes] = useState("");
  // 必訪景點
  const [mustVisits, setMustVisits] = useState<string[]>([""]);
  // 預算
  const [budget, setBudget] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTheme = (theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  // 必訪景點操作
  const addMustVisit = () => setMustVisits((prev) => [...prev, ""]);
  const removeMustVisit = (i: number) =>
    setMustVisits((prev) => prev.filter((_, idx) => idx !== i));
  const updateMustVisit = (i: number, val: string) =>
    setMustVisits((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (selectedThemes.length === 0) newErrors.themes = "請至少選擇一個主題";
    if (!days) newErrors.days = "請選擇旅遊天數";
    if (!transport) newErrors.transport = "請選擇交通方式";
    if (budget && (isNaN(Number(budget)) || Number(budget) <= 0))
      newErrors.budget = "預算請輸入正整數金額";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const filledMustVisits = mustVisits.filter((v) => v.trim() !== "");
    const params = new URLSearchParams({
      themes: selectedThemes.join(","),
      adults: String(adults),
      children: String(kids),
      transport,
      days,
      notes,
      mustVisits: filledMustVisits.join("||"),
      budget,
    });
    router.push(`/itinerary?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero 區塊 */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-ocean-blue via-ocean-blue-dark to-[#003d5c] py-20 px-4 text-white"
        style={{ minHeight: "320px" }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-sand-white"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
              <MapPin className="h-8 w-8 text-coral-orange" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            高雄旅遊
            <span className="text-coral-orange"> AI </span>
            行程規劃
          </h1>
          <p className="mt-4 text-lg text-white/80">
            輸入您的旅遊條件，由 Agnes AI 為您量身打造專屬高雄行程
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm text-white/70">
            <span>🌊 港灣城市</span>
            <span>🎨 文創藝術</span>
            <span>🍜 道地美食</span>
            <span>🚇 便捷交通</span>
          </div>
        </div>
      </div>

      {/* 表單區塊 */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl bg-white shadow-lg p-6 md:p-8 space-y-7">

          {/* 旅遊主題 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              旅遊主題 <span className="text-coral-orange">*</span>
              <span className="ml-1 text-xs font-normal text-gray-400">（可複選）</span>
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {THEMES.map(({ id, label }) => (
                <label
                  key={id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-sm transition-colors ${
                    selectedThemes.includes(id)
                      ? "border-ocean-blue bg-ocean-blue/5 text-ocean-blue"
                      : "border-gray-200 hover:border-ocean-blue/40"
                  }`}
                >
                  <Checkbox
                    checked={selectedThemes.includes(id)}
                    onCheckedChange={() => toggleTheme(id)}
                  />
                  {label}
                </label>
              ))}
            </div>
            {errors.themes && (
              <p className="mt-1.5 text-xs text-red-500">{errors.themes}</p>
            )}
          </div>

          {/* 必訪景點 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              必訪景點
              <span className="ml-1 text-xs font-normal text-gray-400">（選填，可新增多個）</span>
            </label>
            <div className="space-y-2">
              {mustVisits.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      className="pl-8"
                      placeholder={`例如：旗津海水浴場、駁二藝術特區`}
                      value={val}
                      onChange={(e) => updateMustVisit(i, e.target.value)}
                    />
                  </div>
                  {mustVisits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMustVisit(i)}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMustVisit}
                className="flex items-center gap-1.5 text-xs text-ocean-blue hover:text-ocean-blue-dark font-medium mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                新增景點
              </button>
            </div>
          </div>

          {/* 人數 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                大人人數
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                小孩人數
              </label>
              <Input
                type="number"
                min={0}
                max={20}
                value={kids}
                onChange={(e) => setKids(Number(e.target.value))}
              />
            </div>
          </div>

          {/* 交通方式 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              交通方式 <span className="text-coral-orange">*</span>
            </label>
            <Select onValueChange={setTransport}>
              <SelectTrigger>
                <SelectValue placeholder="請選擇主要交通方式" />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.transport && (
              <p className="mt-1.5 text-xs text-red-500">{errors.transport}</p>
            )}
          </div>

          {/* 天數 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              旅遊天數 <span className="text-coral-orange">*</span>
            </label>
            <Select onValueChange={setDays}>
              <SelectTrigger>
                <SelectValue placeholder="請選擇天數" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} 天
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.days && (
              <p className="mt-1.5 text-xs text-red-500">{errors.days}</p>
            )}
          </div>

          {/* 旅遊預算 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              旅遊預算（全程總預算）
              <span className="ml-1 text-xs font-normal text-gray-400">（選填，單位：新台幣）</span>
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                min={0}
                className="pl-9"
                placeholder="例如：10000（不含餐飲）"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            {errors.budget && (
              <p className="mt-1.5 text-xs text-red-500">{errors.budget}</p>
            )}
            <p className="mt-1.5 text-xs text-gray-400">
              AI 將自動計算行程最低花費，若預算不足則以最低花費方案規劃
            </p>
          </div>

          {/* 特殊需求 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              特殊需求
              <span className="ml-1 text-xs font-normal text-gray-400">（選填）</span>
            </label>
            <Textarea
              placeholder="例如：素食者、需要無障礙設施、帶長輩同行、對海鮮過敏…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* 送出按鈕 */}
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleSubmit}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            開始 AI 規劃行程 ✈️
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          由 Agnes AI 驅動 · 行程依個人需求客製化生成
        </p>
      </div>
    </div>
  );
}
