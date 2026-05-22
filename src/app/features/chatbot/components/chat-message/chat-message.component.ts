import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../../models/chat.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-row" [class.user-row]="message.sender === 'user'">
      @if (message.sender === 'bot') {
        <div class="msg-avatar bot-icon-sm">
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="10" fill="url(#hgm)"/>
            <path d="M9.8 10.2C9.8 7.3 11.7 5.6 14 5.6C16.3 5.6 18.2 7.3 18.2 10.2" fill="white" fill-opacity="0.9"/>
            <rect x="7.7" y="9.5" width="12.6" height="1.8" rx="0.9" fill="white" fill-opacity="0.95"/>
            <rect x="10.2" y="8.4" width="7.6" height="1.3" rx="0.65" fill="#C5A55A" fill-opacity="0.75"/>
            <rect x="8.4" y="11.9" width="11.2" height="9.8" rx="3.8" fill="white" fill-opacity="0.95"/>
            <circle cx="11.5" cy="16.1" r="1.4" fill="#8B1D42"/>
            <circle cx="16.5" cy="16.1" r="1.4" fill="#8B1D42"/>
            <circle cx="11.9" cy="15.6" r="0.5" fill="white"/>
            <circle cx="16.9" cy="15.6" r="0.5" fill="white"/>
            <path d="M11.2 19.3Q14 21 16.8 19.3" stroke="#8B1D42" stroke-width="0.9" stroke-linecap="round" fill="none"/>
            <defs>
              <linearGradient id="hgm" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stop-color="#A02050"/>
                <stop offset="1" stop-color="#8B1D42"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      }
      <div class="bubble-group">

        <!-- Progress card (AI planning experience) -->
        @if (message.progressCard) {
          <div class="progress-card" [class.completed]="message.progressCard.completed">
            <div class="progress-card-title">{{ message.progressCard.title }}</div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" [style.width.%]="message.progressCard.percentage"></div>
            </div>
            <div class="progress-pct">{{ message.progressCard.percentage }}%</div>
            <div class="progress-stages">
              @for (stage of message.progressCard.stages; track stage.label) {
                <div class="progress-stage" [class]="'stage-' + stage.status">
                  @if (stage.status === 'done') {
                    <span class="stage-icon done-icon">✓</span>
                  } @else if (stage.status === 'active') {
                    <span class="stage-icon active-icon">
                      <span class="spinner"></span>
                    </span>
                  } @else {
                    <span class="stage-icon pending-icon">○</span>
                  }
                  <span class="stage-label">{{ stage.label }}</span>
                </div>
              }
            </div>
            @if (message.progressCard.estimateText) {
              <div class="progress-estimate">{{ message.progressCard.estimateText }}</div>
            }
          </div>

        <!-- Booking card selector list -->
        } @else if (message.bookingCards && message.bookingCards.length > 0) {
          <div class="booking-cards">
            @for (card of message.bookingCards; track card.id) {
              <button class="booking-card" (click)="buttonClicked.emit('select-booking:' + card.id)">
                <img [src]="card.image" [alt]="card.hotelName" class="card-img" />
                <div class="card-info">
                  <div class="card-hotel">{{ card.hotelName }}</div>
                  <div class="card-location">📍 {{ card.location }}</div>
                  <div class="card-dates">📅 {{ card.checkIn }} → {{ card.checkOut }}</div>
                  <div class="card-meta">👥 {{ card.guests }} guest(s) &middot; {{ card.roomType }}</div>
                  <span class="card-status" [class]="'status-' + card.status.toLowerCase()">{{ card.status }}</span>
                </div>
              </button>
            }
          </div>
        } @else if (message.text) {
          <div
            class="bubble"
            [class.bot-bubble]="message.sender === 'bot'"
            [class.user-bubble]="message.sender === 'user'"
            [innerHTML]="formatText(message.text)"
          ></div>
        }

        @if (message.buttons && message.buttons.length > 0) {
          <div class="bubble-buttons">
            @for (btn of message.buttons; track btn.value) {
              <button class="chat-btn" (click)="buttonClicked.emit(btn.value)">{{ btn.label }}</button>
            }
          </div>
        }

        @if (message.chips && message.chips.length > 0) {
          <div class="chip-grid">
            @for (chip of message.chips; track chip.value) {
              <button
                class="chip"
                [class.selected]="selectedChips.includes(chip.value)"
                [class.disabled]="isChipDisabled(chip.value)"
                [disabled]="isChipDisabled(chip.value)"
                (click)="chipClicked.emit({ value: chip.value, label: chip.label })"
              >{{ chip.label }}</button>
            }
          </div>
          @if (message.multiSelect) {
            <button class="confirm-btn" (click)="buttonClicked.emit('confirm-selections')">
              ✅ Confirm Selection
            </button>
          }
        }

        @if (!message.bookingCards && !message.progressCard) {
          <span class="timestamp">{{ message.timestamp | date:'shortTime' }}</span>
        }
      </div>
      @if (message.sender === 'user') {
        <div class="user-avatar">👤</div>
      }
    </div>
  `,
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ChatMessage;
  @Input() selectedChips: string[] = [];
  @Output() buttonClicked = new EventEmitter<string>();
  @Output() chipClicked = new EventEmitter<{ value: string; label: string }>();
  @Output() optionClicked = new EventEmitter<string>();

  private readonly noneValues = ['NO_PREFERENCE', 'NONE'];

  isChipDisabled(chipValue: string): boolean {
    if (!this.message.multiSelect || this.selectedChips.length === 0) return false;
    const isNone = this.noneValues.includes(chipValue);
    const hasNone = this.selectedChips.some(v => this.noneValues.includes(v));
    const hasSpecific = this.selectedChips.some(v => !this.noneValues.includes(v));
    if (isNone && hasSpecific) return true;
    if (!isNone && hasNone) return true;
    return false;
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
}
