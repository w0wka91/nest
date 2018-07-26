"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./../constants");
const logger_service_1 = require("@nestjs/common/services/logger.service");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const client_proxy_1 = require("./client-proxy");
const events_1 = require("events");
let rqmPackage = {};
class ClientRMQ extends client_proxy_1.ClientProxy {
    constructor(options) {
        super();
        this.options = options;
        this.logger = new logger_service_1.Logger(client_proxy_1.ClientProxy.name);
        this.client = null;
        this.channel = null;
        this.url =
            this.getOptionsProp(this.options, 'url') || constants_1.RQM_DEFAULT_URL;
        this.queue =
            this.getOptionsProp(this.options, 'queue') || constants_1.RQM_DEFAULT_QUEUE;
        this.prefetchCount =
            this.getOptionsProp(this.options, 'prefetchCount') || constants_1.RQM_DEFAULT_PREFETCH_COUNT;
        this.isGlobalPrefetchCount =
            this.getOptionsProp(this.options, 'isGlobalPrefetchCount') || constants_1.RQM_DEFAULT_IS_GLOBAL_PREFETCH_COUNT;
        this.queueOptions =
            this.getOptionsProp(this.options, 'queueOptions') || constants_1.RQM_DEFAULT_QUEUE_OPTIONS;
        rqmPackage = load_package_util_1.loadPackage('amqplib', ClientRMQ.name);
        this.connect();
    }
    publish(messageObj, callback) {
        try {
            let correlationId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.responseEmitter.once(correlationId, msg => {
                this.handleMessage(msg, callback);
            });
            this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(messageObj)), {
                replyTo: this.replyQueue,
                correlationId: correlationId
            });
        }
        catch (err) {
            console.log(err);
            callback(err, null);
        }
    }
    async handleMessage(message, callback) {
        if (message) {
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
    }
    close() {
        this.channel && this.channel.close();
        this.client && this.client.close();
    }
    handleError(client) {
        client.addListener(constants_1.ERROR_EVENT, err => this.logger.error(err));
    }
    listen() {
        this.channel.consume(this.replyQueue, (msg) => {
            this.responseEmitter.emit(msg.properties.correlationId, msg);
        }, { noAck: true });
    }
    async connect() {
        if (this.client && this.channel) {
            return Promise.resolve();
        }
        return new Promise(async (resolve, reject) => {
            this.client = await rqmPackage.connect(this.url);
            this.channel = await this.client.createChannel();
            await this.channel.assertQueue(this.queue, this.queueOptions);
            await this.channel.prefetch(this.prefetchCount, this.isGlobalPrefetchCount);
            this.replyQueue = (await this.channel.assertQueue('', { exclusive: true })).queue;
            this.responseEmitter = new events_1.EventEmitter();
            this.responseEmitter.setMaxListeners(0);
            this.listen();
            resolve();
        });
    }
}
exports.ClientRMQ = ClientRMQ;
