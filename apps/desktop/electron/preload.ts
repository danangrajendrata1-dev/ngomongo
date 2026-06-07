import { contextBridge, ipcRenderer } from 'electron';

type AppBridge = {
  getVersion: () => Promise<string>;
  getPlatform: () => string;
  getDeviceName: () => Promise<string>;
  showMainWindow: () => Promise<void>;
  showFloatingWindow: () => Promise<void>;
};

const appBridge: AppBridge = {
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => process.platform,
  getDeviceName: () => ipcRenderer.invoke('app:get-device-name'),
  showMainWindow: () => ipcRenderer.invoke('app:show-main-window'),
  showFloatingWindow: () => ipcRenderer.invoke('app:show-floating-window'),
};

contextBridge.exposeInMainWorld('ngomongo', {
  app: appBridge,
});
