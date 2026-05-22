import { Booking } from './booking.model';
import { Destination, Hotel, Testimonial, Offer } from './landing.model';
import { HotelSuggestion } from './chat.model';

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-001',
    hotelName: 'The Grand Palazzo',
    location: 'Venice, Italy',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
    checkIn: '2026-06-15',
    checkOut: '2026-06-20',
    guests: 2,
    status: 'Confirmed',
    price: 1850,
    currency: 'EUR',
    roomType: 'Deluxe Canal Suite',
  },
  {
    id: 'BK-002',
    hotelName: 'Burj Al Arab',
    location: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
    checkIn: '2026-07-10',
    checkOut: '2026-07-14',
    guests: 3,
    status: 'Confirmed',
    price: 4200,
    currency: 'AED',
    roomType: 'Royal Suite',
  },
  {
    id: 'BK-003',
    hotelName: 'Santorini Blu Resort',
    location: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80',
    checkIn: '2026-08-05',
    checkOut: '2026-08-12',
    guests: 2,
    status: 'Pending',
    price: 2100,
    currency: 'EUR',
    roomType: 'Infinity Pool Villa',
  },
  {
    id: 'BK-004',
    hotelName: 'Park Hyatt Tokyo',
    location: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    checkIn: '2026-09-01',
    checkOut: '2026-09-07',
    guests: 1,
    status: 'Confirmed',
    price: 2800,
    currency: 'JPY',
    roomType: 'Park Deluxe Room',
  },
  {
    id: 'BK-005',
    hotelName: 'Four Seasons Bali',
    location: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80',
    checkIn: '2026-05-20',
    checkOut: '2026-05-27',
    guests: 2,
    status: 'Cancelled',
    price: 3200,
    currency: 'USD',
    roomType: 'Beachfront Bungalow',
  },
  {
    id: 'BK-006',
    hotelName: 'Ritz Carlton Maldives',
    location: 'Malé, Maldives',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80',
    checkIn: '2026-10-15',
    checkOut: '2026-10-22',
    guests: 2,
    status: 'Confirmed',
    price: 5600,
    currency: 'USD',
    roomType: 'Overwater Villa',
  },
  {
    id: 'BK-007',
    hotelName: 'Claridge\'s London',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&q=80',
    checkIn: '2026-11-10',
    checkOut: '2026-11-13',
    guests: 4,
    status: 'Pending',
    price: 3400,
    currency: 'GBP',
    roomType: 'Superior Suite',
  },
  {
    id: 'BK-008',
    hotelName: 'Amangiri Resort',
    location: 'Utah, USA',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&q=80',
    checkIn: '2026-12-20',
    checkOut: '2026-12-26',
    guests: 2,
    status: 'Confirmed',
    price: 4800,
    currency: 'USD',
    roomType: 'Mesa Suite',
  },
];

export const MOCK_DESTINATIONS: Destination[] = [
  { id: 1, name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', tag: 'Most Popular' },
  { id: 2, name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80', tag: 'Romantic' },
  { id: 3, name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tag: 'Trending' },
  { id: 4, name: 'Maldives', country: 'South Asia', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80', tag: 'Luxury' },
  { id: 5, name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: 'Cultural' },
  { id: 6, name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', tag: 'Glamour' },
];

export const MOCK_HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'The Grand Palazzo',
    location: 'Venice, Italy',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    stars: 5,
    rating: 4.9,
    pricePerNight: 370,
    amenities: ['Pool', 'Spa', 'Free Breakfast', 'Airport Transfer'],
    badge: 'Editor\'s Choice',
  },
  {
    id: 2,
    name: 'Santorini Blu Resort',
    location: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
    stars: 5,
    rating: 4.8,
    pricePerNight: 300,
    amenities: ['Infinity Pool', 'Sea View', 'Breakfast', 'Gym'],
    badge: 'Best Value',
  },
  {
    id: 3,
    name: 'Four Seasons Bali',
    location: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    stars: 5,
    rating: 4.7,
    pricePerNight: 457,
    amenities: ['Private Beach', 'Spa', 'Pool', 'Gym'],
  },
  {
    id: 4,
    name: 'Ritz Carlton Maldives',
    location: 'Malé, Maldives',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80',
    stars: 5,
    rating: 5.0,
    pricePerNight: 800,
    amenities: ['Overwater Villa', 'Snorkeling', 'Spa', 'Butler Service'],
    badge: 'Top Rated',
  },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Sophia Williams',
    avatar: 'https://i.pravatar.cc/80?img=47',
    rating: 5,
    text: 'The AI travel assistant planned our entire honeymoon in minutes. Every recommendation was perfect — from the overwater villa to the sunset dinner cruise. Truly magical!',
    location: 'New York, USA',
  },
  {
    id: 2,
    name: 'James Hartwell',
    avatar: 'https://i.pravatar.cc/80?img=12',
    rating: 5,
    text: 'I\'ve used many travel apps but nothing compares. The chatbot understood exactly what I wanted — a luxury Tokyo experience on a tight schedule. Flawless execution.',
    location: 'London, UK',
  },
  {
    id: 3,
    name: 'Priya Patel',
    avatar: 'https://i.pravatar.cc/80?img=25',
    rating: 5,
    text: 'Managing all our family bookings in one place is a game changer. The assistant even reminded us about check-in times and suggested kid-friendly activities!',
    location: 'Mumbai, India',
  },
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: 1,
    title: 'Early Bird Summer Deal',
    description: 'Book your summer holiday 90 days in advance and save big on luxury stays.',
    discount: '30% OFF',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    validUntil: '2026-06-30',
  },
  {
    id: 2,
    title: 'Romantic Getaway Package',
    description: 'Couples\' exclusive — spa, breakfast, and late checkout included at top resorts.',
    discount: '25% OFF',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
    validUntil: '2026-07-15',
  },
  {
    id: 3,
    title: 'Weekend Flash Sale',
    description: 'Limited seats for premium city hotels this weekend. Book before midnight!',
    discount: '40% OFF',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    validUntil: '2026-05-25',
  },
];

