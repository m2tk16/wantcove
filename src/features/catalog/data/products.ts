import globeLamp from '../../../assets/products/globe-lamp.png'
import dumbbells from '../../../assets/products/adjustable-dumbbells.png'
import pizzaOven from '../../../assets/products/pizza-oven.png'
import earbuds from '../../../assets/products/wireless-earbuds.png'
import type { Product } from '../types'

export const products: Product[] = [
  { slug: 'levitating-globe-lamp', name: 'Levitating Globe Lamp', price: '$79.99', category: 'Gadgets', image: globeLamp, rating: '4.8', description: 'A warm sculptural light with a magnetic floating globe that turns an ordinary desk into a conversation piece.' },
  { slug: 'adjustable-dumbbell-set', name: 'Adjustable Dumbbell Set', price: '$299.99', category: 'Fitness', image: dumbbells, rating: '4.7', description: 'A compact strength setup with quick weight changes and a clean footprint for smaller workout spaces.' },
  { slug: 'portable-pizza-oven', name: 'Portable Pizza Oven', price: '$129.99', category: 'Outdoors', image: pizzaOven, rating: '4.9', description: 'A tabletop outdoor oven designed for crisp, flame-kissed pizza without taking over the whole patio.' },
  { slug: 'wireless-earbuds', name: 'Pearl Wireless Earbuds', price: '$89.99', category: 'Tech', image: earbuds, rating: '4.6', description: 'Minimal everyday earbuds with a pocketable case, balanced sound, and a softly rounded fit.' },
]

export const categories = ['Trending', 'New arrivals', 'Gadgets', 'Tech', 'Home', 'Kitchen', 'Fitness', 'Outdoors', 'Gaming', 'Gear', 'Fun & weird']
