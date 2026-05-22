// ─── Core enums — exact values validated by the backend ────────────────────

export type MessageSender = 'bot' | 'user';

export type TripType    = 'SOLO' | 'COUPLE' | 'FAMILY' | 'GROUP' | 'BUSINESS';
export type TripStyle   = 'RELAXED' | 'ADVENTURE' | 'CULTURAL' | 'WELLNESS' | 'FOODIE' | 'NIGHTLIFE';
export type Intensity   = 'LOW' | 'MEDIUM' | 'HIGH';

export type FoodPref    = 'SEAFOOD' | 'VEGETARIAN' | 'VEGAN' | 'LOCAL_CUISINE' | 'CONTINENTAL' | 'STREET_FOOD' | 'FINE_DINING' | 'NO_PREFERENCE';
export type AvoidPref   = 'CROWDS' | 'HEIGHTS' | 'WATER' | 'SPICY_FOOD' | 'LONG_DRIVES' | 'BUDGET_STRAIN';
export type HotelSvcType = 'SPA' | 'ROOFTOP_DINING' | 'POOL' | 'GOLF' | 'GYM' | 'AIRPORT_TRANSFER' | 'CULTURAL_EXPERIENCE' | 'NONE';
export type ActivityType = 'ATTRACTION' | 'DINING' | 'HOTEL_SERVICE' | 'TRANSFER' | 'SHOPPING' | 'LEISURE';
export type ActivityStatus = 'PENDING' | 'CONFIRMED' | 'REPLACED' | 'CANCELLED';
export type BookingStatus  = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type TripStatus     = 'PROFILE_PENDING' | 'GENERATING' | 'ITINERARY_CREATED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// ─── Chat flow types ─────────────────────────────────────────────────────────

export type ChatFlow =
  | 'idle' | 'main-menu' | 'trip-planner' | 'booking-itinerary'
  | 'generating' | 'trip-results';

export type TripStep =
  | 'district' | 'hotel-name' | 'trip-type' | 'trip-style'
  | 'check-in-date' | 'check-out-date'
  | 'budget-total' | 'currency'
  | 'food-preferences' | 'avoid-preferences'
  | 'activity-intensity' | 'hotel-services-wanted'
  | 'special-requests' | 'confirm-summary'
  | 'booking-select'
  | 'results'
  | 'edit-dates-checkin' | 'edit-dates-checkout';

// ─── Trip preferences — matches backend payload fields exactly ──────────────

export interface TripPreferences {
  district: string;
  hotelName: string;
  tripType: TripType;
  tripStyle: TripStyle;
  checkInDate: string;
  checkOutDate: string;
  budgetTotal: number;
  currency: string;
  foodPreferences: FoodPref[];
  avoid: AvoidPref[];
  activityIntensity: Intensity;
  hotelServicesWanted: HotelSvcType[];
  specialRequests: string;
  basedOnBookingId?: string;
}

// ─── Exact backend payload: POST /api/v1/trips/:id/profile ───────────────────

export interface ProfilePayload {
  district: string;
  hotelName: string;
  tripType: TripType;
  tripStyle: TripStyle;
  checkInDate: string;
  checkOutDate: string;
  budgetTotal: number;
  currency: string;
  foodPreferences: FoodPref[];
  avoid: AvoidPref[];
  activityIntensity: Intensity;
  hotelServicesWanted: HotelSvcType[];
  specialRequests: string;
}

// ─── Profile save API response ───────────────────────────────────────────────

export interface ProfileResponse {
  tripId: string;
  status: string;
  dailyBudget: string;
  currency: string;
  generationTriggered: boolean;
}

// ─── Backend itinerary response shape ────────────────────────────────────────

export interface ServiceDetails {
  serviceId: string;
  priceUnit: string;
  unitPrice: number;
  guestCount: number;
}

export interface ItineraryActivity {
  activityId: string;
  title: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  cost: number;
  currency: string;
  weatherSensitive: boolean;
  energyLevel: Intensity;
  status: ActivityStatus;
  isHotelService: boolean;
  hotelSvcType: HotelSvcType | null;
  bookingReference: string | null;
  bookingStatus?: BookingStatus;
  serviceDetails?: ServiceDetails;
  reasoning: string[];
  version: number;
}

export interface WeatherForecast { condition: string; tempC: number; }

export interface DayBudget {
  dayNumber: number;
  date: string;
  dailyBudget: number;
  planned: number;
  headroom: number;
  breakdown: { attractions: number; dining: number; hotelServices: number; transfers: number; leisure: number; };
}

export interface BudgetSummary {
  budgetTotal: number;
  currency: string;
  totalPlanned: number;
  totalSpent: number;
  remaining: number;
  byDay: DayBudget[];
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  weather: WeatherForecast | null;
  activities: ItineraryActivity[];
}

export interface TripResult {
  tripId?: string;
  status?: TripStatus;
  hotelName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  durationDays?: number;
  currentVersion?: number;
  budgetSummary?: BudgetSummary;
  days: ItineraryDay[];
  // kept for local mock compatibility
  weatherSummary?: string;
  transportSuggestions?: string[];
}

// ─── Replan ───────────────────────────────────────────────────────────────────

export type ReplanTrigger = 'USER_FEEDBACK' | 'WEATHER_CHANGE' | 'MANUAL_EDIT' | 'BUDGET_EXCEEDED' | 'SERVICE_UNAVAILABLE';

export interface ReplanPayload {
  tripId: string;
  dayId?: string;
  trigger: ReplanTrigger;
  message: string;
  pinned: string[];
  forceInclude: string[];
}

export interface ReplanResult {
  tripId: string;
  versionNumber: number;
  trigger: ReplanTrigger;
  changes: { removed: number; replaced: number; added: number; };
  hotelServicesInjected: string[];
  budgetImpact?: { before: number; after: number; delta: number; dailyBudget: number; note: string; };
}

// ─── Generation status ─────────────────────────────────────────────────────────

export type GenerationStatus = 'PENDING' | 'GENERATING' | 'ITINERARY_CREATED' | 'FAILED';

export interface GenerationStep { label: string; done: boolean; active: boolean; }

// ─── Chat message types ────────────────────────────────────────────────────────

export interface ChatButton { label: string; value: string; }
export interface ChatChip   { label: string; value: string; selected?: boolean; }

export interface BookingCardData {
  id: string; hotelName: string; location: string; image: string;
  checkIn: string; checkOut: string; guests: number; roomType: string; status: string;
}

export interface ProgressStage {
  label: string;
  status: 'pending' | 'active' | 'done';
}

export interface ProgressCardData {
  title: string;
  percentage: number;
  stages: ProgressStage[];
  estimateText?: string;
  completed?: boolean;
}

export interface HotelSuggestion {
  id: string;
  name: string;
  tagline: string;
  image: string;
  stars: number;
  pricePerNight: number;
  currency: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  buttons?: ChatButton[];
  chips?: ChatChip[];
  multiSelect?: boolean;
  bookingCards?: BookingCardData[];
  progressCard?: ProgressCardData;
  hotelPickCards?: HotelSuggestion[];
  locked?: boolean;
  neverLock?: boolean;
}
