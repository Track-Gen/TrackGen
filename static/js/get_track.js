document.getElementById("close").addEventListener("click", () => {
	document.getElementById("image-container").classList = "hidden";
	document.getElementById("output").classList = "hidden";
	document.getElementById("close").classList = "hidden";
});

document.querySelectorAll(".generate").forEach(button => {
	button.addEventListener("click", () => {
		document.querySelector("form").setAttribute("data-size", button.getAttribute("data-size"));
	});
});

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault();
	
	document.getElementById("output").classList = "hidden";
	document.getElementById("loader").classList = "";
	document.getElementById("image-container").classList = "";
	document.getElementById("close").classList = "hidden";

	data = [];
	document.querySelectorAll("#inputs .point").forEach(point => {
		const name = point.children[0].children[0].value;

		const latitude = Number(point.children[1].children[0].value) + point.children[1].children[1].getAttribute("data-selected").replace("°", "");

		const longitude = point.children[2].children[0].value + point.children[2].children[1].getAttribute("data-selected").replace("°", "");

		
		let speed = Number(point.children[3].children[0].value);
		if (point.children[3].children[1].getAttribute("data-selected") === "mph") {
			speed /= 1.151;
		} else if (point.children[3].children[1].getAttribute("data-selected") === "kph") {
			speed /= 1.852;
		}

		const stage = point.children[4].children[0].getAttribute("data-selected");

		data.push({
			name: name,
			longitude: longitude,
			latitude: latitude,
			speed: speed,
			stage: stage
		})
	});

	fetch("/api/trackgen?size="+e.target.getAttribute("data-size"),
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		}
	)
	.then(response => response.blob())
	.then(blob => {
		document.getElementById("output").src = URL.createObjectURL(blob);
		document.getElementById("loader").classList = "hidden";
		document.getElementById("output").classList = "";
	document.getElementById("close").classList = "";
	});
});