import test from 'ava';
import {AppCore, Mod} from '../dist/application.js';
// import AppCore from '../src/app-core';
// import Mod from '../src/Mod';

test.beforeEach('new AppCore', (t) => {
    const app = new AppCore();
    t.context.app = app;
});

test('app.register', (t) => {
    const {app} = t.context;
    app.register('mod', Mod);
    t.is(app.Mods.mod, Mod);
    t.truthy(app.mods.mod);
});

test('app.register Router', (t) => {
    const {app} = t.context;

    class Router extends Mod {}

    // Register your Module to app
    app.register('router', Router);
    t.truthy(app.mods.router);

    // Create and inject a Mod instance
    app.mods.router('router-A', {foo: 'bar'});

    // Create a Mod instance
    const routerB = new Router({foo: 'bar'});
    // Inject the mod instance
    app.mods.router('router-B', routerB);
    t.is(routerB, app.mods.router('router-B'));

    // Get a Mod
    const routerA = app.mods.router('router-A');
    t.is(routerA, app.mods.router.namespace['router-A']);
});


test('duplicated register', (t) => {
    const {app} = t.context;

    class Router extends Mod {}

    app.register('router', Router);
    // Create and inject a Mod instance
    app.mods.router('router-A', {foo: 'bar'});

    // Create a Mod instance
    const routerB = new Router({foo: 'bar'});

    t.throws(() => {
        app.mods.router('router-A', routerB);
    });
});
