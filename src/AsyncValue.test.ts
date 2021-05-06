/**
 * @jest-environment jsdom
 */

import { AsyncError } from './AsyncError';
import { AsyncValue } from './AsyncValue';
import { MultiStateAsyncValue } from './MultiStateAsyncValue';

describe('AsyncValue getters and factories', function () {
  it('AsyncValue.errorOnly returns instance of AsyncValue & MultiStateAsyncValue', function () {
    const errorMessage = 'Sample error message';
    const instance = AsyncValue.errorOnly(errorMessage);
    expect(instance instanceof AsyncValue).toBeTruthy();
    expect(instance instanceof MultiStateAsyncValue).toBeTruthy();
  });

  it('AsyncValue.errorOnly factory works as expected', function () {
    const errorMessage = 'Sample error message';
    const instance = AsyncValue.errorOnly(errorMessage);
    expect(instance.error.message).toEqual(errorMessage);
    expect(instance.pending).toEqual(false);
    expect(instance.value).toEqual(null);
  });

  it('AsyncValue.pendingOnly factory works as expected', function () {
    const instance = AsyncValue.pendingOnly();
    expect(instance.error).toEqual(null);
    expect(instance.pending).toEqual(true);
    expect(instance.value).toEqual(null);
  });

  it('AsyncValue.valueOnly factory works as expected', function () {
    const sampleValue = 1;
    const instance = AsyncValue.valueOnly(sampleValue);
    expect(instance.error).toEqual(null);
    expect(instance.pending).toEqual(false);
    expect(instance.value).toEqual(sampleValue);
  });
});

describe('AsyncValue setters', function () {
  it('setting AsyncValue.error sets AsyncValue.value to null', function () {
    const sampleValue = 1;
    const errorMessage = 'Sample error message';
    const instance = AsyncValue.valueOnly(sampleValue);
    instance.error = AsyncError.from(errorMessage);
    expect(instance.pending).toEqual(false);
    expect(instance.value).toEqual(null);
  });
});
