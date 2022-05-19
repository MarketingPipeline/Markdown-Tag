# Markdown-Elements
Use markdown in HTML with ease!


Add support to any website to use markdown ANYWHERE with a simple tag! Like so -

            <md>
             # Markdown Support
               Awesomeness
             </md>



How to use - 

include the script at the bottom of your script


Note:

You might need to use this for line breaks 

             md {
    white-space: pre-line;
    }

to use Github Markdown Styling include https://raw.githubusercontent.com/MarketingPipeline/Markdown-Elements/main/stylesheets/github_md.css on the page rendering Markdown Content



To-do - 

- [ ] Line Breaks Fixed 
   - [ ] add line break CSS via JS (NOT NEEDED ANYMORE)
   - [ ] Fix Line Break - White Space Size
- [ ] Fetch and load newest version of ShadowDown 
- [ ] Detect proper load method - on body etc. 
- [ ]  Tables don't render properly
- [ ]  Add options for adding Github Style sheet to <md> tag - so seperate styles can be used in one page
