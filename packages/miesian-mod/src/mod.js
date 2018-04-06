const MOD_STATUS = ['IDLE', 'RUNNING', 'CRASHED'].reduce((cumu, key) => {
    cumu[key] = key.toLowerCase();
    return cumu;
}, {});

class Mod {
    static get supportPlatforms() {return []};
    static get dependencies() {return []};
    static get MOD_STATUS() {return MOD_STATUS;}
    static extendApp(extend) {}

    constructor() {
        this.status = Mod_STATUS.IDLE;
    }

    MOD_STATUS() {return MOD_STATUS;}

    async start() {
    }

    async stop() {
    }

    async destroy() {
    }
}

export default Mod;
