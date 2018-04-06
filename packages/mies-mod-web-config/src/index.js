import lodash from 'lodash';
import {WebMod} from 'miesian';

class ConfigMod extends WebMod {
    constructor(config) {
        super();
        this.context = {};
    }

    get(path) {
        return lodash.get(this.context, path);
    }

    set(path, value) {
        return lodash.set(this.context, path, value);
    }
}

export default ConfigMod;
