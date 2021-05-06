import { AsyncError , ConvertibleToAsyncError } from './AsyncError';
import { isEmptyValue, isNotEmptyValue } from './helpers';

/**
 * MultiStateAsyncValue can have more than one
 * of its properties [value, pending, error] being truthy simultaneously
 */
 export class MultiStateAsyncValue<T> {
  protected _error: Error;
  protected _pending: boolean;
  protected _value: T;

  constructor(
    value: T = null,
    pending: boolean = false,
    error: ConvertibleToAsyncError = null,
  ) {
    this._value = value ?? null;
    this._pending = Boolean(pending);
    this._error =
      isEmptyValue(error)
        ? null
        : AsyncError.from(error);
  }

  static errorOnly<T>(error: ConvertibleToAsyncError): MultiStateAsyncValue<T> {
    return new MultiStateAsyncValue<T>(null, false, error);
  }

  static pendingOnly<T>(): MultiStateAsyncValue<T> {
    return new MultiStateAsyncValue<T>(null, true);
  }

  static valueOnly<T>(value: T): MultiStateAsyncValue<T> {
    return new MultiStateAsyncValue<T>(value);
  }

  /**
   * Getters and Setters
   */
  get error(): AsyncError {
    console.log('get error');
    console.log(this._error);
    return this._error;
  }

  set error(nextError: AsyncError) {
    this.setErrorFrom(nextError);
  }

  setErrorFrom(nextError: ConvertibleToAsyncError) {
    this._error = isEmptyValue(nextError)
      ? null
      : AsyncError.from(nextError);
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
    clone.setErrorFrom (error);
    return clone;
  }

  cloneWithNoError(): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.error = null;
    return clone;
  }

  cloneWithPending(nextPending: boolean): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.pending = Boolean(nextPending);
    return clone;
  }

  cloneWithNoPending(): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.pending = false;
    return clone;
  }

  cloneWithValue(value: T): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.value = value;
    return clone;
  }

  cloneWithNoValue(): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.value = null;
    return clone;
  }

  /**
   * @returns true if not in pending state and there is no error
   * it does not care if value is null or not
   */
  get isFullfiled(): boolean {
    return !this._pending && !this._error;
  }

  /**
   * @returns true if value is not equal to null | undefined
   */
  get hasValue(): boolean {
    return isNotEmptyValue(this._value);
  }
}
