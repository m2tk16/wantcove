import { Link } from '../../../shared/navigation/Link'
import { ResponsiveProductImage } from '../../../shared/media/ResponsiveProductImage'
import { LikeButton } from '../../likes/LikeButton'
import type { Product } from '../types'

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <div className="product-image">
      <Link className="product-image-link" to={`/products/${product.slug}`}>
        <ResponsiveProductImage
          alt={product.imageAlt ?? product.name}
          loading="lazy"
          sizes="(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 25vw"
          src={product.image}
        />
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
