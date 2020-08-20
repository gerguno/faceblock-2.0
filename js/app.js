'use strict';

angular.module("app", []);

/* some fun :)) */
setTimeout(function() {
	document.getElementById("new-todo").focus();
	var sheet = window.document.styleSheets[0]
	sheet.insertRule('input.switcher { -webkit-transition: padding .09s ease-in, background-color .09s linear; }', sheet.cssRules.length);
}, 180);

