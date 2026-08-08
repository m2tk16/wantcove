type ProductRouteStatusProps =
  | { state: 'loading'; message?: never }
  | { state: 'unavailable'; message: string }

export function ProductRouteStatus(props: ProductRouteStatusProps) {
  const loading = props.state === 'loading'

  return (
    <section
      aria-busy={loading}
      aria-live={loading ? 'polite' : 'assertive'}
      className="product-route-status"
      role={loading ? 'status' : 'alert'}
    >
      <span className="kicker">{loading ? 'Loading catalog' : 'Catalog unavailable'}</span>
      <h1>{loading ? 'Finding that product...' : 'We could not load that find.'}</h1>
      <p>{loading ? 'Checking the latest WantCove catalog.' : props.message}</p>
    </section>
  )
}
