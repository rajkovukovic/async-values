/**
 * @jest-environment jsdom
 */

import { AsyncError } from './AsyncError';
import { AsyncValue } from './AsyncValue';
import { MultiStateAsyncValue } from './MultiStateAsyncValue';

describe('AsyncValue constructor works properly', function () {
	it('new AsyncValue() sets value properly', function () {
		const sampleValue = 1;
		const instance = new AsyncValue(sampleValue);
		expect(instance).toBeInstanceOf(AsyncValue);
		expect(instance).toBeInstanceOf(MultiStateAsyncValue);
		expect(instance.error).toEqual(null);
		expect(instance.pending).toEqual(false);
		expect(instance.value).toEqual(sampleValue);
	});

	it('new AsyncValue() sets pending properly', function () {
		const instance = new AsyncValue(null, true);
		expect(instance).toBeInstanceOf(AsyncValue);
		expect(instance).toBeInstanceOf(MultiStateAsyncValue);
		expect(instance.error).toEqual(null);
		expect(instance.pending).toEqual(true);
		expect(instance.value).toEqual(null);
	});

	it('new AsyncValue() sets error properly', function () {
		const errorMessage = 'Sample error message';
		const instance = new AsyncValue(null, false, errorMessage);
		expect(instance).toBeInstanceOf(AsyncValue);
		expect(instance).toBeInstanceOf(MultiStateAsyncValue);
		expect(instance.error.message).toEqual(errorMessage);
		expect(instance.pending).toEqual(false);
		expect(instance.value).toEqual(null);
	});

	it('new AsyncValue() throws an error when more than one state is truthy', function () {
		const errorMessage = 'Sample error message';
		expect(() => new AsyncValue(1, true)).toThrowError();
		expect(() => new AsyncValue(1, false, errorMessage)).toThrowError();
		expect(() => new AsyncValue(null, true, errorMessage)).toThrowError();
		expect(() => new AsyncValue(1, true, errorMessage)).toThrowError();
	});
});

describe('AsyncValue getters and factories work properly', function () {
	it('AsyncValue.errorOnly returns instance of AsyncValue & MultiStateAsyncValue', function () {
		const instance = AsyncValue.errorOnly('Sample error message');
		expect(instance).toBeInstanceOf(AsyncValue);
		expect(instance).toBeInstanceOf(MultiStateAsyncValue);
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
	it('setting AsyncValue.error setter sets AsyncValue.pending to false', function () {
		const sampleValue = 1;
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.pendingOnly();
		instance.error = AsyncError.from(errorMessage);
		expect(instance.error.message).toEqual(errorMessage);
		expect(instance.pending).toEqual(false);
		expect(instance.value).toEqual(null);
	});

	it('setting AsyncValue.error setter sets AsyncValue.value to null', function () {
		const sampleValue = 1;
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.valueOnly(sampleValue);
		instance.error = AsyncError.from(errorMessage);
		expect(instance.error.message).toEqual(errorMessage);
		expect(instance.pending).toEqual(false);
		expect(instance.value).toEqual(null);
	});

	it('setting AsyncValue.setErrorFrom() sets AsyncValue.value to null', function () {
		const sampleValue = 1;
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.valueOnly(sampleValue);
		instance.setErrorFrom(errorMessage);
		expect(instance.error.message).toEqual(errorMessage);
		expect(instance.pending).toEqual(false);
		expect(instance.value).toEqual(null);
	});

	it('setting AsyncValue.setErrorFrom() sets AsyncValue.pending to false', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.pendingOnly();
		instance.setErrorFrom(errorMessage);
		expect(instance.error.message).toEqual(errorMessage);
		expect(instance.pending).toEqual(false);
		expect(instance.value).toEqual(null);
	});

	it('setting AsyncValue.pending setter sets AsyncValue.error to null', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.errorOnly(errorMessage);
		instance.pending = true;
		expect(instance.error).toEqual(null);
		expect(instance.pending).toEqual(true);
		expect(instance.value).toEqual(null);
	});

	it('setting AsyncValue.pending setter sets AsyncValue.value to null', function () {
		const sampleValue = 1;
		const instance = AsyncValue.valueOnly(sampleValue);
		instance.pending = true;
		expect(instance.error).toEqual(null);
		expect(instance.pending).toEqual(true);
		expect(instance.value).toEqual(null);
	});

	it('setting AsyncValue.value setter sets AsyncValue.error to null', function () {
		const errorMessage = 'Sample error message';
		const sampleValue = 1;
		const instance = AsyncValue.errorOnly(errorMessage);
		instance.value = sampleValue;
		expect(instance.error).toEqual(null);
		expect(instance.pending).toEqual(false);
		expect(instance.value).toEqual(sampleValue);
	});

	it('setting AsyncValue.value setter sets AsyncValue.pending to false', function () {
		const sampleValue = 1;
		const instance = AsyncValue.pendingOnly();
		instance.value = sampleValue;
		expect(instance.error).toEqual(null);
		expect(instance.pending).toEqual(false);
		expect(instance.value).toEqual(sampleValue);
	});
});

