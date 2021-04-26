// EVENTLISTENERS

// --- Window listeners.

// Initial canvas setup once DOM has fully loaded.
window.addEventListener("DOMContentLoaded", function(){
	document.getElementById('canvasWidth').value = canvasWidth;
	document.getElementById('canvasHeight').value = canvasHeight;
	document.getElementById('canvasColor').value = colorCanvas;	
	c.width = canvasWidth;
	c.height = canvasHeight;
	n.setNavSize();
	n.setNavBoxSize();
	drawCanvas();
});

// Canvas may need to resize when window changes size.
window.addEventListener("resize", function(){
	canvasResize();
});

// When navigation viewbox is dragged, mouse can easily move outside the navigation box, so mouseup should not be listened on the navbox.
// Instead, the entire document area listens for mouseup and ends navbox dragging if it is active.
window.addEventListener("mouseup", function(){
	if(n.navigationDrag){
		n.navBoxDrag = false;
	}
});

// Start canvas mousedrag when shift is pressed down.
window.addEventListener("keydown", function(e){
	if(e.code == "ShiftLeft" || e.code == "ShiftRight") canvasDragKey = true;
	
});

// End canvas mousedrag when shift is released.
window.addEventListener("keyup", function(e){
	if(canvasDragKey && (e.code == "ShiftLeft" || e.code == "ShiftRight")) canvasDragKey = false;
});



// --- Canvas listeners.

// Mouse movement on canvas.
c.addEventListener('mousemove', function(e){
	let Pos = getMousePos(c, e);
	// If an item is currently dragged.
	if(draggedItem != -1){
		// Change item position by amount mouse has moved.
		canvasItems[draggedItem].move(Pos.x - mouseDragX, Pos.y - mouseDragY);
	}
	// If no item is dragged.
	else {
		// If canvas mousedrag is on, move canvas view.
		if(canvasDragging){
			// Calculate amounts moved from previous move position.
			let DX = mouseDragX - Pos.x;
			let DY = mouseDragY - Pos.y;
			if(DX != 0 || DY != 0){
				// Move view by calculated delta values.
				let region = document.getElementById("canvasColumn");
				canvasViewX = Math.max(0, Math.min(canvasViewX + DX, canvasWidth - region.offsetWidth));
				canvasViewY = Math.max(0, Math.min(canvasViewY + DY, canvasHeight - region.offsetHeight));
				// Set this position as previous position.
				mouseDragX = Pos.x;
				mouseDragY = Pos.y;
				// Update navigator dragbox position.
				n.setNavBoxPosition(canvasViewX / canvasWidth * n.navWidth, canvasViewY / canvasHeight * n.navHeight);
				drawCanvas();
			}
		}
		// Otherwise check for hovers.
		else {
			// Loop through all items and find if any is under mouse pointer, select it as hovered.
			let previous = hoveredItem;
			hoveredItem = -1;
			canvasItems.forEach(function(item, index){
				if(item.getHover(Pos.x, Pos.y)) hoveredItem = index;
			});
			// Redraw canvas if hover state has changed and bounding box drawing is enabled (hovered item must get the correct bounding color).
			if(showBounds && previous != hoveredItem) drawCanvas();
		}
	}
});

// Mouse down on canvas.
c.addEventListener('mousedown', function(e){
	let Pos = getMousePos(c, e);
	// If shift has been pressed, start dragging canvas.
	if(canvasDragKey){
		canvasDragging = true;
		mouseDragX = Pos.x;
		mouseDragY = Pos.y;
	}
	// Otherwise, if there is an item under pointer, make it selected.
	else if(hoveredItem != -1){
		selectItem(hoveredItem);
		draggedItem = hoveredItem;	// Selected item is also the item being dragged, until mouse up event fires.
		mouseDragX = Pos.x - canvasItems[hoveredItem].x;
		mouseDragY = Pos.y - canvasItems[hoveredItem].y;
	}
});

// Mouse up on canvas.
c.addEventListener('mouseup', function(e){
	canvasDragging = false;
	draggedItem = -1;
});

