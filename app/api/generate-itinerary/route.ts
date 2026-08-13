import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://apihub.agnes-ai.com/v1",
  apiKey: process.env.AGNES_API_KEY,
});

// ── 高雄景點知識庫（參考 khh.travel，含營業時間）─────────────────────
const KAOHSIUNG_SPOTS_KNOWLEDGE = `
【高雄景點知識庫 — 請優先選取，並確保同天景點地理相近】

▌鹽埕 / 駁二 / 西子灣區（可步行串聯）
- 駁二藝術特區：文創市集 / 營業 10:00-21:00（週末延至22:00）/ 座標(22.626, 120.282)
- 西子灣：全天開放（日落前最佳）/ 座標(22.627, 120.267)
- 哈瑪星台灣鐵道館：09:00-18:00，週一休館 / 座標(22.624, 120.279)
- 打狗英國領事館文化園區：09:00-21:00 / 座標(22.627, 120.271)
- 鹽埕老街 / 大溝頂：小吃攤位多在 10:00-20:00 / 座標(22.630, 120.284)

▌苓雅 / 前金 / 美麗島區（MRT 橘線紅線交叉）
- 美麗島站光之穹頂：全天 / 座標(22.632, 120.302)
- 六合夜市：17:00-02:00（夜市，勿安排午前） / 座標(22.636, 120.304)
- 玫瑰聖母堂：06:00-21:00 / 座標(22.630, 120.302)
- 高雄市立歷史博物館：09:00-17:00，週一休館，免費 / 座標(22.632, 120.296)
- 愛河之心：全天，夜間有燈光 / 座標(22.643, 120.301)

▌左營 / 蓮池潭區（MRT 紅線北段）
- 蓮池潭龍虎塔：08:30-17:30 / 座標(22.700, 120.298)
- 左營舊城：全天開放 / 座標(22.700, 120.296)
- 高雄都會公園：06:00-22:00，免費 / 座標(22.723, 120.313)
- 洲仔濕地公園：09:00-17:00，週一休 / 座標(22.693, 120.306)

▌旗津 / 小港區（渡輪 24H；景點多 08:00 後）
- 旗津海水浴場：全天 / 座標(22.614, 120.271)
- 旗後燈塔：09:00-16:00，週一休 / 座標(22.608, 120.264)
- 旗後砲台：09:00-18:00 / 座標(22.609, 120.265)

▌大東 / 鳳山區（MRT 橘線東段）
- 大東文化藝術中心：10:00-21:00，週一休 / 座標(22.630, 120.358)
- 衛武營國家藝術文化中心：依演出，外觀全天 / 座標(22.620, 120.340)
- 鳳山老街 / 城隍廟：全天，夜市傍晚起熱鬧 / 座標(22.627, 120.358)

▌橋頭 / 楠梓區（MRT 紅線北段）
- 橋頭糖廠：09:00-18:00 / 座標(22.758, 120.302)
- 高雄科學工藝博物館：09:00-17:00，週一休 / 座標(22.688, 120.317)

▌郊區（開車半日遊）
- 美濃老街：09:00-18:00 / 座標(22.893, 120.537)
- 旗山老街：09:00-18:00 / 座標(22.886, 120.479)
- 茂林國家風景區：全天（需開車） / 座標(22.906, 120.661)

▌高雄在地餐廳（全部位於高雄市境內，依區域與時段嚴格對應）
── 鹽埕 / 駁二 區 ──
[早餐 07:00-13:00] 連家肉粽：高雄市鹽埕區大勇路，07:00-13:00
[早餐 08:00-12:00] 德興糕餅：高雄市鹽埕區七賢三路，08:00-12:00
[午晚 11:00-21:00] 阿婆壽司：高雄市鹽埕區大勇路，11:00-21:00
[午晚 10:00-19:00] 三和市場排骨飯：高雄市鹽埕區三和里，10:00-19:00
[午晚 11:00-20:00] 七賢路老牌鱔魚意麵：高雄市鹽埕區七賢三路，11:00-20:00

── 美麗島 / 新興 / 苓雅 區 ──
[早餐 07:00-11:00] 明誠三路早餐街（鐵板燒早餐）：高雄市苓雅區明誠三路，07:00-11:00
[早餐 06:30-11:00] 富野早餐：高雄市新興區中正四路，06:30-11:00
[午晚 11:00-21:00] 鹽埕第一市場（綜合熟食）：高雄市鹽埕區富野路，11:00-21:00
[晚 18:00-02:00]   六合夜市小吃：高雄市新興區六合二路，18:00-02:00
[晚 18:00-00:00]   興中夜市：高雄市苓雅區興中一路，18:00-00:00
[午晚 11:30-21:00] 阿明豬腳麵線：高雄市新興區中山一路，11:30-21:00

── 左營 / 蓮池潭 區 ──
[早午 06:00-11:00] 左營豆漿早點：高雄市左營區左營大路，06:00-11:00
[午晚 11:00-21:00] 海青王家羊肉：高雄市左營區海青路，11:00-21:00
[午晚 11:00-20:00] 蓮潭會館素食餐廳：高雄市左營區蓮潭路，11:00-20:00
[午晚 10:30-19:30] 眷村豆花：高雄市左營區龜山路，10:30-19:30

── 旗津 區 ──
[午晚 10:00-20:00] 旗津海產粥：高雄市旗津區廟前路，10:00-20:00
[午晚 11:00-21:00] 旗津炭烤海鮮：高雄市旗津區旗津三路，11:00-21:00
[午晚 11:00-19:00] 旗津廟口蚵仔煎：高雄市旗津區旗津二路，11:00-19:00

── 鳳山 區 ──
[午 10:00-18:00]   鳳山肉圓：高雄市鳳山區中山西路，10:00-18:00
[早午 08:00-18:00] 仁愛市場熟食區：高雄市鳳山區仁愛路，08:00-18:00
[午晚 11:00-21:00] 鳳山滷肉飯老店：高雄市鳳山區青年路，11:00-21:00

── 三民 / 九如 區 ──
[早餐 06:00-11:00] 瑞豐早市：高雄市三民區九如二路，06:00-11:00
[晚 18:00-01:00]   瑞豐夜市：高雄市三民區裕誠路，18:00-01:00
[午晚 11:00-20:00] 三民牛肉湯：高雄市三民區建工路，11:00-20:00

── 橋頭 / 楠梓 區 ──
[午晚 11:00-19:00] 橋頭糖廠冰品部：高雄市橋頭區糖廠路，11:00-19:00（園區內）
[午晚 11:00-20:00] 楠梓在地小吃：高雄市楠梓區楠陽路，11:00-20:00

── 郊區（美濃 / 旗山 / 茂林）──
[午晚 10:00-18:00] 美濃客家板條：高雄市美濃區中山路，10:00-18:00
[午晚 10:00-17:00] 旗山老街香蕉冰：高雄市旗山區中山路，10:00-17:00

▌住宿推薦
[市中心 MRT 沿線] 寒軒國際大飯店（三多商圈）、高雄漢來大飯店（成功路）、高雄福華大飯店
[駁二/鹽埕] 城市商旅真愛館、天閣酒店
[平價] 嘉年華商務旅館（中華路）、驛站旅館（MRT 近站）
`;

