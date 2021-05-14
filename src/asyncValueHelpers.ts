import { combineLatest, from, isObservable, merge, Observable, of } from "rxjs";
import { catchError, distinctUntilChanged, map, switchMap } from "rxjs/operators";
import isPromise from "is-promise";
import { AsyncValue } from "./AsyncValue";

/**
 * VoAV stands for "Value or AsyncValue".
 * i.e. VoAV<number> is used where both, number and AsyncValue<number> are acceptable
 */
export type VoAV<T> = T | AsyncValue<T>

/**
 * VoAV stands for "Value or AsyncValue".
 * PromiseLikeVoAV<T> is PromiseLike<VoAV<T>>
 * i.e. Promise<VoAV<number>> is used where both, PromiseLike<number> and PromiseLike<AsyncValue<number>> are acceptable
 */
export type PromiseLikeVoAV<T> = PromiseLike<VoAV<T>>

/**
 * VoAV stands for "Value or AsyncValue".
 * ObservableVoAV<T> is Observable<VoAV<T>>
 * i.e. Promise<VoAV<number>> is used where both, Observable<number> and Observable<AsyncValue<number>> are acceptable
 */
export type ObservableVoAV<T> = Observable<VoAV<T>>

/**
 * VoAV stands for "Value or AsyncValue".
 * AsyncLikeVoAV<T> = VoAV<T> | PromiseLikeVoAV<T>
 */
export type AsyncLikeVoAV<T> = VoAV<T> | ObservableVoAV<T> | ObservableVoAV<T>


/**
 * returns true when value is not of type AsyncValue 
 * or is an AsyncFalue and it is fulfilled
 */
export function isFulfilledOrSync(value): boolean {
  return !(value instanceof AsyncValue) || value.isFulfilled;
}

export function getSyncValue<T>(voAv: VoAV<T>): T {
  return voAv instanceof AsyncValue
    ? voAv.value
    : voAv;
}

/**
 * async values are equal if their errors are equal '==='
 * or their pendings are equal
 * or their values are equal '==='
 * 
 * if @compare function is provided, it
 * it will be used to compare value properites instead of ===
 */
