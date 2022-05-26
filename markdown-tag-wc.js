/*! (c) Andrea Giammarchi (https://github.com/WebReflection/html-parsed-element) - ISC */
const HTMLParsedElement = (() => {
	const DCL = 'DOMContentLoaded';
	const init = new WeakMap;
	const queue = [];
	const isParsed = el => {
		do {
			if (el.nextSibling)
				return true;
		} while (el = el.parentNode);
		return false;
	};
	const upgrade = () => {
		queue.splice(0).forEach(info => {
			if (init.get(info[0]) !== true) {
				init.set(info[0], true);
				info[0][info[1]]();
			}
		});
	};
	document.addEventListener(DCL, upgrade);
	class HTMLParsedElement extends HTMLElement {//HTMLTextAreaElement
		static withParsedCallback(Class, name = 'parsed') {
			const {
				prototype
			} = Class;
			const {
				connectedCallback
			} = prototype;
			const method = name + 'Callback';
			const cleanUp = (el, observer, ownerDocument, onDCL) => {
				observer.disconnect();
				ownerDocument.removeEventListener(DCL, onDCL);
				parsedCallback(el);
			};
			const parsedCallback = el => {
				if (!queue.length)
					requestAnimationFrame(upgrade);
				queue.push([el, method]);
			};
			Object.defineProperties(
				prototype, {
					connectedCallback: {
						configurable: true,
						writable: true,
						value() {
							if (connectedCallback)
								connectedCallback.apply(this, arguments);
							if (method in this && !init.has(this)) {
								const self = this;
								const {
									ownerDocument
								} = self;
								init.set(self, false);
								if (ownerDocument.readyState === 'complete' || isParsed(self))
									parsedCallback(self);
								else {
									const onDCL = () => cleanUp(self, observer, ownerDocument, onDCL);
									ownerDocument.addEventListener(DCL, onDCL);
									const observer = new MutationObserver(() => {
										/* istanbul ignore else */
										if (isParsed(self))
											cleanUp(self, observer, ownerDocument, onDCL);
									});
									observer.observe(self.parentNode, {
										childList: true,
										subtree: true
									});
								}
							}
						}
					},
					[name]: {
						configurable: true,
						get() {
							return init.get(this) === true;
						}
					}
				}
			);
			return Class;
		}
	}
	return HTMLParsedElement.withParsedCallback(HTMLParsedElement);
})();

// function interseptElementProperty(object, property, callback, delay = 0) {
//     let ownObjectProto = Object.getPrototypeOf(object);
//     if (!object[property]) {
//         console.error(property + " is not a property of " + object.toString());
//         return;
//     }

//     while (!Object.getOwnPropertyDescriptor(ownObjectProto, property)) {
//         ownObjectProto = Object.getPrototypeOf(ownObjectProto);
//     }

//     const ownProperty = Object.getOwnPropertyDescriptor(ownObjectProto, property);
//     Object.defineProperty(object, property, {
//         get: function () {
//             console.log('access gettter');
//             return ownProperty.get.call(this);
//         },
//         set: function (val) {
// 			if (typeof callback == "function") {
// 				setTimeout(callback.bind(this, oldValue, newValue), delay);
// 			}
//             return ownProperty.set.call(this, val);
//         }
//     })
// }


// function observeElement(element, property, callback, delay = 0) {
//     let elementPrototype = Object.getPrototypeOf(element);
//     if (elementPrototype.hasOwnProperty(property)) {
//         let descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property);
//         Object.defineProperty(element, property, {
//             get: function() {
//                 return descriptor.get.apply(this, arguments);
//             },
//             set: function () {
//                 let oldValue = this[property];
//                 descriptor.set.apply(this, arguments);
//                 let newValue = this[property];
//                 if (typeof callback == "function") {
//                     setTimeout(callback.bind(this, oldValue, newValue), delay);
//                 }
//                 return newValue;
//             }
//         });
//     }
// }

/**
 * Markdown Tag Web Component Script
 * By: DarkenLM
 */

