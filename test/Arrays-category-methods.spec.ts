import assert from 'node:assert';
import { args, toArgs, identity } from './utils';
import difference from '../src/difference';
import union from '../src/union';
import compact from '../src/compact';
import drop from '../src/drop';
import dropRight from '../src/dropRight';
import dropRightWhile from '../src/dropRightWhile';
import dropWhile from '../src/dropWhile';
import findIndex from '../src/findIndex';
import findLastIndex from '../src/findLastIndex';
import flatten from '../src/flatten';
import head from '../src/head';
import indexOf from '../src/indexOf';
import initial from '../src/initial';
import intersection from '../src/intersection';
import last from '../src/last';
import lastIndexOf from '../src/lastIndexOf';
import sortedIndex from '../src/sortedIndex';
import sortedIndexOf from '../src/sortedIndexOf';
import sortedLastIndex from '../src/sortedLastIndex';
import sortedLastIndexOf from '../src/sortedLastIndexOf';
import tail from '../src/tail';
import take from '../src/take';
import takeRight from '../src/takeRight';
import takeRightWhile from '../src/takeRightWhile';
import takeWhile from '../src/takeWhile';
import uniq from '../src/uniq';
import without from '../src/without';
import zip from '../src/zip';
import xor from '../src/xor';

describe('"Arrays" category methods', () => {
    const args = toArgs([1, null, [3], null, 5]),
        sortedArgs = toArgs([1, [3], 5, null, null]),
        array = [1, 2, 3, 4, 5, 6];

    it('should work with `arguments` objects', () => {
        function message(methodName) {
            return `\`_.${methodName}\` should work with \`arguments\` objects`;
        }

        assert.deepStrictEqual(difference(args, [null]), [1, [3], 5], message('difference'));
        assert.deepStrictEqual(
            difference(array, args),
            [2, 3, 4, 6],
            '_.difference should work with `arguments` objects as secondary arguments',
        );

        assert.deepStrictEqual(union(args, [null, 6]), [1, null, [3], 5, 6], message('union'));
        assert.deepStrictEqual(
            union(array, args),
            array.concat([null, [3]]),
            '_.union should work with `arguments` objects as secondary arguments',
        );

        assert.deepStrictEqual(compact(args), [1, [3], 5], message('compact'));
        assert.deepStrictEqual(drop(args, 3), [null, 5], message('drop'));
        assert.deepStrictEqual(dropRight(args, 3), [1, null], message('dropRight'));
        assert.deepStrictEqual(
            dropRightWhile(args, identity),
            [1, null, [3], null],
            message('dropRightWhile'),
        );
        assert.deepStrictEqual(
            dropWhile(args, identity),
            [null, [3], null, 5],
            message('dropWhile'),
        );
        assert.deepStrictEqual(findIndex(args, identity), 0, message('findIndex'));
        assert.deepStrictEqual(findLastIndex(args, identity), 4, message('findLastIndex'));
        assert.deepStrictEqual(flatten(args), [1, null, 3, null, 5], message('flatten'));
        assert.deepStrictEqual(head(args), 1, message('head'));
        assert.deepStrictEqual(indexOf(args, 5), 4, message('indexOf'));
        assert.deepStrictEqual(initial(args), [1, null, [3], null], message('initial'));
        assert.deepStrictEqual(intersection(args, [1]), [1], message('intersection'));
        assert.deepStrictEqual(last(args), 5, message('last'));
        assert.deepStrictEqual(lastIndexOf(args, 1), 0, message('lastIndexOf'));
        assert.deepStrictEqual(sortedIndex(sortedArgs, 6), 3, message('sortedIndex'));
        assert.deepStrictEqual(sortedIndexOf(sortedArgs, 5), 2, message('sortedIndexOf'));
        assert.deepStrictEqual(sortedLastIndex(sortedArgs, 5), 3, message('sortedLastIndex'));
        assert.deepStrictEqual(sortedLastIndexOf(sortedArgs, 1), 0, message('sortedLastIndexOf'));
        assert.deepStrictEqual(tail(args, 4), [null, [3], null, 5], message('tail'));
        assert.deepStrictEqual(take(args, 2), [1, null], message('take'));
        assert.deepStrictEqual(takeRight(args, 1), [5], message('takeRight'));
        assert.deepStrictEqual(takeRightWhile(args, identity), [5], message('takeRightWhile'));
        assert.deepStrictEqual(takeWhile(args, identity), [1], message('takeWhile'));
        assert.deepStrictEqual(uniq(args), [1, null, [3], 5], message('uniq'));
        assert.deepStrictEqual(without(args, null), [1, [3], 5], message('without'));
        assert.deepStrictEqual(
            zip(args, args),
            [
                [1, 1],
                [null, null],
                [[3], [3]],
                [null, null],
                [5, 5],
            ],
            message('zip'),
        );
    });

    it('should accept falsey primary arguments', () => {
        function message(methodName) {
            return `\`_.${methodName}\` should accept falsey primary arguments`;
        }

        assert.deepStrictEqual(difference(null, array), [], message('difference'));
        assert.deepStrictEqual(intersection(null, array), [], message('intersection'));
        assert.deepStrictEqual(union(null, array), array, message('union'));
        assert.deepStrictEqual(xor(null, array), array, message('xor'));
    });

    it('should accept falsey secondary arguments', () => {
        function message(methodName) {
            return `\`_.${methodName}\` should accept falsey secondary arguments`;
        }

        assert.deepStrictEqual(difference(array, null), array, message('difference'));
        assert.deepStrictEqual(intersection(array, null), [], message('intersection'));
        assert.deepStrictEqual(union(array, null), array, message('union'));
    });
});