// ── Hotel suggestions by destination keyword ──────────────────────────────

const HOTEL_SUGGESTIONS_MAP: Record<string, HotelSuggestion[] | string> = {
  'goa': [
    { id: 'HS-GOA-1', name: 'Marriott Resort & Spa, Goa', tagline: 'Beachfront luxury with world-class spa, infinity pool and sunset lounge.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', stars: 5, pricePerNight: 12500, currency: 'INR' },
    { id: 'HS-GOA-2', name: 'W Goa', tagline: 'Trendy beachside retreat with vibrant nightlife, curated cocktails and private cabanas.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 5, pricePerNight: 18000, currency: 'INR' },
    { id: 'HS-GOA-3', name: 'Courtyard by Marriott Goa', tagline: 'Modern comfort in the heart of Goa with pool, gym and multicuisine dining.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 4, pricePerNight: 7500, currency: 'INR' },
  ],
  'vizag': [
    { id: 'HS-VIZ-1', name: 'Marriott Resort & Convention Centre, Vizag', tagline: 'Oceanfront resort on the Bay of Bengal with panoramic sea views and lush gardens.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', stars: 5, pricePerNight: 9000, currency: 'INR' },
    { id: 'HS-VIZ-2', name: 'Four Points by Sheraton Vizag', tagline: 'Contemporary city hotel near RK Beach with rooftop pool and all-day dining.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 4, pricePerNight: 5500, currency: 'INR' },
    { id: 'HS-VIZ-3', name: 'Fairfield by Marriott Vizag', tagline: 'Smart, value-driven stay with modern rooms, fitness centre and business facilities.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 4, pricePerNight: 4200, currency: 'INR' },
  ],
  'visakhapatnam': 'vizag',
  'dubai': [
    { id: 'HS-DXB-1', name: 'JW Marriott Marquis Dubai', tagline: 'The world\'s tallest hotel — two iconic towers, 14 restaurants and a luxury spa.', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80', stars: 5, pricePerNight: 950, currency: 'AED' },
    { id: 'HS-DXB-2', name: 'The Ritz-Carlton, Dubai', tagline: 'Elegant beachfront resort on JBR with pristine private beach and butler service.', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&q=80', stars: 5, pricePerNight: 1800, currency: 'AED' },
    { id: 'HS-DXB-3', name: 'W Dubai — The Palm', tagline: 'Bold, playful luxury on Palm Jumeirah with WET Deck pool and stunning Gulf views.', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80', stars: 5, pricePerNight: 1400, currency: 'AED' },
  ],
  'paris': [
    { id: 'HS-PAR-1', name: 'Paris Marriott Champs Elysées', tagline: 'Iconic address on the Champs-Élysées with Eiffel Tower views and Parisian elegance.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', stars: 5, pricePerNight: 620, currency: 'EUR' },
    { id: 'HS-PAR-2', name: 'Renaissance Paris Vendôme', tagline: 'Boutique luxury near Place Vendôme with art-deco interiors and gourmet dining.', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80', stars: 5, pricePerNight: 480, currency: 'EUR' },
    { id: 'HS-PAR-3', name: 'Courtyard Paris Gare de Lyon', tagline: 'Modern comfort steps from Gare de Lyon — ideal for exploring the City of Light.', image: 'https://images.unsplash.com/photo-1471623320832-752e8bbf8413?w=400&q=80', stars: 4, pricePerNight: 260, currency: 'EUR' },
  ],
  'france': 'paris',
  'tokyo': [
    { id: 'HS-TKY-1', name: 'Tokyo Marriott Hotel', tagline: 'Sophisticated high-rise in Shinagawa with skyline views, spa and executive lounge.', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', stars: 5, pricePerNight: 45000, currency: 'JPY' },
    { id: 'HS-TKY-2', name: 'The Ritz-Carlton, Tokyo', tagline: 'Iconic luxury in Roppongi with Mt. Fuji views, Michelin dining and world-class spa.', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80', stars: 5, pricePerNight: 85000, currency: 'JPY' },
    { id: 'HS-TKY-3', name: 'Courtyard by Marriott Tokyo Station', tagline: 'Prime location at Tokyo Station — perfect for Shinkansen access and city exploration.', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&q=80', stars: 4, pricePerNight: 28000, currency: 'JPY' },
  ],
  'japan': 'tokyo',
  'bali': [
    { id: 'HS-BAL-1', name: 'The Ritz-Carlton, Bali', tagline: 'Cliffside luxury in Nusa Dua with private beach, infinity pool and Balinese spa.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', stars: 5, pricePerNight: 5200000, currency: 'IDR' },
    { id: 'HS-BAL-2', name: 'W Bali — Seminyak', tagline: 'Trendy beachfront escape with vibrant social scene, WET pool and curated experiences.', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80', stars: 5, pricePerNight: 4500000, currency: 'IDR' },
    { id: 'HS-BAL-3', name: 'Courtyard by Marriott Bali Seminyak', tagline: 'Stylish modern stay in lively Seminyak with rooftop bar and easy beach access.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 4, pricePerNight: 1800000, currency: 'IDR' },
  ],
  'indonesia': 'bali',
  'maldives': [
    { id: 'HS-MAL-1', name: 'The Ritz-Carlton Maldives, Fari Islands', tagline: 'Ultra-luxury overwater villas with private pools, coral reefs and sunset dolphin cruises.', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80', stars: 5, pricePerNight: 2200, currency: 'USD' },
    { id: 'HS-MAL-2', name: 'JW Marriott Maldives Resort & Spa', tagline: 'Secluded island paradise with beach villas, underwater restaurant and spa retreat.', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80', stars: 5, pricePerNight: 1600, currency: 'USD' },
    { id: 'HS-MAL-3', name: 'Sheraton Maldives Full Moon Resort', tagline: 'Family-friendly island resort with water sports, overwater bungalows and kids club.', image: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400&q=80', stars: 5, pricePerNight: 800, currency: 'USD' },
  ],
  'london': [
    { id: 'HS-LDN-1', name: 'London Marriott Hotel Park Lane', tagline: 'Prestigious Mayfair address overlooking Hyde Park with classic British elegance.', image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&q=80', stars: 5, pricePerNight: 450, currency: 'GBP' },
    { id: 'HS-LDN-2', name: 'The Ritz-Carlton, London', tagline: 'Timeless luxury on Piccadilly — afternoon tea, Michelin dining and impeccable service.', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80', stars: 5, pricePerNight: 780, currency: 'GBP' },
    { id: 'HS-LDN-3', name: 'Courtyard by Marriott London City Airport', tagline: 'Modern, convenient base near Canary Wharf with easy DLR and ExCeL access.', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80', stars: 4, pricePerNight: 180, currency: 'GBP' },
  ],
  'uk': 'london',
  'santorini': [
    { id: 'HS-SAN-1', name: 'Marriott Autograph Collection, Santorini', tagline: 'Cliffside caldera retreat in Oia with infinity pool and breathtaking Aegean sunsets.', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80', stars: 5, pricePerNight: 550, currency: 'EUR' },
    { id: 'HS-SAN-2', name: 'Vedema, A Luxury Collection Resort', tagline: 'Converted 400-year-old winery with private terraces, spa and vineyard dining.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 5, pricePerNight: 680, currency: 'EUR' },
    { id: 'HS-SAN-3', name: 'Four Points by Sheraton Santorini', tagline: 'Affordable elegance in Fira centre — pool, sea views and easy island access.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 4, pricePerNight: 280, currency: 'EUR' },
  ],
  'greece': 'santorini',
  'venice': [
    { id: 'HS-VEN-1', name: 'The Gritti Palace, Venice', tagline: 'Iconic Grand Canal palace — Venetian splendour, Michelin dining and gondola service.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', stars: 5, pricePerNight: 750, currency: 'EUR' },
    { id: 'HS-VEN-2', name: 'JW Marriott Venice Resort & Spa', tagline: 'Private island sanctuary with rooftop pool, organic gardens and lagoon views.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 5, pricePerNight: 520, currency: 'EUR' },
    { id: 'HS-VEN-3', name: 'Courtyard by Marriott Venice Airport', tagline: 'Sleek modern base near Marco Polo Airport with easy water-taxi access to the city.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 4, pricePerNight: 190, currency: 'EUR' },
  ],
  'hyderabad': [
    { id: 'HS-HYD-1', name: 'Marriott Hotel & Convention Centre, Hyderabad', tagline: 'Sprawling luxury near HITECH City with world-class convention facilities and fine dining.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', stars: 5, pricePerNight: 8500, currency: 'INR' },
    { id: 'HS-HYD-2', name: 'Sheraton Hyderabad Hotel', tagline: 'Premium Gachibowli address with signature Club Lounge, pool and spa.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 5, pricePerNight: 7000, currency: 'INR' },
    { id: 'HS-HYD-3', name: 'Fairfield by Marriott Hyderabad', tagline: 'Smart, affordable comfort in Madhapur with modern amenities and great connectivity.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 4, pricePerNight: 4000, currency: 'INR' },
  ],
  'mumbai': [
    { id: 'HS-MUM-1', name: 'JW Marriott Mumbai Juhu', tagline: 'Beachfront icon on Juhu Beach with award-winning restaurants and luxury spa.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', stars: 5, pricePerNight: 15000, currency: 'INR' },
    { id: 'HS-MUM-2', name: 'The Ritz-Carlton, Mumbai', tagline: 'Refined elegance in Worli with harbour views, rooftop bar and bespoke experiences.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 5, pricePerNight: 20000, currency: 'INR' },
    { id: 'HS-MUM-3', name: 'Courtyard by Marriott Mumbai', tagline: 'Contemporary business-friendly stay near BKC with pool, gym and all-day dining.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 4, pricePerNight: 6500, currency: 'INR' },
  ],
  'delhi': [
    { id: 'HS-DEL-1', name: 'JW Marriott Hotel New Delhi', tagline: 'Aerocity\'s finest — steps from the airport with lavish rooms, spa and 10 dining outlets.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', stars: 5, pricePerNight: 12000, currency: 'INR' },
    { id: 'HS-DEL-2', name: 'The Ritz-Carlton, New Delhi', tagline: 'Ultra-luxury in the Diplomatic Enclave with art collection, Michelin-level dining and butler service.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 5, pricePerNight: 22000, currency: 'INR' },
    { id: 'HS-DEL-3', name: 'Fairfield by Marriott New Delhi', tagline: 'Value-smart stay near business hubs with modern rooms, breakfast included.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 4, pricePerNight: 4500, currency: 'INR' },
  ],
  'new delhi': 'delhi',
  'bengaluru': [
    { id: 'HS-BLR-1', name: 'Sheraton Grand Bengaluru', tagline: 'Premium Whitefield address with lush gardens, infinity pool and signature dining.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', stars: 5, pricePerNight: 9000, currency: 'INR' },
    { id: 'HS-BLR-2', name: 'JW Marriott Hotel Bengaluru', tagline: 'Luxury on MG Road with rooftop pool, spa and vibrant city views.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 5, pricePerNight: 11000, currency: 'INR' },
    { id: 'HS-BLR-3', name: 'Fairfield by Marriott Bengaluru', tagline: 'Modern comfort near Electronic City — great value with gym, pool and buffet breakfast.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 4, pricePerNight: 4500, currency: 'INR' },
  ],
  'bangalore': 'bengaluru',
};

const DEFAULT_SUGGESTIONS: HotelSuggestion[] = [
  { id: 'HS-DEF-1', name: 'Marriott International Hotel', tagline: 'World-class hospitality with premium rooms, spa, pool and curated local experiences.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', stars: 5, pricePerNight: 250, currency: 'USD' },
  { id: 'HS-DEF-2', name: 'JW Marriott Hotel & Suites', tagline: 'Refined luxury with Michelin-inspired dining, full-service spa and executive lounge.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', stars: 5, pricePerNight: 380, currency: 'USD' },
  { id: 'HS-DEF-3', name: 'Courtyard by Marriott', tagline: 'Modern comfort and convenience — ideal for both business and leisure travellers.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', stars: 4, pricePerNight: 150, currency: 'USD' },
];

export function getHotelSuggestions(destination: string): HotelSuggestion[] {
  const lower = destination.toLowerCase().trim();
  for (const [key, value] of Object.entries(HOTEL_SUGGESTIONS_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      if (typeof value === 'string') {
        return HOTEL_SUGGESTIONS_MAP[value] as HotelSuggestion[];
      }
      return value;
    }
  }
  return DEFAULT_SUGGESTIONS;
}
