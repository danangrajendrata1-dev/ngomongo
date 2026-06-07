import { app, BrowserWindow } from 'electron';

import { registerAppIpc } from './ipc/app.ipc';
import { registerAudioIpc } from './ipc/audio.ipc';
import { registerDeviceIpc } from './ipc/device.ipc';
import { registerSettingsIpc } from './ipc/settings.ipc';
import { createAppTray } from './tray/appTray';
import { createFloatingWindow } from './windows/floatingWindow';
import { createMainWindow } from './windows/mainWindow';

let mainWindow = null as ReturnType<typeof createMainWindow> | null;
let floatingWindow = null as ReturnType<typeof createFloatingWindow> | null;
let appTray = null as ReturnType<typeof createAppTray> | null;

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
}

const isDevelopment = !app.isPackaged;

function createWindows() {
  mainWindow = createMainWindow();
  floatingWindow = createFloatingWindow();
  appTray = createAppTray({
    getMainWindow: () => mainWindow,
    getFloatingWindow: () => floatingWindow,
  });
}

app.setAppUserModelId('com.ngomongo.desktop');

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  registerAppIpc();
  registerAudioIpc();
  registerDeviceIpc();
  registerSettingsIpc();
  createWindows();

  if (isDevelopment) {
    app.on('browser-window-created', (_, window) => {
      window.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12') {
          window.webContents.toggleDevTools();
          event.preventDefault();
        }
      });
    });
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
