import { Link } from '../../../shared/navigation/Link'
import type { Product } from '../types'

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card"><div className="product-image"><Link className="product-image-link" to={`/products/${product.slug}`}><img src={product.image} alt={product.name} /></Link><button type="button" aria-label={`Save ${product.name}`}>♡</button></div><Link className="product-copy" to={`/products/${product.slug}`}><span>{product.category}</span><h3>{product.name}</h3><div><strong>{product.price}</strong><small>★ {product.rating}</small></div></Link></article>
}
