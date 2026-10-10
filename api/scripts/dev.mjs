import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const appDirectory = fileURLToPath(new URL('../', import.meta.url));
const compiler = join(dirname(require.resolve('typescript/package.json')), 'bin', 'tsc');
const compileArguments = [compiler, '--project', 'tsconfig.build.json', '--noEmitOnError'];
const children = new Set();
let stopping = false;
let shutdown;

function runNode(arguments_) {
  const child = spawn(process.execPath, arguments_, {
    cwd: appDirectory,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
    detached: process.platform !== 'win32',
  });
  children.add(child);
  child.once('close', () => children.delete(child));
  return child;
}

function completion(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal }));
  });
}

async function terminate(child) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;

  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (process.platform !== 'win32') {
        try { process.kill(-child.pid, 'SIGKILL'); } catch { /* Ya está detenido. */ }
      } else {
        child.kill('SIGKILL');
      }
      resolve();
    }, 5000);
    child.once('close', () => { clearTimeout(timer); resolve(); });

    if (process.platform === 'win32') {
      // Detiene únicamente el árbol de procesos creado por este script, incluido el compilador tsc nativo.
      const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore', shell: false, windowsHide: true,
      });
      killer.once('error', () => child.kill('SIGTERM'));
    } else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch { clearTimeout(timer); resolve(); }
    }
  });
}

function stop(code) {
  if (shutdown) return shutdown;
  stopping = true;
  process.exitCode = code;
  shutdown = Promise.all([...children].map(terminate));
  return shutdown;
}

process.once('SIGINT', () => { void stop(130); });
process.once('SIGTERM', () => { void stop(143); });

try {
  const initial = await completion(runNode(compileArguments));
  if (!stopping && initial.code !== 0) {
    console.error('La API no se inició: corrige los errores de compilación de TypeScript.');
    await stop(initial.code ?? 1);
  } else if (!stopping) {
    // --watch-path está disponible en Windows/macOS; Linux observa los módulos cargados.
    const explicitWatch = process.platform === 'win32' || process.platform === 'darwin'
      ? ['--watch-path=dist'] : [];
    const compilerWatch = runNode([...compileArguments, '--watch', '--preserveWatchOutput']);
    const applicationWatch = runNode([
      '--watch', '--watch-preserve-output', ...explicitWatch, 'dist/main.js',
    ]);
    const ended = await Promise.race([completion(compilerWatch), completion(applicationWatch)]);
    if (!stopping) {
      console.error('Se detuvo un proceso de desarrollo; cerrando los procesos restantes.');
      await stop(ended.code && ended.code > 0 ? ended.code : 1);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  await stop(1);
}

if (shutdown) await shutdown;
