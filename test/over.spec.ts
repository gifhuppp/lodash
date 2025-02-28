import assert from 'node:assert';
import { _, slice } from './utils';

describe('over', () => {
    it('should create a function that invokes `iteratees`', () => {
        const over = _.over(Math.max, Math.min);
        assert.deepStrictEqual(over(1, 2, 3, 4), [4, 1]);
    });

    it('should use `_.identity` when a predicate is nullish', () => {
        const over = _.over(undefined, null);
        assert.deepStrictEqual(over('a', 'b', 'c'), ['a', 'a']);
    });

    it('should work with `_.property` shorthands', () => {
        const over = _.over('b', 'a');
        assert.deepStrictEqual(over({ a: 1, b: 2 }), [2, 1]);
    });

    it('should work with `_.matches` shorthands', () => {
        const over = _.over({ b: 1 }, { a: 1 });
        assert.deepStrictEqual(over({ a: 1, b: 2 }), [false, true]);
    });

    it('should work with `_.matchesProperty` shorthands', () => {
        const over = _.over([
            ['b', 2],
            ['a', 2],
        ]);

        assert.deepStrictEqual(over({ a: 1, b: 2 }), [true, false]);
        assert.deepStrictEqual(over({ a: 2, b: 1 }), [false, true]);
    });

    it('should differentiate between `_.property` and `_.matchesProperty` shorthands', () => {
        let over = _.over(['a', 1]);

        assert.deepStrictEqual(over({ a: 1, '1': 2 }), [1, 2]);
        assert.deepStrictEqual(over({ a: 2, '1': 1 }), [2, 1]);

        over = _.over([['a', 1]]);

        assert.deepStrictEqual(over({ a: 1 }), [true]);
        assert.deepStrictEqual(over({ a: 2 }), [false]);
    });

    it('should provide arguments to predicates', () => {
        const over = _.over(function () {
            return slice.call(arguments);
        });

        assert.deepStrictEqual(over('a', 'b', 'c'), [['a', 'b', 'c']]);
    });

    it('should use `this` binding of function for `iteratees`', () => {
        const over = _.over(
                function () {
                    return this.b;
                },
                function () {
                    return this.a;
                },
            ),
            object = { over: over, a: 1, b: 2 };

        assert.deepStrictEqual(object.over(), [2, 1]);
    });
});
