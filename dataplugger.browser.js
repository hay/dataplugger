"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
            }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
        s(r[o]);
    }return s;
})({ 1: [function (require, module, exports) {
        (function (process, global) {
            /*!
             * async
             * https://github.com/caolan/async
             *
             * Copyright 2010-2014 Caolan McMahon
             * Released under the MIT license
             */
            (function () {

                var async = {};
                function noop() {}
                function identity(v) {
                    return v;
                }
                function toBool(v) {
                    return !!v;
                }
                function notId(v) {
                    return !v;
                }

                // global on the server, window in the browser
                var previous_async;

                // Establish the root object, `window` (`self`) in the browser, `global`
                // on the server, or `this` in some virtual machines. We use `self`
                // instead of `window` for `WebWorker` support.
                var root = (typeof self === "undefined" ? "undefined" : _typeof(self)) === 'object' && self.self === self && self || (typeof global === "undefined" ? "undefined" : _typeof(global)) === 'object' && global.global === global && global || this;

                if (root != null) {
                    previous_async = root.async;
                }

                async.noConflict = function () {
                    root.async = previous_async;
                    return async;
                };

                function only_once(fn) {
                    return function () {
                        if (fn === null) throw new Error("Callback was already called.");
                        fn.apply(this, arguments);
                        fn = null;
                    };
                }

                function _once(fn) {
                    return function () {
                        if (fn === null) return;
                        fn.apply(this, arguments);
                        fn = null;
                    };
                }

                //// cross-browser compatiblity functions ////

                var _toString = Object.prototype.toString;

                var _isArray = Array.isArray || function (obj) {
                    return _toString.call(obj) === '[object Array]';
                };

                // Ported from underscore.js isObject
                var _isObject = function _isObject(obj) {
                    var type = typeof obj === "undefined" ? "undefined" : _typeof(obj);
                    return type === 'function' || type === 'object' && !!obj;
                };

                function _isArrayLike(arr) {
                    return _isArray(arr) ||
                    // has a positive integer length property
                    typeof arr.length === "number" && arr.length >= 0 && arr.length % 1 === 0;
                }

                function _arrayEach(arr, iterator) {
                    var index = -1,
                        length = arr.length;

                    while (++index < length) {
                        iterator(arr[index], index, arr);
                    }
                }

                function _map(arr, iterator) {
                    var index = -1,
                        length = arr.length,
                        result = Array(length);

                    while (++index < length) {
                        result[index] = iterator(arr[index], index, arr);
                    }
                    return result;
                }

                function _range(count) {
                    return _map(Array(count), function (v, i) {
                        return i;
                    });
                }

                function _reduce(arr, iterator, memo) {
                    _arrayEach(arr, function (x, i, a) {
                        memo = iterator(memo, x, i, a);
                    });
                    return memo;
                }

                function _forEachOf(object, iterator) {
                    _arrayEach(_keys(object), function (key) {
                        iterator(object[key], key);
                    });
                }

                function _indexOf(arr, item) {
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] === item) return i;
                    }
                    return -1;
                }

                var _keys = Object.keys || function (obj) {
                    var keys = [];
                    for (var k in obj) {
                        if (obj.hasOwnProperty(k)) {
                            keys.push(k);
                        }
                    }
                    return keys;
                };

                function _keyIterator(coll) {
                    var i = -1;
                    var len;
                    var keys;
                    if (_isArrayLike(coll)) {
                        len = coll.length;
                        return function next() {
                            i++;
                            return i < len ? i : null;
                        };
                    } else {
                        keys = _keys(coll);
                        len = keys.length;
                        return function next() {
                            i++;
                            return i < len ? keys[i] : null;
                        };
                    }
                }

                // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
                // This accumulates the arguments passed into an array, after a given index.
                // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
                function _restParam(func, startIndex) {
                    startIndex = startIndex == null ? func.length - 1 : +startIndex;
                    return function () {
                        var length = Math.max(arguments.length - startIndex, 0);
                        var rest = Array(length);
                        for (var index = 0; index < length; index++) {
                            rest[index] = arguments[index + startIndex];
                        }
                        switch (startIndex) {
                            case 0:
                                return func.call(this, rest);
                            case 1:
                                return func.call(this, arguments[0], rest);
                        }
                        // Currently unused but handle cases outside of the switch statement:
                        // var args = Array(startIndex + 1);
                        // for (index = 0; index < startIndex; index++) {
                        //     args[index] = arguments[index];
                        // }
                        // args[startIndex] = rest;
                        // return func.apply(this, args);
                    };
                }

                function _withoutIndex(iterator) {
                    return function (value, index, callback) {
                        return iterator(value, callback);
                    };
                }

                //// exported async module functions ////

                //// nextTick implementation with browser-compatible fallback ////

                // capture the global reference to guard against fakeTimer mocks
                var _setImmediate = typeof setImmediate === 'function' && setImmediate;

                var _delay = _setImmediate ? function (fn) {
                    // not a direct alias for IE10 compatibility
                    _setImmediate(fn);
                } : function (fn) {
                    setTimeout(fn, 0);
                };

                if ((typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && typeof process.nextTick === 'function') {
                    async.nextTick = process.nextTick;
                } else {
                    async.nextTick = _delay;
                }
                async.setImmediate = _setImmediate ? _delay : async.nextTick;

                async.forEach = async.each = function (arr, iterator, callback) {
                    return async.eachOf(arr, _withoutIndex(iterator), callback);
                };

                async.forEachSeries = async.eachSeries = function (arr, iterator, callback) {
                    return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
                };

                async.forEachLimit = async.eachLimit = function (arr, limit, iterator, callback) {
                    return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
                };

                async.forEachOf = async.eachOf = function (object, iterator, callback) {
                    callback = _once(callback || noop);
                    object = object || [];

                    var iter = _keyIterator(object);
                    var key,
                        completed = 0;

                    while ((key = iter()) != null) {
                        completed += 1;
                        iterator(object[key], key, only_once(done));
                    }

                    if (completed === 0) callback(null);

                    function done(err) {
                        completed--;
                        if (err) {
                            callback(err);
                        }
                        // Check key is null in case iterator isn't exhausted
                        // and done resolved synchronously.
                        else if (key === null && completed <= 0) {
                                callback(null);
                            }
                    }
                };

                async.forEachOfSeries = async.eachOfSeries = function (obj, iterator, callback) {
                    callback = _once(callback || noop);
                    obj = obj || [];
                    var nextKey = _keyIterator(obj);
                    var key = nextKey();
                    function iterate() {
                        var sync = true;
                        if (key === null) {
                            return callback(null);
                        }
                        iterator(obj[key], key, only_once(function (err) {
                            if (err) {
                                callback(err);
                            } else {
                                key = nextKey();
                                if (key === null) {
                                    return callback(null);
                                } else {
                                    if (sync) {
                                        async.setImmediate(iterate);
                                    } else {
                                        iterate();
                                    }
                                }
                            }
                        }));
                        sync = false;
                    }
                    iterate();
                };

                async.forEachOfLimit = async.eachOfLimit = function (obj, limit, iterator, callback) {
                    _eachOfLimit(limit)(obj, iterator, callback);
                };

                function _eachOfLimit(limit) {

                    return function (obj, iterator, callback) {
                        callback = _once(callback || noop);
                        obj = obj || [];
                        var nextKey = _keyIterator(obj);
                        if (limit <= 0) {
                            return callback(null);
                        }
                        var done = false;
                        var running = 0;
                        var errored = false;

                        (function replenish() {
                            if (done && running <= 0) {
                                return callback(null);
                            }

                            while (running < limit && !errored) {
                                var key = nextKey();
                                if (key === null) {
                                    done = true;
                                    if (running <= 0) {
                                        callback(null);
                                    }
                                    return;
                                }
                                running += 1;
                                iterator(obj[key], key, only_once(function (err) {
                                    running -= 1;
                                    if (err) {
                                        callback(err);
                                        errored = true;
                                    } else {
                                        replenish();
                                    }
                                }));
                            }
                        })();
                    };
                }

                function doParallel(fn) {
                    return function (obj, iterator, callback) {
                        return fn(async.eachOf, obj, iterator, callback);
                    };
                }
                function doParallelLimit(fn) {
                    return function (obj, limit, iterator, callback) {
                        return fn(_eachOfLimit(limit), obj, iterator, callback);
                    };
                }
                function doSeries(fn) {
                    return function (obj, iterator, callback) {
                        return fn(async.eachOfSeries, obj, iterator, callback);
                    };
                }

                function _asyncMap(eachfn, arr, iterator, callback) {
                    callback = _once(callback || noop);
                    arr = arr || [];
                    var results = _isArrayLike(arr) ? [] : {};
                    eachfn(arr, function (value, index, callback) {
                        iterator(value, function (err, v) {
                            results[index] = v;
                            callback(err);
                        });
                    }, function (err) {
                        callback(err, results);
                    });
                }

                async.map = doParallel(_asyncMap);
                async.mapSeries = doSeries(_asyncMap);
                async.mapLimit = doParallelLimit(_asyncMap);

                // reduce only has a series version, as doing reduce in parallel won't
                // work in many situations.
                async.inject = async.foldl = async.reduce = function (arr, memo, iterator, callback) {
                    async.eachOfSeries(arr, function (x, i, callback) {
                        iterator(memo, x, function (err, v) {
                            memo = v;
                            callback(err);
                        });
                    }, function (err) {
                        callback(err, memo);
                    });
                };

                async.foldr = async.reduceRight = function (arr, memo, iterator, callback) {
                    var reversed = _map(arr, identity).reverse();
                    async.reduce(reversed, memo, iterator, callback);
                };

                async.transform = function (arr, memo, iterator, callback) {
                    if (arguments.length === 3) {
                        callback = iterator;
                        iterator = memo;
                        memo = _isArray(arr) ? [] : {};
                    }

                    async.eachOf(arr, function (v, k, cb) {
                        iterator(memo, v, k, cb);
                    }, function (err) {
                        callback(err, memo);
                    });
                };

                function _filter(eachfn, arr, iterator, callback) {
                    var results = [];
                    eachfn(arr, function (x, index, callback) {
                        iterator(x, function (v) {
                            if (v) {
                                results.push({ index: index, value: x });
                            }
                            callback();
                        });
                    }, function () {
                        callback(_map(results.sort(function (a, b) {
                            return a.index - b.index;
                        }), function (x) {
                            return x.value;
                        }));
                    });
                }

                async.select = async.filter = doParallel(_filter);

                async.selectLimit = async.filterLimit = doParallelLimit(_filter);

                async.selectSeries = async.filterSeries = doSeries(_filter);

                function _reject(eachfn, arr, iterator, callback) {
                    _filter(eachfn, arr, function (value, cb) {
                        iterator(value, function (v) {
                            cb(!v);
                        });
                    }, callback);
                }
                async.reject = doParallel(_reject);
                async.rejectLimit = doParallelLimit(_reject);
                async.rejectSeries = doSeries(_reject);

                function _createTester(eachfn, check, getResult) {
                    return function (arr, limit, iterator, cb) {
                        function done() {
                            if (cb) cb(getResult(false, void 0));
                        }
                        function iteratee(x, _, callback) {
                            if (!cb) return callback();
                            iterator(x, function (v) {
                                if (cb && check(v)) {
                                    cb(getResult(true, x));
                                    cb = iterator = false;
                                }
                                callback();
                            });
                        }
                        if (arguments.length > 3) {
                            eachfn(arr, limit, iteratee, done);
                        } else {
                            cb = iterator;
                            iterator = limit;
                            eachfn(arr, iteratee, done);
                        }
                    };
                }

                async.any = async.some = _createTester(async.eachOf, toBool, identity);

                async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

                async.all = async.every = _createTester(async.eachOf, notId, notId);

                async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

                function _findGetResult(v, x) {
                    return x;
                }
                async.detect = _createTester(async.eachOf, identity, _findGetResult);
                async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
                async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

                async.sortBy = function (arr, iterator, callback) {
                    async.map(arr, function (x, callback) {
                        iterator(x, function (err, criteria) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, { value: x, criteria: criteria });
                            }
                        });
                    }, function (err, results) {
                        if (err) {
                            return callback(err);
                        } else {
                            callback(null, _map(results.sort(comparator), function (x) {
                                return x.value;
                            }));
                        }
                    });

                    function comparator(left, right) {
                        var a = left.criteria,
                            b = right.criteria;
                        return a < b ? -1 : a > b ? 1 : 0;
                    }
                };

                async.auto = function (tasks, concurrency, callback) {
                    if (typeof arguments[1] === 'function') {
                        // concurrency is optional, shift the args.
                        callback = concurrency;
                        concurrency = null;
                    }
                    callback = _once(callback || noop);
                    var keys = _keys(tasks);
                    var remainingTasks = keys.length;
                    if (!remainingTasks) {
                        return callback(null);
                    }
                    if (!concurrency) {
                        concurrency = remainingTasks;
                    }

                    var results = {};
                    var runningTasks = 0;

                    var hasError = false;

                    var listeners = [];
                    function addListener(fn) {
                        listeners.unshift(fn);
                    }
                    function removeListener(fn) {
                        var idx = _indexOf(listeners, fn);
                        if (idx >= 0) listeners.splice(idx, 1);
                    }
                    function taskComplete() {
                        remainingTasks--;
                        _arrayEach(listeners.slice(0), function (fn) {
                            fn();
                        });
                    }

                    addListener(function () {
                        if (!remainingTasks) {
                            callback(null, results);
                        }
                    });

                    _arrayEach(keys, function (k) {
                        if (hasError) return;
                        var task = _isArray(tasks[k]) ? tasks[k] : [tasks[k]];
                        var taskCallback = _restParam(function (err, args) {
                            runningTasks--;
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            if (err) {
                                var safeResults = {};
                                _forEachOf(results, function (val, rkey) {
                                    safeResults[rkey] = val;
                                });
                                safeResults[k] = args;
                                hasError = true;

                                callback(err, safeResults);
                            } else {
                                results[k] = args;
                                async.setImmediate(taskComplete);
                            }
                        });
                        var requires = task.slice(0, task.length - 1);
                        // prevent dead-locks
                        var len = requires.length;
                        var dep;
                        while (len--) {
                            if (!(dep = tasks[requires[len]])) {
                                throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                            }
                            if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                                throw new Error('Has cyclic dependencies');
                            }
                        }
                        function ready() {
                            return runningTasks < concurrency && _reduce(requires, function (a, x) {
                                return a && results.hasOwnProperty(x);
                            }, true) && !results.hasOwnProperty(k);
                        }
                        if (ready()) {
                            runningTasks++;
                            task[task.length - 1](taskCallback, results);
                        } else {
                            addListener(listener);
                        }
                        function listener() {
                            if (ready()) {
                                runningTasks++;
                                removeListener(listener);
                                task[task.length - 1](taskCallback, results);
                            }
                        }
                    });
                };

                async.retry = function (times, task, callback) {
                    var DEFAULT_TIMES = 5;
                    var DEFAULT_INTERVAL = 0;

                    var attempts = [];

                    var opts = {
                        times: DEFAULT_TIMES,
                        interval: DEFAULT_INTERVAL
                    };

                    function parseTimes(acc, t) {
                        if (typeof t === 'number') {
                            acc.times = parseInt(t, 10) || DEFAULT_TIMES;
                        } else if ((typeof t === "undefined" ? "undefined" : _typeof(t)) === 'object') {
                            acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                            acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
                        } else {
                            throw new Error('Unsupported argument type for \'times\': ' + (typeof t === "undefined" ? "undefined" : _typeof(t)));
                        }
                    }

                    var length = arguments.length;
                    if (length < 1 || length > 3) {
                        throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
                    } else if (length <= 2 && typeof times === 'function') {
                        callback = task;
                        task = times;
                    }
                    if (typeof times !== 'function') {
                        parseTimes(opts, times);
                    }
                    opts.callback = callback;
                    opts.task = task;

                    function wrappedTask(wrappedCallback, wrappedResults) {
                        function retryAttempt(task, finalAttempt) {
                            return function (seriesCallback) {
                                task(function (err, result) {
                                    seriesCallback(!err || finalAttempt, { err: err, result: result });
                                }, wrappedResults);
                            };
                        }

                        function retryInterval(interval) {
                            return function (seriesCallback) {
                                setTimeout(function () {
                                    seriesCallback(null);
                                }, interval);
                            };
                        }

                        while (opts.times) {

                            var finalAttempt = !(opts.times -= 1);
                            attempts.push(retryAttempt(opts.task, finalAttempt));
                            if (!finalAttempt && opts.interval > 0) {
                                attempts.push(retryInterval(opts.interval));
                            }
                        }

                        async.series(attempts, function (done, data) {
                            data = data[data.length - 1];
                            (wrappedCallback || opts.callback)(data.err, data.result);
                        });
                    }

                    // If a callback is passed, run this as a controll flow
                    return opts.callback ? wrappedTask() : wrappedTask;
                };

                async.waterfall = function (tasks, callback) {
                    callback = _once(callback || noop);
                    if (!_isArray(tasks)) {
                        var err = new Error('First argument to waterfall must be an array of functions');
                        return callback(err);
                    }
                    if (!tasks.length) {
                        return callback();
                    }
                    function wrapIterator(iterator) {
                        return _restParam(function (err, args) {
                            if (err) {
                                callback.apply(null, [err].concat(args));
                            } else {
                                var next = iterator.next();
                                if (next) {
                                    args.push(wrapIterator(next));
                                } else {
                                    args.push(callback);
                                }
                                ensureAsync(iterator).apply(null, args);
                            }
                        });
                    }
                    wrapIterator(async.iterator(tasks))();
                };

                function _parallel(eachfn, tasks, callback) {
                    callback = callback || noop;
                    var results = _isArrayLike(tasks) ? [] : {};

                    eachfn(tasks, function (task, key, callback) {
                        task(_restParam(function (err, args) {
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            results[key] = args;
                            callback(err);
                        }));
                    }, function (err) {
                        callback(err, results);
                    });
                }

                async.parallel = function (tasks, callback) {
                    _parallel(async.eachOf, tasks, callback);
                };

                async.parallelLimit = function (tasks, limit, callback) {
                    _parallel(_eachOfLimit(limit), tasks, callback);
                };

                async.series = function (tasks, callback) {
                    _parallel(async.eachOfSeries, tasks, callback);
                };

                async.iterator = function (tasks) {
                    function makeCallback(index) {
                        function fn() {
                            if (tasks.length) {
                                tasks[index].apply(null, arguments);
                            }
                            return fn.next();
                        }
                        fn.next = function () {
                            return index < tasks.length - 1 ? makeCallback(index + 1) : null;
                        };
                        return fn;
                    }
                    return makeCallback(0);
                };

                async.apply = _restParam(function (fn, args) {
                    return _restParam(function (callArgs) {
                        return fn.apply(null, args.concat(callArgs));
                    });
                });

                function _concat(eachfn, arr, fn, callback) {
                    var result = [];
                    eachfn(arr, function (x, index, cb) {
                        fn(x, function (err, y) {
                            result = result.concat(y || []);
                            cb(err);
                        });
                    }, function (err) {
                        callback(err, result);
                    });
                }
                async.concat = doParallel(_concat);
                async.concatSeries = doSeries(_concat);

                async.whilst = function (test, iterator, callback) {
                    callback = callback || noop;
                    if (test()) {
                        var next = _restParam(function (err, args) {
                            if (err) {
                                callback(err);
                            } else if (test.apply(this, args)) {
                                iterator(next);
                            } else {
                                callback.apply(null, [null].concat(args));
                            }
                        });
                        iterator(next);
                    } else {
                        callback(null);
                    }
                };

                async.doWhilst = function (iterator, test, callback) {
                    var calls = 0;
                    return async.whilst(function () {
                        return ++calls <= 1 || test.apply(this, arguments);
                    }, iterator, callback);
                };

                async.until = function (test, iterator, callback) {
                    return async.whilst(function () {
                        return !test.apply(this, arguments);
                    }, iterator, callback);
                };

                async.doUntil = function (iterator, test, callback) {
                    return async.doWhilst(iterator, function () {
                        return !test.apply(this, arguments);
                    }, callback);
                };

                async.during = function (test, iterator, callback) {
                    callback = callback || noop;

                    var next = _restParam(function (err, args) {
                        if (err) {
                            callback(err);
                        } else {
                            args.push(check);
                            test.apply(this, args);
                        }
                    });

                    var check = function check(err, truth) {
                        if (err) {
                            callback(err);
                        } else if (truth) {
                            iterator(next);
                        } else {
                            callback(null);
                        }
                    };

                    test(check);
                };

                async.doDuring = function (iterator, test, callback) {
                    var calls = 0;
                    async.during(function (next) {
                        if (calls++ < 1) {
                            next(null, true);
                        } else {
                            test.apply(this, arguments);
                        }
                    }, iterator, callback);
                };

                function _queue(worker, concurrency, payload) {
                    if (concurrency == null) {
                        concurrency = 1;
                    } else if (concurrency === 0) {
                        throw new Error('Concurrency must not be zero');
                    }
                    function _insert(q, data, pos, callback) {
                        if (callback != null && typeof callback !== "function") {
                            throw new Error("task callback must be a function");
                        }
                        q.started = true;
                        if (!_isArray(data)) {
                            data = [data];
                        }
                        if (data.length === 0 && q.idle()) {
                            // call drain immediately if there are no tasks
                            return async.setImmediate(function () {
                                q.drain();
                            });
                        }
                        _arrayEach(data, function (task) {
                            var item = {
                                data: task,
                                callback: callback || noop
                            };

                            if (pos) {
                                q.tasks.unshift(item);
                            } else {
                                q.tasks.push(item);
                            }

                            if (q.tasks.length === q.concurrency) {
                                q.saturated();
                            }
                        });
                        async.setImmediate(q.process);
                    }
                    function _next(q, tasks) {
                        return function () {
                            workers -= 1;

                            var removed = false;
                            var args = arguments;
                            _arrayEach(tasks, function (task) {
                                _arrayEach(_workersList, function (worker, index) {
                                    if (worker === task && !removed) {
                                        _workersList.splice(index, 1);
                                        removed = true;
                                    }
                                });

                                task.callback.apply(task, args);
                            });
                            if (q.tasks.length + workers === 0) {
                                q.drain();
                            }
                            q.process();
                        };
                    }

                    var workers = 0;
                    var _workersList = [];
                    var q = {
                        tasks: [],
                        concurrency: concurrency,
                        payload: payload,
                        saturated: noop,
                        empty: noop,
                        drain: noop,
                        started: false,
                        paused: false,
                        push: function push(data, callback) {
                            _insert(q, data, false, callback);
                        },
                        kill: function kill() {
                            q.drain = noop;
                            q.tasks = [];
                        },
                        unshift: function unshift(data, callback) {
                            _insert(q, data, true, callback);
                        },
                        process: function process() {
                            while (!q.paused && workers < q.concurrency && q.tasks.length) {

                                var tasks = q.payload ? q.tasks.splice(0, q.payload) : q.tasks.splice(0, q.tasks.length);

                                var data = _map(tasks, function (task) {
                                    return task.data;
                                });

                                if (q.tasks.length === 0) {
                                    q.empty();
                                }
                                workers += 1;
                                _workersList.push(tasks[0]);
                                var cb = only_once(_next(q, tasks));
                                worker(data, cb);
                            }
                        },
                        length: function length() {
                            return q.tasks.length;
                        },
                        running: function running() {
                            return workers;
                        },
                        workersList: function workersList() {
                            return _workersList;
                        },
                        idle: function idle() {
                            return q.tasks.length + workers === 0;
                        },
                        pause: function pause() {
                            q.paused = true;
                        },
                        resume: function resume() {
                            if (q.paused === false) {
                                return;
                            }
                            q.paused = false;
                            var resumeCount = Math.min(q.concurrency, q.tasks.length);
                            // Need to call q.process once per concurrent
                            // worker to preserve full concurrency after pause
                            for (var w = 1; w <= resumeCount; w++) {
                                async.setImmediate(q.process);
                            }
                        }
                    };
                    return q;
                }

                async.queue = function (worker, concurrency) {
                    var q = _queue(function (items, cb) {
                        worker(items[0], cb);
                    }, concurrency, 1);

                    return q;
                };

                async.priorityQueue = function (worker, concurrency) {

                    function _compareTasks(a, b) {
                        return a.priority - b.priority;
                    }

                    function _binarySearch(sequence, item, compare) {
                        var beg = -1,
                            end = sequence.length - 1;
                        while (beg < end) {
                            var mid = beg + (end - beg + 1 >>> 1);
                            if (compare(item, sequence[mid]) >= 0) {
                                beg = mid;
                            } else {
                                end = mid - 1;
                            }
                        }
                        return beg;
                    }

                    function _insert(q, data, priority, callback) {
                        if (callback != null && typeof callback !== "function") {
                            throw new Error("task callback must be a function");
                        }
                        q.started = true;
                        if (!_isArray(data)) {
                            data = [data];
                        }
                        if (data.length === 0) {
                            // call drain immediately if there are no tasks
                            return async.setImmediate(function () {
                                q.drain();
                            });
                        }
                        _arrayEach(data, function (task) {
                            var item = {
                                data: task,
                                priority: priority,
                                callback: typeof callback === 'function' ? callback : noop
                            };

                            q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                            if (q.tasks.length === q.concurrency) {
                                q.saturated();
                            }
                            async.setImmediate(q.process);
                        });
                    }

                    // Start with a normal queue
                    var q = async.queue(worker, concurrency);

                    // Override push to accept second parameter representing priority
                    q.push = function (data, priority, callback) {
                        _insert(q, data, priority, callback);
                    };

                    // Remove unshift function
                    delete q.unshift;

                    return q;
                };

                async.cargo = function (worker, payload) {
                    return _queue(worker, 1, payload);
                };

                function _console_fn(name) {
                    return _restParam(function (fn, args) {
                        fn.apply(null, args.concat([_restParam(function (err, args) {
                            if ((typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object') {
                                if (err) {
                                    if (console.error) {
                                        console.error(err);
                                    }
                                } else if (console[name]) {
                                    _arrayEach(args, function (x) {
                                        console[name](x);
                                    });
                                }
                            }
                        })]));
                    });
                }
                async.log = _console_fn('log');
                async.dir = _console_fn('dir');
                /*async.info = _console_fn('info');
                async.warn = _console_fn('warn');
                async.error = _console_fn('error');*/

                async.memoize = function (fn, hasher) {
                    var memo = {};
                    var queues = {};
                    var has = Object.prototype.hasOwnProperty;
                    hasher = hasher || identity;
                    var memoized = _restParam(function memoized(args) {
                        var callback = args.pop();
                        var key = hasher.apply(null, args);
                        if (has.call(memo, key)) {
                            async.setImmediate(function () {
                                callback.apply(null, memo[key]);
                            });
                        } else if (has.call(queues, key)) {
                            queues[key].push(callback);
                        } else {
                            queues[key] = [callback];
                            fn.apply(null, args.concat([_restParam(function (args) {
                                memo[key] = args;
                                var q = queues[key];
                                delete queues[key];
                                for (var i = 0, l = q.length; i < l; i++) {
                                    q[i].apply(null, args);
                                }
                            })]));
                        }
                    });
                    memoized.memo = memo;
                    memoized.unmemoized = fn;
                    return memoized;
                };

                async.unmemoize = function (fn) {
                    return function () {
                        return (fn.unmemoized || fn).apply(null, arguments);
                    };
                };

                function _times(mapper) {
                    return function (count, iterator, callback) {
                        mapper(_range(count), iterator, callback);
                    };
                }

                async.times = _times(async.map);
                async.timesSeries = _times(async.mapSeries);
                async.timesLimit = function (count, limit, iterator, callback) {
                    return async.mapLimit(_range(count), limit, iterator, callback);
                };

                async.seq = function () /* functions... */{
                    var fns = arguments;
                    return _restParam(function (args) {
                        var that = this;

                        var callback = args[args.length - 1];
                        if (typeof callback == 'function') {
                            args.pop();
                        } else {
                            callback = noop;
                        }

                        async.reduce(fns, args, function (newargs, fn, cb) {
                            fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                                cb(err, nextargs);
                            })]));
                        }, function (err, results) {
                            callback.apply(that, [err].concat(results));
                        });
                    });
                };

                async.compose = function () /* functions... */{
                    return async.seq.apply(null, Array.prototype.reverse.call(arguments));
                };

                function _applyEach(eachfn) {
                    return _restParam(function (fns, args) {
                        var go = _restParam(function (args) {
                            var that = this;
                            var callback = args.pop();
                            return eachfn(fns, function (fn, _, cb) {
                                fn.apply(that, args.concat([cb]));
                            }, callback);
                        });
                        if (args.length) {
                            return go.apply(this, args);
                        } else {
                            return go;
                        }
                    });
                }

                async.applyEach = _applyEach(async.eachOf);
                async.applyEachSeries = _applyEach(async.eachOfSeries);

                async.forever = function (fn, callback) {
                    var done = only_once(callback || noop);
                    var task = ensureAsync(fn);
                    function next(err) {
                        if (err) {
                            return done(err);
                        }
                        task(next);
                    }
                    next();
                };

                function ensureAsync(fn) {
                    return _restParam(function (args) {
                        var callback = args.pop();
                        args.push(function () {
                            var innerArgs = arguments;
                            if (sync) {
                                async.setImmediate(function () {
                                    callback.apply(null, innerArgs);
                                });
                            } else {
                                callback.apply(null, innerArgs);
                            }
                        });
                        var sync = true;
                        fn.apply(this, args);
                        sync = false;
                    });
                }

                async.ensureAsync = ensureAsync;

                async.constant = _restParam(function (values) {
                    var args = [null].concat(values);
                    return function (callback) {
                        return callback.apply(this, args);
                    };
                });

                async.wrapSync = async.asyncify = function asyncify(func) {
                    return _restParam(function (args) {
                        var callback = args.pop();
                        var result;
                        try {
                            result = func.apply(this, args);
                        } catch (e) {
                            return callback(e);
                        }
                        // if result is Promise object
                        if (_isObject(result) && typeof result.then === "function") {
                            result.then(function (value) {
                                callback(null, value);
                            })["catch"](function (err) {
                                callback(err.message ? err : new Error(err));
                            });
                        } else {
                            callback(null, result);
                        }
                    });
                };

                // Node.js
                if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
                    module.exports = async;
                }
                // AMD / RequireJS
                else if (typeof define === 'function' && define.amd) {
                        define([], function () {
                            return async;
                        });
                    }
                    // included directly via <script> tag
                    else {
                            root.async = async;
                        }
            })();
        }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "_process": 4 }], 2: [function (require, module, exports) {
        /*
        	Baby Parse
        	v0.4.1
        	https://github.com/Rich-Harris/BabyParse
        
        	Created by Rich Harris
        	Maintained by Matt Holt
        
        	Based on Papa Parse v4.0.7 by Matt Holt
        	https://github.com/mholt/PapaParse
        */
        (function (global) {

            // A configuration object from which to draw default settings
            var DEFAULTS = {
                delimiter: "", // empty: auto-detect
                newline: "", // empty: auto-detect
                header: false,
                dynamicTyping: false,
                preview: 0,
                step: undefined,
                comments: false,
                complete: undefined,
                skipEmptyLines: false,
                fastMode: false
            };

            var Baby = {};
            Baby.parse = CsvToJson;
            Baby.unparse = JsonToCsv;
            Baby.RECORD_SEP = String.fromCharCode(30);
            Baby.UNIT_SEP = String.fromCharCode(31);
            Baby.BYTE_ORDER_MARK = "﻿";
            Baby.BAD_DELIMITERS = ["\r", "\n", "\"", Baby.BYTE_ORDER_MARK];
            Baby.DefaultDelimiter = ","; // Used if not specified and detection fails
            Baby.Parser = Parser; // For testing/dev only
            Baby.ParserHandle = ParserHandle; // For testing/dev only

            function CsvToJson(_input, _config) {
                var config = copyAndValidateConfig(_config);
                var ph = new ParserHandle(config);
                var results = ph.parse(_input);
                if (isFunction(config.complete)) config.complete(results);
                return results;
            }

            function JsonToCsv(_input, _config) {
                var _output = "";
                var _fields = [];

                // Default configuration
                var _quotes = false; // whether to surround every datum with quotes
                var _delimiter = ","; // delimiting character
                var _newline = "\r\n"; // newline character(s)

                unpackConfig();

                if (typeof _input === 'string') _input = JSON.parse(_input);

                if (_input instanceof Array) {
                    if (!_input.length || _input[0] instanceof Array) return serialize(null, _input);else if (_typeof(_input[0]) === 'object') return serialize(objectKeys(_input[0]), _input);
                } else if ((typeof _input === "undefined" ? "undefined" : _typeof(_input)) === 'object') {
                    if (typeof _input.data === 'string') _input.data = JSON.parse(_input.data);

                    if (_input.data instanceof Array) {
                        if (!_input.fields) _input.fields = _input.data[0] instanceof Array ? _input.fields : objectKeys(_input.data[0]);

                        if (!(_input.data[0] instanceof Array) && _typeof(_input.data[0]) !== 'object') _input.data = [_input.data]; // handles input like [1,2,3] or ["asdf"]
                    }

                    return serialize(_input.fields || [], _input.data || []);
                }

                // Default (any valid paths should return before this)
                throw "exception: Unable to serialize unrecognized input";

                function unpackConfig() {
                    if ((typeof _config === "undefined" ? "undefined" : _typeof(_config)) !== 'object') return;

                    if (typeof _config.delimiter === 'string' && _config.delimiter.length == 1 && Baby.BAD_DELIMITERS.indexOf(_config.delimiter) == -1) {
                        _delimiter = _config.delimiter;
                    }

                    if (typeof _config.quotes === 'boolean' || _config.quotes instanceof Array) _quotes = _config.quotes;

                    if (typeof _config.newline === 'string') _newline = _config.newline;
                }

                // Turns an object's keys into an array
                function objectKeys(obj) {
                    if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== 'object') return [];
                    var keys = [];
                    for (var key in obj) {
                        keys.push(key);
                    }return keys;
                }

                // The double for loop that iterates the data and writes out a CSV string including header row
                function serialize(fields, data) {
                    var csv = "";

                    if (typeof fields === 'string') fields = JSON.parse(fields);
                    if (typeof data === 'string') data = JSON.parse(data);

                    var hasHeader = fields instanceof Array && fields.length > 0;
                    var dataKeyedByField = !(data[0] instanceof Array);

                    // If there a header row, write it first
                    if (hasHeader) {
                        for (var i = 0; i < fields.length; i++) {
                            if (i > 0) csv += _delimiter;
                            csv += safe(fields[i], i);
                        }
                        if (data.length > 0) csv += _newline;
                    }

                    // Then write out the data
                    for (var row = 0; row < data.length; row++) {
                        var maxCol = hasHeader ? fields.length : data[row].length;

                        for (var col = 0; col < maxCol; col++) {
                            if (col > 0) csv += _delimiter;
                            var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
                            csv += safe(data[row][colIdx], col);
                        }

                        if (row < data.length - 1) csv += _newline;
                    }

                    return csv;
                }

                // Encloses a value around quotes if needed (makes a value safe for CSV insertion)
                function safe(str, col) {
                    if (typeof str === "undefined" || str === null) return "";

                    str = str.toString().replace(/"/g, '""');

                    var needsQuotes = typeof _quotes === 'boolean' && _quotes || _quotes instanceof Array && _quotes[col] || hasAny(str, Baby.BAD_DELIMITERS) || str.indexOf(_delimiter) > -1 || str.charAt(0) == ' ' || str.charAt(str.length - 1) == ' ';

                    return needsQuotes ? '"' + str + '"' : str;
                }

                function hasAny(str, substrings) {
                    for (var i = 0; i < substrings.length; i++) {
                        if (str.indexOf(substrings[i]) > -1) return true;
                    }return false;
                }
            }

            // Use one ParserHandle per entire CSV file or string
            function ParserHandle(_config) {
                // One goal is to minimize the use of regular expressions...
                var FLOAT = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;

                var self = this;
                var _stepCounter = 0; // Number of times step was called (number of rows parsed)
                var _input; // The input being parsed
                var _parser; // The core parser being used
                var _paused = false; // Whether we are paused or not
                var _delimiterError; // Temporary state between delimiter detection and processing results
                var _fields = []; // Fields are from the header row of the input, if there is one
                var _results = { // The last results returned from the parser
                    data: [],
                    errors: [],
                    meta: {}
                };

                if (isFunction(_config.step)) {
                    var userStep = _config.step;
                    _config.step = function (results) {
                        _results = results;

                        if (needsHeaderRow()) processResults();else // only call user's step function after header row
                            {
                                processResults();

                                // It's possbile that this line was empty and there's no row here after all
                                if (_results.data.length == 0) return;

                                _stepCounter += results.data.length;
                                if (_config.preview && _stepCounter > _config.preview) _parser.abort();else userStep(_results, self);
                            }
                    };
                }

                this.parse = function (input) {
                    if (!_config.newline) _config.newline = guessLineEndings(input);

                    _delimiterError = false;
                    if (!_config.delimiter) {
                        var delimGuess = guessDelimiter(input);
                        if (delimGuess.successful) _config.delimiter = delimGuess.bestDelimiter;else {
                            _delimiterError = true; // add error after parsing (otherwise it would be overwritten)
                            _config.delimiter = Baby.DefaultDelimiter;
                        }
                        _results.meta.delimiter = _config.delimiter;
                    }

                    var parserConfig = copy(_config);
                    if (_config.preview && _config.header) parserConfig.preview++; // to compensate for header row

                    _input = input;
                    _parser = new Parser(parserConfig);
                    _results = _parser.parse(_input);
                    processResults();
                    if (isFunction(_config.complete) && !_paused && (!self.streamer || self.streamer.finished())) _config.complete(_results);
                    return _paused ? { meta: { paused: true } } : _results || { meta: { paused: false } };
                };

                this.pause = function () {
                    _paused = true;
                    _parser.abort();
                    _input = _input.substr(_parser.getCharIndex());
                };

                this.resume = function () {
                    _paused = false;
                    _parser = new Parser(_config);
                    _parser.parse(_input);
                    if (!_paused) {
                        if (self.streamer && !self.streamer.finished()) self.streamer.resume(); // more of the file yet to come
                        else if (isFunction(_config.complete)) _config.complete(_results);
                    }
                };

                this.abort = function () {
                    _parser.abort();
                    if (isFunction(_config.complete)) _config.complete(_results);
                    _input = "";
                };

                function processResults() {
                    if (_results && _delimiterError) {
                        addError("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + Baby.DefaultDelimiter + "'");
                        _delimiterError = false;
                    }

                    if (_config.skipEmptyLines) {
                        for (var i = 0; i < _results.data.length; i++) {
                            if (_results.data[i].length == 1 && _results.data[i][0] == "") _results.data.splice(i--, 1);
                        }
                    }

                    if (needsHeaderRow()) fillHeaderFields();

                    return applyHeaderAndDynamicTyping();
                }

                function needsHeaderRow() {
                    return _config.header && _fields.length == 0;
                }

                function fillHeaderFields() {
                    if (!_results) return;
                    for (var i = 0; needsHeaderRow() && i < _results.data.length; i++) {
                        for (var j = 0; j < _results.data[i].length; j++) {
                            _fields.push(_results.data[i][j]);
                        }
                    }_results.data.splice(0, 1);
                }

                function applyHeaderAndDynamicTyping() {
                    if (!_results || !_config.header && !_config.dynamicTyping) return _results;

                    for (var i = 0; i < _results.data.length; i++) {
                        var row = {};

                        for (var j = 0; j < _results.data[i].length; j++) {
                            if (_config.dynamicTyping) {
                                var value = _results.data[i][j];
                                if (value == "true" || value === "TRUE") _results.data[i][j] = true;else if (value == "false" || value === "FALSE") _results.data[i][j] = false;else _results.data[i][j] = tryParseFloat(value);
                            }

                            if (_config.header) {
                                if (j >= _fields.length) {
                                    if (!row["__parsed_extra"]) row["__parsed_extra"] = [];
                                    row["__parsed_extra"].push(_results.data[i][j]);
                                } else row[_fields[j]] = _results.data[i][j];
                            }
                        }

                        if (_config.header) {
                            _results.data[i] = row;
                            if (j > _fields.length) addError("FieldMismatch", "TooManyFields", "Too many fields: expected " + _fields.length + " fields but parsed " + j, i);else if (j < _fields.length) addError("FieldMismatch", "TooFewFields", "Too few fields: expected " + _fields.length + " fields but parsed " + j, i);
                        }
                    }

                    if (_config.header && _results.meta) _results.meta.fields = _fields;
                    return _results;
                }

                function guessDelimiter(input) {
                    var delimChoices = [",", "\t", "|", ";", Baby.RECORD_SEP, Baby.UNIT_SEP];
                    var bestDelim, bestDelta, fieldCountPrevRow;

                    for (var i = 0; i < delimChoices.length; i++) {
                        var delim = delimChoices[i];
                        var delta = 0,
                            avgFieldCount = 0;
                        fieldCountPrevRow = undefined;

                        var preview = new Parser({
                            delimiter: delim,
                            preview: 10
                        }).parse(input);

                        for (var j = 0; j < preview.data.length; j++) {
                            var fieldCount = preview.data[j].length;
                            avgFieldCount += fieldCount;

                            if (typeof fieldCountPrevRow === 'undefined') {
                                fieldCountPrevRow = fieldCount;
                                continue;
                            } else if (fieldCount > 1) {
                                delta += Math.abs(fieldCount - fieldCountPrevRow);
                                fieldCountPrevRow = fieldCount;
                            }
                        }

                        avgFieldCount /= preview.data.length;

                        if ((typeof bestDelta === 'undefined' || delta < bestDelta) && avgFieldCount > 1.99) {
                            bestDelta = delta;
                            bestDelim = delim;
                        }
                    }

                    _config.delimiter = bestDelim;

                    return {
                        successful: !!bestDelim,
                        bestDelimiter: bestDelim
                    };
                }

                function guessLineEndings(input) {
                    input = input.substr(0, 1024 * 1024); // max length 1 MB

                    var r = input.split('\r');

                    if (r.length == 1) return '\n';

                    var numWithN = 0;
                    for (var i = 0; i < r.length; i++) {
                        if (r[i][0] == '\n') numWithN++;
                    }

                    return numWithN >= r.length / 2 ? '\r\n' : '\r';
                }

                function tryParseFloat(val) {
                    var isNumber = FLOAT.test(val);
                    return isNumber ? parseFloat(val) : val;
                }

                function addError(type, code, msg, row) {
                    _results.errors.push({
                        type: type,
                        code: code,
                        message: msg,
                        row: row
                    });
                }
            }

            // The core parser implements speedy and correct CSV parsing
            function Parser(config) {
                // Unpack the config object
                config = config || {};
                var delim = config.delimiter;
                var newline = config.newline;
                var comments = config.comments;
                var step = config.step;
                var preview = config.preview;
                var fastMode = config.fastMode;

                // Delimiter must be valid
                if (typeof delim !== 'string' || delim.length != 1 || Baby.BAD_DELIMITERS.indexOf(delim) > -1) delim = ",";

                // Comment character must be valid
                if (comments === delim) throw "Comment character same as delimiter";else if (comments === true) comments = "#";else if (typeof comments !== 'string' || Baby.BAD_DELIMITERS.indexOf(comments) > -1) comments = false;

                // Newline must be valid: \r, \n, or \r\n
                if (newline != '\n' && newline != '\r' && newline != '\r\n') newline = '\n';

                // We're gonna need these at the Parser scope
                var cursor = 0;
                var aborted = false;

                this.parse = function (input) {
                    // For some reason, in Chrome, this speeds things up (!?)
                    if (typeof input !== 'string') throw "Input must be a string";

                    // We don't need to compute some of these every time parse() is called,
                    // but having them in a more local scope seems to perform better
                    var inputLen = input.length,
                        delimLen = delim.length,
                        newlineLen = newline.length,
                        commentsLen = comments.length;
                    var stepIsFunction = typeof step === 'function';

                    // Establish starting state
                    cursor = 0;
                    var data = [],
                        errors = [],
                        row = [];

                    if (!input) return returnable();

                    if (fastMode) {
                        // Fast mode assumes there are no quoted fields in the input
                        var rows = input.split(newline);
                        for (var i = 0; i < rows.length; i++) {
                            if (comments && rows[i].substr(0, commentsLen) == comments) continue;
                            if (stepIsFunction) {
                                data = [rows[i].split(delim)];
                                doStep();
                                if (aborted) return returnable();
                            } else data.push(rows[i].split(delim));
                            if (preview && i >= preview) {
                                data = data.slice(0, preview);
                                return returnable(true);
                            }
                        }
                        return returnable();
                    }

                    var nextDelim = input.indexOf(delim, cursor);
                    var nextNewline = input.indexOf(newline, cursor);

                    // Parser loop
                    for (;;) {
                        // Field has opening quote
                        if (input[cursor] == '"') {
                            // Start our search for the closing quote where the cursor is
                            var quoteSearch = cursor;

                            // Skip the opening quote
                            cursor++;

                            for (;;) {
                                // Find closing quote
                                var quoteSearch = input.indexOf('"', quoteSearch + 1);

                                if (quoteSearch === -1) {
                                    // No closing quote... what a pity
                                    errors.push({
                                        type: "Quotes",
                                        code: "MissingQuotes",
                                        message: "Quoted field unterminated",
                                        row: data.length, // row has yet to be inserted
                                        index: cursor
                                    });
                                    return finish();
                                }

                                if (quoteSearch === inputLen - 1) {
                                    // Closing quote at EOF
                                    row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
                                    data.push(row);
                                    if (stepIsFunction) doStep();
                                    return returnable();
                                }

                                // If this quote is escaped, it's part of the data; skip it
                                if (input[quoteSearch + 1] == '"') {
                                    quoteSearch++;
                                    continue;
                                }

                                if (input[quoteSearch + 1] == delim) {
                                    // Closing quote followed by delimiter
                                    row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
                                    cursor = quoteSearch + 1 + delimLen;
                                    nextDelim = input.indexOf(delim, cursor);
                                    nextNewline = input.indexOf(newline, cursor);
                                    break;
                                }

                                if (input.substr(quoteSearch + 1, newlineLen) === newline) {
                                    // Closing quote followed by newline
                                    row.push(input.substring(cursor, quoteSearch).replace(/""/g, '"'));
                                    saveRow(quoteSearch + 1 + newlineLen);
                                    nextDelim = input.indexOf(delim, cursor); // because we may have skipped the nextDelim in the quoted field

                                    if (stepIsFunction) {
                                        doStep();
                                        if (aborted) return returnable();
                                    }

                                    if (preview && data.length >= preview) return returnable(true);

                                    break;
                                }
                            }

                            continue;
                        }

                        // Comment found at start of new line
                        if (comments && row.length === 0 && input.substr(cursor, commentsLen) === comments) {
                            if (nextNewline == -1) // Comment ends at EOF
                                return returnable();
                            cursor = nextNewline + newlineLen;
                            nextNewline = input.indexOf(newline, cursor);
                            nextDelim = input.indexOf(delim, cursor);
                            continue;
                        }

                        // Next delimiter comes before next newline, so we've reached end of field
                        if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1)) {
                            row.push(input.substring(cursor, nextDelim));
                            cursor = nextDelim + delimLen;
                            nextDelim = input.indexOf(delim, cursor);
                            continue;
                        }

                        // End of row
                        if (nextNewline !== -1) {
                            row.push(input.substring(cursor, nextNewline));
                            saveRow(nextNewline + newlineLen);

                            if (stepIsFunction) {
                                doStep();
                                if (aborted) return returnable();
                            }

                            if (preview && data.length >= preview) return returnable(true);

                            continue;
                        }

                        break;
                    }

                    return finish();

                    // Appends the remaining input from cursor to the end into
                    // row, saves the row, calls step, and returns the results.
                    function finish() {
                        row.push(input.substr(cursor));
                        data.push(row);
                        cursor = inputLen; // important in case parsing is paused
                        if (stepIsFunction) doStep();
                        return returnable();
                    }

                    // Appends the current row to the results. It sets the cursor
                    // to newCursor and finds the nextNewline. The caller should
                    // take care to execute user's step function and check for
                    // preview and end parsing if necessary.
                    function saveRow(newCursor) {
                        data.push(row);
                        row = [];
                        cursor = newCursor;
                        nextNewline = input.indexOf(newline, cursor);
                    }

                    // Returns an object with the results, errors, and meta.
                    function returnable(stopped) {
                        return {
                            data: data,
                            errors: errors,
                            meta: {
                                delimiter: delim,
                                linebreak: newline,
                                aborted: aborted,
                                truncated: !!stopped
                            }
                        };
                    }

                    // Executes the user's step function and resets data & errors.
                    function doStep() {
                        step(returnable());
                        data = [], errors = [];
                    }
                };

                // Sets the abort flag
                this.abort = function () {
                    aborted = true;
                };

                // Gets the cursor position
                this.getCharIndex = function () {
                    return cursor;
                };
            }

            // Replaces bad config values with good, default ones
            function copyAndValidateConfig(origConfig) {
                if ((typeof origConfig === "undefined" ? "undefined" : _typeof(origConfig)) !== 'object') origConfig = {};

                var config = copy(origConfig);

                if (typeof config.delimiter !== 'string' || config.delimiter.length != 1 || Baby.BAD_DELIMITERS.indexOf(config.delimiter) > -1) config.delimiter = DEFAULTS.delimiter;

                if (config.newline != '\n' && config.newline != '\r' && config.newline != '\r\n') config.newline = DEFAULTS.newline;

                if (typeof config.header !== 'boolean') config.header = DEFAULTS.header;

                if (typeof config.dynamicTyping !== 'boolean') config.dynamicTyping = DEFAULTS.dynamicTyping;

                if (typeof config.preview !== 'number') config.preview = DEFAULTS.preview;

                if (typeof config.step !== 'function') config.step = DEFAULTS.step;

                if (typeof config.complete !== 'function') config.complete = DEFAULTS.complete;

                if (typeof config.skipEmptyLines !== 'boolean') config.skipEmptyLines = DEFAULTS.skipEmptyLines;

                if (typeof config.fastMode !== 'boolean') config.fastMode = DEFAULTS.fastMode;

                return config;
            }

            function copy(obj) {
                if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== 'object') return obj;
                var cpy = obj instanceof Array ? [] : {};
                for (var key in obj) {
                    cpy[key] = copy(obj[key]);
                }return cpy;
            }

            function isFunction(func) {
                return typeof func === 'function';
            }

            // export to Node...
            if (typeof module !== 'undefined' && module.exports) {
                module.exports = Baby;
            }

            // ...or as AMD module...
            else if (typeof define === 'function' && define.amd) {
                    define(function () {
                        return Baby;
                    });
                }

                // ...or as browser global
                else {
                        global.Baby = Baby;
                    }
        })(typeof window !== 'undefined' ? window : this);
    }, {}], 3: [function (require, module, exports) {
        // Browser Request
        //
        // Licensed under the Apache License, Version 2.0 (the "License");
        // you may not use this file except in compliance with the License.
        // You may obtain a copy of the License at
        //
        //     http://www.apache.org/licenses/LICENSE-2.0
        //
        // Unless required by applicable law or agreed to in writing, software
        // distributed under the License is distributed on an "AS IS" BASIS,
        // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // See the License for the specific language governing permissions and
        // limitations under the License.

        // UMD HEADER START
        (function (root, factory) {
            if (typeof define === 'function' && define.amd) {
                // AMD. Register as an anonymous module.
                define([], factory);
            } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
                // Node. Does not work with strict CommonJS, but
                // only CommonJS-like enviroments that support module.exports,
                // like Node.
                module.exports = factory();
            } else {
                // Browser globals (root is window)
                root.returnExports = factory();
            }
        })(this, function () {
            // UMD HEADER END

            var XHR = XMLHttpRequest;
            if (!XHR) throw new Error('missing XMLHttpRequest');
            request.log = {
                'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
            };

            var DEFAULT_TIMEOUT = 3 * 60 * 1000; // 3 minutes

            //
            // request
            //

            function request(options, callback) {
                // The entry-point to the API: prep the options object and pass the real work to run_xhr.
                if (typeof callback !== 'function') throw new Error('Bad callback given: ' + callback);

                if (!options) throw new Error('No options given');

                var options_onResponse = options.onResponse; // Save this for later.

                if (typeof options === 'string') options = { 'uri': options };else options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

                options.onResponse = options_onResponse; // And put it back.

                if (options.verbose) request.log = getLogger();

                if (options.url) {
                    options.uri = options.url;
                    delete options.url;
                }

                if (!options.uri && options.uri !== "") throw new Error("options.uri is a required argument");

                if (typeof options.uri != "string") throw new Error("options.uri must be a string");

                var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect'];
                for (var i = 0; i < unsupported_options.length; i++) {
                    if (options[unsupported_options[i]]) throw new Error("options." + unsupported_options[i] + " is not supported");
                }options.callback = callback;
                options.method = options.method || 'GET';
                options.headers = options.headers || {};
                options.body = options.body || null;
                options.timeout = options.timeout || request.DEFAULT_TIMEOUT;

                if (options.headers.host) throw new Error("Options.headers.host is not supported");

                if (options.json) {
                    options.headers.accept = options.headers.accept || 'application/json';
                    if (options.method !== 'GET') options.headers['content-type'] = 'application/json';

                    if (typeof options.json !== 'boolean') options.body = JSON.stringify(options.json);else if (typeof options.body !== 'string') options.body = JSON.stringify(options.body);
                }

                //BEGIN QS Hack
                var serialize = function serialize(obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }return str.join("&");
                };

                if (options.qs) {
                    var qs = typeof options.qs == 'string' ? options.qs : serialize(options.qs);
                    if (options.uri.indexOf('?') !== -1) {
                        //no get params
                        options.uri = options.uri + '&' + qs;
                    } else {
                        //existing get params
                        options.uri = options.uri + '?' + qs;
                    }
                }
                //END QS Hack

                //BEGIN FORM Hack
                var multipart = function multipart(obj) {
                    //todo: support file type (useful?)
                    var result = {};
                    result.boundry = '-------------------------------' + Math.floor(Math.random() * 1000000000);
                    var lines = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            lines.push('--' + result.boundry + "\n" + 'Content-Disposition: form-data; name="' + p + '"' + "\n" + "\n" + obj[p] + "\n");
                        }
                    }
                    lines.push('--' + result.boundry + '--');
                    result.body = lines.join('');
                    result.length = result.body.length;
                    result.type = 'multipart/form-data; boundary=' + result.boundry;
                    return result;
                };

                if (options.form) {
                    if (typeof options.form == 'string') throw 'form name unsupported';
                    if (options.method === 'POST') {
                        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
                        options.headers['content-type'] = encoding;
                        switch (encoding) {
                            case 'application/x-www-form-urlencoded':
                                options.body = serialize(options.form).replace(/%20/g, "+");
                                break;
                            case 'multipart/form-data':
                                var multi = multipart(options.form);
                                //options.headers['content-length'] = multi.length;
                                options.body = multi.body;
                                options.headers['content-type'] = multi.type;
                                break;
                            default:
                                throw new Error('unsupported encoding:' + encoding);
                        }
                    }
                }
                //END FORM Hack

                // If onResponse is boolean true, call back immediately when the response is known,
                // not when the full request is complete.
                options.onResponse = options.onResponse || noop;
                if (options.onResponse === true) {
                    options.onResponse = callback;
                    options.callback = noop;
                }

                // XXX Browsers do not like this.
                //if(options.body)
                //  options.headers['content-length'] = options.body.length;

                // HTTP basic authentication
                if (!options.headers.authorization && options.auth) options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

                return run_xhr(options);
            }

            var req_seq = 0;
            function run_xhr(options) {
                var xhr = new XHR(),
                    timed_out = false,
                    is_cors = is_crossDomain(options.uri),
                    supports_cors = 'withCredentials' in xhr;

                req_seq += 1;
                xhr.seq_id = req_seq;
                xhr.id = req_seq + ': ' + options.method + ' ' + options.uri;
                xhr._id = xhr.id; // I know I will type "_id" from habit all the time.

                if (is_cors && !supports_cors) {
                    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri);
                    cors_err.cors = 'unsupported';
                    return options.callback(cors_err, xhr);
                }

                xhr.timeoutTimer = setTimeout(too_late, options.timeout);
                function too_late() {
                    timed_out = true;
                    var er = new Error('ETIMEDOUT');
                    er.code = 'ETIMEDOUT';
                    er.duration = options.timeout;

                    request.log.error('Timeout', { 'id': xhr._id, 'milliseconds': options.timeout });
                    return options.callback(er, xhr);
                }

                // Some states can be skipped over, so remember what is still incomplete.
                var did = { 'response': false, 'loading': false, 'end': false };

                xhr.onreadystatechange = on_state_change;
                xhr.open(options.method, options.uri, true); // asynchronous
                if (is_cors) xhr.withCredentials = !!options.withCredentials;
                xhr.send(options.body);
                return xhr;

                function on_state_change(event) {
                    if (timed_out) return request.log.debug('Ignoring timed out state change', { 'state': xhr.readyState, 'id': xhr.id });

                    request.log.debug('State change', { 'state': xhr.readyState, 'id': xhr.id, 'timed_out': timed_out });

                    if (xhr.readyState === XHR.OPENED) {
                        request.log.debug('Request started', { 'id': xhr.id });
                        for (var key in options.headers) {
                            xhr.setRequestHeader(key, options.headers[key]);
                        }
                    } else if (xhr.readyState === XHR.HEADERS_RECEIVED) on_response();else if (xhr.readyState === XHR.LOADING) {
                        on_response();
                        on_loading();
                    } else if (xhr.readyState === XHR.DONE) {
                        on_response();
                        on_loading();
                        on_end();
                    }
                }

                function on_response() {
                    if (did.response) return;

                    did.response = true;
                    request.log.debug('Got response', { 'id': xhr.id, 'status': xhr.status });
                    clearTimeout(xhr.timeoutTimer);
                    xhr.statusCode = xhr.status; // Node request compatibility

                    // Detect failed CORS requests.
                    if (is_cors && xhr.statusCode == 0) {
                        var cors_err = new Error('CORS request rejected: ' + options.uri);
                        cors_err.cors = 'rejected';

                        // Do not process this request further.
                        did.loading = true;
                        did.end = true;

                        return options.callback(cors_err, xhr);
                    }

                    options.onResponse(null, xhr);
                }

                function on_loading() {
                    if (did.loading) return;

                    did.loading = true;
                    request.log.debug('Response body loading', { 'id': xhr.id });
                    // TODO: Maybe simulate "data" events by watching xhr.responseText
                }

                function on_end() {
                    if (did.end) return;

                    did.end = true;
                    request.log.debug('Request done', { 'id': xhr.id });

                    xhr.body = xhr.responseText;
                    if (options.json) {
                        try {
                            xhr.body = JSON.parse(xhr.responseText);
                        } catch (er) {
                            return options.callback(er, xhr);
                        }
                    }

                    options.callback(null, xhr, xhr.body);
                }
            } // request

            request.withCredentials = false;
            request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

            //
            // defaults
            //

            request.defaults = function (options, requester) {
                var def = function def(method) {
                    var d = function d(params, callback) {
                        if (typeof params === 'string') params = { 'uri': params };else {
                            params = JSON.parse(JSON.stringify(params));
                        }
                        for (var i in options) {
                            if (params[i] === undefined) params[i] = options[i];
                        }
                        return method(params, callback);
                    };
                    return d;
                };
                var de = def(request);
                de.get = def(request.get);
                de.post = def(request.post);
                de.put = def(request.put);
                de.head = def(request.head);
                return de;
            };

            //
            // HTTP method shortcuts
            //

            var shortcuts = ['get', 'put', 'post', 'head'];
            shortcuts.forEach(function (shortcut) {
                var method = shortcut.toUpperCase();
                var func = shortcut.toLowerCase();

                request[func] = function (opts) {
                    if (typeof opts === 'string') opts = { 'method': method, 'uri': opts };else {
                        opts = JSON.parse(JSON.stringify(opts));
                        opts.method = method;
                    }

                    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
                    return request.apply(this, args);
                };
            });

            //
            // CouchDB shortcut
            //

            request.couch = function (options, callback) {
                if (typeof options === 'string') options = { 'uri': options };

                // Just use the request API to do JSON.
                options.json = true;
                if (options.body) options.json = options.body;
                delete options.body;

                callback = callback || noop;

                var xhr = request(options, couch_handler);
                return xhr;

                function couch_handler(er, resp, body) {
                    if (er) return callback(er, resp, body);

                    if ((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
                        // The body is a Couch JSON object indicating the error.
                        er = new Error('CouchDB error: ' + (body.error.reason || body.error.error));
                        for (var key in body) {
                            er[key] = body[key];
                        }return callback(er, resp, body);
                    }

                    return callback(er, resp, body);
                }
            };

            //
            // Utility
            //

            function noop() {}

            function getLogger() {
                var logger = {},
                    levels = ['trace', 'debug', 'info', 'warn', 'error'],
                    level,
                    i;

                for (i = 0; i < levels.length; i++) {
                    level = levels[i];

                    logger[level] = noop;
                    if (typeof console !== 'undefined' && console && console[level]) logger[level] = formatted(console, level);
                }

                return logger;
            }

            function formatted(obj, method) {
                return formatted_logger;

                function formatted_logger(str, context) {
                    if ((typeof context === "undefined" ? "undefined" : _typeof(context)) === 'object') str += ' ' + JSON.stringify(context);

                    return obj[method].call(obj, str);
                }
            }

            // Return whether a URL is a cross-domain request.
            function is_crossDomain(url) {
                var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

                // jQuery #8138, IE may throw an exception when accessing
                // a field from window.location if document.domain has been set
                var ajaxLocation;
                try {
                    ajaxLocation = location.href;
                } catch (e) {
                    // Use the href attribute of an A element since IE will modify it given document.location
                    ajaxLocation = document.createElement("a");
                    ajaxLocation.href = "";
                    ajaxLocation = ajaxLocation.href;
                }

                var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [],
                    parts = rurl.exec(url.toLowerCase());

                var result = !!(parts && (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))));

                //console.debug('is_crossDomain('+url+') -> ' + result)
                return result;
            }

            // MIT License from http://phpjs.org/functions/base64_encode:358
            function b64_enc(data) {
                // Encodes string using MIME base64 algorithm
                var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                var o1,
                    o2,
                    o3,
                    h1,
                    h2,
                    h3,
                    h4,
                    bits,
                    i = 0,
                    ac = 0,
                    enc = "",
                    tmp_arr = [];

                if (!data) {
                    return data;
                }

                // assume utf8 data
                // data = this.utf8_encode(data+'');

                do {
                    // pack three octets into four hexets
                    o1 = data.charCodeAt(i++);
                    o2 = data.charCodeAt(i++);
                    o3 = data.charCodeAt(i++);

                    bits = o1 << 16 | o2 << 8 | o3;

                    h1 = bits >> 18 & 0x3f;
                    h2 = bits >> 12 & 0x3f;
                    h3 = bits >> 6 & 0x3f;
                    h4 = bits & 0x3f;

                    // use hexets to index into b64, and append result to encoded string
                    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
                } while (i < data.length);

                enc = tmp_arr.join('');

                switch (data.length % 3) {
                    case 1:
                        enc = enc.slice(0, -2) + '==';
                        break;
                    case 2:
                        enc = enc.slice(0, -1) + '=';
                        break;
                }

                return enc;
            }
            return request;
            //UMD FOOTER START
        });
        //UMD FOOTER END
    }, {}], 4: [function (require, module, exports) {
        // shim for using process in browser

        var process = module.exports = {};
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }

        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = setTimeout(cleanUpNextTick);
            draining = true;

            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run();
                    }
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            clearTimeout(timeout);
        }

        process.nextTick = function (fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                setTimeout(drainQueue, 0);
            }
        };

        // v8 likes predictible objects
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }
        Item.prototype.run = function () {
            this.fun.apply(null, this.array);
        };
        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = ''; // empty string to avoid regexp issues
        process.versions = {};

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        };

        process.cwd = function () {
            return '/';
        };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };
        process.umask = function () {
            return 0;
        };
    }, {}], 5: [function (require, module, exports) {
        (function (process) {
            var plugDefs = {
                'jsonget': require('./plugdefs/jsonget'),
                'csvget': require('./plugdefs/csvget'),
                'fieldbook': require('./plugdefs/fieldbook')
            };

            function Dataplugger() {
                this.defaultPlug = null;
                this.plugs = {};
                this.plugDefs = plugDefs;
            }

            Dataplugger.prototype = {
                addPlug: function addPlug(id, data) {
                    this.plugs[id] = data;
                },

                listPlugDefs: function listPlugDefs() {
                    return Object.keys(this.plugDefs);
                },

                loadData: function loadData(plugidOrCallback, iCallback) {
                    var plugId, callback;

                    // One argument
                    if (!callback && !this.defaultPlug) {
                        throw new Error("No default plug set");
                    }

                    if (iCallback) {
                        plugId = plugidOrCallback;
                        callback = iCallback;
                    } else {
                        plugId = this.defaultPlug;
                        callback = plugidOrCallback;
                    }

                    if (!this.plugs[plugId]) {
                        throw new Error("Plug " + plugId + " not added");
                    }

                    if (!this.plugDefs[plugId]) {
                        throw new Error("Plug " + plugId + " not available");
                    }

                    var plugConf = this.plugs[plugId];
                    var plugDef = this.plugDefs[plugId];
                    var plug = new plugDef(plugConf);

                    plug.load(callback);
                },

                setDefaultPlug: function setDefaultPlug(id) {
                    if (!this.plugDefs[id]) {
                        throw new Error("Plug does not exist: " + id);
                    }

                    this.defaultPlug = id;
                }
            };

            module.exports = Dataplugger;

            if (process.browser) {
                window.Dataplugger = Dataplugger;
            }
        }).call(this, require('_process'));
    }, { "./plugdefs/csvget": 7, "./plugdefs/fieldbook": 8, "./plugdefs/jsonget": 9, "_process": 4 }], 6: [function (require, module, exports) {
        var request = require('request');

        var http = {
            get: function get(url, callback) {
                request(url, function (err, res, body) {
                    if (err || res.statusCode !== 200) {
                        throw err;
                    }

                    callback(body);
                });
            },

            getJson: function getJson(url, callback) {
                http.get(url, function (body) {
                    var data = JSON.parse(body);
                    callback(data);
                });
            }
        };

        module.exports = http;
    }, { "request": 3 }], 7: [function (require, module, exports) {
        var http = require('../http');
        var Baby = require('babyparse');

        function Csvget(conf) {
            this.conf = conf;
        }

        Csvget.prototype = {
            load: function load(callback) {
                http.get(this.conf.url, function (body) {
                    var data = Baby.parse(body, {
                        header: true,
                        skipEmptyLines: true
                    });

                    callback(data.data);
                });
            }
        };

        module.exports = Csvget;
    }, { "../http": 6, "babyparse": 2 }], 8: [function (require, module, exports) {
        var http = require('../http');
        var async = require('async');

        var FIELDBOOK_ENDPOINT = 'https://api.fieldbook.com/v1/';

        function Fieldbook(conf) {
            this.conf = conf;
        }

        Fieldbook.prototype = {
            load: function load(callback) {
                var bookUrl = FIELDBOOK_ENDPOINT + this.conf.book;

                function getSheet(sheet, cb) {
                    var url = bookUrl + '/' + sheet;

                    http.getJson(url, function (data) {
                        cb(null, {
                            sheet: sheet,
                            data: data
                        });
                    });
                }

                http.getJson(bookUrl, function (sheets) {
                    async.map(sheets, getSheet, function (err, results) {
                        var book = {};

                        results.forEach(function (sheet) {
                            book[sheet.sheet] = sheet.data;
                        });

                        callback(book);
                    });
                });
            }
        };

        module.exports = Fieldbook;
    }, { "../http": 6, "async": 1 }], 9: [function (require, module, exports) {
        var http = require('../http');

        function Jsonget(conf) {
            this.conf = conf;
        }

        Jsonget.prototype = {
            load: function load(callback) {
                http.getJson(this.conf.url, callback);
            }
        };

        module.exports = Jsonget;
    }, { "../http": 6 }] }, {}, [5]);
