# Miesian

Less is more.
To be an elegant application architect.

## TOC

<!-- MarkdownTOC GFM -->

- [Dependencies](#dependencies)
- [Install](#install)
- [Usage](#usage)
    - [Define a Mod](#define-a-mod)
    - [Define your App class.](#define-your-app-class)
    - [Create app instance](#create-app-instance)
- [Versioning](#versioning)
- [Copyright and License](#copyright-and-license)

<!-- /MarkdownTOC -->


## Dependencies

## Install

```sh
npm i -S miesian miesian-mod
```

## Usage

### Define a Mod

Define a Mod by class inherit.

```javascript
import {Mod} from 'miesian';
import assert from './assert';

class AssertMod extends WebMod {
    assert(...args) {
        return assert(...args);
    }
}

export default AssertMod;
```

Or, define a Mod by declare a plain object.

```javascript
import assert from './assert';

export default const {
    assert(...args) {
        return assert(...args);
    },
};
```

### Define your App class.

```js
import {AppCore} from 'miesian';
import ConfigMod from 'mies-mod-web-config';
import EventEmitterMod from 'mies-mod-web-event-emitter';
import LoggerMod from 'mies-mod-web-logger';
import AssertMod from 'mies-mod-web-assert';

class WebApp extends AppCore {
    static get platform() {return 'web'};

    setup(props) {
        const app = this;
        const {mods: modsProps} = props;

        app.mods.eventEmitter('singleton', {});
        app.delegate('on', 'eventEmitter');
        app.delegate('once', 'eventEmitter');
        app.delegate('emit', 'eventEmitter');

        app.mods.logger('singleton', modsProps.logger);
        app.delegate('log', 'logger');

        app.mods.config('singleton', modsProps.config);
        app.delegate('getConfig', 'config', {
            modMethod: 'get',
        });
        app.delegate('setConfig', 'config', {
            modMethod: 'set'
        });

        app.mods.assert('singleton', {});
        app.delegate('assert', 'assert');
    }
}

WebApp.load('logger', LoggerMod);
WebApp.load('eventEmitter', EventEmitterMod);
WebApp.load('config', ConfigMod);
WebApp.load('assert', AssertMod);

export default WebApp;
```

### Create app instance

```js
const app = new WebApp();
app.start();
```

## Versioning

The versioning follows the rules of SemVer 2.0.0.

**Attentions**: anything may have **BREAKING CHANGES** at **ANY TIME** when major version is zero (0.y.z), which is for initial development and the public API should be considered unstable.

For more information on SemVer, please visit http://semver.org/.


## Copyright and License

Copyright (c) 2018 ADoyle. The project is licensed under the **Apache License Version 2.0**.

See the [LICENSE][] file for the specific language governing permissions and limitations under the License.

See the [NOTICE][] file distributed with this work for additional information regarding copyright ownership.


<!-- Links -->

[LICENSE]: ./LICENSE
[NOTICE]: ./NOTICE
