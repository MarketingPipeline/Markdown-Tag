
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

function renderMarkdown(){
if (document.getElementsByTagName("md").length > 0) {

  var MD_TAG = document.getElementsByTagName("md");
for(var i=0; i<MD_TAG.length; i++)
MD_TAG[i].innerHTML = marked.parse(MD_TAG[i].textContent)


}



if (document.getElementsByTagName("github-md").length > 0) {

addCss('https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Elements/stylesheets/github_md.css');  

var GitHub_MD_TAG = document.getElementsByTagName("github-md");
for(var i=0; i<GitHub_MD_TAG.length; i++)
GitHub_MD_TAG[i].innerHTML = marked.parse(GitHub_MD_TAG[i].innerHTML)

}
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
