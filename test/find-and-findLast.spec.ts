import assert from 'node:assert';
import lodashStable from 'lodash';
import { LARGE_ARRAY_SIZE, square, isEven } from './utils';

describe('find and findLast', () => {
    lodashStable.each(['find', 'findLast'], (methodName) => {
        const isFind = methodName === 'find';

        it(`\`_.${methodName}\` should support shortcut fusion`, () => {
            let findCount = 0,
                mapCount = 0,
                array = lodashStable.range(1, LARGE_ARRAY_SIZE + 1),
                iteratee = function (value) {
                    mapCount++;
                    return square(value);
                },
                predicate = function (value) {
                    findCount++;
                    return isEven(value);
                },
                actual = _(array).map(iteratee)[methodName](predicate);

            assert.strictEqual(findCount, isFind ? 2 : 1);
            assert.strictEqual(mapCount, isFind ? 2 : 1);
            assert.strictEqual(actual, isFind ? 4 : square(LARGE_ARRAY_SIZE));
        });
    });
});
