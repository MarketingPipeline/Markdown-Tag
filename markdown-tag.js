/**!
 * @license Markdown-Tag - Add Markdown to any HTML using a <md> tag or md attribute
 * LICENSED UNDER GPL-3.0 LICENSE
 * MARKDOWN FLAVOUR: STANDARD FLAVORED MARKDOWN. 
 * MORE INFO / FLAVOR OPTIONS CAN BE FOUND AT https://github.com/MarketingPipeline/Markdown-Tag/
 */
var Debug = false;
function renderMarkdown(){
   
/* Add Github CSS  */  
  
var CSSAdded = false;
function addCss(fileName) {

  if (CSSAdded == false){
      var head = document.head;
  var link = document.createElement("link");

  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = fileName;

  head.appendChild(link);
  CSSAdded = true
   
  } 

}

/* Convert Markdown Attributes */ 

  
 
if (document.querySelectorAll('[md]').length > 0) {
  
  var converter = new showdown.Converter() 
converter.setOption('tables', 'on')
			
converter.setOption('emoji', 'on')

converter.setOption('strikethrough', 'on');
  
MD_TAG = document.querySelectorAll('[md]');
for(var i=0; i<MD_TAG.length; i++)
	  /// Temp fix for Gitub Block Quotes
MD_TAG[i].innerHTML = converter.makeHtml(MD_TAG[i].innerHTML.replace(/&gt;/g, '>'))
}

  

if (document.querySelectorAll('[github-md]').length > 0) {
  
addCss('https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Tag/stylesheets/github_md.min.css');
 

  var converter = new showdown.Converter() 
  
converter.setOption('tables', 'on')
			
converter.setOption('emoji', 'on')

converter.setOption('strikethrough', 'on')

converter.setOption('tasklists', 'true')


converter.setOption('ghMentions', 'true')


converter.setOption('simplifiedAutoLink', 'true');

  
  
GitHub_MD_TAG = document.querySelectorAll('[github-md]');
for(var i=0; i<GitHub_MD_TAG.length; i++)
  /// Temp fix for Gitub Block Quotes
   GitHub_MD_TAG = GitHub_MD_TAG[i]
  GitHub_MD_TAG.classList.add("github-md");
GitHub_MD_TAG.innerHTML = converter.makeHtml(GitHub_MD_TAG.innerHTML.replace(/&gt;/g, '>'))

}  
  

 /* Convert Markdown Tags */ 
  
if (document.getElementsByTagName("md").length > 0) {
  
  var converter = new showdown.Converter() 
converter.setOption('tables', 'on')
			
converter.setOption('emoji', 'on')

converter.setOption('strikethrough', 'on');
  
MD_TAG = document.getElementsByTagName("md");
for(var i=0; i<MD_TAG.length; i++)
	  /// Temp fix for Gitub Block Quotes
MD_TAG[i].innerHTML = converter.makeHtml(MD_TAG[i].innerHTML.replace(/&gt;/g, '>'))
}


if (document.getElementsByTagName("github-md").length > 0) {
  
addCss('https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Tag/stylesheets/github_md.min.css');
 

  var converter = new showdown.Converter() 
  
converter.setOption('tables', 'on')
			
converter.setOption('emoji', 'on')

converter.setOption('strikethrough', 'on')

converter.setOption('tasklists', 'true')


converter.setOption('ghMentions', 'true')


converter.setOption('simplifiedAutoLink', 'true');

  
  
GitHub_MD_TAG = document.getElementsByTagName("github-md");
for(var i=0; i<GitHub_MD_TAG.length; i++)
  /// Temp fix for Gitub Block Quotes
GitHub_MD_TAG[i].innerHTML = converter.makeHtml(GitHub_MD_TAG[i].innerHTML.replace(/&gt;/g, '>'))

}
}





function loadMarkdownParser(){
  
  /// Add Markdown Parser To Document
var script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Tag/parsers/showdown.min.js";

document.head.appendChild(script); //or something of the likes  
  
  
  
  
  // On Error Loading Markdown Parser
script.onerror = function () {
 
  console.error("Markdown Tag: Error while performing function LoadMarkdownParser - There was an error loading the Markdown Parser")
  
}

  
  /// Markdown Parser Load Successful 
script.onload = function () {
 
  // Let the Magic Begin 

renderMarkdown()
  
};
}
loadMarkdownParser()
