import {WebMod} from 'miesian';
import assert from './assert';

class AssertMod extends WebMod {
    assert(...args) {
        return assert(...args);
    }
}

export default AssertMod;

export default const {
    assert(...args) {
        return assert(...args);
    },
};
