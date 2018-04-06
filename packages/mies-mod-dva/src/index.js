import {WebMod} from 'miesian-mod';
import DVA from 'dva';
import private from './private';

class DvaMod extends WebMod {
    constructor(config) {
        super();
        const dva = DVA(config);
        this.dva = dva;
    }

    dispatch(...args) {
        return this.dva._store.dispatch(...args);
    }

    /**
     * @see {@link helper.action}
     */
    action(...args) {
        return this.dispatch(actionCreator(...args));
    }

    use(...args) {
        this.dva.use(...args);
    }

    model(...args) {
        this.dva.model(...args);
    }

    router(routerGenerator) {
        this.dva.router(({history}) => routerGenerator({history, app: this}));
    }

    /**
     * @param {Object|String} props
     *   if props is Object, @see Application._createPage
     *   if props is String, @see Application._getPage
     * @return {Page}
     */
    page(props) {
        if (typeof props === 'string') return this._getPage(props);
        else return this._createPage(props);
    }

    /**
     * @param {Object|String} props
     *   if props is Object, @see Application._createContainer
     *   if props is String, @see Application._getContainer
     * @return {Container}
     */
    container(props) {
        if (typeof props === 'string') return this._getContainer(props);
        else return this._createContainer(props);
    }

    /**
     * @param {Object|String} props
     *   if props is Object, @see Application._createComponent
     *   if props is String, @see Application._getComponent
     * @return {Component}
     */
    component(props) {
        if (typeof props === 'string') return this._getComponent(props);
        else return this._createComponent(props);
    }

}

Object.assign(DvaMod.prototype, private);

export default DvaMod;
