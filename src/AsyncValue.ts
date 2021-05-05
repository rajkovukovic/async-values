class AsyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AsyncError';
  }

  toString(): string {
    return this.message;
  }

  static from(error: ConvertibleToAsyncError) {
    if (error instanceof Error) {
      const asyncError = new AsyncError(error.message);
      asyncError.stack = error.stack;
    }

    return error instanceof AsyncError
      ? error
      : new AsyncError(error as string);
  }
}

const isEmptyValue = (value: any) => value === null || value === undefined;
const isNotEmptyValue = (value: any) => value !== null && value !== undefined;

type ConvertibleToAsyncError = string | Error | AsyncError;

/**
 * MultiStateAsyncValue can have its properties [value, pending, error] being truthy simultaneously
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
    this._value = isEmptyValue(value) ? null : value;
    this._pending = Boolean(pending);
    this._error =
      error == null
        ? null
        : AsyncError.from(error);
  }

  clone(): MultiStateAsyncValue<T> {
    return new MultiStateAsyncValue(this._value, this._pending, this._error);
  }

  static isEmptyValue(value: any): boolean {
    return value === null || value === undefined;
  }

  static createErrorOnly<T>(error: ConvertibleToAsyncError): MultiStateAsyncValue<T> {
    return new MultiStateAsyncValue<T>(null, false, error);
  }

  createErrorOnly(error: ConvertibleToAsyncError): MultiStateAsyncValue<T> {
    return MultiStateAsyncValue.createErrorOnly(error);
  }

  static createPendingOnly<T>(): MultiStateAsyncValue<T> {
    return new MultiStateAsyncValue<T>(null, true);
  }

  createPendingOnly(): MultiStateAsyncValue<T> {
    return MultiStateAsyncValue.createPendingOnly();
  }

  static createValueOnly<T>(value: T): MultiStateAsyncValue<T> {
    return new MultiStateAsyncValue<T>(value);
  }

  createValueOnly(value: T): MultiStateAsyncValue<T> {
    return MultiStateAsyncValue.createValueOnly(value);
  }

  get error(): AsyncError {
    return this._error;
  }

  set error(nextError: AsyncError) {
    this._error = AsyncError.from(nextError);
  }

  cloneWithError(nextError: AsyncError): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.error = nextError;
    return clone;
  }

  cloneWithNoError(): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.error = null;
    return clone;
  }

  get pending(): boolean {
    return this._pending;
  }

  set pending(nextPending: boolean) {
    this._pending = Boolean(nextPending);
  }

  cloneWithPendingTrue(): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.pending = true;
    return clone;
  }

  cloneWithPendingFalse(): MultiStateAsyncValue<T> {
    const clone = this.clone();
    clone.pending = false;
    return clone;
  }

  /**
   * @returns true if not in pending state and there is no error
   */
  get noErrorAndNotPending(): boolean {
    return !this._pending && !this._error;
  }

  get hasValue(): boolean {
    return isNotEmptyValue(this._value);
  }

  get value(): T {
    return this._value;
  }

  set value(nextValue: T) {
    this._value = nextValue ?? null; // "no undefined" guard
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
}

/**
 * AsyncValue can have only one of [value, pending, error] set at any time
 */
export class AsyncValue<T> extends MultiStateAsyncValue<T> {
  constructor (
    value: T,
    pending: boolean = false,
    error: Error = null,
  ) {
    super(value, pending, error);
    if (Number(value ) + Number(Boolean(pending)) + Number(Boolean(error)) > 1)
      throw Error('Only one of "value", "pending", "error" can be truthy, but got: ' + JSON.stringify({
        value,
        pending,
        error,
      }));
  }

  set error(nextError: Error) {
    super.error = nextError;
    if (super._pending) super._pending = false;
    if (isNotEmptyValue(super._value)) super._value = null;
  }

  set pending(nextPending: boolean) {
    super.pending = nextPending;
    if (super._error) super._error = null;
    if (isNotEmptyValue(super._value)) super._value = null;
  }

  set value(nextValue: T) {
    super.value = nextValue;
    if (super._pending) super._pending = false;
    if (super._error) super._error = null;
  }
}
