import { ProductCard } from '../components/ProductCard'
import type { Product } from '../types'

export function ListingPage({ title, intro, items }: { title: string; intro: string; items: Product[] }) {
  return <div className="listing-page"><div className="listing-intro"><span className="kicker">Explore WantCove</span><h1>{title}</h1><p>{intro}</p></div><div className="listing-body"><div className="filter-row"><span>{items.length} finds</span><button type="button">Newest first⌄</button></div><div className="product-grid">{items.map((product) => <ProductCard product={product} key={product.slug} />)}</div></div></div>
}
