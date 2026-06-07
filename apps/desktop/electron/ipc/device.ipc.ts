import { ipcMain } from 'electron';

export function registerDeviceIpc() {
  ipcMain.handle('device:get-capabilities', () => ({
    supportsOutputSelection: false,
    message: 'Device capability akan aktif setelah integrasi audio berikutnya.',
  }));
}