function mdt_wc_init() {
	class MDTag extends HTMLParsedElement {// ClassMixin(HTMLTextAreaElement, HTMLParsedElement) WIP: Extend BuiltIn Element to prevent script injection
		#componentID
		constructor() {
			super();
			this.#componentID = `MDTAG-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
			//this.componentID = `${Date.now()}${Math.floor(Math.random() * 999) + 1}`
			this.generated = false
			this.defaultFlavor = "showdown"
			this.defaultParserRoot = "./"
			this.flavors = [
				"commonmark",
				"github",
				"marked",
				"showdown"
			]

			this.logRegister = []
			this.debugger = null

			this.shadow = this.attachShadow({mode: 'open'});
			this.headID = `md-tag-head-${Date.now()}${Math.floor(Math.random() * 999) + 1}`

			const shadowHead = document.createElement("head")
			shadowHead.id = this.headID
			this.shadow.appendChild(shadowHead)
			this.contentObserver = null
		}

		get componentID() {
			return this.#componentID
		}

		static get version() {
			return "1.0.0"
		}

		get shouldDebug() {
			const attr = this.getAttribute("debug")
			return this.hasAttribute("debug") 
				? (typeof(attr) === "boolean" || typeof(attr) === "string" && ["true", "false", true, false].includes(attr))
					? (attr == "true")
					: false
				: false;
		}

		set shouldDebug(val) {
			if (val && typeof(val) === "string" || typeof(val) === "boolean") {
				if (typeof(val) === "boolean" || typeof(val) === "string" && ["true", "false", true, false].includes(val)) {
					if (window?.mdtag?.webcomponent?.hasOwnProperty("debugger")) {
						this._initDebugger()
						// if (this.debugger) {
						// 	if (!(this.debugger instanceof window.mdtag.webcomponent.debugger)) this.debugger = new window.mdtag.webcomponent.debugger()
						// } else this.debugger = new window.mdtag.webcomponent.debugger()

						this.setAttribute("debug", val);
						if (this.shouldDebug === true) this.debug("DEBUG Environment enabled.")
					} else throw new Error(`[${this.componentID}] Could not initialize debug: MarkdownTag Debugger not installed.`)
				} else this.setAttribute("debug", false);
			} else this.setAttribute("debug", false);
		}

		get flavor() {
			return this.hasAttribute("flavor") ? this.flavors.includes(this.getAttribute("flavor")) ? this.getAttribute("flavor") : this.defaultFlavor: this.defaultFlavor;
		}

		set flavor(val) {
			if (val && typeof(val) === "string") {
				if (this.flavors.includes(val)) {
					this.setAttribute("flavor", val);
				} else this.setAttribute("flavor", this.defaultFlavor);
			} else this.setAttribute("flavor", this.defaultFlavor);
		}

		get input() {
			const contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			if (contentDiv) {
				return contentDiv.innerHTML
			}
		}

		set input(val) {
			const contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			if (contentDiv) {
				contentDiv.innerHTML = val
				this.generateMarkdown()
				return;
			}
		}

		get parserRoot() {
			return this.hasAttribute("parser_root") ? this.getAttribute("parser_root") : this.defaultParserRoot;
		}

		set parserRoot(val) {
			if (val && typeof(val) === "string") {
				this.setAttribute("parser_root", val);
			} else this.setAttribute("parser_root", this.defaultParserRoot)
		}

		setInput(val) {
			const contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			if (contentDiv) {
				contentDiv.innerHTML = val
				this.generateMarkdown()
				return;
			}
		}

		debug(...args) {
			if (this.shouldDebug === true) {
				if (window.mdtag?.webcomponent?.hasOwnProperty("debugger")) {
					this._initDebugger()
					this.debugger.log(`[${this.componentID}]`, ...args)
				} else throw new Error(`[${this.componentID}] Could not log debug message: MarkdownTag Debugger not installed.`)
				// if (!this.logRegister || !Array.isArray(this.logRegister)) this.logRegister = []
				// this.logRegister.push({ timestamp: Date.now(), args })
				// console.log.bind(console).apply(this, args)
			}
		}

		getLogs(clipboard) {
			if (this.shouldDebug === true) {
				if (window.mdtag?.webcomponent?.hasOwnProperty("debugger")) {
					this._initDebugger()

					const logs = this.debugger.getLogs()
					if (clipboard) {
						console.log("Click anywhere outside of the Devtools within 3 seconds...")
						setTimeout(() => this.debugger.copyTextToClipboard(logs), 3000)
					}
					else return logs
				} else throw new Error(`[${this.componentID}] Could not get loggers: MarkdownTag Debugger not installed.`)
			}
		}

		addCss(url) {
			this.debug("[EVENT_METHOD] [HEAD] [aC] addCss")
			this.debug("[EVENT_METHOD] [APPLY] [aC] Querying Shadow DOM head...")
			const head = this.shadow.querySelector(`#${this.headID}`)

			this.debug("[EVENT_METHOD] [APPLY] [aC] Creating LINK element...")
			const link = document.createElement("link");
			link.id = `md-style-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = url;
			
			this.debug("[EVENT_METHOD] [APPLY] [aC] Appending LINK element to Shadow DOM head...")
			head.appendChild(link);
			this.debug("[EVENT_METHOD] [APPLY] [aC] Finished")
		}

		assertStyleSheet(url) {
			this.debug("[EVENT_METHOD] [HEAD] [aSS] assertStyleSheet")
			const ss = this.shadow.styleSheets
			for (let i = 0, max = ss.length; i < max; i++) {
				if (ss[i].href === url) {
					this.debug("[EVENT_METHOD] [APPLY] [aSS] Finished")
					return true;
				}
			}

			this.debug("[EVENT_METHOD] [APPLY] [aSS] Finished")
			return false
		}

		async doesFileExist(url) {
			this.debug("[EVENT_METHOD] [HEAD] [dFE] doesFileExist")
			return new Promise(async (resolve, reject) => {
				if (!url) {
					this.debug("[EVENT_METHOD] [APPLY] [dFE] File path not provided. Skipping...")
					this.debug("[EVENT_METHOD] [APPLY] [dFE] Finished")
					return resolve(false);
				}

				try {
					this.debug("[EVENT_METHOD] [APPLY] [dFE] Asserting file path validity...")
					const absPath = new URL(url, window.location.href)
					
					this.debug("[EVENT_METHOD] [APPLY] [dFE] File path is valid. Contacting server for file...")
					const res = await fetch(absPath, { method: "HEAD", mode: "no-cors" }).catch(e => {
						this.debug("[EVENT_METHOD] [APPLY] [dFE] Finished")
						resolve(false)
					})
					// .then((response) => {
					// 	const contenttype = response.headers.get("content-type");
					// 	console.log("Content Type (FETCH): ", contenttype);
					// })
					
					this.debug("[EVENT_METHOD] [APPLY] [dFE] Server responded. Resolving.")
					if (res) return resolve(res?.status !== 200)
					this.debug("[EVENT_METHOD] [APPLY] [dFE] Finished")
				} catch(e) {
					this.debug("[EVENT_METHOD] [APPLY] [dFE] Could not ensure file existence:", e)
					this.debug("[EVENT_METHOD] [APPLY] [dFE] Finished")
					resolve(false)
				}
			})
		}

		async addJs(url) {
			this.debug("[EVENT_METHOD] [HEAD] [aJ] addJs")
			return new Promise(async (resolve, reject) => {
				try {
					this.debug("[EVENT_METHOD] [APPLY] [aJ] Asserting file existence...")
					const doesFileExist = await this.doesFileExist(url)
					if (!doesFileExist) {
						this.debug("[EVENT_METHOD] [APPLY] [aJ] File does not exist. Skipping.")
						this.debug("[EVENT_METHOD] [APPLY] [aJ] Finished")
						return;
					}//throw new Error("Does not exist")

					this.debug("[EVENT_METHOD] [APPLY] [aJ] Generating Script Tag...")
					const head = document.head;
					const script = document.createElement("script");
					
					script.id = `md-script-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
					script.type = "text/javascript";
					script.src = url;

					script.addEventListener("load", () => {
						this.debug("[EVENT_METHOD] [APPLY] [aJ] Script successfully loaded.")
						this.debug("[EVENT_METHOD] [APPLY] [aJ] Finished")
						resolve(true)
					})
				
					this.debug("[EVENT_METHOD] [APPLY] [aJ] Appending script to Document's head...")
					head.appendChild(script);
				} catch(e) {
					this.debug("[EVENT_METHOD] [APPLY] [aJ] Could not add Script:", e)
					this.debug("[EVENT_METHOD] [APPLY] [aJ] Finished")
					reject(e)
				}
			})
		}

		removeScriptTagWithURL(url) {
			this.debug("[EVENT_METHOD] [HEAD] [rSTWU] removeScriptTagWithURL")
			this.debug("[EVENT_METHOD] [APPLY] [rSTWU] Querying script reference...")

			const head = document.head;
			const script = document.querySelector(`script[src="${url}"]`)

			if (script) {
				this.debug("[EVENT_METHOD] [APPLY] [rSTWU] Script reference queried. Removing script...")
				head.removeChild(script)
				this.debug("[EVENT_METHOD] [APPLY] [rSTWU] Finished")
				return true
			} else {
				this.debug("[EVENT_METHOD] [APPLY] [rSTWU] Could not get script reference.")
				this.debug("[EVENT_METHOD] [APPLY] [rSTWU] Finished")
				return false
			}
		}

		async ensureMarkdownParser(parser) {
			this.debug("[EVENT_METHOD] [APPLY] [eMP] ensureMarkdownParser with arguments", [...arguments])
			if (this.shouldDebug && !parser) this.debug("[EVENT_METHOD] [APPLY] [eMP] Parser not provided. Skipping.")

			if (parser) {
				switch (parser) {
					case "showdown": {
						this.debug("[EVENT_METHOD] [APPLY] [eMP] Asserting parser 'SHOWDOWN's existence...")
						if (!window.hasOwnProperty("showdown")) {
							this.debug("[EVENT_METHOD] [APPLY] [eMP] 'SHOWDOWN' does not exist.")
							try {
								this.debug("[EVENT_METHOD] [APPLY] [eMP] Attempting to load local copy of 'SHOWDOWN'...")
								await this.addJs(`${this.parserRoot.endsWith("/") ? this.parserRoot.slice(0, -1) : this.parserRoot}/showdown/showdown.min.js`).catch(e => { throw e })
							} catch(e) {
								this.debug("[EVENT_METHOD] [APPLY] [eMP] Local copy of 'SHOWDOWN' does not exist. Attempting to download it from CDN...")
								if (!window.hasOwnProperty("showdown")) {
									await this.addJs("https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js")
								} else {
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
									return true
								}

								if (!window.hasOwnProperty("showdown")) {
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Unable to load markdown parser 'SHOWDOWN':", e)
									console.error(`Unable to load markdown parser 'showdown': ${e}`)
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
									return false
								}
							}
						} else {
							this.debug("[EVENT_METHOD] [APPLY] [eMP] 'SHOWDOWN' already exists.")
							this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
							return true
						}
						break;
					}
					case "commonmark": {
						this.debug("[EVENT_METHOD] [APPLY] [eMP] Asserting parser 'COMMONMARK's existence...")
						if (!window.hasOwnProperty("md")) {
							this.debug("[EVENT_METHOD] [APPLY] [eMP] 'COMMONMARK' does not exist.")
							try {
								this.debug("[EVENT_METHOD] [APPLY] [eMP] Attempting to load local copy of 'COMMONMARK'...")
								await this.addJs(`${this.parserRoot.endsWith("/") ? this.parserRoot.slice(0, -1) : this.parserRoot}/commonmark/markdown-it.min.js`).catch(e => { throw e })
							} catch(e) {
								this.debug("[EVENT_METHOD] [APPLY] [eMP] Local copy of 'COMMONMARK' does not exist. Attempting to download it from CDN...")
								if (!window.hasOwnProperty("md")) {
									await this.addJs("https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js")
								} else {
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
									return true
								}

								if (!window.hasOwnProperty("md")) {
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Unable to load markdown parser 'COMMONMARK':", e)
									console.error(`Unable to load markdown parser "markdown-it": ${e}`)
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
									return false
								}
							}
						} else {
							this.debug("[EVENT_METHOD] [APPLY] [eMP] 'COMMONMARK' already exists.")
							this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
							return true
						}
						break;
					}
					case "marked": {
						this.debug("[EVENT_METHOD] [APPLY] [eMP] Asserting parser 'MARKED's existence...")
						if (!window.hasOwnProperty("marked")) {
							this.debug("[EVENT_METHOD] [APPLY] [eMP] 'MARKED' does not exist.")
							try {
								await this.addJs(`${this.parserRoot.endsWith("/") ? this.parserRoot.slice(0, -1) : this.parserRoot}/marked/marked.min.js`).catch(e => { throw e })
							} catch(e) {
								this.debug("[EVENT_METHOD] [APPLY] [eMP] Local copy of 'MARKED' does not exist. Attempting to download it from CDN...")
								if (!window.hasOwnProperty("marked")) {
									await this.addJs("https://cdn.jsdelivr.net/npm/marked/marked.min.js")
								} else {
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
									return true
								}

								this.debug("[EVENT_METHOD] [APPLY] [eMP] Unable to load markdown parser 'MARKED':", e)

								if (!window.hasOwnProperty("marked")) {
									console.error(`Unable to load markdown parser "marked": ${e}`)
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
									return false
								}
							}
						} else {
							this.debug("[EVENT_METHOD] [APPLY] [eMP] 'MARKED' already exists.")
							this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
							return true
						}
						break;
					}
					case "DOMPurify": {
						this.debug("[EVENT_METHOD] [APPLY] [eMP] Asserting parser 'DOMPurify's existence...")
						if (!window.hasOwnProperty("DOMPurify")) {
							try {
								this.debug("[EVENT_METHOD] [APPLY] [eMP] 'DOMPurify' does not exist.")
								await this.addJs(`${this.parserRoot.endsWith("/") ? this.parserRoot.slice(0, -1) : this.parserRoot}/DOMPurify/purify.min.js`).catch(e => { throw e })
							} catch(e) {
								this.debug("[EVENT_METHOD] [APPLY] [eMP] Local copy of 'DOMPurify' does not exist. Attempting to download it from CDN...")
								if (!window.hasOwnProperty("DOMPurify")) {
									await this.addJs("https://cdn.jsdelivr.net/npm/dompurify@2.3.8/dist/purify.min.js")
								} else {
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
									return true
								}

								this.debug("[EVENT_METHOD] [APPLY] [eMP] Unable to load markdown parser 'DOMPurify':", e)

								if (!window.hasOwnProperty("DOMPurify")) {
									console.error(`Unable to load markdown parser addon "DOMPurify": ${e}`)
									this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
									return false
								}
							}
						} else {
							this.debug("[EVENT_METHOD] [APPLY] [eMP] 'DOMPurify' already exists.")
							this.debug("[EVENT_METHOD] [APPLY] [eMP] Finished")
							return true
						}
						break;
					}
				}
			}
		}

		sanitizeHTML(html) {
			this.debug("[EVENT_METHOD] [HEAD] [sH] sanitizeHTML")

			let sanitized = DOMPurify.sanitize(html)

			this.debug("[EVENT_METHOD] [APPLY] [sH] Finished")

			return sanitized
		}

		async generateMarkdown() {
			this.debug("[EVENT_METHOD] [HEAD] [GM] generateMarkdown")
			const flavor = this.flavor
			let contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			let displayDiv = this.shadow.querySelector("div[md-tag-role='display']")

			if (!contentDiv || !displayDiv) this.generateFields()
			contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			displayDiv = this.shadow.querySelector("div[md-tag-role='display']")

			await this.ensureMarkdownParser("DOMPurify")

			this.debug("[EVENT_METHOD] [APPLY] [GM] Attempting to parse Markdown")
			switch (flavor) {
				case "commonmark": {
					this.debug("[EVENT_METHOD] [APPLY] [GM] Markdown parser: COMMONMARK")
					await this.ensureMarkdownParser("commonmark")

					const sanitizedHTML = this.sanitizeHTML(contentDiv.innerText)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Input prepared:", contentDiv.innerText)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Sanitized HTML:", sanitizedHTML)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Generating markdown...")

					const md = window.markdownit()
					const parsed = md.render(sanitizedHTML)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Generated Markdown:\n", parsed)

					displayDiv.innerHTML = parsed
					this.debug("[EVENT_METHOD] [APPLY] [GM] Finished")
					break;
				}
				case "marked": {
					this.debug("[EVENT_METHOD] [APPLY] [GM] Markdown parser: MARKED")
					await this.ensureMarkdownParser("marked")

					this.debug("[EVENT_METHOD] [APPLY] [GM] Sanitizing input...")

					const sanitizedHTML = this.sanitizeHTML(contentDiv.innerText)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Input prepared:", contentDiv.innerText)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Sanitized HTML:", sanitizedHTML)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Generating markdown...")

            		const parsed = window.marked.parse(sanitizedHTML)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Generated Markdown:\n", parsed)

					displayDiv.innerHTML = parsed
					this.debug("[EVENT_METHOD] [APPLY] [GM] Finished")
					break;
				}
				case "github": {
					this.debug("[EVENT_METHOD] [APPLY] [GM] Markdown parser: SHOWDOWN + GITHUB CSS")
					const css = "https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Elements/stylesheets/github_md.css"
					if (!this.assertStyleSheet(css)) this.addCss(css)
					await this.ensureMarkdownParser("showdown")

					const converter = new window.showdown.Converter()
					converter.setOption('tables', 'on')
					converter.setOption('emoji', 'on')
					converter.setOption('strikethrough', 'on');
					converter.setOption('tasklists', 'true');
					converter.setOption('ghMentions', 'true');
					converter.setOption('simplifiedAutoLink', 'true');

					this.debug("[EVENT_METHOD] [APPLY] [GM] Sanitizing input...")

					const sanitizedHTML = this.sanitizeHTML(contentDiv.innerText)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Input prepared:", contentDiv.innerText)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Sanitized HTML:", sanitizedHTML)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Generating markdown...")

					const parsed = converter.makeHtml(sanitizedHTML)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Applying Github CSS...")
					const githubMDTag = document.createElement("github-md")
					githubMDTag.innerHTML = parsed

					this.debug("[EVENT_METHOD] [APPLY] [GM] Generated Markdown:\n", parsed)

					displayDiv.innerHTML = ""
					displayDiv.appendChild(githubMDTag)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Finished")
					break;
				}
				case "showdown":
				default: {
					this.debug("[EVENT_METHOD] [APPLY] [GM] Markdown parser: SHOWDOWN")
					await this.ensureMarkdownParser("showdown")

					const converter = new window.showdown.Converter()
					converter.setOption('tables', 'on')
					converter.setOption('emoji', 'on')
					converter.setOption('strikethrough', 'on');
					converter.setOption('tasklists', 'true');
					converter.setOption('ghMentions', 'true');
					converter.setOption('simplifiedAutoLink', 'true');

					this.debug("[EVENT_METHOD] [APPLY] [GM] Sanitizing input...")

					const sanitizedHTML = this.sanitizeHTML(contentDiv.innerText)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Input prepared:", contentDiv.innerText)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Sanitized HTML:", sanitizedHTML)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Generating markdown...")

					const parsed = converter.makeHtml(sanitizedHTML)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Generated Markdown:\n", parsed)

					displayDiv.innerHTML = parsed
					this.debug("[EVENT_METHOD] [APPLY] [GM] Finished")
				}
			}
		}

		generateFields() {
			this.debug("[EVENT_METHOD] [HEAD] [GF] generateFields")

			const inputElement = this.querySelector("textarea")
			const _mainContentDiv = this.querySelector("textarea[md-tag-role='input']")
			const _contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			const _displayDiv = this.shadow.querySelector("div[md-tag-role='display']")

			if (_contentDiv && _displayDiv && _mainContentDiv) {
				this.debug("[EVENT_METHOD] [APPLY] [GF] Fields already exist.")
				this.debug("[EVENT_METHOD] [APPLY] [GF] Finished")
				return;
			}

			let mainContentDiv = document.createElement("textarea")
			if (!_mainContentDiv) {
				this.inputElemID = `md-script-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
				mainContentDiv.id = this.inputElemID
				mainContentDiv.setAttribute("md-tag-role", "input")
				mainContentDiv.setAttribute("name", "md-tag-input")
				mainContentDiv.style.display = "none"
				mainContentDiv.innerHTML = this.generated ? "" : inputElement.innerHTML || ""//this.innerHTML
			}

			let contentDiv = document.createElement("div")
			if (!_contentDiv) {
				contentDiv.setAttribute("md-tag-role", "raw")
				contentDiv.style.display = "none"
				contentDiv.innerHTML = mainContentDiv.innerHTML || ""//this.innerHTML
			}
			
			let displayDiv = document.createElement("div")
			if (!_displayDiv) {
				displayDiv.setAttribute("md-tag-role", "display")
				displayDiv.style.display = "block"
			}

			if (!_mainContentDiv) {
				this.innerHTML = ""
				this.appendChild(mainContentDiv)
			}
			if (!_contentDiv) this.shadow.appendChild(contentDiv)
			if (!_displayDiv) this.shadow.appendChild(displayDiv)
			this.debug("[EVENT_METHOD] [APPLY] [GF] Finished")
		}

		// Spec-defined Methods

		parsedCallback() {
			this.debug("[EVENT_METHOD] [HEAD] [PC] parsedCallback")
			this.generateFields()

			// const inputElement = this.querySelector("textarea[md-tag-role='input']")
			// this.contentObserver = new MutationObserver((mutations, observer) => {
			// 	console.log("MUTATED")
			// 	this.input = inputElement.innerHTML//this.innerHTML
			// });

			// console.log(this.innerHTML)
			// console.log(inputElement)

			// this.contentObserver.observe(inputElement, {
			// 	characterData: true,
  			// 	subtree: true
			// });

			this.contentObserver = new MutationObserver((mutations, observer) => {
				this.debug("[EVENT] [HEAD] [CO] contentObserver")
				// Array.from(mutations).forEach(mutation => {
				// 	console.log("MUTATION:", mutation.target.parentElement.id, mutation.target.id, inputElement.id)
				// 	if (mutation.target.id === inputElement.id || mutation.target.parentElement.id === inputElement.id) {
				// 		console.log("INPUT")
				// 		this.input = inputElement.innerHTML
				// 		// Array.from(mutation.addedNodes).forEach(node => {
				// 		// 	console.log("INPUT", node)
				// 		// });
				// 	}
				// });
				const input = this.querySelector("textarea")
				if (!input) this.generateFields()

				this.input = input.innerHTML
				this.debug("[EVENT_METHOD] [APPLY] [CO] Finished")
				//this.input = inputElement.innerHTML//this.innerHTML
			});

			this.contentObserver.observe(this, {
				// attributes: true,
				characterData: true,
				childList: true, 
				subtree: true
			});

			this.generateMarkdown()
			this.generated = true
			this.debug("[EVENT_METHOD] [APPLY] [PC] Finished")
		}

		attributeChangedCallback(attrName, oldVal, newVal) {
			//console.log("attributeChangedCallback CALLED")
			this.debug("[EVENT_METHOD] [HEAD] [aCC] attributeChangedCallback")
			if (!this.generated) return;
			if (oldVal == newVal) return;

			switch (attrName) {
				case "flavor": {
					this.flavor = newVal
					this.generateMarkdown()
					break;
				}
			}

			this.debug("[EVENT_METHOD] [APPLY] [aCC] Finished")
		}

		static get observedAttributes() {
			return [
				"flavor",
				"parser_root"
			];
		}

		// Helpers
		_initDebugger() {
			const init = () => {
				const debug = new window.mdtag.webcomponent.debugger()
				debug.componentID = this.componentID

				this.debugger = debug
			}

			if (this.debugger) {
				if (!(this.debugger instanceof window.mdtag.webcomponent.debugger)) init()
			} else init()
		}
	}

	if (!window.mdtag) window.mdtag = {}
	if (!window.mdtag.webcomponent) window.mdtag.webcomponent = {}
	if (!window.mdtag.webcomponent.MDTag) window.mdtag.webcomponent.MDTag = MDTag
	window.customElements.define("md-tag", MDTag);
}

mdt_wc_init()