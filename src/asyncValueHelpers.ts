import { combineLatest, from, merge, Observable, of, ObservableInput, OperatorFunction, ObservedValueOf } from "rxjs";
import { catchError, distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { AsyncValue } from "./AsyncValue";


export const compareAsyncValues = <T>(v1: AsyncValue<T>, v2: AsyncValue<T>): boolean => {
  return v1.pending === v2.pending
    && v1.error === v2.error
    && v1.value === v2.value;
}

export function convertToAsyncValue<T>(value: T | AsyncValue<T>): AsyncValue<T> {
  return value instanceof AsyncValue
    ? value
    : AsyncValue.valueOnly(value);
}

/**
 * 
 * @returns Observable from promise
 * Observable will emit pending state right away
 * and AsyncValue<sucessfull> when promise resolves or AsyncValue<error> when Promise rejects
 * 
 * // marble diagram (p: Pending, v: Value, e: Error):
 * 'p---v' | 'p---e'
 */
export function promiseToAsyncValueStream <T>(
  promise: Promise<T>
): Observable<AsyncValue<T>> {
  return merge(
    // emit pending AsyncValue right away
    of(AsyncValue.pendingOnly()),
    // emit successfull AsyncValue or error AsyncValue when promise resolves
    from(promise).pipe(
      map(value => AsyncValue.valueOnly(value)),
      catchError(error => of(AsyncValue.errorOnly<T>(error))),
    )
  )
}

/**
 * maps all stream elements of type T to AsyncValue<T>
 * if stream emits an error, AsyncValue.errorOnly(error) will be emitted
 */
export function mapToAsyncValue<T>(
): (source: Observable<T>) => Observable<AsyncValue<T>> {

  return function(source: Observable<T>) {
    return source.pipe(
      map(value => convertToAsyncValue(value)),
      catchError(e => of(AsyncValue.errorOnly(e))),
    )
  }
}

export const distinctAsyncValueUntilChanged = () => distinctUntilChanged(compareAsyncValues);

/**
 * if @source is an AsyncValue containing error
 * it's clone will be returned
 * 
 * otherwise if @source is a pending AsyncValue
 * new AsyncValue.pendingOnly() will be returned
 * 
 * otherwise, when fulfilled, if @combinerOrResult is a function
 * @combinerOrResult(sources), converted to AsyncValue if already not one, will be returned
 * 
 * otherwise @combinerOrResult, converted to AsyncValue if already not one, will be returned
 */
function transformWhenFulfilled<T, R>(
  source: AsyncValue<T>,
  transformFnOrResult: AsyncValue<R> | R | ((sourceValue: T, index?: number) => R),
  index?: number,
): AsyncValue<R> {

  if (source instanceof AsyncValue && source.error)
    return AsyncValue.errorOnly(source.error);

  if (source instanceof AsyncValue && source.pending)
    return AsyncValue.pendingOnly();

  return typeof transformFnOrResult === 'function'
      ? convertToAsyncValue((transformFnOrResult as Function)(source.value, index))
      : convertToAsyncValue(transformFnOrResult);
}

/**
 * if any of @sources is an AsyncValue containing error,
 * let's call it sourceWithError,
 * sourceWithError will be returned
 * 
 * otherwise if any of @sources is an AsyncValue in pending state
 * new AsyncValue.pendingOnly() will be returned
 * 
 * otherwise, when fulfilled, if @combinerOrResult is a function
 * @combinerOrResult(sources) will be returned
 * 
 * otherwise @combinerOrResult will be returned
 */
export function internalCombineAsyncValues<T, R>(
  sources: any[],
  combinerOrResult: ((sourceValues: T[]) => R) | AsyncValue<R> | R,
): AsyncValue<R> | R {

  for (const source of sources) {
    if (source instanceof AsyncValue && source.error) return AsyncValue.errorOnly(source.error);
  }

  for (const source of sources) {
    if (source instanceof AsyncValue && source.pending) return AsyncValue.pendingOnly();
  }

  return typeof combinerOrResult === 'function'
    ? (combinerOrResult as Function)(sources.map(s => s instanceof AsyncValue ? s.value : s))
    : convertToAsyncValue(combinerOrResult);
}

/**
 * if any of @sources is an AsyncValue containing error,
 * let's call it sourceWithError,
 * sourceWithError will be returned
 * 
 * otherwise if any of @sources is an AsyncValue in pending state
 * new AsyncValue.pendingOnly() will be returned
 * 
 * otherwise, when fulfilled, if @combinerOrResult is a function
 * @combinerOrResult(sources), converted to AsyncValue if already not one, will be returned
 * 
 * otherwise @combinerOrResult, converted to AsyncValue if already not one, will be returned
 */
export function combineAsyncValues<T, R>(
  sources: any[],
  combinerOrResult: ((sourceValues: T[]) => R) | AsyncValue<R> | R,
): AsyncValue<R> {

  return convertToAsyncValue(internalCombineAsyncValues(sources, combinerOrResult));
}

/**
 * this is an RXJS Operator
 */
export function mapToWhenFulfilled<T, R>(
  outputValue: AsyncValue<R> | R,
): (source: Observable<AsyncValue<T>>) => Observable<AsyncValue<R>> {

  return function(source: Observable<AsyncValue<T>>) {
    return source.pipe(
      map(value =>
        value.isFulfilled
          ? outputValue instanceof AsyncValue
            ? outputValue
            : AsyncValue.valueOnly(outputValue)
          : value.cloneWithNoValue() as any
      )
    );
  }
}

/**
 * this is an RXJS Operator
 * 
 * if @source is an AsyncValue containing error
 * it's clone will be emitted
 * 
 * otherwise if @source is a pending AsyncValue
 * new AsyncValue.pendingOnly() will be emitted
 * 
 * otherwise, when fulfilled, if @transformFnOrResult is a function
 * @combinerOrResult(sources), converted to AsyncValue if already not one, will be emitted
 * 
 * otherwise @combinerOrResult, converted to AsyncValue if already not one, will be emitted
 */
export function mapWhenFulfilled<T, R>(
  transformFnOrResult: AsyncValue<R> | R | ((sourceValue: T, index?: number) => R)
): (source: Observable<AsyncValue<T>>) => Observable<AsyncValue<R>> {

  return function(source: Observable<AsyncValue<T>>) {
    return source.pipe(
      map((value, index) => transformWhenFulfilled(value, transformFnOrResult, index))
    );
  }
}

/**
 * this is an RXJS Operator
 */
export function switchMapWhenFulfilled<T, R>(
  transformFn: ((sourceValue: T) => Promise<ObservableInput<AsyncValue<R>>> | Observable<ObservableInput<AsyncValue<R>>>)
): (source: Observable<AsyncValue<T>>) => Observable<AsyncValue<R>> {

  return function(source: Observable<AsyncValue<T>>) {
    return source.pipe(
      switchMap(
        asyncValue =>
          asyncValue.isFulfilled
            ? from(transformFn(asyncValue.value))
            : of(asyncValue.cloneWithNoValue() as any)
      )
    );
  }
}

/**
 * if any of @sources emits AsyncValue containing error,
 * let's call it sourceWithError,
 * sourceWithError will be emitted
 * 
 * otherwise if any of @sources emits AsyncValue in pending state
 * new AsyncValue.pendingOnly() will be emitted
 * 
 * otherwise, when fulfilled, if @combinerOrResult is a function
 * @combinerOrResult(latestValues(sources)) will be called.
 * - if return values is a Promise outer stream will emit 2 values
 *   first AsyncValue.pendingOnly() and AsyncValue value or AsyncValue error
 *   once the promise is resolved
 * - if return values is an Observable,
 *   a derrived Observable will be returned
 *   which will wrap all element, not being of AsyncValue, with AsyncValue
 * 
 * otherwise @combinerOrResult, converted to AsyncValue if already not one,
 * will be emitted
 */
export function combineLatestWhenAllFulfilled<T, R>(
  sources: Observable<AsyncValue<T> | T>[],
  combinerOrResult: ((sourceValues: T[]) => R | PromiseLike<R> | Observable<R>) | AsyncValue<R> | R,
): Observable<AsyncValue<R>> {

  return combineLatest(sources)
    .pipe(
      switchMap((inputs) => {
        const result = internalCombineAsyncValues(inputs, combinerOrResult);
        if (typeof combinerOrResult === 'function') {
          // if combinerOrResult function returns a Promise
          if (typeof (result as any)?.then === 'function') {
            return promiseToAsyncValueStream(result as unknown as Promise<R>);
          }
          // if combinerOrResult function returns an Observable
          if (result instanceof Observable) {
            return result.pipe(mapToAsyncValue<R>())
          }
        }
        return of(convertToAsyncValue(result as R))
      })
    );
}

/**
 * this is an RXJS Operator
 */
export function transformWhenAllFulfilled<T, R>(
  transformFnOrResult: ((sourceValues: T[]) => R) | AsyncValue<R> | R,
): (sources: Observable<AsyncValue<T>>[]) => Observable<AsyncValue<R>> {

  return function(sources: Observable<AsyncValue<T>>[]) {
    return combineLatest(sources)
      .pipe(
        map((inputs) => combineAsyncValues(inputs, transformFnOrResult))
      );
  }
}