describe('AsyncValue.clone() works as expected', function () {
	it('AsyncValue.clone() returns instance of AsyncValue & MultiStateAsyncValue', function () {
		const instance = AsyncValue.valueOnly(1);
		const clone = instance.clone();
		expect(clone).toBeInstanceOf(AsyncValue);
		expect(clone).toBeInstanceOf(MultiStateAsyncValue);
	});

	it('AsyncValue.clone() clones error properly', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.errorOnly(errorMessage);
		const clone = instance.clone();
		expect(clone.error.message).toEqual(errorMessage);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.clone() clones value properly', function () {
		const instance = AsyncValue.pendingOnly();
		const clone = instance.clone();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(true);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.clone() clones value properly', function () {
		const sampleValue = 1;
		const instance = AsyncValue.valueOnly(sampleValue);
		const clone = instance.clone();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(sampleValue);
	});
});

describe('AsyncValue.cloneAndSetError() works as expected', function () {
	it('AsyncValue.cloneAndSetError() returns instance of AsyncValue & MultiStateAsyncValue', function () {
		const instance = AsyncValue.valueOnly(1);
		const clone = instance.cloneAndSetError('Sample error message');
		expect(clone).toBeInstanceOf(AsyncValue);
		expect(clone).toBeInstanceOf(MultiStateAsyncValue);
	});

	it('AsyncValue.cloneAndSetError() sets pending to false', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.pendingOnly();
		const clone = instance.cloneAndSetError(errorMessage);
		expect(instance.pending).toEqual(true);
		expect(clone.error.message).toEqual(errorMessage);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneAndSetError() sets value to null', function () {
		const sampleValue = 1;
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.valueOnly(sampleValue);
		const clone = instance.cloneAndSetError(errorMessage);
		expect(instance.value).toEqual(sampleValue);
		expect(clone.error.message).toEqual(errorMessage);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});
});

describe('AsyncValue.cloneAndSetPending() works as expected', function () {
	it('AsyncValue.cloneAndSetPending() returns instance of AsyncValue & MultiStateAsyncValue', function () {
		const instance = AsyncValue.valueOnly(1);
		const clone = instance.cloneAndSetPending();
		expect(clone).toBeInstanceOf(AsyncValue);
		expect(clone).toBeInstanceOf(MultiStateAsyncValue);
	});

	it('AsyncValue.cloneAndSetPending(true) sets error to null', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.errorOnly(errorMessage);
		const clone = instance.cloneAndSetPending(true);
		expect(instance.error.message).toEqual(errorMessage);
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(true);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneAndSetPending(false) sets error to null', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.errorOnly(errorMessage);
		const clone = instance.cloneAndSetPending(false);
		expect(instance.error.message).toEqual(errorMessage);
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneAndSetPending(true) sets value to null', function () {
		const sampleValue = 1;
		const instance = AsyncValue.valueOnly(sampleValue);
		const clone = instance.cloneAndSetPending(true);
		expect(instance.value).toEqual(sampleValue);
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(true);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneAndSetPending(false) sets value to null', function () {
		const sampleValue = 1;
		const instance = AsyncValue.valueOnly(sampleValue);
		const clone = instance.cloneAndSetPending(false);
		expect(instance.value).toEqual(sampleValue);
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});
});

