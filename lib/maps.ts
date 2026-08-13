/**
 * 建立 Google Maps 搜尋連結（單一景點）
 */
export function buildGoogleMapsSearchUrl(destination: string): string {
  const query = encodeURIComponent(destination);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * 建立 Google Maps 路線導航連結（起訖點）
 * transportType: "MRT" | "輕軌" | "公車" | "步行" | "開車"
 */
export function buildGoogleMapsDirectionUrl(
  origin: string,
  destination: string,
  transportType: string
): string {
  const travelModeMap: Record<string, string> = {
    MRT: "transit",
    輕軌: "transit",
    公車: "transit",
    步行: "walking",
    開車: "driving",
  };
  const travelmode = travelModeMap[transportType] ?? "transit";
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(destination)}` +
    `&travelmode=${travelmode}`
  );
}
