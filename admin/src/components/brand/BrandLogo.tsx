import Image from 'next/image';
import { BRAND_NAME } from '@/lib/brand';

export function BrandLogo({ variant = 'icon', className, alt = BRAND_NAME, sizes, eager = false }: {
  variant?: 'icon' | 'full';
  className?: string;
  alt?: string;
  sizes?: string;
  eager?: boolean;
}) {
  const full = variant === 'full';
  return <Image
    src={full ? '/brand/logo-completo.webp' : '/brand/logo-icono.webp'}
    width={full ? 1027 : 495}
    height={full ? 868 : 487}
    alt={alt}
    className={className}
    sizes={sizes || (full ? '180px' : '56px')}
    loading={eager ? 'eager' : 'lazy'}
    style={{ height: 'auto', objectFit: 'contain' }}
  />;
}

