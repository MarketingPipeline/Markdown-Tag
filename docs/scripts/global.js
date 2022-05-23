// utilities
let get = function (selector, scope) {
	scope = scope ? scope : document;
	return scope.querySelector(selector);
};

let getAll = function (selector, scope) {
	scope = scope ? scope : document;
	return scope.querySelectorAll(selector);
};

// toggle tabs on codeblock
window.addEventListener("load", function () {
	// get all tab_containers in the document
	let tabContainers = getAll(".tab__container");

	// bind click event to each tab container
	for (let i = 0; i < tabContainers.length; i++) {
		const tab_menu = get('.tab__menu', tabContainers[i])
		get('.tab__menu', tabContainers[i]).addEventListener("click", tabClick);
		// console.log(tab_menu, tab_menu.classList, tab_menu.classList.contains("function"))

		// if (tab_menu.classList.contains("function")) tab_menu.addEventListener("click", tabFunctionClick);
		// else tab_menu.addEventListener("click", tabClick);
	}

	// each click event is scoped to the tab_container
	function tabClick(event) {
		let scope = event.currentTarget.parentNode;
		let clickedTab = event.target;
		let tabs = getAll('.tab', scope);
		let panes = getAll('.tab__pane', scope);
		let activePane = get(`.${clickedTab.getAttribute('data-tab')}`, scope);

		// remove all active tab classes
		for (let i = 0; i < tabs.length; i++) {
			tabs[i].classList.remove('active');
		}

		// remove all active pane classes
		for (let i = 0; i < panes.length; i++) {
			panes[i].classList.remove('active');
		}

		// apply active classes on desired tab and pane
		clickedTab.classList.add('active');

		if (clickedTab.classList.contains("function")) {
			let functionString = clickedTab.getAttribute('data-function')
			let functionArgsString = clickedTab.getAttribute('data-function-arguments')

			if (window[functionString] && typeof(window[functionString]) === "function") window[functionString].apply({}, JSON.parse(functionArgsString || "[]"))
		} else {
			activePane.classList.add('active');
		}
	}
});

//in page scrolling for documentaiton page
let btns = getAll('.js-btn');
let sections = getAll('.js-section');

function setActiveLink(event) {
	// remove all active tab classes
	for (let i = 0; i < btns.length; i++) {
		btns[i].classList.remove('selected');
	}

	event.target.classList.add('selected');
}

function smoothScrollTo(i, event) {
	let element = sections[i];
	setActiveLink(event);

	window.scrollTo({
		'behavior': 'smooth',
		'top': element.offsetTop - 20,
		'left': 0
	});
}

function triggerClick(elemID) {
	const element = document.getElementById(elemID)
	if (element) element.click()
}

if (btns.length && sections.length > 0) {
	for (let i = 0; i < btns.length; i++) {
		btns[i].addEventListener('click', smoothScrollTo.bind(this, i));
	}
}

// fix menu to page-top once user starts scrolling
window.addEventListener('scroll', function () {
	let docNav = get('.doc__nav > ul');

	if (docNav) {
		if (window.pageYOffset > 63) {
			docNav.classList.add('fixed');
		} else {
			docNav.classList.remove('fixed');
		}
	}
});

// responsive navigation
let topNav = get('.menu');
let icon = get('.toggle');

window.addEventListener('load', function () {
	function showNav() {
		if (topNav.className === 'menu') {
			topNav.className += ' responsive';
			icon.className += ' open';
		} else {
			topNav.className = 'menu';
			icon.classList.remove('open');
		}
	}
	icon.addEventListener('click', showNav);
});

function changeMdFormatter(id, formatter) {
	const mdTag = document.getElementById(id)
	const term = mdTag.parentElement

	switch (formatter) {
		case "github": {
			term.style.backgroundColor = "var(--bg-color)"
			break;
		}
		// case "marked":
		// case "commonmark": {
		// 	term.style.backgroundColor = "#605F5F"
		// 	break;
		// }
		default: {
			term.style.backgroundColor = "var(--medium-gray-color)"//"#605F5F" //"#232323"
		}
	}

	if (mdTag) mdTag.setAttribute("flavor", formatter)
}