import type { ImgHTMLAttributes } from 'react'
import { getProductImageVariants, imageSourceSet } from './productImageVariants'

type ResponsiveProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src' | 'srcSet'> & {
  alt: string
  src: string
  pictureClassName?: string
}

export function ResponsiveProductImage({ alt, src, sizes = '100vw', pictureClassName, ...imageProps }: ResponsiveProductImageProps) {
  const variants = getProductImageVariants(src)
  if (!variants) {
    return <img {...imageProps} alt={alt} referrerPolicy="no-referrer" src={src} />
  }

  const fallback = variants.webp.at(-1)
  return <picture className={pictureClassName ?? 'product-picture'}>
    <source sizes={sizes} srcSet={imageSourceSet(variants.avif)} type="image/avif" />
    <img
      {...imageProps}
      alt={alt}
      height={variants.height}
      referrerPolicy="no-referrer"
      sizes={sizes}
      src={fallback?.src}
      srcSet={imageSourceSet(variants.webp)}
      width={variants.width}
    />
  </picture>
}
