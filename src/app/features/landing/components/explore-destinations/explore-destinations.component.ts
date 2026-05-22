import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DestinationLink {
  city: string;
  country: string;
}

@Component({
  selector: 'app-explore-destinations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="explore-section">
      <div class="explore-inner">
        <h2 class="explore-title">Explore Our Destinations</h2>
        <div class="dest-links-grid">
          @for (dest of destinations; track dest.city) {
            <a href="#" class="dest-link">
              <span>Properties in {{ dest.city }}, {{ dest.country }}</span>
              <span class="chevron">›</span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./explore-destinations.component.scss'],
})
export class ExploreDestinationsComponent {
  destinations: DestinationLink[] = [
    { city: 'Paris', country: 'France' },
    { city: 'Dubai', country: 'UAE' },
    { city: 'Tokyo', country: 'Japan' },
    { city: 'Bali', country: 'Indonesia' },
    { city: 'Maldives', country: 'South Asia' },
    { city: 'Santorini', country: 'Greece' },
    { city: 'London', country: 'UK' },
    { city: 'New York', country: 'USA' },
    { city: 'Rome', country: 'Italy' },
    { city: 'Sydney', country: 'Australia' },
    { city: 'Bangkok', country: 'Thailand' },
    { city: 'Singapore', country: 'Singapore' },
  ];
}
