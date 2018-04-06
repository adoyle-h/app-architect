import {PopService} from './base';

class DemoService extends PopService {
}
const demoService = new DemoService({
    useMock: window.browserConf.service.advisor.useMock
});

export {demoService, DemoService};
