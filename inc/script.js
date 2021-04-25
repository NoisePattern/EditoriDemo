// VARIABLES SETUP

// Canvas setup.
const c = document.getElementById("editorCanvas");			// Canvas element.
var ctx = c.getContext("2d");								// Canvas 2D context.
let canvasWidth = 1000;										// Initial canvas width.
let canvasHeight = 600;										// Initial canvas height.
let canvasViewX = 0;										// X and Y offsets of visible area. Can be non-zero when canvas is larger than containing div.
let canvasViewY = 0;
let mouseDragX = 0;											// Dragging reference X and Y values.
let mouseDragY = 0;
let canvasDragKey = false;									// Canvas drag key (shift) has been pressed.
let canvasDragging = false;									// Canvas is currently dragged.

// Navigation setup.
const nav = document.getElementById("navigation");			// Navigation container.
const navBox = document.getElementById("navigationBox");	// Navigation dragbox.
let navigationWidth = 150;									// Width of navigation container.
let navBoxHover = false;									// Navbox has hover.
let navigationDrag = false;									// Navbox is dragged.
let navDX = 0;												// Navigation dragging reference X and Y values.
let navDY = 0;

// Canvasitems setup.
const canvasItems = [];										// Array of items created to canvas.
let colorCanvas = '#f0f0f0';								// Canvas background color.
let bgCanvas = new Image();									// Canvas background image.
bgCanvas.onload = () => {									// Callback for canvas background image loaded event.
	bgIsLoaded = true;
	drawCanvas();
}
let bgIsLoaded = false;										// A background image has been loaded.
let bgStretch = false;										// Background image is stretched to canvas size.
const colorBorderDefault = 'rgba(0, 0, 0, 0.1)';			// Boundary color default value.
const colorBorderHover = 'rgba(0, 0, 0, 0.3)';				// Boundary color when item is hovered.
const colorBorderSelected = 'rgba(255, 128, 0, 0.5)';		// Boundary color when item is selected.
let showBounds = true;										// Toggle for drawing item borders.
// All Item tracker variables refer to an item's index in the canvasItems array, not a DOM identifier.
let selectedItem = -1;										// Currently selected item.
let hoveredItem = -1;										// Item that currently has mouse hover.
let draggedItem = -1;										// Item that is currently dragged.
let targetItem = -1;										// File upload's target item.
let runningCount = 1;										// Running counter for item names.



// HELPER FUNCTIONS

// -- Canvas helpers.

// Draw all canvas content.
function drawCanvas(){
	// Background color, and background image if set.
	ctx.fillStyle = colorCanvas;
	ctx.fillRect(0, 0, c.width, c.height);
	if(bgIsLoaded){
		if(bgStretch){
			ctx.drawImage(bgCanvas, 0 - canvasViewX, 0 - canvasViewY, canvasWidth, canvasHeight);
		} else {
			ctx.drawImage(bgCanvas, 0 - canvasViewX, 0 - canvasViewY);
		}
	}
	// Loop through all items (array index order is used as depth order) and run their draw methods.
	canvasItems.forEach(function(item, index){
		item.draw(index);
	});
}

// Resize canvas.
function canvasResize(){
	let region = document.getElementById("canvasColumn");						// Div containing the canvas.
	canvasWidth = parseInt(document.getElementById('canvasWidth').value);		// Get canvas width.
	canvasHeight = parseInt(document.getElementById('canvasHeight').value);		// Get canvas height.
	let width = canvasWidth;
	let height = canvasHeight;
	
	// Resize navigation area to same aspect as actual canvas. 
	let navHeight = Math.round((height / width) * navigationWidth);
	nav.style.height = navHeight.toString() + "px";

	// Fit canvas to its div container if wider or taller than the div.
	if(region.offsetWidth < width){
		width = region.offsetWidth;
	}
	if(region.offsetHeight < height){
		height = region.offsetHeight;
	}

	// View position must remain within actual canvas region if canvas size has shrunk.
	canvasViewX = Math.min(canvasViewX, canvasWidth - width);
	canvasViewY = Math.min(canvasViewY, canvasHeight - height);

	// Set canvas size. Content must be redrawn after setting size.
	c.width = width;
	c.height = height;
	drawCanvas();
	
	// Update navigator.
	navigationBoxSize();
}



// -- Navigator.

// Display navigator.
function navigationShow(){
	nav.style.display = "block";
	navigationBoxSize();
}

// Hide navigator.
function navigationHide(){
	nav.style.display = "none";
}

// Set size of navigation drag box.
function navigationBoxSize(){
	// Ratio of box to container width and height is the same as visible canvas area's ratio to actual canvas size.
	navBox.style.width = (nav.offsetWidth * (c.width / canvasWidth)).toString() + 'px';
	navBox.style.height = (nav.offsetHeight * (c.height / canvasHeight)).toString() + 'px';
	navigationBoxPosition(Math.round(nav.offsetWidth * canvasViewX / canvasWidth), Math.round(nav.offsetHeight * canvasViewY / canvasHeight));
}

function navigationBoxPosition(_x, _y){
	_x = Math.max(0, Math.min(parseInt(nav.offsetWidth) - parseInt(navBox.offsetWidth), _x));
	_y = Math.max(0, Math.min(parseInt(nav.offsetHeight) - parseInt(navBox.offsetHeight), _y));
	navBox.style.left = _x.toString() + "px";
	navBox.style.top = _y.toString() + "px";
}



// -- Items.

// Makes given item selected and runs UI updates accordingly.
function selectItem(_item){
	// Make given item the currently selected item.
	selectedItem = _item;
	// Update dropdown selection to this item.
	document.getElementById("itemSelect").value = _item;
	// Display this item's manager panel.
	displayItemManager(_item);
	// Draw canvas if bounding boxes are displayed (the correct bounds must now be get the active selection color).
	if(showBounds) drawCanvas();
}

// Display an item manager. Value -1 hides all managers.
function displayItemManager(_item){
	// If item index has been given, show manager form with its data.
	if(_item >= 0){
		// If item is text item, text item manager is made visible.
		if(canvasItems[_item].type === 'text'){
			document.getElementById('textItem').style.display = 'block';
			document.getElementById('imageItem').style.display = 'none';
		}
		// If item is image item, image item manager is made visible.
		else if(canvasItems[_item].type === 'image'){
			document.getElementById('textItem').style.display = 'none';
			document.getElementById('imageItem').style.display = 'block';
		}
		// Have the item send its data to form elements.
		canvasItems[_item].updateUI();
	}
	// Hide managers.
	else {
		document.getElementById('textItem').style.display = 'none';
		document.getElementById('imageItem').style.display = 'none';
	}
}



// -- Miscellaneous.

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
	canvasItems.forEach((item, index) => {
		let newOption = document.createElement("option");
		newOption.value = index;		// For ease of use, dropdown options' values equal item array's index values.
		newOption.text = item.name;
		itemSelect.add(newOption);
	});
	// Make currently selected item the dropdown selection.
	itemSelect.value = selectedItem;
}


