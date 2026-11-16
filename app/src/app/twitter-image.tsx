import {
  brandOgAlt,
  brandOgContentType,
  brandOgSize,
  renderBrandOgImage,
} from '@/lib/seo/brand-image';

export const runtime = 'edge';
export const alt = brandOgAlt;
export const size = brandOgSize;
export const contentType = brandOgContentType;

export default function Image() {
  return renderBrandOgImage();
}
