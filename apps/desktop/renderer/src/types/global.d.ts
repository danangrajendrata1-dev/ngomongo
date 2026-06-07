export {};

declare global {
  interface Window {
    ngomongo?: {
      app: {
        getVersion: () => Promise<string>;
        getPlatform: () => string;
        getDeviceName: () => Promise<string>;
      };
    };
  }
}
