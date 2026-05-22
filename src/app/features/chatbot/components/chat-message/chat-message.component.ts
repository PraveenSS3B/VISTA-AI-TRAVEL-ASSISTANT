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
          <img src="/vista-avatar.png" alt="Vista" class="vista-avatar-img" />
        </div>
      }
      <div class="bubble-group" [class.locked]="message.locked">

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
              <button class="booking-card" [disabled]="message.locked" (click)="buttonClicked.emit('select-booking:' + card.id)">
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

        <!-- Hotel pick cards -->
        } @else if (message.hotelPickCards && message.hotelPickCards.length > 0) {
          <div class="hotel-pick-cards">
            @for (hotel of message.hotelPickCards; track hotel.id) {
              <button class="hotel-pick-card" [disabled]="message.locked" (click)="buttonClicked.emit('select-hotel:' + hotel.name)">
                <img [src]="hotel.image" [alt]="hotel.name" class="hotel-pick-img" />
                <div class="hotel-pick-body">
                  <div class="hotel-pick-name">{{ hotel.name }}</div>
                  <div class="hotel-pick-stars">
                    @for (s of getStarsArray(hotel.stars); track s) {
                      <span class="star">★</span>
                    }
                  </div>
                  <div class="hotel-pick-tagline">{{ hotel.tagline }}</div>
                  <div class="hotel-pick-price">
                    <span class="price-value">{{ hotel.currency }} {{ hotel.pricePerNight | number }}</span>
                    <span class="price-unit"> / night</span>
                  </div>
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
              <button class="chat-btn" [disabled]="message.locked" (click)="buttonClicked.emit(btn.value)">{{ btn.label }}</button>
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
                [disabled]="message.locked || isChipDisabled(chip.value)"
                (click)="chipClicked.emit({ value: chip.value, label: chip.label })"
              >{{ chip.label }}</button>
            }
          </div>
          @if (message.multiSelect) {
            <button
              class="confirm-btn"
              [class.confirm-active]="isConfirmActive()"
              [disabled]="message.locked || !isConfirmActive()"
              (click)="buttonClicked.emit('confirm-selections')"
            >
              Confirm
            </button>
          }
        }

        @if (!message.bookingCards && !message.progressCard && !message.hotelPickCards) {
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

  /** Confirm is active only for the current (unlocked) multi-select message with at least one chip picked */
  isConfirmActive(): boolean {
    return this.message.multiSelect === true
      && !this.message.locked
      && this.selectedChips.length > 0;
  }

  isChipDisabled(chipValue: string): boolean {
    if (!this.message.multiSelect || this.selectedChips.length === 0) return false;
    const isNone = this.noneValues.includes(chipValue);
    const hasNone = this.selectedChips.some(v => this.noneValues.includes(v));
    const hasSpecific = this.selectedChips.some(v => !this.noneValues.includes(v));
    if (isNone && hasSpecific) return true;
    if (!isNone && hasNone) return true;
    return false;
  }

  getStarsArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
}
