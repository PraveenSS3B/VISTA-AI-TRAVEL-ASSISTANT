import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_TESTIMONIALS } from '../../../../models/mock-data';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section alt-bg">
      <div class="section-header">
        <span class="section-label">Guest Love</span>
        <h2 class="section-title">What Our Travelers Say</h2>
      </div>
      <div class="testimonials-grid">
        @for (t of testimonials; track t.id) {
          <div class="testimonial-card">
            <div class="quote-icon">"</div>
            <p class="quote-text">{{ t.text }}</p>
            <div class="reviewer">
              <img [src]="t.avatar" [alt]="t.name" class="reviewer-avatar" loading="lazy" />
              <div>
                <strong>{{ t.name }}</strong>
                <span>{{ t.location }}</span>
              </div>
              <div class="stars">{{ getStars(t.rating) }}</div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styleUrls: ['./testimonials.component.scss'],
})
export class TestimonialsComponent {
  testimonials = MOCK_TESTIMONIALS;

  getStars(n: number): string {
    return '★'.repeat(n);
  }
}
