"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const constants_1 = require("./../constants");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
let rqmPackage = {};
class ServerRMQ extends server_1.Server {
    constructor(options) {
        super();
        this.options = options;
        this.server = null;
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
        rqmPackage = load_package_util_1.loadPackage('amqplib', ServerRMQ.name);
    }
    async listen(callback) {
        await this.start(callback);
        this.channel.consume(this.queue, (msg) => this.handleMessage(msg), {
            noAck: true,
        });
    }
    async start(callback) {
        try {
            this.server = await rqmPackage.connect(this.url);
            this.channel = await this.server.createChannel();
            this.channel.assertQueue(this.queue, this.queueOptions);
            await this.channel.prefetch(this.prefetchCount, this.isGlobalPrefetchCount);
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    close() {
        this.channel && this.channel.close();
        this.server && this.server.close();
    }
    async handleMessage(message) {
        const { content, properties } = message;
        const messageObj = JSON.parse(content.toString());
        const handlers = this.getHandlers();
        const pattern = JSON.stringify(messageObj.pattern);
        if (!this.messageHandlers[pattern]) {
            return;
        }
        const handler = this.messageHandlers[pattern];
        const response$ = this.transformToObservable(await handler(messageObj.data));
        response$ && this.send(response$, (data) => this.sendMessage(data, properties.replyTo, properties.correlationId));
    }
    sendMessage(message, replyTo, correlationId) {
        const buffer = Buffer.from(JSON.stringify(message));
        this.channel.sendToQueue(replyTo, buffer, { correlationId: correlationId });
    }
}
exports.ServerRMQ = ServerRMQ;
