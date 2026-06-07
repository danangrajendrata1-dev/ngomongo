import { ipcMain } from 'electron';

export function registerAudioIpc() {
  ipcMain.handle('audio:get-status', () => ({
    available: false,
    message: 'Audio foundation belum dihubungkan.',
  }));
}
