import util from 'lodash';
import URI from 'urijs';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {isValidElement, createElement, cloneElement} from 'react';
import {isReactComponent, actionCreator} from './helper';

// const debug = require('debug')('app:privates');
const debug = console.debug;

/**
 * @param {Application} app
 * @param {String} category
 * @param {String} name
 * @return {*}
 */
const _get = (app, category, name) => {
    const item = app[category][name];
    if (!item) throw new Error(`Not found ${category} "${name}"`);
    return item;
};

export default {
    _formatConfig(conf) {
        const config = util.defaultsDeep({}, conf, {
            document: window.document,
            dva: {
                onError: this.onError.bind(this),
            },
            pages: {},
            logger: console,
            forceRefresh: false,
        });

        // history始终由配置传入或lib生成,以直接通过history操作路由
        config.dva.history = conf.dva.history;

        return config;
    },

    _genUniqId() {
        this.idCount = this.idCount + 1;
        return this.idCount;
    },

    _getComponentGen(comp) {
        let componentGen;
        if (isValidElement(comp)) {
            componentGen = ({props} = {}) => cloneElement(comp, props);
        } else if (isReactComponent(comp)) {
            componentGen = ({props} = {}) => createElement(comp, props);
        } else if (typeof comp === 'function') {
            componentGen = comp;
        } else {
            throw new Error('Invalid component');
        }

        return componentGen;
    },

    _addActionDispatch(mapDispatchToProps) {
        if (mapDispatchToProps) {
            if (util.isObject(mapDispatchToProps)) {
                mapDispatchToProps.action = actionCreator;
            } else if (util.isFunction(mapDispatchToProps)) {
                const _mapDispatchToProps = mapDispatchToProps;
                mapDispatchToProps = (dispatch, ownProps) => {
                    const actions = _mapDispatchToProps(dispatch, ownProps) || {};
                    actions.action = bindActionCreators(actionCreator, dispatch);
                    return actions;
                };
            } else {
                throw new Error('Unexpected mapDispatchToProps type: ', typeof mapDispatchToProps);
            }
        } else {
            mapDispatchToProps = {action: actionCreator};
        }
        return mapDispatchToProps;
    },

    /**
     * @param {String} name
     * @param {Component|Element|Function} comp
     *   if comp is a Function, comp should be ({dispatch, props}) => React.Element .
     *   comp can also be Component or PureComponent.
     * @param {Function} [mapStateToProps]
     * @param {Object|Function} [mapDispatchToProps]
     * @param {Function} [mergeProps]
     * @return {Component} Connected component
     */
    _connectComponent({mapStateToProps, mapDispatchToProps, mergeProps, comp, name}) {
        mapDispatchToProps = this._addActionDispatch(mapDispatchToProps);

        const connector = connect(mapStateToProps, mapDispatchToProps, mergeProps)((props) => {
            debug('[Component=%s] received connect props=%O', name, props);
            const componentGen = this._getComponentGen(comp);
            return componentGen({props});
        });

        return connector;
    },

    /**
     * @param {String} name
     * @param {Component|Element|Function} comp  @see The "comp" parameter in Application._connectComponent
     * @param {Function} [mapStateToProps]
     * @param {Object|Function} [mapDispatchToProps]
     * @param {Function} [mergeProps]
     * @return {Page}
     */
    _createPage(args) {
        const {name} = args;
        debug('[Todo] create page "%s"', name);

        if (name === undefined) throw new Error('name is undefined');

        const page = this.pages[name] = this._connectComponent(args);
        debug('[Success] create page "%s"', name);
        return page;
    },

    /**
     * @param {String} name
     * @return {Page}
     */
    _getPage(name) {
        return _get(this, 'pages', name);
    },

    /**
     * @param {Component|Element|Function} comp  @see The "comp" parameter in Application._connectComponent
     * @param {String} [name]
     * @param {Function} [mapStateToProps]
     * @param {Object|Function} [mapDispatchToProps]
     * @param {Function} [mergeProps]
     * @return {Component}
     */
    _createContainer(args) {
        const conf = Object.assign({}, args);
        if (!conf.name) conf.name = this._genUniqId();
        const {name} = conf;
        debug('[Todo] create container "%s"', name);

        const comp = this.containers[name] = this._connectComponent(conf);

        debug('[Success] create container "%s"', name);
        return comp;
    },

    /**
     * @param {String} name
     * @return {Component}
     */
    _getContainer(name) {
        return _get(this, 'containers', name);
    },

    /**
     * @param {Component|Element|Function} comp  @see The "comp" parameter in Application._connectComponent
     * @param {String} [name]
     * @param {Function} [mapStateToProps]
     * @param {Object|Function} [mapDispatchToProps]
     * @param {Function} [mergeProps]
     * @return {Component}
     */
    _createComponent(args) {
        const conf = Object.assign({}, args);
        if (!conf.name) conf.name = this._genUniqId();
        const {name} = conf;
        debug('[Todo] create component "%s"', name);

        let {comp} = conf;
        const componentGen = this._getComponentGen(comp);
        comp = this.components[name] = componentGen();

        debug('[Success] create component "%s"', name);
        return comp;
    },

    /**
     * @param {String} name
     * @return {Component}
     */
    _getComponent(name) {
        return _get(this, 'components', name);
    },

    /**
     * @param {String} name
     * @return {Page}
     */
    _getService(name) {
        return _get(this, 'services', name);
    },

    /**
     * @param {String} name
     * @param {Service} service
     * @return {Service}
     */
    _setService(name, service) {
        this.services[name] = service;
        return service;
    },

    /**
     *              origin
     *      __________|__________
     *     /                     \
     *                        authority
     *    |             __________|_________
     *    |            /                    \
     *             userinfo                host                          resource
     *    |         __|___                ___|___                 __________|___________
     *    |        /      \              /       \               /                      \
     *        username  password     hostname    port     path & segment      query   fragment
     *    |     __|___   __|__    ______|______   |   __________|_________   ____|____   |
     *    |    /      \ /     \  /             \ / \ /                    \ /         \ / \
     *   foo://username:password@www.example.com:123/hello/world/there.html?name=ferret#foo
     *   \_/                     \ / \       \ /    \__________/ \     \__/
     *    |                       |   \       |           |       \      |
     * scheme               subdomain  \     tld      directory    \   suffix
     *                                  \____/                      \___/
     *                                     |                          |
     *                                   domain                   filename
     *
     * @param {Object} config
     * @param {String} [config.url]
     * @param {String} [config.path]
     * @param {Object} [config.query]
     * @param {String} [config.fragment]
     * @param {String} [config.protocol]
     * @param {String} [config.hostname]
     * @param {String} [config.port]
     * @return {Object} {url: <new url>, uriObj: <new URI instance>}
     */
    _parseUrl(config) {
        const {location} = window;

        const {
            url: _url,
            fragment,
            query,
            path = location.pathname,
            hostname = location.hostname,
            port = location.port,
        } = config;
        let {
            protocol = location.protocol,
        } = config;

        if (protocol.endsWith(':')) {
            protocol = protocol.slice(0, -1);
        }

        let url, uriObj;
        if (_url) {
            uriObj = new URI(_url);
            url = _url;
        } else {
            uriObj = new URI({
                protocol, hostname, port, fragment, path,
            }).query(query);
            url = uriObj.href();
        }

        return {url, uriObj};
    },
};
