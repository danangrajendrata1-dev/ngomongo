import { ipcMain } from 'electron';

export function registerSettingsIpc() {
  ipcMain.handle('settings:get-sync-status', () => ({
    available: false,
    message: 'Local settings disimpan langsung di renderer.',
  }));
}
