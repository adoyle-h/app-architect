// A collection of helper functions

import assert from '../assert';

// const debug = require('debug')('helper');
const debug = console.debug;

/**
 * - action(namespace, action, payload)
 * - action(action, payload)
 * - action(action)
 *
 * @param {String} [namespace]
 * @param {String} action
 * @param {*} [payload]
 * @return {Object} {type, payload}
 *
 * @example
 * action('app', 'add', {a: 1});
 * // => {type: 'app/add', payload: {a: 1}}
 *
 * @example
 * action('add', {a: 1});
 * // => {type: 'add', payload: {a: 1}}
 *
 * @example
 * action('add');
 * // => {type: 'add'}
 */
export function action(...args) {
    let namespace, action, payload;
    let payloadPassed = true;
    if (args.length === 3) {
        namespace = args[0];
        action = args[1];
        payload = args[2];
    } else if (args.length === 2) {
        action = args[0];
        payload = args[1];
    } else if (args.length === 1) {
        action = args[0];
        payloadPassed = false;
    } else {
        throw new Error('helper.action need at least one argument!');
    }
    const type = [namespace, action].filter(x => x !== undefined).join('/');
    assert(type, 'type should not be empty');

    if (payloadPassed && payload === undefined) {
        throw new Error(`The payload of action.type=${type} is undefined`);
    }

    debug('Create action=%j', {type, payload});
    return {type, payload};
};

export const actionCreator = action;

export function isClassComponent(component) {
    return (
        typeof component === 'function' &&
        !!component.prototype.isReactComponent
    ) ? true : false
}

export function isFunctionComponent(component) {
    return (
        typeof component === 'function' &&
        String(component).includes('return React.createElement')
    ) ? true : false;
}

export function isReactComponent(component) {
    return (
        isClassComponent(component) ||
        isFunctionComponent(component)
    ) ? true : false;
}
