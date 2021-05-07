/**
 * @jest-environment jsdom
 */

import { AsyncError } from './AsyncError';
import { MultiStateAsyncValue } from './MultiStateAsyncValue';

describe('MultiStateAsyncValue getters and factories', function () {
  it('MultiStateAsyncValue.errorOnly factory works as expected', function () {
    const errorMessage = 'Sample error message';
    const instance = MultiStateAsyncValue.errorOnly(errorMessage);
    expect(instance.error.message).toEqual(errorMessage);
    expect(instance.pending).toEqual(false);
    expect(instance.value).toEqual(null);
  });

  it('MultiStateAsyncValue.pendingOnly factory works as expected', function () {
    const instance = MultiStateAsyncValue.pendingOnly();
    expect(instance.error).toEqual(null);
    expect(instance.pending).toEqual(true);
    expect(instance.value).toEqual(null);
  });

  it('MultiStateAsyncValue.valueOnly factory works as expected', function () {
    const sampleValue = 1;
    const instance = MultiStateAsyncValue.valueOnly(sampleValue);
    expect(instance.error).toEqual(null);
    expect(instance.pending).toEqual(false);
    expect(instance.value).toEqual(sampleValue);
  });
});


describe('MultiStateAsyncValue setters', function () {
  it('setting MultiStateAsyncValue.error does not change pending and value properties', function () {
    const sampleError = 'Sample error message';
    const sampleError2 = 'Sample error message 2';
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    instance.error = AsyncError.from(sampleError2);
    expect(instance.error.message).toEqual(sampleError2);
    expect(instance.pending).toEqual(samplePending);
    expect(instance.value).toEqual(sampleValue);
  });

  it('setting MultiStateAsyncValue.pending does not change error and pending properties', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const samplePending2 = false;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    instance.pending = samplePending2;
    expect(instance.error.message).toEqual(sampleError);
    expect(instance.pending).toEqual(samplePending2);
    expect(instance.value).toEqual(sampleValue);
  });

  it('setting MultiStateAsyncValue.value does not change error and value properties', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const sampleValue = 1;
    const sampleValue2 = 2;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    instance.value = sampleValue2;
    expect(instance.error.message).toEqual(sampleError);
    expect(instance.pending).toEqual(samplePending);
    expect(instance.value).toEqual(sampleValue2);
  });
});


describe('Clone methods works as expected', function () {
  it('multiStateAsyncValue.clone() clone all properties properly', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    const clone = instance.clone();
    expect(instance === clone).toBeFalsy();
    expect(clone.error.message).toEqual(sampleError);
    expect(clone.pending).toEqual(samplePending);
    expect(clone.value).toEqual(sampleValue);
  });

  it('multiStateAsyncValue.cloneAndSetError() works properly', function () {
    const sampleError = 'Sample error message';
    const sampleError2 = 'Sample error message 2';
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    const clone = instance.cloneAndSetError(sampleError2);
    expect(instance === clone).toBeFalsy();
    expect(clone.error.message).toEqual(sampleError2);
    expect(clone.pending).toEqual(samplePending);
    expect(clone.value).toEqual(sampleValue);
  });

  it('multiStateAsyncValue.cloneWithNoError() works properly', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    const clone = instance.cloneWithNoError();
    expect(instance === clone).toBeFalsy();
    expect(clone.error).toEqual(null);
    expect(clone.pending).toEqual(samplePending);
    expect(clone.value).toEqual(sampleValue);
  });

  it('multiStateAsyncValue.cloneAndSetPending() works properly', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const samplePending2 = false;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);

    const clone = instance.cloneAndSetPending(samplePending2);
    expect(instance === clone).toBeFalsy();
    expect(clone.error.message).toEqual(sampleError);
    expect(clone.pending).toEqual(samplePending2);
    expect(clone.value).toEqual(sampleValue);

    const clone2 = clone.cloneAndSetPending(samplePending);
    expect(clone2 === clone).toBeFalsy();
    expect(clone2.error.message).toEqual(sampleError);
    expect(clone2.pending).toEqual(samplePending);
    expect(clone2.value).toEqual(sampleValue);
  });

  it('multiStateAsyncValue.cloneWithNoPending() works properly', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);

    const clone = instance.cloneWithNoPending();
    expect(instance === clone).toBeFalsy();
    expect(clone.error.message).toEqual(sampleError);
    expect(clone.pending).toEqual(false);
    expect(clone.value).toEqual(sampleValue);
  });

  it('multiStateAsyncValue.cloneAndSetValue() works properly', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const sampleValue = 1;
    const sampleValue2 = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);

    const clone = instance.cloneAndSetValue(sampleValue2);
    expect(instance === clone).toBeFalsy();
    expect(clone.error.message).toEqual(sampleError);
    expect(clone.pending).toEqual(samplePending);
    expect(clone.value).toEqual(sampleValue2);

    const clone2 = clone.cloneAndSetValue(sampleValue);
    expect(clone2 === clone).toBeFalsy();
    expect(clone2.error.message).toEqual(sampleError);
    expect(clone2.pending).toEqual(samplePending);
    expect(clone2.value).toEqual(sampleValue);
  });

  it('multiStateAsyncValue.cloneWithNoValue() works properly', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);

    const clone = instance.cloneWithNoValue();
    expect(instance === clone).toBeFalsy();
    expect(clone.error.message).toEqual(sampleError);
    expect(clone.pending).toEqual(samplePending);
    expect(clone.value).toEqual(null);
  });
});

describe('multiStateAsyncValue.isFullfiled returns correct value', function () {
  it('multiStateAsyncValue.isFullfiled returns false when error property is set', function () {
    const sampleError = 'Sample error message';
    const samplePending = false;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    expect(instance.isFullfiled).toBeFalsy();
  });

  it('multiStateAsyncValue.isFullfiled returns false when pending property is true', function () {
    const sampleError = null;
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    expect(instance.isFullfiled).toBeFalsy();
  });

  it('multiStateAsyncValue.isFullfiled returns false when error property is set amd pending property is true', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    expect(instance.isFullfiled).toBeFalsy();
  });

  it('multiStateAsyncValue.isFullfiled returns true when {error: null, pending: false, value: truthy}', function () {
    const sampleError = null;
    const samplePending = false;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    expect(instance.isFullfiled).toBeTruthy();
  });

  it('multiStateAsyncValue.isFullfiled returns true when {error: null, pending: false, value: falsy}', function () {
    const sampleError = null;
    const samplePending = false;
    const sampleValue = null;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    expect(instance.isFullfiled).toBeTruthy();
  });
});

describe('multiStateAsyncValue.hasValue returns correct value', function () {
  it('multiStateAsyncValue.hasValue returns false when value === 1', function () {
    const sampleError = 'Sample error message';
    const samplePending = true;
    const sampleValue = 1;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    expect(instance.hasValue).toBeTruthy();
  });

  it('multiStateAsyncValue.hasValue returns false when value === false', function () {
    const sampleError = null;
    const samplePending = true;
    const sampleValue = false;
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    expect(instance.hasValue).toBeTruthy();
  });

  it('multiStateAsyncValue.hasValue returns false when value === ""', function () {
    const sampleError = 'Sample error message';
    const samplePending = false;
    const sampleValue = "";
    const instance = new MultiStateAsyncValue(sampleValue, samplePending, sampleError);
    expect(instance.hasValue).toBeTruthy();
  });
});
