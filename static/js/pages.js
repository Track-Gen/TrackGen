document.querySelectorAll("#input-type button").forEach(button => {
	button.addEventListener("click", () => {
		let index = 0;
		let elem = button;
		while (elem !== null) {
			elem = elem.previousElementSibling;
			index++;
		}
		document.querySelectorAll(".page")[0].style.marginLeft = -95 * (index-1) + "vw";

		document.querySelectorAll("#input-type button").forEach(button => button.className="");
		button.className = "selected";

		setTimeout(() => {
			alert("Attempting to generate large track maps can cause a lot of stress on the server and take lengthy periods of time to complete. If you are trying to generate a large image, please consider using the desktop app.");
		}, 1000);
	});
});