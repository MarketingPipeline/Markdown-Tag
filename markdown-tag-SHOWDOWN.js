
	var converter = new showdown.Converter();
			converter.setOption('tables', 'on');
			
			converter.setOption('emoji', 'on');
			elements = document.getElementsByTagName("md");
			for(var i=0; i<elements.length; i++)
				elements[i].innerHTML = converter.makeHtml(elements[i].textContent)
