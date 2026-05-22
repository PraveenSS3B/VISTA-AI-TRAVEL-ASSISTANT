import { Injectable, signal, computed } from '@angular/core';
import { Booking, BookingStatus } from '../models/booking.model';
import { MOCK_BOOKINGS } from '../models/mock-data';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = signal<Booking[]>(this.loadBookings());
  filterStatus = signal<BookingStatus | 'All'>('All');
  searchQuery = signal('');

  /** All bookings, unfiltered — used by ChatService for personalization */
  allBookings = computed(() => this._bookings());

  bookings = computed(() => {
    let list = this._bookings();
    if (this.filterStatus() !== 'All') {
      list = list.filter((b) => b.status === this.filterStatus());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.hotelName.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q)
      );
    }
    return list;
  });

  private loadBookings(): Booking[] {
    try {
      const saved = localStorage.getItem('bookings');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return MOCK_BOOKINGS;
  }

  private persist(): void {
    try {
      localStorage.setItem('bookings', JSON.stringify(this._bookings()));
    } catch { /* ignore */ }
  }

  getById(id: string): Booking | undefined {
    return this._bookings().find((b) => b.id === id);
  }

  cancelBooking(id: string): void {
    this._bookings.update((bs) =>
      bs.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b))
    );
    this.persist();
  }

  modifyBooking(id: string, changes: Partial<Booking>): void {
    this._bookings.update((bs) =>
      bs.map((b) => (b.id === id ? { ...b, ...changes } : b))
    );
    this.persist();
  }
}
