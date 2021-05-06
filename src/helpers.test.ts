/**
 * @jest-environment jsdom
 */

 import { isEmptyValue, isNotEmptyValue } from './helpers';
 
describe('isEmptyValue return true when expected', function () {
  it('isEmptyValue returns true when expected', function () {
    const truthyValues = [null, undefined];
    truthyValues.forEach(value => expect(isEmptyValue(value)).toBe(true));
  });
 
  it('isEmptyValue returns false with every value of type number', function () {
    const falsyValues = [
      0,
      1,
      -0,
      -1,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NaN,
    ];
    falsyValues.forEach(value => expect(isEmptyValue(value)).toBe(false));
  });

  it('isEmptyValue returns false with every other "falsy" value', function () {
    const falsyValues = [
      '',
      [],
      {},
    ];
    falsyValues.forEach(value => expect(isEmptyValue(value)).toBe(false));
  });
});
 