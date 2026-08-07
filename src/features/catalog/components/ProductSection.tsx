import { Link } from '../../../shared/navigation/Link'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

export function SectionHeading({ title, to }: { title: string; to: string }) {
  return <div className="section-heading"><h2>{title}</h2><Link to={to}>View all</Link></div>
}

export function ProductSection({ title, accent, products }: { title: string; accent?: string; products: Product[] }) {
  return <section className="product-section"><SectionHeading title={`${title} ${accent ?? ''}`} to="/top-picks" /><div className="product-grid">{products.map((product) => <ProductCard product={product} key={product.slug} />)}</div></section>
}