const SYSTEM_PROMPT = `你是一位專業的高雄旅遊行程規劃師，依下方知識庫規劃行程。

${KAOHSIUNG_SPOTS_KNOWLEDGE}

【強制規則，全部必須遵守】
1. 只回傳純 JSON 物件，禁止任何文字說明、Markdown、code fence
2. 同一天景點必須集中在地理相近區域（步行或 10 分鐘以內）
3. 不同區域分配到不同天，避免跨區來回
4. 嚴格依照各景點和餐廳的營業時間安排 start_time，絕對不得在「未營業時段」安排任何景點或餐廳
5. 餐廳【必須且只能】從上方「高雄在地餐廳」清單中選取，禁止自行創造或使用清單以外的餐廳
6. 所有地址必須是「高雄市」開頭，禁止出現高雄市以外的任何地點
7. 每天必須包含早餐、午餐、晚餐各一處（spot_type: "餐廳"），依餐廳的開放時間安排（早餐需在餐廳開門時段內、午餐在 11:00-14:00 之間開始、晚餐在 17:30-19:30 之間開始），若當區域早餐選項不符，則從鄰近區選擇
8. 除最後一天外，每天結尾必須加一個住宿（spot_type: "住宿"）
9. start_time 嚴格按時間順序從早到晚排列（09:00 起），景點間需預留交通時間
10. ticket_price：免費填 0，有票填新台幣整數；餐廳住宿填 0
11. hotel_price_per_night：僅住宿填每晚每人均價整數；其餘填 0
12. 公車填 bus_from_stop/bus_to_stop；非公車填空字串
13. 同一間飯店連住至少 3 晚才換（行程少於 3 天全程住同一間）
14. overnight_transit：多天行程中，每天（最後一天除外）必須提供從當天最後景點前往隔天第一景點的交通規劃

回傳 JSON 結構（嚴格照此，不能多也不能少欄位）：
{"estimated_min_cost":整數,"days":[{"day":整數,"title":"標題","spots":[{"name":"名稱","spot_type":"景點|餐廳|住宿","address":"高雄市...","description":"說明","lat":數字,"lng":數字,"start_time":"HH:MM","duration":"X小時|X分鐘","ticket_price":整數,"hotel_price_per_night":整數}],"transits":[{"from":"起點名稱","to":"終點名稱","transport_type":"MRT|輕軌|公車|步行|開車","duration":"X分鐘","bus_from_stop":"","bus_to_stop":""}],"overnight_transit":{"from":"當天最後景點名","to":"隔天第一景點名","transport_type":"MRT|輕軌|公車|步行|開車","duration":"X分鐘","bus_from_stop":"","bus_to_stop":""}或null}]}

transits 數量 = spots 數量 - 1（相鄰景點間的交通）。
overnight_transit：多天行程每天（最後一天除外）填入；一日遊或最後一天填 null。`;

