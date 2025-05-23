# Vietnam Travel Planner AI

![Vietnam Travel Planner AI](https://img.shields.io/badge/Vietnam-Travel_Planner_AI-teal)
  <img alt="Ứng dụng lập kế hoạch du lịch Việt Nam sử dụng AI." src="https://api.pikwy.com/web/683038364dfa723e7231a068.jpg">
Ứng dụng lập kế hoạch du lịch Việt Nam được hỗ trợ bởi AI. Tạo lịch trình chi tiết, cá nhân hóa cho chuyến đi của bạn tại Việt Nam chỉ với vài thông tin đơn giản.

## Tính năng

- 🗺️ **Tạo lịch trình tự động** dựa trên điểm đến, thời gian và sở thích
- 🏨 **Gợi ý lưu trú** phù hợp với ngân sách và phong cách du lịch
- 🍜 **Đề xuất ẩm thực địa phương** tại mỗi điểm đến
- 📸 **Gợi ý điểm "hot"** đang được yêu thích trên mạng xã hội
- 🚗 **Lộ trình di chuyển** giữa các điểm tham quan
- 🌏 **Hiển thị bản đồ** với các điểm tham quan chính
- 💾 **Lưu trữ lịch sử kế hoạch** để tham khảo sau

## Cấu trúc dự án

```
vietnam-travel-planner-ai/
├── components/         # Các thành phần UI React
├── contexts/           # React Context API
├── data/               # Dữ liệu tĩnh (tỉnh thành, sở thích...)
├── services/           # Dịch vụ API (Gemini AI)
├── App.tsx             # Component chính
├── index.html          # HTML entry
├── index.tsx           # React entry
├── types.ts            # TypeScript interfaces
└── vite.config.ts      # Cấu hình Vite
```

## Cài đặt và chạy ứng dụng

### Yêu cầu

- Node.js (phiên bản 16 trở lên)
- Gemini API Key (từ Google AI Studio)
- Google Maps API Key (tùy chọn, để hiển thị bản đồ)

### Các bước cài đặt

1. Clone dự án:
   ```bash
   git clone https://github.com/your-username/vietnam-travel-planner-ai.git
   cd vietnam-travel-planner-ai
   ```

2. Cài đặt các dependencies:
   ```bash
   npm install
   ```

3. Tạo file `.env.local` tại thư mục gốc với nội dung:
   ```
   # Gemini API Key từ Google AI Studio
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Google Maps API Key từ Google Cloud Platform
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. Bảo mật API Keys:
   - File `.env.local` đã được thêm vào `.gitignore` để không bị commit lên repository
   - Cấu hình hạn chế cho Google Maps API Key:
     - Truy cập [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
     - Chọn API Key và thiết lập các hạn chế sau:
       - **API restrictions**: Chỉ cho phép Maps JavaScript API
       - **Application restrictions**: Giới hạn HTTP referrers (websites) chỉ cho phép domain của bạn

5. Chạy ứng dụng ở môi trường phát triển:
   ```bash
   npm run dev
   ```

6. Truy cập ứng dụng tại `http://localhost:5173`

## Xây dựng cho môi trường production

Để build ứng dụng cho môi trường production:

```bash
npm run build
```

Các file được tạo ra sẽ nằm trong thư mục `dist/`.

## Công nghệ sử dụng

- **React** - Thư viện UI
- **TypeScript** - Ngôn ngữ lập trình
- **TailwindCSS** - Framework CSS
- **Vite** - Build tool
- **Gemini AI** - Mô hình AI để tạo lịch trình
- **Google Maps API** - Hiển thị bản đồ và điểm đến

## Hướng dẫn sử dụng

1. Nhập điểm khởi hành (tùy chọn)
2. Nhập các điểm đến bạn muốn khám phá
3. Chọn thời gian chuyến đi (số ngày)
4. Nhập sở thích của bạn (ẩm thực, văn hóa, thiên nhiên...)
5. Chọn mục đích chuyến đi và ưu tiên về khách sạn
6. Nhấn "Tạo Lịch Trình Mơ Ước" và đợi AI tạo kế hoạch

## Bảo mật và Quyền riêng tư

- **API Keys**: Không bao giờ chia sẻ API keys của bạn hoặc commit chúng lên repositories công khai
- **Dữ liệu người dùng**: Ứng dụng lưu trữ dữ liệu lịch trình cục bộ trong localStorage của trình duyệt
- **Không có dữ liệu nhạy cảm**: Ứng dụng không thu thập hoặc lưu trữ thông tin cá nhân của người dùng

## Giấy phép

[MIT License](LICENSE)

## Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue trên repository 
