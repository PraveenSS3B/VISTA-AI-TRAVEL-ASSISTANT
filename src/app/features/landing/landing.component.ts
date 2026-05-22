import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { ChatService } from '../../services/chat.service';
import { HeroComponent } from './components/hero/hero.component';
import { DestinationsComponent } from './components/destinations/destinations.component';
import { HotelsComponent } from './components/hotels/hotels.component';
import { OffersComponent } from './components/offers/offers.component';
import { FooterComponent } from './components/footer/footer.component';
import { ExploreDestinationsComponent } from './components/explore-destinations/explore-destinations.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ExploreDestinationsComponent,
    DestinationsComponent,
    HotelsComponent,
    OffersComponent,
    FooterComponent,
  ],
  template: `
    <!-- ── Top alert bar (mimics Marriott travel alert) ──────────── -->
    <div class="alert-bar">
      <span class="alert-text">
        <strong>Vista AI</strong> — Your personalised itinerary planner is ready.
        <a href="#" (click)="$event.preventDefault(); chat.toggleOpen()">Start planning →</a>
      </span>
    </div>

    <!-- ── Site Header ───────────────────────────────────────────── -->
    <header class="site-header" [class.scrolled]="scrolled()">

      <!-- Utility row -->
      <div class="utility-row">
        <div class="utility-inner">
          <div class="utility-right">
            <a href="#" class="util-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              Help
            </a>
            <div class="util-sep"></div>
            <a href="#" class="util-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              English
            </a>
            <div class="util-sep"></div>
            <a href="#" class="util-link">My Trips</a>
            <div class="util-sep"></div>
            <button class="util-signin-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Welcome, Alex
            </button>
            <button class="theme-toggle" (click)="theme.toggle()">
              {{ theme.isDark() ? '☀️' : '🌙' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main nav row -->
      <div class="nav-row">
        <div class="nav-inner">
          <!-- Logo -->
          <a href="#" class="nav-brand" aria-label="Marriott Bonvoy Home">
            <div class="bonvoy-logo-block">
              <div class="marriott-text">MARRIOTT</div>
              <div class="bonvoy-text">Bonvoy</div>
            </div>
          </a>

          <!-- Nav links -->
          <nav class="nav-links">
            <a href="#" class="nav-link active">Find &amp; Reserve</a>
            <a href="#offers" class="nav-link">Special Offers</a>
            <a href="#destinations" class="nav-link">Vacations</a>
            <a href="#" class="nav-link">Our Brands</a>
            <a href="#" class="nav-link">Credit Cards</a>
            <a href="#" class="nav-link">About Marriott Bonvoy</a>
          </nav>
        </div>
      </div>
    </header>

    <!-- ── Page body ─────────────────────────────────────────────── -->
    <main>
      <app-hero />

      <!-- Member benefits band (exact Marriott style) -->
      <section class="member-band">
        <div class="member-band-inner">
          <h2 class="member-band-title">The Best Rates Are Always Here</h2>
          <p class="member-band-sub">Get the best prices plus free Wi-Fi when you become a Marriott Bonvoy member.</p>
          <div class="member-perks">
            <div class="perk">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
              <span>BEST RATE GUARANTEE</span>
            </div>
            <div class="perk">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="6"/><path d="M12 14v7M9 21h6"/></svg>
              <span>EARN FREE NIGHTS</span>
            </div>
            <div class="perk">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
              <span>FREE WI-FI</span>
            </div>
            <div class="perk">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>MEMBER RATES</span>
            </div>
          </div>
          <div class="member-actions">
            <button class="join-btn" (click)="chat.toggleOpen()">Plan My Trip with Vista ✨</button>
            <button class="signin-ghost">Sign In</button>
          </div>
        </div>
      </section>

      <!-- Brand tiers section -->
      <section class="brands-section">
        <div class="brands-inner">
          <h2 class="brands-title">Your lifelong travel partner for every journey</h2>
          <div class="brand-tiers">
            @for (tier of brandTiers; track tier.label) {
              <div class="brand-tier">
                <div class="tier-label">{{ tier.label }}</div>
                <p class="tier-desc">{{ tier.desc }}</p>
                <div class="tier-brands">
                  @for (b of tier.brands; track b) {
                    <span class="brand-pill">{{ b }}</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <app-explore-destinations />
      <app-destinations id="destinations" />
      <app-hotels id="hotels" />
      <app-offers id="offers" />
    </main>

    <app-footer />
  `,
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  scrolled = signal(false);

  brandTiers = [
    {
      label: 'LUXURY',
      desc: 'Hotels that bring destinations to life with bespoke programming and unparalleled service',
      brands: ['The Ritz-Carlton', 'St. Regis', 'W Hotels', 'The Luxury Collection', 'JW Marriott', 'EDITION'],
    },
    {
      label: 'PREMIUM',
      desc: 'Thoughtfully designed hotels with elevated dining, fitness and meeting experiences',
      brands: ['Marriott Hotels', 'Sheraton', 'Westin', 'Renaissance', 'Delta Hotels', 'Le Méridien', 'Autograph Collection'],
    },
    {
      label: 'SELECT',
      desc: 'Modern, consistent hotels for every kind of stay',
      brands: ['Courtyard', 'Four Points', 'Fairfield', 'AC Hotels', 'Aloft', 'Moxy'],
    },
    {
      label: 'LONGER STAYS',
      desc: 'Spacious studios and apartments designed for extended travel',
      brands: ['Residence Inn', 'TownePlace Suites', 'Element', 'Apartments by Marriott Bonvoy'],
    },
  ];

  constructor(public theme: ThemeService, public chat: ChatService) {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 10);
      });
    }
  }
}
