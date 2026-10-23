
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (!token) {
      return;
    }

    if (this.socket) {
      if (this.socket.connected) {
        return;
      }

      this.socket.auth = { token };
      this.socket.connect();
      return;
    }

    this.socket = io('http://192.168.0.127:3000', {
      autoConnect: false,
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.connect();
  }

  on<T>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }

  off<T>(event: string, callback?: (data: T) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
