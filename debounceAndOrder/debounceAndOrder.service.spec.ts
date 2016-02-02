import {DebounceAndOrderService} from './debounceAndOrder.service';

export function main() {
    describe('debounceAndOrder.service', () => {

        let debounceAndOrderService: DebounceAndOrderService.DebounceAndOrderService,
            $timeout: ng.ITimeoutService,
            $q: ng.IQService;


        beforeEach(() => {
            inject(($injector: any) => {
                $timeout = $injector.get('$timeout');
                $q = $injector.get('$q');
            });

            jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

            debounceAndOrderService = new DebounceAndOrderService.DebounceAndOrderService($timeout, $q);
        });

        it('should return a new function that wraps the original function', () => {
            let originalFunction = jasmine.createSpy('originalFunction');
            let debouncedFunction = debounceAndOrderService.debounceAndOrder(originalFunction, 0);
            debouncedFunction();

            $timeout.flush();
            expect(originalFunction.calls.count()).toBe(1);
        });

        it('should return a new function that returns a promise that resolves after <delay> milliseconds', () => {
            let originalFunction = jasmine.createSpy('originalFunction');
            let thenSpy = jasmine.createSpy('thenSpy');
            let debouncedFunction = debounceAndOrderService.debounceAndOrder(originalFunction, 10);
            debouncedFunction().then(thenSpy);

            $timeout.flush();
            expect(originalFunction.calls.count()).toBe(1);
            expect(thenSpy.calls.count()).toBe(1);
        });

        it('should prevent the original function from being called more than once when spammed with requests', () => {
            let originalFunction = jasmine.createSpy('originalFunction');
            let debouncedFunction = debounceAndOrderService.debounceAndOrder(originalFunction, 500);
            let debouncedSpy = jasmine.createSpy('debouncedSpy', debouncedFunction).and.callThrough();

            for (var i = 0; i < 50; i++) {
                $timeout(i * 10).then(debouncedSpy);
                $timeout.flush(i * 10 + 1);
            }

            $timeout.flush();

            expect(debouncedSpy.calls.count()).toBe(50);
            expect(originalFunction.calls.count()).toBe(1);
        });

        it('should call the original function multiple times if the calls to the debounced function are made outside of the debounced function\'s delay', () => {
            let originalFunction = jasmine.createSpy('originalFunction');
            let debouncedFunction = debounceAndOrderService.debounceAndOrder(originalFunction, 500);
            let debouncedSpy = jasmine.createSpy('debouncedSpy', debouncedFunction).and.callThrough();

            for (var i = 0; i < 50; i++) {
                $timeout(i * 600).then(debouncedSpy);
                $timeout.flush(i * 600 + 1);
            }

            $timeout.flush();

            expect(debouncedSpy.calls.count()).toBe(50);
            expect(originalFunction.calls.count()).toBe(50);
        });

        it('should only resolve the promise of the most recently made call', () => {
            let originalFunction = jasmine.createSpy('originalFunction');
            let debouncedFunction = debounceAndOrderService.debounceAndOrder(originalFunction, 500);
            let allSpies: Array<jasmine.Spy> = [];

            for (var i = 0; i < 50; i++) {
                $timeout(i * 10).then(() => {
                    let thenSpy = jasmine.createSpy('spy ' + i);
                    debouncedFunction().then(thenSpy);
                    allSpies.push(thenSpy);
                });
                $timeout.flush(i * 10 + 1);
            }

            $timeout.flush();

            allSpies.forEach((spy, index) => {
                if (index !== allSpies.length - 1) {
                    expect(spy).not.toHaveBeenCalled();
                } else {
                    expect(spy.calls.count()).toBe(1);
                }
            });
        });

        it('should resolve the returned promise even if the original function is asynchronous (returns a promise)', () => {
            let originalFunction = () => {
                var deferred = $q.defer();
                $timeout(10).then(() => { deferred.resolve() });
                return deferred.promise;
            }

            let thenSpy = jasmine.createSpy('thenSpy');
            let debouncedFunction = debounceAndOrderService.debounceAndOrder(originalFunction, 100);
            debouncedFunction().then(thenSpy);

            $timeout.flush(101);
            expect(thenSpy.calls.count()).toBe(0);
            $timeout.flush(111);
            expect(thenSpy.calls.count()).toBe(1);
        });
    });
}
