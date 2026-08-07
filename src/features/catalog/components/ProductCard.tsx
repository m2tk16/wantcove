import { Link } from '../../../shared/navigation/Link'
import { LikeButton } from '../../likes/LikeButton'
import type { Product } from '../types'

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <div className="product-image">
      <Link className="product-image-link" to={`/products/${product.slug}`}>
        <img src={product.image} alt={product.imageAlt ?? product.name} loading="lazy" referrerPolicy="no-referrer" />
      </Link>
      <LikeButton productSlug={product.slug} productName={product.name} />
    </div>
    <Link className="product-copy" to={`/products/${product.slug}`}>
      <span>{product.category}</span>
      <h3>{product.name}</h3>
      <div>
        <strong>{product.price ?? 'Curated find'}</strong>
        <small>{product.rating ? `★ ${product.rating}` : 'New'}</small>
      </div>
    </Link>
  </article>
}
