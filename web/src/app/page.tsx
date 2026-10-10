import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { publicApi } from '@/lib/server-api';
import { homeSchema, pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import type { ShopSettings } from '@/lib/types';
import { Icon } from '@/components/shop/Icon';
import { BRAND_NAME } from '@/lib/brand';
import { homeMedia } from '@/lib/home-media';
import { GroundedScene } from '@/components/motion/GroundedScene';
import { LandingExperience } from '@/components/motion/LandingExperience';
import styles from '@/components/shop/HomePoster.module.css';

// Las letras se renderizan en el servidor y comparten la línea de tiempo nativa del título.
// Se conserva un único nombre accesible, sin dividir texto ni escuchar el scroll en el cliente.
function PosterHeading({ id, className, lines }: { id: string; className: string; lines: readonly string[] }) {
  return (
    <h2 id={id} className={`${className} ${styles.posterTitle}`} aria-label={lines.join(' ')}>
      {lines.map((line, lineIndex) => {
        const words = line.split(' ');
        const lineOffset = Array.from(lines.slice(0, lineIndex).join('').replace(/\s/g, '')).length;
        return (
          <span key={line} className={styles.posterLine} aria-hidden="true">
            {words.map((word, wordIndex) => {
              const wordOffset = Array.from(words.slice(0, wordIndex).join('')).length;
              return (
                <span key={`${word}-${wordIndex}`}>
                  {wordIndex > 0 && ' '}
                  <span className={styles.posterWord}>
                    {Array.from(word).map((letter, letterIndex) => {
                      const index = lineOffset + wordOffset + letterIndex;
                      const motion = {
                        '--poster-start': `${12 + index * .65}%`,
                        '--poster-end': `${39 + index * .65}%`,
                        '--poster-tilt': `${index % 2 ? -14 : 16}deg`,
                        '--poster-rise': `${.6 + (index % 3) * .2}em`,
                      } as CSSProperties;
                      return <span key={`${letter}-${letterIndex}`} className={styles.posterGlyph} style={motion}>{letter}</span>;
                    })}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </h2>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await publicApi<ShopSettings>('/settings').catch(() => null);
  return pageMetadata({
    title: settings?.name.trim() ? settings.name + (settings.city ? ' · Helados en ' + settings.city : '') : BRAND_NAME,
    description: settings?.description || 'Dulce alegría a tu manera. Descubre nuestra heladería, elige tus helados y arma tu pedido. Pagos simulados.',
    path: '/', settings, absoluteTitle: true, indexable: Boolean(settings?.name.trim()),
  });
}

export default async function HomePage() {
  // Las fotos editoriales presentan la marca; los productos reales sólo aparecen en la tienda.
  const settings = await publicApi<ShopSettings>('/settings').catch(() => null);
  return (
    <LandingExperience>
      <div className={styles.home}>
        {settings && <JsonLd data={homeSchema(settings)} />}

        <section className={styles.hero} aria-labelledby="bienvenida">
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <h1 id="bienvenida" className={styles.heroTitle}><span>Dulce</span><span>alegría.</span></h1>
              <p>Un helado, una pausa y ese pequeño momento que te alegra el día.</p>
              <Link href="/catalogo" className={`${styles.button} ${styles.whiteButton}`}>
                Elegir mi helado <Icon name="arrow" size={23} />
              </Link>
            </div>
            <GroundedScene className={styles.heroArtwork}>
              <span className={styles.heroOrbit} aria-hidden="true" />
              <span className={styles.sparkle} aria-hidden="true" />
              <span className={styles.heroStamp} aria-hidden="true">A tu<br />manera</span>
              <Image
                src={homeMedia.hero.src} alt={homeMedia.hero.alt}
                width={homeMedia.hero.width} height={homeMedia.hero.height}
                className={styles.heroImage}
                sizes="(max-width: 760px) 75vw, (max-width: 1200px) 44vw, 540px"
                loading="eager" fetchPriority="high"
              />
            </GroundedScene>
          </div>
          <div className={styles.heroFootnote}>
            <span>{settings?.deliveryEnabled
              ? 'Delivery' + (settings.city ? ' en ' + settings.city : '')
              : 'Consulta la disponibilidad de delivery'}</span>
            <span>Tu pedido, siempre en tu cuenta</span>
          </div>
        </section>

        <div className={styles.brandBand} aria-hidden="true">
          <span>Siempre es buen momento</span><Icon name="ice" size={32} /><span>para un helado</span>
        </div>

        <section className={styles.pause} aria-labelledby="pausa-dulce">
          <div className={styles.pauseInner}>
            <GroundedScene className={styles.pauseArtwork}>
              <span className={styles.pauseDisc} aria-hidden="true" />
              <Image
                src={homeMedia.cup.src} alt={homeMedia.cup.alt}
                width={homeMedia.cup.width} height={homeMedia.cup.height}
                className={styles.cupImage}
                sizes="(max-width: 760px) 43vw, (max-width: 1200px) 25vw, 320px"
              />
              <Image
                src={homeMedia.brownie.src} alt={homeMedia.brownie.alt}
                width={homeMedia.brownie.width} height={homeMedia.brownie.height}
                className={styles.brownieImage}
                sizes="(max-width: 760px) 55vw, (max-width: 1200px) 30vw, 410px"
              />
            </GroundedScene>
            <div className={styles.pauseCopy}>
              <PosterHeading id="pausa-dulce" className={styles.sectionTitle} lines={['La pausa', 'más dulce.']} />
              <p>Una cucharada para ti. Otra para compartir. El resto del mundo puede esperar un poquito.</p>
              <Link href="/catalogo" className={styles.textLink}>Elegir mi helado <Icon name="arrow" size={23} /></Link>
            </div>
          </div>
        </section>

        <section className={styles.manifesto} aria-labelledby="mas-que-helado">
          <span className={`${styles.manifestoWave} ${styles.waveLeft}`} aria-hidden="true" />
          <span className={`${styles.manifestoWave} ${styles.waveRight}`} aria-hidden="true" />
          <span className={styles.manifestoBurst} aria-hidden="true" />
          <div className={styles.manifestoInner}>
            <PosterHeading id="mas-que-helado" className={styles.manifestoTitle} lines={['Menos prisa.', 'Más helado.']} />
            <p>Hay historias que empiezan con un helado. Conoce la nuestra.</p>
            <Link href="/heladeria" className={styles.button}>Conoce la heladería <Icon name="arrow" size={23} /></Link>
          </div>
          <span className={styles.manifestoSparkle} aria-hidden="true" />
        </section>

        <section className={styles.order} aria-labelledby="como-pedir">
          <div className={styles.orderHeading}>
            <PosterHeading id="como-pedir" className={styles.sectionTitle} lines={['Tu antojo', 'tiene un plan.']} />
            <p>Elige, arma tu pedido y sigue cada paso.<br />Así de sencillo.</p>
          </div>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNumber} aria-hidden="true">01</span>
              <h3>Encuentra tu favorito</h3>
              <p>Escoge el helado, su tamaño y los extras que te apetezcan.</p>
            </li>
            <li>
              <span className={styles.stepNumber} aria-hidden="true">02</span>
              <h3>Cuéntanos dónde</h3>
              <p>Añade tu dirección y revisa el delivery y el total antes de continuar.</p>
            </li>
            <li>
              <span className={styles.stepNumber} aria-hidden="true">03</span>
              <h3>Sigue tu pedido</h3>
              <p>Simula el pago y consulta el estado. Sin tarjetas reales ni cobros.</p>
            </li>
          </ol>
          <Link href="/contacto" className={styles.textLink}>¿Tienes alguna pregunta? <Icon name="arrow" size={22} /></Link>
        </section>

        <section className={styles.lastCall} aria-labelledby="un-helado">
          <PosterHeading id="un-helado" className="" lines={['¿Un helado?']} />
          <Link href="/catalogo" className={`${styles.button} ${styles.whiteButton}`}>Elegir mi helado <Icon name="arrow" size={23} /></Link>
        </section>
      </div>
    </LandingExperience>
  );
}
