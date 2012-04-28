define(function(){

	/**
	 * Convert an Array-like object (like an arguments object) to Array
	 * @param {*} arrLike Sufficiently Array-like object
	 * @param {number=} begin Zero-based index at which to begin extraction
	 * @param {number=} end Zero-based index at which to end extraction (exclusive)
	 * @return {Array}
	 */
	function toArray(arrLike, begin, end) {
		return Array.prototype.slice.call(arrLike, begin, end);
	}

	/**
	 * Concatenate an array of arrays
	 * @param {Array} arr Array to concat
	 * @return {Array}
	 */
	function concat(arr) {
		return foldl(function(a, b) { return a.concat(b); }, [], arr);
	}

	/**
	 * Merge multiple objects
	 * @param {...Object} objects Variable number of objects to merge
	 *	from left to right
	 * @return {Object}
	 */
	function merge(/*obj1, obj2, ...*/) {
		var objects = toArray(arguments),
			target = objects.shift();
		objects.forEach(function(obj) {
			Object.keys(obj).forEach(function(k) {
				target[k] = obj[k];
			});
		});
		return target;
	}

	/**
	 * Internal function used to implement `throttle` and `debounce`.
	 * @param {function(...):*} func
	 * @param {integer} wait
	 * @param {boolean} debounce
	 * @return {function(...):*}
	 */
	function limit(func, wait, debounce) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var throttler = function() {
				timeout = null;
				func.apply(context, args);
			};
			if (debounce) clearTimeout(timeout);
			if (debounce || !timeout) timeout = setTimeout(throttler, wait);
		};
	}

	/**
	 * Returns a function, that, when invoked, will only be triggered at most once
	 * during a given window of time.
	 * @param {function(...):*} func
	 * @param {integer} wait
	 * @return {function(...):*}
	 */
	function throttle(func, wait) {
		return limit(func, wait, false);
	}

	/**
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds.
	 * @param {function(...):*} func
	 * @param {integer} wait
	 * @return {function(...):*}
	 */
	function debounce(func, wait) {
		return limit(func, wait, true);
	}

	/** 
	 * Returns a function that will be executed at most one time, no matter how
	 * often you call it. Useful for lazy initialization.
	 * @param {function(...):*} func
	 * @return {function(...):*}
	 */
	function once(func) {
		var ran = false, memo;
		return function() {
			if (ran) return memo;
			ran = true;
			return memo = func.apply(this, arguments);
		};
	}

	/** 
	 * Returns a function that will only be executed after being called an
	 * specific number of times. Useful for lazy initialization when only the
	 * last call should apply.
	 * @param Number count - exact number of times the fucntion will need to be called before executed
	 * @param {function(...):*} func
	 * @param Array args - function arguments
	 * @param Number delay - delay to call the function, in milliseconds
	 * @param Object context - "this" value
	 * @return {function(...):*}
	 */
	function trigger(count, func, args, context) {
		if( typeof func === 'function' ){
			if(!args) args = [];
			else if (args.constructor.toString().indexOf("Array") == -1) args = [];
			var index = 0;
			return function() {
				index++;
				if (index == count) func.apply(context || window, args);
			};
		}
	}

	/** 
	 * Calls a function asynchronously, with optional delay and scope.
	 * @param {function(...):*} func
	 * @param Array args - function arguments
	 * @param Number delay - delay to call the function, in milliseconds
	 * @param Object context - "this" value
	 * @return null
	 */
	function async(func, args, delay, context) {
		if( typeof func === 'function' ){
			if (args.constructor.toString().indexOf("Array") == -1) args = [];
			delay = delay || 0;
			context = context || window;
			var execute = function(){
				func.apply(context, args);
			}
			return setTimeout(execute, delay);		
		}
	}

	/** 
	 * Construct an object.
	 * @param function(...) C - Object constructor definition
	 * @param Array a - constructor arguments
	 * @return Pointer to the newly created object
	 */
	function construct(C, a) {
		switch (a.length) {
			case 0: return new C(); break;
			case 1: return new C(a[0]); break;
			case 2: return new C(a[0], a[1]); break;
			case 3: return new C(a[0], a[1], a[2]); break;
			case 4: return new C(a[0], a[1], a[2], a[3]); break;
			case 5: return new C(a[0], a[1], a[2], a[3], a[4]); break;
			case 6: return new C(a[0], a[1], a[2], a[3], a[4], a[5]); break;
			case 7: return new C(a[0], a[1], a[2], a[3], a[4], a[5], a[6]); break;
			case 8: return new C(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); break;
			case 9: return new C(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]); break;
			case 10: return new C(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]); break;
			case 11: return new C(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10]); break;
			case 12: return new C(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11]); break;
		}
	}

	return {
		concat: concat,
		merge: merge,
		toArray: toArray,
		throttle: throttle,
		debounce: debounce,
		once: once,
		trigger: trigger,
		async: async,
		construct : construct
	}
});