export async function POST(req: NextRequest) {
  if (!process.env.AGNES_API_KEY) {
    return NextResponse.json(
      { error: "AGNES_API_KEY 未設定，請檢查 .env.local" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { themes, adults, children, transport, days, notes, mustVisits, budget } = body;
  const totalPeople = Number(adults) + Number(children);
  const daysNum = Number(days);

  const mustVisitList: string[] =
    mustVisits && mustVisits.trim() !== ""
      ? mustVisits.split("||").filter((v: string) => v.trim() !== "")
      : [];

  const hotelRotationRule =
    daysNum >= 3
      ? `住宿原則：同一飯店連住至少 3 晚，${daysNum} 天最多換 ${Math.floor(daysNum / 3)} 次飯店。`
      : `住宿原則：全程住同一間飯店，不換。`;

  const budgetInstruction =
    budget && Number(budget) > 0
      ? `預算 NT$${Number(budget).toLocaleString()}（${totalPeople}人）。優先免費景點、平價住宿。estimated_min_cost 填最低花費。`
      : `estimated_min_cost 填門票+住宿合計。`;

  const userPrompt = `規劃高雄旅遊行程：
主題：${(themes as string[]).join("、")} | 人數：${totalPeople}人 | 交通：${transport} | 天數：${daysNum}天
${mustVisitList.length > 0 ? `必訪景點（必須排入）：${mustVisitList.join("、")}` : ""}
${notes ? `特殊需求：${notes}` : ""}
${budgetInstruction}
${hotelRotationRule}

行程要求：
- 所有景點、餐廳、住宿地點均限定在高雄市境內，address 必須以「高雄市」開頭
- 餐廳只能從知識庫「高雄在地餐廳」清單中選取，禁止自行創造任何清單外的餐廳名稱
- 每天 2 個觀光景點（地理相近）+ 早餐/午餐/晚餐各一間餐廳，餐廳需與同天景點地理相近或為同區
- 早餐安排在餐廳開門時段內（最早 09:00 開始排）、午餐 start_time 在 11:00-13:00、晚餐 start_time 在 17:30-19:00
- 嚴格依各地點營業時間安排，start_time 必須在該地點的開放時間範圍內，不在未營業時段安排
- 所有 spots 嚴格按時間順序（start_time 從早到晚）
- ${daysNum > 1 ? `第 1~${daysNum - 1} 天末尾各加住宿，最後一天不加` : "一日遊，不加住宿"}
- ${daysNum > 1 ? "每天（最後一天除外）必須填 overnight_transit，規劃前往隔天第一景點的交通" : "overnight_transit 填 null"}`;

  try {
    const completion = await client.chat.completions.create({
      model: "agnes-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // 強健 JSON 提取：取第一個 { 到最後一個 }
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.error("找不到 JSON 結構，原始回傳：", raw.substring(0, 300));
      return NextResponse.json(
        { error: "AI 回傳格式解析失敗，請重試" },
        { status: 500 }
      );
    }

    let itinerary;
    try {
      itinerary = JSON.parse(raw.substring(firstBrace, lastBrace + 1));
    } catch {
      console.error("JSON 解析失敗，原始片段：", raw.substring(0, 500));
      return NextResponse.json(
        { error: "AI 回傳格式解析失敗，請重試" },
        { status: 500 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Agnes AI 呼叫失敗：", error);
    return NextResponse.json(
      { error: "AI 服務暫時無法使用，請稍後再試" },
      { status: 500 }
    );
  }
}
