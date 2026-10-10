// Opcional: optimiza las imágenes editoriales del proyecto, nunca la galería temporal de productos.
// Ejecutar desde web/: node scripts/prepare-landing-media.mjs
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', { paths: [require.resolve('next')] }));
const destination = new URL('../public/images/editorial/', import.meta.url);
await mkdir(destination, { recursive: true });
const artwork = [
  { source: '../assets/editorial/dulce-alegria.png', output: 'dulce-alegria.webp' },
  { source: '../assets/editorial/brownie-helado.png', output: 'brownie-helado.webp' },
  { source: '../assets/editorial/cono-crujiente.png', output: 'cono-crujiente.webp' },
  { source: '../assets/editorial/copa-cremosa.png', output: 'copa-cremosa.webp' },
  { source: '../assets/editorial/momento-compartido.png', output: 'momento-compartido.webp' },
];
for (const image of artwork) {
  const source = fileURLToPath(new URL(image.source, import.meta.url));
  const original = await sharp(source).metadata();
  const output = await sharp(source)
    .keepIccProfile()
    .webp({ lossless: true, effort: 6 })
    .toFile(fileURLToPath(new URL(image.output, destination)));
  const converted = await sharp(fileURLToPath(new URL(image.output, destination))).metadata();
  const lostTransparency = original.hasAlpha && !converted.hasAlpha && !(await sharp(source).stats()).isOpaque;
  if (converted.width !== original.width || converted.height !== original.height || lostTransparency) {
    throw new Error(`Image geometry or transparency changed: ${image.output}`);
  }
  console.log({ file: image.output, original: { width: original.width, height: original.height, alpha: original.hasAlpha }, copy: output });
}
