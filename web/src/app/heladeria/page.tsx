import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { publicApi } from '@/lib/server-api';
import { BRAND_NAME } from '@/lib/brand';
import { landingMedia } from '@/lib/landing-media';
import { breadcrumbSchema, pageMetadata } from '@/lib/seo';
import type { ShopSettings } from '@/lib/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { FloatingScene } from '@/components/motion/FloatingScene';
import { LandingExperience } from '@/components/motion/LandingExperience';
import { Icon } from '@/components/shop/Icon';
import styles from '@/components/shop/Storefront.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await publicApi<ShopSettings>('/settings').catch(() => null);
  return pageMetadata({
    title: 'La heladería', path: '/heladeria', settings,
    description: settings?.description || 'Conoce nuestra heladería: un lugar para compartir, hacer una pausa y disfrutar el lado dulce.',
    indexable: Boolean(settings?.name.trim()),
  });
}

export default async function IceCreamShopPage() {
  const settings = await publicApi<ShopSettings>('/settings').catch(() => null);
  const brand = settings?.name || BRAND_NAME;
  return (
    <LandingExperience>
      <div className={'container ' + styles.editorialPage}>
        <JsonLd data={breadcrumbSchema([{ name: 'Inicio', path: '/' }, { name: 'La heladería', path: '/heladeria' }])} />
        <div className={styles.pageIntro}>
          <h1>Los buenos momentos<br />llevan helado.</h1>
          <p>Una sobremesa que se alarga. Un antojo a media tarde. Ese “¿compartimos?” que siempre termina bien.</p>
        </div>
        <section className={styles.story} aria-labelledby="nuestra-heladeria">
          <div className={styles.storyArtwork}>
            <FloatingScene variant="story" label="Espacio para una imagen de nuestra heladería">
              {landingMedia.story.src ? <Image src={landingMedia.story.src} alt={landingMedia.story.alt} width={landingMedia.story.width} height={landingMedia.story.height} className={styles.storyImage} sizes="(max-width: 900px) 90vw, (max-width: 1340px) 43vw, 540px" loading="eager" /> : null}
            </FloatingScene>
          </div>
          <div className={styles.storyCopy}>
            <h2 id="nuestra-heladeria">Un pequeño antojo.<br />Una gran pausa.</h2>
            {settings?.description && <p className={styles.businessDescription}>{settings.description}</p>}
            <p>En <span translate="no">{brand}</span> queremos ser parte de esos pequeños momentos. Tú pones la compañía; nosotros, el lado dulce.</p>
            <p>Elige lo que te gusta, combina a tu manera y encuentra una buena excusa para volver a compartir.</p>
            <div className={styles.actions}><Link className="button" href="/catalogo">Elegir mi helado <Icon name="ice" size={21} /></Link></div>
          </div>
        </section>
        <section className={styles.explore} aria-labelledby="nos-encontramos">
          <h2 id="nos-encontramos">Nos encontramos<br />en el lado dulce.</h2>
          <div className={styles.exploreLinks}>
            <Link href="/contacto"><div><h3>Ven a conocernos</h3><p>Consulta los datos del local, nuestros horarios y cómo contactarnos.</p></div><Icon name="arrow" size={27} /></Link>
            <Link href="/catalogo"><div><h3>Lleva tu antojo a casa</h3><p>Consulta la carta y la disponibilidad de delivery al realizar tu pedido.</p></div><Icon name="arrow" size={27} /></Link>
          </div>
        </section>
      </div>
    </LandingExperience>
  );
}
