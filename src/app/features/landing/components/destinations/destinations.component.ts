import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_DESTINATIONS } from '../../../../models/mock-data';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section">
      <div class="section-header">
        <span class="section-label">Explore the World</span>
        <h2 class="section-title">Featured Destinations</h2>
        <p class="section-sub">Handpicked cities and resorts loved by travellers worldwide</p>
      </div>
      <div class="destinations-grid">
        @for (dest of destinations; track dest.id) {
          <div class="dest-card">
            <div class="dest-img-wrap">
              <img [src]="dest.image" [alt]="dest.name" loading="lazy" />
              <span class="dest-tag">{{ dest.tag }}</span>
            </div>
            <div class="dest-info">
              <h3>{{ dest.name }}</h3>
              <span>{{ dest.country }}</span>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styleUrls: ['./destinations.component.scss'],
})
export class DestinationsComponent {
  destinations = MOCK_DESTINATIONS;
}
