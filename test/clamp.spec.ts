import assert from 'node:assert';
import clamp from '../src/clamp';

describe('clamp', () => {
    it('should work with a `max`', () => {
        assert.strictEqual(clamp(5, 3), 3);
        assert.strictEqual(clamp(1, 3), 1);
    });

    it('should clamp negative numbers', () => {
        assert.strictEqual(clamp(-10, -5, 5), -5);
        assert.strictEqual(clamp(-10.2, -5.5, 5.5), -5.5);
        assert.strictEqual(clamp(-Infinity, -5, 5), -5);
    });

    it('should clamp positive numbers', () => {
        assert.strictEqual(clamp(10, -5, 5), 5);
        assert.strictEqual(clamp(10.6, -5.6, 5.4), 5.4);
        assert.strictEqual(clamp(Infinity, -5, 5), 5);
    });

    it('should not alter negative numbers in range', () => {
        assert.strictEqual(clamp(-4, -5, 5), -4);
        assert.strictEqual(clamp(-5, -5, 5), -5);
        assert.strictEqual(clamp(-5.5, -5.6, 5.6), -5.5);
    });

    it('should not alter positive numbers in range', () => {
        assert.strictEqual(clamp(4, -5, 5), 4);
        assert.strictEqual(clamp(5, -5, 5), 5);
        assert.strictEqual(clamp(4.5, -5.1, 5.2), 4.5);
    });

    it('should not alter `0` in range', () => {
        assert.strictEqual(1 / clamp(0, -5, 5), Infinity);
    });

    it('should clamp to `0`', () => {
        assert.strictEqual(1 / clamp(-10, 0, 5), Infinity);
    });

    it('should not alter `-0` in range', () => {
        assert.strictEqual(1 / clamp(-0, -5, 5), -Infinity);
    });

    it('should clamp to `-0`', () => {
        assert.strictEqual(1 / clamp(-10, -0, 5), -Infinity);
    });

    it('should return `NaN` when `number` is `NaN`', () => {
        assert.deepStrictEqual(clamp(NaN, -5, 5), NaN);
    });

    it('should coerce `min` and `max` of `NaN` to `0`', () => {
        assert.deepStrictEqual(clamp(1, -5, NaN), 0);
        assert.deepStrictEqual(clamp(-1, NaN, 5), 0);
    });
});
