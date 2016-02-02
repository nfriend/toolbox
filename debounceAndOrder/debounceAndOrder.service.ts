export module DebounceAndOrderService {

    export interface IDebounceAndOrderService {
        debounceAndOrder<T>(func: (funcArgs: any) => ng.IPromise<T> | T, delay: number): () => ng.IPromise<T>;
    }

    // This service takes a function and creates a new "debounced" version of the function. 
    // The debounceAndOrder<T> function is similar to Lodash's "debounce" function, except
    // this one is ng.IPromise-friendly.
    //
    // The debounceAndOrder<T> function does two things:
    //   1. Prevents the original function from being called if the 
    //      new method has been called with the last <delay> seconds.
    //   2. Only allows the most recent call to resolve its promise.
    export class DebounceAndOrderService implements IDebounceAndOrderService {

        static $inject = ['$timeout', '$q'];

        constructor(private _$timeout: ng.ITimeoutService, private _$q: ng.IQService) {
        }

        debounceAndOrder<T>(func: (funcArgs: any) => ng.IPromise<T> | T, delay: number): () => ng.IPromise<T> {

            // the promise returned from the most recent call to $timeout
            let timeoutPromise: ng.IPromise<void> = null;

            // the ID of the most recent call
            let lastRequestId = 0;

            let _this = this;

            // return a *new* function that has new, "debounced" abilities.
            return function () {

                // the arguments array passed to this function
                let args = arguments;

                // if a timeout is currently running, cancel it
                _this._$timeout.cancel(timeoutPromise);

                // give this call a new request ID
                let thisRequestId = ++lastRequestId;

                // the deferred whose promise we will return 
                // at the end of this function. We will only resolve 
                // the deferred's promise if it was the most recent 
                // call to the search API (we ignore old requests).
                let deferred: ng.IDeferred<T> = _this._$q.defer();

                timeoutPromise = _this._$timeout(delay);
                timeoutPromise.then(() => {
                    timeoutPromise = null;

                    // execute the original function and wait for it to complete
                    _this._$q.when(func.apply(_this, args))
                        .then((result) => {
                            if (thisRequestId === lastRequestId) {
                                // we were the most recent call made.  resolve the promise.
                                deferred.resolve(result);
                            } else {
                                // another call to this function has been made since we
                                // initiated our call.  In this case, don't resolve the promise.
                            }
                        })
                        .catch((reason: any) => {
                            deferred.reject(reason);
                        });
                });

                return deferred.promise;
            };
        };
    }
}