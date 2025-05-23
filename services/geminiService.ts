
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PlanRequest, ItineraryData } from "../types";

const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

if (!process.env.API_KEY) {
  console.error("API Key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateItinerary = async (request: PlanRequest): Promise<ItineraryData> => {
  try {
    const promptParts = [
      "Bạn là một chuyên gia hoạch định du lịch AI, chuyên sâu về các điểm đến tại Việt Nam và am hiểu văn hóa, lễ hội địa phương.",
      "Hãy tạo một kế hoạch du lịch chi tiết, hấp dẫn và khả thi cho chuyến đi đến Việt Nam dựa trên các thông tin sau:\n",
      `1. **Điểm khởi hành (nếu có):** ${request.departurePoint || "Không được cung cấp (có thể bắt đầu từ điểm đến đầu tiên)"}`,
      `2. **Các điểm đến chính:** ${request.destinations}`,
      `3. **Thời gian chuyến đi:** ${request.duration} ngày`,
      `4. **Số lượng người đi (nếu có):** ${request.numberOfTravelers || "1 người (mặc định)"}. Nếu có nhiều người, hãy cân nhắc các hoạt động/gợi ý phù hợp cho nhóm.`,
      `5. **Sở thích:** ${request.interests || "Tổng hợp (bao gồm văn hóa, lịch sử, thiên nhiên, ẩm thực, thư giãn/nghỉ dưỡng)"}. Đây là một chuỗi các sở thích, có thể do người dùng tự nhập hoặc chọn từ gợi ý, cách nhau bởi dấu phẩy.`,
      "   Hãy **lồng ghép sâu sắc** các sở thích này vào từng hoạt động và gợi ý cụ thể hàng ngày.",
      `6. **Mục đích chuyến đi (nếu có):** ${request.tripPurpose || "Không được cung cấp (xem xét chung)"}. Nếu có mục đích cụ thể (ví dụ: Gia đình, Cặp đôi, Bạn bè, Team Building, Một mình), hãy điều chỉnh không khí và loại hình hoạt động cho phù hợp. Ví dụ, chuyến đi gia đình có thể bao gồm các hoạt động thân thiện với trẻ em, chuyến đi cặp đôi có thể có gợi ý lãng mạn.`,
      `7. **Ưu tiên về khách sạn (nếu có):** ${request.hotelPreference || "Bất kỳ"}.`,
      "   Dựa vào ưu tiên này, hãy đưa ra gợi ý về loại hình lưu trú hoặc khu vực trong mục 'accommodationSuggestion' của mỗi ngày. **Quan trọng: Tuyệt đối KHÔNG đề xuất tên khách sạn cụ thể, giá cả chi tiết.**",
      `8. **Gợi ý "Hot" và "Trendy" (Lấy cảm hứng từ Mạng Xã Hội):**`,
      "   Trong mục 'trendySuggestion' của mỗi ngày (nếu có), lồng ghép các gợi ý về địa điểm, quán cà phê, nhà hàng, hoạt động hoặc sự kiện địa phương đang 'hot'.",
      "   Sử dụng cụm từ như 'Địa điểm này đang được nhiều bạn trẻ yêu thích check-in gần đây 👀', 'Một trải nghiệm thú vị đang được chia sẻ nhiều là ✨...' để gợi ý.",
      `9. **Yếu tố Địa phương hóa (Văn hóa, Lễ hội, Điểm đến độc đáo):**`,
      "   **Lễ hội truyền thống:** Nếu chuyến đi có thể diễn ra gần hoặc trong các dịp lễ hội lớn của Việt Nam, hãy lồng ghép thông tin này vào các hoạt động hoặc 'dailyNotes'.",
      "   **Điểm đến ít người biết:** Bên cạnh các địa danh nổi tiếng, cân nhắc gợi ý các điểm đến độc đáo, ít được biết đến hơn nhưng mang đậm bản sắc.",
      "   **Ẩm thực vùng miền:** Nhấn mạnh các món ăn đặc trưng của từng vùng miền trong các 'items' thuộc loại 'food'.",

      "\nYÊU CẦU CHI TIẾT CHO LỊCH TRÌNH (ĐỊNH DẠNG JSON):",
      "Hãy trả về kết quả dưới dạng một đối tượng JSON hợp lệ. TUYỆT ĐỐI KHÔNG BAO GỒM BẤT KỲ VĂN BẢN NÀO BÊN NGOÀI CẶP DẤU NGOẶC NHỌN {} CỦA JSON. Toàn bộ phản hồi phải là một chuỗi JSON.",
      "Cấu trúc JSON mong muốn như sau (đảm bảo tất cả các chuỗi văn bản bằng tiếng Việt có dấu):",
      `
{
  "title": "Tiêu đề chung của chuyến đi (ví dụ: Chuyến phiêu lưu 7 ngày tại Việt Nam)",
  "overview": "Một đoạn mô tả ngắn gọn tổng quan về chuyến đi (2-3 câu, tiếng Việt).",
  "generalNotes": [
    { "type": "important", "content": "Nội dung lưu ý chung quan trọng (tiếng Việt)", "icon": "💡" } 
  ],
  "days": [
    {
      "dayNumber": 1,
      "date": "Ngày 1", 
      "title": "Tiêu đề cho ngày, ví dụ: Khám phá Hà Nội Cổ Kính 🏙️ (tiếng Việt)",
      "summary": "Mô tả ngắn gọn các hoạt động chính trong ngày (tiếng Việt).",
      "sections": [
        {
          "title": "Buổi sáng ☀️ (tiếng Việt)",
          "items": [
            { "type": "activity", "description": "Hoạt động buổi sáng 1 (tiếng Việt)", "icon": "🚶‍♀️" },
            { "type": "transport", "description": "Di chuyển đến X bằng Y (tiếng Việt)", "icon": "🚕" },
            { "type": "food", "description": "Ăn sáng: Phở bò tại quán Z (tiếng Việt)", "icon": "🍜" }
          ]
        }
      ],
      "dailyNotes": [
        { "content": "Lưu ý riêng cho ngày này (tiếng Việt)", "icon": "📝" }
      ],
      "trendySuggestion": { 
        "title": "Điểm check-in 'hot' 🔥 (tiếng Việt)",
        "description": "Ghé thăm [Tên địa điểm trendy] (tiếng Việt)",
        "icon": "📸"
      },
      "accommodationSuggestion": { 
         "type": "Gợi ý chung về khu vực/loại hình lưu trú (tiếng Việt)",
         "details": "Ví dụ: Khu vực Phố Cổ có nhiều homestay và khách sạn tầm trung. (tiếng Việt)"
      }
    }
  ],
  "mapData": {
    "points": [
      { 
        "name": "Tên địa điểm chính 1 (ví dụ: Hồ Hoàn Kiếm)", 
        "latitude": 21.0285, 
        "longitude": 105.8542, 
        "description": "Mô tả ngắn gọn về địa điểm này cho marker trên bản đồ (tiếng Việt)",
        "icon": "📍" 
      }
      // Thêm các điểm khác từ các hoạt động chính trong lịch trình
    ],
    "routes": [
      {
        "name": "Tuyến đường từ Điểm A đến Điểm B (ví dụ: Từ Văn Miếu đến Lăng Bác)",
        "startPointName": "Tên điểm bắt đầu (phải khớp với một 'name' trong 'points')",
        "endPointName": "Tên điểm kết thúc (phải khớp với một 'name' trong 'points')",
        "transportMode": "Phương tiện di chuyển (ví dụ: Đi bộ, Xe máy, Xe buýt)",
        "travelTime": "Thời gian di chuyển ước tính (ví dụ: Khoảng 15 phút)"
      }
      // Thêm các tuyến đường nối các điểm chính
    ],
    "initialCenter": { "latitude": 21.0278, "longitude": 105.8342 }, // Ví dụ: Trung tâm Hà Nội
    "initialZoom": 12 // Mức zoom phù hợp
  },
  "finalThoughts": {
      "travelTips": [
          { "title": "Đổi tiền & Sim 4G (tiếng Việt)", "content": "Nên đổi một ít tiền mặt và mua SIM 4G tại sân bay. (tiếng Việt)", "icon": "📱" }
      ],
      "bookingAdvice": "Đây là lịch trình gợi ý. Bạn nên tự tìm hiểu và đặt vé máy bay, khách sạn, tour (nếu có) trước chuyến đi. (tiếng Việt)",
      "culturalInsights": [
        { "title": "Văn hóa giao tiếp (tiếng Việt)", "content": "Người Việt Nam thân thiện và mến khách. Một nụ cười và lời chào sẽ giúp bạn dễ dàng kết nối. (tiếng Việt)", "icon": "🤝" }
      ]
  },
  "feasibilityWarning": "Nếu các điểm đến quá xa nhau hoặc không khả thi trong thời gian chuyến đi, hãy đưa ra cảnh báo ở đây. (tiếng Việt). Ví dụ: 'Lịch trình này khá tham vọng với nhiều điểm đến ở các vùng miền khác nhau. Bạn có thể cân nhắc tập trung vào một khu vực hoặc kéo dài thời gian chuyến đi để có trải nghiệm thoải mái hơn.'"
}
`,
      "QUAN TRỌNG:",
      "- **Dữ liệu Bản đồ (`mapData`):**",
      "  - **`points`**: Cung cấp tọa độ (latitude, longitude) cho CÁC ĐỊA ĐIỂM QUAN TRỌNG được đề cập trong lịch trình. Tên điểm ('name') phải rõ ràng.",
      "  - **`routes`**: Mô tả các TUYẾN ĐƯỜNG CHÍNH giữa các `points` đã nêu. `startPointName` và `endPointName` PHẢI KHỚP với `name` của các điểm trong mảng `points`.",
      "  - Nếu không có thông tin bản đồ phù hợp (ví dụ, chuyến đi quá trừu tượng), `mapData` có thể được bỏ qua hoặc để trống (`points: [], routes: []`).",
      "- **Biểu tượng (icon):** Sử dụng emoji phù hợp cho trường 'icon' trong các mục. Emoji giúp lịch trình trực quan hơn.",
      "- **Tính nhất quán:** Giữ cấu trúc JSON nhất quán cho tất cả các ngày và các mục.",
      "- **Nội dung:** Các mô tả phải chi tiết, hữu ích, bằng tiếng Việt có dấu và tuân thủ các yêu cầu về sở thích, địa phương hóa đã nêu trước đó.",
      "- **Không Markdown:** Nội dung trong các trường 'description', 'content', 'title', 'summary' phải là văn bản thuần túy, không chứa cú pháp Markdown.",
      "- **Chỉ JSON:** Nhắc lại, toàn bộ phản hồi BẮT BUỘC phải là một chuỗi JSON hợp lệ, không có bất kỳ ký tự nào bên ngoài cặp dấu ngoặc nhọn chính của đối tượng JSON.",
      "- **Tính logic và khả thi:** Sắp xếp lịch trình hợp lý. Nếu các điểm đến quá xa, đề cập việc di chuyển bằng máy bay trong 'items' loại 'transport' hoặc trong 'feasibilityWarning'.",
      "**Bắt đầu trực tiếp với đối tượng JSON, không cần lời chào hỏi hay giới thiệu ban đầu.**"
    ];
    
    const prompt = promptParts.join("\n");

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
        }
    });
    
    let jsonString = response.text;
    // Remove markdown fences if AI still wraps JSON in them
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonString.match(fenceRegex);
    if (match && match[2]) {
      jsonString = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonString) as ItineraryData;
      return parsedData;
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      console.error('Raw JSON string:', jsonString);
      throw new Error(`Lỗi phân tích dữ liệu JSON từ AI. Dữ liệu nhận được: ${jsonString.substring(0, 200)}...`);
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`Lỗi từ Gemini API: ${error.message}`);
    }
    throw new Error('Lỗi không xác định khi giao tiếp với Gemini API.');
  }
};