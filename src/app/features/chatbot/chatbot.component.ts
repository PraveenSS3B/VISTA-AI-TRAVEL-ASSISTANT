import {
  Component, ElementRef, ViewChild,
  AfterViewChecked, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ChatService } from '../../services/chat.service';
import { BookingService } from '../../services/booking.service';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent],
  template: `
    <!-- ── FAB ──────────────────────────────────────────────────── -->
    @if (!isOpen()) {
      <div class="chat-fab-wrap">
        <button class="chat-fab" [class.pulse]="!isOpen()"
          (click)="chatService.toggleOpen()" aria-label="Open Vista AI">
          <span class="fab-tooltip">Hi, I'm Vista — your AI itinerary planner ✨</span>
          <svg class="fab-vista" viewBox="0 0 44 44" fill="none">
            <path d="M8 10 L22 34 L36 10" stroke="white" stroke-width="4.5"
              stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="36" cy="10" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="40" cy="6" r="1.5" fill="white" opacity="0.6"/>
            <circle cx="38" cy="14" r="1" fill="white" opacity="0.5"/>
          </svg>
          @if (unread() > 0) { <span class="badge">{{ unread() }}</span> }
        </button>
      </div>
    }

    <!-- ── Chat Window ───────────────────────────────────────────── -->
    @if (isOpen()) {
      <div class="chat-window" [@slideUp]="'open'">

        <!-- Header -->
        <div class="chat-header">
          <div class="header-left">
            <div class="avatar-wrap">
              <div class="bot-avatar">
                <img src="/vista-avatar.png" alt="Vista" class="vista-avatar-img" />
              </div>
              <span class="online-dot"></span>
            </div>
            <div class="header-info">
              <span class="bot-name">Vista — AI Travel Planner</span>
              <span class="bot-status"><span class="status-dot"></span>Online</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" (click)="chatService.clearChat()" title="Clear">🗑</button>
            <button class="icon-btn" (click)="chatService.minimize()" title="Minimize">−</button>
            <button class="icon-btn" (click)="chatService.toggleOpen()" title="Close">✕</button>
          </div>
        </div>

        <!-- Progress bar -->
        @if (chatService.currentStepNumber() > 0) {
          <div class="progress-bar-wrap">
            <div class="progress-info">
              <span>Step {{ chatService.currentStepNumber() }} of {{ chatService.totalSteps() }}</span>
              <span>{{ chatService.progressPercent() }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="chatService.progressPercent()"></div>
            </div>
          </div>
        }

        <!-- Message stream -->
        <div class="messages-area" #messagesContainer>
          @for (msg of messages(); track msg.id) {
            <app-chat-message
              [message]="msg"
              [selectedChips]="chatService.pendingChips()"
              (buttonClicked)="onButtonClick($event)"
              (chipClicked)="onChipClick($event)"
              (optionClicked)="onOptionClick($event)"
            />
          }

          <!-- Typing indicator -->
          @if (isTyping()) {
            <div class="typing-row">
              <div class="bot-icon-sm">
                <img src="/vista-avatar.png" alt="Vista" class="vista-avatar-img" />
              </div>
              <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
          }
        </div>

        <!-- ── Input Zone — ALWAYS VISIBLE ───────────────────────── -->
        <div class="input-zone">

          <!-- Suggestion chips -->
          @if (suggestions().length > 0) {
            <div class="suggestions">
              @for (s of suggestions(); track s) {
                <button class="sug-chip" (click)="useSuggestion(s)">{{ s }}</button>
              }
            </div>
          }

          <!-- Date input mode -->
          @if (isDateStep()) {
            <div class="input-row">
              <input type="date" class="chat-date-input" [(ngModel)]="dateInput"
                [min]="minDate()" (keydown.enter)="sendDate()" />
              <button class="send-btn" (click)="sendDate()" [disabled]="!dateInput">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div class="input-hint">
              @if (tripStep() === 'check-in-date') { Select a future date }
              @else { Must be after check-in date }
            </div>
          }
          <!-- Number input mode -->
          @else if (isNumberStep()) {
            <div class="input-row">
              <input type="number" class="chat-number-input" [(ngModel)]="numberInput"
                placeholder="e.g. 15000" min="1" (keydown.enter)="sendNumber()" />
              <button class="send-btn" (click)="sendNumber()" [disabled]="!numberInput || numberInput <= 0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div class="input-hint">Enter total trip budget</div>
          }
          <!-- Default text input -->
          @else {
            <div class="input-row">
              <textarea
                #chatInput
                class="chat-textarea"
                [(ngModel)]="userInput"
                [placeholder]="placeholder()"
                (keydown)="onKeyDown($event)"
                [attr.rows]="inputRows()"
                [disabled]="inputLocked()"
              ></textarea>
              <button class="send-btn"
                (click)="sendMessage()"
                [disabled]="!userInput.trim() || inputLocked()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div class="input-hint">
              Enter to send &nbsp;·&nbsp; Shift+Enter for new line
            </div>
          }
        </div>

      </div>
    }
  `,
  styleUrls: ['./chatbot.component.scss'],
  animations: [
    trigger('slideUp', [
      state('open',   style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      state('closed', style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' })),
      transition('closed <=> open', animate('250ms cubic-bezier(0.4,0,0.2,1)')),
    ]),
  ],
})
export class ChatbotComponent implements AfterViewChecked, OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLTextAreaElement>;

  isOpen:   any;
  messages: any;
  isTyping: any;
  flow:     any;
  tripStep: any;
  unread:   any;

  userInput = '';
  dateInput = '';
  numberInput: number | null = null;
  private shouldScroll = false;
  private shouldFocus  = false;
  inputLocked = signal(false);

  constructor(
    public chatService: ChatService,
    public bookingService: BookingService,
  ) {
    this.isOpen   = chatService.isOpen;
    this.messages = chatService.messages;
    this.isTyping = chatService.isTyping;
    this.flow     = chatService.flow;
    this.tripStep = chatService.tripStep;
    this.unread   = chatService.unreadCount;
  }

  ngOnInit(): void {
    this.chatService.scheduleAutoOpen();
  }

  ngAfterViewChecked(): void {
    if (this.flow() === 'generating') { this.scrollToBottom(); }
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
    if (this.shouldFocus  && this.chatInput) {
      this.chatInput.nativeElement.focus();
      this.shouldFocus = false;
    }
  }

  // ── Dynamic placeholder ────────────────────────────────────────
  placeholder = () => {
    const step = this.tripStep();
    const map: Record<string, string> = {
      'district':          'e.g. Visakhapatnam, Goa, Santorini…',
      'hotel-name':        'e.g. Marriott Vizag, Four Seasons Bali…',
      'special-requests':  'e.g. evening activities, early check-in — or "none"',
    };
    return map[step ?? ''] ?? 'Message Vista…';
  };

  // ── Suggestion chips per step ──────────────────────────────────
  suggestions = () => {
    const step = this.tripStep();
    const flow = this.flow();
    if (step === 'district') {
      return [];
    }
    if (flow === 'main-menu' || flow === 'idle' || !step) {
      return [];
    }
    if (step === 'special-requests') {
      return ['none'];
    }
    return [];
  };

  private fmt(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  // ── Dynamic row height ─────────────────────────────────────────
  inputRows = () => {
    const lines = (this.userInput.match(/\n/g) || []).length + 1;
    return Math.min(lines, 4);
  };

  // ── Keyboard handler ───────────────────────────────────────────
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  // ── Chip suggestion click ──────────────────────────────────────
  useSuggestion(s: string): void {
    // strip emoji prefix like "🗼 Paris" → "Paris"
    const clean = s.replace(/^[\p{Emoji}\s]+/u, '').trim();
    if (clean === '✈️ Plan a New Trip' || s.includes('Plan a New Trip')) {
      this.chatService.handleButtonClick('plan-trip');
    } else if (s.includes('Booking')) {
      this.chatService.handleButtonClick('booking-itinerary');
    } else {
      this.userInput = clean;
      this.sendMessage();
    }
    this.shouldScroll = true;
  }

  // ── Input type helpers ──────────────────────────────────────────
  isDateStep(): boolean {
    const s = this.tripStep();
    return s === 'check-in-date' || s === 'check-out-date';
  }

  isNumberStep(): boolean {
    return this.tripStep() === 'budget-total';
  }

  minDate(): string {
    if (this.tripStep() === 'check-out-date') {
      const ci = this.chatService.tripPrefs().checkInDate;
      if (ci) {
        const next = new Date(ci);
        next.setDate(next.getDate() + 1);
        return next.toISOString().split('T')[0];
      }
    }
    return new Date().toISOString().split('T')[0];
  }

  async sendDate(): Promise<void> {
    if (!this.dateInput) return;
    await this.chatService.handleUserInput(this.dateInput);
    this.dateInput = '';
    this.shouldScroll = true;
    this.shouldFocus = true;
  }

  async sendNumber(): Promise<void> {
    if (!this.numberInput || this.numberInput <= 0) return;
    await this.chatService.handleUserInput(String(this.numberInput));
    this.numberInput = null;
    this.shouldScroll = true;
    this.shouldFocus = true;
  }

  // ── Send ───────────────────────────────────────────────────────
  async sendMessage(): Promise<void> {
    const text = this.userInput.trim();
    if (!text) return;
    this.userInput = '';
    this.inputLocked.set(false);
    await this.chatService.handleUserInput(text);
    this.shouldScroll = true;
    this.shouldFocus  = true;
  }

  // ── Event forwarding ───────────────────────────────────────────
  onButtonClick(value: string): void {
    this.chatService.handleButtonClick(value);
    this.shouldScroll = true;
    this.shouldFocus  = true;
  }

  onChipClick(event: { value: string; label: string }): void {
    this.chatService.handleChipClick(event.value, event.label);
    this.shouldScroll = true;
    this.shouldFocus  = true;
  }

  onOptionClick(value: string): void {
    this.chatService.handleButtonClick(value);
    this.shouldScroll = true;
    this.shouldFocus  = true;
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
