var Debug = false;
function renderMarkdown(){
  
/* Add Github CSS + Syntax Highlight CSS  */  


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



var SyntaxCSSAdded = false;  
function addSyntaxHighlightCss(fileName) {

  if (SyntaxCSSAdded == false){
      var head = document.head;
  var link = document.createElement("link");

  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = fileName;

  head.appendChild(link);
  SyntaxCSSAdded = true
   
  } 

}
  
if (document.getElementsByTagName("md").length > 0) {

  var MD_TAG = document.getElementsByTagName("md");
for(var i=0; i<MD_TAG.length; i++)
MD_TAG[i].innerHTML = marked.parse(MD_TAG[i].textContent)


}



if (document.getElementsByTagName("github-md").length > 0) {

addCss('https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Elements/stylesheets/github_md.css');  
 
  addSyntaxHighlightCss('https://cdn.jsdelivr.net/gh/PrismJS/prism-themes/themes/prism-ghcolors.css')
  addSyntaxHighlighter()
var GitHub_MD_TAG = document.getElementsByTagName("github-md");
for(var i=0; i<GitHub_MD_TAG.length; i++)
GitHub_MD_TAG[i].innerHTML = marked.parse(GitHub_MD_TAG[i].innerHTML)

}
}



function addSyntaxHighlighter(){
  
  /// Add Prism.JS to document
var script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/prismjs@1.28.0/prism.min.js";

document.head.appendChild(script); 
  
  
  
  
  // On Error Loading Markdown Parser
script.onerror = function () {
 
  console.error("Markdown Tag: Error while performing function addSyntaxHighlighter - There was an error loading the Syntax Highlighter");
  
}

  
  /// Markdown Parser Load Successful 
script.onload = function () {
 
  if (Debug == true){
    console.log("Syntax Highlighter Was Loaded")
  }

  
};
}


function loadMarkdownParser(){
  
  /// Add Markdown Parser To Document
var script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.umd.min.js";

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
