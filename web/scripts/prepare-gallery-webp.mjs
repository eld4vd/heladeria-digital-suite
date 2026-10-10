// Prepara archivos para uso manual. No modifica la API, las URL ni los productos, y no accede a la base de datos.
// Desde web/: node scripts/prepare-gallery-webp.mjs "ruta-a-la-nueva-galeria-png"
import { createRequire } from 'node:module';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', { paths: [require.resolve('next')] }));
if (!process.argv[2]) throw new Error('Indica la carpeta de PNG nuevos: node scripts/prepare-gallery-webp.mjs "D:\\ruta\\a\\tus-png". La colección actual no se modifica.');
const gallery = resolve(process.argv[2]);
const destination = fileURLToPath(new URL('../../imagenes-catalogo/', import.meta.url));

function slug(value) {
  const normalized = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!normalized) throw new Error(`Cannot create a safe filename from: ${value}`);
  return normalized;
}

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    // No sigue enlaces a carpetas fuera de la galería indicada.
    if (entry.isSymbolicLink()) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') files.push(path);
  }
  return files;
}

const files = (await collect(gallery)).sort();
if (!files.length) throw new Error('No PNG images found; existing files were not changed.');
const destinations = new Set();
const plan = files.map((source) => {
  const original = relative(gallery, source).split(sep);
  const folders = original.slice(0, -1).map(slug);
  const filename = `${slug(basename(source, extname(source)))}.webp`;
  const target = join(destination, ...folders, filename);
  if (destinations.has(target)) throw new Error(`Filename collision: ${original.join('/')}. No conversion started.`);
  destinations.add(target);
  return { source, target, original: original.join('/'), file: [...folders, filename].join('/') };
});

const rows = [['original', 'archivoWebp', 'ancho', 'alto', 'transparencia', 'bytes']];
for (const image of plan) {
  const original = await sharp(image.source).metadata();
  await mkdir(dirname(image.target), { recursive: true });
  // Sin redimensionar, recortar, extraer, rotar ni aplanar: conserva la imagen original completa.
  const output = await sharp(image.source).keepIccProfile().webp({ lossless: true, effort: 4 }).toFile(image.target);
  const converted = await sharp(image.target).metadata();
  const lostTransparency = original.hasAlpha && !converted.hasAlpha && !(await sharp(image.source).stats()).isOpaque;
  if (converted.width !== original.width || converted.height !== original.height || lostTransparency) {
    throw new Error(`Image geometry or transparency changed: ${image.original}`);
  }
  rows.push([image.original, image.file, converted.width, converted.height, converted.hasAlpha, output.size]);
  console.log(`${rows.length - 1}/${plan.length}: ${image.file} (${converted.width}x${converted.height})`);
}

const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
await writeFile(join(destination, 'manifest.csv'), '\uFEFF' + csv + '\r\n', 'utf8');
console.log(`Done: ${plan.length} complete WebP files. PNG originals preserved. No records or image URLs created.`);
