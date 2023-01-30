function handle_select(select) {
	select.setAttribute("data-selected", select.value);
	select.addEventListener("change", () => {
		select.setAttribute("data-selected", select.value);
	});
}
document.querySelectorAll("select").forEach(select => handle_select(select));

function handle_removal(button) {
	button.addEventListener("click", () => {
		const point = button.parentElement.parentElement;

		if (button.parentElement.parentElement.parentElement.children.length === 1) {
			point.querySelectorAll("input").forEach(input => {
				input.value = "";
			});

			point.querySelectorAll("select").forEach(select => {
				select.selectedIndex = 0;
				select.setAttribute("data-selected", select.value);
			});
		} else {
			point.remove();
		}
	});
}
document.querySelectorAll("#inputs .remove").forEach(button => { handle_removal(button) })

document.querySelector("#new-point").addEventListener("click", () => {
	const inputs = document.querySelector("#inputs");
	let new_inputs = document.querySelectorAll(".point");
	new_inputs = new_inputs[new_inputs.length-1].cloneNode(true);

	new_inputs.querySelectorAll("div:not(:first-child) > label > input").forEach(input => {
		input.value = "";
	});

	const latitude_select = new_inputs.querySelector("select.latitude");
	latitude_select.value = latitude_select.getAttribute("data-selected");
	handle_select(latitude_select);

	const longitude_select = new_inputs.querySelector("select.longitude");
	longitude_select.value = longitude_select.getAttribute("data-selected");
	handle_select(longitude_select);

	const speed_select = new_inputs.querySelector("select.speed");
	speed_select.value = speed_select.getAttribute("data-selected");
	handle_select(speed_select);

	const stage_select = new_inputs.querySelector(".stage");
	stage_select.value = stage_select.getAttribute("data-selected");
	handle_select(stage_select);

	handle_removal(new_inputs.querySelector(".remove"));

	inputs.appendChild(new_inputs);
	new_inputs.scrollIntoView();
});
