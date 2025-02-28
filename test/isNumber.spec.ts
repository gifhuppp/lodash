import assert from 'node:assert';
import lodashStable from 'lodash';
import { falsey, args, slice, symbol, realm } from './utils';
import isNumber from '../src/isNumber';

describe('isNumber', () => {
    it('should return `true` for numbers', () => {
        assert.strictEqual(isNumber(0), true);
        assert.strictEqual(isNumber(Object(0)), true);
        assert.strictEqual(isNumber(NaN), true);
    });

    it('should return `false` for non-numbers', () => {
        const expected = lodashStable.map(falsey, (value) => typeof value === 'number');

        const actual = lodashStable.map(falsey, (value, index) =>
            index ? isNumber(value) : isNumber(),
        );

        assert.deepStrictEqual(actual, expected);

        assert.strictEqual(isNumber(args), false);
        assert.strictEqual(isNumber([1, 2, 3]), false);
        assert.strictEqual(isNumber(true), false);
        assert.strictEqual(isNumber(new Date()), false);
        assert.strictEqual(isNumber(new Error()), false);
        assert.strictEqual(isNumber(slice), false);
        assert.strictEqual(isNumber({ a: 1 }), false);
        assert.strictEqual(isNumber(/x/), false);
        assert.strictEqual(isNumber('a'), false);
        assert.strictEqual(isNumber(symbol), false);
    });

    it('should work with numbers from another realm', () => {
        if (realm.number) {
            assert.strictEqual(isNumber(realm.number), true);
        }
    });
});
