import { Link } from '../../../shared/navigation/Link'
import { useCatalog } from '../CatalogContext'
import { categoryPath, trackedProductCategories } from '../data/categories'

const categoryIcons = ['◉','▣','⌂','♨','●','▲','◆','◇','☻']

export function CategoriesPage() {
  const { products, loading, error } = useCatalog()
  const tracked = trackedProductCategories(products)
  return <div className="categories-page">
    <div className="listing-intro"><span className="kicker">Browse</span><h1>Categories</h1><p>The same tracked category list used by the catalog administrator, backed by the live product catalog.</p></div>
    {error ? <p className="catalog-status" role="status">{error}</p> : null}
    {loading ? <p role="status">Loading categories…</p> : <div className="category-list">{tracked.map((category, index) => <Link to={categoryPath(category)} key={category}><span className="category-icon">{categoryIcons[index % categoryIcons.length]}</span><strong>{category}</strong><span>→</span></Link>)}</div>}
  </div>
}
