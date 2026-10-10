import Link from 'next/link';
import type { Metadata } from 'next';
import { publicApi } from '@/lib/server-api';
import { breadcrumbSchema, pageMetadata } from '@/lib/seo';
import type { ShopSettings } from '@/lib/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { Icon } from '@/components/shop/Icon';
import styles from '@/components/shop/Storefront.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await publicApi<ShopSettings>('/settings').catch(() => null);
  return pageMetadata({
    title: 'Contacto y horarios', path: '/contacto', settings,
    description: 'Consulta la información del local, horarios, contacto y preguntas frecuentes sobre nuestros helados y pedidos.',
    indexable: Boolean(settings?.name.trim()),
  });
}

export default async function ContactPage() {
  const settings = await publicApi<ShopSettings>('/settings').catch(() => null);
  return (
    <div className={'container ' + styles.editorialPage}>
      <JsonLd data={breadcrumbSchema([{ name: 'Inicio', path: '/' }, { name: 'Contacto', path: '/contacto' }])} />
      <div className={styles.pageIntro}>
        <h1>Hablemos<br />de helados.</h1>
        <p>¿Vienes a vernos o prefieres pedir desde casa? Encuentra aquí la información del local y las respuestas a tus preguntas.</p>
      </div>
      <div className={styles.contactLayout}>
        <div>
          <h2>Nos encantará verte.</h2>
          <dl className={styles.contactDetails}>
            <div><dt>El local</dt><dd>{settings?.address ? <>{settings.address}{settings.city && <><br />{settings.city}</>}</> : <span className={styles.pending}>Dirección por publicar.</span>}</dd></div>
            <div><dt>Horarios</dt><dd>{settings?.hours || <span className={styles.pending}>Horarios por publicar.</span>}</dd></div>
            <div><dt>Teléfono</dt><dd>{settings?.phone ? <a href={'tel:' + settings.phone.replace(/[^\d+]/g, '')}>{settings.phone}</a> : <span className={styles.pending}>Teléfono por publicar.</span>}</dd></div>
            <div><dt>Correo</dt><dd>{settings?.email ? <a href={'mailto:' + settings.email}>{settings.email}</a> : <span className={styles.pending}>Correo por publicar.</span>}</dd></div>
          </dl>
          <div className={styles.delivery}>
            <h3>Tu helado, a domicilio.</h3>
            <p>{settings?.deliveryEnabled ? 'El delivery está disponible. Revisa la cobertura y el costo al realizar tu pedido.' : 'Consulta la disponibilidad de delivery en la tienda antes de realizar tu pedido.'}</p>
            {settings?.coverageText && <p>{settings.coverageText}</p>}
          </div>
          <div className={styles.contactAction}><Link href="/catalogo" className="button">Elegir mi helado <Icon name="ice" size={21} /></Link></div>
        </div>
        <section id="preguntas-frecuentes" aria-labelledby="preguntas-titulo">
          <h2 id="preguntas-titulo">¿Alguna duda?</h2>
          <div className={styles.faq}>
            <details><summary>¿Necesito una cuenta para pedir?</summary><p>Sí, para confirmar y pagar el pedido. Puedes explorar los helados y preparar tu carrito sin registrarte. Al continuar, inicia sesión o crea tu cuenta para guardar tus pedidos y consultar su seguimiento.</p></details>
            <details><summary>¿Dónde realizan delivery?</summary><p>{settings?.coverageText || 'La cobertura se publicará cuando esté configurada.'} Revisa la disponibilidad al realizar tu pedido y añade una referencia para la entrega.</p></details>
            <details><summary>¿Puedo añadir extras a mi helado?</summary><p>Sí. Cada helado tiene su sabor definido. Elige el tamaño disponible y añade los extras que te gusten; su recargo se suma por unidad.</p></details>
            <details><summary>¿Cómo puedo seguir mi pedido?</summary><p>Al terminar la compra encontrarás el enlace de seguimiento. También puedes iniciar sesión y consultar tus pedidos desde tu perfil, aunque hayas cerrado el navegador o uses otro dispositivo.</p></details>
            <details><summary>¿Los pagos son reales?</summary><p>No. Esta tienda es un prototipo: los pagos son simulados y no generan cobros. Nunca ingreses datos reales de tarjetas.</p></details>
          </div>
        </section>
      </div>
    </div>
  );
}
