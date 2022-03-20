document.getElementById("paste-upload").addEventListener("submit", (e) => {
	e.preventDefault();

	document.getElementById("output").classList = "hidden";
	document.getElementById("loader").classList = "";
	document.getElementById("image-container").classList = "";
	document.getElementById("close").classList = "hidden";
	
	const accessible = document.querySelector("#accessible").checked;
	
	fetch("/api/"+document.getElementById("file-format").getAttribute("data-selected").toLowerCase()+"&accessible="+accessible,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(document.querySelector("#paste-upload textarea").value)
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

document.getElementById("file-input").addEventListener("change", (e) => {
	document.getElementById("output").classList = "hidden";
	document.getElementById("loader").classList = "";
	document.getElementById("image-container").classList = "";

	const file = e.target.files[0];
	const fr = new FileReader();
	fr.onload = function(evt) {
		const accessible = document.querySelector("#accessible").checked;
		
		fetch("/api/"+document.getElementById("file-format").getAttribute("data-selected").toLowerCase()+"&accessible="+accessible,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(evt.target.result)
			}
		)
		.then(response => response.blob())
		.then(blob => {
			document.getElementById("output").src = URL.createObjectURL(blob);
			document.getElementById("loader").classList = "hidden";
			document.getElementById("output").classList = "";
			document.getElementById("close").classList = "";
		});
	};

	fr.readAsText(file, "UTF-8");
});