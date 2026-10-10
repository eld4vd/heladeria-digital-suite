'use client';

import Link from 'next/link';
import type { ShopSettings } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { money } from '@/lib/format';
import { Icon } from './Icon';
import styles from './Shop.module.css';

export function CartView({ settings }: { settings: ShopSettings }) {
  const { items, updateQuantity, removeItem, hydrated } = useCart();
  if (!hydrated) return <div className={styles.skeleton} aria-label="Cargando carrito" />;
  if (!items.length) return <div className={styles.empty}><span className={styles.emptyIcon}><Icon name="bag" size={30} /></span><h2>Aquí cabe un poco de felicidad.</h2><p>Tu carrito está vacío. ¿Qué tal si lo llenamos de tus sabores favoritos?</p><Link href="/catalogo" className="button">Descubrir los helados <Icon name="arrow" size={18} /></Link></div>;
  const subtotal = items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);
  return <div className={styles.twoColumns}><div>{items.map((item) => <article className={styles.cartLine} key={item.key}>
    <img src={item.imageUrl || '/placeholder-ice-cream.jpg'} alt={item.productName} width={100} height={115} /><div><h2><Link href={`/producto/${item.productSlug}`}>{item.productName}</Link></h2><p>{item.presentationName}{item.flavorNames.length > 0 && <> · {item.flavorNames.join(', ')}</>}</p>{item.extras.length > 0 && <p>Extras: {item.extras.map((extra) => extra.name).join(', ')}</p>}<div className={styles.quantity} aria-label={`Cantidad de ${item.productName}`}><button type="button" disabled={item.quantity <= 1} aria-label={`Reducir cantidad de ${item.productName}`} onClick={() => updateQuantity(item.key, item.quantity - 1)}><Icon name="minus" size={15} /></button><span aria-live="polite">{item.quantity}</span><button type="button" disabled={item.quantity >= 50} aria-label={`Aumentar cantidad de ${item.productName}`} onClick={() => updateQuantity(item.key, item.quantity + 1)}><Icon name="plus" size={15} /></button></div></div><div className={styles.cartLineEnd}><strong>{money(item.unitPriceMinor * item.quantity, settings.currency, settings.locale)}</strong><button type="button" className={styles.removeButton} onClick={() => removeItem(item.key)} aria-label={`Eliminar ${item.productName}`}>Eliminar</button></div>
  </article>)}<div className={styles.actions}><Link href="/catalogo" className={styles.textLink}>← Seguir eligiendo</Link></div></div><aside className={styles.summary}><h2>Tu pedido, hasta ahora</h2><div className={styles.summaryLine}><span>Helados y extras</span><span>{money(subtotal, settings.currency, settings.locale)}</span></div><div className={styles.summaryLine}><span>Delivery</span><span>{money(settings.deliveryFeeMinor, settings.currency, settings.locale)}</span></div><div className={styles.summaryTotal}><span>Total estimado</span><span>{money(subtotal + settings.deliveryFeeMinor, settings.currency, settings.locale)}</span></div>{settings.deliveryEnabled ? <Link href="/checkout" className={`button ${styles.summaryButton}`}>Continuar con mi pedido <Icon name="arrow" size={17} /></Link> : <p className="error">El delivery está pausado. Vuelve a intentarlo más tarde.</p>}<p className={styles.summaryNote}>La compra se completa con tu cuenta. Si aún no tienes una, podrás crearla al continuar; tu selección se conserva.<br />Confirmaremos precios y disponibilidad antes del pago simulado.</p></aside></div>;
}
