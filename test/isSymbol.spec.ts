import assert from 'node:assert';
import lodashStable from 'lodash';
import { symbol, falsey, stubFalse, args, slice, realm } from './utils';
import isSymbol from '../src/isSymbol';

describe('isSymbol', () => {
    it('should return `true` for symbols', () => {
        if (Symbol) {
            assert.strictEqual(isSymbol(symbol), true);
            assert.strictEqual(isSymbol(Object(symbol)), true);
        }
    });

    it('should return `false` for non-symbols', () => {
        const expected = lodashStable.map(falsey, stubFalse);

        const actual = lodashStable.map(falsey, (value, index) =>
            index ? isSymbol(value) : isSymbol(),
        );

        assert.deepStrictEqual(actual, expected);

        assert.strictEqual(isSymbol(args), false);
        assert.strictEqual(isSymbol([1, 2, 3]), false);
        assert.strictEqual(isSymbol(true), false);
        assert.strictEqual(isSymbol(new Date()), false);
        assert.strictEqual(isSymbol(new Error()), false);
        assert.strictEqual(isSymbol(slice), false);
        assert.strictEqual(isSymbol({ '0': 1, length: 1 }), false);
        assert.strictEqual(isSymbol(1), false);
        assert.strictEqual(isSymbol(/x/), false);
        assert.strictEqual(isSymbol('a'), false);
    });

    it('should work with symbols from another realm', () => {
        if (Symbol && realm.symbol) {
            assert.strictEqual(isSymbol(realm.symbol), true);
        }
    });
});
