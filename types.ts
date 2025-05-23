
export interface PlanRequest {
  destinations: string;
  duration: number;
  interests?: string; // Changed from string[] (implied by checkboxes) to string
  departurePoint?: string;
  numberOfTravelers?: number;
  hotelPreference?: string;
  tripPurpose?: string; // New field for trip purpose
}

// New interfaces for structured JSON itinerary

export interface ActivityItem {
  type: 'activity' | 'food' | 'transport' | 'note' | 'interaction';
  description: string;
  icon?: string; // Emoji
  details?: string; // Optional further details
  estimatedCost?: number; // Estimated cost for this activity
  currency?: string; // Currency for the estimated cost, e.g., "VND"
}

export interface SectionDetail {
  title: string; // e.g., "Buổi sáng ☀️"
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
  minPrice?: number; // Estimated minimum price for accommodation
  maxPrice?: number; // Estimated maximum price for accommodation
  priceCurrency?: string; // Currency for the accommodation price, e.g., "VND"
}

export interface DailyNote {
  content: string;
  icon?: string;
}

// ---- START: New Map Data Interfaces ----
export interface MapPoint {
  name: string;
  latitude: number;
  longitude: number;
  description?: string; // Short description for map marker info window
  icon?: string; // Emoji or reference to an icon
}

export interface MapRoute {
  name: string; // e.g., "Di chuyển từ Hà Nội đến Vịnh Hạ Long"
  startPointName: string; // Reference to a MapPoint name
  endPointName: string;   // Reference to a MapPoint name
  // The actual coordinates will be looked up from MapPoint by name
  // startLatitude: number;
  // startLongitude: number;
  // endLatitude: number;
  // endLongitude: number;
  transportMode?: string; // e.g., "Xe ô tô", "Tàu hỏa", "Máy bay"
  travelTime?: string;    // e.g., "Khoảng 3 giờ"
  notes?: string; // Any specific notes about this route
}

export interface MapData {
  points: MapPoint[];
  routes: MapRoute[];
  initialCenter?: { // Optional: AI can suggest an initial map center
    latitude: number;
    longitude: number;
  };
  initialZoom?: number; // Optional: AI can suggest an initial zoom level
}
// ---- END: New Map Data Interfaces ----


export interface DayPlan {
  dayNumber: number;
  date: string; // Can be simple "Ngày 1" or more descriptive
  title: string; // e.g., "Khám phá Hà Nội Cổ Kính 🏙️"
  summary?: string; // Short summary of the day
  sections: SectionDetail[];
  dailyNotes?: DailyNote[];
  trendySuggestion?: TrendySuggestion;
  accommodationSuggestion?: AccommodationSuggestion;
  estimatedDailyCost?: number; // Calculated estimated cost for the day
  dailyCostCurrency?: string; // Currency for the daily cost, e.g., "VND"
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
  title: string;
  overview?: string;
  generalNotes?: GeneralNote[];
  days: DayPlan[];
  finalThoughts?: {
    travelTips?: FinalThoughtItem[];
    bookingAdvice?: string;
    culturalInsights?: FinalThoughtItem[];
  };
  mapData?: MapData; // Add mapData here
  feasibilityWarning?: string;
  estimatedTotalCost?: number; // Calculated total estimated cost for the trip
  totalCostCurrency?: string; // Currency for the total cost, e.g., "VND"
  costDisclaimer?: string; // Disclaimer about the estimated costs
}

// Error structure from API (if needed)
export interface ApiError {
  message: string;
  code?: number;
}

// StoredPlan interface for plan history
export interface StoredPlan {
  id: string;          // Unique ID for the stored plan
  // userId: string;   // Removed as history is now global
  name: string;        // Plan title or user-defined name
  createdAt: string;   // ISO date string
  itineraryData: ItineraryData;
}

// ---- START: New Feedback Data Interface ----
export interface FeedbackData {
  rating: number; // 1-5 stars
  comments?: string;
  itineraryTitle: string; // To associate feedback with the specific plan
  timestamp: string; // ISO date string of when feedback was submitted
}
// ---- END: New Feedback Data Interface ----
