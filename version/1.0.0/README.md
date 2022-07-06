# Markdown-Tag

 
<p align="center">
  <img height="400" src="https://imgur.com/oQgTNF3.png" />
</p>
                                                                     


<p align="center">
	The easiest way to add Markdown support to your website!
  	<br/>
	<small> <b><i>Show your support!</i></b> </small>
	<br/>
	<a href="https://github.com/MarketingPipeline/Markdown-Tag">
		<img title="Star on GitHub" src="https://img.shields.io/github/stars/MarketingPipeline/Markdown-Tag.svg?style=social&label=Star">
	</a>
	<a href="https://github.com/MarketingPipeline/Markdown-Tag/fork">
		<img title="Fork on GitHub" src="https://img.shields.io/github/forks/MarketingPipeline/Markdown-Tag.svg?style=social&label=Fork">
	</a>
</p>  

<h1 align="center">v1.0.0</h1>

## Documentation
You can view the Documentation for Markdown Tag [here](https://marketingpipeline.github.io/Markdown-Tag/1.0.0/docs/landing) or by viewing the html file at `docs/landing`.
## Example and usage
You can view a demo of Markdown Tag in use [here](https://marketingpipeline.github.io/Markdown-Tag).


### Instalation
Include this [script](https://github.com/MarketingPipeline/Markdown-Tag/blob/main/markdown-tag-wc.js) anywhere in your HTML document.

```html    
<script src="https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Tag/markdown-tag-wc.js"></script>
```
### How to use <b><i>Markdown Tag</b></i>:  
Add support to any website to use markdown ANYWHERE with a simple tag! Like so -

```html
    <md-tag>
# Markdown Support
Awesomeness
	</md-tag>
```

> As of v1.0.0, indentation is interpreted, and as such, the content of the HTML element is required to have no indentation.

### How to use <b><i>Markdown Tag</b></i> with <b>GitHub Styling</b>:

Simply add the flavor you want to your tag:
```html
    <md-tag flavor="github">
# Github Styled Markdown
	</md-tag>
```


## Syntax

### Showdown
This script uses Showdown by default to render Markdown - to read about the Showdown's Markdown syntax style click [here](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax)

### CommonMark
If you wish to use [CommonMark](https://spec.commonmark.org/current/) syntax instead of Showdown's, simply modify the flavor of your HTML element:
```html
    <md-tag flavor="commonmark">
# Github Styled Markdown
	</md-tag>
```

### Marked
If you wish to use [Marked](https://marked.js.org/) syntax instead of Showdown's, simply modify the flavor of your HTML element:
```html
    <md-tag flavor="marked">
# Github Styled Markdown
	</md-tag>
```

## XSS Vulnerabilities
Last test: Wed Jul 06 2022 17:11:26 GMT+0100

Last Results:
```
=============================================
        XSS Pentesting Tester Results        
   ---------------------------------------
	----- < PAYLOAD > -----
	  - Payload Key: BASIC
	  - ✔ IMMUNE - Application is not vulnerable to this payload.
	-----------------------
	----- < PAYLOAD > -----
	  - Payload Key: TAGBYPASS
	  - ✔ IMMUNE - Application is not vulnerable to this payload.
	-----------------------
	----- < PAYLOAD > -----
	  - Payload Key: BYPASS
	  - ✔ IMMUNE - Application is not vulnerable to this payload.
	-----------------------
	----- < PAYLOAD > -----
	  - Payload Key: ENCODED
	  - ✔ IMMUNE - Application is not vulnerable to this payload.
	-----------------------
	----- < PAYLOAD > -----
	  - Payload Key: POLYGLOTS
	  - ✔ IMMUNE - Application is not vulnerable to this payload.
	-----------------------
=============================================
```
             
          
## Known Issues 

- [ ] GitHub Flavored Markdown Syntax is not correct 100%
- [ ] GitHub Syntax Needs HTML Decoding Fixed 
- [X] XSS Vunerability Fix

## Building MarkdownTag
In order to build MarkdownTag, edit the source code in the `src` directory, and then execute the file located at `.build/.build.js` using node.

## Contributing ![GitHub](https://img.shields.io/github/contributors/MarketingPipeline/Markdown-Tag)

Want to improve this? Create a pull request with detailed changes / improvements! If approved you will be added to the list of contributors of this awesome project!


Looking for a task to work on? Check the tasks that need improved in the [to-do](https://github.com/MarketingPipeline/Markdown-Tag/blob/main/to-do.md) list.


See also the list of
[contributors](https://github.com/MarketingPipeline/Markdown-Tag/graphs/contributors) who
participate in this project.

## License ![GitHub](https://img.shields.io/github/license/MarketingPipeline/markdown-tag)

This project is licensed under the GPL-3.0 License - see the
[LICENSE.md](https://github.com/MarketingPipeline/Markdown-Tag/blob/main/LICENSE) file for
details.
