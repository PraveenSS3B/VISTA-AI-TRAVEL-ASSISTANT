import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ItineraryApiService } from '../../services/itinerary-api.service';
import {
  TripResult, TripPreferences, GenerationStep,
  ItineraryDay, ItineraryActivity, DayBudget, ReplanTrigger,
} from '../../models/chat.model';

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- ── Generation loading screen ──────────────────────────────── -->
  @if (isGenerating) {
    <div class="gen-screen">
      <div class="gen-card">
        <div class="gen-brand">
          <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
            <path d="M8 10 L22 34 L36 10" stroke="#8B1D42" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="36" cy="10" r="2.5" fill="#8B1D42" opacity="0.9"/>
          </svg>
          Vista
        </div>
        <h2 class="gen-title">Crafting Your Itinerary</h2>
        <p class="gen-sub">Our AI is personalising every detail of your journey…</p>
        <div class="gen-steps">
          @for (step of genSteps(); track step.label) {
            <div class="gen-step" [class.done]="step.done" [class.active]="step.active">
              <span class="step-icon">
                @if (step.done) { ✓ } @else if (step.active) { <span class="spin">◌</span> } @else { ○ }
              </span>
              <span>{{ step.label }}</span>
            </div>
          }
        </div>
        <div class="gen-bar-wrap"><div class="gen-bar-fill" [style.width.%]="genProgress()"></div></div>
        <div class="gen-percent">{{ genProgress() }}%</div>
      </div>
    </div>

  <!-- ── Itinerary view ──────────────────────────────────────────── -->
  } @else if (result && prefs) {
    <div class="itin-page">

      <!-- Hero -->
      <div class="itin-hero" [style.background-image]="'url(' + heroImage + ')'">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-badge">✦ AI-Crafted Itinerary · v{{ result.currentVersion ?? 1 }}</div>
          <h1 class="hero-title">{{ result.hotelName ?? prefs.hotelName ?? prefs.district }}</h1>
          <div class="hero-meta">
            <span>📅 {{ result.checkInDate ?? prefs.checkInDate }} → {{ result.checkOutDate ?? prefs.checkOutDate }}</span>
            <span class="sep">·</span>
            <span>{{ capitalize(prefs.tripType ?? 'Trip') }}</span>
            <span class="sep">·</span>
            <span>� {{ prefs.district ?? '' }}</span>
            @if (prefs.tripStyle) { <span class="sep">·</span><span>{{ styleLabel(prefs.tripStyle) }}</span> }
          </div>
        </div>
        <button class="back-btn" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg>
          Back
        </button>
      </div>

      <div class="itin-body">
       <div class="itin-card">

        <!-- Budget bar -->
        @if (result.budgetSummary) {
          <div class="budget-bar-card">
            <div class="budget-bar-header">
              <span class="budget-label">Trip Budget</span>
              <span class="budget-nums">
                <strong>{{ result.budgetSummary.currency }} {{ result.budgetSummary.totalPlanned | number }}</strong>
                <span class="budget-total"> / {{ result.budgetSummary.currency }} {{ result.budgetSummary.budgetTotal | number }}</span>
              </span>
              <span class="budget-remaining">{{ result.budgetSummary.currency }} {{ result.budgetSummary.remaining | number }} remaining</span>
            </div>
            <div class="budget-track">
              <div class="budget-fill"
                [style.width.%]="budgetPct(result.budgetSummary.totalPlanned, result.budgetSummary.budgetTotal)"
                [class.over]="result.budgetSummary.totalPlanned > result.budgetSummary.budgetTotal">
              </div>
            </div>
          </div>
        }

        <!-- Special request banner -->
        @if (prefs.specialRequests) {
          <div class="special-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <strong>Special Request:</strong>&nbsp;{{ prefs.specialRequests }}
          </div>
        }

        <!-- Day tabs -->
        <div class="day-tabs">
          @for (day of result.days; track day.dayNumber) {
            <button class="day-tab" [class.active]="activeDay === day.dayNumber" (click)="activeDay = day.dayNumber">
              <span class="tab-num">Day {{ day.dayNumber }}</span>
              <span class="tab-date">{{ day.date | date:'MMM d' }}</span>
              @if (day.weather) {
                <span class="tab-weather">{{ weatherIcon(day.weather.condition) }} {{ day.weather.tempC }}°</span>
              }
            </button>
          }
        </div>

        <!-- Active day -->
        @for (day of result.days; track day.dayNumber) {
          @if (day.dayNumber === activeDay) {
            <div class="day-view">

              <!-- Per-day budget bar -->
              @if (result.budgetSummary) {
                @for (db of result.budgetSummary.byDay; track db.dayNumber) {
                  @if (db.dayNumber === activeDay) {
                    <div class="day-budget">
                      <span>Day {{ db.dayNumber }} spend:</span>
                      <div class="day-budget-track">
                        <div class="day-budget-fill" [style.width.%]="budgetPct(db.planned, db.dailyBudget)"></div>
                      </div>
                      <span class="day-budget-nums">{{ result.budgetSummary!.currency }} {{ db.planned | number }} / {{ db.dailyBudget | number }}</span>
                    </div>
                  }
                }
              }

              <!-- Activity timeline -->
              <div class="timeline">
                @for (act of day.activities; track act.activityId) {
                  <div class="act-card"
                    [class.hotel-svc]="act.isHotelService"
                    [class.confirmed]="act.status === 'CONFIRMED'"
                    [class.replaced]="act.status === 'REPLACED'">

                    <!-- Time column -->
                    <div class="act-time">
                      <span class="time-start">{{ act.startTime }}</span>
                      <div class="time-line"></div>
                      <span class="time-end">{{ act.endTime }}</span>
                    </div>

                    <!-- Content -->
                    <div class="act-body">
                      <div class="act-header">
                        <div class="act-title-row">
                          @if (act.status === 'CONFIRMED') { <span class="check-icon">✓</span> }
                          @if (act.isHotelService) { <span class="hotel-icon">🏨</span> }
                          <span class="act-title">{{ act.title }}</span>
                        </div>
                        <div class="act-cost">
                          @if (act.cost === 0) { <span class="free-badge">FREE</span> }
                          @else { {{ act.currency }} {{ act.cost | number }} }
                        </div>
                      </div>

                      <!-- Reasoning chips — "Why this?" -->
                      @if (act.reasoning.length) {
                        <div class="act-reasoning">
                          <button class="why-toggle" (click)="toggleReasoning(act.activityId)">
                            {{ expandedReasoning.has(act.activityId) ? '▾' : '▸' }} Why this?
                          </button>
                          @if (expandedReasoning.has(act.activityId)) {
                            <div class="reasoning-chips">
                              @for (r of act.reasoning; track r) {
                                <span class="r-chip">{{ r }}</span>
                              }
                            </div>
                          }
                        </div>
                      }

                      <!-- Hotel service confirmed reference -->
                      @if (act.status === 'CONFIRMED' && act.bookingReference) {
                        <div class="booking-ref-row">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          Show reference <strong>{{ act.bookingReference }}</strong> at the service desk
                        </div>
                      }

                      <div class="act-badges">
                        <span class="type-badge" [class]="'type-' + act.type.toLowerCase()">{{ act.type }}</span>
                        @if (act.weatherSensitive) { <span class="weather-badge">⛅ Weather sensitive</span> }
                        @if (act.energyLevel) { <span class="energy-badge energy-{{ act.energyLevel.toLowerCase() }}">{{ energyLabel(act.energyLevel) }}</span> }
                        @if (act.isHotelService && act.hotelSvcType) { <span class="svc-badge">{{ act.hotelSvcType }}</span> }
                        @if (act.status === 'CONFIRMED' && act.bookingReference) { <span class="ref-badge">Ref: {{ act.bookingReference }}</span> }
                      </div>

                      <!-- Hotel service CTA -->
                      @if (act.isHotelService && act.status === 'PENDING') {
                        <div class="svc-actions">
                          <button class="confirm-btn" (click)="confirmBooking(act, day)">
                            Confirm Booking
                          </button>
                          <button class="skip-btn" (click)="skipActivity(act, day)">Skip this</button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Day total -->
              <div class="day-total">
                Day {{ day.dayNumber }} total:
                @if (result.budgetSummary) {
                  @for (db of result.budgetSummary.byDay; track db.dayNumber) {
                    @if (db.dayNumber === activeDay) {
                      <strong>{{ result.budgetSummary!.currency }} {{ db.planned | number }}</strong> / {{ db.dailyBudget | number }} daily budget
                    }
                  }
                }
              </div>

              <!-- Replan bar -->
              <div class="replan-bar">
                <div class="replan-header">Modify Day {{ day.dayNumber }}</div>
                <div class="quick-actions">
                  @for (q of quickActions; track q.label) {
                    <button class="quick-btn" (click)="quickReplan(q.message, day)">{{ q.label }}</button>
                  }
                </div>
                <div class="replan-input-row">
                  <input class="replan-input" [(ngModel)]="replanText" placeholder="e.g. I'm exhausted, add something relaxing…" (keyup.enter)="sendReplan(day)" />
                  <button class="replan-send" (click)="sendReplan(day)" [disabled]="!replanText.trim() || replanLoading">
                    @if (replanLoading) { … } @else { → }
                  </button>
                </div>
                @if (replanResult) {
                  <div class="replan-result">
                    ✓ Plan updated — {{ replanResult.changes.removed }} removed · {{ replanResult.changes.added }} added
                    @if (replanResult.hotelServicesInjected?.length) {
                      · <strong>{{ replanResult.hotelServicesInjected.join(', ') }}</strong> added
                    }
                  </div>
                }
              </div>

            </div>
          }
        }

       </div>
      </div>

      <!-- Footer -->
      <div class="itin-footer">
        <button class="cta-btn" (click)="planAnother()">✈️ Plan Another Trip</button>
        <button class="cta-btn secondary" (click)="goBack()">← Back to Home</button>
      </div>
    </div>

  } @else {
    <div class="empty-page">
      <div class="empty-icon">🗺</div>
      <h2>No itinerary yet</h2>
      <p>Use the Vista AI assistant to plan your trip and your personalised itinerary will appear here.</p>
      <button class="cta-btn" (click)="goBack()">← Go to Home</button>
    </div>
  }
  `,
  styleUrls: ['./itinerary.component.scss'],
})
export class ItineraryComponent implements OnInit, OnDestroy {
  private chat   = inject(ChatService);
  private api    = inject(ItineraryApiService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  result: TripResult | null = null;
  prefs: Partial<TripPreferences> | null = null;
  isGenerating = false;
  activeDay = 1;

  genSteps    = this.api.generationSteps;
  genProgress = this.api.generationProgress;

  expandedReasoning = new Set<string>();
  replanText  = '';
  replanLoading = false;
  replanResult: any = null;

  readonly quickActions = [
    { label: "I'm tired 😴",      message: "I'm exhausted, please replace high-energy activities with something relaxing." },
    { label: 'Too expensive 💸',  message: 'This is over budget, please suggest cheaper alternatives.' },
    { label: 'Add romance 💑',    message: 'Add a romantic touch to the evening plans.' },
    { label: 'Skip outdoor 🌧',   message: 'It might rain, please replace outdoor activities with indoor ones.' },
  ];

  private routeSub: any;

  constructor() {
    // React to new itinerary generation (even when already on this page)
    effect(() => {
      this.chat.itineraryVersion(); // track the signal
      const latest = this.chat.itineraryResult();
      if (latest) {
        this.result = latest;
        this.prefs  = this.chat.itineraryPrefs();
        this.activeDay = 1;
        this.isGenerating = false;
        this.expandedReasoning.clear();
      }
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.isGenerating = params['mode'] === 'generating';
      if (!this.isGenerating) {
        this.result = this.chat.itineraryResult();
        this.prefs  = this.chat.itineraryPrefs();
        this.activeDay = 1;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  get guestSummary(): string {
    return this.prefs?.tripType ?? 'Trip';
  }

  get heroImage(): string {
    const dest = (this.prefs?.district ?? '').toLowerCase().trim();
    const heroMap: Record<string, string> = {
      paris:      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
      france:     'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
      london:     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80',
      dubai:      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80',
      bali:       'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80',
      maldives:   'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1600&q=80',
      tokyo:      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80',
      santorini:  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=80',
      rome:       'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=80',
      singapore:  'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&q=80',
    };
    const exact   = heroMap[dest];
    if (exact) return exact;
    const partial = Object.keys(heroMap).find(k => dest.includes(k) || k.includes(dest));
    return heroMap[partial ?? ''] ?? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80';
  }

  budgetPct(planned: number, total: number): number {
    if (!total) return 0;
    return Math.min(100, Math.round((planned / total) * 100));
  }

  weatherIcon(c: string): string {
    return ({ SUNNY: '☀️', RAIN: '🌧', CLOUDY: '⛅', STORM: '⛈', SNOW: '❄️' } as any)[c] ?? '🌡';
  }

  energyLabel(e: string): string {
    return ({ LOW: '🌸 Activity - Low', MEDIUM: '⚡ Activity - Medium', HIGH: '🔥 Activity - High' } as any)[e] ?? e;
  }

  styleLabel(s: string): string {
    return ({ RELAXED: '🌿 Relaxed', ADVENTURE: '🏔 Adventure', CULTURAL: '🏛 Cultural', WELLNESS: '🧘 Wellness', FOODIE: '🍜 Foodie', NIGHTLIFE: '🎉 Nightlife' } as any)[s] ?? s;
  }

  capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

  toggleReasoning(id: string): void {
    this.expandedReasoning.has(id) ? this.expandedReasoning.delete(id) : this.expandedReasoning.add(id);
  }

  async confirmBooking(act: ItineraryActivity, day: ItineraryDay): Promise<void> {
    if (!this.result?.tripId) { act.status = 'CONFIRMED'; act.bookingReference = `REF-${Date.now()}`; return; }
    try {
      const res = await this.api.confirmBooking(this.result.tripId, act.activityId, 1);
      act.status = 'CONFIRMED';
      act.bookingReference = res.bookingReference;
    } catch { act.status = 'CONFIRMED'; act.bookingReference = `REF-${Date.now()}`; }
  }

  skipActivity(act: ItineraryActivity, _day: ItineraryDay): void {
    act.status = 'REPLACED';
  }

  async sendReplan(day: ItineraryDay): Promise<void> {
    if (!this.replanText.trim()) return;
    this.replanLoading = true;
    try {
      const payload = {
        tripId: this.result?.tripId ?? 'LOCAL',
        dayId: `DAY_${day.dayNumber}`,
        trigger: 'USER_FEEDBACK' as const,
        message: this.replanText,
        pinned: day.activities.filter(a => a.status === 'CONFIRMED').map(a => a.activityId),
        forceInclude: [],
      };
      this.replanResult = await this.api.replan(payload);
      // refresh itinerary after replan
      if (this.result?.tripId) {
        const fresh = await this.api.generate(this.result.tripId, this.prefs ?? {});
        this.result = fresh;
      }
    } catch { this.replanResult = { changes: { removed: 0, added: 0, replaced: 0 }, hotelServicesInjected: [] }; }
    finally { this.replanLoading = false; this.replanText = ''; }
  }

  quickReplan(message: string, day: ItineraryDay): void {
    this.replanText = message;
    this.sendReplan(day);
  }

  goBack(): void { this.router.navigate(['/']); }

  planAnother(): void {
    this.chat.clearChat();
    this.router.navigate(['/']);
    setTimeout(() => this.chat.toggleOpen(), 400);
  }
}
