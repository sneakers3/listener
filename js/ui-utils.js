
function blink(element) {
	element.classList.remove("blink");
	element.addEventListener("webkitAnimationEnd", function() {
		this.classList.remove("blink");
	}, false);
	setTimeout(function() {
		element.classList.add("blink");
	}, 100);
}
