function speedToCat(speed) {
	if (speed === 0) {
		return -999;
	} else if (speed <= 34) {
		return -2;
	} else if (speed <= 64) {
		return -1;
	} else if (speed <= 83) {
		return 1;
	} else if (speed <= 96) {
		return 2;
	} else if (speed <= 113) {
		return 3;
	} else if (speed <= 137) {
		return 4;
	} else {
		return 5;
	}
}

function stageToShape(stage) {
	const s2s = {
		"": "",
		"extratropical cyclone": "triangle",
		"subtropical cyclone": "square",
		"tropical cyclone": "circle"
	}
	return s2s[stage.toLowerCase()];
}

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault();

	const data = [];
	document.querySelectorAll("#inputs .point").forEach(point => {
		const name = point.children[0].children[0].value;

		const latitude = Number(point.children[1].children[0].value) +
			point.children[1].children[1].getAttribute("data-selected").replace("°", "");

		const longitude = point.children[2].children[0].value +
			point.children[2].children[1].getAttribute("data-selected").replace("°", "");

		
		let speed = Number(point.children[3].children[0].value);
		if (point.children[3].children[1].getAttribute("data-selected") === "mph") {
			speed /= 1.151;
		} else if (point.children[3].children[1].getAttribute("data-selected") === "kph") {
			speed /= 1.852;
		}

		const stage = point.children[4].children[0].getAttribute("data-selected");		

		data.push({
			name:      name,
			shape:     stageToShape(stage),
			category:  speedToCat(speed),
			latitude:  latitude,
			longitude: longitude
		})
	});
	
	const accessible = document.querySelector("#accessible").checked;

	createMap(data, accessible);
});