// Mouse leave from canvas.
c.addEventListener('mouseleave', function(e){
	canvasDragging = false;
	hoveredItem = -1;
	draggedItem = -1;
	drawCanvas();
});



// --- Navigation listeners.

// Mouse down on navigation area.
n.nav.addEventListener('mousedown', function(e){
	n.dragBegin(e);
});

// Mouse up on navigation area.
n.nav.addEventListener('mouseup', function(){
	n.dragEnd();
});

// Mouse move on navigation area.
n.nav.addEventListener('mousemove', function(e){
	n.dragBox(e);
});



// --- Form listeners: canvas manager.

// Canvas width and height value change.
document.getElementById("canvasWidth").addEventListener("change", canvasResize);
document.getElementById("canvasHeight").addEventListener("change", canvasResize);

// Canvas color value change.
document.getElementById("canvasColor").addEventListener("change", function(){
	colorCanvas = this.value;
	drawCanvas();
});

// Canvas background image loader.
document.getElementById("canvasFileInput").addEventListener("change", function(){
//	let input = document.getElementById('canvasFileInput');
	let file = this.files[0];
	fr = new FileReader();
	fr.onload = function(){
		bgCanvas.src = fr.result;
	};
	fr.readAsDataURL(file);
});

// Canvas background image removal.
document.getElementById("canvasImageRemove").addEventListener("click", function(){
	let input = document.getElementById('canvasFileInput');
	input.value = '';
	bgCanvas.scr = '';
	bgIsLoaded = false;
	drawCanvas();
});

// Canvas background image stretch toggle.
document.getElementById("canvasBgScale").addEventListener("click", function(){
	bgStretch = this.checked;
	drawCanvas();
});

// Turn canvas into image.
document.getElementById("imageCreate").addEventListener("click", function(){
	let overlay = document.getElementById("pageOverlay");
	overlay.style.display = "block";
	// Create temp canvas for draw and set it to full canvas size.
	let c2 = document.createElement("canvas");
	c2.width = canvasWidth;
	c2.height = canvasHeight;
	// Switch draw context to new canvas.
	ctx = c2.getContext("2d");
	// Canvas view offsets are set temporarily to zero because they are for viewable canvas, not the target canvas.
	let tempVX = canvasViewX;
	let tempVY = canvasViewY;
	// Save boundary setting and turn boundaries off.
	let tempBounds = showBounds;
	showBounds = false;
	canvasViewX = 0;
	canvasViewY = 0;
	// Draw and open image in new tab.
	drawCanvas();

	let newTab = window.open();
	newTab.document.write('<img src="' + c2.toDataURL("image/png") + '">');
	// Set draw context back to real canvas and return view offsets to correct values.
	ctx = c.getContext("2d");
	canvasViewX = tempVX;
	canvasViewY = tempVY;
	showBounds = tempBounds;
	overlay.style.display = "none";
});



// --- Form listeners: item manager.

// Add new text item.
document.getElementById("addTextItem").addEventListener("click", function(){
	let item = new TextItem(Math.round(canvasViewX + c.width / 2), Math.round(canvasViewY + c.height / 2));
	item.name = "Teksti_" + runningCount++;
	canvasItems.push(item);
	repopulateDropdown();
	selectItem(canvasItems.length - 1);
});

// Add new image item.
document.getElementById("addImageItem").addEventListener("click", function(){
	let item = new ImageItem(Math.round(canvasViewX + c.width / 2), Math.round(canvasViewY + c.height / 2));
	item.name = "Kuva_" + runningCount++;
	canvasItems.push(item);
	repopulateDropdown();
	selectItem(canvasItems.length - 1);
});

// Item selection from dropdown.
document.getElementById("itemSelect").addEventListener("change", function(){
	selectItem(this.value);
});

