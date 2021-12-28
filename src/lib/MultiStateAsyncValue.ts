import { AsyncError, ConvertibleToAsyncError } from './AsyncError';
import { isEmptyValue, isNotEmptyValue } from './helpers';

/**
 * MultiStateAsyncValue can have more than one
 * of its properties [value, pending, error] being truthy simultaneously
 */
export class MultiStateAsyncValue<T> {
	private static _loggedErrors = new Set();
	private static _consoleErrorLogger(error: Error) {
		console.error(error);
	}

	static errorHanlder?: (error: Error) => void = MultiStateAsyncValue._consoleErrorLogger;

	static logErrorsToConsole(shouldLog = true) {
		MultiStateAsyncValue.errorHanlder = shouldLog ? MultiStateAsyncValue._consoleErrorLogger : null;
	}

	private static _handleError(error: Error) {
		if (!MultiStateAsyncValue._loggedErrors.has(error)) {
			MultiStateAsyncValue._loggedErrors.add(error);
			MultiStateAsyncValue.errorHanlder?.call(null, error);
		}
	}

	protected _error: Error;
	protected _pending: boolean;
	protected _value: T;

	constructor(value: T = null, pending: boolean = false, error: ConvertibleToAsyncError = null) {
		this._value = value ?? null;
		this._pending = Boolean(pending);
		this._error = isEmptyValue(error) ? null : AsyncError.from(error);
		if (this._error) MultiStateAsyncValue._handleError(this._error);
	}

	static errorOnly<T = any>(error: ConvertibleToAsyncError): MultiStateAsyncValue<T> {
		return new MultiStateAsyncValue<T>(null, false, error);
	}

	static pendingOnly<T = any>(): MultiStateAsyncValue<T> {
		return new MultiStateAsyncValue<T>(null, true);
	}

	static valueOnly<T>(value: T): MultiStateAsyncValue<T> {
		return new MultiStateAsyncValue<T>(value);
	}

	static createEmpty<T = any>(): MultiStateAsyncValue<T> {
		return new MultiStateAsyncValue<T>();
	}

	/**
	 * Getters and Setters
	 */
	get error(): AsyncError {
		return this._error;
	}

	set error(nextError: AsyncError) {
		this.setErrorFrom(nextError);
	}

	setErrorFrom(nextError: ConvertibleToAsyncError) {
		this._error = isEmptyValue(nextError) ? null : AsyncError.from(nextError);
		if (this._error) MultiStateAsyncValue._handleError(this._error);
	}

	get pending(): boolean {
		return this._pending;
	}

	set pending(nextPending: boolean) {
		this._pending = Boolean(nextPending);
	}

	get value(): T {
		return this._value;
	}

	set value(nextValue: T) {
		this._value = nextValue ?? null; // "no undefined" guard
	}

	/**
	 * Clone methods
	 */
	clone(): MultiStateAsyncValue<T> {
		return new MultiStateAsyncValue(this._value, this._pending, this._error);
	}

	cloneAndSetError(error: ConvertibleToAsyncError): MultiStateAsyncValue<T> {
		const clone = this.clone();
		clone.setErrorFrom(error);
		return clone;
	}

	cloneWithNoError(): MultiStateAsyncValue<T> {
		const clone = this.clone();
		if (isNotEmptyValue(clone.error)) {
			clone.error = null;
		}
		return clone;
	}

	cloneAndSetPending(nextPending: boolean = true): MultiStateAsyncValue<T> {
		const clone = this.clone();
		clone.pending = Boolean(nextPending);
		return clone;
	}

	cloneWithNoPending(): MultiStateAsyncValue<T> {
		const clone = this.clone();
		if (clone.pending) {
			clone.pending = false;
		}
		return clone;
	}

	cloneAndSetValue(value: T): MultiStateAsyncValue<T> {
		const clone = this.clone();
		clone.value = value;
		return clone;
	}

	cloneWithNoValue(): MultiStateAsyncValue<T> {
		const clone = this.clone();
		if (isNotEmptyValue(clone.value)) {
			clone.value = null;
		}
		return clone;
	}

	/**
	 * @returns true if not in pending state and there is no error
	 * it does not care if value is null or not
	 */
	get isFulfilled(): boolean {
		return !this._pending && !this._error;
	}

	/**
	 * @returns true if value is not equal to null | undefined
	 */
	get hasValue(): boolean {
		return isNotEmptyValue(this._value);
	}
}

export type GenericAsyncValue<T> = MultiStateAsyncValue<T>;
