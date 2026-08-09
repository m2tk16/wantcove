import { Link } from '../../../shared/navigation/Link'
import { ResponsiveProductImage } from '../../../shared/media/ResponsiveProductImage'
import { LikeButton } from '../../likes/LikeButton'
import { useCatalog } from '../CatalogContext'
import { ProductSection } from '../components/ProductSection'
import { categoryPath } from '../data/categories'
import { safeRetailerUrl } from '../retailerLinks'
import type { Product } from '../types'

export function ProductDetailPage({ product }: { product: Product }) {
  const { products } = useCatalog()
  const related = products.filter((item) => item.slug !== product.slug).slice(0, 3)
  const retailerUrl = safeRetailerUrl(product.retailerUrl)

  return <div className="product-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>›</span><Link to={categoryPath(product.category)}>{product.category}</Link><span>›</span><span>{product.name}</span></div>
    <div className="product-detail">
      <div className="product-gallery">
        <div className="thumbnail-column">
          {[1, 2, 3].map((number) => <button key={number} type="button" aria-label={`View product image ${number}`}><ResponsiveProductImage alt="" loading="lazy" sizes="74px" src={product.image} /></button>)}
        </div>
        <ResponsiveProductImage
          alt={product.imageAlt ?? product.name}
          className="detail-image"
          pictureClassName="detail-picture"
          sizes="(max-width: 760px) 100vw, 55vw"
          src={product.image}
        />
      </div>
      <section className="product-info">
        <span className="kicker">{product.category} pick</span>
        <div className="product-title-row"><h1>{product.name}</h1><LikeButton className="detail-like-button" productSlug={product.slug} productName={product.name} /></div>
        {product.rating ? <div className="rating">★★★★★ <span>{product.rating}</span></div> : null}
        <strong className="detail-price">{product.price ?? 'Curated find'}</strong>
        <p>{product.description}</p>
        <ul><li>Curated for design and usefulness</li><li>Retailer details are reviewed before launch</li><li>Like privately to revisit later</li></ul>
        {retailerUrl ? <a className="button buy-button" href={retailerUrl} rel="sponsored noopener noreferrer" target="_blank">View retailer <span>↗</span></a> : <button className="button buy-button" type="button" disabled>Retailer link unavailable</button>}
        <p className="affiliate-disclosure"><strong>Affiliate disclosure:</strong> As an Amazon Associate I earn from qualifying purchases. WantCove may earn a commission if you buy through this link, at no added cost to you. You will leave WantCove, and Amazon controls checkout and its privacy practices.</p>
      </section>
    </div>
    <ProductSection title="You might also like" products={related} />
  </div>
}
