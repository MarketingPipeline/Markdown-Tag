/**
 * Markdown Tag Web Component Debug Script
 * By: DarkenLM
 */

function mdt_wc_debug_init() {
	function makeInspect() {
		/**
		 * Echos the value of a value. Trys to print the value out
		 * in the best way possible given the different types.
		 *
		 * @param {Object} obj The object to print out.
		 * @param {Object} opts Optional options object that alters the output.
		 * @license MIT (© Joyent)
		 */
		/* legacy: obj, showHidden, depth, colors*/

		function inspect(obj, opts) {
			// default options
			var ctx = {
				seen: [],
				stylize: stylizeNoColor
			};
			// legacy...
			if (arguments.length >= 3) ctx.depth = arguments[2];
			if (arguments.length >= 4) ctx.colors = arguments[3];
			if (isBoolean(opts)) {
				// legacy...
				ctx.showHidden = opts;
			} else if (opts) {
				// got an "options" object
				_extend(ctx, opts);
			}
			// set default options
			if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
			if (isUndefined(ctx.depth)) ctx.depth = 2;
			if (isUndefined(ctx.colors)) ctx.colors = false;
			if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
			if (ctx.colors) ctx.stylize = stylizeWithColor;
			return formatValue(ctx, obj, ctx.depth);
		}

		// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
		inspect.colors = {
			'bold': [1, 22],
			'italic': [3, 23],
			'underline': [4, 24],
			'inverse': [7, 27],
			'white': [37, 39],
			'grey': [90, 39],
			'black': [30, 39],
			'blue': [34, 39],
			'cyan': [36, 39],
			'green': [32, 39],
			'magenta': [35, 39],
			'red': [31, 39],
			'yellow': [33, 39]
		};

		// Don't use 'blue' not visible on cmd.exe
		inspect.styles = {
			'special': 'cyan',
			'number': 'yellow',
			'boolean': 'yellow',
			'undefined': 'grey',
			'null': 'bold',
			'string': 'green',
			'date': 'magenta',
			// "name": intentionally not styling
			'regexp': 'red'
		};

		function stylizeNoColor(str, styleType) {
			return str;
		}

		function isBoolean(arg) {
			return typeof arg === 'boolean';
		}

		function isUndefined(arg) {
			return arg === void 0;
		}

		function stylizeWithColor(str, styleType) {
			var style = inspect.styles[styleType];

			if (style) {
				return '\u001b[' + inspect.colors[style][0] + 'm' + str +
					'\u001b[' + inspect.colors[style][1] + 'm';
			} else {
				return str;
			}
		}

		function isFunction(arg) {
			return typeof arg === 'function';
		}

		function isString(arg) {
			return typeof arg === 'string';
		}

		function isNumber(arg) {
			return typeof arg === 'number';
		}

		function isNull(arg) {
			return arg === null;
		}

		function hasOwn(obj, prop) {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		}

		function isRegExp(re) {
			return isObject(re) && objectToString(re) === '[object RegExp]';
		}

		function isObject(arg) {
			return typeof arg === 'object' && arg !== null;
		}

		function isError(e) {
			return isObject(e) &&
				(objectToString(e) === '[object Error]' || e instanceof Error);
		}

		function isDate(d) {
			return isObject(d) && objectToString(d) === '[object Date]';
		}

		function objectToString(o) {
			return Object.prototype.toString.call(o);
		}

		function arrayToHash(array) {
			var hash = {};

			array.forEach(function (val, idx) {
				hash[val] = true;
			});

			return hash;
		}

		function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
			var output = [];
			for (var i = 0, l = value.length; i < l; ++i) {
				if (hasOwn(value, String(i))) {
					output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
						String(i), true));
				} else {
					output.push('');
				}
			}
			keys.forEach(function (key) {
				if (!key.match(/^\d+$/)) {
					output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
						key, true));
				}
			});
			return output;
		}

		function formatError(value) {
			return '[' + Error.prototype.toString.call(value) + ']';
		}

		function formatValue(ctx, value, recurseTimes) {
			// Provide a hook for user-specified inspect functions.
			// Check that value is an object with an inspect function on it
			if (ctx.customInspect &&
				value &&
				isFunction(value.inspect) &&
				// Filter out the util module, it's inspect function is special
				value.inspect !== inspect &&
				// Also filter out any prototype objects using the circular check.
				!(value.constructor && value.constructor.prototype === value)) {
				var ret = value.inspect(recurseTimes, ctx);
				if (!isString(ret)) {
					ret = formatValue(ctx, ret, recurseTimes);
				}
				return ret;
			}

			// Primitive types cannot have properties
			var primitive = formatPrimitive(ctx, value);
			if (primitive) {
				return primitive;
			}

			// Look up the keys of the object.
			var keys = Object.keys(value);
			var visibleKeys = arrayToHash(keys);

			try {
				if (ctx.showHidden && Object.getOwnPropertyNames) {
					keys = Object.getOwnPropertyNames(value);
				}
			} catch (e) {
				// ignore
			}

			// IE doesn't make error fields non-enumerable
			// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
			if (isError(value) &&
				(keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
				return formatError(value);
			}

			// Some type of object without properties can be shortcutted.
			if (keys.length === 0) {
				if (isFunction(value)) {
					var name = value.name ? ': ' + value.name : '';
					return ctx.stylize('[Function' + name + ']', 'special');
				}
				if (isRegExp(value)) {
					return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
				}
				if (isDate(value)) {
					return ctx.stylize(Date.prototype.toString.call(value), 'date');
				}
				if (isError(value)) {
					return formatError(value);
				}
			}

			var base = '',
				array = false,
				braces = ['{', '}'];

			// Make Array say that they are Array
			if (Array.isArray(value)) {
				array = true;
				braces = ['[', ']'];
			}

			// Make functions say that they are functions
			if (isFunction(value)) {
				var n = value.name ? ': ' + value.name : '';
				base = ' [Function' + n + ']';
			}

			// Make RegExps say that they are RegExps
			if (isRegExp(value)) {
				base = ' ' + RegExp.prototype.toString.call(value);
			}

			// Make dates with properties first say the date
			if (isDate(value)) {
				base = ' ' + Date.prototype.toUTCString.call(value);
			}

			// Make error with message first say the error
			if (isError(value)) {
				base = ' ' + formatError(value);
			}

			if (keys.length === 0 && (!array || value.length == 0)) {
				return braces[0] + base + braces[1];
			}

			if (recurseTimes < 0) {
				if (isRegExp(value)) {
					return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
				} else {
					return ctx.stylize('[Object]', 'special');
				}
			}

			ctx.seen.push(value);

			var output;
			if (array) {
				output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
			} else {
				output = keys.map(function (key) {
					return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
				});
			}

			ctx.seen.pop();

			return reduceToSingleString(output, base, braces);
		}

		function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
			var name, str, desc;
			desc = {
				value: void 0
			};
			try {
				// ie6 › navigator.toString
				// throws Error: Object doesn't support this property or method
				desc.value = value[key];
			} catch (e) {
				// ignore
			}
			try {
				// ie10 › Object.getOwnPropertyDescriptor(window.location, 'hash')
				// throws TypeError: Object doesn't support this action
				if (Object.getOwnPropertyDescriptor) {
					desc = Object.getOwnPropertyDescriptor(value, key) || desc;
				}
			} catch (e) {
				// ignore
			}
			if (desc.get) {
				if (desc.set) {
					str = ctx.stylize('[Getter/Setter]', 'special');
				} else {
					str = ctx.stylize('[Getter]', 'special');
				}
			} else {
				if (desc.set) {
					str = ctx.stylize('[Setter]', 'special');
				}
			}
			if (!hasOwn(visibleKeys, key)) {
				name = '[' + key + ']';
			}
			if (!str) {
				if (ctx.seen.indexOf(desc.value) < 0) {
					if (isNull(recurseTimes)) {
						str = formatValue(ctx, desc.value, null);
					} else {
						str = formatValue(ctx, desc.value, recurseTimes - 1);
					}
					if (str.indexOf('\n') > -1) {
						if (array) {
							str = str.split('\n').map(function (line) {
								return '  ' + line;
							}).join('\n').substr(2);
						} else {
							str = '\n' + str.split('\n').map(function (line) {
								return '   ' + line;
							}).join('\n');
						}
					}
				} else {
					str = ctx.stylize('[Circular]', 'special');
				}
			}
			if (isUndefined(name)) {
				if (array && key.match(/^\d+$/)) {
					return str;
				}
				name = JSON.stringify('' + key);
				if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
					name = name.substr(1, name.length - 2);
					name = ctx.stylize(name, 'name');
				} else {
					name = name.replace(/'/g, "\\'")
						.replace(/\\"/g, '"')
						.replace(/(^"|"$)/g, "'");
					name = ctx.stylize(name, 'string');
				}
			}

			return name + ': ' + str;
		}

		function formatPrimitive(ctx, value) {
			if (isUndefined(value))
				return ctx.stylize('undefined', 'undefined');
			if (isString(value)) {
				var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
					.replace(/'/g, "\\'")
					.replace(/\\"/g, '"') + '\'';
				return ctx.stylize(simple, 'string');
			}
			if (isNumber(value))
				return ctx.stylize('' + value, 'number');
			if (isBoolean(value))
				return ctx.stylize('' + value, 'boolean');
			// For some reason typeof null is "object", so special case here.
			if (isNull(value))
				return ctx.stylize('null', 'null');
		}

		function reduceToSingleString(output, base, braces) {
			var numLinesEst = 0;
			var length = output.reduce(function (prev, cur) {
				numLinesEst++;
				if (cur.indexOf('\n') >= 0) numLinesEst++;
				return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
			}, 0);

			if (length > 60) {
				return braces[0] +
					(base === '' ? '' : base + '\n ') +
					' ' +
					output.join(',\n  ') +
					' ' +
					braces[1];
			}

			return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
		}

		function _extend(origin, add) {
			// Don't do anything if add isn't an object
			if (!add || !isObject(add)) return origin;

			var keys = Object.keys(add);
			var i = keys.length;
			while (i--) {
				origin[keys[i]] = add[keys[i]];
			}
			return origin;
		}

		return { inspect }
	}

	const { inspect } = makeInspect()

	class MDTagDebugger {
		constructor(overrides) {
			this.componentID = null
			this.logRegister = []
			const colorify = {
				byNum: (mess, fgNum, bgNum) => {
					mess = mess || '';
					fgNum = fgNum === undefined ? 31 : fgNum;
					bgNum = bgNum === undefined ? 1 : bgNum; //47
					return '\u001b[' + fgNum + 'm' + '\u001b[' + bgNum + 'm' + mess + '\u001b[0m'//'\u001b[39m\u001b[49m';
				},
				black: (mess, fgNum) => colorify.byNum(mess, 30, fgNum),
				red: (mess, fgNum) => colorify.byNum(mess, 31, fgNum),
				green: (mess, fgNum) => colorify.byNum(mess, 32, fgNum),
				yellow: (mess, fgNum) => colorify.byNum(mess, 33, fgNum),
				blue: (mess, fgNum) => colorify.byNum(mess, 34, fgNum),
				magenta: (mess, fgNum) => colorify.byNum(mess, 35, fgNum),
				cyan: (mess, fgNum) => colorify.byNum(mess, 36, fgNum),
				white: (mess, fgNum) => colorify.byNum(mess, 37, fgNum)
			};

			this.colorify = colorify
			this.overrides = overrides
		}

		static get version() {
			return "1.0.0"
		}

		log(...args) {
			if (!this.logRegister || !Array.isArray(this.logRegister)) this.logRegister = []

			const ind = this.logRegister.push({ timestamp: Date.now(), args })
			if (this.overrides?.logger) this.overrides?.logger.apply(this, ["[MDTag Debugger]", ...args])
			else console.log.bind(console).apply(this, ["[MDTag Debugger]", ...args])
			
			return ind;
		}

		inspect(logIndex, options, strict) {
			if (this.logRegister) {
				const log = this.logRegister[logIndex]
				if (typeof(log) == undefined) {
					if (strict) throw new Error(`[MDTag Debugger] Could not inspect log: No log found at index ${logIndex}.`)
					else return false;
				} else {
					const inspected = inspect(log, options)
					return inspected
				}
			} else {
				if (strict) throw new Error("[MDTag Debugger] Could not inspect log: No logs found.")
				else return false;
			}
		}

		getLogs() {
			const json = JSON.stringify(this.logRegister, (key, value) => {
				return inspect(value)
			})

			return json
			//this.copyTextToClipboard(json)
		}

		_fallbackCopyTextToClipboard(text, debug) {
			const textArea = document.createElement("textarea");
			textArea.value = text;
		
			// Avoid scrolling to bottom
			textArea.style.top = "0";
			textArea.style.left = "0";
			textArea.style.position = "fixed";
		
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
		
			try {
				const successful = document.execCommand('copy');
				const msg = successful ? 'successful' : 'unsuccessful';
				if (debug) console.log('Fallback: Copying text command was ' + msg);
			} catch (err) {
				if (debug) console.error('Fallback: Oops, unable to copy', err);
			}
		
			document.body.removeChild(textArea);
		}
		
		copyTextToClipboard(text, debug) {
			if (!navigator.clipboard) {
				_fallbackCopyTextToClipboard(text);
				return;
			}
			navigator.clipboard.writeText(text).then(function () {
				if (debug) console.log('Copying to clipboard was successful!');
			}, function (err) {
				if (debug) console.error('Could not copy text: ', err);
			});
		}
	}

	if (!window.mdtag) window.mdtag = {}
	if (!window.mdtag.webcomponent) window.mdtag.webcomponent = {}
	if (!window.mdtag.webcomponent.debugger) window.mdtag.webcomponent.debugger = MDTagDebugger
}

mdt_wc_debug_init()