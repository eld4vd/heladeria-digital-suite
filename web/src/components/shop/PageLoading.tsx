import { Icon } from './Icon';
import styles from './PageLoading.module.css';

/** Solo presentación: sin temporizadores, solicitudes, fotos de productos ni progreso simulado. */
export function PageLoading({
  contained = true,
  compact = false,
  message = 'Cargando la página…',
}: { contained?: boolean; compact?: boolean; message?: string }) {
  return (
    <div className={`${contained ? 'container ' : ''}${styles.page} ${compact ? styles.compact : ''}`}>
      <div className={styles.status}>
        <span className={styles.medallion} aria-hidden="true"><Icon name="ice" size={58} /></span>
        <p className={styles.heading} aria-hidden="true">Un momento…</p>
        <output className={styles.message} aria-live="polite" aria-atomic="true">{message}</output>
        <span className={styles.dots} aria-hidden="true"><span /><span /><span /></span>
      </div>
      {!compact && (
        <div className={styles.skeleton} aria-hidden="true">
          <div className={styles.headingBar} />
          <div className={styles.descriptionBar} />
          <div className={styles.blocks}>
            {[0, 1, 2].map((block) => <div className={styles.block} key={block}><div className={styles.imageSpace} /><div className={styles.line} /><div className={styles.shortLine} /></div>)}
          </div>
        </div>
      )}
    </div>
  );
}
