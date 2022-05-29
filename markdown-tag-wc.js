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

function mdt_wc_init() {
	const CONSOLE_LOG = window.console.log
	class MDTag extends HTMLParsedElement {
		#componentID
		#input
		constructor() {
			super();
			this.#componentID = `MDTAG-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
			this.#input = null

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

		get debugEnabled() {
			const attr = this.getAttribute("debug")
			return this.hasAttribute("debug") 
				? (typeof(attr) === "boolean" || typeof(attr) === "string" && ["true", "false", true, false].includes(attr))
					? (attr == "true")
					: false
				: false;
		}

		set debugEnabled(val) {
			if (val && typeof(val) === "string" || typeof(val) === "boolean") {
				if (typeof(val) === "boolean" || typeof(val) === "string" && ["true", "false", true, false].includes(val)) {
					this.setAttribute("debug", val);

					if (val == "true") {
						if (window?.mdtag?.webcomponent?.hasOwnProperty("debugger")) {
							this._initDebugger()

							this.debug("DEBUG Environment enabled.")
						} else throw new Error(`[${this.componentID}] Could not initialize debug: MarkdownTag Debugger not installed.`)
					} else {
						this.debugger = null
					}
				} else this.setAttribute("debug", false);
			} else this.setAttribute("debug", false);
		}

		get parserRoot() {
			return this.hasAttribute("parser_root") ? this.getAttribute("parser_root") : this.defaultParserRoot;
		}

		set parserRoot(val) {
			if (val && typeof(val) === "string") {
				this.setAttribute("parser_root", val);
			} else this.setAttribute("parser_root", this.defaultParserRoot)
		}

		get flavor() {
			return this.hasAttribute("flavor") ? this.flavors.includes(this.getAttribute("flavor")) ? this.getAttribute("flavor") : this.defaultFlavor: this.defaultFlavor;
		}

		/**
		 * Sets the flavor of the generator, and regenerates the Markdown based on the currently stored input.
		 *
		 * @param {'showdown' | 'commonmark' | 'marked' | 'DOMPurify'} val The flavor to be used to generate the markdown.
		 * @memberof MDTag
		 */
		async setFlavor(val) {
			this.debug("[EVENT_METHOD] [HEAD] [sF] setFlavor")
			this.debug("[EVENT_METHOD] [APPLY] [sF] Setting flavor...")
			if (val && typeof(val) === "string") {
				if (this.flavors.includes(val)) {
					this.setAttribute("flavor", val);

					this.debug("[EVENT_METHOD] [APPLY] [sF] Ensuring generator fields...")
					this.generateFields()

					this.debug("[EVENT_METHOD] [APPLY] [sF] Generating markdown...")
					await this.generateMarkdown()

					this.debug("[EVENT_METHOD] [APPLY] [sF] Finished")
				} else {
					this.setAttribute("flavor", this.defaultFlavor);
					this.debug("[EVENT_METHOD] [APPLY] [sF] Finished")
				}
			} else {
				this.setAttribute("flavor", this.defaultFlavor);
				this.debug("[EVENT_METHOD] [APPLY] [sF] Finished")
			}
		}
		
		get input() {
			return this.#input
		}

		/**
		 * Sets the input of the generator, and regenerates the Markdown based on the input.
		 *
		 * @param {string} val The Markdown to be used as input for the generator
		 * @memberof MDTag
		 */
		async setInput(val) {
			this.debug("[EVENT_METHOD] [HEAD] [sI] setInput")
			this.debug("[EVENT_METHOD] [APPLY] [sI] Setting input...")
			this.#input = val

			this.debug("[EVENT_METHOD] [APPLY] [sI] Ensuring generator fields...")
			this.generateFields()

			this.debug("[EVENT_METHOD] [APPLY] [sI] Generating markdown...")
			await this.generateMarkdown()

			this.debug("[EVENT_METHOD] [APPLY] [sI] Finished")
		}

		// Markdown-related Methods

		/**
		 * Adds a stylesheet and loads it into the DOM
		 *
		 * @param {string} url The path of the stylesheet to load (url, or file path)
		 * @memberof MDTag
		 */
		addCss(url) {
			this.debug("[EVENT_METHOD] [HEAD] [aC] addCss")
			this.debug("[EVENT_METHOD] [APPLY] [aC] Querying Shadow DOM head...")
			const absPath = this._isPathAbsolute(url) ? url : new URL(url, window.location.href)
			const head = this.shadow.querySelector(`#${this.headID}`)

			this.debug("[EVENT_METHOD] [APPLY] [aC] Creating LINK element...")
			const link = document.createElement("link");
			link.id = `md-style-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = absPath;
			
			this.debug("[EVENT_METHOD] [APPLY] [aC] Appending LINK element to Shadow DOM head...")
			head.appendChild(link);
			this.debug("[EVENT_METHOD] [APPLY] [aC] Finished")
		}

		/**
		 * Asserts it a stylesheet is loaded into the DOM.
		 *
		 * @param {string} url The path of the stylesheet to assert it's existence
		 * @return {boolean} 
		 * @memberof MDTag
		 */
		assertStyleSheet(url) {
			this.debug("[EVENT_METHOD] [HEAD] [aSS] assertStyleSheet")
			const absPath = this._isPathAbsolute(url) ? url : new URL(url, window.location.href)
			const ss = this.shadow.styleSheets

			for (let i = 0, max = ss.length; i < max; i++) {
				if (ss[i].href === absPath) {
					this.debug("[EVENT_METHOD] [APPLY] [aSS] Finished")
					return true;
				}
			}

			this.debug("[EVENT_METHOD] [APPLY] [aSS] Finished")
			return false
		}

		/**
		 * Asserts if file exists at the specified location.
		 *
		 * @param {string} url The path of the file to assert it's existence (url, or file path)
		 * @return {Promise<boolean>} 
		 * @memberof MDTag
		 */
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
					const absPath = this._isPathAbsolute(url) ? url : new URL(url, window.location.href)
					
					this.debug("[EVENT_METHOD] [APPLY] [dFE] File path is valid. Contacting server for file...")
					const res = await fetch(absPath, { method: "HEAD", mode: "no-cors" }).catch(e => {
						this.debug("[EVENT_METHOD] [APPLY] [dFE] Finished")
						resolve(false)
					})
					
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

		/**
		 * Adds a script to the DOM.  
		 * 
		 * **WARNING:** After a script is loaded, it is not possible to unload it, as every variable loaded by
		 * the script will be loaded on the global `window` object.
		 *
		 * @param {string} url The path of the script to load (url, or file path)
		 * @return {Promise<boolean>} 
		 * @memberof MDTag
		 */
		async addJs(url) {
			this.debug("[EVENT_METHOD] [HEAD] [aJ] addJs")
			return new Promise(async (resolve, reject) => {
				try {
					this.debug("[EVENT_METHOD] [APPLY] [aJ] Resolving file path...")
					const absUrl = this._isPathAbsolute(url) ? url : new URL(url, window.location.href)

					this.debug("[EVENT_METHOD] [APPLY] [aJ] Asserting file existence...")
					const doesFileExist = await this.doesFileExist(absUrl)
					if (!doesFileExist) {
						this.debug("[EVENT_METHOD] [APPLY] [aJ] File does not exist. Skipping.")
						this.debug("[EVENT_METHOD] [APPLY] [aJ] Finished")
						return resolve(false);
					}

					this.debug("[EVENT_METHOD] [APPLY] [aJ] Generating Script Tag...")
					const head = document.head;
					const script = document.createElement("script");
					
					script.id = `md-script-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
					script.type = "text/javascript";
					script.src = absUrl;

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

		/**
		 * Ensures the existence of the specified parser, attempting to load a local copy or a remote copy from it's respective CDN.
		 *
		 * @param {'showdown' | 'commonmark' | 'marked' | 'DOMPurify'} parser The parser to ensure it's existence. One of 'showdown', 'commonmark', 'marked', 'DOMPurify'
		 * @return {Promise<boolean>} 
		 * @memberof MDTag
		 */
		async ensureMarkdownParser(parser) {
			this.debug("[EVENT_METHOD] [APPLY] [eMP] ensureMarkdownParser with arguments", [...arguments])
			if (this.debugEnabled && !parser) this.debug("[EVENT_METHOD] [APPLY] [eMP] Parser not provided. Skipping.")

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
			} else return false
		}

		/**
		 * Sanitizes HTML, removing any unsafe and XSS-prone HTML
		 *
		 * @param {string} html A string containing unsafe HMTL
		 * @return {string} A string containing safe HTML
		 * @memberof MDTag
		 */
		sanitizeHTML(html) {
			this.debug("[EVENT_METHOD] [HEAD] [sH] sanitizeHTML")

			let sanitized = DOMPurify.sanitize(html)

			this.debug("[EVENT_METHOD] [APPLY] [sH] Finished")

			return sanitized
		}

		/**
		 * Generates vaild HTML from Markdown Syntax
		 *
		 * @memberof MDTag
		 */
		async generateMarkdown() {
			this.debug("[EVENT_METHOD] [HEAD] [GM] generateMarkdown")
			const flavor = this.flavor
			let input = this.input
			let displayDiv = this.shadow.querySelector("div[md-tag-role='display']")

			if (!input || !displayDiv) {
				this.generateFields()
				input = ""
				displayDiv = this.shadow.querySelector("div[md-tag-role='display']")
			}

			await this.ensureMarkdownParser("DOMPurify")

			this.debug("[EVENT_METHOD] [APPLY] [GM] Attempting to parse Markdown")
			switch (flavor) {
				case "commonmark": {
					this.debug("[EVENT_METHOD] [APPLY] [GM] Markdown parser: COMMONMARK")
					await this.ensureMarkdownParser("commonmark")

					const sanitizedHTML = this.sanitizeHTML(input)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Prepared Input:", input)
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

					const sanitizedHTML = this.sanitizeHTML(input)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Prepared Input:", input)
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

					const sanitizedHTML = this.sanitizeHTML(input)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Prepared Input:", input)
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

					const sanitizedHTML = this.sanitizeHTML(input)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Prepared Input:", input)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Sanitized HTML:", sanitizedHTML)
					this.debug("[EVENT_METHOD] [APPLY] [GM] Generating markdown...")

					const parsed = converter.makeHtml(sanitizedHTML)

					this.debug("[EVENT_METHOD] [APPLY] [GM] Generated Markdown:\n", parsed)

					displayDiv.innerHTML = parsed
					this.debug("[EVENT_METHOD] [APPLY] [GM] Finished")
				}
			}
		}

		/**
		 * Ensures existence of required Shadow DOM Fields
		 *
		 * @memberof MDTag
		 */
		generateFields() {
			this.debug("[EVENT_METHOD] [HEAD] [GF] generateFields")

			const _displayDiv = this.shadow.querySelector("div[md-tag-role='display']")

			if (_displayDiv) {
				this.debug("[EVENT_METHOD] [APPLY] [GF] Fields already exist.")
				this.debug("[EVENT_METHOD] [APPLY] [GF] Finished")
				return;
			}
			
			let displayDiv = document.createElement("div")
			if (!_displayDiv) {
				displayDiv.setAttribute("md-tag-role", "display")
				displayDiv.style.display = "block"
			}

			if (!_displayDiv) this.shadow.appendChild(displayDiv)
			this.debug("[EVENT_METHOD] [APPLY] [GF] Finished")
		}

		// Spec-defined Methods

		/**
		 * Triggered once the element was parsed and loaded on the DOM Tree.
		 *
		 * @memberof MDTag
		 */
		parsedCallback() {
			this.debug("[EVENT_METHOD] [HEAD] [PC] parsedCallback")
			this.generateFields()

			this.contentObserver = new MutationObserver(async (mutations, observer) => {
				this.debug("[EVENT] [HEAD] [CO] contentObserver")
				await this.setInput(this.innerHTML)
				this.debug("[EVENT_METHOD] [APPLY] [CO] Finished")
			});

			this.contentObserver.observe(this, {
				// attributes: true,
				characterData: true,
				childList: true, 
				subtree: true
			});

			this.setInput(this.innerHTML)
			this.generated = true
			this.debug("[EVENT_METHOD] [APPLY] [PC] Finished")
		}

		// attributeChangedCallback(attrName, oldVal, newVal) {
		// 	this.debug("[EVENT_METHOD] [HEAD] [aCC] attributeChangedCallback")
		// 	if (!this.generated) return;
		// 	if (oldVal == newVal) return;

		// 	switch (attrName) {
		// 		case "flavor": {
		// 			this.flavor = newVal
		// 			this.generateMarkdown()
		// 			break;
		// 		}
		// 	}

		// 	this.debug("[EVENT_METHOD] [APPLY] [aCC] Finished")
		// }

		static get observedAttributes() {
			return [
				"flavor",
				"parser_root",
				"debug"
			];
		}

		// DEBUGGER

		/**
		 * Loads the debugger, if it exists.
		 *
		 * @memberof MDTag
		 */
		_initDebugger() {
			if (!window?.mdtag?.webcomponent?.hasOwnProperty("debugger")) return;

			const init = () => {
				const debug = new window.mdtag.webcomponent.debugger()
				debug.componentID = this.componentID

				this.debugger = debug
			}

			if (this.debugger) {
				if (!(this.debugger instanceof window.mdtag.webcomponent.debugger)) init()
			} else init()
		}

		/**
		 * Registers a debug log into the internal debugger, it it exists.
		 *
		 * @param {*} args The data to log
		 * @memberof MDTag
		 */
		debug(...args) {
			if (this.debugEnabled === true) {
				if (window.mdtag?.webcomponent?.hasOwnProperty("debugger")) {
					this._initDebugger()
					this.debugger.log(`[${this.componentID}]`, ...args)
				} else throw new Error(`[${this.componentID}] Could not log debug message: MarkdownTag Debugger not installed.`)
			}
		}

		/**
		 * Gathers, formats, and compiles the logs into a JSON string.
		 *
		 * @param {boolean} clipboard Whenever the logs should be automatically copied to the user's clipboard. If set to `true`, function will return `true`, else function will return a JSON string containing the logs.
		 * @return {string | true} A JSON string containing the registered logs
		 * @memberof MDTag
		 */
		getLogs(clipboard) {
			if (this.debugEnabled === true) {
				if (window.mdtag?.webcomponent?.hasOwnProperty("debugger")) {
					this._initDebugger()

					const logs = this.debugger.getLogs()
					if (clipboard) {
						console.log("Click anywhere outside of the Devtools within 3 seconds...")
						setTimeout(() => this.debugger.copyTextToClipboard(logs), 3000)
						return true;
					}
					else return logs
				} else throw new Error(`[${this.componentID}] Could not get loggers: MarkdownTag Debugger not installed.`)
			}
		}

		// Helpers

		/**
		 * Tests whenever the provided path is absolute
		 *
		 * @param {string} path
		 * @return {boolean} 
		 * @memberof MDTag
		 */
		_isPathAbsolute(path) {
			return /^(?:\/|[a-z]+:\/\/)/.test(path);
		}
	}

	if (!window.mdtag) window.mdtag = {}
	if (!window.mdtag.webcomponent) window.mdtag.webcomponent = {}
	if (!window.mdtag.webcomponent.MDTag) window.mdtag.webcomponent.MDTag = MDTag
	window.customElements.define("md-tag", MDTag);
}

mdt_wc_init()