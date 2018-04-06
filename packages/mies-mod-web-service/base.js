import axios from 'axios';
import logger from '../lib/logger';

/**
 * @property {Object} config
 */
class Service {
    constructor(config) {
        this.config = config;
    }

    async request(rc) {
        return await axios(rc);
    }
}

/**
 * @property {Object} useMock
 */
class PopService extends Service {
    /**
     * @param {Object} config
     * @param {Object|Boolean} config.useMock
     *   If it is an Object, it is a map to toggle mock for each action, such as {'action-name': Boolean}.
     *   Otherwise a Boolean as toggle for all action.
     */
    constructor(config) {
        super(config);
        this.useMock = config.useMock || {};
    }

    /**
     * @param {Object} args  Same to axios(config) https://github.com/axios/axios#axiosconfig
     * @param {String} args.action
     * @param {Object} [args.data]
     * @param {Boolean} [args.useMock=false]
     */
    async request(args) {
        const {action, data = {}} = args;

        let useMock = args.useMock || this.useMock;
        if (useMock === true || useMock[action] === true) {
            useMock = true;
        } else {
            useMock = false;
        }

        const rc = {};

        if (useMock) {
            rc.baseURL = window.browserConf.api.mockBaseURL;
            rc.url = action;
            rc.data = {
                product: window.browserConf.productId,
                // region: 'cn-hangzhou',
                action: action,
                params: data,
                sec_token: window.ALIYUN_CONSOLE_CONFIG.SEC_TOKEN,
                umid: window.RISK_INFO.UMID,
                collina: window.RISK_INFO.GETUA(),
            };
            rc.method = 'post';
        } else {
            // Real POP API via OneConsole
            rc.baseURL = window.browserConf.api.baseURL;
            const form = new FormData();
            form.append('product', window.browserConf.productId);
            form.append('action', action);
            form.append('params', JSON.stringify(data));
            form.append('sec_token', window.ALIYUN_CONSOLE_CONFIG.SEC_TOKEN);
            form.append('umid', window.RISK_INFO.UMID);
            form.append('collina', window.RISK_INFO.GETUA());
            rc.data = form;

            rc.method = 'post';
            rc.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }

        logger.debug('[PopService] send request with config=%O', rc);
        return await axios(rc);
    }
}

export {Service, PopService};