describe('AsyncValue.cloneAndSetValue() works as expected', function () {
	it('AsyncValue.cloneAndSetValue() returns instance of AsyncValue & MultiStateAsyncValue', function () {
		const instance = AsyncValue.valueOnly(1);
		const clone = instance.cloneAndSetValue(2);
		expect(clone).toBeInstanceOf(AsyncValue);
		expect(clone).toBeInstanceOf(MultiStateAsyncValue);
	});

	it('AsyncValue.cloneAndSetValue() sets error to null', function () {
		const sampleValue = 1;
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.errorOnly(errorMessage);
		const clone = instance.cloneAndSetValue(sampleValue);
		expect(instance.error.message).toEqual(errorMessage);
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(sampleValue);
	});

	it('AsyncValue.cloneAndSetValue() sets pending to false', function () {
		const sampleValue = 1;
		const instance = AsyncValue.pendingOnly();
		const clone = instance.cloneAndSetValue(sampleValue);
		expect(instance.pending).toEqual(true);
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(sampleValue);
	});
});

describe('AsyncValue.cloneWithNoError() works as expected', function () {
	it('AsyncValue.cloneWithNoError() returns instance of AsyncValue & MultiStateAsyncValue', function () {
		const instance = AsyncValue.valueOnly(1);
		const clone = instance.cloneWithNoError();
		expect(clone).toBeInstanceOf(AsyncValue);
		expect(clone).toBeInstanceOf(MultiStateAsyncValue);
	});

	it('AsyncValue.cloneWithNoError() sets error to null and keeps value = null and pending = false', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.errorOnly(errorMessage);
		const clone = instance.cloneWithNoError();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneWithNoError() sets error to null and keeps value truthy and pending = false', function () {
		const sampleValue = 1;
		const instance = AsyncValue.valueOnly(sampleValue);
		const clone = instance.cloneWithNoError();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(sampleValue);
	});

	it('AsyncValue.cloneWithNoError() sets error to null and keeps value = null and pending = true', function () {
		const instance = AsyncValue.pendingOnly();
		const clone = instance.cloneWithNoError();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(true);
		expect(clone.value).toEqual(null);
	});
});

describe('AsyncValue.cloneWithNoValue() works as expected', function () {
	it('AsyncValue.cloneWithNoValue() returns instance of AsyncValue & MultiStateAsyncValue', function () {
		const instance = AsyncValue.valueOnly(1);
		const clone = instance.cloneWithNoValue();
		expect(clone).toBeInstanceOf(AsyncValue);
		expect(clone).toBeInstanceOf(MultiStateAsyncValue);
	});

	it('AsyncValue.cloneWithNoValue() sets value to null and keeps error = null and pending = false', function () {
		const instance = AsyncValue.valueOnly(1);
		const clone = instance.cloneWithNoValue();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneWithNoValue() keeps value = null, error truthy and pending = false', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.errorOnly(errorMessage);
		const clone = instance.cloneWithNoValue();
		expect(clone.error.message).toEqual(errorMessage);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneWithNoValue() keeps value = null, anderror = null and pending = true', function () {
		const instance = AsyncValue.pendingOnly();
		const clone = instance.cloneWithNoValue();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(true);
		expect(clone.value).toEqual(null);
	});
});

describe('AsyncValue.cloneWithNoPending() works as expected', function () {
	it('AsyncValue.cloneWithNoPending() returns instance of AsyncValue & MultiStateAsyncValue', function () {
		const instance = AsyncValue.valueOnly(1);
		const clone = instance.cloneWithNoPending();
		expect(clone).toBeInstanceOf(AsyncValue);
		expect(clone).toBeInstanceOf(MultiStateAsyncValue);
	});

	it('AsyncValue.cloneWithNoPending() sets pending to false and keeps error = null and value = null', function () {
		const instance = AsyncValue.pendingOnly();
		const clone = instance.cloneWithNoPending();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneWithNoPending() keeps pending = false, error truthy and value = null', function () {
		const errorMessage = 'Sample error message';
		const instance = AsyncValue.errorOnly(errorMessage);
		const clone = instance.cloneWithNoPending();
		expect(clone.error.message).toEqual(errorMessage);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(null);
	});

	it('AsyncValue.cloneWithNoPending() keeps pe = null, anderror = null and value truthy', function () {
		const sampleValue = 1;
		const instance = AsyncValue.valueOnly(sampleValue);
		const clone = instance.cloneWithNoPending();
		expect(clone.error).toEqual(null);
		expect(clone.pending).toEqual(false);
		expect(clone.value).toEqual(sampleValue);
	});
});
