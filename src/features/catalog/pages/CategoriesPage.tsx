import { Link } from '../../../shared/navigation/Link'
import { categories } from '../data/categories'

export function CategoriesPage() {
  return <div className="categories-page"><div className="listing-intro"><span className="kicker">Browse</span><h1>Categories</h1><p>Start with what you’re curious about.</p></div><div className="category-list">{categories.slice(2).map((category, index) => <Link to="/top-picks" key={category}><span className="category-icon">{['◉','▣','⌂','♨','●','▲','◆','◇','☻'][index]}</span><strong>{category}</strong><span>→</span></Link>)}</div></div>
}
