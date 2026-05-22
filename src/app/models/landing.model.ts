export interface Destination {
  id: number;
  name: string;
  country: string;
  image: string;
  tag: string;
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  image: string;
  stars: number;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  badge?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  location: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  image: string;
  validUntil: string;
}
