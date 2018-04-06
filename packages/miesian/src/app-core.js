import 'regenerator-runtime';
import isPlainObject from 'is-plain-object';
import assert from './assert';
import {Mod} from 'miesian-mod';

// const debug = require('debug')('app:public');
// const debugRedirect = require('debug')('app:redirect');
const debug = console.debug;
const debugRedirect = console.debug;

const APP_STATUS = ['IDLE', 'RUNNING', 'CRASHED'].reduce((cumu, key) => {
    cumu[key] = key.toLowerCase();
    return cumu;
}, {});


/**
 * If modConfig is undefined, it will return a Mod instance which matchs the name.
 * If modConfig is a Mod instance, it will set the instance to an namespace which belongs to it's mod.
 * Otherwise, it will create an Mod instance and set the instance to an namespace which belongs to it's mod.
 * @param {String} name
 * @param {*} [modConfig]
 * @return {Mod}
 */
const genModFunction = (modType, ModClass, namespace = {}) => (name, modConfig) => {
    let mod;
    if (modConfig === undefined) {
        // getter
        mod = namespace[name];
    } else if (modConfig instanceof ModClass) {
        // setter
        if (namespace[name] !== undefined) throw new Error(`Has duplicated instance name=${name} in mod=${modType} namespace.`);
        mod = namespace[name] = modConfig;
    } else {
        // creater
        if (namespace[name] !== undefined) throw new Error(`Has duplicated instance name=${name} in mod=${modType} namespace.`);
        mod = namespace[name] = new ModClass(modConfig);
    }
    return mod;
};

const load = (modType, ModClass, Mods, mods, AppClass) => {
    assert(typeof modType === 'string');

    if (isPlainObject(ModClass)) {
        ModClass = class extends Mod {}
        Object.assign(ModClass.prototype, ModClass);
    } else{
        assert(ModClass.prototype instanceof Mod || ModClass === Mod);
    }

    if (Mods[modType] !== undefined) throw new Error(`Has duplicated Mod=${modType} in app.`);

    const {supportPlatforms, dependencies} = ModClass;

    AppClass.supportPlatforms.forEach((current) => {
        supportPlatforms.includes(currentPlatform);
    });

    dependencies.forEach((dep) => {
        if (Mods[dep] !== undefined) {
            throw new Error(`Depend Module "${dep}" has not be loaded to app.`);
        }
    });

    Mods[modType] = ModClass;
    const namespace = {};
    const modFunc = genModFunction(modType, ModClass, namespace);
    modFunc.namespace = namespace;
    mods[modType] = modFunc;
};

const unload = (modType, Mods, mods) => {
    Mods[modType] = undefined;
    mods[modType] = undefined;
};

const singleton = {
    Mods: {},
    mods: {},
    records: {},
};

class AppCore {
    static get APP_STATUS() {return APP_STATUS;}
    static get platform() {return ''};

    /**
     * @param {String} modType
     * @param {Mod|Object} ModClass
     * @return {undefined}
     */
    static load(modType, ModClass) {
        const AppClass = this;
        const {Mods, mods} = singleton;
        load(modType, ModClass, Mods, mods, AppClass);
        ModClass.extendApp((props) => AppClass.extend(props));
    }

    static unload(modType) {
        const {Mods, mods} = singleton;
        return unload(modType, Mods, mods);
    }

    /**
     * Extend the app class in safe way
     *
     * @param {Object} props
     * @return {undefined}
     */
    static extend(props) {
        const AppClass = this;
        const keys = Object.keys(props);
        keys.forEach((key) => {
            if (AppClass[key] !== undefined) throw new Error(`Has duplicated key=${key} in App class.`);
            AppClass[key] = props[key];
        });
    }

    constructor() {
        this.Mods = Object.assign({}, singleton.Mods);
        this.mods = Object.assign({}, singleton.mods);
        this.logger = console || config.logger;
        this.status = APP_STATUS.IDLE;
    }

    APP_STATUS() {return APP_STATUS;}

    /**
     * Extend the app in safe way
     *
     * @param {Object} props
     * @return {undefined}
     */
    extend(props) {
        const keys = Object.keys(props);
        keys.forEach((key) => {
            if (this[key] !== undefined) throw new Error(`Has duplicated key=${key} in app.`);
            this[key] = props[key];
        });
    }

    /**
     * Delegate app[appMethod] to mod[modMethod].
     *
     * @param {String} appMethod
     * @param {String} modType
     *   If it is an array, it must be [modType, modName] or [modType, modName = 'singleton'].
     *   Otherwise it must be a string used as modType
     * @param {Object} [opts]
     * @param {String} [opts.modMethod=appMethod]
     * @param {String} [opts.modName='singleton']
     * @param {App|Mod} [opts.this=Mod]
     * @return {undefined}
     */
    delegate(appMethod, modType, opts = {}) {
        const app = this;
        const {
            modMethod = appMethod,
            modName = 'singleton',
            this: ctx
        } = opts;

        const modFunc = app.mods[modType];
        if (!modFunc) throw new Error(`Mod has not been loaded in app. modType=${modType}`);
        const mod = modFunc(modName);
        if (!mod) throw new Error(`Mod not found. modType=${modType}, modName=${modName}`);

        if (!mod[modMethod]) throw new Error(`Mod has no such method=${modMethod}. modType=${modType}, modName=${modName}`);

        if (ctx === undefined) {
            app[appMethod] = ((mod, method) => (...args) => mod[method](...args))(mod, modMethod);
        } else {
            app[appMethod] = ((mod, method, ctx) => (...args) => mod[method].call(ctx, ...args))(mod, modMethod, ctx);
        }
    }

    /**
     * @param {String} modType
     * @param {Mod|Object} ModClass
     * @return {undefined}
     */
    load(modType, ModClass) {
        const {Mods, mods} = this;
        return load(modType, ModClass, Mods, mods, this.constructor);
    }

    unload(modType) {
        const {Mods, mods} = this;
        return unload(modType, Mods, mods);
    }

    /**
     * Invoked by user. User can put codes which create mod instances in here.
     * @param {Object} props
     * @param {Object} props.mods  {<modName>: <modConfig>}
     * @return {undefined}
     */
    setup(props) {
    }

    async start() {
        const {logger} = this;
        await Promise.map(this.mods, (modFunc) => {
            return Promise.map(modFunc.namespace, (mod) => mod.start()
                .then(() => {
                    mod.status = mod.MOD_STATUS.RUNNING;
                })
                .catch((err) => {
                    mod.status = mod.MOD_STATUS.CRASHED;
                    throw err;
                })
            );
        }).then(() => {
            this.status = APP_STATUS.RUNNING;
        }).catch((err) => {
            this.status = APP_STATUS.CRASHED;
            throw err;
        });

        logger.info('Application started.');
    }

    async stop() {
    }

    async destroy() {
    }
};

export default AppCore;
