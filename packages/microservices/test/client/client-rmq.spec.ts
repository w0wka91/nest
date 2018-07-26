import { expect } from 'chai';
import { EventEmitter } from 'events';
import * as sinon from 'sinon';
import { ClientRMQ } from '../../client/client-rmq';
import { ERROR_EVENT } from '../../constants';

describe('ClientRQM', () => {
  const test = 'test';
  const client = new ClientRMQ({});

  describe('connect', () => {
    let createChannelSpy: sinon.SinonSpy,
      assertQueueSpy: sinon.SinonSpy,
      listenSpy: sinon.SinonSpy;

    beforeEach(async () => {
      createChannelSpy = sinon.spy();
      assertQueueSpy = sinon.spy();
      listenSpy = sinon.spy();
      (client as any).client = {
        createChannel: createChannelSpy,
      };
      (client as any).channel = {
        assertQueue: assertQueueSpy,
      };
      (client as any).listen = listenSpy;
    });

    it('should create channel on connect()', () => {
      client.connect().then(() => {
        expect(createChannelSpy.called).to.be.true;
      });
    });

    it('should create assert queues on connect()', () => {
      client.connect().then(() => {
        expect(assertQueueSpy.called).to.be.true;
      });
    });

    it('should call listen() on connect()', () => {
      client.connect().then(() => {
        expect(listenSpy.called).to.be.true;
      });
    });
  });

  describe('publish', () => {
    const pattern = 'test';
    const msg = { pattern, data: 'data' };
    let connectSpy: sinon.SinonSpy,
      sendToQueueSpy: sinon.SinonSpy,
      eventSpy: sinon.SinonSpy;

    beforeEach(() => {
      connectSpy = sinon.spy(client, 'connect');
      eventSpy = sinon.spy();
      sendToQueueSpy = sinon.spy();

      (client as any).client = {};
      (client as any).channel = {
        sendToQueue: sendToQueueSpy,
      };
      (client as any).responseEmitter = new EventEmitter();
      (client as any).responseEmitter.on('test', eventSpy);
    });

    afterEach(() => {
      connectSpy.restore();
    });

    it('should not call "connect()" when client not null', () => {
      (client as any).publish(msg, () => {});
      expect(connectSpy.called).to.be.false;
    });

    it('should call "connect()" when client is null', () => {
      (client as any).client = null;
      (client as any).channel = null;
      (client as any).publish(msg, () => {});
      expect(connectSpy.called).to.be.true;
    });

    it('should invoke callback on event', () => {
      (client as any).client = null;
      (client as any).publish(msg, () => {
        (client as any).responseEmitter.emit('test');
      });
      expect(eventSpy.called).to.be.true;
    });

    it('should send message', () => {
      (client as any).publish(msg, () => {
        expect(sendToQueueSpy.called).to.be.true;
      });
    });
  });

  describe('handleMessage', () => {
    const msg = {
      content: null,
    };
    let callbackSpy: sinon.SinonSpy;
    let deleteQueueSpy: sinon.SinonSpy;
    let callback = data => {};

    beforeEach(() => {
      callbackSpy = sinon.spy();
      deleteQueueSpy = sinon.spy();
      (client as any).channel = { deleteQueue: deleteQueueSpy };
      callback = callbackSpy;
    });

    it('should call callback if no error or isDisposed', () => {
      msg.content = JSON.stringify({
        err: null,
        response: 'test',
        isDisposed: false,
      });
      (client as any).handleMessage(msg, callback);
      expect(callbackSpy.called).to.be.true;
    });

    it('should call callback if error', () => {
      msg.content = JSON.stringify({
        err: true,
        response: 'test',
        isDisposed: false,
      });
      (client as any).handleMessage(msg, callback);
      expect(callbackSpy.called).to.be.true;
    });

    it('should call callback if isDisposed', () => {
      msg.content = JSON.stringify({
        err: null,
        response: 'test',
        isDisposed: true,
      });
      (client as any).handleMessage(msg, callback);
      expect(callbackSpy.called).to.be.true;
    });
  });

  describe('close', () => {
    let channelCloseSpy: sinon.SinonSpy;
    let clientCloseSpy: sinon.SinonSpy;
    beforeEach(() => {
      channelCloseSpy = sinon.spy();
      clientCloseSpy = sinon.spy();
      (client as any).channel = { close: channelCloseSpy };
      (client as any).client = { close: clientCloseSpy };
    });

    it('should close channel when it is not null', () => {
      client.close();
      expect(channelCloseSpy.called).to.be.true;
    });

    it('should close client when it is not null', () => {
      client.close();
      expect(clientCloseSpy.called).to.be.true;
    });
  });
  describe('handleError', () => {
    it('should bind error event handler', () => {
      const callback = sinon.stub().callsFake((_, fn) => fn({ code: 'test' }));
      const emitter = {
        addListener: callback,
      };
      client.handleError(emitter as any);
      expect(callback.getCall(0).args[0]).to.be.eql(ERROR_EVENT);
    });
  });
});
