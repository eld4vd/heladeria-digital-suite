'use client';

import { useState } from 'react';
import { Icon } from './Icon';
import styles from './ProductPurchase.module.css';

export function ProductImageStage({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.visual}>
    <figure className={styles.stage}>
      {src && !failed ? <img className={styles.image} src={src} alt={name} width={500} height={500} fetchPriority="high" decoding="async" onError={() => setFailed(true)} />
        : <div className={styles.photoMissing}><Icon name="ice" size={44} /><p>La foto de este helado no está disponible.</p></div>}
    </figure>
  </div>;
}
