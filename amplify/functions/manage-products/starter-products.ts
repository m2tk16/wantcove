export type StarterProduct = {
  slug: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  priceLabel: string;
  ratingLabel: string;
  featuredRank: number;
};

export const STARTER_PRODUCTS: readonly StarterProduct[] = [
  {
    slug: 'levitating-globe-lamp',
    name: 'Levitating Globe Lamp',
    description: 'A warm sculptural light with a magnetic floating globe that turns an ordinary desk into a conversation piece.',
    category: 'Gadgets',
    imageUrl: '/products/globe-lamp.png',
    imageAlt: 'Black levitating globe lamp in a warm room',
    priceLabel: '$79.99',
    ratingLabel: '4.8',
    featuredRank: 1,
  },
  {
    slug: 'adjustable-dumbbell-set',
    name: 'Adjustable Dumbbell Set',
    description: 'A compact strength setup with quick weight changes and a clean footprint for smaller workout spaces.',
    category: 'Fitness',
    imageUrl: '/products/adjustable-dumbbells.png',
    imageAlt: 'Adjustable black and red dumbbell set',
    priceLabel: '$299.99',
    ratingLabel: '4.7',
    featuredRank: 2,
  },
  {
    slug: 'portable-pizza-oven',
    name: 'Portable Pizza Oven',
    description: 'A tabletop outdoor oven designed for crisp, flame-kissed pizza without taking over the whole patio.',
    category: 'Outdoors',
    imageUrl: '/products/pizza-oven.png',
    imageAlt: 'Portable outdoor pizza oven',
    priceLabel: '$129.99',
    ratingLabel: '4.9',
    featuredRank: 3,
  },
  {
    slug: 'wireless-earbuds',
    name: 'Pearl Wireless Earbuds',
    description: 'Minimal everyday earbuds with a pocketable case, balanced sound, and a softly rounded fit.',
    category: 'Tech',
    imageUrl: '/products/wireless-earbuds.png',
    imageAlt: 'White wireless earbuds in their charging case',
    priceLabel: '$89.99',
    ratingLabel: '4.6',
    featuredRank: 4,
  },
];
