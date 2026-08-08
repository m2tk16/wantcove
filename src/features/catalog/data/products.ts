import type { Product } from '../types'

export const products: Product[] = [
  { slug: 'levitating-globe-lamp', name: 'Levitating Globe Lamp', price: '$79.99', category: 'Gadgets', image: '/products/globe-lamp.png', imageAlt: 'Black levitating globe lamp in a warm room', rating: '4.8', description: 'A warm sculptural light with a magnetic floating globe that turns an ordinary desk into a conversation piece.', source: 'fixture' },
  { slug: 'adjustable-dumbbell-set', name: 'Adjustable Dumbbell Set', price: '$299.99', category: 'Fitness', image: '/products/adjustable-dumbbells.png', imageAlt: 'Adjustable black and red dumbbell set', rating: '4.7', description: 'A compact strength setup with quick weight changes and a clean footprint for smaller workout spaces.', source: 'fixture' },
  { slug: 'portable-pizza-oven', name: 'Portable Pizza Oven', price: '$129.99', category: 'Outdoors', image: '/products/pizza-oven.png', imageAlt: 'Portable outdoor pizza oven', rating: '4.9', description: 'A tabletop outdoor oven designed for crisp, flame-kissed pizza without taking over the whole patio.', source: 'fixture' },
  { slug: 'wireless-earbuds', name: 'Pearl Wireless Earbuds', price: '$89.99', category: 'Tech', image: '/products/wireless-earbuds.png', imageAlt: 'White wireless earbuds in their charging case', rating: '4.6', description: 'Minimal everyday earbuds with a pocketable case, balanced sound, and a softly rounded fit.', source: 'fixture' },
]

export const categories = ['Trending', 'New arrivals', 'Gadgets', 'Tech', 'Home', 'Kitchen', 'Fitness', 'Outdoors', 'Gaming', 'Gear', 'Fun & weird']
