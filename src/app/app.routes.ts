import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { ItineraryComponent } from './features/itinerary/itinerary.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'itinerary', component: ItineraryComponent },
];
