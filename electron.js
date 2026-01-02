const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

let mainWindow;
let nextProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Cargar Next.js usando la IP 127.0.0.1 (más estable que localhost)
  mainWindow.loadURL('http://127.0.0.1:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Matar el proceso de Next.js al cerrar la ventana
    if (nextProcess) nextProcess.kill();
  });
}

function waitForNext(url, interval = 500, timeout = 30000) { // Aumentado a 30s
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, () => resolve())
        .on('error', () => {
          if (Date.now() - start > timeout) return reject(new Error('Next.js no arrancó a tiempo'));
          setTimeout(check, interval);
        });
    };
    check();
  });
}

app.whenReady().then(async () => {
  // Levanta Next.js heredando el entorno del sistema (importante para la DB)
  nextProcess = spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'start'],
    { 
      shell: true, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' } // Hereda variables del .env
    }
  );

  try {
    // Esperamos a que responda el servidor
    await waitForNext('http://127.0.0.1:3000');
    createWindow();
  } catch (err) {
    console.error("Fallo al iniciar Next.js:", err);
    if (nextProcess) nextProcess.kill();
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});