import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  ChatMessage, ChatFlow, TripStep, TripPreferences,
  TripType, TripStyle, Intensity, FoodPref, AvoidPref, HotelSvcType,
  ChatButton, ChatChip, TripResult, BookingCardData, ProfilePayload,
  ProgressCardData, ProgressStage,
} from '../models/chat.model';
import { BookingService } from './booking.service';
import { getHotelSuggestions } from '../models/mock-data';
import { ItineraryApiService } from './itinerary-api.service';

const STEP_ORDER: TripStep[] = [
  'district', 'hotel-name', 'trip-type', 'trip-style',
  'check-in-date', 'check-out-date',
  'budget-total', 'currency',
  'food-preferences', 'avoid-preferences',
  'activity-intensity', 'hotel-services-wanted',
  'special-requests',
];

const SINGLE_SELECT_STEPS: TripStep[] = ['trip-type', 'activity-intensity', 'currency'];

@Injectable({ providedIn: 'root' })
export class ChatService {
  isOpen = signal(false);
  isMinimized = signal(false);
  flow = signal<ChatFlow>('idle');
  tripStep = signal<TripStep | null>(null);
  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);
  tripPrefs = signal<Partial<TripPreferences>>({});
  pendingChips = signal<string[]>([]);
  itineraryResult = signal<TripResult | null>(null);
  itineraryPrefs = signal<Partial<TripPreferences>>({});
  savedTripId = signal<string | null>(null);
  itineraryVersion = signal(0);
  private prefilledSteps = signal<Set<TripStep>>(new Set());

  currentStepNumber = computed(() => {
    const step = this.tripStep();
    if (!step) return 0;
    const remaining = STEP_ORDER.filter(s => !this.prefilledSteps().has(s));
    const idx = remaining.indexOf(step);
    return idx >= 0 ? idx + 1 : 0;
  });

  totalSteps = computed(() => STEP_ORDER.filter(s => !this.prefilledSteps().has(s)).length);

  progressPercent = computed(() => {
    const total = this.totalSteps();
    const current = this.currentStepNumber();
    return total > 0 ? Math.round((current / total) * 100) : 0;
  });

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private api: ItineraryApiService,
  ) {}

  scheduleAutoOpen(): void {
    setTimeout(() => {
      if (!this.isOpen() && !this.isMinimized()) {
        this.isOpen.set(true);
        this.isMinimized.set(false);
        if (this.messages().length === 0) this.startConversation();
      }
    }, 1500);
  }

  unreadCount = computed(() =>
    this.isOpen() ? 0 : this.messages().filter(m => m.sender === 'bot').length
  );

  toggleOpen(): void {
    if (this.isOpen()) { this.isOpen.set(false); }
    else { this.isOpen.set(true); this.isMinimized.set(false); if (this.messages().length === 0) this.startConversation(); }
  }

  minimize(): void { this.isMinimized.set(true); this.isOpen.set(false); }

  private addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const message: ChatMessage = { ...msg, id: crypto.randomUUID(), timestamp: new Date() };
    this.messages.update(msgs => [...msgs, message]);
  }

  private async addBotMessage(
    text: string,
    options?: { buttons?: ChatButton[]; chips?: ChatChip[]; multiSelect?: boolean },
    delay = 900
  ): Promise<void> {
    this.isTyping.set(true);
    await this.sleep(delay);
    this.isTyping.set(false);
    this.addMessage({ text, sender: 'bot', buttons: options?.buttons, chips: options?.chips, multiSelect: options?.multiSelect });
    this.persistMessages();
  }

  private sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

  private lockPreviousInteractiveMessages(): void {
    this.messages.update(msgs =>
      msgs.map(m =>
        (m.buttons?.length || m.chips?.length || m.bookingCards?.length || m.hotelPickCards?.length)
          ? { ...m, locked: true }
          : m
      )
    );
  }

  private startConversation(): void {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved).map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) }));
        this.messages.set(parsed);
        const savedFlow = localStorage.getItem('chat_flow') as any;
        const savedStep = localStorage.getItem('chat_step') as any;
        if (savedFlow) this.flow.set(savedFlow);
        if (savedStep) this.tripStep.set(savedStep || null);
        return;
      } catch { /* ignore */ }
    }
    this.showMainMenu();
  }

  showMainMenu(): void {
    this.flow.set('main-menu');
    this.addBotMessage(
      'Good day! I\'m **Vista**, your personal AI concierge from Marriott.\n\nHow may I assist you today?',
      { buttons: [
        { label: '✈️  Plan a New Trip', value: 'plan-trip' },
        { label: '🏨  I Have a Booking — Build My Itinerary', value: 'booking-itinerary' },
      ] }, 800
    );
  }

  handleButtonClick(value: string): void {
    if (value === 'plan-trip') {
      // Clear chat when starting a new trip for a fresh conversation
      this.messages.set([]);
      this.addBotMessage('Let\'s plan your perfect trip! ✈️', undefined, 300);
      this.startFreshTripFlow();
    } else if (value === 'booking-itinerary') {
      // Clear chat when starting booking flow for a fresh conversation
      this.messages.set([]);
      this.addBotMessage('Let\'s build an itinerary from your booking! 🏨', undefined, 300);
      this.startBookingItinerary();
    } else if (value.startsWith('select-booking:')) {
      this.selectBookingForItinerary(value.replace('select-booking:', ''));
    } else if (value === 'generate-confirmed') {
      this.addMessage({ text: '🚀 Generate', sender: 'user' });
      this.saveProfileAndGenerate();
    } else if (value === 'retry-save') {
      this.saveProfileAndGenerate();
    } else if (value === 'confirm-selections') {
      this.confirmMultiSelectStep();
    } else if (value === 'navigate-itinerary') {
      // Clear chat and reset for next interaction after viewing itinerary
      this.messages.set([]);
      this.resetTrip();
      localStorage.removeItem('chat_history');
      localStorage.removeItem('chat_flow');
      localStorage.removeItem('chat_step');
      this.isOpen.set(false);
      // Bump version so itinerary component picks up latest data even if already on /itinerary
      this.itineraryVersion.update(v => v + 1);
      if (this.router.url.startsWith('/itinerary')) {
        // Already on the page — component will react via effect()
      } else {
        this.router.navigate(['/itinerary']);
      }
    } else if (value.startsWith('select-hotel:')) {
      const hotelName = value.replace('select-hotel:', '');
      this.addMessage({ text: `🏨 ${hotelName}`, sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, hotelName }));
      this.goToNextStep();
    } else if (value === 'view-itinerary') {
      this.addMessage({ text: 'Back to main menu', sender: 'user' });
      this.resetTrip(); this.showMainMenu();
    }
    this.persistMessages();
  }

  handleChipClick(chipValue: string, chipLabel: string): void {
    const step = this.tripStep();
    if (step && SINGLE_SELECT_STEPS.includes(step)) {
      this.handleSingleSelectChip(chipValue, chipLabel);
      this.persistMessages();
      return;
    }
    const noneValues = ['NO_PREFERENCE', 'NONE'];
    const isNone = noneValues.includes(chipValue);
    this.pendingChips.update(curr => {
      if (curr.includes(chipValue)) {
        return curr.filter(v => v !== chipValue);
      }
      if (isNone) {
        return [chipValue];
      }
      return [...curr.filter(v => !noneValues.includes(v)), chipValue];
    });
    this.persistMessages();
  }

  private handleSingleSelectChip(chipValue: string, label: string): void {
    this.addMessage({ text: label, sender: 'user' });
    const step = this.tripStep();
    if (step === 'trip-type') { this.tripPrefs.update(p => ({ ...p, tripType: chipValue as TripType })); this.goToNextStep(); }
    else if (step === 'activity-intensity') { this.tripPrefs.update(p => ({ ...p, activityIntensity: chipValue as Intensity })); this.goToNextStep(); }
    else if (step === 'currency') { this.tripPrefs.update(p => ({ ...p, currency: chipValue })); this.goToNextStep(); }
  }

  private confirmMultiSelectStep(): void {
    const step = this.tripStep();
    const selected = this.pendingChips();
    if (step === 'food-preferences') {
      this.addMessage({ text: selected.length ? selected.join(', ') : 'No preference', sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, foodPreferences: (selected.length ? selected : ['NO_PREFERENCE']) as FoodPref[] }));
      this.pendingChips.set([]); this.goToNextStep();
    } else if (step === 'avoid-preferences') {
      this.addMessage({ text: selected.length ? selected.join(', ') : 'Nothing to avoid', sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, avoid: selected.filter(s => s !== 'NONE') as AvoidPref[] }));
      this.pendingChips.set([]); this.goToNextStep();
    } else if (step === 'trip-style') {
      this.addMessage({ text: selected.length ? selected.join(', ') : 'Relaxed', sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, tripStyle: (selected.length ? selected : ['RELAXED']) as TripStyle[] }));
      this.pendingChips.set([]); this.goToNextStep();
    } else if (step === 'hotel-services-wanted') {
      this.addMessage({ text: selected.length ? selected.join(', ') : 'No services', sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, hotelServicesWanted: selected.filter(s => s !== 'NONE') as HotelSvcType[] }));
      this.pendingChips.set([]); this.goToNextStep();
    }
    this.persistMessages();
  }

  // ── Step navigation ──────────────────────────────────────────

  private goToNextStep(): void {
    this.lockPreviousInteractiveMessages();
    const currentStep = this.tripStep();
    const currentIdx = currentStep ? STEP_ORDER.indexOf(currentStep) : -1;
    for (let i = currentIdx + 1; i < STEP_ORDER.length; i++) {
      if (!this.prefilledSteps().has(STEP_ORDER[i])) {
        this.askStep(STEP_ORDER[i]);
        return;
      }
    }
    this.askConfirmSummary();
  }

  private askStep(step: TripStep): void {
    switch (step) {
      case 'district':              this.askDistrict(); break;
      case 'hotel-name':            this.askHotelName(); break;
      case 'trip-type':             this.askTripType(); break;
      case 'trip-style':            this.askTripStyle(); break;
      case 'check-in-date':         this.askCheckInDate(); break;
      case 'check-out-date':        this.askCheckOutDate(); break;
      case 'budget-total':          this.askBudgetTotal(); break;
      case 'currency':              this.askCurrency(); break;
      case 'food-preferences':      this.askFoodPreferences(); break;
      case 'avoid-preferences':     this.askAvoidPreferences(); break;
      case 'activity-intensity':    this.askActivityIntensity(); break;
      case 'hotel-services-wanted': this.askHotelServicesWanted(); break;
      case 'special-requests':      this.askSpecialRequests(); break;
    }
  }

  private startFreshTripFlow(): void {
    this.tripPrefs.set({});
    this.tripStep.set(null);
    this.pendingChips.set([]);
    this.prefilledSteps.set(new Set());
    this.flow.set('trip-planner');
    this.goToNextStep();
  }

  private startBookingItinerary(): void {
    this.flow.set('booking-itinerary');
    this.tripStep.set('booking-select');
    const active = this.bookingService.allBookings().filter(b => b.status === 'Confirmed' || b.status === 'Pending');
    if (active.length === 0) {
      this.addBotMessage(
        'It appears you don\'t have any active reservations.\n\nShall I help you plan a fresh trip instead?',
        { buttons: [{ label: '✈️  Plan a New Trip', value: 'plan-trip' }] }, 700);
      return;
    }
    const cards: BookingCardData[] = active.map(b => ({
      id: b.id, hotelName: b.hotelName, location: b.location,
      image: b.image, checkIn: b.checkIn, checkOut: b.checkOut,
      guests: b.guests, roomType: b.roomType, status: b.status,
    }));
    this.addBotMessage(
      'Here are your upcoming reservations.\n\n**Please select the booking** for which you\'d like a personalised itinerary.',
      undefined, 700);
    setTimeout(() => {
      this.addMessage({ text: '', sender: 'bot', bookingCards: cards });
      this.persistMessages();
    }, 300);
  }

  selectBookingForItinerary(bookingId: string): void {
    const booking = this.bookingService.allBookings().find(b => b.id === bookingId);
    if (!booking) return;
    this.addMessage({ text: `${booking.hotelName} — ${booking.location}`, sender: 'user' });

    // Infer tripType from guest count
    const inferredTripType: TripType =
      booking.guests === 1 ? 'SOLO' :
      booking.guests === 2 ? 'COUPLE' :
      booking.guests <= 4  ? 'FAMILY' : 'GROUP';

    const prefilled = new Set<TripStep>([
      'district', 'hotel-name', 'check-in-date', 'check-out-date',
      'budget-total', 'currency', 'trip-type',
    ]);

    this.tripPrefs.set({
      district: booking.location,
      hotelName: booking.hotelName,
      checkInDate: booking.checkIn,
      checkOutDate: booking.checkOut,
      budgetTotal: booking.price,
      currency: booking.currency,
      tripType: inferredTripType,
      basedOnBookingId: booking.id,
    });
    this.prefilledSteps.set(prefilled);
    this.flow.set('booking-itinerary');

    const tripLabel = { SOLO: 'Solo', COUPLE: 'Couple', FAMILY: 'Family', GROUP: 'Group', BUSINESS: 'Business' }[inferredTripType];

    this.addBotMessage(
      `Wonderful!\n\n**${booking.hotelName}**\n📍 ${booking.location} · 📅 ${booking.checkIn} → ${booking.checkOut}\n🛏 ${booking.roomType} · 👥 ${booking.guests} guest(s) · ${tripLabel} trip\n💰 Budget: ${booking.currency} ${booking.price.toLocaleString()}\n\nI've pre-filled your details from the booking. Just a few quick preferences to personalise your itinerary!`,
      undefined, 800);
    setTimeout(() => this.goToNextStep(), 600);
    this.persistMessages();
  }

  // ── Step question methods ──────────────────────────────────

  private askDistrict(): void {
    this.tripStep.set('district');
    this.addBotMessage(
      'Wonderful! Let\'s craft your perfect journey.\n\n**Which destination** are you heading to?',
      undefined, 700);
  }

  private askHotelName(): void {
    this.tripStep.set('hotel-name');
    const district = this.tripPrefs().district ?? '';
    const suggestions = getHotelSuggestions(district);
    this.addBotMessage(
      `Here are our **top Marriott properties** in **${this.capitalize(district || 'your destination')}**. Pick one, or type a hotel name:`,
      undefined, 700);
    setTimeout(() => {
      this.addMessage({ text: '', sender: 'bot', hotelPickCards: suggestions });
      this.persistMessages();
    }, 300);
  }

  private askTripType(): void {
    this.tripStep.set('trip-type');
    this.addBotMessage('**Who will be travelling?**', {
      chips: [
        { label: '🧍 Solo', value: 'SOLO' },
        { label: '💑 Couple', value: 'COUPLE' },
        { label: '👨‍👩‍👧 Family', value: 'FAMILY' },
        { label: '👯 Group', value: 'GROUP' },
        { label: '💼 Business', value: 'BUSINESS' },
      ],
    }, 700);
  }

  private askTripStyle(): void {
    this.tripStep.set('trip-style');
    this.addBotMessage('What **experience style** best describes this trip? _(select all that apply)_', {
      chips: [
        { label: '🌿 Relaxed', value: 'RELAXED' },
        { label: '🏔 Adventure', value: 'ADVENTURE' },
        { label: '🏛 Cultural', value: 'CULTURAL' },
        { label: '🧘 Wellness', value: 'WELLNESS' },
        { label: '🍜 Foodie', value: 'FOODIE' },
        { label: '🎉 Nightlife', value: 'NIGHTLIFE' },
      ],
      multiSelect: true,
    }, 700);
  }

  private askCheckInDate(): void {
    this.tripStep.set('check-in-date');
    this.addBotMessage(
      '📅 Please select your **check-in date** using the date picker below.',
      undefined, 700);
  }

  private askCheckOutDate(): void {
    this.tripStep.set('check-out-date');
    this.addBotMessage('📅 Now select your **check-out date**.', undefined, 700);
  }

  private askBudgetTotal(): void {
    this.tripStep.set('budget-total');
    this.addBotMessage(
      '💰 What is your **total trip budget**?\n\n_Enter a number, e.g. 15000._',
      undefined, 700);
  }

  private askCurrency(): void {
    this.tripStep.set('currency');
    this.addBotMessage('💱 Which **currency** is your budget in?', {
      chips: [
        { label: '🇮🇳 INR', value: 'INR' },
        { label: '🇺🇸 USD', value: 'USD' },
        { label: '🇪🇺 EUR', value: 'EUR' },
        { label: '🇬🇧 GBP', value: 'GBP' },
        { label: '🇦🇪 AED', value: 'AED' },
        { label: '🇯🇵 JPY', value: 'JPY' },
        { label: '🇹🇭 THB', value: 'THB' },
        { label: '🇸🇬 SGD', value: 'SGD' },
      ],
    }, 700);
  }

  private askFoodPreferences(): void {
    this.tripStep.set('food-preferences');
    this.pendingChips.set([]);
    this.addBotMessage(
      '🍽 **Dining preferences?**\n\n_Select all that apply, then tap **Confirm**._',
      {
        chips: [
          { label: '🦞 Seafood', value: 'SEAFOOD' },
          { label: '🌱 Vegetarian', value: 'VEGETARIAN' },
          { label: '🌿 Vegan', value: 'VEGAN' },
          { label: '🌍 Local Cuisine', value: 'LOCAL_CUISINE' },
          { label: '🍝 Continental', value: 'CONTINENTAL' },
          { label: '🥡 Street Food', value: 'STREET_FOOD' },
          { label: '🥂 Fine Dining', value: 'FINE_DINING' },
          { label: '✅ No Preference', value: 'NO_PREFERENCE' },
        ],
        multiSelect: true,
      }, 700);
  }

  private askAvoidPreferences(): void {
    this.tripStep.set('avoid-preferences');
    this.pendingChips.set([]);
    this.addBotMessage(
      '🚫 Anything you\'d prefer to **avoid**?\n\n_Select all that apply, then tap **Confirm**._',
      {
        chips: [
          { label: '👥 Crowds', value: 'CROWDS' },
          { label: '🏔 Heights', value: 'HEIGHTS' },
          { label: '🌊 Water', value: 'WATER' },
          { label: '🌶 Spicy Food', value: 'SPICY_FOOD' },
          { label: '🚗 Long Drives', value: 'LONG_DRIVES' },
          { label: '💸 Budget Strain', value: 'BUDGET_STRAIN' },
          { label: '✅ None', value: 'NONE' },
        ],
        multiSelect: true,
      }, 700);
  }

  private askActivityIntensity(): void {
    this.tripStep.set('activity-intensity');
    this.addBotMessage('How **physically active** would you like your days?', {
      chips: [
        { label: '🌸 Low — Easy-paced', value: 'LOW' },
        { label: '⚡ Medium — Moderate', value: 'MEDIUM' },
        { label: '🔥 High — Energetic', value: 'HIGH' },
      ],
    }, 700);
  }

  private askHotelServicesWanted(): void {
    this.tripStep.set('hotel-services-wanted');
    this.pendingChips.set([]);
    this.addBotMessage(
      '🏨 Which **hotel services** would you like?\n\n_Select all that apply, then tap **Confirm**._',
      {
        chips: [
          { label: '🧖 Spa', value: 'SPA' },
          { label: '🍽 Rooftop Dining', value: 'ROOFTOP_DINING' },
          { label: '🏊 Pool', value: 'POOL' },
          { label: '🏌 Golf', value: 'GOLF' },
          { label: '💪 Gym', value: 'GYM' },
          { label: '🚗 Airport Transfer', value: 'AIRPORT_TRANSFER' },
          { label: '🎭 Cultural Experience', value: 'CULTURAL_EXPERIENCE' },
          { label: '✅ None', value: 'NONE' },
        ],
        multiSelect: true,
      }, 700);
  }

  private askSpecialRequests(): void {
    this.tripStep.set('special-requests');
    this.addBotMessage(
      '✏️ Any **special requests** for your trip?\n\n_e.g. "We prefer evening activities", wheelchair access._\n\nType **"none"** if not applicable.',
      undefined, 700);
  }

  // ── Summary ──────────────────────────────────────────────────

  private async askConfirmSummary(): Promise<void> {
    this.lockPreviousInteractiveMessages();
    this.tripStep.set('confirm-summary');
    const p = this.tripPrefs();
    const summary = [
      `📍 **District:** ${p.district ?? '—'}`,
      `🏨 **Hotel:** ${p.hotelName ?? '—'}`,
      `👥 **Trip Type:** ${p.tripType ?? '—'}`,
      `🌿 **Trip Style:** ${p.tripStyle?.length ? p.tripStyle.join(', ') : '—'}`,
      `📅 **Check-in:** ${p.checkInDate ?? '—'}`,
      `📅 **Check-out:** ${p.checkOutDate ?? '—'}`,
      `💰 **Budget:** ${p.budgetTotal ?? '—'} ${p.currency ?? ''}`,
      `🍽 **Food:** ${p.foodPreferences?.join(', ') || 'No preference'}`,
      `🚫 **Avoid:** ${p.avoid?.length ? p.avoid.join(', ') : 'Nothing'}`,
      `⚡ **Activity Intensity:** ${p.activityIntensity ?? '—'}`,
      `🏨 **Hotel Services:** ${p.hotelServicesWanted?.length ? p.hotelServicesWanted.join(', ') : 'None'}`,
      p.specialRequests ? `✏️ **Special Requests:** ${p.specialRequests}` : '',
    ].filter(Boolean).join('\n');

    await this.addBotMessage(
      `Here is a summary of your trip preferences:\n\n${summary}\n\n✅ Shall I **save your preferences and generate your itinerary?**`,
      {
        buttons: [
          { label: '🚀 Generate', value: 'generate-confirmed' },
          { label: '✏️ Start Over', value: 'plan-trip' },
        ],
      }, 900);
  }

  // ── Text input handler ───────────────────────────────────────

  async handleUserInput(input: string): Promise<void> {
    const trimmed = input.trim();
    if (!trimmed) return;
    const step = this.tripStep();
    const f = this.flow();

    if (step === 'district') {
      this.addMessage({ text: trimmed, sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, district: trimmed }));
      this.goToNextStep();
      this.persistMessages();
      return;
    }
    if (step === 'hotel-name') {
      this.addMessage({ text: trimmed, sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, hotelName: trimmed }));
      this.goToNextStep();
      this.persistMessages();
      return;
    }
    if (step === 'check-in-date') {
      const date = new Date(trimmed);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(date.getTime())) {
        await this.addBotMessage('⚠️ Please select a valid date.', undefined, 400);
        return;
      }
      if (date < today) {
        await this.addBotMessage('⚠️ Check-in cannot be in the past.', undefined, 400);
        return;
      }
      this.addMessage({ text: `📅 ${trimmed}`, sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, checkInDate: trimmed }));
      this.goToNextStep();
      this.persistMessages();
      return;
    }
    if (step === 'check-out-date') {
      const date = new Date(trimmed);
      const checkIn = this.tripPrefs().checkInDate;
      if (isNaN(date.getTime())) {
        await this.addBotMessage('⚠️ Please select a valid date.', undefined, 400);
        return;
      }
      if (checkIn && date <= new Date(checkIn)) {
        await this.addBotMessage('⚠️ Check-out must be **after** check-in.', undefined, 400);
        return;
      }
      this.addMessage({ text: `📅 ${trimmed}`, sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, checkOutDate: trimmed }));
      this.goToNextStep();
      this.persistMessages();
      return;
    }
    if (step === 'budget-total') {
      const amount = parseFloat(trimmed.replace(/[^0-9.]/g, ''));
      if (isNaN(amount) || amount <= 0) {
        await this.addBotMessage('⚠️ Please enter a valid amount > 0.', undefined, 400);
        return;
      }
      this.addMessage({ text: `💰 ${amount}`, sender: 'user' });
      this.tripPrefs.update(p => ({ ...p, budgetTotal: amount }));
      this.goToNextStep();
      this.persistMessages();
      return;
    }
    if (step === 'special-requests') {
      this.addMessage({ text: trimmed, sender: 'user' });
      this.tripPrefs.update(p => ({
        ...p,
        specialRequests: trimmed.toLowerCase() === 'none' ? '' : trimmed,
      }));
      this.goToNextStep();
      this.persistMessages();
      return;
    }

    // Main-menu / idle — smart intent detection
    if (f === 'idle' || f === 'main-menu' || !step) {
      this.addMessage({ text: trimmed, sender: 'user' });
      const lower = trimmed.toLowerCase();
      if (lower.includes('booking') || lower.includes('existing') || lower.includes('reservation')) {
        this.startBookingItinerary();
        this.persistMessages();
        return;
      }
      this.tripPrefs.set({ district: trimmed });
      this.prefilledSteps.set(new Set<TripStep>(['district']));
      this.flow.set('trip-planner');
      const hotelSuggestions = getHotelSuggestions(trimmed);
      await this.addBotMessage(
        `Great choice! ✈️ **${this.capitalize(trimmed)}**\n\nHere are our **top Marriott properties** there. Pick one, or type a hotel name:`,
        undefined, 600);
      this.addMessage({ text: '', sender: 'bot', hotelPickCards: hotelSuggestions });
      this.tripStep.set('hotel-name');
      this.persistMessages();
      return;
    }

    if (f === 'trip-planner' || f === 'booking-itinerary') {
      this.addMessage({ text: trimmed, sender: 'user' });
      await this.addBotMessage('Got it! Please use the controls above to continue.', undefined, 500);
      this.persistMessages();
    }
  }

  // ── Save profile & generate itinerary ──────────────────────

  private async saveProfileAndGenerate(): Promise<void> {
    this.lockPreviousInteractiveMessages();
    this.tripStep.set('results');
    this.flow.set('generating');
    const prefs = this.tripPrefs();
    const tripId = `TRIP_${Date.now()}`;
    this.savedTripId.set(tripId);

    const payload: ProfilePayload = {
      district: prefs.district ?? '',
      hotelName: prefs.hotelName ?? '',
      tripType: prefs.tripType ?? 'COUPLE',
      tripStyle: prefs.tripStyle ?? ['RELAXED'],
      checkInDate: prefs.checkInDate ?? '',
      checkOutDate: prefs.checkOutDate ?? '',
      budgetTotal: prefs.budgetTotal ?? 0,
      currency: prefs.currency ?? 'INR',
      foodPreferences: prefs.foodPreferences ?? [],
      avoid: prefs.avoid ?? [],
      activityIntensity: prefs.activityIntensity ?? 'MEDIUM',
      hotelServicesWanted: prefs.hotelServicesWanted ?? [],
      specialRequests: prefs.specialRequests ?? '',
    };

    // Bot intro message
    await this.addBotMessage(
      'Great — I\'ve got everything. Building your personalised trip now ✨',
      undefined, 400
    );

    // Insert progress card message
    const progressId = crypto.randomUUID();
    const initialCard: ProgressCardData = {
      title: '✦ Creating your personalised trip',
      percentage: 0,
      stages: [
        { label: 'Saving preferences', status: 'active' },
        { label: 'Checking local weather & conditions', status: 'pending' },
        { label: 'Finding best places & dining', status: 'pending' },
        { label: 'Personalising itinerary', status: 'pending' },
        { label: 'Finalising your itinerary', status: 'pending' },
      ],
      estimateText: 'Usually takes 8–10 seconds',
    };
    this.addMessage({ text: '', sender: 'bot', progressCard: initialCard });
    // keep a reference to update the card in-place
    const cardMsgIndex = this.messages().length - 1;

    const updateCard = (card: ProgressCardData) => {
      this.messages.update(msgs => {
        const clone = [...msgs];
        clone[cardMsgIndex] = { ...clone[cardMsgIndex], progressCard: { ...card } };
        return clone;
      });
    };

    const advanceStages = (doneUpTo: number, activeIndex: number, pct: number): ProgressCardData => {
      const stages: ProgressStage[] = initialCard.stages.map((s, i) => ({
        ...s,
        status: i < doneUpTo ? 'done' : i === activeIndex ? 'active' : 'pending',
      }));
      return { ...initialCard, percentage: pct, stages };
    };

    // ── Stage 1 (0-2s): Save preferences ──────────────────────────
    let savedTripId = tripId;
    let profileSaved = false;
    try {
      const response = await this.api.saveProfile(tripId, payload);
      savedTripId = response.tripId;
      profileSaved = true;
    } catch { /* mock fallback already handled inside saveProfile */ }
    updateCard(advanceStages(1, 1, 20));
    await this.sleep(1800);

    // ── Stage 2 (2-4s): Checking contextual data ──────────────────
    updateCard(advanceStages(2, 2, 40));
    await this.sleep(2000);

    // ── Stage 3 (4-6s): Finding places & dining ───────────────────
    updateCard(advanceStages(3, 3, 65));
    await this.sleep(2000);

    // ── Stage 4 (6-8s): Personalisation ───────────────────────────
    updateCard(advanceStages(4, 4, 85));

    // Actually call generate while Stage 4 animates
    let result: TripResult;
    try {
      result = await this.api.generate(savedTripId, prefs);
    } catch {
      result = this.api.localMock(prefs);
    }
    await this.sleep(1500);

    // ── Stage 5 (8-10s): Complete ─────────────────────────────────
    const doneCard: ProgressCardData = {
      ...initialCard,
      title: '✅ Your trip is ready!',
      percentage: 100,
      stages: initialCard.stages.map(s => ({ ...s, status: 'done' as const })),
      estimateText: undefined,
      completed: true,
    };
    updateCard(doneCard);
    await this.sleep(1200);

    // ── Replace card with success message ──────────────────────────
    const dest = prefs.district ?? 'your destination';
    this.messages.update(msgs => {
      const clone = [...msgs];
      clone[cardMsgIndex] = {
        ...clone[cardMsgIndex],
        text: `🎉 **Done!** Your personalised **${dest}** itinerary is ready ✨\n\n📅 ${prefs.checkInDate} → ${prefs.checkOutDate}\n💰 ${prefs.currency ?? 'INR'} ${prefs.budgetTotal ?? 0}\n🎫 Trip ID: ${savedTripId}`,
        progressCard: undefined,
        buttons: [
          { label: '🗺 View Itinerary', value: 'navigate-itinerary' },
          { label: '🔄 Plan Another Trip', value: 'plan-trip' },
        ],
      };
      return clone;
    });

    // Store results & bump version so itinerary component reacts
    this.itineraryResult.set(result);
    this.itineraryPrefs.set(prefs);
    this.itineraryVersion.update(v => v + 1);
    this.flow.set('trip-results');
    this.persistMessages();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private resetTrip(): void {
    this.flow.set('idle');
    this.tripPrefs.set({});
    this.tripStep.set(null);
    this.pendingChips.set([]);
    this.prefilledSteps.set(new Set());
  }

  clearChat(): void {
    this.messages.set([]);
    this.resetTrip();
    localStorage.removeItem('chat_history');
    localStorage.removeItem('chat_flow');
    localStorage.removeItem('chat_step');
    this.showMainMenu();
  }

  private persistMessages(): void {
    try {
      localStorage.setItem('chat_history', JSON.stringify(this.messages()));
      localStorage.setItem('chat_flow', this.flow());
      localStorage.setItem('chat_step', this.tripStep() ?? '');
    } catch { /* ignore */ }
  }
}
