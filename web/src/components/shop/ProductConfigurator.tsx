'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, ShopSettings } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { money } from '@/lib/format';
import { Icon } from './Icon';
import styles from './ProductPurchase.module.css';

function ExtraPicture({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  return <span className={styles.extraVisual}>
    {src && !failed
      ? <img className={styles.extraImage} src={src} alt="" width={80} height={80} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      : <Icon name="plus" size={28} />}
  </span>;
}

export function ProductConfigurator({ product, settings }: { product: Product; settings: ShopSettings }) {
  const router = useRouter();
  const cart = useCart();
  const presentations = product.presentations.filter(item => item.active);
  const [presentationId, setPresentationId] = useState(presentations.find(item => item.stock > 0)?.id || presentations[0]?.id || '');
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const presentation = presentations.find(item => item.id === presentationId);
  const extras = product.extras.filter(item => item.active);
  const selectedExtras = extras.filter(item => extraIds.includes(item.id));
  const extrasPrice = selectedExtras.reduce((sum, extra) => sum + extra.priceMinor, 0);
  const unitPrice = (presentation?.priceMinor || 0) + extrasPrice;
  const available = !!presentation && presentation.stock > 0 && product.active;
  const formatPrice = (amount: number) => money(amount, settings.currency, settings.locale);
  const fixedFlavor = product.flavor?.trim();
  const showFlavor = fixedFlavor && !product.name.toLocaleLowerCase('es').includes(fixedFlavor.toLocaleLowerCase('es'));

  function resetFeedback() { setMessage(''); setError(''); }
  function choosePresentation(id: string) {
    const next = presentations.find(item => item.id === id);
    if (!next) return;
    setPresentationId(id);
    setQuantity(current => Math.min(current, Math.max(1, next.stock), 50));
    resetFeedback();
  }
  function purchase(direct: boolean) {
    if (!presentation || !available) { setError('Este helado está agotado. Prueba otro tamaño o vuelve a la carta.'); return; }
    const item = {
      key: presentation.id + '::' + [...extraIds].sort().join(','),
      productId: product.id, productName: product.name, productSlug: product.slug, imageUrl: product.imageUrl,
      presentationId: presentation.id, presentationName: presentation.name, quantity, unitPriceMinor: unitPrice,
      // El sabor es descriptivo, nunca una opción elegida por el cliente. La API vuelve a guardar su copia histórica.
      flavorIds: product.flavorId ? [product.flavorId] : [], flavorNames: fixedFlavor ? [fixedFlavor] : [],
      extraIds: selectedExtras.map(extra => extra.id),
      extras: selectedExtras.map(extra => ({ name: extra.name, priceMinor: extra.priceMinor })),
    };
    setError('');
    if (direct) { cart.buyNow(item); router.push('/checkout?mode=direct'); }
    else {
      if (!cart.addItem(item)) {
        setMessage('');
        setError('Tu carrito está lleno. Quita un helado para añadir otro, o usa Comprar ahora.');
        return;
      }
      setMessage(quantity === 1 ? 'Tu helado ya está en el carrito.' : 'Tus helados ya están en el carrito.');
    }
  }

  return <div className={styles.details}>
    {product.category?.name && <Link className={styles.category} href={'/catalogo?categoria=' + encodeURIComponent(product.category.id)}>{product.category.name}</Link>}
    <h1>{product.name}</h1>
    {showFlavor && <p className={styles.flavor}><Icon name="ice" size={18} /><span>{fixedFlavor}</span></p>}
    <p className={styles.description}>{product.description}</p>
    <div className={styles.priceLine}>
      <p className={styles.basePrice}>{presentation ? formatPrice(presentation.priceMinor) : 'No disponible'}{presentation && <span>por helado</span>}</p>
      {presentations.length === 1 && presentation && <p className={styles.singleSize}><span>Tamaño</span><strong>{presentation.name}</strong></p>}
    </div>

    {presentations.length > 1 ? <fieldset className={styles.sizes}>
      <legend>¿Qué tamaño te apetece?</legend>
      <div className={styles.sizeOptions}>{presentations.map(item => <label key={item.id} className={styles.size} aria-label={item.name + ', ' + (item.stock < 1 ? 'agotado' : formatPrice(item.priceMinor))}>
        <input type="radio" name="presentationId" value={item.id} checked={presentationId === item.id} disabled={item.stock < 1} onChange={() => choosePresentation(item.id)} />
        <span><strong>{item.name}</strong><small>{item.stock < 1 ? 'Agotado' : formatPrice(item.priceMinor)}</small></span>
      </label>)}</div>
    </fieldset> : null}

    {extras.length > 0 && <fieldset className={styles.extras} aria-describedby="product-extras-hint">
      <legend>¿Le ponemos un extra?</legend>
      <p id="product-extras-hint" className={styles.extrasHint}>Opcionales. El recargo es por helado.</p>
      <div className={styles.extraList}>
        {extras.map(extra => <label className={styles.extra} key={extra.id}>
          <input name="extraIds" type="checkbox" value={extra.id} checked={extraIds.includes(extra.id)} disabled={!extraIds.includes(extra.id) && extraIds.length >= 20} onChange={event => {
            setExtraIds(selected => event.target.checked ? selected.length < 20 ? [...selected, extra.id] : selected : selected.filter(id => id !== extra.id));
            resetFeedback();
          }} />
          <ExtraPicture src={extra.imageUrl} />
          <span className={styles.extraCopy}><strong>{extra.name}</strong><small>{extra.priceMinor ? '+ ' + formatPrice(extra.priceMinor) + ' por helado' : 'Sin recargo'}</small></span>
        </label>)}
      </div>
      {extraIds.length >= 20 && <output className={styles.hint} aria-live="polite">Ya elegiste 20 extras. Quita uno si quieres cambiarlo por otro.</output>}
    </fieldset>}

    <div className={styles.purchase}>
      {selectedExtras.length > 0 && <p className={styles.selectedExtras}><span>{selectedExtras.length} extra{selectedExtras.length > 1 ? 's' : ''} elegido{selectedExtras.length > 1 ? 's' : ''}</span><strong>+ {formatPrice(extrasPrice)} por helado</strong></p>}
      <div className={styles.purchaseRow}>
        <div><span className={styles.quantityLabel}>Cantidad</span><div className={styles.quantity}>
          <button type="button" aria-label="Reducir cantidad" disabled={quantity <= 1} onClick={() => { setQuantity(value => value - 1); resetFeedback(); }}><Icon name="minus" size={16} /></button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" aria-label="Aumentar cantidad" disabled={!available || !presentation || quantity >= Math.min(presentation.stock, 50)} onClick={() => { setQuantity(value => value + 1); resetFeedback(); }}><Icon name="plus" size={16} /></button>
        </div></div>
        <p className={styles.total} aria-live="polite" aria-atomic="true"><span>Total sin envío</span><strong>{formatPrice(unitPrice * quantity)}</strong></p>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className={styles.buttons}>
        <button type="button" className={'button ' + styles.addButton} disabled={!available || !cart.hydrated} onClick={() => purchase(false)}><Icon name="bag" size={19} />Añadir al carrito</button>
        <button type="button" className={'button button-secondary ' + styles.buyButton} disabled={!available || !cart.hydrated} onClick={() => purchase(true)}>Comprar ahora</button>
      </div>
      {message && <output className={styles.success} aria-live="polite">{message} <Link href="/carrito">Ver carrito</Link></output>}
      {!available && <p className={styles.hint}>Agotado por ahora. <Link href="/catalogo">Ver otros helados</Link></p>}
      <p className={styles.delivery}><Icon name="truck" size={19} /><span>{settings.deliveryEnabled ? 'Delivery' + (settings.city ? ' en ' + settings.city : '') + '. Revisa el envío antes de pagar.' : 'El delivery está pausado por el momento.'}</span></p>
    </div>
  </div>;
}
