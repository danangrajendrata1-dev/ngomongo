import { BrowserWindow, Menu, Tray, nativeImage, app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

type TrayWindowRefs = {
  getMainWindow: () => BrowserWindow | null;
  getFloatingWindow: () => BrowserWindow | null;
};

function getTrayIconPath() {
  const packagedIcon = path.join(process.resourcesPath, 'icons', 'app.ico');
  const devIcon = path.join(app.getAppPath(), 'resources', 'icons', 'app.ico');
  const iconPath = app.isPackaged ? packagedIcon : devIcon;
  return fs.existsSync(iconPath) ? iconPath : null;
}

export function createAppTray(windowRefs: TrayWindowRefs): Tray | null {
  const iconPath = getTrayIconPath();
  if (!iconPath) {
    return null;
  }

  const trayIcon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(trayIcon);
  const menu = Menu.buildFromTemplate([
    {
      label: 'Show NGOMONGO',
      click: () => {
        windowRefs.getMainWindow()?.show();
      },
    },
    {
      label: 'Show Floating Window',
      click: () => {
        windowRefs.getFloatingWindow()?.show();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('NGOMONGO');
  tray.setContextMenu(menu);
  tray.on('double-click', () => {
    windowRefs.getMainWindow()?.show();
  });

  return tray;
}
