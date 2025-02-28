import assert from 'node:assert';
import lodashStable from 'lodash';
import { slice, stubArray } from './utils';
import curry from '../src/curry';
import placeholder from '../src/placeholder';
import bind from '../src/bind';
import partial from '../src/partial';
import partialRight from '../src/partialRight';

describe('curry', () => {
    function fn(a, b, c, d) {
        return slice.call(arguments);
    }

    it('should curry based on the number of arguments given', () => {
        const curried = curry(fn),
            expected = [1, 2, 3, 4];

        assert.deepStrictEqual(curried(1)(2)(3)(4), expected);
        assert.deepStrictEqual(curried(1, 2)(3, 4), expected);
        assert.deepStrictEqual(curried(1, 2, 3, 4), expected);
    });

    it('should allow specifying `arity`', () => {
        const curried = curry(fn, 3),
            expected = [1, 2, 3];

        assert.deepStrictEqual(curried(1)(2, 3), expected);
        assert.deepStrictEqual(curried(1, 2)(3), expected);
        assert.deepStrictEqual(curried(1, 2, 3), expected);
    });

    it('should coerce `arity` to an integer', () => {
        const values = ['0', 0.6, 'xyz'],
            expected = lodashStable.map(values, stubArray);

        const actual = lodashStable.map(values, (arity) => curry(fn, arity)());

        assert.deepStrictEqual(actual, expected);
        assert.deepStrictEqual(curry(fn, '2')(1)(2), [1, 2]);
    });

    it('should support placeholders', () => {
        const curried = curry(fn),
            ph = curried.placeholder;

        assert.deepStrictEqual(curried(1)(ph, 3)(ph, 4)(2), [1, 2, 3, 4]);
        assert.deepStrictEqual(curried(ph, 2)(1)(ph, 4)(3), [1, 2, 3, 4]);
        assert.deepStrictEqual(curried(ph, ph, 3)(ph, 2)(ph, 4)(1), [1, 2, 3, 4]);
        assert.deepStrictEqual(curried(ph, ph, ph, 4)(ph, ph, 3)(ph, 2)(1), [1, 2, 3, 4]);
    });

    it('should persist placeholders', () => {
        const curried = curry(fn),
            ph = curried.placeholder,
            actual = curried(ph, ph, ph, 'd')('a')(ph)('b')('c');

        assert.deepStrictEqual(actual, ['a', 'b', 'c', 'd']);
    });

    it('should use `_.placeholder` when set', () => {
        const curried = curry(fn),
            _ph = (placeholder = {}),
            ph = curried.placeholder;

        assert.deepEqual(curried(1)(_ph, 3)(ph, 4), [1, ph, 3, 4]);
        delete placeholder;
    });

    it('should provide additional arguments after reaching the target arity', () => {
        const curried = curry(fn, 3);
        assert.deepStrictEqual(curried(1)(2, 3, 4), [1, 2, 3, 4]);
        assert.deepStrictEqual(curried(1, 2)(3, 4, 5), [1, 2, 3, 4, 5]);
        assert.deepStrictEqual(curried(1, 2, 3, 4, 5, 6), [1, 2, 3, 4, 5, 6]);
    });

    it('should create a function with a `length` of `0`', () => {
        lodashStable.times(2, (index) => {
            const curried = index ? curry(fn, 4) : curry(fn);
            assert.strictEqual(curried.length, 0);
            assert.strictEqual(curried(1).length, 0);
            assert.strictEqual(curried(1, 2).length, 0);
        });
    });

    it('should ensure `new curried` is an instance of `func`', () => {
        function Foo(value) {
            return value && object;
        }

        var curried = curry(Foo),
            object = {};

        assert.ok(new curried(false) instanceof Foo);
        assert.strictEqual(new curried(true), object);
    });

    it('should use `this` binding of function', () => {
        const fn = function (a, b, c) {
            const value = this || {};
            return [value[a], value[b], value[c]];
        };

        const object = { a: 1, b: 2, c: 3 },
            expected = [1, 2, 3];

        assert.deepStrictEqual(curry(bind(fn, object), 3)('a')('b')('c'), expected);
        assert.deepStrictEqual(curry(bind(fn, object), 3)('a', 'b')('c'), expected);
        assert.deepStrictEqual(curry(bind(fn, object), 3)('a', 'b', 'c'), expected);

        assert.deepStrictEqual(bind(curry(fn), object)('a')('b')('c'), Array(3));
        assert.deepStrictEqual(bind(curry(fn), object)('a', 'b')('c'), Array(3));
        assert.deepStrictEqual(bind(curry(fn), object)('a', 'b', 'c'), expected);

        object.curried = curry(fn);
        assert.deepStrictEqual(object.curried('a')('b')('c'), Array(3));
        assert.deepStrictEqual(object.curried('a', 'b')('c'), Array(3));
        assert.deepStrictEqual(object.curried('a', 'b', 'c'), expected);
    });

    it('should work with partialed methods', () => {
        const curried = curry(fn),
            expected = [1, 2, 3, 4];

        const a = partial(curried, 1),
            b = bind(a, null, 2),
            c = partialRight(b, 4),
            d = partialRight(b(3), 4);

        assert.deepStrictEqual(c(3), expected);
        assert.deepStrictEqual(d(), expected);
    });
});
