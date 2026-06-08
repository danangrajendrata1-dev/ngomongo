import type {
  RealtimeAudioChunkPayload,
  RealtimeAudioSegmentPayload,
  RealtimeConnectionStatus,
  RealtimeServerMessage,
} from '@/types/realtime';

type RealtimeHandlers = {
  onMessage?: (message: RealtimeServerMessage) => void;
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
  onError?: (error: string) => void;
};

type ConnectOptions = {
  token: string;
};

function getRealtimeBaseUrl(): string {
  return import.meta.env.VITE_WS_URL?.trim() || 'ws://127.0.0.1:8000';
}

function getRealtimeEndpoint(): string {
  const baseUrl = getRealtimeBaseUrl();
  return baseUrl.endsWith('/realtime/voice')
    ? baseUrl
    : `${baseUrl.replace(/\/+$/, '')}/realtime/voice`;
}

function getRealtimeUrl(token: string): string {
  const url = new URL(getRealtimeEndpoint());
  url.searchParams.set('token', token);
  return url.toString();
}

export class RealtimeService {
  private socket: WebSocket | null = null;

  private handlers: RealtimeHandlers = {};

  private status: RealtimeConnectionStatus = 'disconnected';

  setHandlers(handlers: RealtimeHandlers): void {
    this.handlers = handlers;
  }

  private emitStatus(status: RealtimeConnectionStatus): void {
    this.status = status;
    this.handlers.onStatusChange?.(status);
  }

  private emitError(message: string): void {
    this.handlers.onError?.(message);
    this.emitStatus('error');
  }

  async connect({ token }: ConnectOptions): Promise<void> {
    if (!token.trim()) {
      throw new Error('Token autentikasi belum tersedia. Silakan login ulang.');
    }

    if (this.socket && this.status === 'connected') {
      return;
    }

    await this.disconnect();

    this.emitStatus('connecting');

    if (import.meta.env.DEV) {
      console.log('NGOMONGO WS URL:', getRealtimeEndpoint());
    }

    const socket = new WebSocket(getRealtimeUrl(token));
    this.socket = socket;

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      let failed = false;

      socket.onopen = () => {
        settled = true;
        this.emitStatus('connected');
        resolve();
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(String(event.data)) as RealtimeServerMessage;
          this.handlers.onMessage?.(payload);
        } catch {
          this.handlers.onMessage?.({
            type: 'error',
            code: 'INVALID_SERVER_MESSAGE',
            detail: 'Server mengirim pesan realtime yang tidak valid.',
          });
        }
      };

      socket.onerror = () => {
        const message = 'WebSocket connection failed. Please check backend and try again.';
        failed = true;
        if (!settled) {
          reject(new Error(message));
          return;
        }
        this.emitError(message);
      };

      socket.onclose = () => {
        this.socket = null;
        if (!settled) {
          if (failed) {
            return;
          }
          reject(new Error('WebSocket connection closed before it was established.'));
          return;
        }
        this.emitStatus('disconnected');
      };
    });
  }

  async disconnect(): Promise<void> {
    const socket = this.socket;
    this.socket = null;

    if (!socket) {
      this.emitStatus('disconnected');
      return;
    }

    try {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, 'client disconnect');
      }
    } finally {
      this.emitStatus('disconnected');
    }
  }

  sendAudioChunk(payload: RealtimeAudioChunkPayload): void {
    this.sendJson(payload);
  }

  sendAudioSegment(payload: RealtimeAudioSegmentPayload): void {
    this.sendJson(payload);
  }

  sendPing(): void {
    this.sendJson({ type: 'ping' });
  }

  sendSessionStop(): void {
    this.sendJson({ type: 'session_stop' });
  }

  getConnectionStatus(): RealtimeConnectionStatus {
    return this.status;
  }

  private sendJson(payload: Record<string, unknown>): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.socket.send(JSON.stringify(payload));
    } catch {
      this.emitError('Gagal mengirim pesan realtime.');
    }
  }
}
