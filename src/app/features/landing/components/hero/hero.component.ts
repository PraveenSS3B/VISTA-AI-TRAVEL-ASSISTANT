import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../services/chat.service';

interface Slide {
  image: string;
  eyebrow: string;
  headline: string;
  sub: string;
  cta: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="hero">
      <!-- Slideshow background -->
      @for (slide of slides; track slide.image; let i = $index) {
        <div class="slide" [class.active]="activeSlide() === i"
          [style.background-image]="'url(' + slide.image + ')'">
        </div>
      }
      <div class="slide-overlay"></div>

      <!-- Slide copy -->
      <div class="slide-copy">
        <div class="slide-eyebrow">{{ slides[activeSlide()].eyebrow }}</div>
        <h1 class="slide-headline">{{ slides[activeSlide()].headline }}</h1>
        <p class="slide-sub">{{ slides[activeSlide()].sub }}</p>
        <button class="slide-cta" (click)="chat.toggleOpen()">{{ slides[activeSlide()].cta }}</button>
      </div>

      <!-- Category tabs (real Marriott style) -->
      <div class="cat-tabs">
        @for (cat of categories; track cat) {
          <button class="cat-tab" [class.active]="activeCategory() === cat" (click)="activeCategory.set(cat)">
            {{ cat }}
          </button>
        }
      </div>

      <!-- Slide dots -->
      <div class="slide-dots">
        @for (slide of slides; track slide.image; let i = $index) {
          <button class="dot" [class.active]="activeSlide() === i" (click)="goTo(i)" [attr.aria-label]="'Slide ' + (i+1)"></button>
        }
      </div>

      <!-- Search widget — floats at bottom of hero -->
      <div class="search-widget">
        <div class="widget-tabs">
          <button class="widget-tab" [class.active]="activeTab() === 'properties'" (click)="activeTab.set('properties')">
            Properties
          </button>
          <button class="widget-tab" [class.active]="activeTab() === 'meetings'" (click)="activeTab.set('meetings')">
            Meetings &amp; Events
          </button>
        </div>

        <div class="widget-body">
          <div class="widget-form">
            <div class="form-field dest-field">
              <label>Destination</label>
              <input type="text" [(ngModel)]="destination" placeholder="Where can we take you?" class="form-input" />
            </div>

            <div class="form-field date-field">
              <label>Check-in</label>
              <input type="date" [(ngModel)]="checkIn" class="form-input" />
            </div>

            <div class="form-field date-field">
              <label>Check-out</label>
              <input type="date" [(ngModel)]="checkOut" class="form-input" />
            </div>

            <div class="form-field">
              <label>Rooms &amp; Guests</label>
              <select class="form-input" [(ngModel)]="roomsGuests">
                <option>1 Room, 1 Guest</option>
                <option>1 Room, 2 Guests</option>
                <option>2 Rooms, 2 Guests</option>
                <option>2 Rooms, 4 Guests</option>
              </select>
            </div>

            <div class="form-field">
              <label>Special Rates</label>
              <select class="form-input" [(ngModel)]="specialRate">
                <option>Lowest Regular Rate</option>
                <option>Member Rate</option>
                <option>AAA / CAA Rate</option>
                <option>Corporate Rate</option>
              </select>
            </div>

            <button class="find-btn" (click)="chat.toggleOpen()">Find →</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnInit, OnDestroy {
  activeSlide   = signal(0);
  activeTab     = signal<'properties' | 'meetings'>('properties');
  activeCategory = signal('Poolside');

  destination  = '';
  checkIn      = '';
  checkOut     = '';
  roomsGuests  = '1 Room, 1 Guest';
  specialRate  = 'Lowest Regular Rate';

  private timer: any;

  categories = ['Poolside', 'Member Exclusives', 'Golf', 'Outdoors', 'Family'];

  slides: Slide[] = [
    {
      image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1920&q=80',
      eyebrow: 'CARIBBEAN VIEWS, CABANA SHADE',
      headline: 'Take a Dip in Paradise',
      sub: 'Float beneath the royal palms with turquoise waters and private overwater bungalows.',
      cta: 'Explore Stays',
    },
    {
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
      eyebrow: 'GLAMOUR & SKYLINE VIEWS',
      headline: 'Dive in on Dubai',
      sub: 'From the legendary Burj Al Arab to Palm Jumeirah infinity pools — luxury beyond compare.',
      cta: 'Discover Dubai',
    },
    {
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=80',
      eyebrow: 'TROPICAL TRANQUILITY',
      headline: 'Your Own Slice of Bali',
      sub: 'Private villa pools, terraced rice fields, and sunset temple views — Bali is calling.',
      cta: 'Book Bali',
    },
    {
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=80',
      eyebrow: 'ICONIC BLUE DOMES',
      headline: 'Santorini Awaits',
      sub: 'Clifftop suites, volcanic sunsets and world-class wine — romance perfected.',
      cta: 'Explore Greece',
    },
    {
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
      eyebrow: 'CULTURE & CUISINE',
      headline: 'Discover Tokyo',
      sub: 'Ancient temples, Michelin-starred ramen and cherry-blossom boulevards.',
      cta: 'Plan Tokyo Trip',
    },
  ];

  constructor(public chat: ChatService) {}

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.activeSlide.update(i => (i + 1) % this.slides.length);
    }, 6000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  goTo(i: number): void {
    this.activeSlide.set(i);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.activeSlide.update(n => (n + 1) % this.slides.length);
    }, 6000);
  }
}
