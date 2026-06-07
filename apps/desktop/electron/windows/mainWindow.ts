import { app, BrowserWindow } from 'electron';
import path from 'node:path';

const DEV_SERVER_URL = 'http://localhost:5173';

function getRendererEntryPath() {
  return path.join(__dirname, '../renderer/index.html');
}

export function createMainWindow() {
  const window = new BrowserWindow({
    width: 1400,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    title: 'NGOMONGO',
    backgroundColor: '#f5f7fb',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (app.isPackaged) {
    window.loadFile(getRendererEntryPath());
  } else {
    void window.loadURL(process.env.VITE_DEV_SERVER_URL || DEV_SERVER_URL).catch(() => undefined);
  }

  window.once('ready-to-show', () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return { action: 'deny' };
    }

    return { action: 'deny' };
  });

  return window;
}
