import Image from 'next/image';
import type { LandingArtwork } from '@/lib/landing-media';
import { Icon } from './Icon';
import styles from './HomeEditorial.module.css';

/** Solo editorial: sin enlaces al catálogo, precios, existencias ni escrituras en la base de datos. */
export function EditorialArtwork({
  media,
  className,
  sizes,
  cutout = false,
}: {
  media: LandingArtwork;
  className: string;
  sizes: string;
  cutout?: boolean;
}) {
  const image = media.src ? (
    <Image
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      loading="lazy"
      className={cutout ? styles.cutout : styles.photograph}
    />
  ) : null;

  return (
    <div className={className}>
      {image ? (
        cutout ? (
          <>
            <span className={styles.castShadow} aria-hidden="true" />
            <span className={styles.contactShadow} aria-hidden="true" />
            <div className={styles.objectPlane}>{image}</div>
          </>
        ) : image
      ) : (
        <div className={styles.placeholder}>
          <Icon name="ice" size={40} />
          <span>Una imagen dulce está por llegar.</span>
        </div>
      )}
    </div>
  );
}
