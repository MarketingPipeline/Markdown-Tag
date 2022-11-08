# Markdown-Tag

 
<p align="center">
  <img height="400" src="https://imgur.com/oQgTNF3.png" />
</p>
                                                                     


   <p align="center">
    The easiest way to add Markdown support to your website!
  
  <br>
  <small> <b><i>Show your support!</i> </b></small>
  <br>
   <a href="https://github.com/MarketingPipeline/Markdown-Tag">
    <img title="Star on GitHub" src="https://img.shields.io/github/stars/MarketingPipeline/Markdown-Tag.svg?style=social&label=Star">
  </a>
  <a href="https://github.com/MarketingPipeline/Markdown-Tag/fork">
    <img title="Fork on GitHub" src="https://img.shields.io/github/forks/MarketingPipeline/Markdown-Tag.svg?style=social&label=Fork">
  </a>
   </p>  





## Example and usage

You can view a demo of Markdown Tag in use [here.](https://marketingpipeline.github.io/Markdown-Tag)


How to use <b><i>Markdown Tag</b></i>:

  Add support to any website to use markdown ANYWHERE with a simple tag! Like so -

            <md>
    # Markdown Support
               
               Awesomeness
             </md>



   include this [script](https://github.com/MarketingPipeline/Markdown-Tag/blob/main/markdown-tag.js) at the <b>bottom</b> of your HTML document.
         
    <script src="https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Tag/markdown-tag.js"></script> 


         

How to use <b><i>Markdown Tag</b></i> with <b>GitHub Styling</b>:

Instead of using a &lt;md> tag use
   
         <github-md># Example </github-md>






<br>



How to <b>render</b> new text or a new Markdown Tag added to HTML:

Call this function using a onclick etc..

```
renderMarkdown();
```



## Syntax


  This script uses Showdown to render Markdown - to read about the Showdown's Markdown syntax style click [here](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax)

How to use <b><i>CommonMark Syntax</b></i>:

 If you wish to use [CommonMark](https://spec.commonmark.org/current/) syntax instead of Showdown's use this [script](https://github.com/MarketingPipeline/Markdown-Tag/blob/main/markdown-tag-commonmark.js) instead of the one above at the <b>bottom</b> of your HTML document.
         
    <script src="https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Tag/markdown-tag-commonmark.js"></script> 

How to use <b><i>GitHub Flavored Markdown Syntax</b></i>:
 
 If you wish to use [GitHub Flavored Markdown Spec](https://github.github.com/gfm/) syntax  use this [script](https://github.com/MarketingPipeline/Markdown-Tag/blob/main/markdown-tag-Github.js) instead of the other script's above at the <b>bottom</b> of your HTML document. 
 
         
       <script src="https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Tag/markdown-tag-GitHub.js"></script> 
      
 
  <i>Note:</i> This options includes - Tables, GitHub Mentions & More.             


## Syntax Highlighting 

> Note: to use Syntax Hightlighting - you must use the GitHub flavored version of <b><i>Markdown Tag</i></b>.

By **default** using a <code>&lt;github-md></code> will automatically add a CSS stylesheet for GitHub like syntax hightlighting colors. 

To use Syntax Highlighting with a <code>&lt;md></code> tag, you will need to apply a CSS stylesheet. You can find a list of Syntax Hightlighting Stylesheets that work with Markdown Tag [here](https://github.com/PrismJS/prism-themes)



## Handling untrusted content

By default Markdown-Tag does not santize the Markdown you provide, since in most use cases the content is trusted.

Any other content provided from user's on your website etc. Should be santized before adding it inside a <code>&lt;md></code> or <code>&lt;github-md></code> tag to prevent XSS. 



## Contributing ![GitHub](https://img.shields.io/github/contributors/MarketingPipeline/Markdown-Tag)

Want to improve this? Create a pull request with detailed changes / improvements! If approved you will be added to the list of contributors of this awesome project!


Looking for a task to work on? Check the tasks that need improved in the [to-do](https://github.com/MarketingPipeline/Markdown-Tag/blob/main/.github/U.md) list.


See also the list of
[contributors](https://github.com/MarketingPipeline/Markdown-Tag/graphs/contributors) who
participate in this project.

## License ![GitHub](https://img.shields.io/github/license/MarketingPipeline/markdown-tag)

This project is licensed under the GPL-3.0 License - see the
[LICENSE.md](https://github.com/MarketingPipeline/Markdown-Tag/blob/main/LICENSE) file for
details.
