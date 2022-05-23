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

// WIP: Extend BuiltIn Element to prevent script injection
// const ClassMixin = (baseClass, ...mixins) => {
//     class base extends baseClass {
//         constructor (...args) {
//             super(...args);
//             mixins.forEach((mixin) => {
//                 copyProps(this,(new mixin));
//             });
//         }
//     }
//     let copyProps = (target, source) => {  // this function copies all properties and symbols, filtering out some special ones
//         Object.getOwnPropertyNames(source)
//               .concat(Object.getOwnPropertySymbols(source))
//               .forEach((prop) => {
//                  if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
//                     Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
//                })
//     }
//     mixins.forEach((mixin) => { // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
//         copyProps(base.prototype, mixin.prototype);
//         copyProps(base, mixin);
//     });
//     return base;
// }

/**
 * Markdown Tag Web Component Script
 * By: DarkenLM
 */

function mdt_wc_init() {
	class MDTag extends HTMLParsedElement {// ClassMixin(HTMLTextAreaElement, HTMLParsedElement) WIP: Extend BuiltIn Element to prevent script injection
		constructor() {
			super();
			this.generated = false
			this.defaultFlavor = "showdown"
			this.defaultParserRoot = "./"
			this.flavors = [
				"commonmark",
				"github",
				"marked",
				"showdown"
			]

			this.shadow = this.attachShadow({mode: 'open'});
			this.headID = `md-tag-head-${Date.now()}${Math.floor(Math.random() * 999) + 1}`

			const shadowHead = document.createElement("head")
			shadowHead.id = this.headID
			this.shadow.appendChild(shadowHead)
			this.contentObserver = null
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

		set flavor(val) {
			if (val && typeof(val) === "string") {
				if (this.flavors.includes(val)) {
					this.setAttribute("flavor", val);
				} else this.setAttribute("flavor", this.defaultFlavor);
			} else this.setAttribute("flavor", this.defaultFlavor);
		}

		get raw() {
			const contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			if (contentDiv) {
				return contentDiv.innerHTML
			}
		}

		set raw(val) {
			const contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			if (contentDiv) {
				contentDiv.innerHTML = val
				this.generateMarkdown()
				return;
			}
		}

		addCss(url) {
			const head = this.shadow.querySelector(`#${this.headID}`)
			const link = document.createElement("link");
			
			link.id = `md-style-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = url;
		  
			head.appendChild(link);
		}

		assertStyleSheet(url) {
			const ss = this.shadow.styleSheets
			for (let i = 0, max = ss.length; i < max; i++) {
				if (ss[i].href === url) return true;
			}

			return false
		}

		addJs(url) {
			return new Promise((resolve, reject) => {
				try {
					const head = document.head;
					const script = document.createElement("script");
					
					script.id = `md-script-${Date.now()}${Math.floor(Math.random() * 999) + 1}`
					script.type = "text/javascript";
					script.src = url;

					script.addEventListener("load", () => {
						resolve()
					})
				
					head.appendChild(script);
				} catch(e) {
					reject(e)
				}
			})
		}

		removeScriptTagWithURL(url) {
			const head = document.head;
			const script = document.querySelector(`script[src="${url}"]`)

			if (script) {
				head.removeChild(script)
				return true
			} else return false
		}

		async ensureMarkdownParser(parser) {
			if (parser) {
				switch (parser) {
					case "showdown": {
						if (!window.hasOwnProperty("showdown")) {
							try {
								await this.addJs(`${this.parserRoot.endsWith("/") ? this.parserRoot.slice(0, -1) : this.parserRoot}/showdown/showdown.min.js`).catch(e => { throw e })
							} catch(e) {
								if (!window.hasOwnProperty("showdown")) {
									await this.addJs("https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js")
								} else return true

								if (!window.hasOwnProperty("showdown")) {
									console.error(`Unable to load markdown parser "showdown": ${e}`)
									return false
								}
							}
						}
						break;
					}
					case "commonmark": {
						if (!window.hasOwnProperty("md")) {
							try {
								await this.addJs(`${this.parserRoot.endsWith("/") ? this.parserRoot.slice(0, -1) : this.parserRoot}/commonmark/markdown-it.min.js`).catch(e => { throw e })
							} catch(e) {
								if (!window.hasOwnProperty("md")) {
									await this.addJs("https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js")
								} else return true

								if (!window.hasOwnProperty("md")) {
									console.error(`Unable to load markdown parser "markdown-it": ${e}`)
									return false
								}
							}
						}
						break;
					}
					case "marked": {
						if (!window.hasOwnProperty("marked")) {
							try {
								await this.addJs(`${this.parserRoot.endsWith("/") ? this.parserRoot.slice(0, -1) : this.parserRoot}/marked/marked.min.js`).catch(e => { throw e })
							} catch(e) {
								if (!window.hasOwnProperty("marked")) {
									await this.addJs("https://cdn.jsdelivr.net/npm/marked/marked.min.js")
								} else return true

								if (!window.hasOwnProperty("marked")) {
									console.error(`Unable to load markdown parser "marked": ${e}`)
									return false
								}
							}
						}
						break;
					}
					case "DOMPurify": {
						if (!window.hasOwnProperty("DOMPurify")) {
							try {
								await this.addJs(`${this.parserRoot.endsWith("/") ? this.parserRoot.slice(0, -1) : this.parserRoot}/DOMPurify/purify.min.js`).catch(e => { throw e })
							} catch(e) {
								if (!window.hasOwnProperty("DOMPurify")) {
									await this.addJs("https://cdn.jsdelivr.net/npm/dompurify@2.3.8/dist/purify.min.js")
								} else return true

								if (!window.hasOwnProperty("DOMPurify")) {
									console.error(`Unable to load markdown parser addon "DOMPurify": ${e}`)
									return false
								}
							}
						}
						break;
					}
				}
			}
		}

		sanitizeHTML(html) {
			let sanitized = DOMPurify.sanitize(html)
			return sanitized
		}

		async generateMarkdown() {
			const flavor = this.flavor
			let contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			let displayDiv = this.shadow.querySelector("div[md-tag-role='display']")

			if (!contentDiv || !displayDiv) this.generateFields()
			contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			displayDiv = this.shadow.querySelector("div[md-tag-role='display']")

			await this.ensureMarkdownParser("DOMPurify")

			switch (flavor) {
				case "commonmark": {
					await this.ensureMarkdownParser("commonmark")
					const md = window.markdownit()
					displayDiv.innerHTML = md.render(this.sanitizeHTML(contentDiv.innerHTML))
					break;
				}
				case "marked": {
					await this.ensureMarkdownParser("marked")
            		displayDiv.innerHTML = window.marked.parse(this.sanitizeHTML(contentDiv.innerText))
					break;
				}
				case "github": {
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

					const githubMDTag = document.createElement("github-md")
					githubMDTag.innerHTML = converter.makeHtml(this.sanitizeHTML(contentDiv.innerText))

					displayDiv.innerHTML = ""
					displayDiv.appendChild(githubMDTag)
					break;
				}
				case "showdown":
				default: {
					await this.ensureMarkdownParser("showdown")

					const converter = new window.showdown.Converter()
					converter.setOption('tables', 'on')
					converter.setOption('emoji', 'on')
					converter.setOption('strikethrough', 'on');
					converter.setOption('tasklists', 'true');
					converter.setOption('ghMentions', 'true');
					converter.setOption('simplifiedAutoLink', 'true');

					displayDiv.innerHTML = converter.makeHtml(this.sanitizeHTML(contentDiv.innerText))
				}
			}
		}

		generateFields() {
			const _contentDiv = this.shadow.querySelector("div[md-tag-role='raw']")
			const _displayDiv = this.shadow.querySelector("div[md-tag-role='display']")

			if (_contentDiv && _displayDiv) return;

			let contentDiv = document.createElement("div")
			if (!_contentDiv) {
				contentDiv.setAttribute("md-tag-role", "raw")
				contentDiv.style.display = "none"
				contentDiv.innerHTML = _contentDiv?.innerHTML || this.innerHTML
			}
			
			let displayDiv = document.createElement("div")
			if (!_displayDiv) {
				displayDiv.setAttribute("md-tag-role", "display")
				displayDiv.style.display = "block"
			}

			if (!_contentDiv) this.shadow.appendChild(contentDiv)
			if (!_displayDiv) this.shadow.appendChild(displayDiv)
		}

		// Spec-defined Methods

		parsedCallback() {
			this.contentObserver = new MutationObserver((mutations, observer) => {
				this.raw = this.innerHTML
			});

			this.contentObserver.observe(this, {
				characterData: true,
  				subtree: true
			});

			this.generateFields()
			this.generateMarkdown()
			this.generated = true
		}

		attributeChangedCallback(attrName, oldVal, newVal) {
			if (!this.generated) return;
			if (oldVal == newVal) return;

			switch (attrName) {
				case "flavor": {
					this.flavor = newVal
					this.generateMarkdown()
					break;
				}
			}
		}

		static get observedAttributes() {
			return [
				"flavor"
			];
		}
	}

	window.customElements.define("md-tag", MDTag, { extends: "textarea" });
}

mdt_wc_init()