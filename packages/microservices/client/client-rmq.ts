import { Logger } from '@nestjs/common/services/logger.service';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { Channel, Connection, Options } from 'amqplib';
import { EventEmitter } from 'events';
import { ClientOptions, ReadPacket, RmqOptions, WritePacket } from '../interfaces';
import { ERROR_EVENT, RQM_DEFAULT_IS_GLOBAL_PREFETCH_COUNT, RQM_DEFAULT_PREFETCH_COUNT, RQM_DEFAULT_QUEUE, RQM_DEFAULT_QUEUE_OPTIONS, RQM_DEFAULT_URL } from './../constants';
import { ClientProxy } from './client-proxy';

let rqmPackage: any = {};

export class ClientRMQ extends ClientProxy {
  private readonly logger = new Logger(ClientProxy.name);
  private client: Connection = null;
  private channel: Channel = null;
  private url: string;
  private queue: string;
  private prefetchCount: number;
  private isGlobalPrefetchCount: boolean;
  private queueOptions: Options.AssertQueue;
  private replyQueue: string;
  private responseEmitter: EventEmitter;

  constructor(private readonly options: ClientOptions) {
    super();
    this.url =
      this.getOptionsProp<RmqOptions>(this.options, 'url') || RQM_DEFAULT_URL;
    this.queue =
      this.getOptionsProp<RmqOptions>(this.options, 'queue') ||
      RQM_DEFAULT_QUEUE;
    this.prefetchCount =
      this.getOptionsProp<RmqOptions>(this.options, 'prefetchCount') ||
      RQM_DEFAULT_PREFETCH_COUNT;
    this.isGlobalPrefetchCount =
      this.getOptionsProp<RmqOptions>(this.options, 'isGlobalPrefetchCount') ||
      RQM_DEFAULT_IS_GLOBAL_PREFETCH_COUNT;
    this.queueOptions =
      this.getOptionsProp<RmqOptions>(this.options, 'queueOptions') ||
      RQM_DEFAULT_QUEUE_OPTIONS;

    rqmPackage = loadPackage('amqplib', ClientRMQ.name);
  }

  protected publish(
    partialPacket: ReadPacket,
    callback: (packet: WritePacket) => any,
  ): Function {
    try {
      const correlationId =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      const handler = incomingPacket => {
        this.handleMessage(incomingPacket, callback);
      };
      this.responseEmitter.once(correlationId, handler);

      this.channel.sendToQueue(
        this.queue,
        Buffer.from(JSON.stringify(partialPacket)),
        {
          replyTo: this.replyQueue,
          correlationId,
        },
      );
      return () => this.responseEmitter.removeListener(correlationId, handler);
    } catch (err) {
      callback({ err });
    }
  }

  private async handleMessage(
    message: any,
    callback: (packet: WritePacket) => any,
  ): Promise<void> {
    if (!message) {
      return void 0;
    }
    const { content } = message;
    const { err, response, isDisposed } = JSON.parse(content.toString());
    if (isDisposed || err) {
      callback({
        err,
        response: null,
        isDisposed: true,
      });
    }
    callback({
      err,
      response,
    });
  }

  public close(): void {
    this.channel && this.channel.close();
    this.client && this.client.close();
  }

  public handleError(client: Connection): void {
    client.addListener(ERROR_EVENT, err => this.logger.error(err));
  }

  public listen() {
    this.channel.consume(
      this.replyQueue,
      msg => {
        this.responseEmitter.emit(msg.properties.correlationId, msg);
      },
      { noAck: true },
    );
  }

  public async connect(): Promise<any> {
    if (this.client && this.channel) {
      return Promise.resolve();
    }
    return new Promise(async (resolve, reject) => {
      this.client = await rqmPackage.connect(this.url);
      this.channel = await this.client.createChannel();

      await this.channel.assertQueue(this.queue, this.queueOptions);
      await this.channel.prefetch(
        this.prefetchCount,
        this.isGlobalPrefetchCount,
      );
      this.replyQueue = (await this.channel.assertQueue('', {
        exclusive: true,
      })).queue;

      this.responseEmitter = new EventEmitter();
      this.responseEmitter.setMaxListeners(0);
      this.listen();
      resolve();
    });
  }
}
