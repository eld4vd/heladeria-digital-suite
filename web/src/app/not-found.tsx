import Link from 'next/link';
import { Icon } from '@/components/shop/Icon';
import styles from './not-found.module.css';

export default function NotFound() {
  return <section className={`container ${styles.page}`} aria-labelledby="titulo-no-encontrado">
    <div className={styles.copy}>
      <p className={styles.code}>Error 404</p>
      <h1 id="titulo-no-encontrado">Oops!<span>Esta página<br />se nos derritió.</span></h1>
      <p className={styles.description}>La dirección que abriste no existe o ha cambiado. Puedes volver al inicio o explorar nuestros helados.</p>
      <div className={styles.actions}>
        <Link className="button" href="/catalogo">Ver nuestros helados<Icon name="arrow" size={18} /></Link>
        <Link className={styles.homeLink} href="/">Volver al inicio</Link>
      </div>
    </div>
    <div className={styles.artwork} aria-hidden="true">
      <div className={styles.number}><span>4</span><span className={styles.zero}><Icon name="ice" size={76} /></span><span>4</span></div>
    </div>
  </section>;
}
