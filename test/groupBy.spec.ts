import assert from 'node:assert';
import lodashStable from 'lodash';
import { LARGE_ARRAY_SIZE } from './utils';
import groupBy from '../src/groupBy';

describe('groupBy', () => {
    const array = [6.1, 4.2, 6.3];

    it('should transform keys by `iteratee`', () => {
        const actual = groupBy(array, Math.floor);
        assert.deepStrictEqual(actual, { '4': [4.2], '6': [6.1, 6.3] });
    });

    it('should use `_.identity` when `iteratee` is nullish', () => {
        const array = [6, 4, 6],
            values = [, null, undefined],
            expected = lodashStable.map(values, lodashStable.constant({ '4': [4], '6': [6, 6] }));

        const actual = lodashStable.map(values, (value, index) =>
            index ? groupBy(array, value) : groupBy(array),
        );

        assert.deepStrictEqual(actual, expected);
    });

    it('should work with `_.property` shorthands', () => {
        const actual = groupBy(['one', 'two', 'three'], 'length');
        assert.deepStrictEqual(actual, { '3': ['one', 'two'], '5': ['three'] });
    });

    it('should only add values to own, not inherited, properties', () => {
        const actual = groupBy(array, (n) =>
            Math.floor(n) > 4 ? 'hasOwnProperty' : 'constructor',
        );

        assert.deepStrictEqual(actual.constructor, [4.2]);
        assert.deepStrictEqual(actual.hasOwnProperty, [6.1, 6.3]);
    });

    it('should work with a number for `iteratee`', () => {
        const array = [
            [1, 'a'],
            [2, 'a'],
            [2, 'b'],
        ];

        assert.deepStrictEqual(groupBy(array, 0), {
            '1': [[1, 'a']],
            '2': [
                [2, 'a'],
                [2, 'b'],
            ],
        });
        assert.deepStrictEqual(groupBy(array, 1), {
            a: [
                [1, 'a'],
                [2, 'a'],
            ],
            b: [[2, 'b']],
        });
    });

    it('should work with an object for `collection`', () => {
        const actual = groupBy({ a: 6.1, b: 4.2, c: 6.3 }, Math.floor);
        assert.deepStrictEqual(actual, { '4': [4.2], '6': [6.1, 6.3] });
    });

    it('should work in a lazy sequence', () => {
        const array = lodashStable
            .range(LARGE_ARRAY_SIZE)
            .concat(
                lodashStable.range(Math.floor(LARGE_ARRAY_SIZE / 2), LARGE_ARRAY_SIZE),
                lodashStable.range(Math.floor(LARGE_ARRAY_SIZE / 1.5), LARGE_ARRAY_SIZE),
            );

        const iteratee = function (value) {
                value.push(value[0]);
                return value;
            },
            predicate = function (value) {
                return isEven(value[0]);
            },
            actual = _(array).groupBy().map(iteratee).filter(predicate).take().value();

        assert.deepEqual(
            actual,
            _.take(_.filter(lodashStable.map(groupBy(array), iteratee), predicate)),
        );
    });
});
