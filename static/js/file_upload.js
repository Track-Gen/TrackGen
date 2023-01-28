function mapFromFile(data, type, accessible) {
	let parsed;

	if (type === "hurdat") {
		parsed = parseHurdat(data);
	} else if (type === "atcf") {
		parsed = parseAtcf(data);
	} else if (type === "ibtracs") {
		parsed = parseIbtracs(data);
	} else if (type === "rsmc") {
		parsed = parseRsmc(data);
	} else {
		return;
	}

	createMap(parsed, accessible);
}

document.querySelector("#paste-upload").addEventListener("submit", (e) => {
	e.preventDefault();
	
	const accessible = document.querySelector("#accessible").checked;

	const data = document.querySelector("#paste-upload textarea").value;
	const type = document.querySelector("#file-format").getAttribute("data-selected").toLowerCase();

	mapFromFile(data, type, accessible);
});

document.querySelector("#file-input").addEventListener("change", (e) => {
	const accessible = document.querySelector("#accessible").checked;
	const type = document.querySelector("#file-format").getAttribute("data-selected").toLowerCase();

	const fr   = new FileReader();
	const file = e.target.files[0];

	fr.onload = evt => {
		const data = evt.target.result;
		document.querySelector("#file-input").value = "";

		mapFromFile(data, type, accessible);
	};

	fr.readAsText(file, "UTF-8");
});
