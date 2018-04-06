import {WebMod} from 'miesian-mod';
import EventEmitter from 'eventemitter3';

class EventEmitterMod extends WebMod {
    constructor(...args) {
        super(...args);

        this.emitter = new EventEmitter();
    }

    on(...args) {
        return emitter.on(...args);
    }

    once() {
        return emitter.once(...args);
    }

    emit() {
        return emitter.emit(...args);
    }
}

export default WebMod;
