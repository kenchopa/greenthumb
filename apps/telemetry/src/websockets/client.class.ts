import logger from '@greenthumb/logger';
import WebSocket, { CloseEvent, ErrorEvent, Event, MessageEvent } from 'ws';

type WebSocketName = 'SOIL' | 'BAROMETER' | 'PH' | 'LIGHT';

export default class Client {
  private name: WebSocketName;

  private ws?: WebSocket | null;

  private reconnectInterval: number;

  private handshakeTimeout: number;

  private url: string;

  private onOpenCallback?: (event: Event) => void;

  private onCloseCallback?: (event: CloseEvent) => void;

  private onMessageCallback?: (event: MessageEvent) => void;

  private onErrorCallback?: (error: ErrorEvent) => void;

  constructor(
    name: WebSocketName,
    url: string,
    reconnectInterval = 5000,
    handshakeTimeout = 30000,
  ) {
    this.name = name;
    this.url = url;
    this.reconnectInterval = reconnectInterval;
    this.handshakeTimeout = handshakeTimeout;
    this.connect();
  }

  public onOpen(callback: (event: Event) => void) {
    this.onOpenCallback = callback;
  }

  public onClose(callback: (event: CloseEvent) => void) {
    this.onCloseCallback = callback;
  }

  public onMessage(callback: (event: MessageEvent) => void) {
    this.onMessageCallback = callback;
  }

  public onError(callback: (error: ErrorEvent) => void) {
    this.onErrorCallback = callback;
  }

  public ping() {
    if (!this.ws) {
      throw new Error('WebSocket is not connected.');
    }

    logger.debug(`Send "ping" command to "${this.name}".`);
    this.ws.send('ping');
  }

  // eslint-disable-next-line class-methods-use-this
  public onUnexpectedResponse() {
    logger.info('unexpected response');
    process.exit();
  }

  private connect() {
    logger.info(`Connecting to websocket "${this.name}"...`);

    this.ws = new WebSocket(this.url, {
      handshakeTimeout: this.handshakeTimeout,
    });

    this.ws.addEventListener('open', this.onConnectionOpen.bind(this));
    this.ws.addEventListener('close', this.onConnectionClose.bind(this));
    this.ws.addEventListener('message', this.onMessageReceived.bind(this));
    this.ws.addEventListener('error', this.onErrorReceived.bind(this));

    this.ws.on('ping', () => this.ping());
    this.ws.on('unexpected-response', () => this.onUnexpectedResponse());
  }

  private onConnectionOpen(event: Event) {
    logger.debug(`WebSocket "${this.name}" opened a connection.`);
    if (this.onOpenCallback) {
      this.onOpenCallback(event);
    }
    this.reconnectInterval = 5000;
  }

  private onConnectionClose(event: CloseEvent) {
    const { code, type } = event;
    logger.debug(
      `WebSocket "${this.name}" closed connection with error code "${code}" and type "${type}". Retrying in ${this.reconnectInterval} ms...`,
    );
    if (this.onCloseCallback) {
      this.onCloseCallback(event);
    }
    setTimeout(this.connect.bind(this), this.reconnectInterval);
    this.reconnectInterval *= 2;
  }

  private onMessageReceived(event: MessageEvent) {
    try {
      const { data } = event;
      const message = data.toString();

      logger.info(`WebSocket "${this.name}" received message: ${data.toString()}`);
      if (message === 'pong') {
        this.ping();
        return;
      }

      if (this.onMessageCallback) {
        this.onMessageCallback(event);
      }
    } catch (error) {
      logger.info(error);
    }
  }

  private onErrorReceived(event: ErrorEvent) {
    logger.error(`WebSocket "${this.name}" errored: ${event.error as Error}`);

    if (this.onErrorCallback) {
      this.onErrorCallback(event);
    }
  }
}