export function compareAsyncValues<T>(
  a1: AsyncValue<T>,
  a2: AsyncValue<T>,
  compare?: (v1: T, v2: T) => boolean,
): boolean {
  return a1 === a2 ||
    (
      a1.pending === a2.pending
      && a1.error === a2.error
      && compare ? compare(a1.value, a2.value) : a1.value === a2.value
    );
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
export function promiseToAsyncValueStream<T>(
  promise: PromiseLike<T | AsyncValue<T>>
): Observable<AsyncValue<T>> {
  return merge(
    // emit pending AsyncValue right away
    of(AsyncValue.pendingOnly()),
    // emit successfull AsyncValue or error AsyncValue when promise resolves
    from(promise).pipe(
      map(value => convertToAsyncValue(value)),
      catchError(error => of(AsyncValue.errorOnly<T>(error))),
    )
  )
}

/**
 * this is an RXJS Operator
 * 
 * maps all stream elements of type T to AsyncValue<T>
 * if stream emits an error, AsyncValue.errorOnly(error) will be emitted
 */
export function mapToAsyncValue<T>(
): (source: Observable<VoAV<T>>) => Observable<AsyncValue<T>> {

  return function(source: Observable<T>) {
    return source.pipe(
      switchMap(value => {

        if (isObservable(value)) {
          return value.pipe(mapToAsyncValue<T>());
        }

        else if (isPromise(value)) {
          return promiseToAsyncValueStream<T>(value as any).pipe(mapToAsyncValue());
        }

        else {
         return of(convertToAsyncValue(value));
        }
      }),
      catchError(e => of(AsyncValue.errorOnly(e))),
    )
  }
}

/**
 * this is an RXJS Operator
 * 
 * prevents emitting of duplicate AsyncValues
 * async values are duplicates if their errors are equal '==='
 * or their pendings are equal
 * or their values are equal '==='
 * 
 * if @compare function is provided, it
 * it will be used to compare value properites instead of ===
 */
export function distinctAsyncValueUntilChanged<T>(
  compare?: (v1: T, v2: T) => boolean
) {
  return distinctUntilChanged((a1: AsyncValue<T>, a2: AsyncValue<T>) => compareAsyncValues(a1, a2, compare));
}

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
  transformFnOrResult: VoAV<R> | ((sourceValue: T, index?: number) => R),
  index?: number,
): AsyncValue<R> {

  if (source instanceof AsyncValue && source.error)
    return AsyncValue.errorOnly(source.error);

  if (source instanceof AsyncValue && source.pending)
    return AsyncValue.pendingOnly();

  return transformFnOrResult instanceof Function
      ? convertToAsyncValue(transformFnOrResult(source.value, index))
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
 * otherwise, when fulfilled, if @reducerOrResult is a function
 * @reducerOrResult(sources) will be returned
 * 
 * otherwise @reducerOrResult will be returned
 */
export function internalReduceAsyncValues<T, R>(
  sources: any[],
  reducerOrResult: ((sourceValues: T[]) => R) | AsyncValue<R> | R,
): AsyncValue<R> | R {

  for (const source of sources) {
    if (source instanceof AsyncValue && source.error) return AsyncValue.errorOnly(source.error);
  }

  for (const source of sources) {
    if (source instanceof AsyncValue && source.pending) return AsyncValue.pendingOnly();
  }

  return reducerOrResult instanceof Function
    ? reducerOrResult(sources.map(s => s instanceof AsyncValue ? s.value : s))
    : convertToAsyncValue(reducerOrResult);
}

/**
 * if any of @sources is an AsyncValue containing error,
 * let's call it sourceWithError,
 * sourceWithError will be returned
 * 
 * otherwise if any of @sources is an AsyncValue in pending state
 * new AsyncValue.pendingOnly() will be returned
 * 
 * otherwise, when fulfilled, if @reducerOrResult is a function
 * @reducerOrResult(sources), converted to AsyncValue if already not one, will be returned
 * 
 * otherwise @reducerOrResult, converted to AsyncValue if already not one, will be returned
 */
export function reduceAsyncValues<T, R>(
  sources: any[],
  reducerOrResult: ((sourceValues: T[]) => R) | VoAV<R>,
): AsyncValue<R> {

  return convertToAsyncValue(internalReduceAsyncValues(sources, reducerOrResult));
}

/**
 * this is an RXJS Operator
 */
export function mapToWhenFulfilled<T, R>(
  outputValue: VoAV<R>,
): (source: Observable<VoAV<T>>) => Observable<AsyncValue<R>> {

  return function(source: Observable<AsyncValue<T>>) {
    return source.pipe(
      map(value =>
        isFulfilledOrSync(value)
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
  transformFnOrResult: VoAV<R> | ((sourceValue: T, index?: number) => R)
): (source: Observable<AsyncValue<T>>) => Observable<AsyncValue<R>> {

  return function(source: Observable<AsyncValue<T>>) {
    return source.pipe(
      map((value, index) => transformWhenFulfilled(value, transformFnOrResult, index))
    );
  }
}


function internal_map_AsyncLike_to_Observable<T>(
  value: VoAV<T> | PromiseLikeVoAV<T> | ObservableVoAV<T>
): Observable<AsyncValue<T>> {

  // if an Observable
  if (isObservable(value)) {
    return value.pipe(mapToAsyncValue<T>());
  }

  // if a Promise
  else if (isPromise(value)) {
    return promiseToAsyncValueStream(value);
  }

  // if non-async
  else {
    return of(convertToAsyncValue(value))
  }
}

/**
 * this is an RXJS Operator
 * 
 * if @source is in error or pending state, clone of the AsyncValue will be emitted
 * 
 * otherwise if @transformFn is a Function
 * @transformFn (AsyncValue<fulfilled>) will became new inner observable
 * and every value it emits will be mapped to an AsyncValue
 */
export function switchMapWhenFulfilled<T, R>(
  transformFnOrValue:
    ((sourceValue: T) => VoAV<R> | PromiseLikeVoAV<R> | ObservableVoAV<R>)
    | VoAV<R> | PromiseLikeVoAV<R> | ObservableVoAV<R>
): (source: Observable<VoAV<T>>) => Observable<AsyncValue<R>> {

  return function(source: Observable<AsyncValue<T>>) {
    return source.pipe(
      switchMap(
        voAv => {

          // when one of the sources is not fulfilled yet
          if (!isFulfilledOrSync(voAv)) {
            return of(voAv.cloneWithNoValue() as unknown as AsyncValue<R>);
          }

          // when all sources are fulfilled,
          // combine their values into one
          // and return the value as a stream
          else {
            const syncValue = getSyncValue(voAv)
            const transformed = transformFnOrValue instanceof Function
              ? transformFnOrValue(syncValue)
              : transformFnOrValue;

            return internal_map_AsyncLike_to_Observable(transformed);
          }
        })
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
export function combineLatestWhenAllFulfilled<T extends any, R>(
  sources: Observable<VoAV<T>>[],
  combinerOrResult:
    ((sourceValues: T[]) => VoAV<R> | PromiseLikeVoAV<R> | ObservableVoAV<R>)
    | VoAV<R> | PromiseLikeVoAV<R> | ObservableVoAV<R>,
): Observable<AsyncValue<R>> {

  return combineLatest(sources)
    .pipe(
      switchMap((inputs) => {
        const result = internalCombineAsyncValues(inputs, combinerOrResult);
        if (typeof combinerOrResult === 'function') {
          // if combinerOrResult function returns a Promise
          if (isPromise(result)) {
            return promiseToAsyncValueStream(result);
          }
          // if combinerOrResult function returns an Observable
          if (result instanceof Observable) {
            return result.pipe(mapToAsyncValue<R>())
          }
        }
        // if combinerOrResult function returns an Observable
        else if (result instanceof Observable) {
          return result.pipe(mapToAsyncValue<R>())
        }
        // }
        return internal_map_AsyncLike_to_Observable(combined) as Observable<AsyncValue<R>>;
      })
    );
}

/**
 * this is an RXJS Operator
 */
export function transformWhenAllFulfilled<T, R>(
  transformFnOrResult: ((sourceValues: T[]) => R) | VoAV<R>,
): (sources: Observable<AsyncValue<T>>[]) => Observable<AsyncValue<R>> {

  return function(sources: Observable<AsyncValue<T>>[]) {
    return combineLatest(sources)
      .pipe(
        map((inputs) => reduceAsyncValues(inputs, transformFnOrResult))
      );
  }
}