// Move item up in z-order.
// Ordering changes work by repositioning target in the canvas items array (as their indexed order is considered their z-order)
// and recreating the item dropdown content from new indexed order.
document.getElementById("itemUp").addEventListener("click", function(){
	let selected = parseInt(document.getElementById("itemSelect").value);
	if(selected < canvasItems.length - 1){
		let moved = canvasItems.splice(selected, 1);
		canvasItems.splice(selected + 1, 0, moved[0]);
		selectedItem = selected + 1;	// Selection was moved to other index position, so update tracker variable.
		repopulateDropdown();
		drawCanvas();
	}
});

// Move item down in z-order.
document.getElementById("itemDown").addEventListener("click", function(){
	let selected = parseInt(document.getElementById("itemSelect").value);
	if(selected > 0){
		let moved = canvasItems.splice(selected, 1);
		canvasItems.splice(selected - 1, 0, moved[0]);
		selectedItem = selected - 1;	// Selection was moved to other index position, so update tracker variable.
		repopulateDropdown();
		drawCanvas();
	}
});

// Remove item.
document.getElementById("itemRemove").addEventListener("click", function(){
	let selected = document.getElementById("itemSelect").value;
	if(selected.trim().length > 0){
		let response = window.confirm("Haluatko poistaa kentän " + canvasItems[selected].name);
		if(response == true){
			canvasItems.splice(selected, 1);
			repopulateDropdown();
			selectItem(-1);
		}
	}
});

// Toggle bounding box visibility.
document.getElementById("showBounds").addEventListener("click", function(){
	showBounds = this.checked;
	drawCanvas();
});



// --- Form listeners: text item manager.

// Name change.
document.getElementById("textItemName").addEventListener("change", function(){
	canvasItems[selectedItem].setName(this.value);
});

// Content change.
document.getElementById("textItemContent").addEventListener("change", function(){
	canvasItems[selectedItem].setText(this.value);
});

// Font change.
document.getElementById("textItemFont").addEventListener("change", function(){
	canvasItems[selectedItem].setFont(this.value);
});

// Font size change.
document.getElementById("textItemSize").addEventListener("change", function(){
	canvasItems[selectedItem].setSize(this.value);
});

// Font Color change.
document.getElementById("textItemColor").addEventListener("change", function(){
	canvasItems[selectedItem].setTextColor(this.value);
});

// X-position change.
document.getElementById("textItemX").addEventListener("change", function(){
	canvasItems[selectedItem].setPosition();
});

// Y-position change.
document.getElementById("textItemY").addEventListener("change", function(){
	canvasItems[selectedItem].setPosition();
});

// Sizing type change.
document.getElementById("textItemAreaType").addEventListener("change", function(){
	let newheight = 0;
	// If automatic type is selected, hide manual input fields.
	if(this.value == 0){
		document.getElementById("textItemAreaManual").style.display = "none";
	}
	// If manual input type is selected, show manual input fields.
	else if(this.value == 1){
		document.getElementById("textItemAreaManual").style.display = "flex";
		newheight = document.getElementById("textItemAreaManual").offsetHeight;
	}
	document.getElementById("textItemResizer").style.height = newheight.toString() + "px";
	canvasItems[selectedItem].setAreaType(this.value);
});

document.getElementById("textItemWidth").addEventListener("change", function(){
	canvasItems[selectedItem].setAreaValues();
});

document.getElementById("textItemHeight").addEventListener("change", function(){
	canvasItems[selectedItem].setAreaValues();
});

// Background draw toggle.
document.getElementById("textItemBackground").addEventListener("change", function(){
	canvasItems[selectedItem].setBackground(this.checked);
});

// Background color change.
document.getElementById("textItemBackgroundColor").addEventListener("change", function(){
	canvasItems[selectedItem].setBackgroundColor(this.value);
});

// Padding width change.
document.getElementById("textItemPadding").addEventListener("change", function(){
	canvasItems[selectedItem].setPadding(this.value);
});

// Border width change.
document.getElementById("textItemBorder").addEventListener("change", function(){
	canvasItems[selectedItem].setBorder(this.value);
});

