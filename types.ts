
export interface PlanRequest {
  destinations: string;
  duration: number;
  interests?: string; 
  departurePoint?: string;
  numberOfTravelers?: number;
  hotelPreference?: string;
  tripPurpose?: string; 
}

export interface ActivityItem {
  id: string; // Unique identifier for the activity item
  type: 'activity' | 'food' | 'transport' | 'note' | 'interaction';
  description: string;
  icon?: string; 
  details?: string; 
  estimatedCost?: number; 
  currency?: string; 
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
  estimatedDailyCost?: number; 
  dailyCostCurrency?: string; 
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
  mapData?: MapData; 
  feasibilityWarning?: string;
  estimatedTotalCost?: number; 
  totalCostCurrency?: string; 
  costDisclaimer?: string; 
}

export interface ApiError {
  message: string;
  code?: number;
}

export interface StoredPlan {
  id: string;          
  name: string;        
  createdAt: string;   
  itineraryData: ItineraryData;
}

export interface FeedbackData {
  rating: number; 
  comments?: string;
  itineraryTitle: string; 
  timestamp: string; 
}
