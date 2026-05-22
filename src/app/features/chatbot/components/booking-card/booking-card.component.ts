import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../../services/booking.service';
import { Booking } from '../../../../models/booking.model';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="booking-card" [class.cancelled]="booking.status === 'Cancelled'">
      <img [src]="booking.image" [alt]="booking.hotelName" class="hotel-img" loading="lazy" />
      <div class="card-body">
        <div class="card-header">
          <div>
            <h4 class="hotel-name">{{ booking.hotelName }}</h4>
            <span class="location">📍 {{ booking.location }}</span>
          </div>
          <span class="status-badge" [class]="'status-' + booking.status.toLowerCase()">
            {{ booking.status }}
          </span>
        </div>
        <div class="card-details">
          <div class="detail">
            <span class="label">Check-in</span>
            <span class="value">{{ booking.checkIn }}</span>
          </div>
          <div class="detail">
            <span class="label">Check-out</span>
            <span class="value">{{ booking.checkOut }}</span>
          </div>
          <div class="detail">
            <span class="label">Guests</span>
            <span class="value">{{ booking.guests }}</span>
          </div>
          <div class="detail">
            <span class="label">Room</span>
            <span class="value room">{{ booking.roomType }}</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="price">\${{ booking.price | number }}</span>
          <span class="booking-id">{{ booking.id }}</span>
          @if (booking.status !== 'Cancelled') {
            <button class="action-btn cancel-btn" (click)="onCancel()">Cancel</button>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./booking-card.component.scss'],
})
export class BookingCardComponent {
  @Input({ required: true }) booking!: Booking;

  constructor(private bookingService: BookingService) {}

  onCancel(): void {
    if (confirm(`Cancel booking ${this.booking.id}?`)) {
      this.bookingService.cancelBooking(this.booking.id);
    }
  }
}
