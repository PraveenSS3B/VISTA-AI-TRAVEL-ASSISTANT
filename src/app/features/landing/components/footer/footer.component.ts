import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../services/chat.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">

      <!-- App promo row -->
      <div class="app-row">
        <div class="app-row-inner">
          <div class="app-icon">
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
              <path d="M8 10 L22 34 L36 10" stroke="#8B1D42" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="36" cy="10" r="2.5" fill="#8B1D42" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <div class="app-title">Unlock extraordinary experiences with Vista AI™</div>
            <div class="app-sub">Wherever you go, Vista gives you a personalised itinerary built around you.</div>
          </div>
          <button class="app-cta" (click)="chat.toggleOpen()">Start Planning ✨</button>
        </div>
      </div>

      <!-- Main footer grid -->
      <div class="footer-main">
        <div class="footer-grid">
          <!-- Brand col -->
          <div class="footer-brand-col">
            <div class="footer-logo">
              <div class="marriott-text">MARRIOTT</div>
              <div class="bonvoy-text">Bonvoy</div>
            </div>
            <p class="brand-tagline">Your AI-powered luxury travel companion. Explore the world, effortlessly.</p>
            <div class="social-row">
              <a href="#" aria-label="Facebook" class="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" class="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" class="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>
          </div>

          <!-- Link groups -->
          <div class="link-group">
            <h4>Marriott Bonvoy</h4>
            <a href="#">Bonvoy Overview</a>
            <a href="#">Member Benefits</a>
            <a href="#">Earn Points</a>
            <a href="#">Redeem Points</a>
            <a href="#">Bonvoy Credit Card</a>
          </div>

          <div class="link-group">
            <h4>Meetings &amp; Events</h4>
            <a href="#">Overview</a>
            <a href="#">Business Meetings</a>
            <a href="#">Weddings</a>
            <a href="#">Social Events</a>
            <a href="#">Group Travel</a>
          </div>

          <div class="link-group">
            <h4>Deals &amp; Packages</h4>
            <a href="#">All Deals</a>
            <a href="#">Hotel &amp; Flight</a>
            <a href="#">All-Inclusive</a>
            <a href="#">Resorts</a>
            <a href="#">Weekend Escapes</a>
          </div>

          <div class="link-group">
            <h4>Top Destinations</h4>
            <a href="#">Paris Hotels</a>
            <a href="#">Dubai Hotels</a>
            <a href="#">Tokyo Hotels</a>
            <a href="#">Bali Hotels</a>
            <a href="#">Maldives Hotels</a>
            <a href="#">New York Hotels</a>
            <a href="#">London Hotels</a>
          </div>

          <div class="link-group">
            <h4>Our Company</h4>
            <a href="#">About Marriott International</a>
            <a href="#">Careers</a>
            <a href="#">Investor Relations</a>
            <a href="#">News</a>
            <a href="#">Sustainability</a>
          </div>

          <div class="link-group">
            <h4>Find Help</h4>
            <a href="#">Help &amp; Contact Us</a>
            <a href="#">Look Up Reservation</a>
            <a href="#">Global Phone Numbers</a>
            <a href="#">Best Rate Guarantee</a>
            <a href="#">Site Map</a>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <span>© 1996 – 2026 Marriott International, Inc. All rights reserved. Marriott Proprietary Information</span>
          <div class="bottom-links">
            <a href="#">Privacy Center</a>
            <a href="#">Terms of Use</a>
            <a href="#">Program Terms &amp; Conditions</a>
          </div>
        </div>
      </div>

    </footer>
  `,
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  constructor(public chat: ChatService) {}
}
