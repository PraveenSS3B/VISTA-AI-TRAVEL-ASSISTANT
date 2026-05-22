import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_OFFERS } from '../../../../models/mock-data';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section">
      <div class="section-header">
        <span class="section-label">Limited Time</span>
        <h2 class="section-title">Exclusive Travel Offers</h2>
        <p class="section-sub">Grab these deals before they're gone</p>
      </div>
      <div class="offers-grid">
        @for (offer of offers; track offer.id) {
          <div class="offer-card">
            <div class="offer-img-wrap">
              <img [src]="offer.image" [alt]="offer.title" loading="lazy" />
              <div class="offer-discount">{{ offer.discount }}</div>
            </div>
            <div class="offer-body">
              <h3>{{ offer.title }}</h3>
              <p>{{ offer.description }}</p>
              <div class="offer-footer">
                <span class="valid">Valid until {{ offer.validUntil }}</span>
                <button class="offer-btn">Claim Deal</button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent {
  offers = MOCK_OFFERS;
}
