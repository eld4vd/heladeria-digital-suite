import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import pg from 'pg';

const apiRoot = fileURLToPath(new URL('../', import.meta.url));
const workspaceRoot = resolve(apiRoot, '..');
config({ path: join(apiRoot, '.env'), quiet: true });

const tablesToEmpty = [
  'movimientos_inventario', 'intentos_pago', 'historial_pedidos', 'detalles_pedido',
  'pedidos', 'direcciones', 'sesiones',
  'presentaciones', 'productos', 'categorias', 'sabores', 'extras', 'configuracion_negocio',
];
const quotedTable = (table) => '"public"."' + table + '"';

async function findPgDump() {
  if (process.env.PG_DUMP_PATH) {
    const executable = resolve(process.env.PG_DUMP_PATH);
    if (!existsSync(executable)) throw new Error('PG_DUMP_PATH no apunta a un ejecutable existente.');
    return executable;
  }
  if (process.platform === 'win32') {
    const directory = join(process.env.ProgramFiles || 'C:\\Program Files', 'PostgreSQL');
    const versions = await readdir(directory).catch(() => []);
    versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const version of versions) {
      const executable = join(directory, version, 'bin', 'pg_dump.exe');
      if (existsSync(executable)) return executable;
    }
  }
  return 'pg_dump';
}

async function backupDatabase(url, filename) {
  const executable = await findPgDump();
  const env = {
    ...process.env,
    PGHOST: url.hostname.replace(/^\[|\]$/g, ''),
    PGPORT: url.port || '5432',
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGCONNECT_TIMEOUT: '10',
  };
  await new Promise((resolveBackup, reject) => {
    const child = spawn(executable, ['--format=custom', '--no-password', '--file', filename], {
      env, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'],
    });
    let details = '';
    child.stderr.on('data', (chunk) => { details += chunk.toString(); });
    child.on('error', () => reject(new Error('No se pudo ejecutar pg_dump. Instala las herramientas de PostgreSQL o configura PG_DUMP_PATH. No se borraron datos.')));
    child.on('close', (code) => {
      if (code === 0) resolveBackup();
      else reject(new Error('El respaldo falló; no se borraron datos. ' + details.trim()));
    });
  });
}

async function cleanData() {
  if (process.env.NODE_ENV === 'production') throw new Error('db:clean no está permitido en producción.');
  const url = new URL(process.env.DATABASE_URL || '');
  if (!['postgresql:', 'postgres:'].includes(url.protocol)
      || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      || decodeURIComponent(url.pathname.slice(1)) !== 'bd_heladeria'
      || (url.searchParams.get('schema') || 'public') !== 'public') {
    throw new Error('db:clean sólo permite bd_heladeria, esquema public, en PostgreSQL local.');
  }

  const backupDirectory = resolve(workspaceRoot, '.local-data', 'backups');
  if (!backupDirectory.startsWith(workspaceRoot + (process.platform === 'win32' ? '\\' : '/'))) {
    throw new Error('La carpeta de respaldo debe permanecer dentro del proyecto.');
  }
  await mkdir(backupDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = join(backupDirectory, 'bd_heladeria-antes-de-limpiar-' + timestamp + '.dump');

  const client = new pg.Client({ connectionString: url.toString(), connectionTimeoutMillis: 10000 });
  let inTransaction = false;
  try {
    await client.connect();
    const identity = await client.query('SELECT current_database() AS database');
    if (identity.rows[0]?.database !== 'bd_heladeria') throw new Error('La base conectada no es bd_heladeria.');
    await client.query('BEGIN');
    inTransaction = true;
    await client.query("SET LOCAL lock_timeout = '10s'");
    // Bloquea escrituras concurrentes, pero permite que pg_dump lea el respaldo.
    await client.query('LOCK TABLE ' + [...tablesToEmpty, 'usuarios'].map(quotedTable).join(', ') + ' IN SHARE ROW EXCLUSIVE MODE');
    const admins = await client.query('SELECT COUNT(*)::integer AS count FROM "public"."usuarios" WHERE "rol" = $1', ['ADMINISTRADOR']);
    if (admins.rows[0].count === 0) throw new Error('No existe un administrador que conservar. Ejecuta el seed antes de limpiar.');

    await backupDatabase(url, filename);
    const counts = [];
    for (const table of tablesToEmpty) {
      const result = await client.query('DELETE FROM ' + quotedTable(table));
      counts.push({ tabla: table, eliminados: result.rowCount });
    }
    const users = await client.query('DELETE FROM "public"."usuarios" WHERE "rol" <> $1', ['ADMINISTRADOR']);
    counts.push({ tabla: 'usuarios (no administradores)', eliminados: users.rowCount });
    await client.query('COMMIT');
    inTransaction = false;
    console.table(counts);
    console.info('Conservados: ' + admins.rows[0].count + ' administrador(es). Las sesiones se cerraron; vuelve a iniciar sesión.');
    console.info('Respaldo recuperable: ' + filename);
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

cleanData().catch((error) => {
  console.error(error instanceof Error ? error.message : 'No se pudo limpiar la base.');
  process.exitCode = 1;
});

