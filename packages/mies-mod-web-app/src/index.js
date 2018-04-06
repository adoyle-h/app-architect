import {WebMod} from 'miesian-mod';

class WebAppMod extends WebMod {
    /**
     * @param {String} [name='app']
     * @return {Application}
     */
    injectToGlobal(name = 'app') {
        window[name] = this;
        return this;
    }
}

export default WebAppMod;
