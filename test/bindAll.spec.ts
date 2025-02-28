import assert from 'node:assert';
import lodashStable from 'lodash';
import { args, toArgs, arrayProto } from './utils';
import bindAll from '../src/bindAll';

describe('bindAll', () => {
    const args = toArgs(['a']);

    const source = {
        _n0: -2,
        _p0: -1,
        _a: 1,
        _b: 2,
        _c: 3,
        _d: 4,
        '-0': function () {
            return this._n0;
        },
        '0': function () {
            return this._p0;
        },
        a: function () {
            return this._a;
        },
        b: function () {
            return this._b;
        },
        c: function () {
            return this._c;
        },
        d: function () {
            return this._d;
        },
    };

    it('should accept individual method names', () => {
        const object = lodashStable.cloneDeep(source);
        bindAll(object, 'a', 'b');

        const actual = lodashStable.map(['a', 'b', 'c'], (key) => object[key].call({}));

        assert.deepStrictEqual(actual, [1, 2, undefined]);
    });

    it('should accept arrays of method names', () => {
        const object = lodashStable.cloneDeep(source);
        bindAll(object, ['a', 'b'], ['c']);

        const actual = lodashStable.map(['a', 'b', 'c', 'd'], (key) => object[key].call({}));

        assert.deepStrictEqual(actual, [1, 2, 3, undefined]);
    });

    it('should preserve the sign of `0`', () => {
        const props = [-0, Object(-0), 0, Object(0)];

        const actual = lodashStable.map(props, (key) => {
            const object = lodashStable.cloneDeep(source);
            bindAll(object, key);
            return object[lodashStable.toString(key)].call({});
        });

        assert.deepStrictEqual(actual, [-2, -2, -1, -1]);
    });

    it('should work with an array `object`', () => {
        const array = ['push', 'pop'];
        bindAll(array);
        assert.strictEqual(array.pop, arrayProto.pop);
    });

    it('should work with `arguments` objects as secondary arguments', () => {
        const object = lodashStable.cloneDeep(source);
        bindAll(object, args);

        const actual = lodashStable.map(args, (key) => object[key].call({}));

        assert.deepStrictEqual(actual, [1]);
    });
});
