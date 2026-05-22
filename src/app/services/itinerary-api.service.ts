import { Injectable, signal } from '@angular/core';
import {
  TripResult,
  TripPreferences,
  Intensity,
  HotelSvcType,
  ProfilePayload,
  ProfileResponse,
  GenerationStep,
  ItineraryDay,
  ItineraryActivity,
  ReplanPayload,
  ReplanResult,
} from '../models/chat.model';

const API_BASE = 'http://localhost:8000/api/v1';
const AUTH_HEADER: Record<string, string> = {
  'Authorization': 'Bearer sk-WZYzuPMYNy445M1lrRZLZA',
};

@Injectable({ providedIn: 'root' })
export class ItineraryApiService {
  /** Current generation progress steps shown on loading screen */
  generationSteps = signal<GenerationStep[]>([]);

  /** 0–100 progress percentage */
  generationProgress = signal(0);

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Backend flow (profile already saved):
   * 1. POST /generate — triggers AI pipeline; returns full itinerary synchronously
   * On failure → falls back to localMock()
   */
  async generate(tripId: string, prefs: Partial<TripPreferences>): Promise<TripResult> {
    this.resetProgress();

    try {
      // Step 1 — call generate
      this.advanceStep(0);
      const res = await fetch(`${API_BASE}/trips/${tripId}/generate`, {
        method: 'POST',
        headers: { ...AUTH_HEADER },
      });
      if (!res.ok) throw new Error(`generate failed: ${res.status}`);

      // Step 2 — parse response
      this.advanceStep(1);
      const json = await res.json();

      // Step 3 — map backend shape → frontend TripResult
      this.advanceStep(2);
      const result = this.mapBackendResponse(json, prefs);

      // Step 4 — done
      this.advanceStep(3);
      return result;
    } catch {
      return this.localMock(prefs);
    }
  }

