!(function (global, factory) {
	'object' == typeof exports && 'undefined' != typeof module
		? factory(exports)
		: 'function' == typeof define && define.amd
		? define(['exports'], factory)
		: factory(
				((global = 'undefined' != typeof globalThis ? globalThis : global || self)['async-values'] =
					{})
		  );
})(this, function (exports) {
	'use strict';
	const isEmptyValue = (value) => null == value,
		isNotEmptyValue = (value) => null != value;
	class AsyncError extends Error {
		constructor(message) {
			super(message), (this.name = 'AsyncError');
		}
		toString() {
			return this.message;
		}
		static from(error) {
			if (error instanceof AsyncError) return error;
			if (error instanceof Error) {
				const asyncError = new AsyncError(error.message);
				return (asyncError.stack = error.stack), asyncError;
			}
			return new AsyncError(String(error));
		}
	}
	class MultiStateAsyncValue {
		constructor(value = null, pending = !1, error = null) {
			(this._value = value ?? null),
				(this._pending = Boolean(pending)),
				(this._error = isEmptyValue(error) ? null : AsyncError.from(error)),
				this._error && MultiStateAsyncValue._handleError(this._error);
		}
		static _consoleErrorLogger(error) {
			console.error(error);
		}
		static logErrorsToConsole(shouldLog = !0) {
			MultiStateAsyncValue.errorHanlder = shouldLog
				? MultiStateAsyncValue._consoleErrorLogger
				: null;
		}
		static _handleError(error) {
			MultiStateAsyncValue._loggedErrors.has(error) ||
				(MultiStateAsyncValue._loggedErrors.add(error),
				MultiStateAsyncValue.errorHanlder?.call(null, error));
		}
		static errorOnly(error) {
			return new MultiStateAsyncValue(null, !1, error);
		}
		static pendingOnly() {
			return new MultiStateAsyncValue(null, !0);
		}
		static valueOnly(value) {
			return new MultiStateAsyncValue(value);
		}
		static createEmpty() {
			return new MultiStateAsyncValue();
		}
		get error() {
			return this._error;
		}
		set error(nextError) {
			this.setErrorFrom(nextError);
		}
		setErrorFrom(nextError) {
			(this._error = isEmptyValue(nextError) ? null : AsyncError.from(nextError)),
				this._error && MultiStateAsyncValue._handleError(this._error);
		}
		get pending() {
			return this._pending;
		}
		set pending(nextPending) {
			this._pending = Boolean(nextPending);
		}
		get value() {
			return this._value;
		}
		set value(nextValue) {
			this._value = nextValue ?? null;
		}
		clone() {
			return new MultiStateAsyncValue(this._value, this._pending, this._error);
		}
		cloneAndSetError(error) {
			const clone = this.clone();
			return clone.setErrorFrom(error), clone;
		}
		cloneWithNoError() {
			const clone = this.clone();
			return isNotEmptyValue(clone.error) && (clone.error = null), clone;
		}
		cloneAndSetPending(nextPending = !0) {
			const clone = this.clone();
			return (clone.pending = Boolean(nextPending)), clone;
		}
		cloneWithNoPending() {
			const clone = this.clone();
			return clone.pending && (clone.pending = !1), clone;
		}
		cloneAndSetValue(value) {
			const clone = this.clone();
			return (clone.value = value), clone;
		}
		cloneWithNoValue() {
			const clone = this.clone();
			return isNotEmptyValue(clone.value) && (clone.value = null), clone;
		}
		get isFulfilled() {
			return !this._pending && !this._error;
		}
		get hasValue() {
			return isNotEmptyValue(this._value);
		}
	}
	(MultiStateAsyncValue._loggedErrors = new Set()),
		(MultiStateAsyncValue.errorHanlder = MultiStateAsyncValue._consoleErrorLogger);
	class AsyncValue extends MultiStateAsyncValue {
		constructor(value, pending = !1, error = null) {
			if (
				(super(value, pending, error),
				Number(isNotEmptyValue(this.value)) +
					Number(Boolean(this.pending)) +
					Number(Boolean(this.error)) >
					1)
			)
				throw Error(
					'Only one of "value", "pending", "error" can be truthy, but got: ' +
						JSON.stringify({ value: value, pending: pending, error: error })
				);
		}
		static errorOnly(error) {
			return new AsyncValue(null, !1, error);
		}
		static pendingOnly() {
			return new AsyncValue(null, !0);
		}
		static valueOnly(value) {
			return new AsyncValue(value);
		}
		static createEmpty() {
			return new AsyncValue(null);
		}
		get error() {
			return this._error;
		}
		set error(nextError) {
			(super.error = nextError), (super._pending = !1), (super._value = null);
		}
		get pending() {
			return this._pending;
		}
		set pending(nextPending) {
			(super._pending = Boolean(nextPending)), (super._error = null), (super._value = null);
		}
		get value() {
			return this._value;
		}
		set value(nextValue) {
			(super._value = nextValue), (super._error = null), (super._pending = !1);
		}
		setErrorFrom(nextError) {
			super.setErrorFrom(nextError), (super._pending = !1), (super._value = null);
		}
		clone() {
			return new AsyncValue(this._value, this._pending, this._error);
		}
	}
	var extendStatics = function (d, b) {
		return (
			(extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function (d, b) {
						d.__proto__ = b;
					}) ||
				function (d, b) {
					for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
				}),
			extendStatics(d, b)
		);
	};
	function __extends(d, b) {
		function __() {
			this.constructor = d;
		}
		extendStatics(d, b),
			(d.prototype = null === b ? Object.create(b) : ((__.prototype = b.prototype), new __()));
	}
	function isFunction(x) {
		return 'function' == typeof x;
	}
	var _enable_super_gross_mode_that_will_cause_bad_things = !1,
		config = {
			Promise: void 0,
			set useDeprecatedSynchronousErrorHandling(value) {
				value && new Error().stack;
				_enable_super_gross_mode_that_will_cause_bad_things = value;
			},
			get useDeprecatedSynchronousErrorHandling() {
				return _enable_super_gross_mode_that_will_cause_bad_things;
			}
		};
	function hostReportError(err) {
		setTimeout(function () {
			throw err;
		}, 0);
	}
	var empty$2 = {
			closed: !0,
			next: function (value) {},
			error: function (err) {
				if (config.useDeprecatedSynchronousErrorHandling) throw err;
				hostReportError(err);
			},
			complete: function () {}
		},
		isArray = (function () {
			return (
				Array.isArray ||
				function (x) {
					return x && 'number' == typeof x.length;
				}
			);
		})();
	function isObject(x) {
		return null !== x && 'object' == typeof x;
	}
	var UnsubscriptionError = (function () {
			function UnsubscriptionErrorImpl(errors) {
				return (
					Error.call(this),
					(this.message = errors
						? errors.length +
						  ' errors occurred during unsubscription:\n' +
						  errors
								.map(function (err, i) {
									return i + 1 + ') ' + err.toString();
								})
								.join('\n  ')
						: ''),
					(this.name = 'UnsubscriptionError'),
					(this.errors = errors),
					this
				);
			}
			return (
				(UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype)),
				UnsubscriptionErrorImpl
			);
		})(),
		Subscription = (function () {
			function Subscription(unsubscribe) {
				(this.closed = !1),
					(this._parentOrParents = null),
					(this._subscriptions = null),
					unsubscribe && ((this._ctorUnsubscribe = !0), (this._unsubscribe = unsubscribe));
			}
			return (
				(Subscription.prototype.unsubscribe = function () {
					var errors;
					if (!this.closed) {
						var _parentOrParents = this._parentOrParents,
							_ctorUnsubscribe = this._ctorUnsubscribe,
							_unsubscribe = this._unsubscribe,
							_subscriptions = this._subscriptions;
						if (
							((this.closed = !0),
							(this._parentOrParents = null),
							(this._subscriptions = null),
							_parentOrParents instanceof Subscription)
						)
							_parentOrParents.remove(this);
						else if (null !== _parentOrParents)
							for (var index = 0; index < _parentOrParents.length; ++index) {
								_parentOrParents[index].remove(this);
							}
						if (isFunction(_unsubscribe)) {
							_ctorUnsubscribe && (this._unsubscribe = void 0);
							try {
								_unsubscribe.call(this);
							} catch (e) {
								errors =
									e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
							}
						}
						if (isArray(_subscriptions)) {
							index = -1;
							for (var len = _subscriptions.length; ++index < len; ) {
								var sub = _subscriptions[index];
								if (isObject(sub))
									try {
										sub.unsubscribe();
									} catch (e) {
										(errors = errors || []),
											e instanceof UnsubscriptionError
												? (errors = errors.concat(flattenUnsubscriptionErrors(e.errors)))
												: errors.push(e);
									}
							}
						}
						if (errors) throw new UnsubscriptionError(errors);
					}
				}),
				(Subscription.prototype.add = function (teardown) {
					var subscription = teardown;
					if (!teardown) return Subscription.EMPTY;
					switch (typeof teardown) {
						case 'function':
							subscription = new Subscription(teardown);
						case 'object':
							if (
								subscription === this ||
								subscription.closed ||
								'function' != typeof subscription.unsubscribe
							)
								return subscription;
							if (this.closed) return subscription.unsubscribe(), subscription;
							if (!(subscription instanceof Subscription)) {
								var tmp = subscription;
								(subscription = new Subscription())._subscriptions = [tmp];
							}
							break;
						default:
							throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
					}
					var _parentOrParents = subscription._parentOrParents;
					if (null === _parentOrParents) subscription._parentOrParents = this;
					else if (_parentOrParents instanceof Subscription) {
						if (_parentOrParents === this) return subscription;
						subscription._parentOrParents = [_parentOrParents, this];
					} else {
						if (-1 !== _parentOrParents.indexOf(this)) return subscription;
						_parentOrParents.push(this);
					}
					var subscriptions = this._subscriptions;
					return (
						null === subscriptions
							? (this._subscriptions = [subscription])
							: subscriptions.push(subscription),
						subscription
					);
				}),
				(Subscription.prototype.remove = function (subscription) {
					var subscriptions = this._subscriptions;
					if (subscriptions) {
						var subscriptionIndex = subscriptions.indexOf(subscription);
						-1 !== subscriptionIndex && subscriptions.splice(subscriptionIndex, 1);
					}
				}),
				(Subscription.EMPTY = (function (empty) {
					return (empty.closed = !0), empty;
				})(new Subscription())),
				Subscription
			);
		})();
	function flattenUnsubscriptionErrors(errors) {
		return errors.reduce(function (errs, err) {
			return errs.concat(err instanceof UnsubscriptionError ? err.errors : err);
		}, []);
	}
	var rxSubscriber = (function () {
			return 'function' == typeof Symbol
				? Symbol('rxSubscriber')
				: '@@rxSubscriber_' + Math.random();
		})(),
		Subscriber = (function (_super) {
			function Subscriber(destinationOrNext, error, complete) {
				var _this = _super.call(this) || this;
				switch (
					((_this.syncErrorValue = null),
					(_this.syncErrorThrown = !1),
					(_this.syncErrorThrowable = !1),
					(_this.isStopped = !1),
					arguments.length)
				) {
					case 0:
						_this.destination = empty$2;
						break;
					case 1:
						if (!destinationOrNext) {
							_this.destination = empty$2;
							break;
						}
						if ('object' == typeof destinationOrNext) {
							destinationOrNext instanceof Subscriber
								? ((_this.syncErrorThrowable = destinationOrNext.syncErrorThrowable),
								  (_this.destination = destinationOrNext),
								  destinationOrNext.add(_this))
								: ((_this.syncErrorThrowable = !0),
								  (_this.destination = new SafeSubscriber(_this, destinationOrNext)));
							break;
						}
					default:
						(_this.syncErrorThrowable = !0),
							(_this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete));
				}
				return _this;
			}
			return (
				__extends(Subscriber, _super),
				(Subscriber.prototype[rxSubscriber] = function () {
					return this;
				}),
				(Subscriber.create = function (next, error, complete) {
					var subscriber = new Subscriber(next, error, complete);
					return (subscriber.syncErrorThrowable = !1), subscriber;
				}),
				(Subscriber.prototype.next = function (value) {
					this.isStopped || this._next(value);
				}),
				(Subscriber.prototype.error = function (err) {
					this.isStopped || ((this.isStopped = !0), this._error(err));
				}),
				(Subscriber.prototype.complete = function () {
					this.isStopped || ((this.isStopped = !0), this._complete());
				}),
				(Subscriber.prototype.unsubscribe = function () {
					this.closed || ((this.isStopped = !0), _super.prototype.unsubscribe.call(this));
				}),
				(Subscriber.prototype._next = function (value) {
					this.destination.next(value);
				}),
				(Subscriber.prototype._error = function (err) {
					this.destination.error(err), this.unsubscribe();
				}),
				(Subscriber.prototype._complete = function () {
					this.destination.complete(), this.unsubscribe();
				}),
				(Subscriber.prototype._unsubscribeAndRecycle = function () {
					var _parentOrParents = this._parentOrParents;
					return (
						(this._parentOrParents = null),
						this.unsubscribe(),
						(this.closed = !1),
						(this.isStopped = !1),
						(this._parentOrParents = _parentOrParents),
						this
					);
				}),
				Subscriber
			);
		})(Subscription),
		SafeSubscriber = (function (_super) {
			function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
				var next,
					_this = _super.call(this) || this;
				_this._parentSubscriber = _parentSubscriber;
				var context = _this;
				return (
					isFunction(observerOrNext)
						? (next = observerOrNext)
						: observerOrNext &&
						  ((next = observerOrNext.next),
						  (error = observerOrNext.error),
						  (complete = observerOrNext.complete),
						  observerOrNext !== empty$2 &&
								(isFunction((context = Object.create(observerOrNext)).unsubscribe) &&
									_this.add(context.unsubscribe.bind(context)),
								(context.unsubscribe = _this.unsubscribe.bind(_this)))),
					(_this._context = context),
					(_this._next = next),
					(_this._error = error),
					(_this._complete = complete),
					_this
				);
			}
			return (
				__extends(SafeSubscriber, _super),
				(SafeSubscriber.prototype.next = function (value) {
					if (!this.isStopped && this._next) {
						var _parentSubscriber = this._parentSubscriber;
						config.useDeprecatedSynchronousErrorHandling && _parentSubscriber.syncErrorThrowable
							? this.__tryOrSetError(_parentSubscriber, this._next, value) && this.unsubscribe()
							: this.__tryOrUnsub(this._next, value);
					}
				}),
				(SafeSubscriber.prototype.error = function (err) {
					if (!this.isStopped) {
						var _parentSubscriber = this._parentSubscriber,
							useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
						if (this._error)
							useDeprecatedSynchronousErrorHandling && _parentSubscriber.syncErrorThrowable
								? (this.__tryOrSetError(_parentSubscriber, this._error, err), this.unsubscribe())
								: (this.__tryOrUnsub(this._error, err), this.unsubscribe());
						else if (_parentSubscriber.syncErrorThrowable)
							useDeprecatedSynchronousErrorHandling
								? ((_parentSubscriber.syncErrorValue = err),
								  (_parentSubscriber.syncErrorThrown = !0))
								: hostReportError(err),
								this.unsubscribe();
						else {
							if ((this.unsubscribe(), useDeprecatedSynchronousErrorHandling)) throw err;
							hostReportError(err);
						}
					}
				}),
				(SafeSubscriber.prototype.complete = function () {
					var _this = this;
					if (!this.isStopped) {
						var _parentSubscriber = this._parentSubscriber;
						if (this._complete) {
							var wrappedComplete = function () {
								return _this._complete.call(_this._context);
							};
							config.useDeprecatedSynchronousErrorHandling && _parentSubscriber.syncErrorThrowable
								? (this.__tryOrSetError(_parentSubscriber, wrappedComplete), this.unsubscribe())
								: (this.__tryOrUnsub(wrappedComplete), this.unsubscribe());
						} else this.unsubscribe();
					}
				}),
				(SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
					try {
						fn.call(this._context, value);
					} catch (err) {
						if ((this.unsubscribe(), config.useDeprecatedSynchronousErrorHandling)) throw err;
						hostReportError(err);
					}
				}),
				(SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
					if (!config.useDeprecatedSynchronousErrorHandling) throw new Error('bad call');
					try {
						fn.call(this._context, value);
					} catch (err) {
						return config.useDeprecatedSynchronousErrorHandling
							? ((parent.syncErrorValue = err), (parent.syncErrorThrown = !0), !0)
							: (hostReportError(err), !0);
					}
					return !1;
				}),
				(SafeSubscriber.prototype._unsubscribe = function () {
					var _parentSubscriber = this._parentSubscriber;
					(this._context = null), (this._parentSubscriber = null), _parentSubscriber.unsubscribe();
				}),
				SafeSubscriber
			);
		})(Subscriber);
	var observable = (function () {
		return ('function' == typeof Symbol && Symbol.observable) || '@@observable';
	})();
	function identity$1(x) {
		return x;
	}
	function pipeFromArray(fns) {
		return 0 === fns.length
			? identity$1
			: 1 === fns.length
			? fns[0]
			: function (input) {
					return fns.reduce(function (prev, fn) {
						return fn(prev);
					}, input);
			  };
	}
	var Observable = (function () {
		function Observable(subscribe) {
			(this._isScalar = !1), subscribe && (this._subscribe = subscribe);
		}
		return (
			(Observable.prototype.lift = function (operator) {
				var observable = new Observable();
				return (observable.source = this), (observable.operator = operator), observable;
			}),
			(Observable.prototype.subscribe = function (observerOrNext, error, complete) {
				var operator = this.operator,
					sink = (function (nextOrObserver, error, complete) {
						if (nextOrObserver) {
							if (nextOrObserver instanceof Subscriber) return nextOrObserver;
							if (nextOrObserver[rxSubscriber]) return nextOrObserver[rxSubscriber]();
						}
						return nextOrObserver || error || complete
							? new Subscriber(nextOrObserver, error, complete)
							: new Subscriber(empty$2);
					})(observerOrNext, error, complete);
				if (
					(operator
						? sink.add(operator.call(sink, this.source))
						: sink.add(
								this.source ||
									(config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable)
									? this._subscribe(sink)
									: this._trySubscribe(sink)
						  ),
					config.useDeprecatedSynchronousErrorHandling &&
						sink.syncErrorThrowable &&
						((sink.syncErrorThrowable = !1), sink.syncErrorThrown))
				)
					throw sink.syncErrorValue;
				return sink;
			}),
			(Observable.prototype._trySubscribe = function (sink) {
				try {
					return this._subscribe(sink);
				} catch (err) {
					config.useDeprecatedSynchronousErrorHandling &&
						((sink.syncErrorThrown = !0), (sink.syncErrorValue = err)),
						!(function (observer) {
							for (; observer; ) {
								var _a = observer,
									closed_1 = _a.closed,
									destination = _a.destination,
									isStopped = _a.isStopped;
								if (closed_1 || isStopped) return !1;
								observer = destination && destination instanceof Subscriber ? destination : null;
							}
							return !0;
						})(sink)
							? console.warn(err)
							: sink.error(err);
				}
			}),
			(Observable.prototype.forEach = function (next, promiseCtor) {
				var _this = this;
				return new (promiseCtor = getPromiseCtor(promiseCtor))(function (resolve, reject) {
					var subscription;
					subscription = _this.subscribe(
						function (value) {
							try {
								next(value);
							} catch (err) {
								reject(err), subscription && subscription.unsubscribe();
							}
						},
						reject,
						resolve
					);
				});
			}),
			(Observable.prototype._subscribe = function (subscriber) {
				var source = this.source;
				return source && source.subscribe(subscriber);
			}),
			(Observable.prototype[observable] = function () {
				return this;
			}),
			(Observable.prototype.pipe = function () {
				for (var operations = [], _i = 0; _i < arguments.length; _i++)
					operations[_i] = arguments[_i];
				return 0 === operations.length ? this : pipeFromArray(operations)(this);
			}),
			(Observable.prototype.toPromise = function (promiseCtor) {
				var _this = this;
				return new (promiseCtor = getPromiseCtor(promiseCtor))(function (resolve, reject) {
					var value;
					_this.subscribe(
						function (x) {
							return (value = x);
						},
						function (err) {
							return reject(err);
						},
						function () {
							return resolve(value);
						}
					);
				});
			}),
			(Observable.create = function (subscribe) {
				return new Observable(subscribe);
			}),
			Observable
		);
	})();
	function getPromiseCtor(promiseCtor) {
		if ((promiseCtor || (promiseCtor = config.Promise || Promise), !promiseCtor))
			throw new Error('no Promise impl found');
		return promiseCtor;
	}
	var ObjectUnsubscribedError = (function () {
			function ObjectUnsubscribedErrorImpl() {
				return (
					Error.call(this),
					(this.message = 'object unsubscribed'),
					(this.name = 'ObjectUnsubscribedError'),
					this
				);
			}
			return (
				(ObjectUnsubscribedErrorImpl.prototype = Object.create(Error.prototype)),
				ObjectUnsubscribedErrorImpl
			);
		})(),
		SubjectSubscription = (function (_super) {
			function SubjectSubscription(subject, subscriber) {
				var _this = _super.call(this) || this;
				return (
					(_this.subject = subject), (_this.subscriber = subscriber), (_this.closed = !1), _this
				);
			}
			return (
				__extends(SubjectSubscription, _super),
				(SubjectSubscription.prototype.unsubscribe = function () {
					if (!this.closed) {
						this.closed = !0;
						var subject = this.subject,
							observers = subject.observers;
						if (
							((this.subject = null),
							observers && 0 !== observers.length && !subject.isStopped && !subject.closed)
						) {
							var subscriberIndex = observers.indexOf(this.subscriber);
							-1 !== subscriberIndex && observers.splice(subscriberIndex, 1);
						}
					}
				}),
				SubjectSubscription
			);
		})(Subscription),
		SubjectSubscriber = (function (_super) {
			function SubjectSubscriber(destination) {
				var _this = _super.call(this, destination) || this;
				return (_this.destination = destination), _this;
			}
			return __extends(SubjectSubscriber, _super), SubjectSubscriber;
		})(Subscriber),
		Subject = (function (_super) {
			function Subject() {
				var _this = _super.call(this) || this;
				return (
					(_this.observers = []),
					(_this.closed = !1),
					(_this.isStopped = !1),
					(_this.hasError = !1),
					(_this.thrownError = null),
					_this
				);
			}
			return (
				__extends(Subject, _super),
				(Subject.prototype[rxSubscriber] = function () {
					return new SubjectSubscriber(this);
				}),
				(Subject.prototype.lift = function (operator) {
					var subject = new AnonymousSubject(this, this);
					return (subject.operator = operator), subject;
				}),
				(Subject.prototype.next = function (value) {
					if (this.closed) throw new ObjectUnsubscribedError();
					if (!this.isStopped)
						for (
							var observers = this.observers,
								len = observers.length,
								copy = observers.slice(),
								i = 0;
							i < len;
							i++
						)
							copy[i].next(value);
				}),
				(Subject.prototype.error = function (err) {
					if (this.closed) throw new ObjectUnsubscribedError();
					(this.hasError = !0), (this.thrownError = err), (this.isStopped = !0);
					for (
						var observers = this.observers, len = observers.length, copy = observers.slice(), i = 0;
						i < len;
						i++
					)
						copy[i].error(err);
					this.observers.length = 0;
				}),
				(Subject.prototype.complete = function () {
					if (this.closed) throw new ObjectUnsubscribedError();
					this.isStopped = !0;
					for (
						var observers = this.observers, len = observers.length, copy = observers.slice(), i = 0;
						i < len;
						i++
					)
						copy[i].complete();
					this.observers.length = 0;
				}),
				(Subject.prototype.unsubscribe = function () {
					(this.isStopped = !0), (this.closed = !0), (this.observers = null);
				}),
				(Subject.prototype._trySubscribe = function (subscriber) {
					if (this.closed) throw new ObjectUnsubscribedError();
					return _super.prototype._trySubscribe.call(this, subscriber);
				}),
				(Subject.prototype._subscribe = function (subscriber) {
					if (this.closed) throw new ObjectUnsubscribedError();
					return this.hasError
						? (subscriber.error(this.thrownError), Subscription.EMPTY)
						: this.isStopped
						? (subscriber.complete(), Subscription.EMPTY)
						: (this.observers.push(subscriber), new SubjectSubscription(this, subscriber));
				}),
				(Subject.prototype.asObservable = function () {
					var observable = new Observable();
					return (observable.source = this), observable;
				}),
				(Subject.create = function (destination, source) {
					return new AnonymousSubject(destination, source);
				}),
				Subject
			);
		})(Observable),
		AnonymousSubject = (function (_super) {
			function AnonymousSubject(destination, source) {
				var _this = _super.call(this) || this;
				return (_this.destination = destination), (_this.source = source), _this;
			}
			return (
				__extends(AnonymousSubject, _super),
				(AnonymousSubject.prototype.next = function (value) {
					var destination = this.destination;
					destination && destination.next && destination.next(value);
				}),
				(AnonymousSubject.prototype.error = function (err) {
					var destination = this.destination;
					destination && destination.error && this.destination.error(err);
				}),
				(AnonymousSubject.prototype.complete = function () {
					var destination = this.destination;
					destination && destination.complete && this.destination.complete();
				}),
				(AnonymousSubject.prototype._subscribe = function (subscriber) {
					return this.source ? this.source.subscribe(subscriber) : Subscription.EMPTY;
				}),
				AnonymousSubject
			);
		})(Subject),
		BehaviorSubject = (function (_super) {
			function BehaviorSubject(_value) {
				var _this = _super.call(this) || this;
				return (_this._value = _value), _this;
			}
			return (
				__extends(BehaviorSubject, _super),
				Object.defineProperty(BehaviorSubject.prototype, 'value', {
					get: function () {
						return this.getValue();
					},
					enumerable: !0,
					configurable: !0
				}),
				(BehaviorSubject.prototype._subscribe = function (subscriber) {
					var subscription = _super.prototype._subscribe.call(this, subscriber);
					return subscription && !subscription.closed && subscriber.next(this._value), subscription;
				}),
				(BehaviorSubject.prototype.getValue = function () {
					if (this.hasError) throw this.thrownError;
					if (this.closed) throw new ObjectUnsubscribedError();
					return this._value;
				}),
				(BehaviorSubject.prototype.next = function (value) {
					_super.prototype.next.call(this, (this._value = value));
				}),
				BehaviorSubject
			);
		})(Subject),
		AsyncAction = (function (_super) {
			function AsyncAction(scheduler, work) {
				var _this = _super.call(this, scheduler, work) || this;
				return (_this.scheduler = scheduler), (_this.work = work), (_this.pending = !1), _this;
			}
			return (
				__extends(AsyncAction, _super),
				(AsyncAction.prototype.schedule = function (state, delay) {
					if ((void 0 === delay && (delay = 0), this.closed)) return this;
					this.state = state;
					var id = this.id,
						scheduler = this.scheduler;
					return (
						null != id && (this.id = this.recycleAsyncId(scheduler, id, delay)),
						(this.pending = !0),
						(this.delay = delay),
						(this.id = this.id || this.requestAsyncId(scheduler, this.id, delay)),
						this
					);
				}),
				(AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
					return (
						void 0 === delay && (delay = 0),
						setInterval(scheduler.flush.bind(scheduler, this), delay)
					);
				}),
				(AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
					if (
						(void 0 === delay && (delay = 0),
						null !== delay && this.delay === delay && !1 === this.pending)
					)
						return id;
					clearInterval(id);
				}),
				(AsyncAction.prototype.execute = function (state, delay) {
					if (this.closed) return new Error('executing a cancelled action');
					this.pending = !1;
					var error = this._execute(state, delay);
					if (error) return error;
					!1 === this.pending &&
						null != this.id &&
						(this.id = this.recycleAsyncId(this.scheduler, this.id, null));
				}),
				(AsyncAction.prototype._execute = function (state, delay) {
					var errored = !1,
						errorValue = void 0;
					try {
						this.work(state);
					} catch (e) {
						(errored = !0), (errorValue = (!!e && e) || new Error(e));
					}
					if (errored) return this.unsubscribe(), errorValue;
				}),
				(AsyncAction.prototype._unsubscribe = function () {
					var id = this.id,
						scheduler = this.scheduler,
						actions = scheduler.actions,
						index = actions.indexOf(this);
					(this.work = null),
						(this.state = null),
						(this.pending = !1),
						(this.scheduler = null),
						-1 !== index && actions.splice(index, 1),
						null != id && (this.id = this.recycleAsyncId(scheduler, id, null)),
						(this.delay = null);
				}),
				AsyncAction
			);
		})(
			(function (_super) {
				function Action(scheduler, work) {
					return _super.call(this) || this;
				}
				return (
					__extends(Action, _super),
					(Action.prototype.schedule = function (state, delay) {
						return this;
					}),
					Action
				);
			})(Subscription)
		),
		QueueAction = (function (_super) {
			function QueueAction(scheduler, work) {
				var _this = _super.call(this, scheduler, work) || this;
				return (_this.scheduler = scheduler), (_this.work = work), _this;
			}
			return (
				__extends(QueueAction, _super),
				(QueueAction.prototype.schedule = function (state, delay) {
					return (
						void 0 === delay && (delay = 0),
						delay > 0
							? _super.prototype.schedule.call(this, state, delay)
							: ((this.delay = delay), (this.state = state), this.scheduler.flush(this), this)
					);
				}),
				(QueueAction.prototype.execute = function (state, delay) {
					return delay > 0 || this.closed
						? _super.prototype.execute.call(this, state, delay)
						: this._execute(state, delay);
				}),
				(QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
					return (
						void 0 === delay && (delay = 0),
						(null !== delay && delay > 0) || (null === delay && this.delay > 0)
							? _super.prototype.requestAsyncId.call(this, scheduler, id, delay)
							: scheduler.flush(this)
					);
				}),
				QueueAction
			);
		})(AsyncAction),
		Scheduler = (function () {
			function Scheduler(SchedulerAction, now) {
				void 0 === now && (now = Scheduler.now),
					(this.SchedulerAction = SchedulerAction),
					(this.now = now);
			}
			return (
				(Scheduler.prototype.schedule = function (work, delay, state) {
					return (
						void 0 === delay && (delay = 0),
						new this.SchedulerAction(this, work).schedule(state, delay)
					);
				}),
				(Scheduler.now = function () {
					return Date.now();
				}),
				Scheduler
			);
		})(),
		AsyncScheduler = (function (_super) {
			function AsyncScheduler(SchedulerAction, now) {
				void 0 === now && (now = Scheduler.now);
				var _this =
					_super.call(this, SchedulerAction, function () {
						return AsyncScheduler.delegate && AsyncScheduler.delegate !== _this
							? AsyncScheduler.delegate.now()
							: now();
					}) || this;
				return (_this.actions = []), (_this.active = !1), (_this.scheduled = void 0), _this;
			}
			return (
				__extends(AsyncScheduler, _super),
				(AsyncScheduler.prototype.schedule = function (work, delay, state) {
					return (
						void 0 === delay && (delay = 0),
						AsyncScheduler.delegate && AsyncScheduler.delegate !== this
							? AsyncScheduler.delegate.schedule(work, delay, state)
							: _super.prototype.schedule.call(this, work, delay, state)
					);
				}),
				(AsyncScheduler.prototype.flush = function (action) {
					var actions = this.actions;
					if (this.active) actions.push(action);
					else {
						var error;
						this.active = !0;
						do {
							if ((error = action.execute(action.state, action.delay))) break;
						} while ((action = actions.shift()));
						if (((this.active = !1), error)) {
							for (; (action = actions.shift()); ) action.unsubscribe();
							throw error;
						}
					}
				}),
				AsyncScheduler
			);
		})(Scheduler),
		QueueScheduler = (function (_super) {
			function QueueScheduler() {
				return (null !== _super && _super.apply(this, arguments)) || this;
			}
			return __extends(QueueScheduler, _super), QueueScheduler;
		})(AsyncScheduler),
		queue = new QueueScheduler(QueueAction),
		EMPTY = new Observable(function (subscriber) {
			return subscriber.complete();
		});
	function empty$1(scheduler) {
		return scheduler
			? (function (scheduler) {
					return new Observable(function (subscriber) {
						return scheduler.schedule(function () {
							return subscriber.complete();
						});
					});
			  })(scheduler)
			: EMPTY;
	}
	function isScheduler(value) {
		return value && 'function' == typeof value.schedule;
	}
	var subscribeToArray = function (array) {
		return function (subscriber) {
			for (var i = 0, len = array.length; i < len && !subscriber.closed; i++)
				subscriber.next(array[i]);
			subscriber.complete();
		};
	};
	function scheduleArray(input, scheduler) {
		return new Observable(function (subscriber) {
			var sub = new Subscription(),
				i = 0;
			return (
				sub.add(
					scheduler.schedule(function () {
						i !== input.length
							? (subscriber.next(input[i++]), subscriber.closed || sub.add(this.schedule()))
							: subscriber.complete();
					})
				),
				sub
			);
		});
	}
	function fromArray(input, scheduler) {
		return scheduler ? scheduleArray(input, scheduler) : new Observable(subscribeToArray(input));
	}
	function of() {
		for (var args = [], _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
		var scheduler = args[args.length - 1];
		return isScheduler(scheduler) ? (args.pop(), scheduleArray(args, scheduler)) : fromArray(args);
	}
	function dispatch$2(_a) {
		var error = _a.error;
		_a.subscriber.error(error);
	}
	var Notification = (function () {
			function Notification(kind, value, error) {
				(this.kind = kind),
					(this.value = value),
					(this.error = error),
					(this.hasValue = 'N' === kind);
			}
			return (
				(Notification.prototype.observe = function (observer) {
					switch (this.kind) {
						case 'N':
							return observer.next && observer.next(this.value);
						case 'E':
							return observer.error && observer.error(this.error);
						case 'C':
							return observer.complete && observer.complete();
					}
				}),
				(Notification.prototype.do = function (next, error, complete) {
					switch (this.kind) {
						case 'N':
							return next && next(this.value);
						case 'E':
							return error && error(this.error);
						case 'C':
							return complete && complete();
					}
				}),
				(Notification.prototype.accept = function (nextOrObserver, error, complete) {
					return nextOrObserver && 'function' == typeof nextOrObserver.next
						? this.observe(nextOrObserver)
						: this.do(nextOrObserver, error, complete);
				}),
				(Notification.prototype.toObservable = function () {
					var error, scheduler;
					switch (this.kind) {
						case 'N':
							return of(this.value);
						case 'E':
							return (
								(error = this.error),
								new Observable(
									scheduler
										? function (subscriber) {
												return scheduler.schedule(dispatch$2, 0, {
													error: error,
													subscriber: subscriber
												});
										  }
										: function (subscriber) {
												return subscriber.error(error);
										  }
								)
							);
						case 'C':
							return empty$1();
					}
					throw new Error('unexpected notification kind value');
				}),
				(Notification.createNext = function (value) {
					return void 0 !== value
						? new Notification('N', value)
						: Notification.undefinedValueNotification;
				}),
				(Notification.createError = function (err) {
					return new Notification('E', void 0, err);
				}),
				(Notification.createComplete = function () {
					return Notification.completeNotification;
				}),
				(Notification.completeNotification = new Notification('C')),
				(Notification.undefinedValueNotification = new Notification('N', void 0)),
				Notification
			);
		})(),
		ObserveOnSubscriber = (function (_super) {
			function ObserveOnSubscriber(destination, scheduler, delay) {
				void 0 === delay && (delay = 0);
				var _this = _super.call(this, destination) || this;
				return (_this.scheduler = scheduler), (_this.delay = delay), _this;
			}
			return (
				__extends(ObserveOnSubscriber, _super),
				(ObserveOnSubscriber.dispatch = function (arg) {
					var notification = arg.notification,
						destination = arg.destination;
					notification.observe(destination), this.unsubscribe();
				}),
				(ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
					this.destination.add(
						this.scheduler.schedule(
							ObserveOnSubscriber.dispatch,
							this.delay,
							new ObserveOnMessage(notification, this.destination)
						)
					);
				}),
				(ObserveOnSubscriber.prototype._next = function (value) {
					this.scheduleMessage(Notification.createNext(value));
				}),
				(ObserveOnSubscriber.prototype._error = function (err) {
					this.scheduleMessage(Notification.createError(err)), this.unsubscribe();
				}),
				(ObserveOnSubscriber.prototype._complete = function () {
					this.scheduleMessage(Notification.createComplete()), this.unsubscribe();
				}),
				ObserveOnSubscriber
			);
		})(Subscriber),
		ObserveOnMessage = (function () {
			return function (notification, destination) {
				(this.notification = notification), (this.destination = destination);
			};
		})(),
		ReplaySubject = (function (_super) {
			function ReplaySubject(bufferSize, windowTime, scheduler) {
				void 0 === bufferSize && (bufferSize = Number.POSITIVE_INFINITY),
					void 0 === windowTime && (windowTime = Number.POSITIVE_INFINITY);
				var _this = _super.call(this) || this;
				return (
					(_this.scheduler = scheduler),
					(_this._events = []),
					(_this._infiniteTimeWindow = !1),
					(_this._bufferSize = bufferSize < 1 ? 1 : bufferSize),
					(_this._windowTime = windowTime < 1 ? 1 : windowTime),
					windowTime === Number.POSITIVE_INFINITY
						? ((_this._infiniteTimeWindow = !0), (_this.next = _this.nextInfiniteTimeWindow))
						: (_this.next = _this.nextTimeWindow),
					_this
				);
			}
			return (
				__extends(ReplaySubject, _super),
				(ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
					if (!this.isStopped) {
						var _events = this._events;
						_events.push(value), _events.length > this._bufferSize && _events.shift();
					}
					_super.prototype.next.call(this, value);
				}),
				(ReplaySubject.prototype.nextTimeWindow = function (value) {
					this.isStopped ||
						(this._events.push(new ReplayEvent(this._getNow(), value)),
						this._trimBufferThenGetEvents()),
						_super.prototype.next.call(this, value);
				}),
				(ReplaySubject.prototype._subscribe = function (subscriber) {
					var subscription,
						_infiniteTimeWindow = this._infiniteTimeWindow,
						_events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents(),
						scheduler = this.scheduler,
						len = _events.length;
					if (this.closed) throw new ObjectUnsubscribedError();
					if (
						(this.isStopped || this.hasError
							? (subscription = Subscription.EMPTY)
							: (this.observers.push(subscriber),
							  (subscription = new SubjectSubscription(this, subscriber))),
						scheduler &&
							subscriber.add((subscriber = new ObserveOnSubscriber(subscriber, scheduler))),
						_infiniteTimeWindow)
					)
						for (var i = 0; i < len && !subscriber.closed; i++) subscriber.next(_events[i]);
					else for (i = 0; i < len && !subscriber.closed; i++) subscriber.next(_events[i].value);
					return (
						this.hasError
							? subscriber.error(this.thrownError)
							: this.isStopped && subscriber.complete(),
						subscription
					);
				}),
				(ReplaySubject.prototype._getNow = function () {
					return (this.scheduler || queue).now();
				}),
				(ReplaySubject.prototype._trimBufferThenGetEvents = function () {
					for (
						var now = this._getNow(),
							_bufferSize = this._bufferSize,
							_windowTime = this._windowTime,
							_events = this._events,
							eventsCount = _events.length,
							spliceCount = 0;
						spliceCount < eventsCount && !(now - _events[spliceCount].time < _windowTime);

					)
						spliceCount++;
					return (
						eventsCount > _bufferSize &&
							(spliceCount = Math.max(spliceCount, eventsCount - _bufferSize)),
						spliceCount > 0 && _events.splice(0, spliceCount),
						_events
					);
				}),
				ReplaySubject
			);
		})(Subject),
		ReplayEvent = (function () {
			return function (time, value) {
				(this.time = time), (this.value = value);
			};
		})(),
		asyncScheduler = new AsyncScheduler(AsyncAction),
		async = asyncScheduler;
	function noop$1() {}
	function isObservable(obj) {
		return (
			!!obj &&
			(obj instanceof Observable ||
				('function' == typeof obj.lift && 'function' == typeof obj.subscribe))
		);
	}
	var ArgumentOutOfRangeError = (function () {
		function ArgumentOutOfRangeErrorImpl() {
			return (
				Error.call(this),
				(this.message = 'argument out of range'),
				(this.name = 'ArgumentOutOfRangeError'),
				this
			);
		}
		return (
			(ArgumentOutOfRangeErrorImpl.prototype = Object.create(Error.prototype)),
			ArgumentOutOfRangeErrorImpl
		);
	})();
	function map(project, thisArg) {
		return function (source) {
			if ('function' != typeof project)
				throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
			return source.lift(new MapOperator(project, thisArg));
		};
	}
	var MapOperator = (function () {
			function MapOperator(project, thisArg) {
				(this.project = project), (this.thisArg = thisArg);
			}
			return (
				(MapOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
				}),
				MapOperator
			);
		})(),
		MapSubscriber = (function (_super) {
			function MapSubscriber(destination, project, thisArg) {
				var _this = _super.call(this, destination) || this;
				return (
					(_this.project = project), (_this.count = 0), (_this.thisArg = thisArg || _this), _this
				);
			}
			return (
				__extends(MapSubscriber, _super),
				(MapSubscriber.prototype._next = function (value) {
					var result;
					try {
						result = this.project.call(this.thisArg, value, this.count++);
					} catch (err) {
						return void this.destination.error(err);
					}
					this.destination.next(result);
				}),
				MapSubscriber
			);
		})(Subscriber),
		OuterSubscriber = (function (_super) {
			function OuterSubscriber() {
				return (null !== _super && _super.apply(this, arguments)) || this;
			}
			return (
				__extends(OuterSubscriber, _super),
				(OuterSubscriber.prototype.notifyNext = function (
					outerValue,
					innerValue,
					outerIndex,
					innerIndex,
					innerSub
				) {
					this.destination.next(innerValue);
				}),
				(OuterSubscriber.prototype.notifyError = function (error, innerSub) {
					this.destination.error(error);
				}),
				(OuterSubscriber.prototype.notifyComplete = function (innerSub) {
					this.destination.complete();
				}),
				OuterSubscriber
			);
		})(Subscriber),
		InnerSubscriber = (function (_super) {
			function InnerSubscriber(parent, outerValue, outerIndex) {
				var _this = _super.call(this) || this;
				return (
					(_this.parent = parent),
					(_this.outerValue = outerValue),
					(_this.outerIndex = outerIndex),
					(_this.index = 0),
					_this
				);
			}
			return (
				__extends(InnerSubscriber, _super),
				(InnerSubscriber.prototype._next = function (value) {
					this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
				}),
				(InnerSubscriber.prototype._error = function (error) {
					this.parent.notifyError(error, this), this.unsubscribe();
				}),
				(InnerSubscriber.prototype._complete = function () {
					this.parent.notifyComplete(this), this.unsubscribe();
				}),
				InnerSubscriber
			);
		})(Subscriber);
	function getSymbolIterator() {
		return 'function' == typeof Symbol && Symbol.iterator ? Symbol.iterator : '@@iterator';
	}
	var iterator = getSymbolIterator(),
		isArrayLike = function (x) {
			return x && 'number' == typeof x.length && 'function' != typeof x;
		};
	function isPromise$1(value) {
		return !!value && 'function' != typeof value.subscribe && 'function' == typeof value.then;
	}
	var subscribeTo = function (result) {
		if (result && 'function' == typeof result[observable])
			return (
				(obj = result),
				function (subscriber) {
					var obs = obj[observable]();
					if ('function' != typeof obs.subscribe)
						throw new TypeError('Provided object does not correctly implement Symbol.observable');
					return obs.subscribe(subscriber);
				}
			);
		if (isArrayLike(result)) return subscribeToArray(result);
		if (isPromise$1(result))
			return (function (promise) {
				return function (subscriber) {
					return (
						promise
							.then(
								function (value) {
									subscriber.closed || (subscriber.next(value), subscriber.complete());
								},
								function (err) {
									return subscriber.error(err);
								}
							)
							.then(null, hostReportError),
						subscriber
					);
				};
			})(result);
		if (result && 'function' == typeof result[iterator])
			return (
				(iterable = result),
				function (subscriber) {
					for (var iterator$1 = iterable[iterator](); ; ) {
						var item = void 0;
						try {
							item = iterator$1.next();
						} catch (err) {
							return subscriber.error(err), subscriber;
						}
						if (item.done) {
							subscriber.complete();
							break;
						}
						if ((subscriber.next(item.value), subscriber.closed)) break;
					}
					return (
						'function' == typeof iterator$1.return &&
							subscriber.add(function () {
								iterator$1.return && iterator$1.return();
							}),
						subscriber
					);
				}
			);
		var iterable,
			obj,
			value = isObject(result) ? 'an invalid object' : "'" + result + "'";
		throw new TypeError(
			'You provided ' +
				value +
				' where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.'
		);
	};
	function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
		if (
			(void 0 === innerSubscriber &&
				(innerSubscriber = new InnerSubscriber(outerSubscriber, outerValue, outerIndex)),
			!innerSubscriber.closed)
		)
			return result instanceof Observable
				? result.subscribe(innerSubscriber)
				: subscribeTo(result)(innerSubscriber);
	}
	var NONE = {};
	function combineLatest() {
		for (var observables = [], _i = 0; _i < arguments.length; _i++) observables[_i] = arguments[_i];
		var resultSelector = void 0,
			scheduler = void 0;
		return (
			isScheduler(observables[observables.length - 1]) && (scheduler = observables.pop()),
			'function' == typeof observables[observables.length - 1] &&
				(resultSelector = observables.pop()),
			1 === observables.length && isArray(observables[0]) && (observables = observables[0]),
			fromArray(observables, scheduler).lift(new CombineLatestOperator(resultSelector))
		);
	}
	var CombineLatestOperator = (function () {
			function CombineLatestOperator(resultSelector) {
				this.resultSelector = resultSelector;
			}
			return (
				(CombineLatestOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
				}),
				CombineLatestOperator
			);
		})(),
		CombineLatestSubscriber = (function (_super) {
			function CombineLatestSubscriber(destination, resultSelector) {
				var _this = _super.call(this, destination) || this;
				return (
					(_this.resultSelector = resultSelector),
					(_this.active = 0),
					(_this.values = []),
					(_this.observables = []),
					_this
				);
			}
			return (
				__extends(CombineLatestSubscriber, _super),
				(CombineLatestSubscriber.prototype._next = function (observable) {
					this.values.push(NONE), this.observables.push(observable);
				}),
				(CombineLatestSubscriber.prototype._complete = function () {
					var observables = this.observables,
						len = observables.length;
					if (0 === len) this.destination.complete();
					else {
						(this.active = len), (this.toRespond = len);
						for (var i = 0; i < len; i++) {
							var observable = observables[i];
							this.add(subscribeToResult(this, observable, void 0, i));
						}
					}
				}),
				(CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
					0 == (this.active -= 1) && this.destination.complete();
				}),
				(CombineLatestSubscriber.prototype.notifyNext = function (
					_outerValue,
					innerValue,
					outerIndex
				) {
					var values = this.values,
						oldVal = values[outerIndex],
						toRespond = this.toRespond ? (oldVal === NONE ? --this.toRespond : this.toRespond) : 0;
					(values[outerIndex] = innerValue),
						0 === toRespond &&
							(this.resultSelector
								? this._tryResultSelector(values)
								: this.destination.next(values.slice()));
				}),
				(CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
					var result;
					try {
						result = this.resultSelector.apply(this, values);
					} catch (err) {
						return void this.destination.error(err);
					}
					this.destination.next(result);
				}),
				CombineLatestSubscriber
			);
		})(OuterSubscriber);
	function scheduled(input, scheduler) {
		if (null != input) {
			if (
				(function (input) {
					return input && 'function' == typeof input[observable];
				})(input)
			)
				return (function (input, scheduler) {
					return new Observable(function (subscriber) {
						var sub = new Subscription();
						return (
							sub.add(
								scheduler.schedule(function () {
									var observable$1 = input[observable]();
									sub.add(
										observable$1.subscribe({
											next: function (value) {
												sub.add(
													scheduler.schedule(function () {
														return subscriber.next(value);
													})
												);
											},
											error: function (err) {
												sub.add(
													scheduler.schedule(function () {
														return subscriber.error(err);
													})
												);
											},
											complete: function () {
												sub.add(
													scheduler.schedule(function () {
														return subscriber.complete();
													})
												);
											}
										})
									);
								})
							),
							sub
						);
					});
				})(input, scheduler);
			if (isPromise$1(input))
				return (function (input, scheduler) {
					return new Observable(function (subscriber) {
						var sub = new Subscription();
						return (
							sub.add(
								scheduler.schedule(function () {
									return input.then(
										function (value) {
											sub.add(
												scheduler.schedule(function () {
													subscriber.next(value),
														sub.add(
															scheduler.schedule(function () {
																return subscriber.complete();
															})
														);
												})
											);
										},
										function (err) {
											sub.add(
												scheduler.schedule(function () {
													return subscriber.error(err);
												})
											);
										}
									);
								})
							),
							sub
						);
					});
				})(input, scheduler);
			if (isArrayLike(input)) return scheduleArray(input, scheduler);
			if (
				(function (input) {
					return input && 'function' == typeof input[iterator];
				})(input) ||
				'string' == typeof input
			)
				return (function (input, scheduler) {
					if (!input) throw new Error('Iterable cannot be null');
					return new Observable(function (subscriber) {
						var iterator$1,
							sub = new Subscription();
						return (
							sub.add(function () {
								iterator$1 && 'function' == typeof iterator$1.return && iterator$1.return();
							}),
							sub.add(
								scheduler.schedule(function () {
									(iterator$1 = input[iterator]()),
										sub.add(
											scheduler.schedule(function () {
												if (!subscriber.closed) {
													var value, done;
													try {
														var result = iterator$1.next();
														(value = result.value), (done = result.done);
													} catch (err) {
														return void subscriber.error(err);
													}
													done ? subscriber.complete() : (subscriber.next(value), this.schedule());
												}
											})
										);
								})
							),
							sub
						);
					});
				})(input, scheduler);
		}
		throw new TypeError(((null !== input && typeof input) || input) + ' is not observable');
	}
	function from(input, scheduler) {
		return scheduler
			? scheduled(input, scheduler)
			: input instanceof Observable
			? input
			: new Observable(subscribeTo(input));
	}
	var SimpleInnerSubscriber = (function (_super) {
			function SimpleInnerSubscriber(parent) {
				var _this = _super.call(this) || this;
				return (_this.parent = parent), _this;
			}
			return (
				__extends(SimpleInnerSubscriber, _super),
				(SimpleInnerSubscriber.prototype._next = function (value) {
					this.parent.notifyNext(value);
				}),
				(SimpleInnerSubscriber.prototype._error = function (error) {
					this.parent.notifyError(error), this.unsubscribe();
				}),
				(SimpleInnerSubscriber.prototype._complete = function () {
					this.parent.notifyComplete(), this.unsubscribe();
				}),
				SimpleInnerSubscriber
			);
		})(Subscriber),
		SimpleOuterSubscriber = (function (_super) {
			function SimpleOuterSubscriber() {
				return (null !== _super && _super.apply(this, arguments)) || this;
			}
			return (
				__extends(SimpleOuterSubscriber, _super),
				(SimpleOuterSubscriber.prototype.notifyNext = function (innerValue) {
					this.destination.next(innerValue);
				}),
				(SimpleOuterSubscriber.prototype.notifyError = function (err) {
					this.destination.error(err);
				}),
				(SimpleOuterSubscriber.prototype.notifyComplete = function () {
					this.destination.complete();
				}),
				SimpleOuterSubscriber
			);
		})(Subscriber);
	function innerSubscribe(result, innerSubscriber) {
		if (!innerSubscriber.closed) {
			if (result instanceof Observable) return result.subscribe(innerSubscriber);
			var subscription;
			try {
				subscription = subscribeTo(result)(innerSubscriber);
			} catch (error) {
				innerSubscriber.error(error);
			}
			return subscription;
		}
	}
	function mergeMap(project, resultSelector, concurrent) {
		return (
			void 0 === concurrent && (concurrent = Number.POSITIVE_INFINITY),
			'function' == typeof resultSelector
				? function (source) {
						return source.pipe(
							mergeMap(function (a, i) {
								return from(project(a, i)).pipe(
									map(function (b, ii) {
										return resultSelector(a, b, i, ii);
									})
								);
							}, concurrent)
						);
				  }
				: ('number' == typeof resultSelector && (concurrent = resultSelector),
				  function (source) {
						return source.lift(new MergeMapOperator(project, concurrent));
				  })
		);
	}
	var MergeMapOperator = (function () {
			function MergeMapOperator(project, concurrent) {
				void 0 === concurrent && (concurrent = Number.POSITIVE_INFINITY),
					(this.project = project),
					(this.concurrent = concurrent);
			}
			return (
				(MergeMapOperator.prototype.call = function (observer, source) {
					return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
				}),
				MergeMapOperator
			);
		})(),
		MergeMapSubscriber = (function (_super) {
			function MergeMapSubscriber(destination, project, concurrent) {
				void 0 === concurrent && (concurrent = Number.POSITIVE_INFINITY);
				var _this = _super.call(this, destination) || this;
				return (
					(_this.project = project),
					(_this.concurrent = concurrent),
					(_this.hasCompleted = !1),
					(_this.buffer = []),
					(_this.active = 0),
					(_this.index = 0),
					_this
				);
			}
			return (
				__extends(MergeMapSubscriber, _super),
				(MergeMapSubscriber.prototype._next = function (value) {
					this.active < this.concurrent ? this._tryNext(value) : this.buffer.push(value);
				}),
				(MergeMapSubscriber.prototype._tryNext = function (value) {
					var result,
						index = this.index++;
					try {
						result = this.project(value, index);
					} catch (err) {
						return void this.destination.error(err);
					}
					this.active++, this._innerSub(result);
				}),
				(MergeMapSubscriber.prototype._innerSub = function (ish) {
					var innerSubscriber = new SimpleInnerSubscriber(this),
						destination = this.destination;
					destination.add(innerSubscriber);
					var innerSubscription = innerSubscribe(ish, innerSubscriber);
					innerSubscription !== innerSubscriber && destination.add(innerSubscription);
				}),
				(MergeMapSubscriber.prototype._complete = function () {
					(this.hasCompleted = !0),
						0 === this.active && 0 === this.buffer.length && this.destination.complete(),
						this.unsubscribe();
				}),
				(MergeMapSubscriber.prototype.notifyNext = function (innerValue) {
					this.destination.next(innerValue);
				}),
				(MergeMapSubscriber.prototype.notifyComplete = function () {
					var buffer = this.buffer;
					this.active--,
						buffer.length > 0
							? this._next(buffer.shift())
							: 0 === this.active && this.hasCompleted && this.destination.complete();
				}),
				MergeMapSubscriber
			);
		})(SimpleOuterSubscriber);
	function mergeAll(concurrent) {
		return (
			void 0 === concurrent && (concurrent = Number.POSITIVE_INFINITY),
			mergeMap(identity$1, concurrent)
		);
	}
	function interval(period, scheduler) {
		var val;
		return (
			void 0 === period && (period = 0),
			void 0 === scheduler && (scheduler = async),
			(isArray((val = period)) || !(val - parseFloat(val) + 1 >= 0) || period < 0) && (period = 0),
			(scheduler && 'function' == typeof scheduler.schedule) || (scheduler = async),
			new Observable(function (subscriber) {
				return (
					subscriber.add(
						scheduler.schedule(dispatch$1, period, {
							subscriber: subscriber,
							counter: 0,
							period: period
						})
					),
					subscriber
				);
			})
		);
	}
	function dispatch$1(state) {
		var subscriber = state.subscriber,
			counter = state.counter,
			period = state.period;
		subscriber.next(counter),
			this.schedule({ subscriber: subscriber, counter: counter + 1, period: period }, period);
	}
	function filter(predicate, thisArg) {
		return function (source) {
			return source.lift(new FilterOperator(predicate, thisArg));
		};
	}
	var FilterOperator = (function () {
			function FilterOperator(predicate, thisArg) {
				(this.predicate = predicate), (this.thisArg = thisArg);
			}
			return (
				(FilterOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
				}),
				FilterOperator
			);
		})(),
		FilterSubscriber = (function (_super) {
			function FilterSubscriber(destination, predicate, thisArg) {
				var _this = _super.call(this, destination) || this;
				return (_this.predicate = predicate), (_this.thisArg = thisArg), (_this.count = 0), _this;
			}
			return (
				__extends(FilterSubscriber, _super),
				(FilterSubscriber.prototype._next = function (value) {
					var result;
					try {
						result = this.predicate.call(this.thisArg, value, this.count++);
					} catch (err) {
						return void this.destination.error(err);
					}
					result && this.destination.next(value);
				}),
				FilterSubscriber
			);
		})(Subscriber);
	function catchError(selector) {
		return function (source) {
			var operator = new CatchOperator(selector),
				caught = source.lift(operator);
			return (operator.caught = caught);
		};
	}
	var CatchOperator = (function () {
			function CatchOperator(selector) {
				this.selector = selector;
			}
			return (
				(CatchOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
				}),
				CatchOperator
			);
		})(),
		CatchSubscriber = (function (_super) {
			function CatchSubscriber(destination, selector, caught) {
				var _this = _super.call(this, destination) || this;
				return (_this.selector = selector), (_this.caught = caught), _this;
			}
			return (
				__extends(CatchSubscriber, _super),
				(CatchSubscriber.prototype.error = function (err) {
					if (!this.isStopped) {
						var result = void 0;
						try {
							result = this.selector(err, this.caught);
						} catch (err2) {
							return void _super.prototype.error.call(this, err2);
						}
						this._unsubscribeAndRecycle();
						var innerSubscriber = new SimpleInnerSubscriber(this);
						this.add(innerSubscriber);
						var innerSubscription = innerSubscribe(result, innerSubscriber);
						innerSubscription !== innerSubscriber && this.add(innerSubscription);
					}
				}),
				CatchSubscriber
			);
		})(SimpleOuterSubscriber);
	function distinctUntilChanged(compare, keySelector) {
		return function (source) {
			return source.lift(new DistinctUntilChangedOperator(compare, keySelector));
		};
	}
	var DistinctUntilChangedOperator = (function () {
			function DistinctUntilChangedOperator(compare, keySelector) {
				(this.compare = compare), (this.keySelector = keySelector);
			}
			return (
				(DistinctUntilChangedOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(
						new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector)
					);
				}),
				DistinctUntilChangedOperator
			);
		})(),
		DistinctUntilChangedSubscriber = (function (_super) {
			function DistinctUntilChangedSubscriber(destination, compare, keySelector) {
				var _this = _super.call(this, destination) || this;
				return (
					(_this.keySelector = keySelector),
					(_this.hasKey = !1),
					'function' == typeof compare && (_this.compare = compare),
					_this
				);
			}
			return (
				__extends(DistinctUntilChangedSubscriber, _super),
				(DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {
					return x === y;
				}),
				(DistinctUntilChangedSubscriber.prototype._next = function (value) {
					var key;
					try {
						var keySelector = this.keySelector;
						key = keySelector ? keySelector(value) : value;
					} catch (err) {
						return this.destination.error(err);
					}
					var result = !1;
					if (this.hasKey)
						try {
							result = (0, this.compare)(this.key, key);
						} catch (err) {
							return this.destination.error(err);
						}
					else this.hasKey = !0;
					result || ((this.key = key), this.destination.next(value));
				}),
				DistinctUntilChangedSubscriber
			);
		})(Subscriber);
	function take(count) {
		return function (source) {
			return 0 === count ? empty$1() : source.lift(new TakeOperator(count));
		};
	}
	var TakeOperator = (function () {
			function TakeOperator(total) {
				if (((this.total = total), this.total < 0)) throw new ArgumentOutOfRangeError();
			}
			return (
				(TakeOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(new TakeSubscriber(subscriber, this.total));
				}),
				TakeOperator
			);
		})(),
		TakeSubscriber = (function (_super) {
			function TakeSubscriber(destination, total) {
				var _this = _super.call(this, destination) || this;
				return (_this.total = total), (_this.count = 0), _this;
			}
			return (
				__extends(TakeSubscriber, _super),
				(TakeSubscriber.prototype._next = function (value) {
					var total = this.total,
						count = ++this.count;
					count <= total &&
						(this.destination.next(value),
						count === total && (this.destination.complete(), this.unsubscribe()));
				}),
				TakeSubscriber
			);
		})(Subscriber);
	function shareReplay(configOrBufferSize, windowTime, scheduler) {
		var config;
		return (
			(config =
				configOrBufferSize && 'object' == typeof configOrBufferSize
					? configOrBufferSize
					: {
							bufferSize: configOrBufferSize,
							windowTime: windowTime,
							refCount: !1,
							scheduler: scheduler
					  }),
			function (source) {
				return source.lift(
					(function (_a) {
						var subject,
							subscription,
							_b = _a.bufferSize,
							bufferSize = void 0 === _b ? Number.POSITIVE_INFINITY : _b,
							_c = _a.windowTime,
							windowTime = void 0 === _c ? Number.POSITIVE_INFINITY : _c,
							useRefCount = _a.refCount,
							scheduler = _a.scheduler,
							refCount = 0,
							hasError = !1,
							isComplete = !1;
						return function (source) {
							var innerSub;
							refCount++,
								!subject || hasError
									? ((hasError = !1),
									  (subject = new ReplaySubject(bufferSize, windowTime, scheduler)),
									  (innerSub = subject.subscribe(this)),
									  (subscription = source.subscribe({
											next: function (value) {
												subject.next(value);
											},
											error: function (err) {
												(hasError = !0), subject.error(err);
											},
											complete: function () {
												(isComplete = !0), (subscription = void 0), subject.complete();
											}
									  })),
									  isComplete && (subscription = void 0))
									: (innerSub = subject.subscribe(this)),
								this.add(function () {
									refCount--,
										innerSub.unsubscribe(),
										(innerSub = void 0),
										subscription &&
											!isComplete &&
											useRefCount &&
											0 === refCount &&
											(subscription.unsubscribe(), (subscription = void 0), (subject = void 0));
								});
						};
					})(config)
				);
			}
		);
	}
	var SkipOperator = (function () {
			function SkipOperator(total) {
				this.total = total;
			}
			return (
				(SkipOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(new SkipSubscriber(subscriber, this.total));
				}),
				SkipOperator
			);
		})(),
		SkipSubscriber = (function (_super) {
			function SkipSubscriber(destination, total) {
				var _this = _super.call(this, destination) || this;
				return (_this.total = total), (_this.count = 0), _this;
			}
			return (
				__extends(SkipSubscriber, _super),
				(SkipSubscriber.prototype._next = function (x) {
					++this.count > this.total && this.destination.next(x);
				}),
				SkipSubscriber
			);
		})(Subscriber);
	function switchMap(project, resultSelector) {
		return 'function' == typeof resultSelector
			? function (source) {
					return source.pipe(
						switchMap(function (a, i) {
							return from(project(a, i)).pipe(
								map(function (b, ii) {
									return resultSelector(a, b, i, ii);
								})
							);
						})
					);
			  }
			: function (source) {
					return source.lift(new SwitchMapOperator(project));
			  };
	}
	var SwitchMapOperator = (function () {
			function SwitchMapOperator(project) {
				this.project = project;
			}
			return (
				(SwitchMapOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(new SwitchMapSubscriber(subscriber, this.project));
				}),
				SwitchMapOperator
			);
		})(),
		SwitchMapSubscriber = (function (_super) {
			function SwitchMapSubscriber(destination, project) {
				var _this = _super.call(this, destination) || this;
				return (_this.project = project), (_this.index = 0), _this;
			}
			return (
				__extends(SwitchMapSubscriber, _super),
				(SwitchMapSubscriber.prototype._next = function (value) {
					var result,
						index = this.index++;
					try {
						result = this.project(value, index);
					} catch (error) {
						return void this.destination.error(error);
					}
					this._innerSub(result);
				}),
				(SwitchMapSubscriber.prototype._innerSub = function (result) {
					var innerSubscription = this.innerSubscription;
					innerSubscription && innerSubscription.unsubscribe();
					var innerSubscriber = new SimpleInnerSubscriber(this),
						destination = this.destination;
					destination.add(innerSubscriber),
						(this.innerSubscription = innerSubscribe(result, innerSubscriber)),
						this.innerSubscription !== innerSubscriber && destination.add(this.innerSubscription);
				}),
				(SwitchMapSubscriber.prototype._complete = function () {
					var innerSubscription = this.innerSubscription;
					(innerSubscription && !innerSubscription.closed) || _super.prototype._complete.call(this),
						this.unsubscribe();
				}),
				(SwitchMapSubscriber.prototype._unsubscribe = function () {
					this.innerSubscription = void 0;
				}),
				(SwitchMapSubscriber.prototype.notifyComplete = function () {
					(this.innerSubscription = void 0),
						this.isStopped && _super.prototype._complete.call(this);
				}),
				(SwitchMapSubscriber.prototype.notifyNext = function (innerValue) {
					this.destination.next(innerValue);
				}),
				SwitchMapSubscriber
			);
		})(SimpleOuterSubscriber);
	var DoOperator = (function () {
			function DoOperator(nextOrObserver, error, complete) {
				(this.nextOrObserver = nextOrObserver), (this.error = error), (this.complete = complete);
			}
			return (
				(DoOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(
						new TapSubscriber(subscriber, this.nextOrObserver, this.error, this.complete)
					);
				}),
				DoOperator
			);
		})(),
		TapSubscriber = (function (_super) {
			function TapSubscriber(destination, observerOrNext, error, complete) {
				var _this = _super.call(this, destination) || this;
				return (
					(_this._tapNext = noop$1),
					(_this._tapError = noop$1),
					(_this._tapComplete = noop$1),
					(_this._tapError = error || noop$1),
					(_this._tapComplete = complete || noop$1),
					isFunction(observerOrNext)
						? ((_this._context = _this), (_this._tapNext = observerOrNext))
						: observerOrNext &&
						  ((_this._context = observerOrNext),
						  (_this._tapNext = observerOrNext.next || noop$1),
						  (_this._tapError = observerOrNext.error || noop$1),
						  (_this._tapComplete = observerOrNext.complete || noop$1)),
					_this
				);
			}
			return (
				__extends(TapSubscriber, _super),
				(TapSubscriber.prototype._next = function (value) {
					try {
						this._tapNext.call(this._context, value);
					} catch (err) {
						return void this.destination.error(err);
					}
					this.destination.next(value);
				}),
				(TapSubscriber.prototype._error = function (err) {
					try {
						this._tapError.call(this._context, err);
					} catch (err) {
						return void this.destination.error(err);
					}
					this.destination.error(err);
				}),
				(TapSubscriber.prototype._complete = function () {
					try {
						this._tapComplete.call(this._context);
					} catch (err) {
						return void this.destination.error(err);
					}
					return this.destination.complete();
				}),
				TapSubscriber
			);
		})(Subscriber),
		defaultThrottleConfig = { leading: !0, trailing: !1 };
	var TimeStampView,
		ThrottleTimeOperator = (function () {
			function ThrottleTimeOperator(duration, scheduler, leading, trailing) {
				(this.duration = duration),
					(this.scheduler = scheduler),
					(this.leading = leading),
					(this.trailing = trailing);
			}
			return (
				(ThrottleTimeOperator.prototype.call = function (subscriber, source) {
					return source.subscribe(
						new ThrottleTimeSubscriber(
							subscriber,
							this.duration,
							this.scheduler,
							this.leading,
							this.trailing
						)
					);
				}),
				ThrottleTimeOperator
			);
		})(),
		ThrottleTimeSubscriber = (function (_super) {
			function ThrottleTimeSubscriber(destination, duration, scheduler, leading, trailing) {
				var _this = _super.call(this, destination) || this;
				return (
					(_this.duration = duration),
					(_this.scheduler = scheduler),
					(_this.leading = leading),
					(_this.trailing = trailing),
					(_this._hasTrailingValue = !1),
					(_this._trailingValue = null),
					_this
				);
			}
			return (
				__extends(ThrottleTimeSubscriber, _super),
				(ThrottleTimeSubscriber.prototype._next = function (value) {
					this.throttled
						? this.trailing && ((this._trailingValue = value), (this._hasTrailingValue = !0))
						: (this.add(
								(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, {
									subscriber: this
								}))
						  ),
						  this.leading
								? this.destination.next(value)
								: this.trailing && ((this._trailingValue = value), (this._hasTrailingValue = !0)));
				}),
				(ThrottleTimeSubscriber.prototype._complete = function () {
					this._hasTrailingValue
						? (this.destination.next(this._trailingValue), this.destination.complete())
						: this.destination.complete();
				}),
				(ThrottleTimeSubscriber.prototype.clearThrottle = function () {
					var throttled = this.throttled;
					throttled &&
						(this.trailing &&
							this._hasTrailingValue &&
							(this.destination.next(this._trailingValue),
							(this._trailingValue = null),
							(this._hasTrailingValue = !1)),
						throttled.unsubscribe(),
						this.remove(throttled),
						(this.throttled = null));
				}),
				ThrottleTimeSubscriber
			);
		})(Subscriber);
	function dispatchNext(arg) {
		arg.subscriber.clearThrottle();
	}
	function isPromise(obj) {
		return (
			!!obj && ('object' == typeof obj || 'function' == typeof obj) && 'function' == typeof obj.then
		);
	}
	function isFulfilledOrSync(value) {
		return !(value instanceof AsyncValue) || value.isFulfilled;
	}
	function getSyncValue(voAv) {
		return voAv instanceof AsyncValue ? voAv.value : voAv;
	}
	function compareAsyncValues(a1, a2, compare) {
		return (
			a1 === a2 ||
			(a1.pending === a2.pending && a1.error === a2.error && compare
				? compare(a1.value, a2.value)
				: a1.value === a2.value)
		);
	}
	function convertToAsyncValue(value) {
		return value instanceof AsyncValue ? value : AsyncValue.valueOnly(value);
	}
	function promiseToAsyncValueStream(promise) {
		return (function () {
			for (var observables = [], _i = 0; _i < arguments.length; _i++)
				observables[_i] = arguments[_i];
			var concurrent = Number.POSITIVE_INFINITY,
				scheduler = null,
				last = observables[observables.length - 1];
			return (
				isScheduler(last)
					? ((scheduler = observables.pop()),
					  observables.length > 1 &&
							'number' == typeof observables[observables.length - 1] &&
							(concurrent = observables.pop()))
					: 'number' == typeof last && (concurrent = observables.pop()),
				null === scheduler && 1 === observables.length && observables[0] instanceof Observable
					? observables[0]
					: mergeAll(concurrent)(fromArray(observables, scheduler))
			);
		})(
			of(AsyncValue.pendingOnly()),
			from(promise).pipe(
				map((value) => convertToAsyncValue(value)),
				catchError((error) => of(AsyncValue.errorOnly(error)))
			)
		);
	}
	function mapToAsyncValue() {
		return function (source) {
			return source.pipe(
				switchMap((value) =>
					isObservable(value)
						? value.pipe(mapToAsyncValue())
						: isPromise(value)
						? promiseToAsyncValueStream(value).pipe(mapToAsyncValue())
						: of(convertToAsyncValue(value))
				),
				catchError((e) => of(AsyncValue.errorOnly(e)))
			);
		};
	}
	function internalReduceAsyncValues(sources, reducerOrResult) {
		for (const source of sources)
			if (source instanceof AsyncValue && source.error) return AsyncValue.errorOnly(source.error);
		for (const source of sources)
			if (source instanceof AsyncValue && source.pending) return AsyncValue.pendingOnly();
		return reducerOrResult instanceof Function
			? reducerOrResult(sources.map((s) => (s instanceof AsyncValue ? s.value : s)))
			: convertToAsyncValue(reducerOrResult);
	}
	function reduceAsyncValues(sources, reducerOrResult) {
		return convertToAsyncValue(internalReduceAsyncValues(sources, reducerOrResult));
	}
	function internal_map_AsyncLike_to_Observable(value) {
		return isObservable(value)
			? value.pipe(mapToAsyncValue())
			: isPromise(value)
			? promiseToAsyncValueStream(value)
			: of(convertToAsyncValue(value));
	}
	(exports.TimeStampView = void 0),
		((TimeStampView =
			exports.TimeStampView || (exports.TimeStampView = {})).timeSincePreviousEvent =
			'timeSincePreviousEvent'),
		(TimeStampView.timeSinceAppStart = 'timeSinceAppStart'),
		(TimeStampView.absoluteTime = 'absoluteTime'),
		(TimeStampView.absoluteDateAndTime = 'absoluteDateAndTime');
	class BehaviorSubjectWithSet extends BehaviorSubject {
		set(value) {
			super.next(value);
		}
	}
	const timestampViewStream = createLocalStorageStream(
			exports.TimeStampView.absoluteTime,
			'TimeStampView'
		),
		showAppFullStateStream = createLocalStorageStream(!0, 'ShowAppFullState'),
		showEventDetailsStream = createLocalStorageStream(!1, 'ShowEventDetails');
	function createLocalStorageStream(initialValue, localStorageKey) {
		localStorageKey = `async-value:watch:${localStorageKey}`;
		let existingValue = null;
		try {
			const raw = localStorage.getItem(localStorageKey);
			'string' == typeof raw && (existingValue = JSON.parse(raw));
		} catch (_) {}
		const stream = new BehaviorSubjectWithSet(existingValue ?? initialValue);
		var count;
		return (
			stream
				.pipe(
					((count = 1),
					function (source) {
						return source.lift(new SkipOperator(count));
					})
				)
				.subscribe((value) => localStorage.setItem(localStorageKey, JSON.stringify(value))),
			stream
		);
	}
	var AVStreamEventType;
	function noop() {}
	(exports.AVStreamEventType = void 0),
		((AVStreamEventType = exports.AVStreamEventType || (exports.AVStreamEventType = {})).value =
			'value'),
		(AVStreamEventType.error = 'error'),
		(AVStreamEventType.complete = 'complete'),
		(AVStreamEventType.avValue = 'avValue'),
		(AVStreamEventType.avPending = 'avPending'),
		(AVStreamEventType.avError = 'avError');
	const identity = (x) => x;
	function run(fn) {
		return fn();
	}
	function blank_object() {
		return Object.create(null);
	}
	function run_all(fns) {
		fns.forEach(run);
	}
	function is_function(thing) {
		return 'function' == typeof thing;
	}
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && 'object' == typeof a) || 'function' == typeof a;
	}
	function subscribe(store, ...callbacks) {
		if (null == store) return noop;
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}
	function null_to_empty(value) {
		return null == value ? '' : value;
	}
	function set_store_value(store, ret, value) {
		return store.set(value), ret;
	}
	const is_client = 'undefined' != typeof window;
	let now = is_client ? () => window.performance.now() : () => Date.now(),
		raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
	const tasks = new Set();
	function run_tasks(now) {
		tasks.forEach((task) => {
			task.c(now) || (tasks.delete(task), task.f());
		}),
			0 !== tasks.size && raf(run_tasks);
	}
	function append(target, node) {
		target.appendChild(node);
	}
	function append_styles(target, style_sheet_id, styles) {
		const append_styles_to = get_root_for_style(target);
		if (!append_styles_to.getElementById(style_sheet_id)) {
			const style = element('style');
			(style.id = style_sheet_id),
				(style.textContent = styles),
				append_stylesheet(append_styles_to, style);
		}
	}
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		return root && root.host ? root : node.ownerDocument;
	}
	function append_stylesheet(node, style) {
		append(node.head || node, style);
	}
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}
	function detach(node) {
		node.parentNode.removeChild(node);
	}
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) iterations[i] && iterations[i].d(detaching);
	}
	function element(name) {
		return document.createElement(name);
	}
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}
	function text(data) {
		return document.createTextNode(data);
	}
	function space() {
		return text(' ');
	}
	function empty() {
		return text('');
	}
	function listen(node, event, handler, options) {
		return (
			node.addEventListener(event, handler, options),
			() => node.removeEventListener(event, handler, options)
		);
	}
	function attr(node, attribute, value) {
		null == value
			? node.removeAttribute(attribute)
			: node.getAttribute(attribute) !== value && node.setAttribute(attribute, value);
	}
	function set_data(text, data) {
		(data = '' + data), text.wholeText !== data && (text.data = data);
	}
	function set_style(node, key, value, important) {
		node.style.setProperty(key, value, important ? 'important' : '');
	}
	function select_option(select, value) {
		for (let i = 0; i < select.options.length; i += 1) {
			const option = select.options[i];
			if (option.__value === value) return void (option.selected = !0);
		}
		select.selectedIndex = -1;
	}
	let crossorigin;
	function is_crossorigin() {
		if (void 0 === crossorigin) {
			crossorigin = !1;
			try {
				'undefined' != typeof window && window.parent && window.parent.document;
			} catch (error) {
				crossorigin = !0;
			}
		}
		return crossorigin;
	}
	function toggle_class(element, name, toggle) {
		element.classList[toggle ? 'add' : 'remove'](name);
	}
	function custom_event(type, detail, bubbles = !1) {
		const e = document.createEvent('CustomEvent');
		return e.initCustomEvent(type, bubbles, !1, detail), e;
	}
	const active_docs = new Set();
	let current_component,
		active = 0;
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
		const step = 16.666 / duration;
		let keyframes = '{\n';
		for (let p = 0; p <= 1; p += step) {
			const t = a + (b - a) * ease(p);
			keyframes += 100 * p + `%{${fn(t, 1 - t)}}\n`;
		}
		const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`,
			name = `__svelte_${(function (str) {
				let hash = 5381,
					i = str.length;
				for (; i--; ) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
				return hash >>> 0;
			})(rule)}_${uid}`,
			doc = get_root_for_style(node);
		active_docs.add(doc);
		const stylesheet =
				doc.__svelte_stylesheet ||
				(doc.__svelte_stylesheet = (function (node) {
					const style_element = element('style');
					return append_stylesheet(get_root_for_style(node), style_element), style_element;
				})(node).sheet),
			current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
		current_rules[name] ||
			((current_rules[name] = !0),
			stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length));
		const animation = node.style.animation || '';
		return (
			(node.style.animation = `${
				animation ? `${animation}, ` : ''
			}${name} ${duration}ms linear ${delay}ms 1 both`),
			(active += 1),
			name
		);
	}
	function delete_rule(node, name) {
		const previous = (node.style.animation || '').split(', '),
			next = previous.filter(
				name ? (anim) => anim.indexOf(name) < 0 : (anim) => -1 === anim.indexOf('__svelte')
			),
			deleted = previous.length - next.length;
		deleted &&
			((node.style.animation = next.join(', ')),
			(active -= deleted),
			active ||
				raf(() => {
					active ||
						(active_docs.forEach((doc) => {
							const stylesheet = doc.__svelte_stylesheet;
							let i = stylesheet.cssRules.length;
							for (; i--; ) stylesheet.deleteRule(i);
							doc.__svelte_rules = {};
						}),
						active_docs.clear());
				}));
	}
	function set_current_component(component) {
		current_component = component;
	}
	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}
	function setContext(key, context) {
		get_current_component().$$.context.set(key, context);
	}
	function getContext(key) {
		return get_current_component().$$.context.get(key);
	}
	function bubble(component, event) {
		const callbacks = component.$$.callbacks[event.type];
		callbacks && callbacks.slice().forEach((fn) => fn.call(this, event));
	}
	const dirty_components = [],
		binding_callbacks = [],
		render_callbacks = [],
		flush_callbacks = [],
		resolved_promise = Promise.resolve();
	let update_scheduled = !1;
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}
	const seen_callbacks = new Set();
	let promise,
		flushidx = 0;
	function flush() {
		const saved_component = current_component;
		do {
			for (; flushidx < dirty_components.length; ) {
				const component = dirty_components[flushidx];
				flushidx++, set_current_component(component), update(component.$$);
			}
			for (
				set_current_component(null), dirty_components.length = 0, flushidx = 0;
				binding_callbacks.length;

			)
				binding_callbacks.pop()();
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				seen_callbacks.has(callback) || (seen_callbacks.add(callback), callback());
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		for (; flush_callbacks.length; ) flush_callbacks.pop()();
		(update_scheduled = !1), seen_callbacks.clear(), set_current_component(saved_component);
	}
	function update($$) {
		if (null !== $$.fragment) {
			$$.update(), run_all($$.before_update);
			const dirty = $$.dirty;
			($$.dirty = [-1]),
				$$.fragment && $$.fragment.p($$.ctx, dirty),
				$$.after_update.forEach(add_render_callback);
		}
	}
	function dispatch(node, direction, kind) {
		node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
	}
	const outroing = new Set();
	let outros;
	function group_outros() {
		outros = { r: 0, c: [], p: outros };
	}
	function check_outros() {
		outros.r || run_all(outros.c), (outros = outros.p);
	}
	function transition_in(block, local) {
		block && block.i && (outroing.delete(block), block.i(local));
	}
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block),
				outros.c.push(() => {
					outroing.delete(block), callback && (detach && block.d(1), callback());
				}),
				block.o(local);
		}
	}
	const null_transition = { duration: 0 };
	function create_bidirectional_transition(node, fn, params, intro) {
		let config = fn(node, params),
			t = intro ? 0 : 1,
			running_program = null,
			pending_program = null,
			animation_name = null;
		function clear_animation() {
			animation_name && delete_rule(node, animation_name);
		}
		function init(program, duration) {
			const d = program.b - t;
			return (
				(duration *= Math.abs(d)),
				{
					a: t,
					b: program.b,
					d: d,
					duration: duration,
					start: program.start,
					end: program.start + duration,
					group: program.group
				}
			);
		}
		function go(b) {
			const {
					delay: delay = 0,
					duration: duration = 300,
					easing: easing = identity,
					tick: tick = noop,
					css: css
				} = config || null_transition,
				program = { start: now() + delay, b: b };
			b || ((program.group = outros), (outros.r += 1)),
				running_program || pending_program
					? (pending_program = program)
					: (css &&
							(clear_animation(),
							(animation_name = create_rule(node, t, b, duration, delay, easing, css))),
					  b && tick(0, 1),
					  (running_program = init(program, duration)),
					  add_render_callback(() => dispatch(node, b, 'start')),
					  (function (callback) {
							let task;
							0 === tasks.size && raf(run_tasks),
								new Promise((fulfill) => {
									tasks.add((task = { c: callback, f: fulfill }));
								});
					  })((now) => {
							if (
								(pending_program &&
									now > pending_program.start &&
									((running_program = init(pending_program, duration)),
									(pending_program = null),
									dispatch(node, running_program.b, 'start'),
									css &&
										(clear_animation(),
										(animation_name = create_rule(
											node,
											t,
											running_program.b,
											running_program.duration,
											0,
											easing,
											config.css
										)))),
								running_program)
							)
								if (now >= running_program.end)
									tick((t = running_program.b), 1 - t),
										dispatch(node, running_program.b, 'end'),
										pending_program ||
											(running_program.b
												? clear_animation()
												: --running_program.group.r || run_all(running_program.group.c)),
										(running_program = null);
								else if (now >= running_program.start) {
									const p = now - running_program.start;
									(t =
										running_program.a + running_program.d * easing(p / running_program.duration)),
										tick(t, 1 - t);
								}
							return !(!running_program && !pending_program);
					  }));
		}
		return {
			run(b) {
				is_function(config)
					? (promise ||
							((promise = Promise.resolve()),
							promise.then(() => {
								promise = null;
							})),
					  promise).then(() => {
							(config = config()), go(b);
					  })
					: go(b);
			},
			end() {
				clear_animation(), (running_program = pending_program = null);
			}
		};
	}
	function destroy_block(block, lookup) {
		block.d(1), lookup.delete(block.key);
	}
	function outro_and_destroy_block(block, lookup) {
		transition_out(block, 1, 1, () => {
			lookup.delete(block.key);
		});
	}
	function update_keyed_each(
		old_blocks,
		dirty,
		get_key,
		dynamic,
		ctx,
		list,
		lookup,
		node,
		destroy,
		create_each_block,
		next,
		get_context
	) {
		let o = old_blocks.length,
			n = list.length,
			i = o;
		const old_indexes = {};
		for (; i--; ) old_indexes[old_blocks[i].key] = i;
		const new_blocks = [],
			new_lookup = new Map(),
			deltas = new Map();
		for (i = n; i--; ) {
			const child_ctx = get_context(ctx, list, i),
				key = get_key(child_ctx);
			let block = lookup.get(key);
			block
				? dynamic && block.p(child_ctx, dirty)
				: ((block = create_each_block(key, child_ctx)), block.c()),
				new_lookup.set(key, (new_blocks[i] = block)),
				key in old_indexes && deltas.set(key, Math.abs(i - old_indexes[key]));
		}
		const will_move = new Set(),
			did_move = new Set();
		function insert(block) {
			transition_in(block, 1),
				block.m(node, next),
				lookup.set(block.key, block),
				(next = block.first),
				n--;
		}
		for (; o && n; ) {
			const new_block = new_blocks[n - 1],
				old_block = old_blocks[o - 1],
				new_key = new_block.key,
				old_key = old_block.key;
			new_block === old_block
				? ((next = new_block.first), o--, n--)
				: new_lookup.has(old_key)
				? !lookup.has(new_key) || will_move.has(new_key)
					? insert(new_block)
					: did_move.has(old_key)
					? o--
					: deltas.get(new_key) > deltas.get(old_key)
					? (did_move.add(new_key), insert(new_block))
					: (will_move.add(old_key), o--)
				: (destroy(old_block, lookup), o--);
		}
		for (; o--; ) {
			const old_block = old_blocks[o];
			new_lookup.has(old_block.key) || destroy(old_block, lookup);
		}
		for (; n; ) insert(new_blocks[n - 1]);
		return new_blocks;
	}
	function create_component(block) {
		block && block.c();
	}
	function mount_component(component, target, anchor, customElement) {
		const {
			fragment: fragment,
			on_mount: on_mount,
			on_destroy: on_destroy,
			after_update: after_update
		} = component.$$;
		fragment && fragment.m(target, anchor),
			customElement ||
				add_render_callback(() => {
					const new_on_destroy = on_mount.map(run).filter(is_function);
					on_destroy ? on_destroy.push(...new_on_destroy) : run_all(new_on_destroy),
						(component.$$.on_mount = []);
				}),
			after_update.forEach(add_render_callback);
	}
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		null !== $$.fragment &&
			(run_all($$.on_destroy),
			$$.fragment && $$.fragment.d(detaching),
			($$.on_destroy = $$.fragment = null),
			($$.ctx = []));
	}
	function make_dirty(component, i) {
		-1 === component.$$.dirty[0] &&
			(dirty_components.push(component),
			update_scheduled || ((update_scheduled = !0), resolved_promise.then(flush)),
			component.$$.dirty.fill(0)),
			(component.$$.dirty[(i / 31) | 0] |= 1 << i % 31);
	}
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		const $$ = (component.$$ = {
			fragment: null,
			ctx: null,
			props: props,
			update: noop,
			not_equal: not_equal,
			bound: blank_object(),
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			callbacks: blank_object(),
			dirty: dirty,
			skip_bound: !1,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = !1;
		if (
			(($$.ctx = instance
				? instance(component, options.props || {}, (i, ret, ...rest) => {
						const value = rest.length ? rest[0] : ret;
						return (
							$$.ctx &&
								not_equal($$.ctx[i], ($$.ctx[i] = value)) &&
								(!$$.skip_bound && $$.bound[i] && $$.bound[i](value),
								ready && make_dirty(component, i)),
							ret
						);
				  })
				: []),
			$$.update(),
			(ready = !0),
			run_all($$.before_update),
			($$.fragment = !!create_fragment && create_fragment($$.ctx)),
			options.target)
		) {
			if (options.hydrate) {
				const nodes = (function (element) {
					return Array.from(element.childNodes);
				})(options.target);
				$$.fragment && $$.fragment.l(nodes), nodes.forEach(detach);
			} else $$.fragment && $$.fragment.c();
			options.intro && transition_in(component.$$.fragment),
				mount_component(component, options.target, options.anchor, options.customElement),
				flush();
		}
		set_current_component(parent_component);
	}
	class SvelteComponent {
		$destroy() {
			destroy_component(this, 1), (this.$destroy = noop);
		}
		$on(type, callback) {
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			return (
				callbacks.push(callback),
				() => {
					const index = callbacks.indexOf(callback);
					-1 !== index && callbacks.splice(index, 1);
				}
			);
		}
		$set($$props) {
			var obj;
			this.$$set &&
				((obj = $$props), 0 !== Object.keys(obj).length) &&
				((this.$$.skip_bound = !0), this.$$set($$props), (this.$$.skip_bound = !1));
		}
	}
	var contextKey = {};
	function add_css$d(target) {
		append_styles(
			target,
			'svelte-1o68iiy',
			".container.svelte-1o68iiy{display:inline-block;cursor:pointer;transform:translate(calc(0px - var(--li-identation)), -50%);position:absolute;top:50%;padding-right:100%}.arrow.svelte-1o68iiy{transform-origin:25% 50%;position:relative;line-height:1.1em;font-size:0.75em;margin-left:0;transition:150ms;color:var(--arrow-sign);user-select:none;font-family:'Courier New', Courier, monospace}.expanded.svelte-1o68iiy{transform:rotateZ(90deg) translateX(-3px)}"
		);
	}
	function create_fragment$o(ctx) {
		let div1, div0, mounted, dispose;
		return {
			c() {
				(div1 = element('div')),
					(div0 = element('div')),
					(div0.textContent = '▶'),
					attr(div0, 'class', 'arrow svelte-1o68iiy'),
					toggle_class(div0, 'expanded', ctx[0]),
					attr(div1, 'class', 'container svelte-1o68iiy');
			},
			m(target, anchor) {
				insert(target, div1, anchor),
					append(div1, div0),
					mounted || ((dispose = listen(div1, 'click', ctx[1])), (mounted = !0));
			},
			p(ctx, [dirty]) {
				1 & dirty && toggle_class(div0, 'expanded', ctx[0]);
			},
			i: noop,
			o: noop,
			d(detaching) {
				detaching && detach(div1), (mounted = !1), dispose();
			}
		};
	}
	function instance$o($$self, $$props, $$invalidate) {
		let { expanded: expanded } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'expanded' in $$props && $$invalidate(0, (expanded = $$props.expanded));
			}),
			[
				expanded,
				function (event) {
					bubble.call(this, $$self, event);
				}
			]
		);
	}
	var JSONArrow$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$o,
					create_fragment$o,
					safe_not_equal,
					{ expanded: 0 },
					add_css$d
				);
		}
	};
	function add_css$c(target) {
		append_styles(
			target,
			'svelte-1f0jqku',
			'label.svelte-1f0jqku{display:inline-block;color:var(--label-color);padding:0}.spaced.svelte-1f0jqku{padding-right:var(--li-colon-space)}'
		);
	}
	function create_if_block$6(ctx) {
		let label, span, t0, t1, mounted, dispose;
		return {
			c() {
				(label = element('label')),
					(span = element('span')),
					(t0 = text(ctx[0])),
					(t1 = text(ctx[2])),
					attr(label, 'class', 'svelte-1f0jqku'),
					toggle_class(label, 'spaced', ctx[1]);
			},
			m(target, anchor) {
				insert(target, label, anchor),
					append(label, span),
					append(span, t0),
					append(span, t1),
					mounted || ((dispose = listen(label, 'click', ctx[5])), (mounted = !0));
			},
			p(ctx, dirty) {
				1 & dirty && set_data(t0, ctx[0]),
					4 & dirty && set_data(t1, ctx[2]),
					2 & dirty && toggle_class(label, 'spaced', ctx[1]);
			},
			d(detaching) {
				detaching && detach(label), (mounted = !1), dispose();
			}
		};
	}
	function create_fragment$n(ctx) {
		let if_block_anchor,
			if_block = ctx[3] && ctx[0] && create_if_block$6(ctx);
		return {
			c() {
				if_block && if_block.c(), (if_block_anchor = empty());
			},
			m(target, anchor) {
				if_block && if_block.m(target, anchor), insert(target, if_block_anchor, anchor);
			},
			p(ctx, [dirty]) {
				ctx[3] && ctx[0]
					? if_block
						? if_block.p(ctx, dirty)
						: ((if_block = create_if_block$6(ctx)),
						  if_block.c(),
						  if_block.m(if_block_anchor.parentNode, if_block_anchor))
					: if_block && (if_block.d(1), (if_block = null));
			},
			i: noop,
			o: noop,
			d(detaching) {
				if_block && if_block.d(detaching), detaching && detach(if_block_anchor);
			}
		};
	}
	function instance$n($$self, $$props, $$invalidate) {
		let showKey,
			{
				key: key,
				isParentExpanded: isParentExpanded,
				isParentArray: isParentArray = !1,
				colon: colon = ':'
			} = $$props;
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'isParentExpanded' in $$props &&
						$$invalidate(1, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(4, (isParentArray = $$props.isParentArray)),
					'colon' in $$props && $$invalidate(2, (colon = $$props.colon));
			}),
			($$self.$$.update = () => {
				19 & $$self.$$.dirty &&
					$$invalidate(3, (showKey = isParentExpanded || !isParentArray || key != +key));
			}),
			[
				key,
				isParentExpanded,
				colon,
				showKey,
				isParentArray,
				function (event) {
					bubble.call(this, $$self, event);
				}
			]
		);
	}
	var JSONKey$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$n,
					create_fragment$n,
					safe_not_equal,
					{ key: 0, isParentExpanded: 1, isParentArray: 4, colon: 2 },
					add_css$c
				);
		}
	};
	function add_css$b(target) {
		append_styles(
			target,
			'svelte-1bnyc8l',
			'label.svelte-1bnyc8l{display:inline-block}.indent.svelte-1bnyc8l{padding-left:var(--li-identation)}.collapse.svelte-1bnyc8l{--li-display:inline;display:inline;font-style:italic}.comma.svelte-1bnyc8l{margin-left:-0.5em;margin-right:0.5em}label.svelte-1bnyc8l{position:relative}'
		);
	}
	function get_each_context$5(ctx, list, i) {
		const child_ctx = ctx.slice();
		return (child_ctx[12] = list[i]), (child_ctx[20] = i), child_ctx;
	}
	function create_if_block_3$1(ctx) {
		let jsonarrow, current;
		return (
			(jsonarrow = new JSONArrow$1({ props: { expanded: ctx[0] } })),
			jsonarrow.$on('click', ctx[15]),
			{
				c() {
					create_component(jsonarrow.$$.fragment);
				},
				m(target, anchor) {
					mount_component(jsonarrow, target, anchor), (current = !0);
				},
				p(ctx, dirty) {
					const jsonarrow_changes = {};
					1 & dirty && (jsonarrow_changes.expanded = ctx[0]), jsonarrow.$set(jsonarrow_changes);
				},
				i(local) {
					current || (transition_in(jsonarrow.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonarrow.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(jsonarrow, detaching);
				}
			}
		);
	}
	function create_else_block$1(ctx) {
		let span;
		return {
			c() {
				(span = element('span')), (span.textContent = '…');
			},
			m(target, anchor) {
				insert(target, span, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d(detaching) {
				detaching && detach(span);
			}
		};
	}
	function create_if_block$5(ctx) {
		let ul,
			t,
			current,
			mounted,
			dispose,
			each_value = ctx[13],
			each_blocks = [];
		for (let i = 0; i < each_value.length; i += 1)
			each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
		const out = (i) =>
			transition_out(each_blocks[i], 1, 1, () => {
				each_blocks[i] = null;
			});
		let if_block = ctx[13].length < ctx[7].length && create_if_block_1$3();
		return {
			c() {
				ul = element('ul');
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
				(t = space()),
					if_block && if_block.c(),
					attr(ul, 'class', 'svelte-1bnyc8l'),
					toggle_class(ul, 'collapse', !ctx[0]);
			},
			m(target, anchor) {
				insert(target, ul, anchor);
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(ul, null);
				append(ul, t),
					if_block && if_block.m(ul, null),
					(current = !0),
					mounted || ((dispose = listen(ul, 'click', ctx[16])), (mounted = !0));
			},
			p(ctx, dirty) {
				if (10129 & dirty) {
					let i;
					for (each_value = ctx[13], i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$5(ctx, each_value, i);
						each_blocks[i]
							? (each_blocks[i].p(child_ctx, dirty), transition_in(each_blocks[i], 1))
							: ((each_blocks[i] = create_each_block$5(child_ctx)),
							  each_blocks[i].c(),
							  transition_in(each_blocks[i], 1),
							  each_blocks[i].m(ul, t));
					}
					for (group_outros(), i = each_value.length; i < each_blocks.length; i += 1) out(i);
					check_outros();
				}
				ctx[13].length < ctx[7].length
					? if_block || ((if_block = create_if_block_1$3()), if_block.c(), if_block.m(ul, null))
					: if_block && (if_block.d(1), (if_block = null)),
					1 & dirty && toggle_class(ul, 'collapse', !ctx[0]);
			},
			i(local) {
				if (!current) {
					for (let i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);
					current = !0;
				}
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);
				for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);
				current = !1;
			},
			d(detaching) {
				detaching && detach(ul),
					destroy_each(each_blocks, detaching),
					if_block && if_block.d(),
					(mounted = !1),
					dispose();
			}
		};
	}
	function create_if_block_2$2(ctx) {
		let span;
		return {
			c() {
				(span = element('span')),
					(span.textContent = ','),
					attr(span, 'class', 'comma svelte-1bnyc8l');
			},
			m(target, anchor) {
				insert(target, span, anchor);
			},
			d(detaching) {
				detaching && detach(span);
			}
		};
	}
	function create_each_block$5(ctx) {
		let jsonnode, t, if_block_anchor, current;
		jsonnode = new JSONNode$1({
			props: {
				key: ctx[8](ctx[12]),
				isParentExpanded: ctx[0],
				isParentArray: ctx[4],
				value: ctx[0] ? ctx[9](ctx[12]) : ctx[10](ctx[12])
			}
		});
		let if_block = !ctx[0] && ctx[20] < ctx[7].length - 1 && create_if_block_2$2();
		return {
			c() {
				create_component(jsonnode.$$.fragment),
					(t = space()),
					if_block && if_block.c(),
					(if_block_anchor = empty());
			},
			m(target, anchor) {
				mount_component(jsonnode, target, anchor),
					insert(target, t, anchor),
					if_block && if_block.m(target, anchor),
					insert(target, if_block_anchor, anchor),
					(current = !0);
			},
			p(ctx, dirty) {
				const jsonnode_changes = {};
				8448 & dirty && (jsonnode_changes.key = ctx[8](ctx[12])),
					1 & dirty && (jsonnode_changes.isParentExpanded = ctx[0]),
					16 & dirty && (jsonnode_changes.isParentArray = ctx[4]),
					9729 & dirty && (jsonnode_changes.value = ctx[0] ? ctx[9](ctx[12]) : ctx[10](ctx[12])),
					jsonnode.$set(jsonnode_changes),
					!ctx[0] && ctx[20] < ctx[7].length - 1
						? if_block ||
						  ((if_block = create_if_block_2$2()),
						  if_block.c(),
						  if_block.m(if_block_anchor.parentNode, if_block_anchor))
						: if_block && (if_block.d(1), (if_block = null));
			},
			i(local) {
				current || (transition_in(jsonnode.$$.fragment, local), (current = !0));
			},
			o(local) {
				transition_out(jsonnode.$$.fragment, local), (current = !1);
			},
			d(detaching) {
				destroy_component(jsonnode, detaching),
					detaching && detach(t),
					if_block && if_block.d(detaching),
					detaching && detach(if_block_anchor);
			}
		};
	}
	function create_if_block_1$3(ctx) {
		let span;
		return {
			c() {
				(span = element('span')), (span.textContent = '…');
			},
			m(target, anchor) {
				insert(target, span, anchor);
			},
			d(detaching) {
				detaching && detach(span);
			}
		};
	}
	function create_fragment$m(ctx) {
		let li,
			label_1,
			t0,
			jsonkey,
			t1,
			span1,
			span0,
			t2,
			t3,
			t4,
			current_block_type_index,
			if_block1,
			t5,
			span2,
			t6,
			current,
			mounted,
			dispose,
			if_block0 = ctx[11] && ctx[2] && create_if_block_3$1(ctx);
		(jsonkey = new JSONKey$1({
			props: { key: ctx[12], colon: ctx[14].colon, isParentExpanded: ctx[2], isParentArray: ctx[3] }
		})),
			jsonkey.$on('click', ctx[15]);
		const if_block_creators = [create_if_block$5, create_else_block$1],
			if_blocks = [];
		function select_block_type(ctx, dirty) {
			return ctx[2] ? 0 : 1;
		}
		return (
			(current_block_type_index = select_block_type(ctx)),
			(if_block1 = if_blocks[current_block_type_index] =
				if_block_creators[current_block_type_index](ctx)),
			{
				c() {
					(li = element('li')),
						(label_1 = element('label')),
						if_block0 && if_block0.c(),
						(t0 = space()),
						create_component(jsonkey.$$.fragment),
						(t1 = space()),
						(span1 = element('span')),
						(span0 = element('span')),
						(t2 = text(ctx[1])),
						(t3 = text(ctx[5])),
						(t4 = space()),
						if_block1.c(),
						(t5 = space()),
						(span2 = element('span')),
						(t6 = text(ctx[6])),
						attr(label_1, 'class', 'svelte-1bnyc8l'),
						attr(li, 'class', 'svelte-1bnyc8l'),
						toggle_class(li, 'indent', ctx[2]);
				},
				m(target, anchor) {
					insert(target, li, anchor),
						append(li, label_1),
						if_block0 && if_block0.m(label_1, null),
						append(label_1, t0),
						mount_component(jsonkey, label_1, null),
						append(label_1, t1),
						append(label_1, span1),
						append(span1, span0),
						append(span0, t2),
						append(span1, t3),
						append(li, t4),
						if_blocks[current_block_type_index].m(li, null),
						append(li, t5),
						append(li, span2),
						append(span2, t6),
						(current = !0),
						mounted || ((dispose = listen(span1, 'click', ctx[15])), (mounted = !0));
				},
				p(ctx, [dirty]) {
					ctx[11] && ctx[2]
						? if_block0
							? (if_block0.p(ctx, dirty), 2052 & dirty && transition_in(if_block0, 1))
							: ((if_block0 = create_if_block_3$1(ctx)),
							  if_block0.c(),
							  transition_in(if_block0, 1),
							  if_block0.m(label_1, t0))
						: if_block0 &&
						  (group_outros(),
						  transition_out(if_block0, 1, 1, () => {
								if_block0 = null;
						  }),
						  check_outros());
					const jsonkey_changes = {};
					4096 & dirty && (jsonkey_changes.key = ctx[12]),
						4 & dirty && (jsonkey_changes.isParentExpanded = ctx[2]),
						8 & dirty && (jsonkey_changes.isParentArray = ctx[3]),
						jsonkey.$set(jsonkey_changes),
						(!current || 2 & dirty) && set_data(t2, ctx[1]),
						(!current || 32 & dirty) && set_data(t3, ctx[5]);
					let previous_block_index = current_block_type_index;
					(current_block_type_index = select_block_type(ctx)),
						current_block_type_index === previous_block_index
							? if_blocks[current_block_type_index].p(ctx, dirty)
							: (group_outros(),
							  transition_out(if_blocks[previous_block_index], 1, 1, () => {
									if_blocks[previous_block_index] = null;
							  }),
							  check_outros(),
							  (if_block1 = if_blocks[current_block_type_index]),
							  if_block1
									? if_block1.p(ctx, dirty)
									: ((if_block1 = if_blocks[current_block_type_index] =
											if_block_creators[current_block_type_index](ctx)),
									  if_block1.c()),
							  transition_in(if_block1, 1),
							  if_block1.m(li, t5)),
						(!current || 64 & dirty) && set_data(t6, ctx[6]),
						4 & dirty && toggle_class(li, 'indent', ctx[2]);
				},
				i(local) {
					current ||
						(transition_in(if_block0),
						transition_in(jsonkey.$$.fragment, local),
						transition_in(if_block1),
						(current = !0));
				},
				o(local) {
					transition_out(if_block0),
						transition_out(jsonkey.$$.fragment, local),
						transition_out(if_block1),
						(current = !1);
				},
				d(detaching) {
					detaching && detach(li),
						if_block0 && if_block0.d(),
						destroy_component(jsonkey),
						if_blocks[current_block_type_index].d(),
						(mounted = !1),
						dispose();
				}
			}
		);
	}
	function instance$m($$self, $$props, $$invalidate) {
		let slicedKeys,
			{
				key: key,
				keys: keys,
				colon: colon = ':',
				label: label = '',
				isParentExpanded: isParentExpanded,
				isParentArray: isParentArray,
				isArray: isArray = !1,
				bracketOpen: bracketOpen,
				bracketClose: bracketClose
			} = $$props,
			{ previewKeys: previewKeys = keys } = $$props,
			{ getKey: getKey = (key) => key } = $$props,
			{ getValue: getValue = (key) => key } = $$props,
			{ getPreviewValue: getPreviewValue = getValue } = $$props,
			{ expanded: expanded = !1, expandable: expandable = !0 } = $$props;
		const context = getContext(contextKey);
		return (
			setContext(contextKey, { ...context, colon: colon }),
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(12, (key = $$props.key)),
					'keys' in $$props && $$invalidate(17, (keys = $$props.keys)),
					'colon' in $$props && $$invalidate(18, (colon = $$props.colon)),
					'label' in $$props && $$invalidate(1, (label = $$props.label)),
					'isParentExpanded' in $$props &&
						$$invalidate(2, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(3, (isParentArray = $$props.isParentArray)),
					'isArray' in $$props && $$invalidate(4, (isArray = $$props.isArray)),
					'bracketOpen' in $$props && $$invalidate(5, (bracketOpen = $$props.bracketOpen)),
					'bracketClose' in $$props && $$invalidate(6, (bracketClose = $$props.bracketClose)),
					'previewKeys' in $$props && $$invalidate(7, (previewKeys = $$props.previewKeys)),
					'getKey' in $$props && $$invalidate(8, (getKey = $$props.getKey)),
					'getValue' in $$props && $$invalidate(9, (getValue = $$props.getValue)),
					'getPreviewValue' in $$props &&
						$$invalidate(10, (getPreviewValue = $$props.getPreviewValue)),
					'expanded' in $$props && $$invalidate(0, (expanded = $$props.expanded)),
					'expandable' in $$props && $$invalidate(11, (expandable = $$props.expandable));
			}),
			($$self.$$.update = () => {
				4 & $$self.$$.dirty && (isParentExpanded || $$invalidate(0, (expanded = !1))),
					131201 & $$self.$$.dirty &&
						$$invalidate(13, (slicedKeys = expanded ? keys : previewKeys.slice(0, 5)));
			}),
			[
				expanded,
				label,
				isParentExpanded,
				isParentArray,
				isArray,
				bracketOpen,
				bracketClose,
				previewKeys,
				getKey,
				getValue,
				getPreviewValue,
				expandable,
				key,
				slicedKeys,
				context,
				function () {
					$$invalidate(0, (expanded = !expanded));
				},
				function () {
					$$invalidate(0, (expanded = !0));
				},
				keys,
				colon
			]
		);
	}
	var JSONNested$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$m,
					create_fragment$m,
					safe_not_equal,
					{
						key: 12,
						keys: 17,
						colon: 18,
						label: 1,
						isParentExpanded: 2,
						isParentArray: 3,
						isArray: 4,
						bracketOpen: 5,
						bracketClose: 6,
						previewKeys: 7,
						getKey: 8,
						getValue: 9,
						getPreviewValue: 10,
						expanded: 0,
						expandable: 11
					},
					add_css$b
				);
		}
	};
	function create_fragment$l(ctx) {
		let jsonnested, current;
		return (
			(jsonnested = new JSONNested$1({
				props: {
					key: ctx[0],
					expanded: ctx[4],
					isParentExpanded: ctx[1],
					isParentArray: ctx[2],
					keys: ctx[5],
					previewKeys: ctx[5],
					getValue: ctx[6],
					label: ctx[3] + ' ',
					bracketOpen: '{',
					bracketClose: '}'
				}
			})),
			{
				c() {
					create_component(jsonnested.$$.fragment);
				},
				m(target, anchor) {
					mount_component(jsonnested, target, anchor), (current = !0);
				},
				p(ctx, [dirty]) {
					const jsonnested_changes = {};
					1 & dirty && (jsonnested_changes.key = ctx[0]),
						16 & dirty && (jsonnested_changes.expanded = ctx[4]),
						2 & dirty && (jsonnested_changes.isParentExpanded = ctx[1]),
						4 & dirty && (jsonnested_changes.isParentArray = ctx[2]),
						32 & dirty && (jsonnested_changes.keys = ctx[5]),
						32 & dirty && (jsonnested_changes.previewKeys = ctx[5]),
						8 & dirty && (jsonnested_changes.label = ctx[3] + ' '),
						jsonnested.$set(jsonnested_changes);
				},
				i(local) {
					current || (transition_in(jsonnested.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonnested.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(jsonnested, detaching);
				}
			}
		);
	}
	function instance$l($$self, $$props, $$invalidate) {
		let keys,
			{
				key: key,
				value: value,
				isParentExpanded: isParentExpanded,
				isParentArray: isParentArray,
				nodeType: nodeType
			} = $$props,
			{ expanded: expanded = !0 } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'value' in $$props && $$invalidate(7, (value = $$props.value)),
					'isParentExpanded' in $$props &&
						$$invalidate(1, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(2, (isParentArray = $$props.isParentArray)),
					'nodeType' in $$props && $$invalidate(3, (nodeType = $$props.nodeType)),
					'expanded' in $$props && $$invalidate(4, (expanded = $$props.expanded));
			}),
			($$self.$$.update = () => {
				128 & $$self.$$.dirty && $$invalidate(5, (keys = Object.getOwnPropertyNames(value)));
			}),
			[
				key,
				isParentExpanded,
				isParentArray,
				nodeType,
				expanded,
				keys,
				function (key) {
					return value[key];
				},
				value
			]
		);
	}
	var JSONObjectNode$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$l, create_fragment$l, safe_not_equal, {
					key: 0,
					value: 7,
					isParentExpanded: 1,
					isParentArray: 2,
					nodeType: 3,
					expanded: 4
				});
		}
	};
	function create_fragment$k(ctx) {
		let jsonnested, current;
		return (
			(jsonnested = new JSONNested$1({
				props: {
					key: ctx[0],
					expanded: ctx[4],
					isParentExpanded: ctx[2],
					isParentArray: ctx[3],
					isArray: !0,
					keys: ctx[5],
					previewKeys: ctx[6],
					getValue: ctx[7],
					label: 'Array(' + ctx[1].length + ')',
					bracketOpen: '[',
					bracketClose: ']'
				}
			})),
			{
				c() {
					create_component(jsonnested.$$.fragment);
				},
				m(target, anchor) {
					mount_component(jsonnested, target, anchor), (current = !0);
				},
				p(ctx, [dirty]) {
					const jsonnested_changes = {};
					1 & dirty && (jsonnested_changes.key = ctx[0]),
						16 & dirty && (jsonnested_changes.expanded = ctx[4]),
						4 & dirty && (jsonnested_changes.isParentExpanded = ctx[2]),
						8 & dirty && (jsonnested_changes.isParentArray = ctx[3]),
						32 & dirty && (jsonnested_changes.keys = ctx[5]),
						64 & dirty && (jsonnested_changes.previewKeys = ctx[6]),
						2 & dirty && (jsonnested_changes.label = 'Array(' + ctx[1].length + ')'),
						jsonnested.$set(jsonnested_changes);
				},
				i(local) {
					current || (transition_in(jsonnested.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonnested.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(jsonnested, detaching);
				}
			}
		);
	}
	function instance$k($$self, $$props, $$invalidate) {
		let keys,
			previewKeys,
			{
				key: key,
				value: value,
				isParentExpanded: isParentExpanded,
				isParentArray: isParentArray
			} = $$props,
			{ expanded: expanded = !1 } = $$props;
		const filteredKey = new Set(['length']);
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'value' in $$props && $$invalidate(1, (value = $$props.value)),
					'isParentExpanded' in $$props &&
						$$invalidate(2, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(3, (isParentArray = $$props.isParentArray)),
					'expanded' in $$props && $$invalidate(4, (expanded = $$props.expanded));
			}),
			($$self.$$.update = () => {
				2 & $$self.$$.dirty && $$invalidate(5, (keys = Object.getOwnPropertyNames(value))),
					32 & $$self.$$.dirty &&
						$$invalidate(6, (previewKeys = keys.filter((key) => !filteredKey.has(key))));
			}),
			[
				key,
				value,
				isParentExpanded,
				isParentArray,
				expanded,
				keys,
				previewKeys,
				function (key) {
					return value[key];
				}
			]
		);
	}
	var JSONArrayNode$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$k, create_fragment$k, safe_not_equal, {
					key: 0,
					value: 1,
					isParentExpanded: 2,
					isParentArray: 3,
					expanded: 4
				});
		}
	};
	function create_fragment$j(ctx) {
		let jsonnested, current;
		return (
			(jsonnested = new JSONNested$1({
				props: {
					key: ctx[0],
					isParentExpanded: ctx[1],
					isParentArray: ctx[2],
					keys: ctx[4],
					getKey: getKey$1,
					getValue: getValue$1,
					isArray: !0,
					label: ctx[3] + '(' + ctx[4].length + ')',
					bracketOpen: '{',
					bracketClose: '}'
				}
			})),
			{
				c() {
					create_component(jsonnested.$$.fragment);
				},
				m(target, anchor) {
					mount_component(jsonnested, target, anchor), (current = !0);
				},
				p(ctx, [dirty]) {
					const jsonnested_changes = {};
					1 & dirty && (jsonnested_changes.key = ctx[0]),
						2 & dirty && (jsonnested_changes.isParentExpanded = ctx[1]),
						4 & dirty && (jsonnested_changes.isParentArray = ctx[2]),
						16 & dirty && (jsonnested_changes.keys = ctx[4]),
						24 & dirty && (jsonnested_changes.label = ctx[3] + '(' + ctx[4].length + ')'),
						jsonnested.$set(jsonnested_changes);
				},
				i(local) {
					current || (transition_in(jsonnested.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonnested.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(jsonnested, detaching);
				}
			}
		);
	}
	function getKey$1(key) {
		return String(key[0]);
	}
	function getValue$1(key) {
		return key[1];
	}
	function instance$j($$self, $$props, $$invalidate) {
		let {
				key: key,
				value: value,
				isParentExpanded: isParentExpanded,
				isParentArray: isParentArray,
				nodeType: nodeType
			} = $$props,
			keys = [];
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'value' in $$props && $$invalidate(5, (value = $$props.value)),
					'isParentExpanded' in $$props &&
						$$invalidate(1, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(2, (isParentArray = $$props.isParentArray)),
					'nodeType' in $$props && $$invalidate(3, (nodeType = $$props.nodeType));
			}),
			($$self.$$.update = () => {
				if (32 & $$self.$$.dirty) {
					let result = [],
						i = 0;
					for (const entry of value) result.push([i++, entry]);
					$$invalidate(4, (keys = result));
				}
			}),
			[key, isParentExpanded, isParentArray, nodeType, keys, value]
		);
	}
	var JSONIterableArrayNode$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$j, create_fragment$j, safe_not_equal, {
					key: 0,
					value: 5,
					isParentExpanded: 1,
					isParentArray: 2,
					nodeType: 3
				});
		}
	};
	class MapEntry {
		constructor(key, value) {
			(this.key = key), (this.value = value);
		}
	}
	function create_fragment$i(ctx) {
		let jsonnested, current;
		return (
			(jsonnested = new JSONNested$1({
				props: {
					key: ctx[0],
					isParentExpanded: ctx[1],
					isParentArray: ctx[2],
					keys: ctx[4],
					getKey: getKey,
					getValue: getValue,
					label: ctx[3] + '(' + ctx[4].length + ')',
					colon: '',
					bracketOpen: '{',
					bracketClose: '}'
				}
			})),
			{
				c() {
					create_component(jsonnested.$$.fragment);
				},
				m(target, anchor) {
					mount_component(jsonnested, target, anchor), (current = !0);
				},
				p(ctx, [dirty]) {
					const jsonnested_changes = {};
					1 & dirty && (jsonnested_changes.key = ctx[0]),
						2 & dirty && (jsonnested_changes.isParentExpanded = ctx[1]),
						4 & dirty && (jsonnested_changes.isParentArray = ctx[2]),
						16 & dirty && (jsonnested_changes.keys = ctx[4]),
						24 & dirty && (jsonnested_changes.label = ctx[3] + '(' + ctx[4].length + ')'),
						jsonnested.$set(jsonnested_changes);
				},
				i(local) {
					current || (transition_in(jsonnested.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonnested.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(jsonnested, detaching);
				}
			}
		);
	}
	function getKey(entry) {
		return entry[0];
	}
	function getValue(entry) {
		return entry[1];
	}
	function instance$i($$self, $$props, $$invalidate) {
		let {
				key: key,
				value: value,
				isParentExpanded: isParentExpanded,
				isParentArray: isParentArray,
				nodeType: nodeType
			} = $$props,
			keys = [];
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'value' in $$props && $$invalidate(5, (value = $$props.value)),
					'isParentExpanded' in $$props &&
						$$invalidate(1, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(2, (isParentArray = $$props.isParentArray)),
					'nodeType' in $$props && $$invalidate(3, (nodeType = $$props.nodeType));
			}),
			($$self.$$.update = () => {
				if (32 & $$self.$$.dirty) {
					let result = [],
						i = 0;
					for (const entry of value) result.push([i++, new MapEntry(entry[0], entry[1])]);
					$$invalidate(4, (keys = result));
				}
			}),
			[key, isParentExpanded, isParentArray, nodeType, keys, value]
		);
	}
	var JSONIterableMapNode$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$i, create_fragment$i, safe_not_equal, {
					key: 0,
					value: 5,
					isParentExpanded: 1,
					isParentArray: 2,
					nodeType: 3
				});
		}
	};
	function create_fragment$h(ctx) {
		let jsonnested, current;
		return (
			(jsonnested = new JSONNested$1({
				props: {
					expanded: ctx[4],
					isParentExpanded: ctx[2],
					isParentArray: ctx[3],
					key: ctx[2] ? String(ctx[0]) : ctx[1].key,
					keys: ctx[5],
					getValue: ctx[6],
					label: ctx[2] ? 'Entry ' : '=> ',
					bracketOpen: '{',
					bracketClose: '}'
				}
			})),
			{
				c() {
					create_component(jsonnested.$$.fragment);
				},
				m(target, anchor) {
					mount_component(jsonnested, target, anchor), (current = !0);
				},
				p(ctx, [dirty]) {
					const jsonnested_changes = {};
					16 & dirty && (jsonnested_changes.expanded = ctx[4]),
						4 & dirty && (jsonnested_changes.isParentExpanded = ctx[2]),
						8 & dirty && (jsonnested_changes.isParentArray = ctx[3]),
						7 & dirty && (jsonnested_changes.key = ctx[2] ? String(ctx[0]) : ctx[1].key),
						4 & dirty && (jsonnested_changes.label = ctx[2] ? 'Entry ' : '=> '),
						jsonnested.$set(jsonnested_changes);
				},
				i(local) {
					current || (transition_in(jsonnested.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonnested.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(jsonnested, detaching);
				}
			}
		);
	}
	function instance$h($$self, $$props, $$invalidate) {
		let {
				key: key,
				value: value,
				isParentExpanded: isParentExpanded,
				isParentArray: isParentArray
			} = $$props,
			{ expanded: expanded = !1 } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'value' in $$props && $$invalidate(1, (value = $$props.value)),
					'isParentExpanded' in $$props &&
						$$invalidate(2, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(3, (isParentArray = $$props.isParentArray)),
					'expanded' in $$props && $$invalidate(4, (expanded = $$props.expanded));
			}),
			[
				key,
				value,
				isParentExpanded,
				isParentArray,
				expanded,
				['key', 'value'],
				function (key) {
					return value[key];
				}
			]
		);
	}
	var JSONMapEntryNode$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$h, create_fragment$h, safe_not_equal, {
					key: 0,
					value: 1,
					isParentExpanded: 2,
					isParentArray: 3,
					expanded: 4
				});
		}
	};
	function add_css$a(target) {
		append_styles(
			target,
			'svelte-7a2chn',
			'li.svelte-7a2chn{user-select:text;word-wrap:break-word;word-break:break-all}.indent.svelte-7a2chn{padding-left:var(--li-identation)}.String.svelte-7a2chn{color:var(--string-color)}.Date.svelte-7a2chn{color:var(--date-color)}.Number.svelte-7a2chn{color:var(--number-color)}.Boolean.svelte-7a2chn{color:var(--boolean-color)}.Null.svelte-7a2chn{color:var(--null-color)}.Undefined.svelte-7a2chn{color:var(--undefined-color)}.Function.svelte-7a2chn{color:var(--function-color);font-style:italic}.Symbol.svelte-7a2chn{color:var(--symbol-color)}'
		);
	}
	function create_fragment$g(ctx) {
		let li,
			jsonkey,
			t0,
			span,
			t1,
			span_class_value,
			current,
			t1_value = (ctx[2] ? ctx[2](ctx[1]) : ctx[1]) + '';
		return (
			(jsonkey = new JSONKey$1({
				props: { key: ctx[0], colon: ctx[6], isParentExpanded: ctx[3], isParentArray: ctx[4] }
			})),
			{
				c() {
					(li = element('li')),
						create_component(jsonkey.$$.fragment),
						(t0 = space()),
						(span = element('span')),
						(t1 = text(t1_value)),
						attr(span, 'class', (span_class_value = null_to_empty(ctx[5]) + ' svelte-7a2chn')),
						attr(li, 'class', 'svelte-7a2chn'),
						toggle_class(li, 'indent', ctx[3]);
				},
				m(target, anchor) {
					insert(target, li, anchor),
						mount_component(jsonkey, li, null),
						append(li, t0),
						append(li, span),
						append(span, t1),
						(current = !0);
				},
				p(ctx, [dirty]) {
					const jsonkey_changes = {};
					1 & dirty && (jsonkey_changes.key = ctx[0]),
						8 & dirty && (jsonkey_changes.isParentExpanded = ctx[3]),
						16 & dirty && (jsonkey_changes.isParentArray = ctx[4]),
						jsonkey.$set(jsonkey_changes),
						(!current || 6 & dirty) &&
							t1_value !== (t1_value = (ctx[2] ? ctx[2](ctx[1]) : ctx[1]) + '') &&
							set_data(t1, t1_value),
						(!current ||
							(32 & dirty &&
								span_class_value !==
									(span_class_value = null_to_empty(ctx[5]) + ' svelte-7a2chn'))) &&
							attr(span, 'class', span_class_value),
						8 & dirty && toggle_class(li, 'indent', ctx[3]);
				},
				i(local) {
					current || (transition_in(jsonkey.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonkey.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(li), destroy_component(jsonkey);
				}
			}
		);
	}
	function instance$g($$self, $$props, $$invalidate) {
		let {
			key: key,
			value: value,
			valueGetter: valueGetter = null,
			isParentExpanded: isParentExpanded,
			isParentArray: isParentArray,
			nodeType: nodeType
		} = $$props;
		const { colon: colon } = getContext(contextKey);
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'value' in $$props && $$invalidate(1, (value = $$props.value)),
					'valueGetter' in $$props && $$invalidate(2, (valueGetter = $$props.valueGetter)),
					'isParentExpanded' in $$props &&
						$$invalidate(3, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(4, (isParentArray = $$props.isParentArray)),
					'nodeType' in $$props && $$invalidate(5, (nodeType = $$props.nodeType));
			}),
			[key, value, valueGetter, isParentExpanded, isParentArray, nodeType, colon]
		);
	}
	var JSONValueNode$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$g,
					create_fragment$g,
					safe_not_equal,
					{ key: 0, value: 1, valueGetter: 2, isParentExpanded: 3, isParentArray: 4, nodeType: 5 },
					add_css$a
				);
		}
	};
	function add_css$9(target) {
		append_styles(
			target,
			'svelte-1o36m4c',
			'li.svelte-1o36m4c{user-select:text;word-wrap:break-word;word-break:break-all}.indent.svelte-1o36m4c{padding-left:var(--li-identation)}.collapse.svelte-1o36m4c{--li-display:inline;display:inline;font-style:italic}'
		);
	}
	function get_each_context$4(ctx, list, i) {
		const child_ctx = ctx.slice();
		return (child_ctx[8] = list[i]), (child_ctx[10] = i), child_ctx;
	}
	function create_if_block_2$1(ctx) {
		let jsonarrow, current;
		return (
			(jsonarrow = new JSONArrow$1({ props: { expanded: ctx[0] } })),
			jsonarrow.$on('click', ctx[7]),
			{
				c() {
					create_component(jsonarrow.$$.fragment);
				},
				m(target, anchor) {
					mount_component(jsonarrow, target, anchor), (current = !0);
				},
				p(ctx, dirty) {
					const jsonarrow_changes = {};
					1 & dirty && (jsonarrow_changes.expanded = ctx[0]), jsonarrow.$set(jsonarrow_changes);
				},
				i(local) {
					current || (transition_in(jsonarrow.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonarrow.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(jsonarrow, detaching);
				}
			}
		);
	}
	function create_if_block$4(ctx) {
		let ul,
			current,
			if_block = ctx[0] && create_if_block_1$2(ctx);
		return {
			c() {
				(ul = element('ul')),
					if_block && if_block.c(),
					attr(ul, 'class', 'svelte-1o36m4c'),
					toggle_class(ul, 'collapse', !ctx[0]);
			},
			m(target, anchor) {
				insert(target, ul, anchor), if_block && if_block.m(ul, null), (current = !0);
			},
			p(ctx, dirty) {
				ctx[0]
					? if_block
						? (if_block.p(ctx, dirty), 1 & dirty && transition_in(if_block, 1))
						: ((if_block = create_if_block_1$2(ctx)),
						  if_block.c(),
						  transition_in(if_block, 1),
						  if_block.m(ul, null))
					: if_block &&
					  (group_outros(),
					  transition_out(if_block, 1, 1, () => {
							if_block = null;
					  }),
					  check_outros()),
					1 & dirty && toggle_class(ul, 'collapse', !ctx[0]);
			},
			i(local) {
				current || (transition_in(if_block), (current = !0));
			},
			o(local) {
				transition_out(if_block), (current = !1);
			},
			d(detaching) {
				detaching && detach(ul), if_block && if_block.d();
			}
		};
	}
	function create_if_block_1$2(ctx) {
		let jsonnode, t0, li, jsonkey, t1, span, current;
		(jsonnode = new JSONNode$1({ props: { key: 'message', value: ctx[2].message } })),
			(jsonkey = new JSONKey$1({ props: { key: 'stack', colon: ':', isParentExpanded: ctx[3] } }));
		let each_value = ctx[5],
			each_blocks = [];
		for (let i = 0; i < each_value.length; i += 1)
			each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
		return {
			c() {
				create_component(jsonnode.$$.fragment),
					(t0 = space()),
					(li = element('li')),
					create_component(jsonkey.$$.fragment),
					(t1 = space()),
					(span = element('span'));
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
				attr(li, 'class', 'svelte-1o36m4c');
			},
			m(target, anchor) {
				mount_component(jsonnode, target, anchor),
					insert(target, t0, anchor),
					insert(target, li, anchor),
					mount_component(jsonkey, li, null),
					append(li, t1),
					append(li, span);
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(span, null);
				current = !0;
			},
			p(ctx, dirty) {
				const jsonnode_changes = {};
				4 & dirty && (jsonnode_changes.value = ctx[2].message), jsonnode.$set(jsonnode_changes);
				const jsonkey_changes = {};
				if (
					(8 & dirty && (jsonkey_changes.isParentExpanded = ctx[3]),
					jsonkey.$set(jsonkey_changes),
					32 & dirty)
				) {
					let i;
					for (each_value = ctx[5], i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);
						each_blocks[i]
							? each_blocks[i].p(child_ctx, dirty)
							: ((each_blocks[i] = create_each_block$4(child_ctx)),
							  each_blocks[i].c(),
							  each_blocks[i].m(span, null));
					}
					for (; i < each_blocks.length; i += 1) each_blocks[i].d(1);
					each_blocks.length = each_value.length;
				}
			},
			i(local) {
				current ||
					(transition_in(jsonnode.$$.fragment, local),
					transition_in(jsonkey.$$.fragment, local),
					(current = !0));
			},
			o(local) {
				transition_out(jsonnode.$$.fragment, local),
					transition_out(jsonkey.$$.fragment, local),
					(current = !1);
			},
			d(detaching) {
				destroy_component(jsonnode, detaching),
					detaching && detach(t0),
					detaching && detach(li),
					destroy_component(jsonkey),
					destroy_each(each_blocks, detaching);
			}
		};
	}
	function create_each_block$4(ctx) {
		let span,
			t,
			br,
			t_value = ctx[8] + '';
		return {
			c() {
				(span = element('span')),
					(t = text(t_value)),
					(br = element('br')),
					attr(span, 'class', 'svelte-1o36m4c'),
					toggle_class(span, 'indent', ctx[10] > 0);
			},
			m(target, anchor) {
				insert(target, span, anchor), append(span, t), insert(target, br, anchor);
			},
			p(ctx, dirty) {
				32 & dirty && t_value !== (t_value = ctx[8] + '') && set_data(t, t_value);
			},
			d(detaching) {
				detaching && detach(span), detaching && detach(br);
			}
		};
	}
	function create_fragment$f(ctx) {
		let li,
			t0,
			jsonkey,
			t1,
			span,
			t2,
			t3,
			t4,
			current,
			mounted,
			dispose,
			t3_value = (ctx[0] ? '' : ctx[2].message) + '',
			if_block0 = ctx[3] && create_if_block_2$1(ctx);
		jsonkey = new JSONKey$1({
			props: { key: ctx[1], colon: ctx[6].colon, isParentExpanded: ctx[3], isParentArray: ctx[4] }
		});
		let if_block1 = ctx[3] && create_if_block$4(ctx);
		return {
			c() {
				(li = element('li')),
					if_block0 && if_block0.c(),
					(t0 = space()),
					create_component(jsonkey.$$.fragment),
					(t1 = space()),
					(span = element('span')),
					(t2 = text('Error: ')),
					(t3 = text(t3_value)),
					(t4 = space()),
					if_block1 && if_block1.c(),
					attr(li, 'class', 'svelte-1o36m4c'),
					toggle_class(li, 'indent', ctx[3]);
			},
			m(target, anchor) {
				insert(target, li, anchor),
					if_block0 && if_block0.m(li, null),
					append(li, t0),
					mount_component(jsonkey, li, null),
					append(li, t1),
					append(li, span),
					append(span, t2),
					append(span, t3),
					append(li, t4),
					if_block1 && if_block1.m(li, null),
					(current = !0),
					mounted || ((dispose = listen(span, 'click', ctx[7])), (mounted = !0));
			},
			p(ctx, [dirty]) {
				ctx[3]
					? if_block0
						? (if_block0.p(ctx, dirty), 8 & dirty && transition_in(if_block0, 1))
						: ((if_block0 = create_if_block_2$1(ctx)),
						  if_block0.c(),
						  transition_in(if_block0, 1),
						  if_block0.m(li, t0))
					: if_block0 &&
					  (group_outros(),
					  transition_out(if_block0, 1, 1, () => {
							if_block0 = null;
					  }),
					  check_outros());
				const jsonkey_changes = {};
				2 & dirty && (jsonkey_changes.key = ctx[1]),
					8 & dirty && (jsonkey_changes.isParentExpanded = ctx[3]),
					16 & dirty && (jsonkey_changes.isParentArray = ctx[4]),
					jsonkey.$set(jsonkey_changes),
					(!current || 5 & dirty) &&
						t3_value !== (t3_value = (ctx[0] ? '' : ctx[2].message) + '') &&
						set_data(t3, t3_value),
					ctx[3]
						? if_block1
							? (if_block1.p(ctx, dirty), 8 & dirty && transition_in(if_block1, 1))
							: ((if_block1 = create_if_block$4(ctx)),
							  if_block1.c(),
							  transition_in(if_block1, 1),
							  if_block1.m(li, null))
						: if_block1 &&
						  (group_outros(),
						  transition_out(if_block1, 1, 1, () => {
								if_block1 = null;
						  }),
						  check_outros()),
					8 & dirty && toggle_class(li, 'indent', ctx[3]);
			},
			i(local) {
				current ||
					(transition_in(if_block0),
					transition_in(jsonkey.$$.fragment, local),
					transition_in(if_block1),
					(current = !0));
			},
			o(local) {
				transition_out(if_block0),
					transition_out(jsonkey.$$.fragment, local),
					transition_out(if_block1),
					(current = !1);
			},
			d(detaching) {
				detaching && detach(li),
					if_block0 && if_block0.d(),
					destroy_component(jsonkey),
					if_block1 && if_block1.d(),
					(mounted = !1),
					dispose();
			}
		};
	}
	function instance$f($$self, $$props, $$invalidate) {
		let stack,
			{
				key: key,
				value: value,
				isParentExpanded: isParentExpanded,
				isParentArray: isParentArray
			} = $$props,
			{ expanded: expanded = !1 } = $$props;
		const context = getContext(contextKey);
		return (
			setContext(contextKey, { ...context, colon: ':' }),
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(1, (key = $$props.key)),
					'value' in $$props && $$invalidate(2, (value = $$props.value)),
					'isParentExpanded' in $$props &&
						$$invalidate(3, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(4, (isParentArray = $$props.isParentArray)),
					'expanded' in $$props && $$invalidate(0, (expanded = $$props.expanded));
			}),
			($$self.$$.update = () => {
				4 & $$self.$$.dirty && $$invalidate(5, (stack = value.stack.split('\n'))),
					8 & $$self.$$.dirty && (isParentExpanded || $$invalidate(0, (expanded = !1)));
			}),
			[
				expanded,
				key,
				value,
				isParentExpanded,
				isParentArray,
				stack,
				context,
				function () {
					$$invalidate(0, (expanded = !expanded));
				}
			]
		);
	}
	var ErrorNode$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$f,
					create_fragment$f,
					safe_not_equal,
					{ key: 1, value: 2, isParentExpanded: 3, isParentArray: 4, expanded: 0 },
					add_css$9
				);
		}
	};
	function create_fragment$e(ctx) {
		let switch_instance, switch_instance_anchor, current;
		var switch_value = ctx[6];
		function switch_props(ctx) {
			return {
				props: {
					key: ctx[0],
					value: ctx[1],
					isParentExpanded: ctx[2],
					isParentArray: ctx[3],
					nodeType: ctx[4],
					valueGetter: ctx[5]
				}
			};
		}
		return (
			switch_value && (switch_instance = new switch_value(switch_props(ctx))),
			{
				c() {
					switch_instance && create_component(switch_instance.$$.fragment),
						(switch_instance_anchor = empty());
				},
				m(target, anchor) {
					switch_instance && mount_component(switch_instance, target, anchor),
						insert(target, switch_instance_anchor, anchor),
						(current = !0);
				},
				p(ctx, [dirty]) {
					const switch_instance_changes = {};
					if (
						(1 & dirty && (switch_instance_changes.key = ctx[0]),
						2 & dirty && (switch_instance_changes.value = ctx[1]),
						4 & dirty && (switch_instance_changes.isParentExpanded = ctx[2]),
						8 & dirty && (switch_instance_changes.isParentArray = ctx[3]),
						16 & dirty && (switch_instance_changes.nodeType = ctx[4]),
						32 & dirty && (switch_instance_changes.valueGetter = ctx[5]),
						switch_value !== (switch_value = ctx[6]))
					) {
						if (switch_instance) {
							group_outros();
							const old_component = switch_instance;
							transition_out(old_component.$$.fragment, 1, 0, () => {
								destroy_component(old_component, 1);
							}),
								check_outros();
						}
						switch_value
							? ((switch_instance = new switch_value(switch_props(ctx))),
							  create_component(switch_instance.$$.fragment),
							  transition_in(switch_instance.$$.fragment, 1),
							  mount_component(
									switch_instance,
									switch_instance_anchor.parentNode,
									switch_instance_anchor
							  ))
							: (switch_instance = null);
					} else switch_value && switch_instance.$set(switch_instance_changes);
				},
				i(local) {
					current ||
						(switch_instance && transition_in(switch_instance.$$.fragment, local), (current = !0));
				},
				o(local) {
					switch_instance && transition_out(switch_instance.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(switch_instance_anchor),
						switch_instance && destroy_component(switch_instance, detaching);
				}
			}
		);
	}
	function formatMilliSeconds(milliSeconds) {
		let seconds = Math.floor(milliSeconds / 1e3);
		if (0 === (milliSeconds %= 1e3)) return '-';
		let minutes = Math.floor(seconds / 60);
		return (
			(seconds %= 60),
			0 !== minutes
				? `+${minutes.toString().padStart(2, '0')}:${seconds
						.toString()
						.padStart(2, '0')}.${milliSeconds.toString().padStart(3, '0')}`
				: `+${seconds.toString()}.${milliSeconds.toString().padStart(3, '0')}`
		);
	}
	function instance$e($$self, $$props, $$invalidate) {
		let nodeType, componentType, valueGetter, $timestampViewStream;
		component_subscribe($$self, timestampViewStream, ($$value) =>
			$$invalidate(7, ($timestampViewStream = $$value))
		);
		let {
			key: key,
			value: value,
			isParentExpanded: isParentExpanded,
			isParentArray: isParentArray
		} = $$props;
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'value' in $$props && $$invalidate(1, (value = $$props.value)),
					'isParentExpanded' in $$props &&
						$$invalidate(2, (isParentExpanded = $$props.isParentExpanded)),
					'isParentArray' in $$props && $$invalidate(3, (isParentArray = $$props.isParentArray));
			}),
			($$self.$$.update = () => {
				2 & $$self.$$.dirty &&
					$$invalidate(
						4,
						(nodeType = (function (obj) {
							const type = Object.prototype.toString.call(obj).slice(8, -1);
							return 'Object' === type
								? 'function' == typeof obj[Symbol.iterator]
									? 'Iterable'
									: 'Object'
								: type;
						})(value))
					),
					16 & $$self.$$.dirty &&
						$$invalidate(
							6,
							(componentType = (function (nodeType) {
								switch (nodeType) {
									case 'Object':
										return JSONObjectNode$1;
									case 'Error':
										return ErrorNode$1;
									case 'Array':
										return JSONArrayNode$1;
									case 'Iterable':
									case 'Map':
									case 'Set':
										return 'function' == typeof value.set
											? JSONIterableMapNode$1
											: JSONIterableArrayNode$1;
									case 'MapEntry':
										return JSONMapEntryNode$1;
									default:
										return JSONValueNode$1;
								}
							})(nodeType))
						),
					144 & $$self.$$.dirty &&
						$$invalidate(
							5,
							(valueGetter = (function (nodeType, timeStampView) {
								switch (nodeType) {
									case 'Object':
									case 'Error':
									case 'Array':
									case 'Iterable':
									case 'Map':
									case 'Set':
									case 'MapEntry':
									case 'Number':
										return;
									case 'String':
										return (raw) => `"${raw}"`;
									case 'Boolean':
										return (raw) => (raw ? 'true' : 'false');
									case 'Date':
										switch (timeStampView) {
											case exports.TimeStampView.absoluteDateAndTime:
												return (raw) => raw.toISOString();
											case exports.TimeStampView.absoluteTime:
												return (raw) => raw.toISOString().split('T')[1].split('Z')[0];
											case exports.TimeStampView.timeSinceAppStart:
												return (raw) => `[ ${formatMilliSeconds(raw - raw.initTimestamp)} ]`;
											default:
												return (raw) =>
													raw.previousTimestamp
														? '+' + formatMilliSeconds(raw - raw.previousTimestamp)
														: '0';
										}
									case 'Null':
										return () => 'null';
									case 'Undefined':
										return () => 'undefined';
									case 'Function':
									case 'Symbol':
										return (raw) => raw.toString();
									default:
										return () => `<${nodeType}>`;
								}
							})(nodeType, $timestampViewStream))
						);
			}),
			[
				key,
				value,
				isParentExpanded,
				isParentArray,
				nodeType,
				valueGetter,
				componentType,
				$timestampViewStream
			]
		);
	}
	var JSONNode$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$e, create_fragment$e, safe_not_equal, {
					key: 0,
					value: 1,
					isParentExpanded: 2,
					isParentArray: 3
				});
		}
	};
	function add_css$8(target) {
		append_styles(
			target,
			'svelte-1c2lxe3',
			"ul.svelte-1c2lxe3{--string-color:var(--json-tree-string-color, #cb3f41);--symbol-color:var(--json-tree-symbol-color, #cb3f41);--boolean-color:var(--json-tree-boolean-color, #112aa7);--function-color:var(--json-tree-function-color, #112aa7);--number-color:var(--json-tree-number-color, #3029cf);--label-color:var(--json-tree-label-color, #871d8f);--arrow-color:var(--json-tree-arrow-color, #727272);--null-color:var(--json-tree-null-color, #8d8d8d);--undefined-color:var(--json-tree-undefined-color, #8d8d8d);--date-color:var(--json-tree-date-color, #8d8d8d);--li-identation:var(--json-tree-li-indentation, 1em);--li-line-height:var(--json-tree-li-line-height, 1.3);--li-colon-space:0.3em;font-size:var(--json-tree-font-size, 12px);font-family:var(--json-tree-font-family, 'Courier New', Courier, monospace)}ul.svelte-1c2lxe3 li{line-height:var(--li-line-height);display:var(--li-display, list-item);list-style:none}ul.svelte-1c2lxe3,ul.svelte-1c2lxe3 ul{padding:0;margin:0}"
		);
	}
	function create_fragment$d(ctx) {
		let ul, jsonnode, current;
		return (
			(jsonnode = new JSONNode$1({
				props: { key: ctx[0], value: ctx[1], isParentExpanded: !0, isParentArray: !1 }
			})),
			{
				c() {
					(ul = element('ul')),
						create_component(jsonnode.$$.fragment),
						attr(ul, 'class', 'svelte-1c2lxe3');
				},
				m(target, anchor) {
					insert(target, ul, anchor), mount_component(jsonnode, ul, null), (current = !0);
				},
				p(ctx, [dirty]) {
					const jsonnode_changes = {};
					1 & dirty && (jsonnode_changes.key = ctx[0]),
						2 & dirty && (jsonnode_changes.value = ctx[1]),
						jsonnode.$set(jsonnode_changes);
				},
				i(local) {
					current || (transition_in(jsonnode.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsonnode.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(ul), destroy_component(jsonnode);
				}
			}
		);
	}
	function instance$d($$self, $$props, $$invalidate) {
		setContext(contextKey, {});
		let { key: key = '', value: value } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'key' in $$props && $$invalidate(0, (key = $$props.key)),
					'value' in $$props && $$invalidate(1, (value = $$props.value));
			}),
			[key, value]
		);
	}
	var JSONTree = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$d,
					create_fragment$d,
					safe_not_equal,
					{ key: 0, value: 1 },
					add_css$8
				);
		}
	};
	function add_css$7(target) {
		append_styles(
			target,
			'svelte-1ewfox0',
			'text.svelte-1ewfox0{font-family:Arial, Helvetica, sans-serif;font-size:0.8em}'
		);
	}
	function create_fragment$c(ctx) {
		let text_1, t;
		return {
			c() {
				(text_1 = svg_element('text')),
					(t = text(ctx[0])),
					attr(text_1, 'alignment-baseline', 'middle'),
					attr(text_1, 'fill', 'white'),
					attr(text_1, 'text-anchor', 'middle'),
					attr(text_1, 'class', 'svelte-1ewfox0');
			},
			m(target, anchor) {
				insert(target, text_1, anchor), append(text_1, t);
			},
			p(ctx, [dirty]) {
				1 & dirty && set_data(t, ctx[0]);
			},
			i: noop,
			o: noop,
			d(detaching) {
				detaching && detach(text_1);
			}
		};
	}
	function instance$c($$self, $$props, $$invalidate) {
		let { info: info } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'info' in $$props && $$invalidate(0, (info = $$props.info));
			}),
			[info]
		);
	}
	var MarbleInfo$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$c, create_fragment$c, safe_not_equal, { info: 0 }, add_css$7);
		}
	};
	function add_css$6(target) {
		append_styles(
			target,
			'svelte-1prc7gw',
			'.rotate.svelte-1prc7gw{opacity:0.4;animation:svelte-1prc7gw-rotate 8s infinite linear}.pulse.svelte-1prc7gw{display:none}@keyframes svelte-1prc7gw-rotate{from{transform:scale(1) rotate(0deg)}to{transform:scale(1) rotate(360deg)}}@keyframes svelte-1prc7gw-pulse{0%{transform:scale(0)}50%{transform:scale(1)}70%{transform:scale(0.32)}100%{transform:scale(0)}}'
		);
	}
	function create_fragment$b(ctx) {
		let g,
			circle0,
			circle0_r_value,
			circle1,
			circle1_fill_value,
			circle1_r_value,
			t,
			marbleinfo,
			current;
		return (
			(marbleinfo = new MarbleInfo$1({ props: { info: ctx[1]?.ordinal ?? '-' } })),
			{
				c() {
					(g = svg_element('g')),
						(circle0 = svg_element('circle')),
						(circle1 = svg_element('circle')),
						(t = space()),
						create_component(marbleinfo.$$.fragment),
						attr(circle0, 'fill', 'none'),
						attr(circle0, 'stroke', 'silver'),
						attr(circle0, 'stroke-width', '1.2'),
						attr(circle0, 'stroke-dasharray', '4 4'),
						attr(circle0, 'r', (circle0_r_value = 0.7 * ctx[0])),
						attr(
							circle1,
							'fill',
							(circle1_fill_value = ctx[3] ? '#9B3030' : ctx[2] ? 'silver' : '#007ACC')
						),
						attr(circle1, 'r', (circle1_r_value = 0.5 * ctx[0])),
						attr(circle1, 'class', 'svelte-1prc7gw'),
						toggle_class(circle1, 'pulse', ctx[2] && !ctx[3]),
						attr(g, 'class', 'svelte-1prc7gw'),
						toggle_class(g, 'rotate', ctx[2] && !ctx[3]);
				},
				m(target, anchor) {
					insert(target, g, anchor),
						append(g, circle0),
						append(g, circle1),
						insert(target, t, anchor),
						mount_component(marbleinfo, target, anchor),
						(current = !0);
				},
				p(ctx, [dirty]) {
					(!current || (1 & dirty && circle0_r_value !== (circle0_r_value = 0.7 * ctx[0]))) &&
						attr(circle0, 'r', circle0_r_value),
						(!current ||
							(12 & dirty &&
								circle1_fill_value !==
									(circle1_fill_value = ctx[3] ? '#9B3030' : ctx[2] ? 'silver' : '#007ACC'))) &&
							attr(circle1, 'fill', circle1_fill_value),
						(!current || (1 & dirty && circle1_r_value !== (circle1_r_value = 0.5 * ctx[0]))) &&
							attr(circle1, 'r', circle1_r_value),
						12 & dirty && toggle_class(circle1, 'pulse', ctx[2] && !ctx[3]),
						12 & dirty && toggle_class(g, 'rotate', ctx[2] && !ctx[3]);
					const marbleinfo_changes = {};
					2 & dirty && (marbleinfo_changes.info = ctx[1]?.ordinal ?? '-'),
						marbleinfo.$set(marbleinfo_changes);
				},
				i(local) {
					current || (transition_in(marbleinfo.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(marbleinfo.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(g), detaching && detach(t), destroy_component(marbleinfo, detaching);
				}
			}
		);
	}
	function instance$b($$self, $$props, $$invalidate) {
		let error,
			pending,
			{ size: size = 10 } = $$props,
			{ event: event } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'size' in $$props && $$invalidate(0, (size = $$props.size)),
					'event' in $$props && $$invalidate(1, (event = $$props.event));
			}),
			($$self.$$.update = () => {
				2 & $$self.$$.dirty &&
					$$invalidate(3, (error = event.type === exports.AVStreamEventType.avError)),
					2 & $$self.$$.dirty &&
						$$invalidate(2, (pending = event.type === exports.AVStreamEventType.avPending));
			}),
			[size, event, pending, error]
		);
	}
	var AVValueMarble$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$b,
					create_fragment$b,
					safe_not_equal,
					{ size: 0, event: 1 },
					add_css$6
				);
		}
	};
	function create_fragment$a(ctx) {
		let line,
			line_x__value,
			line_y__value,
			line_x__value_1,
			line_y__value_1,
			t,
			marbleinfo,
			current;
		return (
			(marbleinfo = new MarbleInfo$1({ props: { info: ctx[1]?.ordinal ?? '-' } })),
			{
				c() {
					(line = svg_element('line')),
						(t = space()),
						create_component(marbleinfo.$$.fragment),
						attr(line, 'x1', (line_x__value = ctx[0] / 2)),
						attr(line, 'y1', (line_y__value = -ctx[0] / 2)),
						attr(line, 'x2', (line_x__value_1 = ctx[0] / 2)),
						attr(line, 'y2', (line_y__value_1 = ctx[0] / 2)),
						attr(line, 'stroke', 'white'),
						attr(line, 'stroke-width', '1');
				},
				m(target, anchor) {
					insert(target, line, anchor),
						insert(target, t, anchor),
						mount_component(marbleinfo, target, anchor),
						(current = !0);
				},
				p(ctx, [dirty]) {
					(!current || (1 & dirty && line_x__value !== (line_x__value = ctx[0] / 2))) &&
						attr(line, 'x1', line_x__value),
						(!current || (1 & dirty && line_y__value !== (line_y__value = -ctx[0] / 2))) &&
							attr(line, 'y1', line_y__value),
						(!current || (1 & dirty && line_x__value_1 !== (line_x__value_1 = ctx[0] / 2))) &&
							attr(line, 'x2', line_x__value_1),
						(!current || (1 & dirty && line_y__value_1 !== (line_y__value_1 = ctx[0] / 2))) &&
							attr(line, 'y2', line_y__value_1);
					const marbleinfo_changes = {};
					2 & dirty && (marbleinfo_changes.info = ctx[1]?.ordinal ?? '-'),
						marbleinfo.$set(marbleinfo_changes);
				},
				i(local) {
					current || (transition_in(marbleinfo.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(marbleinfo.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(line),
						detaching && detach(t),
						destroy_component(marbleinfo, detaching);
				}
			}
		);
	}
	function instance$a($$self, $$props, $$invalidate) {
		let { size: size = 10 } = $$props,
			{ event: event } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'size' in $$props && $$invalidate(0, (size = $$props.size)),
					'event' in $$props && $$invalidate(1, (event = $$props.event));
			}),
			[size, event]
		);
	}
	var CompleteMarble$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$a, create_fragment$a, safe_not_equal, { size: 0, event: 1 });
		}
	};
	function create_fragment$9(ctx) {
		let polygon, polygon_points_value, t, marbleinfo, current;
		return (
			(marbleinfo = new MarbleInfo$1({ props: { info: ctx[1]?.ordinal ?? '-' } })),
			{
				c() {
					(polygon = svg_element('polygon')),
						(t = space()),
						create_component(marbleinfo.$$.fragment),
						attr(
							polygon,
							'points',
							(polygon_points_value =
								'0,' +
								-ctx[0] / 2 +
								' ' +
								-ctx[0] / 2 +
								',' +
								ctx[0] / 2 +
								' ' +
								ctx[0] / 2 +
								',' +
								ctx[0] / 2)
						),
						attr(polygon, 'fill', '#9B3030');
				},
				m(target, anchor) {
					insert(target, polygon, anchor),
						insert(target, t, anchor),
						mount_component(marbleinfo, target, anchor),
						(current = !0);
				},
				p(ctx, [dirty]) {
					(!current ||
						(1 & dirty &&
							polygon_points_value !==
								(polygon_points_value =
									'0,' +
									-ctx[0] / 2 +
									' ' +
									-ctx[0] / 2 +
									',' +
									ctx[0] / 2 +
									' ' +
									ctx[0] / 2 +
									',' +
									ctx[0] / 2))) &&
						attr(polygon, 'points', polygon_points_value);
					const marbleinfo_changes = {};
					2 & dirty && (marbleinfo_changes.info = ctx[1]?.ordinal ?? '-'),
						marbleinfo.$set(marbleinfo_changes);
				},
				i(local) {
					current || (transition_in(marbleinfo.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(marbleinfo.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(polygon),
						detaching && detach(t),
						destroy_component(marbleinfo, detaching);
				}
			}
		);
	}
	function instance$9($$self, $$props, $$invalidate) {
		let { size: size = 10 } = $$props,
			{ event: event } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'size' in $$props && $$invalidate(0, (size = $$props.size)),
					'event' in $$props && $$invalidate(1, (event = $$props.event));
			}),
			[size, event]
		);
	}
	var ErrorMarble$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$9, create_fragment$9, safe_not_equal, { size: 0, event: 1 });
		}
	};
	function create_fragment$8(ctx) {
		let circle, circle_r_value, t, marbleinfo, current, mounted, dispose;
		return (
			(marbleinfo = new MarbleInfo$1({ props: { info: ctx[3]?.ordinal ?? '-' } })),
			{
				c() {
					(circle = svg_element('circle')),
						(t = space()),
						create_component(marbleinfo.$$.fragment),
						attr(circle, 'cx', ctx[0]),
						attr(circle, 'cy', ctx[1]),
						attr(circle, 'r', (circle_r_value = ctx[2] / 2)),
						attr(circle, 'fill', '#007ACC');
				},
				m(target, anchor) {
					insert(target, circle, anchor),
						insert(target, t, anchor),
						mount_component(marbleinfo, target, anchor),
						(current = !0),
						mounted || ((dispose = listen(circle, 'click', ctx[4])), (mounted = !0));
				},
				p(ctx, [dirty]) {
					(!current || 1 & dirty) && attr(circle, 'cx', ctx[0]),
						(!current || 2 & dirty) && attr(circle, 'cy', ctx[1]),
						(!current || (4 & dirty && circle_r_value !== (circle_r_value = ctx[2] / 2))) &&
							attr(circle, 'r', circle_r_value);
					const marbleinfo_changes = {};
					8 & dirty && (marbleinfo_changes.info = ctx[3]?.ordinal ?? '-'),
						marbleinfo.$set(marbleinfo_changes);
				},
				i(local) {
					current || (transition_in(marbleinfo.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(marbleinfo.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(circle),
						detaching && detach(t),
						destroy_component(marbleinfo, detaching),
						(mounted = !1),
						dispose();
				}
			}
		);
	}
	function instance$8($$self, $$props, $$invalidate) {
		let { x: x = 0 } = $$props,
			{ y: y = 0 } = $$props,
			{ size: size = 10 } = $$props,
			{ event: event } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'x' in $$props && $$invalidate(0, (x = $$props.x)),
					'y' in $$props && $$invalidate(1, (y = $$props.y)),
					'size' in $$props && $$invalidate(2, (size = $$props.size)),
					'event' in $$props && $$invalidate(3, (event = $$props.event));
			}),
			[
				x,
				y,
				size,
				event,
				function (event) {
					bubble.call(this, $$self, event);
				}
			]
		);
	}
	var ValueMarble$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$8, create_fragment$8, safe_not_equal, {
					x: 0,
					y: 1,
					size: 2,
					event: 3
				});
		}
	};
	function create_if_block$3(ctx) {
		let switch_instance, switch_instance_anchor, current;
		var switch_value = asyncValueTypes.get(ctx[1].type);
		function switch_props(ctx) {
			return { props: { event: ctx[1], size: ctx[0] } };
		}
		return (
			switch_value && (switch_instance = new switch_value(switch_props(ctx))),
			{
				c() {
					switch_instance && create_component(switch_instance.$$.fragment),
						(switch_instance_anchor = empty());
				},
				m(target, anchor) {
					switch_instance && mount_component(switch_instance, target, anchor),
						insert(target, switch_instance_anchor, anchor),
						(current = !0);
				},
				p(ctx, dirty) {
					const switch_instance_changes = {};
					if (
						(2 & dirty && (switch_instance_changes.event = ctx[1]),
						1 & dirty && (switch_instance_changes.size = ctx[0]),
						switch_value !== (switch_value = asyncValueTypes.get(ctx[1].type)))
					) {
						if (switch_instance) {
							group_outros();
							const old_component = switch_instance;
							transition_out(old_component.$$.fragment, 1, 0, () => {
								destroy_component(old_component, 1);
							}),
								check_outros();
						}
						switch_value
							? ((switch_instance = new switch_value(switch_props(ctx))),
							  create_component(switch_instance.$$.fragment),
							  transition_in(switch_instance.$$.fragment, 1),
							  mount_component(
									switch_instance,
									switch_instance_anchor.parentNode,
									switch_instance_anchor
							  ))
							: (switch_instance = null);
					} else switch_value && switch_instance.$set(switch_instance_changes);
				},
				i(local) {
					current ||
						(switch_instance && transition_in(switch_instance.$$.fragment, local), (current = !0));
				},
				o(local) {
					switch_instance && transition_out(switch_instance.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(switch_instance_anchor),
						switch_instance && destroy_component(switch_instance, detaching);
				}
			}
		);
	}
	function create_fragment$7(ctx) {
		let if_block_anchor,
			current,
			show_if = asyncValueTypes.get(ctx[1]?.type),
			if_block = show_if && create_if_block$3(ctx);
		return {
			c() {
				if_block && if_block.c(), (if_block_anchor = empty());
			},
			m(target, anchor) {
				if_block && if_block.m(target, anchor),
					insert(target, if_block_anchor, anchor),
					(current = !0);
			},
			p(ctx, [dirty]) {
				2 & dirty && (show_if = asyncValueTypes.get(ctx[1]?.type)),
					show_if
						? if_block
							? (if_block.p(ctx, dirty), 2 & dirty && transition_in(if_block, 1))
							: ((if_block = create_if_block$3(ctx)),
							  if_block.c(),
							  transition_in(if_block, 1),
							  if_block.m(if_block_anchor.parentNode, if_block_anchor))
						: if_block &&
						  (group_outros(),
						  transition_out(if_block, 1, 1, () => {
								if_block = null;
						  }),
						  check_outros());
			},
			i(local) {
				current || (transition_in(if_block), (current = !0));
			},
			o(local) {
				transition_out(if_block), (current = !1);
			},
			d(detaching) {
				if_block && if_block.d(detaching), detaching && detach(if_block_anchor);
			}
		};
	}
	const asyncValueTypes = new Map([
		[exports.AVStreamEventType.avError, AVValueMarble$1],
		[exports.AVStreamEventType.avPending, AVValueMarble$1],
		[exports.AVStreamEventType.avValue, AVValueMarble$1],
		[exports.AVStreamEventType.complete, CompleteMarble$1],
		[exports.AVStreamEventType.error, ErrorMarble$1],
		[exports.AVStreamEventType.value, ValueMarble$1]
	]);
	function instance$7($$self, $$props, $$invalidate) {
		let { size: size = 10 } = $$props,
			{ event: event } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'size' in $$props && $$invalidate(0, (size = $$props.size)),
					'event' in $$props && $$invalidate(1, (event = $$props.event));
			}),
			[size, event]
		);
	}
	var GenericMarble$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$7, create_fragment$7, safe_not_equal, { size: 0, event: 1 });
		}
	};
	function getAppStateAtEvent(streams, event, _) {
		const streamMap = new Map();
		return (
			streams.forEach((stream) => {
				const phasesMap = new Map();
				stream.phases.forEach((phase) =>
					phasesMap.set(
						phase,
						event
							? AVWatch.eventByIdOrOlder(stream.name, phase, event.id)
							: AVWatch.latestEventByPhase(stream.name, phase)
					)
				),
					streamMap.set(stream.name, phasesMap);
			}),
			streamMap
		);
	}
	function cubicOut(t) {
		const f = t - 1;
		return f * f * f + 1;
	}
	function fade(
		node,
		{ delay: delay = 0, duration: duration = 400, easing: easing = identity } = {}
	) {
		const o = +getComputedStyle(node).opacity;
		return { delay: delay, duration: duration, easing: easing, css: (t) => 'opacity: ' + t * o };
	}
	function slide(
		node,
		{ delay: delay = 0, duration: duration = 400, easing: easing = cubicOut } = {}
	) {
		const style = getComputedStyle(node),
			opacity = +style.opacity,
			height = parseFloat(style.height),
			padding_top = parseFloat(style.paddingTop),
			padding_bottom = parseFloat(style.paddingBottom),
			margin_top = parseFloat(style.marginTop),
			margin_bottom = parseFloat(style.marginBottom),
			border_top_width = parseFloat(style.borderTopWidth),
			border_bottom_width = parseFloat(style.borderBottomWidth);
		return {
			delay: delay,
			duration: duration,
			easing: easing,
			css: (t) =>
				`overflow: hidden;opacity: ${Math.min(20 * t, 1) * opacity};height: ${
					t * height
				}px;padding-top: ${t * padding_top}px;padding-bottom: ${t * padding_bottom}px;margin-top: ${
					t * margin_top
				}px;margin-bottom: ${t * margin_bottom}px;border-top-width: ${
					t * border_top_width
				}px;border-bottom-width: ${t * border_bottom_width}px;`
		};
	}
	function add_css$5(target) {
		append_styles(
			target,
			'svelte-1gfdkaw',
			'.event-view.svelte-1gfdkaw{min-height:0;display:grid;grid-template-rows:auto 1fr;grid-template-columns:1fr;background:#1b2b34;border-left:1px solid black;font-family:var(--json-tree-font-family);font-size:var(--json-tree-font-size)}.event-view-header.svelte-1gfdkaw{padding:10px 16px 6px;background:rgb(23, 23, 23)}.event-view-content.svelte-1gfdkaw{position:relative;overflow:auto;padding:16px}.event-view-headline.svelte-1gfdkaw{margin-top:1em;padding:0.5em 0;color:#bc80b3}.event-view-label.svelte-1gfdkaw{opacity:0.4}.stream-info.svelte-1gfdkaw{margin-bottom:2em}.stream-name.svelte-1gfdkaw{position:sticky;top:-16px;z-index:1;margin:-8px -16px;padding:8px 16px;background:rgb(5, 26, 39)}.phase-info.svelte-1gfdkaw{padding-top:1em;padding-left:2ch}.phase-name.svelte-1gfdkaw{color:#bc80b3}'
		);
	}
	function get_each_context$3(ctx, list, i) {
		const child_ctx = ctx.slice();
		return (child_ctx[11] = list[i][0]), (child_ctx[12] = list[i][1]), child_ctx;
	}
	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		return (
			(child_ctx[15] = list[i][0]), (child_ctx[16] = list[i][1]), (child_ctx[18] = i), child_ctx
		);
	}
	function create_else_block_3(ctx) {
		let t;
		return {
			c() {
				t = text('Selection');
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				detaching && detach(t);
			}
		};
	}
	function create_if_block_11(ctx) {
		let t;
		return {
			c() {
				t = text('App State');
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				detaching && detach(t);
			}
		};
	}
	function create_else_block_2(ctx) {
		let t;
		return {
			c() {
				t = text('No Details');
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				detaching && detach(t);
			}
		};
	}
	function create_if_block_10(ctx) {
		let t;
		return {
			c() {
				t = text('With Details');
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				detaching && detach(t);
			}
		};
	}
	function create_else_block_1(ctx) {
		let t;
		return {
			c() {
				t = text('Select an event to see info');
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d(detaching) {
				detaching && detach(t);
			}
		};
	}
	function create_if_block_7(ctx) {
		let div0,
			span0,
			t1,
			t2,
			div1,
			span1,
			t4,
			t5,
			div2,
			t7,
			eventtree,
			t8,
			div3,
			t9,
			if_block1_anchor,
			current,
			t1_value = ctx[0].streamName + '',
			t4_value = ctx[0].streamPhase + '';
		function select_block_type_5(ctx, dirty) {
			return ctx[3] ? create_else_block : create_if_block_9;
		}
		eventtree = new EventTree$1({ props: { event: ctx[0], showDetails: ctx[5] } });
		let current_block_type = select_block_type_5(ctx),
			if_block0 = current_block_type(ctx),
			if_block1 = ctx[3] && create_if_block_8(ctx);
		return {
			c() {
				(div0 = element('div')),
					(span0 = element('span')),
					(span0.textContent = 'streamName : '),
					(t1 = text(t1_value)),
					(t2 = space()),
					(div1 = element('div')),
					(span1 = element('span')),
					(span1.textContent = 'streamPhase: '),
					(t4 = text(t4_value)),
					(t5 = space()),
					(div2 = element('div')),
					(div2.textContent = 'Selected Event:'),
					(t7 = space()),
					create_component(eventtree.$$.fragment),
					(t8 = space()),
					(div3 = element('div')),
					if_block0.c(),
					(t9 = space()),
					if_block1 && if_block1.c(),
					(if_block1_anchor = empty()),
					attr(span0, 'class', 'event-view-label svelte-1gfdkaw'),
					attr(span1, 'class', 'event-view-label svelte-1gfdkaw'),
					attr(div2, 'class', 'event-view-headline svelte-1gfdkaw'),
					attr(div3, 'class', 'event-view-headline svelte-1gfdkaw');
			},
			m(target, anchor) {
				insert(target, div0, anchor),
					append(div0, span0),
					append(div0, t1),
					insert(target, t2, anchor),
					insert(target, div1, anchor),
					append(div1, span1),
					append(div1, t4),
					insert(target, t5, anchor),
					insert(target, div2, anchor),
					insert(target, t7, anchor),
					mount_component(eventtree, target, anchor),
					insert(target, t8, anchor),
					insert(target, div3, anchor),
					if_block0.m(div3, null),
					insert(target, t9, anchor),
					if_block1 && if_block1.m(target, anchor),
					insert(target, if_block1_anchor, anchor),
					(current = !0);
			},
			p(ctx, dirty) {
				(!current || 1 & dirty) &&
					t1_value !== (t1_value = ctx[0].streamName + '') &&
					set_data(t1, t1_value),
					(!current || 1 & dirty) &&
						t4_value !== (t4_value = ctx[0].streamPhase + '') &&
						set_data(t4, t4_value);
				const eventtree_changes = {};
				1 & dirty && (eventtree_changes.event = ctx[0]),
					32 & dirty && (eventtree_changes.showDetails = ctx[5]),
					eventtree.$set(eventtree_changes),
					current_block_type !== (current_block_type = select_block_type_5(ctx)) &&
						(if_block0.d(1),
						(if_block0 = current_block_type(ctx)),
						if_block0 && (if_block0.c(), if_block0.m(div3, null))),
					ctx[3]
						? if_block1
							? (if_block1.p(ctx, dirty), 8 & dirty && transition_in(if_block1, 1))
							: ((if_block1 = create_if_block_8(ctx)),
							  if_block1.c(),
							  transition_in(if_block1, 1),
							  if_block1.m(if_block1_anchor.parentNode, if_block1_anchor))
						: if_block1 &&
						  (group_outros(),
						  transition_out(if_block1, 1, 1, () => {
								if_block1 = null;
						  }),
						  check_outros());
			},
			i(local) {
				current ||
					(transition_in(eventtree.$$.fragment, local), transition_in(if_block1), (current = !0));
			},
			o(local) {
				transition_out(eventtree.$$.fragment, local), transition_out(if_block1), (current = !1);
			},
			d(detaching) {
				detaching && detach(div0),
					detaching && detach(t2),
					detaching && detach(div1),
					detaching && detach(t5),
					detaching && detach(div2),
					detaching && detach(t7),
					destroy_component(eventtree, detaching),
					detaching && detach(t8),
					detaching && detach(div3),
					if_block0.d(),
					detaching && detach(t9),
					if_block1 && if_block1.d(detaching),
					detaching && detach(if_block1_anchor);
			}
		};
	}
	function create_if_block$2(ctx) {
		let if_block_anchor,
			current,
			if_block = ctx[4] && create_if_block_1$1(ctx);
		return {
			c() {
				if_block && if_block.c(), (if_block_anchor = empty());
			},
			m(target, anchor) {
				if_block && if_block.m(target, anchor),
					insert(target, if_block_anchor, anchor),
					(current = !0);
			},
			p(ctx, dirty) {
				ctx[4]
					? if_block
						? (if_block.p(ctx, dirty), 16 & dirty && transition_in(if_block, 1))
						: ((if_block = create_if_block_1$1(ctx)),
						  if_block.c(),
						  transition_in(if_block, 1),
						  if_block.m(if_block_anchor.parentNode, if_block_anchor))
					: if_block &&
					  (group_outros(),
					  transition_out(if_block, 1, 1, () => {
							if_block = null;
					  }),
					  check_outros());
			},
			i(local) {
				current || (transition_in(if_block), (current = !0));
			},
			o(local) {
				transition_out(if_block), (current = !1);
			},
			d(detaching) {
				if_block && if_block.d(detaching), detaching && detach(if_block_anchor);
			}
		};
	}
	function create_else_block(ctx) {
		let t;
		return {
			c() {
				t = text('Previous event of same phase:');
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				detaching && detach(t);
			}
		};
	}
	function create_if_block_9(ctx) {
		let t;
		return {
			c() {
				t = text('No previous event');
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				detaching && detach(t);
			}
		};
	}
	function create_if_block_8(ctx) {
		let eventtree, current;
		return (
			(eventtree = new EventTree$1({ props: { event: ctx[3], showDetails: ctx[5] } })),
			{
				c() {
					create_component(eventtree.$$.fragment);
				},
				m(target, anchor) {
					mount_component(eventtree, target, anchor), (current = !0);
				},
				p(ctx, dirty) {
					const eventtree_changes = {};
					8 & dirty && (eventtree_changes.event = ctx[3]),
						32 & dirty && (eventtree_changes.showDetails = ctx[5]),
						eventtree.$set(eventtree_changes);
				},
				i(local) {
					current || (transition_in(eventtree.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(eventtree.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(eventtree, detaching);
				}
			}
		);
	}
	function create_if_block_1$1(ctx) {
		let each_1_anchor,
			current,
			each_value = [...ctx[4].entries()],
			each_blocks = [];
		for (let i = 0; i < each_value.length; i += 1)
			each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
		const out = (i) =>
			transition_out(each_blocks[i], 1, 1, () => {
				each_blocks[i] = null;
			});
		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
				each_1_anchor = empty();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(target, anchor);
				insert(target, each_1_anchor, anchor), (current = !0);
			},
			p(ctx, dirty) {
				if (48 & dirty) {
					let i;
					for (each_value = [...ctx[4].entries()], i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$3(ctx, each_value, i);
						each_blocks[i]
							? (each_blocks[i].p(child_ctx, dirty), transition_in(each_blocks[i], 1))
							: ((each_blocks[i] = create_each_block$3(child_ctx)),
							  each_blocks[i].c(),
							  transition_in(each_blocks[i], 1),
							  each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor));
					}
					for (group_outros(), i = each_value.length; i < each_blocks.length; i += 1) out(i);
					check_outros();
				}
			},
			i(local) {
				if (!current) {
					for (let i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);
					current = !0;
				}
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);
				for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);
				current = !1;
			},
			d(detaching) {
				destroy_each(each_blocks, detaching), detaching && detach(each_1_anchor);
			}
		};
	}
	function create_if_block_4(ctx) {
		let if_block_anchor;
		function select_block_type_4(ctx, dirty) {
			return ctx[16].type === exports.AVStreamEventType.error ||
				ctx[16].type === exports.AVStreamEventType.avError
				? create_if_block_5
				: ctx[16].type === exports.AVStreamEventType.complete ||
				  ctx[16].type === exports.AVStreamEventType.avPending
				? create_if_block_6
				: void 0;
		}
		let current_block_type = select_block_type_4(ctx),
			if_block = current_block_type && current_block_type(ctx);
		return {
			c() {
				if_block && if_block.c(), (if_block_anchor = empty());
			},
			m(target, anchor) {
				if_block && if_block.m(target, anchor), insert(target, if_block_anchor, anchor);
			},
			p(ctx, dirty) {
				current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block
					? if_block.p(ctx, dirty)
					: (if_block && if_block.d(1),
					  (if_block = current_block_type && current_block_type(ctx)),
					  if_block && (if_block.c(), if_block.m(if_block_anchor.parentNode, if_block_anchor)));
			},
			d(detaching) {
				if_block && if_block.d(detaching), detaching && detach(if_block_anchor);
			}
		};
	}
	function create_if_block_3(ctx) {
		let t;
		return {
			c() {
				t = text('- no events');
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p: noop,
			d(detaching) {
				detaching && detach(t);
			}
		};
	}
	function create_if_block_6(ctx) {
		let span,
			t0,
			t1,
			t2,
			t1_value = ctx[16].type + '';
		return {
			c() {
				(span = element('span')), (t0 = text('(')), (t1 = text(t1_value)), (t2 = text(')'));
			},
			m(target, anchor) {
				insert(target, span, anchor), append(span, t0), append(span, t1), append(span, t2);
			},
			p(ctx, dirty) {
				16 & dirty && t1_value !== (t1_value = ctx[16].type + '') && set_data(t1, t1_value);
			},
			d(detaching) {
				detaching && detach(span);
			}
		};
	}
	function create_if_block_5(ctx) {
		let span,
			t0,
			t1,
			t2,
			t1_value = ctx[16].type + '';
		return {
			c() {
				(span = element('span')),
					(t0 = text('(')),
					(t1 = text(t1_value)),
					(t2 = text(')')),
					set_style(span, 'color', 'red');
			},
			m(target, anchor) {
				insert(target, span, anchor), append(span, t0), append(span, t1), append(span, t2);
			},
			p(ctx, dirty) {
				16 & dirty && t1_value !== (t1_value = ctx[16].type + '') && set_data(t1, t1_value);
			},
			d(detaching) {
				detaching && detach(span);
			}
		};
	}
	function create_if_block_2(ctx) {
		let key_block_anchor,
			current,
			previous_key = ctx[16]?.id,
			key_block = create_key_block(ctx);
		return {
			c() {
				key_block.c(), (key_block_anchor = empty());
			},
			m(target, anchor) {
				key_block.m(target, anchor), insert(target, key_block_anchor, anchor), (current = !0);
			},
			p(ctx, dirty) {
				16 & dirty && safe_not_equal(previous_key, (previous_key = ctx[16]?.id))
					? (group_outros(),
					  transition_out(key_block, 1, 1, noop),
					  check_outros(),
					  (key_block = create_key_block(ctx)),
					  key_block.c(),
					  transition_in(key_block),
					  key_block.m(key_block_anchor.parentNode, key_block_anchor))
					: key_block.p(ctx, dirty);
			},
			i(local) {
				current || (transition_in(key_block), (current = !0));
			},
			o(local) {
				transition_out(key_block), (current = !1);
			},
			d(detaching) {
				detaching && detach(key_block_anchor), key_block.d(detaching);
			}
		};
	}
	function create_key_block(ctx) {
		let div, eventtree, div_transition, current;
		return (
			(eventtree = new EventTree$1({ props: { event: ctx[16], showDetails: ctx[5] } })),
			{
				c() {
					(div = element('div')), create_component(eventtree.$$.fragment);
				},
				m(target, anchor) {
					insert(target, div, anchor), mount_component(eventtree, div, null), (current = !0);
				},
				p(ctx, dirty) {
					const eventtree_changes = {};
					16 & dirty && (eventtree_changes.event = ctx[16]),
						32 & dirty && (eventtree_changes.showDetails = ctx[5]),
						eventtree.$set(eventtree_changes);
				},
				i(local) {
					current ||
						(transition_in(eventtree.$$.fragment, local),
						add_render_callback(() => {
							div_transition ||
								(div_transition = create_bidirectional_transition(div, slide, {}, !0)),
								div_transition.run(1);
						}),
						(current = !0));
				},
				o(local) {
					transition_out(eventtree.$$.fragment, local),
						div_transition ||
							(div_transition = create_bidirectional_transition(div, slide, {}, !1)),
						div_transition.run(0),
						(current = !1);
				},
				d(detaching) {
					detaching && detach(div),
						destroy_component(eventtree),
						detaching && div_transition && div_transition.end();
				}
			}
		);
	}
	function create_each_block_1(key_1, ctx) {
		let div,
			span,
			t0,
			t1,
			t2,
			current,
			t0_value = ctx[15] + '';
		function select_block_type_3(ctx, dirty) {
			return ctx[16] ? (ctx[5] ? void 0 : create_if_block_4) : create_if_block_3;
		}
		let current_block_type = select_block_type_3(ctx),
			if_block0 = current_block_type && current_block_type(ctx),
			if_block1 = ctx[16] && create_if_block_2(ctx);
		return {
			key: key_1,
			first: null,
			c() {
				(div = element('div')),
					(span = element('span')),
					(t0 = text(t0_value)),
					(t1 = space()),
					if_block0 && if_block0.c(),
					(t2 = space()),
					if_block1 && if_block1.c(),
					attr(span, 'class', 'phase-name svelte-1gfdkaw'),
					attr(div, 'class', 'phase-info svelte-1gfdkaw'),
					(this.first = div);
			},
			m(target, anchor) {
				insert(target, div, anchor),
					append(div, span),
					append(span, t0),
					append(div, t1),
					if_block0 && if_block0.m(div, null),
					append(div, t2),
					if_block1 && if_block1.m(div, null),
					(current = !0);
			},
			p(new_ctx, dirty) {
				(ctx = new_ctx),
					(!current || 16 & dirty) &&
						t0_value !== (t0_value = ctx[15] + '') &&
						set_data(t0, t0_value),
					current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block0
						? if_block0.p(ctx, dirty)
						: (if_block0 && if_block0.d(1),
						  (if_block0 = current_block_type && current_block_type(ctx)),
						  if_block0 && (if_block0.c(), if_block0.m(div, t2))),
					ctx[16]
						? if_block1
							? (if_block1.p(ctx, dirty), 16 & dirty && transition_in(if_block1, 1))
							: ((if_block1 = create_if_block_2(ctx)),
							  if_block1.c(),
							  transition_in(if_block1, 1),
							  if_block1.m(div, null))
						: if_block1 &&
						  (group_outros(),
						  transition_out(if_block1, 1, 1, () => {
								if_block1 = null;
						  }),
						  check_outros());
			},
			i(local) {
				current || (transition_in(if_block1), (current = !0));
			},
			o(local) {
				transition_out(if_block1), (current = !1);
			},
			d(detaching) {
				detaching && detach(div), if_block0 && if_block0.d(), if_block1 && if_block1.d();
			}
		};
	}
	function create_each_block$3(ctx) {
		let div1,
			div0,
			t0,
			t1,
			t2,
			current,
			t0_value = ctx[11] + '',
			each_blocks = [],
			each_1_lookup = new Map(),
			each_value_1 = [...ctx[12].entries()];
		const get_key = (ctx) => ctx[15];
		for (let i = 0; i < each_value_1.length; i += 1) {
			let child_ctx = get_each_context_1(ctx, each_value_1, i),
				key = get_key(child_ctx);
			each_1_lookup.set(key, (each_blocks[i] = create_each_block_1(key, child_ctx)));
		}
		return {
			c() {
				(div1 = element('div')), (div0 = element('div')), (t0 = text(t0_value)), (t1 = space());
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
				(t2 = space()),
					attr(div0, 'class', 'stream-name svelte-1gfdkaw'),
					attr(div1, 'class', 'stream-info svelte-1gfdkaw');
			},
			m(target, anchor) {
				insert(target, div1, anchor), append(div1, div0), append(div0, t0), append(div1, t1);
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div1, null);
				append(div1, t2), (current = !0);
			},
			p(ctx, dirty) {
				(!current || 16 & dirty) &&
					t0_value !== (t0_value = ctx[11] + '') &&
					set_data(t0, t0_value),
					48 & dirty &&
						((each_value_1 = [...ctx[12].entries()]),
						group_outros(),
						(each_blocks = update_keyed_each(
							each_blocks,
							dirty,
							get_key,
							1,
							ctx,
							each_value_1,
							each_1_lookup,
							div1,
							outro_and_destroy_block,
							create_each_block_1,
							t2,
							get_each_context_1
						)),
						check_outros());
			},
			i(local) {
				if (!current) {
					for (let i = 0; i < each_value_1.length; i += 1) transition_in(each_blocks[i]);
					current = !0;
				}
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);
				current = !1;
			},
			d(detaching) {
				detaching && detach(div1);
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
			}
		};
	}
	function create_fragment$6(ctx) {
		let div2,
			div0,
			span0,
			t1,
			span1,
			t2,
			span2,
			t3,
			div1,
			current_block_type_index,
			if_block2,
			current,
			mounted,
			dispose;
		function select_block_type(ctx, dirty) {
			return ctx[2] ? create_if_block_11 : create_else_block_3;
		}
		let current_block_type = select_block_type(ctx),
			if_block0 = current_block_type(ctx);
		function select_block_type_1(ctx, dirty) {
			return ctx[5] ? create_if_block_10 : create_else_block_2;
		}
		let current_block_type_1 = select_block_type_1(ctx),
			if_block1 = current_block_type_1(ctx);
		const if_block_creators = [create_if_block$2, create_if_block_7, create_else_block_1],
			if_blocks = [];
		function select_block_type_2(ctx, dirty) {
			return ctx[2] ? 0 : ctx[0] ? 1 : 2;
		}
		return (
			(current_block_type_index = select_block_type_2(ctx)),
			(if_block2 = if_blocks[current_block_type_index] =
				if_block_creators[current_block_type_index](ctx)),
			{
				c() {
					(div2 = element('div')),
						(div0 = element('div')),
						(span0 = element('span')),
						(span0.textContent = 'View Mode:'),
						(t1 = space()),
						(span1 = element('span')),
						if_block0.c(),
						(t2 = space()),
						(span2 = element('span')),
						if_block1.c(),
						(t3 = space()),
						(div1 = element('div')),
						if_block2.c(),
						attr(span0, 'class', 'event-view-label svelte-1gfdkaw'),
						attr(span1, 'class', 'clickable'),
						attr(span2, 'class', 'event-view-label clickable svelte-1gfdkaw'),
						attr(div0, 'class', 'event-view-header svelte-1gfdkaw'),
						attr(div1, 'class', 'event-view-content svelte-1gfdkaw'),
						attr(div2, 'class', 'event-view svelte-1gfdkaw');
				},
				m(target, anchor) {
					insert(target, div2, anchor),
						append(div2, div0),
						append(div0, span0),
						append(div0, t1),
						append(div0, span1),
						if_block0.m(span1, null),
						append(div0, t2),
						append(div0, span2),
						if_block1.m(span2, null),
						append(div2, t3),
						append(div2, div1),
						if_blocks[current_block_type_index].m(div1, null),
						(current = !0),
						mounted ||
							((dispose = [listen(span1, 'click', ctx[9]), listen(span2, 'click', ctx[10])]),
							(mounted = !0));
				},
				p(ctx, [dirty]) {
					current_block_type !== (current_block_type = select_block_type(ctx)) &&
						(if_block0.d(1),
						(if_block0 = current_block_type(ctx)),
						if_block0 && (if_block0.c(), if_block0.m(span1, null))),
						current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx)) &&
							(if_block1.d(1),
							(if_block1 = current_block_type_1(ctx)),
							if_block1 && (if_block1.c(), if_block1.m(span2, null)));
					let previous_block_index = current_block_type_index;
					(current_block_type_index = select_block_type_2(ctx)),
						current_block_type_index === previous_block_index
							? if_blocks[current_block_type_index].p(ctx, dirty)
							: (group_outros(),
							  transition_out(if_blocks[previous_block_index], 1, 1, () => {
									if_blocks[previous_block_index] = null;
							  }),
							  check_outros(),
							  (if_block2 = if_blocks[current_block_type_index]),
							  if_block2
									? if_block2.p(ctx, dirty)
									: ((if_block2 = if_blocks[current_block_type_index] =
											if_block_creators[current_block_type_index](ctx)),
									  if_block2.c()),
							  transition_in(if_block2, 1),
							  if_block2.m(div1, null));
				},
				i(local) {
					current || (transition_in(if_block2), (current = !0));
				},
				o(local) {
					transition_out(if_block2), (current = !1);
				},
				d(detaching) {
					detaching && detach(div2),
						if_block0.d(),
						if_block1.d(),
						if_blocks[current_block_type_index].d(),
						(mounted = !1),
						run_all(dispose);
				}
			}
		);
	}
	function instance$6($$self, $$props, $$invalidate) {
		let $eventsStream,
			$visibleStreams,
			$showAppFullStateStream,
			$showEventDetailsStream,
			$$unsubscribe_eventsStream = noop,
			$$subscribe_eventsStream = () => (
				$$unsubscribe_eventsStream(),
				($$unsubscribe_eventsStream = subscribe(eventsStream, ($$value) =>
					$$invalidate(7, ($eventsStream = $$value))
				)),
				eventsStream
			);
		component_subscribe($$self, showAppFullStateStream, ($$value) =>
			$$invalidate(2, ($showAppFullStateStream = $$value))
		),
			component_subscribe($$self, showEventDetailsStream, ($$value) =>
				$$invalidate(5, ($showEventDetailsStream = $$value))
			),
			$$self.$$.on_destroy.push(() => $$unsubscribe_eventsStream());
		let { selectedEvent: selectedEvent } = $$props,
			{ eventsStream: eventsStream } = $$props;
		$$subscribe_eventsStream();
		const visibleStreams = AVWatch.visibleStreams;
		let previousEvent, appState;
		component_subscribe($$self, visibleStreams, (value) =>
			$$invalidate(8, ($visibleStreams = value))
		);
		return (
			($$self.$$set = ($$props) => {
				'selectedEvent' in $$props && $$invalidate(0, (selectedEvent = $$props.selectedEvent)),
					'eventsStream' in $$props &&
						$$subscribe_eventsStream($$invalidate(1, (eventsStream = $$props.eventsStream)));
			}),
			($$self.$$.update = () => {
				5 & $$self.$$.dirty &&
					$$invalidate(
						3,
						(previousEvent =
							selectedEvent && !$showAppFullStateStream
								? AVWatch.eventInSamePhase(selectedEvent, -1)
								: null)
					),
					389 & $$self.$$.dirty &&
						$$invalidate(
							4,
							(appState =
								$showAppFullStateStream && $visibleStreams
									? getAppStateAtEvent($visibleStreams, selectedEvent)
									: null)
						);
			}),
			[
				selectedEvent,
				eventsStream,
				$showAppFullStateStream,
				previousEvent,
				appState,
				$showEventDetailsStream,
				visibleStreams,
				$eventsStream,
				$visibleStreams,
				() =>
					set_store_value(
						showAppFullStateStream,
						($showAppFullStateStream = !$showAppFullStateStream),
						$showAppFullStateStream
					),
				() =>
					set_store_value(
						showEventDetailsStream,
						($showEventDetailsStream = !$showEventDetailsStream),
						$showEventDetailsStream
					)
			]
		);
	}
	var EventDetailsView$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$6,
					create_fragment$6,
					safe_not_equal,
					{ selectedEvent: 0, eventsStream: 1 },
					add_css$5
				);
		}
	};
	function add_css$4(target) {
		append_styles(
			target,
			'svelte-cd1dqi',
			":root{--json-tree-string-color:#99c794;--json-tree-symbol-color:#fbc863;--json-tree-boolean-color:#f99157;--json-tree-function-color:#c594c5;--json-tree-number-color:#f99157;--json-tree-label-color:#cdd3de;--json-tree-arrow-color:#999898;--json-tree-null-color:#f99157;--json-tree-undefined-color:#f99157;--json-tree-date-color:#6699cc;--json-tree-li-indentation:1em;--json-tree-li-line-height:1.3;--json-tree-font-size:12px;--json-tree-font-family:'Courier New', Courier, monospace}"
		);
	}
	function create_if_block$1(ctx) {
		let jsontree, current;
		return (
			(jsontree = new JSONTree({ props: { value: ctx[1] ? ctx[2](ctx[0]) : ctx[0].data } })),
			{
				c() {
					create_component(jsontree.$$.fragment);
				},
				m(target, anchor) {
					mount_component(jsontree, target, anchor), (current = !0);
				},
				p(ctx, dirty) {
					const jsontree_changes = {};
					3 & dirty && (jsontree_changes.value = ctx[1] ? ctx[2](ctx[0]) : ctx[0].data),
						jsontree.$set(jsontree_changes);
				},
				i(local) {
					current || (transition_in(jsontree.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(jsontree.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(jsontree, detaching);
				}
			}
		);
	}
	function create_fragment$5(ctx) {
		let if_block_anchor,
			current,
			if_block = ctx[0] && create_if_block$1(ctx);
		return {
			c() {
				if_block && if_block.c(), (if_block_anchor = empty());
			},
			m(target, anchor) {
				if_block && if_block.m(target, anchor),
					insert(target, if_block_anchor, anchor),
					(current = !0);
			},
			p(ctx, [dirty]) {
				ctx[0]
					? if_block
						? (if_block.p(ctx, dirty), 1 & dirty && transition_in(if_block, 1))
						: ((if_block = create_if_block$1(ctx)),
						  if_block.c(),
						  transition_in(if_block, 1),
						  if_block.m(if_block_anchor.parentNode, if_block_anchor))
					: if_block &&
					  (group_outros(),
					  transition_out(if_block, 1, 1, () => {
							if_block = null;
					  }),
					  check_outros());
			},
			i(local) {
				current || (transition_in(if_block), (current = !0));
			},
			o(local) {
				transition_out(if_block), (current = !1);
			},
			d(detaching) {
				if_block && if_block.d(detaching), detaching && detach(if_block_anchor);
			}
		};
	}
	function instance$5($$self, $$props, $$invalidate) {
		let { event: event } = $$props,
			{ showDetails: showDetails = !1 } = $$props;
		return (
			($$self.$$set = ($$props) => {
				'event' in $$props && $$invalidate(0, (event = $$props.event)),
					'showDetails' in $$props && $$invalidate(1, (showDetails = $$props.showDetails));
			}),
			[
				event,
				showDetails,
				function (event) {
					switch (event?.type) {
						case exports.AVStreamEventType.avPending:
						case exports.AVStreamEventType.complete:
							return {
								id: event.id,
								ordinal: event.ordinal,
								timestamp: new Date(event.timestamp),
								type: event.type
							};
						case exports.AVStreamEventType.avValue:
						case exports.AVStreamEventType.avError:
							return {
								id: event.id,
								ordinal: event.ordinal,
								timestamp: new Date(event.timestamp),
								type: event.type,
								data: event.data.error ?? event.data.value
							};
						default:
							return {
								id: event.id,
								ordinal: event.ordinal,
								timestamp: new Date(event.timestamp),
								type: event.type,
								data: event.data
							};
					}
				}
			]
		);
	}
	var EventTree$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$5,
					create_fragment$5,
					safe_not_equal,
					{ event: 0, showDetails: 1 },
					add_css$4
				);
		}
	};
	function calcRowsLayout(streams, streamGroupHeaderHeight, eventCellHeight, streamGroupSpacing) {
		return new Map(
			streams.reduce((acc, stream) => {
				const rowTop =
					0 === acc.length
						? 0
						: acc[acc.length - 1][1].top + acc[acc.length - 1][1].height + streamGroupSpacing;
				return (
					acc.push([
						stream.name,
						{ header: !0, top: rowTop, height: streamGroupHeaderHeight, label: stream.name }
					]),
					stream.phases.forEach((phase, index) => {
						acc.push([
							`${stream.name}::${phase}`,
							{
								even: index % 2 != 0,
								top: rowTop + streamGroupHeaderHeight + index * eventCellHeight,
								height: eventCellHeight,
								label: phase
							}
						]);
					}),
					acc
				);
			}, [])
		);
	}
	var commonjsGlobal =
			'undefined' != typeof globalThis
				? globalThis
				: 'undefined' != typeof window
				? window
				: 'undefined' != typeof global
				? global
				: 'undefined' != typeof self
				? self
				: {},
		animatedScrollTo = {},
		__assign =
			(commonjsGlobal && commonjsGlobal.__assign) ||
			function () {
				return (
					(__assign =
						Object.assign ||
						function (t) {
							for (var s, i = 1, n = arguments.length; i < n; i++)
								for (var p in (s = arguments[i]))
									Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
							return t;
						}),
					__assign.apply(this, arguments)
				);
			},
		__awaiter =
			(commonjsGlobal && commonjsGlobal.__awaiter) ||
			function (thisArg, _arguments, P, generator) {
				return new (P || (P = Promise))(function (resolve, reject) {
					function fulfilled(value) {
						try {
							step(generator.next(value));
						} catch (e) {
							reject(e);
						}
					}
					function rejected(value) {
						try {
							step(generator.throw(value));
						} catch (e) {
							reject(e);
						}
					}
					function step(result) {
						var value;
						result.done
							? resolve(result.value)
							: ((value = result.value),
							  value instanceof P
									? value
									: new P(function (resolve) {
											resolve(value);
									  })).then(fulfilled, rejected);
					}
					step((generator = generator.apply(thisArg, _arguments || [])).next());
				});
			},
		__generator =
			(commonjsGlobal && commonjsGlobal.__generator) ||
			function (thisArg, body) {
				var f,
					y,
					t,
					g,
					_ = {
						label: 0,
						sent: function () {
							if (1 & t[0]) throw t[1];
							return t[1];
						},
						trys: [],
						ops: []
					};
				return (
					(g = { next: verb(0), throw: verb(1), return: verb(2) }),
					'function' == typeof Symbol &&
						(g[Symbol.iterator] = function () {
							return this;
						}),
					g
				);
				function verb(n) {
					return function (v) {
						return (function (op) {
							if (f) throw new TypeError('Generator is already executing.');
							for (; _; )
								try {
									if (
										((f = 1),
										y &&
											(t =
												2 & op[0]
													? y.return
													: op[0]
													? y.throw || ((t = y.return) && t.call(y), 0)
													: y.next) &&
											!(t = t.call(y, op[1])).done)
									)
										return t;
									switch (((y = 0), t && (op = [2 & op[0], t.value]), op[0])) {
										case 0:
										case 1:
											t = op;
											break;
										case 4:
											return _.label++, { value: op[1], done: !1 };
										case 5:
											_.label++, (y = op[1]), (op = [0]);
											continue;
										case 7:
											(op = _.ops.pop()), _.trys.pop();
											continue;
										default:
											if (
												!((t = _.trys),
												(t = t.length > 0 && t[t.length - 1]) || (6 !== op[0] && 2 !== op[0]))
											) {
												_ = 0;
												continue;
											}
											if (3 === op[0] && (!t || (op[1] > t[0] && op[1] < t[3]))) {
												_.label = op[1];
												break;
											}
											if (6 === op[0] && _.label < t[1]) {
												(_.label = t[1]), (t = op);
												break;
											}
											if (t && _.label < t[2]) {
												(_.label = t[2]), _.ops.push(op);
												break;
											}
											t[2] && _.ops.pop(), _.trys.pop();
											continue;
									}
									op = body.call(thisArg, _);
								} catch (e) {
									(op = [6, e]), (y = 0);
								} finally {
									f = t = 0;
								}
							if (5 & op[0]) throw op[1];
							return { value: op[0] ? op[1] : void 0, done: !0 };
						})([n, v]);
					};
				}
			};
	function getElementOffset(el) {
		var top = 0,
			left = 0,
			element = el;
		do {
			(top += element.offsetTop || 0),
				(left += element.offsetLeft || 0),
				(element = element.offsetParent);
		} while (element);
		return { top: top, left: left };
	}
	Object.defineProperty(animatedScrollTo, '__esModule', { value: !0 });
	var ScrollDomElement = (function () {
			function ScrollDomElement(element) {
				this.element = element;
			}
			return (
				(ScrollDomElement.prototype.getHorizontalScroll = function () {
					return this.element.scrollLeft;
				}),
				(ScrollDomElement.prototype.getVerticalScroll = function () {
					return this.element.scrollTop;
				}),
				(ScrollDomElement.prototype.getMaxHorizontalScroll = function () {
					return this.element.scrollWidth - this.element.clientWidth;
				}),
				(ScrollDomElement.prototype.getMaxVerticalScroll = function () {
					return this.element.scrollHeight - this.element.clientHeight;
				}),
				(ScrollDomElement.prototype.getHorizontalElementScrollOffset = function (
					elementToScrollTo,
					elementToScroll
				) {
					return getElementOffset(elementToScrollTo).left - getElementOffset(elementToScroll).left;
				}),
				(ScrollDomElement.prototype.getVerticalElementScrollOffset = function (
					elementToScrollTo,
					elementToScroll
				) {
					return getElementOffset(elementToScrollTo).top - getElementOffset(elementToScroll).top;
				}),
				(ScrollDomElement.prototype.scrollTo = function (x, y) {
					(this.element.scrollLeft = x), (this.element.scrollTop = y);
				}),
				ScrollDomElement
			);
		})(),
		ScrollWindow = (function () {
			function ScrollWindow() {}
			return (
				(ScrollWindow.prototype.getHorizontalScroll = function () {
					return window.scrollX || document.documentElement.scrollLeft;
				}),
				(ScrollWindow.prototype.getVerticalScroll = function () {
					return window.scrollY || document.documentElement.scrollTop;
				}),
				(ScrollWindow.prototype.getMaxHorizontalScroll = function () {
					return (
						Math.max(
							document.body.scrollWidth,
							document.documentElement.scrollWidth,
							document.body.offsetWidth,
							document.documentElement.offsetWidth,
							document.body.clientWidth,
							document.documentElement.clientWidth
						) - window.innerWidth
					);
				}),
				(ScrollWindow.prototype.getMaxVerticalScroll = function () {
					return (
						Math.max(
							document.body.scrollHeight,
							document.documentElement.scrollHeight,
							document.body.offsetHeight,
							document.documentElement.offsetHeight,
							document.body.clientHeight,
							document.documentElement.clientHeight
						) - window.innerHeight
					);
				}),
				(ScrollWindow.prototype.getHorizontalElementScrollOffset = function (elementToScrollTo) {
					return (
						(window.scrollX || document.documentElement.scrollLeft) +
						elementToScrollTo.getBoundingClientRect().left
					);
				}),
				(ScrollWindow.prototype.getVerticalElementScrollOffset = function (elementToScrollTo) {
					return (
						(window.scrollY || document.documentElement.scrollTop) +
						elementToScrollTo.getBoundingClientRect().top
					);
				}),
				(ScrollWindow.prototype.scrollTo = function (x, y) {
					window.scrollTo(x, y);
				}),
				ScrollWindow
			);
		})(),
		activeAnimations = {
			elements: [],
			cancelMethods: [],
			add: function (element, cancelAnimation) {
				activeAnimations.elements.push(element),
					activeAnimations.cancelMethods.push(cancelAnimation);
			},
			remove: function (element, shouldStop) {
				void 0 === shouldStop && (shouldStop = !0);
				var index = activeAnimations.elements.indexOf(element);
				index > -1 &&
					(shouldStop && activeAnimations.cancelMethods[index](),
					activeAnimations.elements.splice(index, 1),
					activeAnimations.cancelMethods.splice(index, 1));
			}
		},
		WINDOW_EXISTS = 'undefined' != typeof window,
		defaultOptions = {
			cancelOnUserAction: !0,
			easing: function (t) {
				return --t * t * t + 1;
			},
			elementToScroll: WINDOW_EXISTS ? window : null,
			horizontalOffset: 0,
			maxDuration: 3e3,
			minDuration: 250,
			speed: 500,
			verticalOffset: 0
		};
	var _default = (animatedScrollTo.default = function (numberOrCoordsOrElement, userOptions) {
		return (
			void 0 === userOptions && (userOptions = {}),
			__awaiter(this, void 0, void 0, function () {
				var x,
					y,
					scrollToElement,
					options,
					isWindow,
					isElement,
					scrollBehaviorElement,
					elementToScroll,
					maxHorizontalScroll,
					initialHorizontalScroll,
					horizontalDistanceToScroll,
					maxVerticalScroll,
					initialVerticalScroll,
					verticalDistanceToScroll,
					horizontalDuration,
					verticalDuration,
					duration;
				return __generator(this, function (_a) {
					if (!WINDOW_EXISTS)
						return [
							2,
							new Promise(function (resolve) {
								resolve(!1);
							})
						];
					if (!window.Promise)
						throw "Browser doesn't support Promises, and animated-scroll-to depends on it, please provide a polyfill.";
					if (
						((options = __assign(__assign({}, defaultOptions), userOptions)),
						(isWindow = options.elementToScroll === window),
						(isElement = !!options.elementToScroll.nodeName),
						!isWindow && !isElement)
					)
						throw 'Element to scroll needs to be either window or DOM element.';
					if (
						((scrollBehaviorElement = isWindow
							? document.documentElement
							: options.elementToScroll),
						'smooth' ===
							getComputedStyle(scrollBehaviorElement).getPropertyValue('scroll-behavior') &&
							console.warn(
								scrollBehaviorElement.tagName +
									' has "scroll-behavior: smooth" which can mess up with animated-scroll-to\'s animations'
							),
						(elementToScroll = isWindow
							? new ScrollWindow()
							: new ScrollDomElement(options.elementToScroll)),
						numberOrCoordsOrElement instanceof Element)
					) {
						if (
							((scrollToElement = numberOrCoordsOrElement),
							isElement &&
								(!options.elementToScroll.contains(scrollToElement) ||
									options.elementToScroll.isSameNode(scrollToElement)))
						)
							throw 'options.elementToScroll has to be a parent of scrollToElement';
						(x = elementToScroll.getHorizontalElementScrollOffset(
							scrollToElement,
							options.elementToScroll
						)),
							(y = elementToScroll.getVerticalElementScrollOffset(
								scrollToElement,
								options.elementToScroll
							));
					} else if ('number' == typeof numberOrCoordsOrElement)
						(x = elementToScroll.getHorizontalScroll()), (y = numberOrCoordsOrElement);
					else {
						if (!Array.isArray(numberOrCoordsOrElement) || 2 !== numberOrCoordsOrElement.length)
							throw 'Wrong function signature. Check documentation.\nAvailable method signatures are:\n  animateScrollTo(y:number, options)\n  animateScrollTo([x:number | null, y:number | null], options)\n  animateScrollTo(scrollToElement:Element, options)';
						(x =
							null === numberOrCoordsOrElement[0]
								? elementToScroll.getHorizontalScroll()
								: numberOrCoordsOrElement[0]),
							(y =
								null === numberOrCoordsOrElement[1]
									? elementToScroll.getVerticalScroll()
									: numberOrCoordsOrElement[1]);
					}
					return (
						(x += options.horizontalOffset),
						(y += options.verticalOffset),
						(maxHorizontalScroll = elementToScroll.getMaxHorizontalScroll()),
						(initialHorizontalScroll = elementToScroll.getHorizontalScroll()),
						x > maxHorizontalScroll && (x = maxHorizontalScroll),
						(horizontalDistanceToScroll = x - initialHorizontalScroll),
						(maxVerticalScroll = elementToScroll.getMaxVerticalScroll()),
						(initialVerticalScroll = elementToScroll.getVerticalScroll()),
						y > maxVerticalScroll && (y = maxVerticalScroll),
						(verticalDistanceToScroll = y - initialVerticalScroll),
						(horizontalDuration = Math.abs(
							Math.round((horizontalDistanceToScroll / 1e3) * options.speed)
						)),
						(verticalDuration = Math.abs(
							Math.round((verticalDistanceToScroll / 1e3) * options.speed)
						)),
						(duration =
							horizontalDuration > verticalDuration ? horizontalDuration : verticalDuration) <
						options.minDuration
							? (duration = options.minDuration)
							: duration > options.maxDuration && (duration = options.maxDuration),
						[
							2,
							new Promise(function (resolve, reject) {
								var requestID;
								0 === horizontalDistanceToScroll && 0 === verticalDistanceToScroll && resolve(!0),
									activeAnimations.remove(options.elementToScroll, !0);
								var cancelAnimation = function () {
									removeListeners(), cancelAnimationFrame(requestID), resolve(!1);
								};
								activeAnimations.add(options.elementToScroll, cancelAnimation);
								var handler = options.cancelOnUserAction
										? cancelAnimation
										: function (e) {
												return e.preventDefault();
										  },
									eventOptions = options.cancelOnUserAction ? { passive: !0 } : { passive: !1 },
									events = ['wheel', 'touchstart', 'keydown', 'mousedown'],
									removeListeners = function () {
										events.forEach(function (eventName) {
											options.elementToScroll.removeEventListener(eventName, handler, eventOptions);
										});
									};
								events.forEach(function (eventName) {
									options.elementToScroll.addEventListener(eventName, handler, eventOptions);
								});
								var startingTime = Date.now(),
									step = function () {
										var timeDiff = Date.now() - startingTime,
											t = timeDiff / duration,
											horizontalScrollPosition = Math.round(
												initialHorizontalScroll + horizontalDistanceToScroll * options.easing(t)
											),
											verticalScrollPosition = Math.round(
												initialVerticalScroll + verticalDistanceToScroll * options.easing(t)
											);
										timeDiff < duration &&
										(horizontalScrollPosition !== x || verticalScrollPosition !== y)
											? (elementToScroll.scrollTo(horizontalScrollPosition, verticalScrollPosition),
											  (requestID = requestAnimationFrame(step)))
											: (elementToScroll.scrollTo(x, y),
											  cancelAnimationFrame(requestID),
											  removeListeners(),
											  activeAnimations.remove(options.elementToScroll, !1),
											  resolve(!0));
									};
								requestID = requestAnimationFrame(step);
							})
						]
					);
				});
			})
		);
	});
	function add_css$3(target) {
		append_styles(
			target,
			'svelte-7stjch',
			'.marbles-view.svelte-7stjch{display:grid;grid-template-columns:1fr 320px;grid-template-rows:1fr;max-height:100%;background:#0c0c0c;color:white}.marbles-diagram.svelte-7stjch{position:relative;height:100vh;overflow:hidden auto;font-family:Arial, Helvetica, sans-serif;font-size:12px}.scroll-container.svelte-7stjch{position:relative;min-height:100%;overflow:auto hidden;z-index:1}.clickable{background:inherit}.clickable:hover{cursor:pointer;filter:brightness(200%)}.clickable:active{filter:blur(1px)}'
		);
	}
	function create_if_block(ctx) {
		let marblesviewrowheaders, t, div1, div0, current, mounted, dispose;
		marblesviewrowheaders = new MarblesViewRowHeaders$1({ props: { rowLayoutsStream: ctx[12] } });
		let if_block = ctx[6] > 0 && ctx[7] > 0 && ctx[3] > 0 && create_if_block_1(ctx);
		return {
			c() {
				create_component(marblesviewrowheaders.$$.fragment),
					(t = space()),
					(div1 = element('div')),
					(div0 = element('div')),
					if_block && if_block.c(),
					attr(div0, 'class', 'marbles-container'),
					set_style(div0, 'padding-left', ctx[11] + 'px'),
					set_style(div0, 'width', (ctx[6] || 0) + 2 * ctx[11] + 'px'),
					set_style(div0, 'height', (ctx[7] || 0) + 'px'),
					attr(div1, 'class', 'scroll-container svelte-7stjch');
			},
			m(target, anchor) {
				mount_component(marblesviewrowheaders, target, anchor),
					insert(target, t, anchor),
					insert(target, div1, anchor),
					append(div1, div0),
					if_block && if_block.m(div0, null),
					ctx[27](div1),
					(current = !0),
					mounted || ((dispose = listen(div1, 'scroll', ctx[15])), (mounted = !0));
			},
			p(ctx, dirty) {
				ctx[6] > 0 && ctx[7] > 0 && ctx[3] > 0
					? if_block
						? (if_block.p(ctx, dirty), 200 & dirty[0] && transition_in(if_block, 1))
						: ((if_block = create_if_block_1(ctx)),
						  if_block.c(),
						  transition_in(if_block, 1),
						  if_block.m(div0, null))
					: if_block &&
					  (group_outros(),
					  transition_out(if_block, 1, 1, () => {
							if_block = null;
					  }),
					  check_outros()),
					(!current || 64 & dirty[0]) &&
						set_style(div0, 'width', (ctx[6] || 0) + 2 * ctx[11] + 'px'),
					(!current || 128 & dirty[0]) && set_style(div0, 'height', (ctx[7] || 0) + 'px');
			},
			i(local) {
				current ||
					(transition_in(marblesviewrowheaders.$$.fragment, local),
					transition_in(if_block),
					(current = !0));
			},
			o(local) {
				transition_out(marblesviewrowheaders.$$.fragment, local),
					transition_out(if_block),
					(current = !1);
			},
			d(detaching) {
				destroy_component(marblesviewrowheaders, detaching),
					detaching && detach(t),
					detaching && detach(div1),
					if_block && if_block.d(),
					ctx[27](null),
					(mounted = !1),
					dispose();
			}
		};
	}
	function create_if_block_1(ctx) {
		let marblesvieweventgrid, current;
		return (
			(marblesvieweventgrid = new MarblesViewEventGrid$1({
				props: {
					gridWidthStream: ctx[13],
					gridHeightStream: ctx[14],
					eventCellWidth: eventCellWidth,
					eventCellHeight: eventCellHeight,
					eventsStream: ctx[9],
					eventToRowLayout: ctx[25],
					selectedEvent: ctx[2]
				}
			})),
			marblesvieweventgrid.$on('select', ctx[26]),
			{
				c() {
					create_component(marblesvieweventgrid.$$.fragment);
				},
				m(target, anchor) {
					mount_component(marblesvieweventgrid, target, anchor), (current = !0);
				},
				p(ctx, dirty) {
					const marblesvieweventgrid_changes = {};
					256 & dirty[0] && (marblesvieweventgrid_changes.eventToRowLayout = ctx[25]),
						4 & dirty[0] && (marblesvieweventgrid_changes.selectedEvent = ctx[2]),
						marblesvieweventgrid.$set(marblesvieweventgrid_changes);
				},
				i(local) {
					current || (transition_in(marblesvieweventgrid.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(marblesvieweventgrid.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					destroy_component(marblesvieweventgrid, detaching);
				}
			}
		);
	}
	function create_fragment$4(ctx) {
		let div1,
			div0,
			div0_resize_listener,
			t,
			eventdetailsview,
			current,
			if_block = ctx[5] && create_if_block(ctx);
		return (
			(eventdetailsview = new EventDetailsView$1({
				props: { eventsStream: ctx[9], selectedEvent: ctx[2] }
			})),
			{
				c() {
					(div1 = element('div')),
						(div0 = element('div')),
						if_block && if_block.c(),
						(t = space()),
						create_component(eventdetailsview.$$.fragment),
						attr(div0, 'class', 'marbles-diagram svelte-7stjch'),
						add_render_callback(() => ctx[28].call(div0)),
						attr(div1, 'class', 'marbles-view svelte-7stjch');
				},
				m(target, anchor) {
					insert(target, div1, anchor),
						append(div1, div0),
						if_block && if_block.m(div0, null),
						(div0_resize_listener = (function (node, fn) {
							'static' === getComputedStyle(node).position && (node.style.position = 'relative');
							const iframe = element('iframe');
							iframe.setAttribute(
								'style',
								'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;'
							),
								iframe.setAttribute('aria-hidden', 'true'),
								(iframe.tabIndex = -1);
							const crossorigin = is_crossorigin();
							let unsubscribe;
							return (
								crossorigin
									? ((iframe.src =
											"data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>"),
									  (unsubscribe = listen(window, 'message', (event) => {
											event.source === iframe.contentWindow && fn();
									  })))
									: ((iframe.src = 'about:blank'),
									  (iframe.onload = () => {
											unsubscribe = listen(iframe.contentWindow, 'resize', fn);
									  })),
								append(node, iframe),
								() => {
									(crossorigin || (unsubscribe && iframe.contentWindow)) && unsubscribe(),
										detach(iframe);
								}
							);
						})(div0, ctx[28].bind(div0))),
						append(div1, t),
						mount_component(eventdetailsview, div1, null),
						(current = !0);
				},
				p(ctx, dirty) {
					ctx[5]
						? if_block
							? (if_block.p(ctx, dirty), 32 & dirty[0] && transition_in(if_block, 1))
							: ((if_block = create_if_block(ctx)),
							  if_block.c(),
							  transition_in(if_block, 1),
							  if_block.m(div0, null))
						: if_block &&
						  (group_outros(),
						  transition_out(if_block, 1, 1, () => {
								if_block = null;
						  }),
						  check_outros());
					const eventdetailsview_changes = {};
					4 & dirty[0] && (eventdetailsview_changes.selectedEvent = ctx[2]),
						eventdetailsview.$set(eventdetailsview_changes);
				},
				i(local) {
					current ||
						(transition_in(if_block),
						transition_in(eventdetailsview.$$.fragment, local),
						(current = !0));
				},
				o(local) {
					transition_out(if_block),
						transition_out(eventdetailsview.$$.fragment, local),
						(current = !1);
				},
				d(detaching) {
					detaching && detach(div1),
						if_block && if_block.d(),
						div0_resize_listener(),
						destroy_component(eventdetailsview);
				}
			}
		);
	}
	const eventCellWidth = 40,
		eventCellHeight = 40;
	function instance$4($$self, $$props, $$invalidate) {
		let eventsCount,
			animatedScrollProps,
			$eventsStream,
			$clientWidthStream,
			$visibleStreams,
			$gridWidthStream,
			$gridHeightStream,
			$rowLayoutsStream;
		const eventsStream = AVWatch.events.pipe(
			(function (duration, scheduler, config) {
				return (
					void 0 === scheduler && (scheduler = async),
					void 0 === config && (config = defaultThrottleConfig),
					function (source) {
						return source.lift(
							new ThrottleTimeOperator(duration, scheduler, config.leading, config.trailing)
						);
					}
				);
			})(850, asyncScheduler, { leading: !0, trailing: !0 }),
			shareReplay(1)
		);
		component_subscribe($$self, eventsStream, (value) => $$invalidate(24, ($eventsStream = value)));
		const visibleStreams = AVWatch.visibleStreams;
		component_subscribe($$self, visibleStreams, (value) =>
			$$invalidate(5, ($visibleStreams = value))
		);
		const selectEvent = (index) => {
				index >= 0 &&
					index < $eventsStream.length &&
					($$invalidate(2, (selectedEvent = $eventsStream[index] ?? null)), scrollToEvent(index));
			},
			scrollToEvent = (indexOrEventId) => {
				const scrollX = indexOrEventId * eventCellWidth - $clientWidthStream / 2 + gridHorzPadding;
				setTimeout(() => {
					_default([scrollX, 0], animatedScrollProps), (autoScrollToLatest = !1);
				}, 20);
			},
			gridHorzPadding = 2 * eventCellWidth,
			rowLayoutsStream = visibleStreams.pipe(
				map((streams) => calcRowsLayout(streams, 30, eventCellHeight, 10)),
				shareReplay(1)
			);
		component_subscribe($$self, rowLayoutsStream, (value) =>
			$$invalidate(8, ($rowLayoutsStream = value))
		);
		const gridWidthStream = eventsStream.pipe(
			map((events) => events.length * eventCellWidth),
			distinctUntilChanged(),
			shareReplay(1)
		);
		component_subscribe($$self, gridWidthStream, (value) =>
			$$invalidate(6, ($gridWidthStream = value))
		);
		const gridHeightStream = rowLayoutsStream.pipe(
			map((rowLayouts) =>
				Array.from(rowLayouts.values()).reduce(
					(acc, { top: top, height: height }) => (top + height > acc ? top + height : acc),
					0
				)
			),
			distinctUntilChanged(),
			shareReplay(1)
		);
		component_subscribe($$self, gridHeightStream, (value) =>
			$$invalidate(7, ($gridHeightStream = value))
		);
		const clientWidthStream = new BehaviorSubject(0);
		let scrollContainer;
		component_subscribe($$self, clientWidthStream, (value) =>
			$$invalidate(4, ($clientWidthStream = value))
		),
			(clientWidthStream.set = clientWidthStream.next.bind(clientWidthStream));
		let scrollPosition = 0,
			autoScrollToLatest = !0;
		var fn;
		let selectedEvent;
		(fn = () => {
			animatedScrollProps?.elementToScroll &&
				autoScrollToLatest &&
				_default([scrollContainer.scrollWidth, 0], animatedScrollProps);
		}),
			get_current_component().$$.after_update.push(fn);
		const scrollPositionStream = new BehaviorSubject(0);
		return (
			($$self.$$.update = () => {
				16777216 & $$self.$$.dirty[0] &&
					$$invalidate(3, (eventsCount = $eventsStream?.length ?? 0)),
					1 & $$self.$$.dirty[0] &&
						(animatedScrollProps = {
							elementToScroll: scrollContainer,
							maxDuration: 150,
							speed: 500
						});
			}),
			[
				scrollContainer,
				clientWidthStream,
				selectedEvent,
				eventsCount,
				$clientWidthStream,
				$visibleStreams,
				$gridWidthStream,
				$gridHeightStream,
				$rowLayoutsStream,
				eventsStream,
				visibleStreams,
				gridHorzPadding,
				rowLayoutsStream,
				gridWidthStream,
				gridHeightStream,
				function (event) {
					const delta = scrollContainer.scrollLeft - scrollPosition;
					(scrollPosition = scrollContainer.scrollLeft),
						autoScrollToLatest && delta < 0
							? (autoScrollToLatest = !1)
							: !autoScrollToLatest &&
							  delta > 0 &&
							  scrollContainer.scrollLeft >=
									scrollContainer.scrollWidth - scrollContainer.clientWidth &&
							  (autoScrollToLatest = !0),
						scrollPositionStream.next(event.currentTarget.scrollLeft);
				},
				selectEvent,
				() => selectEvent(0),
				() => selectEvent($eventsStream.length - 1),
				(ofSamePhase = !1) =>
					selectEvent(
						selectedEvent && !ofSamePhase
							? selectedEvent.id - 1
							: AVWatch.eventInSamePhase(selectedEvent, -1)?.id ??
									selectedEvent?.id ??
									$eventsStream.length - 1
					),
				(ofSamePhase = !1) =>
					selectEvent(
						selectedEvent && !ofSamePhase
							? selectedEvent.id + 1
							: AVWatch.eventInSamePhase(selectedEvent, 1)?.id ?? selectedEvent?.id ?? 0
					),
				scrollToEvent,
				() => scrollToEvent(selectedEvent ? selectedEvent.id - 1 : 0),
				() => scrollToEvent(selectedEvent ? selectedEvent.id + 1 : 0),
				$eventsStream,
				(event) => $rowLayoutsStream.get(`${event.streamName}::${event.streamPhase}`),
				(event) => $$invalidate(2, (selectedEvent = event.detail)),
				function ($$value) {
					binding_callbacks[$$value ? 'unshift' : 'push'](() => {
						(scrollContainer = $$value), $$invalidate(0, scrollContainer);
					});
				},
				function () {
					($clientWidthStream = this.clientWidth), clientWidthStream.set($clientWidthStream);
				}
			]
		);
	}
	var MarblesView$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$4,
					create_fragment$4,
					safe_not_equal,
					{
						selectEvent: 16,
						selectFirstEvent: 17,
						selectLastEvent: 18,
						selectPrevEvent: 19,
						selectNextEvent: 20,
						scrollToEvent: 21,
						scrollToPrevEvent: 22,
						scrollToNextEvent: 23
					},
					add_css$3,
					[-1, -1]
				);
		}
		get selectEvent() {
			return this.$$.ctx[16];
		}
		get selectFirstEvent() {
			return this.$$.ctx[17];
		}
		get selectLastEvent() {
			return this.$$.ctx[18];
		}
		get selectPrevEvent() {
			return this.$$.ctx[19];
		}
		get selectNextEvent() {
			return this.$$.ctx[20];
		}
		get scrollToEvent() {
			return this.$$.ctx[21];
		}
		get scrollToPrevEvent() {
			return this.$$.ctx[22];
		}
		get scrollToNextEvent() {
			return this.$$.ctx[23];
		}
	};
	function add_css$2(target) {
		append_styles(
			target,
			'svelte-pmj8e0',
			'g.svelte-pmj8e0.svelte-pmj8e0{cursor:pointer}g.selected.svelte-pmj8e0 rect.svelte-pmj8e0{stroke-width:1px;fill:rgba(255, 255, 255, 0.1);stroke:orange}g.svelte-pmj8e0:hover rect.svelte-pmj8e0{fill:rgba(255, 255, 255, 0.4)}rect.svelte-pmj8e0.svelte-pmj8e0{fill:rgba(255, 255, 255, 0.004);transition:fill 0.3s}'
		);
	}
	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		return (child_ctx[12] = list[i]), (child_ctx[14] = i), child_ctx;
	}
	function create_each_block$2(ctx) {
		let g,
			rect,
			rect_x_value,
			rect_y_value,
			genericmarble,
			g_transform_value,
			g_transition,
			current,
			mounted,
			dispose;
		function click_handler() {
			return ctx[11](ctx[12]);
		}
		return (
			(genericmarble = new GenericMarble$1({ props: { event: ctx[12], size: ctx[4] / 2 } })),
			{
				c() {
					(g = svg_element('g')),
						(rect = svg_element('rect')),
						create_component(genericmarble.$$.fragment),
						attr(rect, 'x', (rect_x_value = -ctx[4] / 2)),
						attr(rect, 'y', (rect_y_value = -ctx[4] / 2)),
						attr(rect, 'width', ctx[4]),
						attr(rect, 'height', ctx[4]),
						attr(rect, 'class', 'svelte-pmj8e0'),
						attr(
							g,
							'transform',
							(g_transform_value =
								'translate(' +
								(ctx[14] + 0.5) * ctx[4] +
								' ' +
								((ctx[3](ctx[12])?.top ?? 0) + ctx[5] / 2) +
								')')
						),
						attr(g, 'class', 'svelte-pmj8e0'),
						toggle_class(g, 'selected', ctx[6] === ctx[12]);
				},
				m(target, anchor) {
					insert(target, g, anchor),
						append(g, rect),
						mount_component(genericmarble, g, null),
						(current = !0),
						mounted || ((dispose = listen(g, 'click', click_handler)), (mounted = !0));
				},
				p(new_ctx, dirty) {
					(ctx = new_ctx),
						(!current || (16 & dirty && rect_x_value !== (rect_x_value = -ctx[4] / 2))) &&
							attr(rect, 'x', rect_x_value),
						(!current || (16 & dirty && rect_y_value !== (rect_y_value = -ctx[4] / 2))) &&
							attr(rect, 'y', rect_y_value),
						(!current || 16 & dirty) && attr(rect, 'width', ctx[4]),
						(!current || 16 & dirty) && attr(rect, 'height', ctx[4]);
					const genericmarble_changes = {};
					512 & dirty && (genericmarble_changes.event = ctx[12]),
						16 & dirty && (genericmarble_changes.size = ctx[4] / 2),
						genericmarble.$set(genericmarble_changes),
						(!current ||
							(568 & dirty &&
								g_transform_value !==
									(g_transform_value =
										'translate(' +
										(ctx[14] + 0.5) * ctx[4] +
										' ' +
										((ctx[3](ctx[12])?.top ?? 0) + ctx[5] / 2) +
										')'))) &&
							attr(g, 'transform', g_transform_value),
						576 & dirty && toggle_class(g, 'selected', ctx[6] === ctx[12]);
				},
				i(local) {
					current ||
						(transition_in(genericmarble.$$.fragment, local),
						add_render_callback(() => {
							g_transition || (g_transition = create_bidirectional_transition(g, fade, {}, !0)),
								g_transition.run(1);
						}),
						(current = !0));
				},
				o(local) {
					transition_out(genericmarble.$$.fragment, local),
						g_transition || (g_transition = create_bidirectional_transition(g, fade, {}, !1)),
						g_transition.run(0),
						(current = !1);
				},
				d(detaching) {
					detaching && detach(g),
						destroy_component(genericmarble),
						detaching && g_transition && g_transition.end(),
						(mounted = !1),
						dispose();
				}
			}
		);
	}
	function create_fragment$3(ctx) {
		let svg,
			svg_viewBox_value,
			current,
			each_value = ctx[9],
			each_blocks = [];
		for (let i = 0; i < each_value.length; i += 1)
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		const out = (i) =>
			transition_out(each_blocks[i], 1, 1, () => {
				each_blocks[i] = null;
			});
		return {
			c() {
				svg = svg_element('svg');
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
				attr(svg, 'width', ctx[7]),
					attr(svg, 'height', ctx[8]),
					attr(svg, 'viewBox', (svg_viewBox_value = '0 0 ' + ctx[7] + ' ' + ctx[8]));
			},
			m(target, anchor) {
				insert(target, svg, anchor);
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(svg, null);
				current = !0;
			},
			p(ctx, [dirty]) {
				if (1656 & dirty) {
					let i;
					for (each_value = ctx[9], i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);
						each_blocks[i]
							? (each_blocks[i].p(child_ctx, dirty), transition_in(each_blocks[i], 1))
							: ((each_blocks[i] = create_each_block$2(child_ctx)),
							  each_blocks[i].c(),
							  transition_in(each_blocks[i], 1),
							  each_blocks[i].m(svg, null));
					}
					for (group_outros(), i = each_value.length; i < each_blocks.length; i += 1) out(i);
					check_outros();
				}
				(!current || 128 & dirty) && attr(svg, 'width', ctx[7]),
					(!current || 256 & dirty) && attr(svg, 'height', ctx[8]),
					(!current ||
						(384 & dirty &&
							svg_viewBox_value !== (svg_viewBox_value = '0 0 ' + ctx[7] + ' ' + ctx[8]))) &&
						attr(svg, 'viewBox', svg_viewBox_value);
			},
			i(local) {
				if (!current) {
					for (let i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);
					current = !0;
				}
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);
				for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);
				current = !1;
			},
			d(detaching) {
				detaching && detach(svg), destroy_each(each_blocks, detaching);
			}
		};
	}
	function instance$3($$self, $$props, $$invalidate) {
		let $gridWidthStream,
			$gridHeightStream,
			$eventsStream,
			$$unsubscribe_gridWidthStream = noop,
			$$subscribe_gridWidthStream = () => (
				$$unsubscribe_gridWidthStream(),
				($$unsubscribe_gridWidthStream = subscribe(gridWidthStream, ($$value) =>
					$$invalidate(7, ($gridWidthStream = $$value))
				)),
				gridWidthStream
			),
			$$unsubscribe_gridHeightStream = noop,
			$$subscribe_gridHeightStream = () => (
				$$unsubscribe_gridHeightStream(),
				($$unsubscribe_gridHeightStream = subscribe(gridHeightStream, ($$value) =>
					$$invalidate(8, ($gridHeightStream = $$value))
				)),
				gridHeightStream
			),
			$$unsubscribe_eventsStream = noop,
			$$subscribe_eventsStream = () => (
				$$unsubscribe_eventsStream(),
				($$unsubscribe_eventsStream = subscribe(eventsStream, ($$value) =>
					$$invalidate(9, ($eventsStream = $$value))
				)),
				eventsStream
			);
		$$self.$$.on_destroy.push(() => $$unsubscribe_gridWidthStream()),
			$$self.$$.on_destroy.push(() => $$unsubscribe_gridHeightStream()),
			$$self.$$.on_destroy.push(() => $$unsubscribe_eventsStream());
		let { eventsStream: eventsStream } = $$props;
		$$subscribe_eventsStream();
		let { gridWidthStream: gridWidthStream } = $$props;
		$$subscribe_gridWidthStream();
		let { gridHeightStream: gridHeightStream } = $$props;
		$$subscribe_gridHeightStream();
		let { eventToRowLayout: eventToRowLayout } = $$props,
			{ eventCellWidth: eventCellWidth } = $$props,
			{ eventCellHeight: eventCellHeight } = $$props,
			{ selectedEvent: selectedEvent = null } = $$props;
		const dispatch = (function () {
			const component = get_current_component();
			return (type, detail) => {
				const callbacks = component.$$.callbacks[type];
				if (callbacks) {
					const event = custom_event(type, detail);
					callbacks.slice().forEach((fn) => {
						fn.call(component, event);
					});
				}
			};
		})();
		return (
			($$self.$$set = ($$props) => {
				'eventsStream' in $$props &&
					$$subscribe_eventsStream($$invalidate(0, (eventsStream = $$props.eventsStream))),
					'gridWidthStream' in $$props &&
						$$subscribe_gridWidthStream(
							$$invalidate(1, (gridWidthStream = $$props.gridWidthStream))
						),
					'gridHeightStream' in $$props &&
						$$subscribe_gridHeightStream(
							$$invalidate(2, (gridHeightStream = $$props.gridHeightStream))
						),
					'eventToRowLayout' in $$props &&
						$$invalidate(3, (eventToRowLayout = $$props.eventToRowLayout)),
					'eventCellWidth' in $$props && $$invalidate(4, (eventCellWidth = $$props.eventCellWidth)),
					'eventCellHeight' in $$props &&
						$$invalidate(5, (eventCellHeight = $$props.eventCellHeight)),
					'selectedEvent' in $$props && $$invalidate(6, (selectedEvent = $$props.selectedEvent));
			}),
			[
				eventsStream,
				gridWidthStream,
				gridHeightStream,
				eventToRowLayout,
				eventCellWidth,
				eventCellHeight,
				selectedEvent,
				$gridWidthStream,
				$gridHeightStream,
				$eventsStream,
				dispatch,
				(event) => dispatch('select', event)
			]
		);
	}
	var MarblesViewEventGrid$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$3,
					create_fragment$3,
					safe_not_equal,
					{
						eventsStream: 0,
						gridWidthStream: 1,
						gridHeightStream: 2,
						eventToRowLayout: 3,
						eventCellWidth: 4,
						eventCellHeight: 5,
						selectedEvent: 6
					},
					add_css$2
				);
		}
	};
	function add_css$1(target) {
		append_styles(
			target,
			'svelte-1s0moqz',
			'.row-labels-container.svelte-1s0moqz{position:absolute;top:0;left:0;right:0;bottom:0;filter:grayscale(1)}.row.svelte-1s0moqz{position:absolute;right:0;padding:6px;background:#152733;color:rgba(255, 255, 255, 0.7)}.row.even.svelte-1s0moqz{background:#1b2b34}.header-row.svelte-1s0moqz{background:rgb(5, 26, 39);color:white;font-size:1.25em;font-weight:bold}'
		);
	}
	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		return (child_ctx[2] = list[i]), child_ctx;
	}
	function create_each_block$1(ctx) {
		let div,
			t0,
			t1,
			t0_value = ctx[2].label + '';
		return {
			c() {
				(div = element('div')),
					(t0 = text(t0_value)),
					(t1 = space()),
					attr(div, 'class', 'row svelte-1s0moqz'),
					set_style(div, 'left', '0'),
					set_style(div, 'top', ctx[2].top + 'px'),
					set_style(div, 'height', ctx[2].height + 'px'),
					toggle_class(div, 'header-row', ctx[2].header),
					toggle_class(div, 'even', ctx[2].even);
			},
			m(target, anchor) {
				insert(target, div, anchor), append(div, t0), append(div, t1);
			},
			p(ctx, dirty) {
				2 & dirty && t0_value !== (t0_value = ctx[2].label + '') && set_data(t0, t0_value),
					2 & dirty && set_style(div, 'top', ctx[2].top + 'px'),
					2 & dirty && set_style(div, 'height', ctx[2].height + 'px'),
					2 & dirty && toggle_class(div, 'header-row', ctx[2].header),
					2 & dirty && toggle_class(div, 'even', ctx[2].even);
			},
			d(detaching) {
				detaching && detach(div);
			}
		};
	}
	function create_fragment$2(ctx) {
		let div,
			each_value = Array.from(ctx[1].values()),
			each_blocks = [];
		for (let i = 0; i < each_value.length; i += 1)
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		return {
			c() {
				div = element('div');
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
				attr(div, 'class', 'row-labels-container svelte-1s0moqz');
			},
			m(target, anchor) {
				insert(target, div, anchor);
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div, null);
			},
			p(ctx, [dirty]) {
				if (2 & dirty) {
					let i;
					for (each_value = Array.from(ctx[1].values()), i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);
						each_blocks[i]
							? each_blocks[i].p(child_ctx, dirty)
							: ((each_blocks[i] = create_each_block$1(child_ctx)),
							  each_blocks[i].c(),
							  each_blocks[i].m(div, null));
					}
					for (; i < each_blocks.length; i += 1) each_blocks[i].d(1);
					each_blocks.length = each_value.length;
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				detaching && detach(div), destroy_each(each_blocks, detaching);
			}
		};
	}
	function instance$2($$self, $$props, $$invalidate) {
		let $rowLayoutsStream,
			$$unsubscribe_rowLayoutsStream = noop,
			$$subscribe_rowLayoutsStream = () => (
				$$unsubscribe_rowLayoutsStream(),
				($$unsubscribe_rowLayoutsStream = subscribe(rowLayoutsStream, ($$value) =>
					$$invalidate(1, ($rowLayoutsStream = $$value))
				)),
				rowLayoutsStream
			);
		$$self.$$.on_destroy.push(() => $$unsubscribe_rowLayoutsStream());
		let { rowLayoutsStream: rowLayoutsStream } = $$props;
		return (
			$$subscribe_rowLayoutsStream(),
			($$self.$$set = ($$props) => {
				'rowLayoutsStream' in $$props &&
					$$subscribe_rowLayoutsStream(
						$$invalidate(0, (rowLayoutsStream = $$props.rowLayoutsStream))
					);
			}),
			[rowLayoutsStream, $rowLayoutsStream]
		);
	}
	var MarblesViewRowHeaders$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(
					this,
					options,
					instance$2,
					create_fragment$2,
					safe_not_equal,
					{ rowLayoutsStream: 0 },
					add_css$1
				);
		}
	};
	function add_css(target) {
		append_styles(
			target,
			'svelte-2z2siy',
			'.events-view.svelte-2z2siy{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1000000000}.events-view.svelte-2z2siy:not(.visible){display:none}'
		);
	}
	function create_fragment$1(ctx) {
		let div, marblesview, current;
		return (
			(marblesview = new MarblesView$1({ props: {} })),
			ctx[2](marblesview),
			{
				c() {
					(div = element('div')),
						create_component(marblesview.$$.fragment),
						attr(div, 'class', 'events-view svelte-2z2siy'),
						toggle_class(div, 'visible', ctx[0]);
				},
				m(target, anchor) {
					insert(target, div, anchor), mount_component(marblesview, div, null), (current = !0);
				},
				p(ctx, [dirty]) {
					marblesview.$set({}), 1 & dirty && toggle_class(div, 'visible', ctx[0]);
				},
				i(local) {
					current || (transition_in(marblesview.$$.fragment, local), (current = !0));
				},
				o(local) {
					transition_out(marblesview.$$.fragment, local), (current = !1);
				},
				d(detaching) {
					detaching && detach(div), ctx[2](null), destroy_component(marblesview);
				}
			}
		);
	}
	function instance$1($$self, $$props, $$invalidate) {
		let { visible: visible = !1 } = $$props;
		var fn;
		function handleKeyDown(event) {
			let isShortcut = !0;
			if (('Alt' === event.key && event.ctrlKey) || ('Control' === event.key && event.altKey))
				$$invalidate(0, (visible = !visible));
			else if (visible)
				switch (event.key) {
					case 'ArrowLeft':
						marblesView?.selectPrevEvent(!event.altKey);
						break;
					case 'ArrowRight':
						marblesView?.selectNextEvent(!event.altKey);
						break;
					case 'f':
					case 'F':
						marblesView?.selectFirstEvent();
						break;
					case 'l':
					case 'L':
						marblesView?.selectLastEvent();
						break;
					default:
						isShortcut = !1;
				}
			else isShortcut = !1;
			isShortcut && (event.stopPropagation(), event.preventDefault());
		}
		function setKeyboardShorcuts(state) {
			state
				? window?.addEventListener('keydown', handleKeyDown, !0)
				: window?.removeEventListener('keydown', handleKeyDown, !0);
		}
		let marblesView;
		return (
			(fn = () => setKeyboardShorcuts(!0)),
			get_current_component().$$.on_mount.push(fn),
			(function (fn) {
				get_current_component().$$.on_destroy.push(fn);
			})(() => setKeyboardShorcuts(!1)),
			interval(202.1)
				.pipe(
					take(10),
					watch('medium', 'all'),
					filter((v) => v % 2 == 0),
					watch('medium', 'even'),
					map((v) => new BehaviorSubject(1e3 * v)),
					watch('medium', 'mapped')
				)
				.subscribe(),
			interval(102.1)
				.pipe(
					take(10),
					watch('fast', 'all'),
					filter((v) => v % 3 == 0),
					watch('fast', 'n-th(3)')
				)
				.subscribe(),
			interval(332.8)
				.pipe(
					take(10),
					watch('slow', 'all'),
					filter((v) => v % 3 == 0),
					watch('slow', 'n-th(3)')
				)
				.subscribe(),
			($$self.$$set = ($$props) => {
				'visible' in $$props && $$invalidate(0, (visible = $$props.visible));
			}),
			[
				visible,
				marblesView,
				function ($$value) {
					binding_callbacks[$$value ? 'unshift' : 'push'](() => {
						(marblesView = $$value), $$invalidate(1, marblesView);
					});
				}
			]
		);
	}
	var EventsView$1 = class extends SvelteComponent {
		constructor(options) {
			super(),
				init(this, options, instance$1, create_fragment$1, safe_not_equal, { visible: 0 }, add_css);
		}
	};
	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		return (child_ctx[3] = list[i]), child_ctx;
	}
	function create_each_block(key_1, ctx) {
		let option,
			t,
			option_value_value,
			t_value = ctx[1][ctx[3]] + '';
		return {
			key: key_1,
			first: null,
			c() {
				(option = element('option')),
					(t = text(t_value)),
					(option.__value = option_value_value = ctx[3]),
					(option.value = option.__value),
					(this.first = option);
			},
			m(target, anchor) {
				insert(target, option, anchor), append(option, t);
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
			},
			d(detaching) {
				detaching && detach(option);
			}
		};
	}
	function create_fragment(ctx) {
		let div,
			label,
			t1,
			select,
			mounted,
			dispose,
			each_blocks = [],
			each_1_lookup = new Map(),
			each_value = Object.keys(exports.TimeStampView);
		const get_key = (ctx) => ctx[3];
		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context(ctx, each_value, i),
				key = get_key(child_ctx);
			each_1_lookup.set(key, (each_blocks[i] = create_each_block(key, child_ctx)));
		}
		return {
			c() {
				(div = element('div')),
					(label = element('label')),
					(label.textContent = 'Timestamp format:'),
					(t1 = space()),
					(select = element('select'));
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
				attr(label, 'for', 'timestamp-display'),
					attr(select, 'id', 'timestamp-display'),
					void 0 === ctx[0] && add_render_callback(() => ctx[2].call(select));
			},
			m(target, anchor) {
				insert(target, div, anchor), append(div, label), append(div, t1), append(div, select);
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(select, null);
				select_option(select, ctx[0]),
					mounted || ((dispose = listen(select, 'change', ctx[2])), (mounted = !0));
			},
			p(ctx, [dirty]) {
				2 & dirty &&
					((each_value = Object.keys(exports.TimeStampView)),
					(each_blocks = update_keyed_each(
						each_blocks,
						dirty,
						get_key,
						1,
						ctx,
						each_value,
						each_1_lookup,
						select,
						destroy_block,
						create_each_block,
						null,
						get_each_context
					))),
					1 & dirty && select_option(select, ctx[0]);
			},
			i: noop,
			o: noop,
			d(detaching) {
				detaching && detach(div);
				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
				(mounted = !1), dispose();
			}
		};
	}
	function instance($$self, $$props, $$invalidate) {
		let $timestampViewStream;
		component_subscribe($$self, timestampViewStream, ($$value) =>
			$$invalidate(0, ($timestampViewStream = $$value))
		);
		const timestampMap = {
			[exports.TimeStampView.absoluteDateAndTime]: 'Absolute Date and Time',
			[exports.TimeStampView.absoluteTime]: 'Absolute Time',
			[exports.TimeStampView.timeSinceAppStart]: 'Time Since App Start',
			[exports.TimeStampView.timeSincePreviousEvent]: 'Time Since Previous Event'
		};
		return [
			$timestampViewStream,
			timestampMap,
			function () {
				($timestampViewStream = (function (select) {
					const selected_option = select.querySelector(':checked') || select.options[0];
					return selected_option && selected_option.__value;
				})(this)),
					timestampViewStream.set($timestampViewStream);
			}
		];
	}
	var Preferences$1 = class extends SvelteComponent {
		constructor(options) {
			super(), init(this, options, instance, create_fragment, safe_not_equal, {});
		}
	};
	function sortedEventIndex(events, eventId) {
		if (!events || 0 === events.length) return 0;
		let start = 0,
			end = events.length - 1;
		for (; start < end; ) {
			const mid = (start + end) >>> 1;
			events[mid].id < eventId ? (start = mid + 1) : (end = mid);
		}
		return end;
	}
	class AVStreamEvent {
		constructor(timestamp, streamName, streamPhase, type, data) {
			(this.timestamp = timestamp),
				(this.streamName = streamName),
				(this.streamPhase = streamPhase),
				(this.type = type),
				(this.data = data),
				(this.id = AVStreamEvent._nextId++);
		}
	}
	AVStreamEvent._nextId = 0;
	class StreamPhaseWatcher {
		constructor(phaseName) {
			(this.phaseName = phaseName),
				(this._events = new BehaviorSubject([])),
				(this._eventCount = this._events.pipe(map((events) => events.length)));
		}
		get currentEvents() {
			return this._events.value;
		}
		get events() {
			return this._events.asObservable();
		}
		get eventCount() {
			return this._eventCount;
		}
		addEvent(event) {
			(event.ordinal = this._events.value.length),
				this._events.value.push(event),
				this._events.next(this._events.value);
		}
	}
	class StreamWatcher {
		constructor(streamName) {
			(this.streamName = streamName),
				(this._events = new BehaviorSubject([])),
				(this._eventCount = this._events.pipe(map((events) => events.length))),
				(this._phases = new BehaviorSubject(new Map())),
				(this._phaseCount = this._phases.pipe(map((phases) => phases.size)));
		}
		get eventCount() {
			return this._eventCount;
		}
		get events() {
			return this._events.asObservable();
		}
		get phases() {
			return this._phases.asObservable();
		}
		get phaseCount() {
			return this._phaseCount;
		}
		get currentPhasesArray() {
			return Array.from(Object.values(this._phases.value));
		}
		get currentPhases() {
			return this._phases.value;
		}
		addEvent(event) {
			const phase = this._phases.value.get(event.streamPhase);
			if (!phase)
				throw new Error(
					`StreamWatcher of name "${this.streamName}" does not have a phase named "${event.streamPhase}"`
				);
			this._events.value.push(event), this._events.next(this._events.value), phase.addEvent(event);
		}
		addPhase(phaseName) {
			this._phases.value.get(phaseName),
				this._phases.value.set(phaseName, new StreamPhaseWatcher(phaseName)),
				this._phases.next(this._phases.value);
		}
	}
	function watch(streamName, streamPhase) {
		return (
			AVWatch.addWatch(streamName, streamPhase),
			(nextOrObserver = {
				next: (value) => {
					AVWatch.addEvent(
						new AVStreamEvent(
							Date.now(),
							streamName,
							streamPhase,
							exports.AVStreamEventType.value,
							value
						)
					);
				},
				error: (error) => {
					AVWatch.addEvent(
						new AVStreamEvent(
							Date.now(),
							streamName,
							streamPhase,
							exports.AVStreamEventType.error,
							error
						)
					);
				},
				complete: () => {
					AVWatch.addEvent(
						new AVStreamEvent(
							Date.now(),
							streamName,
							streamPhase,
							exports.AVStreamEventType.complete,
							void 0
						)
					);
				}
			}),
			function (source) {
				return source.lift(new DoOperator(nextOrObserver, error, complete));
			}
		);
		var nextOrObserver, error, complete;
	}
	const AVWatch = new (class {
		constructor() {
			(this._initTimestamp = null),
				(this._events = new BehaviorSubject([])),
				(this._eventCount = this._events.pipe(map((events) => events.length))),
				(this._streams = new BehaviorSubject(new Map())),
				(this._streamCount = this._streams.pipe(map((streams) => streams.size))),
				(this._streamNameQuery = new BehaviorSubject('')),
				(this._visibleStreams = this._streams.pipe(
					map((streamsMap) => [...streamsMap.values()]),
					switchMap((streams) =>
						combineLatest(
							streams.map((stream) =>
								stream.phases.pipe(
									map((phases) => Array.from(phases.values()).map((phase) => phase.phaseName)),
									map((phaseNames) => ({ name: stream.streamName, phases: phaseNames }))
								)
							)
						)
					),
					shareReplay(1)
				)),
				(this._eventsView = null),
				(this._eventsViewMountingSubscriber = null),
				(this._initTimestamp = Date.now());
		}
		get events() {
			return this._events.asObservable();
		}
		get eventCount() {
			return this._eventCount;
		}
		addEvent(event) {
			const stream = this._streams.value.get(event.streamName);
			if (!stream)
				throw new Error(`Seems like AVWather does not have a stream of name "${event.streamName}"`);
			stream.currentPhases.get(event.streamPhase).addEvent(event),
				this._events.value.push(event),
				this._events.next(this._events.value);
		}
		addWatch(streamName, streamPhase) {
			let stream = this._streams.value.get(streamName);
			stream ||
				((stream = new StreamWatcher(streamName)),
				this._streams.value.set(streamName, stream),
				this._streams.next(this._streams.value)),
				stream.addPhase(streamPhase);
		}
		get streamCount() {
			return this._streamCount;
		}
		get initTimestamp() {
			return this._initTimestamp;
		}
		filterByStreamName(query) {
			this._streamNameQuery.next(query.trim().toLocaleLowerCase());
		}
		get visibleStreams() {
			return this._visibleStreams;
		}
		latestEventByPhase(streamName, streamPhase) {
			const phaseEvents = this._streams.value
				?.get(streamName)
				?.currentPhases.get(streamPhase)?.currentEvents;
			return phaseEvents[phaseEvents.length - 1] ?? null;
		}
		eventByIdOrOlder(streamName, streamPhase, eventId) {
			const phaseEvents = this._streams.value
				?.get(streamName)
				?.currentPhases.get(streamPhase)?.currentEvents;
			let index = sortedEventIndex(phaseEvents, eventId);
			if (phaseEvents[index]?.id === eventId) return phaseEvents[index];
			let candidate = phaseEvents[index];
			for (
				;
				candidate &&
				candidate.id > eventId &&
				index >= 0 &&
				(index--, (candidate = phaseEvents[index]), !(candidate && candidate.id < eventId));

			);
			return candidate;
		}
		eventInSamePhase(event, offset) {
			if (!event) return null;
			const phaseEvents = this._streams.value
				?.get(event.streamName)
				?.currentPhases.get(event.streamPhase)?.currentEvents;
			if (!phaseEvents)
				throw new Error(
					`Can not find phase "${event.streamPhase}" in stream "${event.streamName}"`
				);
			return phaseEvents[event.ordinal + offset] ?? null;
		}
		activate(showWatcherOnMount = !1) {
			this._eventsViewMountingSubscriber &&
				!this._eventsViewMountingSubscriber.closed &&
				this.deactivate(),
				(this._eventsViewMountingSubscriber = from(Promise.resolve(EventsView$1)).subscribe({
					next: (EventsViewComponent) => {
						this._eventsView = new EventsViewComponent({
							target: document.body,
							props: { visible: showWatcherOnMount }
						});
					}
				}));
		}
		deactivate() {
			this._eventsViewMountingSubscriber?.unsubscribe(),
				(this._eventsViewMountingSubscriber = null),
				this._eventsView?.$destroy(),
				(this._eventsView = null);
		}
	})();
	(exports.AVStreamEvent = AVStreamEvent),
		(exports.AVValueMarble = AVValueMarble$1),
		(exports.AVWatch = AVWatch),
		(exports.AsyncError = AsyncError),
		(exports.AsyncValue = AsyncValue),
		(exports.CompleteMarble = CompleteMarble$1),
		(exports.ErrorMarble = ErrorMarble$1),
		(exports.EventDetailsView = EventDetailsView$1),
		(exports.EventTree = EventTree$1),
		(exports.EventsView = EventsView$1),
		(exports.GenericMarble = GenericMarble$1),
		(exports.JSONTree = JSONTree),
		(exports.MarbleInfo = MarbleInfo$1),
		(exports.MarblesView = MarblesView$1),
		(exports.MarblesViewEventGrid = MarblesViewEventGrid$1),
		(exports.MarblesViewRowHeaders = MarblesViewRowHeaders$1),
		(exports.MultiStateAsyncValue = MultiStateAsyncValue),
		(exports.Preferences = Preferences$1),
		(exports.StreamPhaseWatcher = StreamPhaseWatcher),
		(exports.StreamWatcher = StreamWatcher),
		(exports.ValueMarble = ValueMarble$1),
		(exports.calcRowsLayout = calcRowsLayout),
		(exports.combineLatestWhenAllFulfilled = function (sources, combinerOrResult) {
			return combineLatest(sources).pipe(
				switchMap((inputs) =>
					internal_map_AsyncLike_to_Observable(internalReduceAsyncValues(inputs, combinerOrResult))
				)
			);
		}),
		(exports.compareAsyncValues = compareAsyncValues),
		(exports.convertToAsyncValue = convertToAsyncValue),
		(exports.distinctAsyncValueUntilChanged = function (compare) {
			return distinctUntilChanged((a1, a2) => compareAsyncValues(a1, a2, compare));
		}),
		(exports.getAppStateAtEvent = getAppStateAtEvent),
		(exports.getSyncValue = getSyncValue),
		(exports.internalReduceAsyncValues = internalReduceAsyncValues),
		(exports.isEmptyValue = isEmptyValue),
		(exports.isFulfilledOrSync = isFulfilledOrSync),
		(exports.isNotEmptyValue = isNotEmptyValue),
		(exports.mapToAsyncValue = mapToAsyncValue),
		(exports.mapToWhenFulfilled = function (outputValue) {
			return function (source) {
				return source.pipe(
					map((value) =>
						isFulfilledOrSync(value)
							? outputValue instanceof AsyncValue
								? outputValue
								: AsyncValue.valueOnly(outputValue)
							: value.cloneWithNoValue()
					)
				);
			};
		}),
		(exports.mapWhenFulfilled = function (transformFnOrResult) {
			return function (source) {
				return source.pipe(
					map((value, index) =>
						(function (source, transformFnOrResult, index) {
							return source instanceof AsyncValue && source.error
								? AsyncValue.errorOnly(source.error)
								: source instanceof AsyncValue && source.pending
								? AsyncValue.pendingOnly()
								: convertToAsyncValue(
										transformFnOrResult instanceof Function
											? transformFnOrResult(source.value, index)
											: transformFnOrResult
								  );
						})(value, transformFnOrResult, index)
					)
				);
			};
		}),
		(exports.promiseToAsyncValueStream = promiseToAsyncValueStream),
		(exports.reduceAsyncValues = reduceAsyncValues),
		(exports.showAppFullStateStream = showAppFullStateStream),
		(exports.showEventDetailsStream = showEventDetailsStream),
		(exports.sortedEventIndex = sortedEventIndex),
		(exports.switchMapWhenFulfilled = function (transformFnOrValue) {
			return function (source) {
				return source.pipe(
					switchMap((voAv) => {
						if (isFulfilledOrSync(voAv)) {
							const syncValue = getSyncValue(voAv);
							return internal_map_AsyncLike_to_Observable(
								transformFnOrValue instanceof Function
									? transformFnOrValue(syncValue)
									: transformFnOrValue
							);
						}
						return of(voAv.cloneWithNoValue());
					})
				);
			};
		}),
		(exports.timestampViewStream = timestampViewStream),
		(exports.transformWhenAllFulfilled = function (transformFnOrResult) {
			return function (sources) {
				return combineLatest(sources).pipe(
					map((inputs) => reduceAsyncValues(inputs, transformFnOrResult))
				);
			};
		}),
		(exports.watch = watch),
		Object.defineProperty(exports, '__esModule', { value: !0 });
});
//# sourceMappingURL=index.js.map
