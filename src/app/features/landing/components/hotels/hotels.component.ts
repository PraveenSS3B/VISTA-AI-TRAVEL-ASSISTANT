import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_HOTELS } from '../../../../models/mock-data';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section alt-bg">
      <div class="section-header">
        <span class="section-label">Top Picks</span>
        <h2 class="section-title">Recommended Hotels</h2>
        <p class="section-sub">Curated luxury stays with exceptional guest experiences</p>
      </div>
      <div class="hotels-grid">
        @for (hotel of hotels; track hotel.id) {
          <div class="hotel-card">
            <div class="hotel-img-wrap">
              <img [src]="hotel.image" [alt]="hotel.name" loading="lazy" />
              @if (hotel.badge) {
                <span class="hotel-badge">{{ hotel.badge }}</span>
              }
            </div>
            <div class="hotel-body">
              <div class="hotel-header">
                <h3>{{ hotel.name }}</h3>
                <span class="hotel-price">\${{ hotel.pricePerNight }}<small>/night</small></span>
              </div>
              <p class="hotel-location">📍 {{ hotel.location }}</p>
              <div class="hotel-meta">
                <span class="stars">{{ getStars(hotel.stars) }}</span>
                <span class="rating">⭐ {{ hotel.rating }}/5</span>
              </div>
              <div class="amenities">
                @for (a of hotel.amenities.slice(0,3); track a) {
                  <span class="amenity">{{ a }}</span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styleUrls: ['./hotels.component.scss'],
})
export class HotelsComponent {
  hotels = MOCK_HOTELS;

  getStars(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
}
