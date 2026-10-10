import Link from 'next/link';
import type { Product } from '@/lib/types';
import { money } from '@/lib/format';
import { normalizeCatalogText } from '@/lib/catalog-filters';
import { Icon } from './Icon';
import styles from './Shop.module.css';
import catalogStyles from './Catalog.module.css';

export function ProductCard({ product, currency = 'BOB', locale = 'es-BO', heading: Heading = 'h3', variant = 'default' }: { product: Product; currency?: string; locale?: string; heading?: 'h2' | 'h3'; variant?: 'default' | 'catalog' }) {
  const catalog = variant === 'catalog';
  const presentations = product.presentations.filter((item) => item.active);
  const minPrice = presentations.length ? Math.min(...presentations.map((item) => item.priceMinor)) : 0;
  const available = product.active && product.category?.active !== false && presentations.some((item) => item.stock > 0);
  const flavor = product.flavor?.trim();
  const flavorInName = flavor && normalizeCatalogText(product.name).includes(normalizeCatalogText(flavor));
  return (
    <Link href={`/producto/${product.slug}`} className={`${styles.productCard} ${catalog ? catalogStyles.card : ''}`}>
      <div className={`${styles.productImageWrap} ${catalog ? catalogStyles.imageWrap : ''}`}>
        {/* Las URL de las imágenes las gestiona el administrador; una imagen nativa permite cualquier servidor autorizado. */}
        {product.imageUrl ? <img className={`${styles.productImage} ${catalog ? catalogStyles.image : ''}`} src={product.imageUrl} alt={product.name} width={360} height={360} loading="lazy" decoding="async" /> : <span className={catalogStyles.imagePlaceholder}><Icon name="ice" size={38} /><span className="sr-only">Foto de {product.name} pendiente</span></span>}
        {(!available || product.featured) && <span className={`${styles.productBadge} ${catalog ? catalogStyles.badge : ''}`} data-unavailable={!available}>{available ? 'De la casa' : 'Agotado'}</span>}
      </div>
      <div className={`${styles.productInfo} ${catalog ? catalogStyles.info : ''}`}>
        <span className={`${styles.productCategory} ${catalog ? catalogStyles.categoryName : ''}`}>{product.category?.name || 'Helados artesanales'}</span>
        <Heading className={`${styles.productTitle} ${catalog ? catalogStyles.title : ''}`}>{product.name}</Heading>
        {catalog && <p className={catalogStyles.description}>{flavor && !flavorInName ? flavor : product.description}</p>}
        <div className={`${styles.productBottom} ${catalog ? catalogStyles.bottom : ''}`}><span className={`${styles.productPrice} ${catalog ? catalogStyles.price : ''}`}>{presentations.length ? `${presentations.length > 1 ? 'Desde ' : ''}${money(minPrice, currency, locale)}` : 'No disponible'}</span><span className={`${styles.productArrow} ${catalog ? catalogStyles.arrow : ''}`} aria-hidden="true"><Icon name="arrow" size={16} /></span></div>
      </div>
    </Link>
  );
}
