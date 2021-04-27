// HELPER FUNCTIONS

// Get mouse position over given element (in this application, only canvas ever calls this).
 function getMousePos(thisElement, e){
	let rect = thisElement.getBoundingClientRect();
	return {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top
	};
}

// Point-in-rectangle checker.
function pointInRectangle(x, y, x2, y2, width, height){
	if(x >= x2 && y >= y2 && x < x2 + width - 1 && y < y2 + height - 1) return true;
	else return false;
}

// Reconstruct item dropdown from item array.
function repopulateDropdown(){
	let itemSelect = document.getElementById("itemSelect");
	itemSelect.innerHTML = '';
	canvas.canvasItems.forEach((item, index) => {
		let newOption = document.createElement("option");
		newOption.value = index;		// For ease of use, dropdown options' values equal item array's index values.
		newOption.text = item.name;
		itemSelect.add(newOption);
	});
	// Make currently selected item the dropdown selection.
	itemSelect.value = canvas.selectedItem;
}
