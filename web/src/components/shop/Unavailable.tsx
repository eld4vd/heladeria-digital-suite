import Link from 'next/link';
import { Icon } from './Icon';
import styles from './Shop.module.css';

export function Unavailable({ title = 'Estamos preparando algo delicioso', description = 'No pudimos conectar con la heladería. Inténtalo de nuevo en unos momentos.', retryHref = '/catalogo' }: { title?: string; description?: string; retryHref?: string }) {
  return <div className="container section"><div className={styles.empty}><span className={styles.emptyIcon}><Icon name="ice" size={30} /></span><h1>{title}</h1><p>{description}</p><Link href={retryHref} className="button button-secondary">Volver a intentar <Icon name="arrow" size={16} /></Link></div></div>;
}
