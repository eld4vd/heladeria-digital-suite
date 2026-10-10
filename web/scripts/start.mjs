import { cpSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.env.NODE_ENV ??= 'production';
nextEnv.loadEnvConfig(webRoot);
const standalone = join(webRoot, '.next', 'standalone', 'web');
const server = join(standalone, 'server.js');
if (!existsSync(server)) throw new Error('Primero ejecuta pnpm build para generar el servidor Next.js.');
// Estos archivos se generan para el despliegue; no modifican el código fuente. La salida
// standalone de Next omite public/static a propósito; Docker los copia durante el build.
cpSync(join(webRoot, 'public'), join(standalone, 'public'), { recursive: true });
cpSync(join(webRoot, '.next', 'static'), join(standalone, '.next', 'static'), { recursive: true });
const child = spawn(process.execPath, [server], {
  cwd: webRoot,
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || '3000', HOSTNAME: process.env.HOSTNAME || '127.0.0.1' },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
