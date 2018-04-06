import {WebMod} from 'miesian-mod';
import {Service} from './base';

class ServiceMod extends WebMod {
    constructor(config) {
        super();
        this.service = new Service(config);
    }

    async request(...args) {
        return await this.service.request(...args);
    }
}

export default ServiceMod;
