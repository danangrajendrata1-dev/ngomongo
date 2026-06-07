import { app, BrowserWindow, ipcMain } from 'electron';

function resolveWindow(windowId: number | null | undefined): BrowserWindow | null {
  if (!windowId) {
    return null;
  }

  return BrowserWindow.fromId(windowId) ?? null;
}

export function registerAppIpc() {
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:get-device-name', () => 'NGOMONGO Desktop');

  ipcMain.handle('app:show-main-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.show();
  });

  ipcMain.handle('app:show-floating-window', (_event, windowId?: number) => {
    const window = resolveWindow(windowId);
    window?.show();
  });
}
