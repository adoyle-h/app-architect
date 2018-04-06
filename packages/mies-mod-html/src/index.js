import {WebMod} from 'miesian';

class HTMLMod extends WebMod {
    /**
     * @param {String} [name='app']
     * @return {Application}
     */
    injectToGlobal(name = 'app') {
        window[name] = this;
        return this;
    }

    async appendScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.setAttribute('src', url);

            script.onerror = script.error = util.once(reject);
            script.onload = script.load = util.once(resolve);

            debug('[appendScript] to load script. url=%s', url);
            this.document.body.appendChild(script);
        });
    }

    async appendStyle(url) {
        return new Promise((resolve, reject) => {
            const style = document.createElement('link');
            style.setAttribute('rel', 'stylesheet');
            style.setAttribute('type', 'text/css');
            style.setAttribute('href', url);

            style.onerror = style.error = util.once(reject);
            style.onload = style.load = util.once(resolve);

            debug('[appendScript] to load style. url=%s', url);
            this.document.head.appendChild(style);
        });
    }
}

export default HTMLMod;
