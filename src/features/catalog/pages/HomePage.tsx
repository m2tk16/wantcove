import { Link } from '../../../shared/navigation/Link'
import { ResponsiveProductImage } from '../../../shared/media/ResponsiveProductImage'
import { useCatalog } from '../CatalogContext'
import { ProductSection, SectionHeading } from '../components/ProductSection'
import { categoryPath, trackedProductCategories } from '../data/categories'

const categoryIcons = ['◔', '✦', '◉', '▣', '⌂', '♨', '●', '▲', '◆', '◇', '☻']
const featuredCategoryIcons = ['◉', '▣', '⌂', '♨', '●', '▲', '☻']

export function HomePage() {
  const { products, loading, error } = useCatalog()
  const featured = products[0]
  const newest = [...products].reverse().slice(0, 4)
  const trackedCategories = trackedProductCategories(products)

  return <div className="catalog-layout">
    <aside className="category-rail" aria-label="Browse categories">
      <strong>Browse categories</strong>
      <Link to="/top-picks"><span>{categoryIcons[0]}</span>Trending</Link>
      <Link to="/new-arrivals"><span>{categoryIcons[1]}</span>New arrivals</Link>
      {trackedCategories.map((category, index) => <Link to={categoryPath(category)} key={category}>
        <span>{categoryIcons[(index + 2) % categoryIcons.length]}</span>{category}
      </Link>)}
    </aside>
    <div className="home-content">
      {error ? <p className="catalog-status" role="status">{error}</p> : null}
      <section className="catalog-hero">
        <div className="hero-copy">
          <span className="kicker">Today&apos;s standout find</span>
          <h1>Cool stuff.<br /><em>Worth keeping.</em></h1>
          <p>Discover the most interesting, useful, and unusual products from across the web.</p>
          {featured ? <Link className="button" to={`/products/${featured.slug}`}>Explore the find <span>→</span></Link> : null}
        </div>
        {featured ? <ResponsiveProductImage
          alt={featured.imageAlt ?? featured.name}
          className="catalog-hero-image"
          fetchPriority="high"
          loading="eager"
          pictureClassName="catalog-hero-media"
          sizes="(max-width: 760px) 100vw, 60vw"
          src={featured.image}
        /> : null}
      </section>
      <section className="benefit-strip" aria-label="WantCove benefits">
        <div><b>◇</b><span><strong>No sign up</strong><small>Browse freely</small></span></div>
        <div><b>✦</b><span><strong>Curated daily</strong><small>{loading ? 'Checking for fresh finds' : 'Fresh finds, fewer tabs'}</small></span></div>
        <div><b>♡</b><span><strong>Save for later</strong><small>Build your private cove</small></span></div>
      </section>
      <ProductSection title="Trending right now" accent="🔥" products={products.slice(0, 8)} />
      <section className="category-section">
        <SectionHeading title="Browse by category" to="/categories" />
        <div className="category-circles">
          {trackedCategories.slice(0, 7).map((category, index) => <Link to={categoryPath(category)} key={category}>
            <span>{featuredCategoryIcons[index]}</span><small>{category}</small>
          </Link>)}
        </div>
      </section>
      <ProductSection title="Newest arrivals" products={newest} />
    </div>
  </div>
}
