import { from, merge, Observable, ObservableInput, ObservedValueOf, of, OperatorFunction } from "rxjs";
import { catchError, distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { AsyncValue, MultiStateAsyncValue } from "./AsyncValue";

/**
 * 
 * @returns Observable from promise
 * Observable will emit pending state right away
 * and AsyncValue<sucessfull> when promise resolves or AsyncValue<error> when Promise rejects
 * 
 * // marble diagram (p: Pending, v: Value, e: Error):
 * 'p---v' | 'p---e'
 */
export const promiseToAsyncValueStream = <T>(
  promise: Promise<T>
): Observable<MultiStateAsyncValue<T>> => {
  return merge(
    // emit pending AsyncValue right away
    of(AsyncValue.createPendingOnly()),
    // emit successfull AsyncValue or error AsyncValue when promise resolves
    from(promise).pipe(
      map(value => AsyncValue.createValueOnly(value)),
      catchError(error => of(AsyncValue.createErrorOnly<T>(error))),
    )
  )
}

export const compareAsyncValues = <T>(v1: AsyncValue<T>, v2: AsyncValue<T>): boolean => {
  return v1.pending === v2.pending
    && v1.error === v2.error
    && v1.value === v2.value;
}

export const distinctAsyncValueUntilChanged = () => distinctUntilChanged(compareAsyncValues);

export const combineErrorPending = <T, T1, T2>(
  v1: AsyncValue<T1>,
  v2: AsyncValue<T2>,
  fallback: AsyncValue<T>
): AsyncValue<T> => {
  return v1.error
    ? v1 as unknown as AsyncValue<T>
    : v2.error
      ? v2 as unknown as AsyncValue<T>
      : v1.pending
        ? v1 as unknown as AsyncValue<T>
        : v2.pending
          ? v2 as unknown as AsyncValue<T>
          : fallback;
}