  /** POST /api/v1/trips/:id/replan */
  async replan(payload: ReplanPayload): Promise<ReplanResult> {
    const res = await fetch(`${API_BASE}/trips/${payload.tripId}/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('replan failed');
    return res.json();
  }

  /** POST /api/v1/trips/:id/activities/:actId/confirm */
  async confirmBooking(tripId: string, activityId: string, guestCount: number, notes = ''): Promise<any> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/activities/${activityId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestCount, notes }),
    });
    if (!res.ok) throw new Error('confirm failed');
    return res.json();
  }

  /** POST /api/v1/trips/:id/profile — save preferences with mock fallback */
  async saveProfile(tripId: string, payload: ProfilePayload): Promise<ProfileResponse> {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Profile save failed');
      return res.json();
    } catch {
      const nights = this.nightsBetween(payload.checkInDate, payload.checkOutDate);
      const dailyBudget = payload.budgetTotal > 0 && nights > 0
        ? (payload.budgetTotal / nights).toFixed(2) : '0.00';
      return {
        tripId,
        status: 'PROFILE_COLLECTED',
        dailyBudget,
        currency: payload.currency,
        generationTriggered: true,
      };
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private resetProgress(): void {
    this.generationSteps.set([
      { label: 'Calling AI generation…',         done: false, active: false },
      { label: 'Parsing itinerary response',     done: false, active: false },
      { label: 'Building your day-by-day plan',  done: false, active: false },
      { label: 'Finalising recommendations',     done: false, active: false },
    ]);
    this.generationProgress.set(0);
  }

  private advanceStep(index: number): void {
    this.generationSteps.update((steps) =>
      steps.map((s, i) => ({ ...s, done: i < index, active: i === index }))
    );
    this.generationProgress.set(Math.round(((index + 1) / 4) * 100));
  }

  /**
   * Map the real backend generate response to our frontend TripResult shape.
   * Backend returns: { tripId, status, version, days: [{ id, day, date, weatherForecast, activities }] }
   * Activities have: id (not activityId), cost as string, no status/bookingReference/version
   */
  private mapBackendResponse(json: any, prefs: Partial<TripPreferences>): TripResult {
    const currency = prefs.currency ?? 'INR';
    const total    = prefs.budgetTotal ?? 20000;

    const days: ItineraryDay[] = (json.days ?? []).map((d: any) => ({
      dayNumber: d.day,
      date: d.date,
      weather: d.weatherForecast ?? null,
      activities: (d.activities ?? []).map((a: any): ItineraryActivity => ({
        activityId:       a.id,
        title:            a.title,
        type:             a.type,
        startTime:        a.startTime,
        endTime:          a.endTime,
        cost:             parseFloat(a.cost) || 0,
        currency:         a.currency ?? currency,
        weatherSensitive: a.weatherSensitive ?? false,
        energyLevel:      a.energyLevel ?? 'MEDIUM',
        status:           'PENDING',
        isHotelService:   a.isHotelService ?? false,
        hotelSvcType:     a.hotelSvcType ?? null,
        bookingReference: null,
        reasoning:        a.reasoning ?? [],
        version:          json.version ?? 1,
      })),
    }));

    const allCosts = days.flatMap(d => d.activities).reduce((s, a) => s + a.cost, 0);
    const numDays  = days.length || 1;

    return {
      tripId:         json.tripId,
      status:         json.status,
      hotelName:      prefs.hotelName,
      checkInDate:    prefs.checkInDate,
      checkOutDate:   prefs.checkOutDate,
      durationDays:   numDays,
      currentVersion: json.version ?? 1,
      budgetSummary: {
        budgetTotal: total, currency,
        totalPlanned: allCosts, totalSpent: 0, remaining: total - allCosts,
        byDay: days.map(d => ({
          dayNumber:   d.dayNumber,
          date:        d.date,
          dailyBudget: Math.round(total / numDays),
          planned:     d.activities.reduce((s, a) => s + a.cost, 0),
          headroom:    Math.round(total / numDays) - d.activities.reduce((s, a) => s + a.cost, 0),
          breakdown:   { attractions: 0, dining: 0, hotelServices: 0, transfers: 0, leisure: 0 },
        })),
      },
      days,
    };
  }

  // ── Local mock fallback ────────────────────────────────────────────────

  localMock(prefs: Partial<TripPreferences>): TripResult {
    const days = this.mockDays(prefs);
    const total = prefs.budgetTotal ?? 20000;
    const currency = prefs.currency ?? 'INR';
    const allCosts = days.flatMap(d => d.activities).reduce((s, a) => s + a.cost, 0);
    return {
      hotelName: prefs.hotelName ?? `${this.cap(prefs.district ?? 'Vista')} Marriott`,
      checkInDate: prefs.checkInDate, checkOutDate: prefs.checkOutDate,
      durationDays: days.length, currentVersion: 1,
      budgetSummary: {
        budgetTotal: total, currency,
        totalPlanned: allCosts, totalSpent: 0, remaining: total - allCosts,
        byDay: days.map(d => ({
          dayNumber: d.dayNumber, date: d.date,
          dailyBudget: Math.round(total / days.length),
          planned: d.activities.reduce((s, a) => s + a.cost, 0),
          headroom: Math.round(total / days.length) - d.activities.reduce((s, a) => s + a.cost, 0),
          breakdown: { attractions: 0, dining: 0, hotelServices: 0, transfers: 0, leisure: 0 },
        })),
      },
      days,
      weatherSummary: `Expect pleasant weather (24–30°C) in ${prefs.district ?? 'your destination'}.`,
      transportSuggestions: ['Hotel shuttle available on request', 'Ride-share apps city-wide'],
    };
  }

  private mockDays(prefs: Partial<TripPreferences>): ItineraryDay[] {
    const dest   = this.cap(prefs.district ?? 'your destination');
    const style  = (prefs.tripStyle ?? 'RELAXED').toLowerCase();
    const key    = this.resolveKey(style);
    const start  = prefs.checkInDate  ? new Date(prefs.checkInDate)  : new Date();
    const end    = prefs.checkOutDate ? new Date(prefs.checkOutDate) : new Date(start.getTime() + 86400000 * 3);
    const cur    = prefs.currency ?? 'INR';
    const total  = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));

    const activityBank: Record<string, Array<{ time: string, end: string, title: string, type: string, cost: number }>> = {
      relaxed:   [
        { time: '09:00', end: '10:00', title: 'Spa morning ritual', type: 'HOTEL_SERVICE', cost: 80 },
        { time: '11:00', end: '13:00', title: 'Poolside brunch', type: 'LEISURE', cost: 40 },
        { time: '15:00', end: '17:00', title: 'Coastal walk & sunset', type: 'ATTRACTION', cost: 0 },
        { time: '19:00', end: '21:00', title: 'Gourmet hotel dinner', type: 'HOTEL_SERVICE', cost: 120 },
      ],
      romantic:  [
        { time: '09:00', end: '10:30', title: 'Couples spa session', type: 'HOTEL_SERVICE', cost: 160 },
        { time: '14:00', end: '16:00', title: 'Private beach picnic', type: 'LEISURE', cost: 60 },
        { time: '16:30', end: '18:30', title: 'Sunset sailing cruise', type: 'ATTRACTION', cost: 100 },
        { time: '19:30', end: '21:30', title: 'Candlelit rooftop dinner', type: 'HOTEL_SERVICE', cost: 180 },
      ],
      adventure: [
        { time: '07:00', end: '09:00', title: 'Sunrise hike to viewpoint', type: 'ATTRACTION', cost: 20 },
        { time: '10:00', end: '12:00', title: 'Kayaking or water sports', type: 'ATTRACTION', cost: 60 },
        { time: '14:00', end: '16:00', title: 'Rock climbing session', type: 'ATTRACTION', cost: 80 },
        { time: '19:00', end: '21:00', title: 'Campfire BBQ dinner', type: 'DINING', cost: 70 },
      ],
      cultural:  [
        { time: '09:00', end: '11:00', title: 'Old-town walking tour', type: 'ATTRACTION', cost: 30 },
        { time: '11:30', end: '13:00', title: 'National museum visit', type: 'ATTRACTION', cost: 20 },
        { time: '14:00', end: '15:30', title: 'Traditional cooking class', type: 'ATTRACTION', cost: 80 },
        { time: '18:30', end: '21:00', title: 'Folk music dinner', type: 'DINING', cost: 90 },
      ],
      foodie:    [
        { time: '09:00', end: '10:30', title: 'Local market breakfast tour', type: 'ATTRACTION', cost: 40 },
        { time: '12:00', end: '13:30', title: 'Street food walking tour', type: 'ATTRACTION', cost: 50 },
        { time: '15:00', end: '16:00', title: 'Craft beer & cheese pairing', type: 'DINING', cost: 60 },
        { time: '19:30', end: '22:00', title: "Chef's table dining experience", type: 'DINING', cost: 200 },
      ],
    };

    const bank = activityBank[key] ?? activityBank['relaxed'];
    const weathers: Array<{ condition: string, tempC: number }> = [
      { condition: 'SUNNY', tempC: 30 }, { condition: 'CLOUDY', tempC: 26 }, { condition: 'SUNNY', tempC: 29 },
    ];

    return Array.from({ length: total }, (_, i): ItineraryDay => {
      const d = new Date(start.getTime() + i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const isFirst = i === 0;
      const isLast  = i === total - 1;

      const acts: ItineraryActivity[] = isFirst
        ? [{ activityId: `ACT_D${i+1}_0`, title: 'Check-in & Freshen Up', type: 'LEISURE', startTime: '14:00', endTime: '15:30', cost: 0, currency: cur, weatherSensitive: false, energyLevel: 'LOW', status: 'PENDING', isHotelService: false, hotelSvcType: null, bookingReference: null, reasoning: ['first day', 'settle in'], version: 1 },
           ...bank.slice(1, 3).map((a, j) => ({ activityId: `ACT_D${i+1}_${j+1}`, title: a.title, type: a.type as any, startTime: a.time, endTime: a.end, cost: a.cost, currency: cur, weatherSensitive: a.type === 'ATTRACTION', energyLevel: 'LOW' as Intensity, status: 'PENDING' as const, isHotelService: a.type === 'HOTEL_SERVICE', hotelSvcType: a.type === 'HOTEL_SERVICE' ? 'SPA' as HotelSvcType : null, bookingReference: null, bookingStatus: a.type === 'HOTEL_SERVICE' ? 'REQUESTED' as const : undefined, reasoning: [key, 'personalised for you'], version: 1 }))]
        : isLast
        ? [{ activityId: `ACT_D${i+1}_0`, title: 'Farewell Breakfast & Checkout', type: 'LEISURE', startTime: '09:00', endTime: '11:00', cost: 0, currency: cur, weatherSensitive: false, energyLevel: 'LOW', status: 'PENDING', isHotelService: false, hotelSvcType: null, bookingReference: null, reasoning: ['last day', 'check-out'], version: 1 }]
        : bank.map((a, j) => ({ activityId: `ACT_D${i+1}_${j}`, title: a.title, type: a.type as any, startTime: a.time, endTime: a.end, cost: a.cost, currency: cur, weatherSensitive: a.type === 'ATTRACTION', energyLevel: 'MEDIUM' as Intensity, status: 'PENDING' as const, isHotelService: a.type === 'HOTEL_SERVICE', hotelSvcType: a.type === 'HOTEL_SERVICE' ? 'SPA' as HotelSvcType : null, bookingReference: null, bookingStatus: a.type === 'HOTEL_SERVICE' ? 'REQUESTED' as const : undefined, reasoning: [key, 'personalised for you'], version: 1 }));

      return {
        dayNumber: i + 1,
        date: dateStr,
        weather: weathers[i % weathers.length],
        activities: acts,
      };
    });
  }

  private resolveKey(style: string): string {
    const map: Record<string, string> = {
      relaxed: 'relaxed', adventure: 'adventure', cultural: 'cultural',
      wellness: 'relaxed', foodie: 'foodie', nightlife: 'relaxed',
      honeymoon: 'romantic', family: 'cultural',
    };
    return map[style] ?? 'relaxed';
  }

  private nightsBetween(checkIn?: string, checkOut?: string): number {
    if (!checkIn || !checkOut) return 3;
    return Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  }

  private cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
