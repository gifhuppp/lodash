import assert from 'node:assert';
import lodashStable from 'lodash';
import { noop } from './utils';
import defaultsDeep from '../src/defaultsDeep';

describe('defaultsDeep', () => {
    it('should deep assign source properties if missing on `object`', () => {
        const object = { a: { b: 2 }, d: 4 },
            source = { a: { b: 3, c: 3 }, e: 5 },
            expected = { a: { b: 2, c: 3 }, d: 4, e: 5 };

        assert.deepStrictEqual(defaultsDeep(object, source), expected);
    });

    it('should accept multiple sources', () => {
        const source1 = { a: { b: 3 } },
            source2 = { a: { c: 3 } },
            source3 = { a: { b: 3, c: 3 } },
            source4 = { a: { c: 4 } },
            expected = { a: { b: 2, c: 3 } };

        assert.deepStrictEqual(defaultsDeep({ a: { b: 2 } }, source1, source2), expected);
        assert.deepStrictEqual(defaultsDeep({ a: { b: 2 } }, source3, source4), expected);
    });

    it('should not overwrite `null` values', () => {
        const object = { a: { b: null } },
            source = { a: { b: 2 } },
            actual = defaultsDeep(object, source);

        assert.strictEqual(actual.a.b, null);
    });

    it('should not overwrite regexp values', () => {
        const object = { a: { b: /x/ } },
            source = { a: { b: /y/ } },
            actual = defaultsDeep(object, source);

        assert.deepStrictEqual(actual.a.b, /x/);
    });

    it('should not convert function properties to objects', () => {
        let actual = defaultsDeep({}, { a: noop });
        assert.strictEqual(actual.a, noop);

        actual = defaultsDeep({}, { a: { b: noop } });
        assert.strictEqual(actual.a.b, noop);
    });

    it('should overwrite `undefined` values', () => {
        const object = { a: { b: undefined } },
            source = { a: { b: 2 } },
            actual = defaultsDeep(object, source);

        assert.strictEqual(actual.a.b, 2);
    });

    it('should assign `undefined` values', () => {
        const source = { a: undefined, b: { c: undefined, d: 1 } },
            expected = lodashStable.cloneDeep(source),
            actual = defaultsDeep({}, source);

        assert.deepStrictEqual(actual, expected);
    });

    it('should merge sources containing circular references', () => {
        const object = {
            foo: { b: { c: { d: {} } } },
            bar: { a: 2 },
        };

        const source = {
            foo: { b: { c: { d: {} } } },
            bar: {},
        };

        object.foo.b.c.d = object;
        source.foo.b.c.d = source;
        source.bar.b = source.foo.b;

        const actual = defaultsDeep(object, source);

        assert.strictEqual(actual.bar.b, actual.foo.b);
        assert.strictEqual(actual.foo.b.c.d, actual.foo.b.c.d.foo.b.c.d);
    });

    it('should not modify sources', () => {
        const source1 = { a: 1, b: { c: 2 } },
            source2 = { b: { c: 3, d: 3 } },
            actual = defaultsDeep({}, source1, source2);

        assert.deepStrictEqual(actual, { a: 1, b: { c: 2, d: 3 } });
        assert.deepStrictEqual(source1, { a: 1, b: { c: 2 } });
        assert.deepStrictEqual(source2, { b: { c: 3, d: 3 } });
    });

    it('should not attempt a merge of a string into an array', () => {
        const actual = defaultsDeep({ a: ['abc'] }, { a: 'abc' });
        assert.deepStrictEqual(actual.a, ['abc']);
    });
});
