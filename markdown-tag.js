var Debug = false;

/* Add Github CSS  */ 


var CSSAdded = false;
function addCss(fileName) {

  if (CSSAdded == false){
      if (Debug == true){
    console.log("Adding GitHub CSS stylesheet")
  } 
      var head = document.head;
  var link = document.createElement("link");

  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = fileName;

  head.appendChild(link);
  CSSAdded = true
   
  } 

}


/* Convert Markdown Tags */ 

function renderMarkdown(){
if (document.getElementsByTagName("md").length > 0) {

 
  if (Debug == true){
    console.log("Found <MD> tags- converting to HTML ")
  } 
  
var converter = new showdown.Converter()   
  
converter.setOption('tables', 'on')
			
converter.setOption('emoji', 'on')

converter.setOption('strikethrough', 'on');

converter.setOption('tasklists', 'true');


converter.setOption('ghMentions', 'true');


converter.setOption('simplifiedAutoLink', 'true');
    
var converter = new showdown.Converter()  
MD_TAG = document.getElementsByTagName("md");
for(var i=0; i<MD_TAG.length; i++)
MD_TAG[i].innerHTML = converter.makeHtml(MD_TAG[i].innerHTML)
}

if (document.getElementsByTagName("github-md").length > 0) {
  
addCss('https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Elements/stylesheets/github_md.css');

 
  if (Debug == true){
    console.log("Found <github-md> tag(s)- converting to HTML ")
  } 
  
var converter = new showdown.Converter()

var s = document.createElement("script");
s.type = "text/javascript";
s.src = "https://cdn.jsdelivr.net/npm/prismjs@1.28.0/prism.min.js";
  
document.head.appendChild(s);  

converter.setOption('tables', 'on')
			
converter.setOption('emoji', 'on')

converter.setOption('strikethrough', 'on');

converter.setOption('tasklists', 'true');


converter.setOption('ghMentions', 'true');


converter.setOption('simplifiedAutoLink', 'true');
  
  
GitHub_MD_TAG = document.getElementsByTagName("github-md");
for(var i=0; i<GitHub_MD_TAG.length; i++)
GitHub_MD_TAG[i].innerHTML = 
   /* Replace is for temp fix for Gitub Block Quotes
*/converter.makeHtml(GitHub_MD_TAG[i].innerHTML.replace(/&gt;/g, '>'))
}
}




function loadMarkdownParser(){
  
  /// Add Markdown Parser To Document
var script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/showdown@latest/dist/showdown.min.js";

document.head.appendChild(script); //or something of the likes  
  
  
  
  
  // On Error Loading Markdown Parser
script.onerror = function () {
 
  console.error("Markdown Tag: Error while performing function LoadMarkdownParser - There was an error loading the Markdown Parser")
  
}

  
  /// Markdown Parser Load Successful 
script.onload = function () {
 

  if (Debug == true){
    console.log("Markdown Parser Was Loaded")
  }
  // Let the Magic Begin 
renderMarkdown()
  
};
}
loadMarkdownParser()
