import {WebMod} from 'miesian-mod';
import pinoGen from 'pino';

class LoggerMod extends WebMod {
    constructor(config) {
        super();
        this.logger = pinoGen(config);
    }

    log(level, ...args) {
        return logger[level](...args);
    }
}

export default LoggerMod;
