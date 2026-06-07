import { BrowserWindow } from 'electron';
import path from 'node:path';

export function createFloatingWindow() {
  return new BrowserWindow({
    width: 360,
    height: 180,
    minWidth: 320,
    minHeight: 160,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
}
