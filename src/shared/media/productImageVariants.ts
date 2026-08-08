export type ProductImageSource = {
  src: string
  width: number
}

export type ProductImageVariants = {
  avif: readonly ProductImageSource[]
  webp: readonly ProductImageSource[]
  width: number
  height: number
}

function productVariants(name: string, widths: readonly number[], height: number): ProductImageVariants {
  const largestWidth = widths.at(-1) ?? 1
  return {
    avif: widths.map((width) => ({ src: `/products/${name}-${width}.avif`, width })),
    webp: widths.map((width) => ({ src: `/products/${name}-${width}.webp`, width })),
    width: largestWidth,
    height,
  }
}

const globe = productVariants('globe-lamp', [480, 960, 1440], 960)
const dumbbells = productVariants('adjustable-dumbbells', [480, 960, 1200], 1200)
const pizzaOven = productVariants('pizza-oven', [480, 960, 1200], 1200)
const earbuds = productVariants('wireless-earbuds', [480, 960, 1200], 1200)

const variantsByPath = new Map<string, ProductImageVariants>([
  ['/products/globe-lamp.png', globe],
  ['/products/globe-lamp-1440.webp', globe],
  ['/products/adjustable-dumbbells.png', dumbbells],
  ['/products/adjustable-dumbbells-1200.webp', dumbbells],
  ['/products/pizza-oven.png', pizzaOven],
  ['/products/pizza-oven-1200.webp', pizzaOven],
  ['/products/wireless-earbuds.png', earbuds],
  ['/products/wireless-earbuds-1200.webp', earbuds],
])

export function getProductImageVariants(src: string) {
  return variantsByPath.get(src)
}

export function imageSourceSet(sources: readonly ProductImageSource[]) {
  return sources.map(({ src, width }) => `${src} ${width}w`).join(', ')
}
