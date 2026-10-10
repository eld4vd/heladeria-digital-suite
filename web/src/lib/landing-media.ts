/** Solo imágenes editoriales: nunca crean productos ni existencias. */
export type LandingArtwork = {
  // Establecer src en null muestra el marcador preparado en lugar de una imagen.
  src: string | null;
  alt: string;
  width: number;
  height: number;
};

export const landingMedia: Record<'hero' | 'story' | 'cone' | 'cup' | 'sharing', LandingArtwork> = {
  hero: {
    src: '/images/editorial/dulce-alegria.webp',
    alt: 'Una mujer disfrutando un helado con chispas de colores sobre un fondo naranja',
    width: 1672,
    height: 941,
  },
  story: {
    src: '/images/editorial/brownie-helado.webp',
    alt: 'Brownie con helado, chocolate y un toque de menta en un plato blanco',
    width: 1122,
    height: 1402,
  },
  cone: {
    src: '/images/editorial/cono-crujiente.webp',
    alt: 'Cono de helado con salsa dulce y pequeños trozos crujientes',
    width: 1122,
    height: 1402,
  },
  cup: {
    src: '/images/editorial/copa-cremosa.webp',
    alt: 'Copa de cristal con helado, crema, pistachos y barquillos',
    width: 1122,
    height: 1402,
  },
  sharing: {
    src: '/images/editorial/momento-compartido.webp',
    alt: 'Dos manos acercando sus conos de helado sobre un fondo naranja',
    width: 1122,
    height: 1402,
  },
};
