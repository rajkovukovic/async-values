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
    if (Number(isNotEmptyValue(super._value)) + Number(Boolean(super._pending)) + Number(Boolean(super._error)) > 1)
      throw Error('Only one of "value", "pending", "error" can be truthy, but got: ' + JSON.stringify({
        value,
        pending,
        error,
      }));
    console.log('AsyncValue.constructor');
    console.log(this.error);
  }

  static errorOnly<T>(error: ConvertibleToAsyncError): AsyncValue<T> {
    return new AsyncValue<T>(null, false, error);
  }

  static pendingOnly<T>(): AsyncValue<T> {
    return new AsyncValue<T>(null, true);
  }

  static valueOnly<T>(value: T): AsyncValue<T> {
    return new AsyncValue<T>(value);
  }

  get error(): AsyncError {
    return this._error;
  }

  set error(nextError: AsyncError) {
    super.error = nextError;
    if (super._pending) super._pending = false;
    if (isNotEmptyValue(super._value)) super._value = null;
  }

  get pending(): boolean {
    return this._pending;
  }

  set pending(nextPending: boolean) {
    super.pending = nextPending;
    if (super._error) super._error = null;
    if (isNotEmptyValue(super._value)) super._value = null;
  }

  get value(): T {
    return this._value;
  }

  set value(nextValue: T) {
    super.value = nextValue;
    if (super._pending) super._pending = false;
    if (super._error) super._error = null;
  }

    /**
   * Clone methods
   */
  clone(): AsyncValue<T> {
    return new AsyncValue(this._value, this._pending, this._error);
  }
}
