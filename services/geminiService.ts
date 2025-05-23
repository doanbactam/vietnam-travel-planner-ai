
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PlanRequest, ItineraryData, ActivityItem } from "../types"; // Added ActivityItem for potential use if needed, though not directly used in this change

const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

if (!process.env.API_KEY) {
  console.error("API Key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateItinerary = async (request: PlanRequest): Promise<ItineraryData> => {
  try {
    const promptParts = [
      "Bạn là một chuyên gia hoạch định du lịch AI, chuyên sâu về các điểm đến tại Việt Nam và am hiểu văn hóa, lễ hội địa phương.",
      "Hãy tạo một kế hoạch du lịch chi tiết, hấp dẫn và khả thi cho chuyến đi đến ViệtNam dựa trên các thông tin sau:\n",
      `1. **Điểm khởi hành (nếu có):** ${request.departurePoint || "Không được cung cấp (có thể bắt đầu từ điểm đến đầu tiên)"}`,
      `2. **Các điểm đến chính:** ${request.destinations}`,
      `3. **Thời gian chuyến đi:** ${request.duration} ngày`,
      `4. **Số lượng người đi (nếu có):** ${request.numberOfTravelers || "1 người (mặc định)"}. Nếu có nhiều người, hãy cân nhắc các hoạt động/gợi ý phù hợp cho nhóm.`,
      `5. **Sở thích:** ${request.interests || "Tổng hợp (bao gồm văn hóa, lịch sử, thiên nhiên, ẩm thực, thư giãn/nghỉ ngơi, khám phá, phiêu lưu, mua sắm). Nếu có sở thích cụ thể, hãy ưu tiên các hoạt động liên quan."}`,
      `6. **Ưu tiên về khách sạn:** ${request.hotelPreference || "Bất kỳ"}. AI chỉ cần đưa ra gợi ý chung về loại hình lưu trú (ví dụ: "Khách sạn 3 sao tiện nghi", "Homestay gần gũi văn hóa địa phương") trong \`accommodationSuggestion\`, không cần tên khách sạn cụ thể. Hãy cung cấp khoảng giá ước tính (minPrice, maxPrice) cho gợi ý lưu trú nếu có thể, đơn vị VND.`,
      `7. **Mục đích chuyến đi (nếu có):** ${request.tripPurpose || "Không xác định"}. Điều chỉnh phong cách lịch trình cho phù hợp (ví dụ: gia đình thì thoải mái, cặp đôi thì lãng mạn, bạn bè thì năng động).`,
      "\n**YÊU CẦU VỀ ĐỊNH DẠNG OUTPUT (JSON):**",
      "Luôn trả về một đối tượng JSON duy nhất, không có ký tự ```json ``` bao quanh. Đối tượng JSON phải tuân thủ nghiêm ngặt cấu trúc TypeScript `ItineraryData` sau:\n",
      "```typescript",
// FIX: Replaced the placeholder comment and old interface definitions with a complete set of explicit interface definitions.
// This includes defining AccommodationSuggestion and other related types, and updating ItineraryData to use these named types.
`
export interface ActivityItem {
  id?: string; // Frontend sẽ tự tạo nếu không có
  type: 'activity' | 'food' | 'transport' | 'note' | 'interaction';
  description: string; // Mô tả chính của hoạt động
  icon?: string; // Emoji gợi ý (ví dụ: 🏛️, 🍜, 🚶)
  details?: string; // Thông tin chi tiết thêm (giờ mở cửa, mẹo nhỏ, lý do gợi ý, v.v.)
  estimatedCost?: number; // Chi phí ước tính (số nguyên, ví dụ: 150000)
  currency?: string; // Đơn vị tiền tệ (ví dụ: "VND"), mặc định là VND nếu có cost
}

export interface SectionDetail {
  title: string; 
  items: ActivityItem[];
}

export interface TrendySuggestion {
  title: string;
  description: string;
  icon?: string;
}

export interface AccommodationSuggestion {
  type: string;
  details: string;
  minPrice?: number; 
  maxPrice?: number; 
  priceCurrency?: string; 
}

export interface DailyNote {
  content: string;
  icon?: string;
}

export interface MapPoint {
  name: string;
  latitude: number;
  longitude: number;
  description?: string; 
  icon?: string; 
}

export interface MapRoute {
  name: string; 
  startPointName: string; 
  endPointName: string;   
  transportMode?: string; 
  travelTime?: string;    
  notes?: string; 
}

export interface MapData {
  points: MapPoint[];
  routes: MapRoute[];
  initialCenter?: { 
    latitude: number;
    longitude: number;
  };
  initialZoom?: number; 
}

export interface DayPlan {
  dayNumber: number;
  date: string; 
  title: string; 
  summary?: string; 
  sections: SectionDetail[];
  dailyNotes?: DailyNote[];
  trendySuggestion?: TrendySuggestion;
  accommodationSuggestion?: AccommodationSuggestion;
  estimatedDailyCost?: number; // Sẽ được tính bởi frontend
  dailyCostCurrency?: string; // Sẽ được tính bởi frontend
}

export interface GeneralNote {
  type: 'important' | 'tip' | 'info';
  content: string;
  icon?: string;
}

export interface FinalThoughtItem {
  title: string;
  content: string;
  icon?: string;
}

export interface ItineraryData {
  title: string; // Tên lịch trình, ví dụ: "Khám phá Hà Nội 3 ngày 2 đêm"
  overview?: string; // Mô tả tổng quan về chuyến đi
  generalNotes?: GeneralNote[];
  days: DayPlan[];
  finalThoughts?: {
    travelTips?: FinalThoughtItem[];
    bookingAdvice?: string;
    culturalInsights?: FinalThoughtItem[];
  };
  mapData?: MapData; 
  feasibilityWarning?: string; // Cảnh báo nếu lịch trình quá dày đặc hoặc không khả thi
  estimatedTotalCost?: number; // Sẽ được tính bởi frontend
  totalCostCurrency?: string; // Sẽ được tính bởi frontend
  costDisclaimer?: string; // Lời khuyên về chi phí, ví dụ: "Chi phí trên chỉ là ước tính và có thể thay đổi."
}
      `,
      "```\n",
      "**HƯỚNG DẪN CHI TIẾT VỀ NỘI DUNG:**",
      "1.  **`title` (ItineraryData):** Tạo tiêu đề hấp dẫn, phản ánh đúng điểm đến và thời gian. Ví dụ: 'Hành trình 5 ngày khám phá Đà Nẵng - Hội An'.",
      "2.  **`overview` (ItineraryData):** Viết một đoạn mô tả ngắn gọn, thu hút về chuyến đi.",
      "3.  **`days` (Array<DayPlan>):**",
      "    *   **`dayNumber`**: Bắt đầu từ 1.",
      "    *   **`date`**: Ghi rõ ngày tháng, ví dụ 'Ngày 1 (dd/mm/yyyy)' hoặc 'Thứ X, dd/mm'.",
      "    *   **`title` (DayPlan):** Tiêu đề cho ngày, ví dụ: 'Khám phá nét cổ kính của Phố cổ Hội An'.",
      "    *   **`summary` (DayPlan):** Tóm tắt các hoạt động chính trong ngày.",
      "    *   **`sections` (Array<SectionDetail>):** Chia ngày thành các buổi (Sáng, Trưa, Chiều, Tối) hoặc các phần hợp lý. Mỗi section có `title` và danh sách `items` (ActivityItem).",
      "    *   **`items` (Array<ActivityItem>):**",
      "        *   **`type`**: Chọn loại phù hợp ('activity', 'food', 'transport', 'note', 'interaction').",
      "        *   **`description`**: Mô tả rõ ràng, hấp dẫn. Ví dụ: 'Tham quan Dinh Độc Lập', 'Thưởng thức Bún Bò Huế tại quán địa phương', 'Di chuyển bằng xe máy đến đồi Vọng Cảnh'.",
      "        *   **ĐẶC BIỆT VỚI `type: 'food'` CHO CÁC BỮA CHÍNH (Trưa, Tối):**",
      "            *   **Nếu có thể và phù hợp với địa điểm, hãy cung cấp 2-3 gợi ý ẩm thực riêng biệt dưới dạng các đối tượng `ActivityItem` khác nhau cho mỗi bữa chính.**",
      "            *   Mỗi gợi ý nên đại diện cho một khía cạnh khác nhau: ví dụ, một món **truyền thống/đặc sản**, một quán **được đánh giá cao** (nêu chung, không cần điểm số cụ thể), một nơi **thịnh hành/trendy trên mạng xã hội**, hoặc một lựa chọn **ẩm thực đường phố nổi tiếng**.",
      "            *   Làm rõ tính chất của từng gợi ý trong `description` và `details`. Ví dụ: `description: 'Lựa chọn Truyền thống: Bún Chả Hà Nội'`, `details: 'Thưởng thức tại quán gia truyền XYZ nổi tiếng với công thức cổ truyền, được người dân địa phương yêu thích.'` HOẶC `description: 'Gợi ý Trendy: Quán Cà Phê Trứng ABC'`, `details: 'Quán cà phê nổi tiếng trên mạng xã hội với không gian độc đáo và món cà phê trứng đặc biệt.'`.",
      "            *   Nếu cung cấp nhiều gợi ý ẩm thực cho một khung giờ ăn, hãy liệt kê chúng tuần tự như các `ActivityItem` trong mục (section) tương ứng.",
      "        *   **`icon`**: Sử dụng emoji phù hợp (ví dụ: 🏛️ cho di tích, 🍜 cho món ăn, 🚶 cho đi bộ, 🚗 cho di chuyển).",
      "        *   **`details`**: Cung cấp thông tin bổ sung hữu ích (giờ mở cửa, giá vé tham khảo, mẹo nhỏ, lý do nên thử, đặc điểm nổi bật).",
      "        *   **`estimatedCost`**: Cung cấp chi phí ước tính (số nguyên) cho vé vào cửa, bữa ăn, di chuyển nếu có thể. Đơn vị tiền tệ mặc định là 'VND'. Nếu không có chi phí cụ thể, có thể bỏ qua.",
      "        *   **`currency`**: Nếu có `estimatedCost`, đặt là 'VND'.",
      "    *   **`dailyNotes`**: Ghi chú quan trọng hoặc thú vị cho ngày đó.",
      "    *   **`trendySuggestion`**: Một gợi ý về một địa điểm/hoạt động đang thịnh hành.",
      "    *   **`accommodationSuggestion`**: Gợi ý chung về loại hình lưu trú (ví dụ: 'Khách sạn 3 sao', 'Homestay view đẹp'). Cung cấp `minPrice`, `maxPrice` (VND) nếu có thể ước tính.",
      "4.  **`generalNotes` (ItineraryData):** Các lưu ý quan trọng chung cho cả chuyến đi (an toàn, chuẩn bị, tiền tệ, v.v.).",
      "5.  **`finalThoughts` (ItineraryData):** Lời khuyên cuối cùng, mẹo du lịch, thông tin văn hóa.",
      "6.  **`mapData` (ItineraryData):** Nếu có thể, cung cấp tọa độ (latitude, longitude) cho các địa điểm chính trong `points`. Nối các điểm bằng `routes` nếu hợp lý. `initialCenter` và `initialZoom` để hiển thị bản đồ ban đầu.",
      "7.  **`feasibilityWarning`**: Nếu lịch trình quá dày đặc hoặc có yếu tố không khả thi, hãy nêu rõ ở đây.",
      "8.  **`costDisclaimer`**: Một câu ngắn gọn ví dụ: 'Tất cả chi phí chỉ mang tính tham khảo và có thể thay đổi tùy thời điểm và lựa chọn cá nhân.'",
      "9.  **KHÔNG tự ý thêm trường `id` hoặc `votes` vào `ActivityItem`, frontend sẽ xử lý việc đó.**",
      "10. **Tính thực tế và đa dạng:** Cân nhắc thời gian di chuyển, giờ mở cửa, sự đa dạng của hoạt động và ẩm thực. Ưu tiên các trải nghiệm địa phương đích thực.",
      "11. **Ngôn ngữ:** Sử dụng tiếng Việt tự nhiên, hấp dẫn, phù hợp với đối tượng du khách.",
      "12. **Tập trung vào yêu cầu:** Đảm bảo tất cả các yêu cầu trong `PlanRequest` đều được phản ánh trong lịch trình.",
      "13. **Không bao gồm HTML hoặc Markdown trong các giá trị chuỗi JSON.**",
      "14. **Luôn trả về JSON hợp lệ.** Kiểm tra kỹ cấu trúc JSON trước khi hoàn thành.",
      "---------------------------------------------------------------------------------------\n",
      "Dưới đây là yêu cầu cụ thể của người dùng:\n",
      JSON.stringify(request)
    ].join('\n');

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: promptParts }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, // Slightly creative but still grounded
        topP: 0.9,
        topK: 40,
      }
    });
    
    // const responseText = response.response.text(); // Old way, might cause issues
    const responseText = response.text; // Correct way to get text

    let jsonStr = responseText.trim();
    // Sometimes the response might still include the markdown fence, remove it if present.
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr) as ItineraryData;
      // Basic validation
      if (!parsedData.title || !parsedData.days || !Array.isArray(parsedData.days) || parsedData.days.length === 0) {
        console.error("Invalid itinerary structure received from AI:", parsedData);
        throw new Error("AI đã trả về dữ liệu lịch trình không hợp lệ. Vui lòng thử lại với yêu cầu rõ ràng hơn.");
      }
      return parsedData;
    } catch (e) {
      console.error("Failed to parse JSON response from AI:", e);
      console.error("Raw response text from AI:", responseText);
      throw new Error("Không thể phân tích dữ liệu lịch trình từ AI. Có thể có lỗi trong định dạng trả về. Vui lòng thử lại.");
    }

  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    if (error.message && error.message.includes("API key not valid")) {
        throw new Error("Lỗi xác thực API Key của Gemini. Vui lòng kiểm tra lại API Key.");
    }
    if (error.message && error.message.includes("billing account")) {
        throw new Error("Có vấn đề với tài khoản thanh toán của Google Cloud liên kết với API Key này.");
    }
    if (error.message && error.message.includes("quota")) {
        throw new Error("Đã vượt quá hạn ngạch sử dụng API. Vui lòng thử lại sau hoặc kiểm tra giới hạn của bạn.");
    }
     if (error.message && error.message.includes("Content moderately to highly likely to be sexuales")) {
        throw new Error("Yêu cầu của bạn có thể chứa nội dung không phù hợp hoặc AI đã tạo ra nội dung bị chặn. Vui lòng điều chỉnh yêu cầu.");
    }
    throw new Error(error.message || "Đã xảy ra lỗi không xác định khi giao tiếp với AI.");
  }
};