// Border color change.
document.getElementById("textItemBorderColor").addEventListener("change", function(){
	canvasItems[selectedItem].setBorderColor(this.value);
});

// Roundness change.
document.getElementById("textItemRoundness").addEventListener("input", function(){
	canvasItems[selectedItem].setRoundness(this.value);
});



// --- Form listeners: image item manager.

// Name change.
document.getElementById("imageItemName").addEventListener("change", function(){
	canvasItems[selectedItem].setName(this.value);
});

// Image load.
document.getElementById("imageFileInput").addEventListener("change", function(){
	targetItem = selectedItem;
	let input = document.getElementById('imageFileInput');
	let file = input.files[0];
	fr = new FileReader();
	fr.onload = () => {
		canvasItems[targetItem].image.src = fr.result;
		input.value = '';
	};
	fr.readAsDataURL(file);
});

// X-position change.
document.getElementById("imageItemX").addEventListener("change", function(){
	canvasItems[selectedItem].setPosition();
});

// Y-position change.
document.getElementById("imageItemY").addEventListener("change", function(){
	canvasItems[selectedItem].setPosition();
});

// Image scaling type dropdown.
document.getElementById("imageItemSizeType").addEventListener("change", function(){
	let newheight = 0;
	if(this.value == 0){
		document.getElementById("imageItemSizeScaled").style.display = "none";
		document.getElementById("imageItemSizeManual").style.display = "none";
	}
	else if(this.value == 1){
		document.getElementById("imageItemSizeScaled").style.display = "flex";
		document.getElementById("imageItemSizeManual").style.display = "none";
		newheight = document.getElementById("imageItemSizeScaled").offsetHeight;
	}
	else if(this.value == 2){
		document.getElementById("imageItemSizeScaled").style.display = "none";
		document.getElementById("imageItemSizeManual").style.display = "flex";
		newheight = document.getElementById("imageItemSizeManual").offsetHeight;
	}
	document.getElementById("imageItemResizer").style.height = newheight.toString() + "px";
	canvasItems[selectedItem].setScalingType(this.value);
});

// Image scale change.
document.getElementById("imageItemScaleRatio").addEventListener("change", function(){
	canvasItems[selectedItem].setScaleRatio(this.value);
});

// Image x-size value change.
document.getElementById("imageItemScaledWidth").addEventListener("change", function(){
	let aspect = canvasItems[selectedItem].getAspect();
	if(aspect != -1){
		document.getElementById("imageItemScaledHeight").value = Math.round(this.value / aspect);
	}
	canvasItems[selectedItem].setScaleSize();
});

// Image y-size value change.
document.getElementById("imageItemScaledHeight").addEventListener("change", function(){
	let aspect = canvasItems[selectedItem].getAspect();
	if(aspect != -1){
		document.getElementById("imageItemScaledWidth").value = Math.round(this.value * aspect);
	}
	canvasItems[selectedItem].setScaleSize();
});

document.getElementById("imageItemPreserveAspect").addEventListener("change", function(){
	canvasItems[selectedItem].setPreserveAspect(this.checked);
});


// Background visibility toggle.
document.getElementById("imageItemBackground").addEventListener("change", function(){
	canvasItems[selectedItem].setBackground(this.checked);
});

// Background color change.
document.getElementById("imageItemBackgroundColor").addEventListener("change", function(){
	canvasItems[selectedItem].setBackgroundColor(this.value);
});

// Padding width change.
document.getElementById("imageItemPadding").addEventListener("change", function(){
	canvasItems[selectedItem].setPadding(this.value);
});

// Border width change.
document.getElementById("imageItemBorder").addEventListener("change", function(){
	canvasItems[selectedItem].setBorder(this.value);
});

// Border width change.
document.getElementById("imageItemBorderColor").addEventListener("change", function(){
	canvasItems[selectedItem].setBorderColor(this.value);
});

// Border width change.
document.getElementById("imageItemRoundness").addEventListener("input", function(){
	canvasItems[selectedItem].setRoundness(this.value);
});
