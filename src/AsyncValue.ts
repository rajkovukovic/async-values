import { AsyncError, ConvertibleToAsyncError } from './AsyncError';
import { isNotEmptyValue } from './helpers';
import { MultiStateAsyncValue } from './MultiStateAsyncValue';

/**
 * AsyncValue can have only one of [value, pending, error] set at any time
 */
export class AsyncValue<T> extends MultiStateAsyncValue<T> {
  constructor (
    value: T,
    pending: boolean = false,
    error: ConvertibleToAsyncError = null,
  ) {
    super(value, pending, error);
    if (Number(isNotEmptyValue(this.value)) + Number(Boolean(this.pending)) + Number(Boolean(this.error)) > 1)
      throw Error('Only one of "value", "pending", "error" can be truthy, but got: ' + JSON.stringify({
        value,
        pending,
        error,
      }));
  }

  static errorOnly<T = any>(error: ConvertibleToAsyncError): AsyncValue<T> {
    return new AsyncValue<T>(null, false, error);
  }

  static pendingOnly<T = any>(): AsyncValue<T> {
    return new AsyncValue<T>(null, true);
  }

  static valueOnly<T = any>(value: T): AsyncValue<T> {
    return new AsyncValue<T>(value);
  }

  static createEmpty<T = any>(): MultiStateAsyncValue<T> {
    return new AsyncValue<T>(null);
  }

  get error(): AsyncError {
    return this._error;
  }

  set error(nextError: AsyncError) {
    // use parent class error setter to convert to string | Error to AsyncError
    super.error = nextError;
    super._pending = false;
    super._value = null;
  }

  get pending(): boolean {
    return this._pending;
  }

  set pending(nextPending: boolean) {
    super._pending = Boolean(nextPending);
    super._error = null;
    super._value = null;
  }

  get value(): T {
    return this._value;
  }

  set value(nextValue: T) {
    super._value = nextValue;
    super._error = null;
    super._pending = false;
  }

  setErrorFrom(nextError: ConvertibleToAsyncError) {
    super.setErrorFrom(nextError);
    super._pending = false;
    super._value = null;
  }

    /**
   * Clone methods
   */
  clone(): AsyncValue<T> {
    return new AsyncValue(this._value, this._pending, this._error);
  }
}
