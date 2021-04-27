// EVENTLISTENERS

// --- Window listeners.

// Initial canvas setup once DOM has fully loaded.
window.addEventListener("DOMContentLoaded", function(){
	document.getElementById('canvasWidth').value = canvas.canvasWidth;
	document.getElementById('canvasHeight').value = canvas.canvasHeight;
	document.getElementById('canvasColor').value = canvas.colorCanvas;	
	canvas.c.width = canvas.canvasWidth;
	canvas.c.height = canvas.canvasHeight;
	n.setNavSize();
	n.setNavBoxSize();
	canvas.draw();
});

// Canvas may need to resize when window changes size.
window.addEventListener("resize", function(){
	canvas.resize();
});

// When navigation viewbox is dragged, mouse can easily move outside the navigation box, so mouseup should not be listened on the navbox.
// Instead, the entire document area listens for mouseup and ends navbox dragging if it is active.
window.addEventListener("mouseup", function(){
	if(n.navigationDrag){
		n.navBoxDrag = false;
	}
});

// Enter canvas mousedrag state when shift is pressed down.
window.addEventListener("keydown", function(e){
	if(e.code == "ShiftLeft" || e.code == "ShiftRight") canvas.canvasDragKey = true;
	
});

// Exit canvas mousedrag state when shift is released.
window.addEventListener("keyup", function(e){
	if(canvas.canvasDragKey && (e.code == "ShiftLeft" || e.code == "ShiftRight")) canvas.canvasDragKey = false;
});



// --- Canvas listeners.

// Mouse movement on canvas.
canvas.c.addEventListener('mousemove', function(e){
	canvas.mouseMove(e);
});

// Mouse down on canvas.
canvas.c.addEventListener('mousedown', function(e){
	canvas.mouseDown(e);
});

// Mouse up on canvas.
canvas.c.addEventListener('mouseup', function(){
	canvas.mouseUp();
});

// Mouse leave from canvas.
canvas.c.addEventListener('mouseleave', function(){
	canvas.mouseLeave();
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
document.getElementById("canvasWidth").addEventListener("change", function(){
	canvas.resize()
});

document.getElementById("canvasHeight").addEventListener("change", function(){
	canvas.resize()
});

// Canvas color value change.
document.getElementById("canvasColor").addEventListener("change", function(){
	canvas.colorBG(this.value);
});

// Canvas background image loader.
document.getElementById("canvasFileInput").addEventListener("change", function(){
	canvas.loadBG(this.files[0]);
});

// Canvas background image removal.
document.getElementById("canvasImageRemove").addEventListener("click", function(){
	canvas.removeBG();
});

// Canvas background image stretch toggle.
document.getElementById("canvasBgScale").addEventListener("click", function(){
	canvas.stretchBG(this.checked);
});

// Turn canvas into image.
document.getElementById("imageCreate").addEventListener("click", function(){
	canvas.makeImage();
});



// --- Form listeners: item manager.

// Add new text item.
document.getElementById("addTextItem").addEventListener("click", function(){
	let item = new TextItem(Math.round(canvas.canvasViewX + canvas.c.width / 2), Math.round(canvas.canvasViewY + canvas.c.height / 2));
	item.name = "Teksti_" + canvas.runningCount++;
	canvas.canvasItems.push(item);
	repopulateDropdown();
	Item.selectItem(canvas.canvasItems.length - 1);
});

// Add new image item.
document.getElementById("addImageItem").addEventListener("click", function(){
	let item = new ImageItem(Math.round(canvas.canvasViewX + canvas.c.width / 2), Math.round(canvas.canvasViewY + canvas.c.height / 2));
	item.name = "Kuva_" + canvas.runningCount++;
	canvas.canvasItems.push(item);
	repopulateDropdown();
	Item.selectItem(canvas.canvasItems.length - 1);
});

// Item selection from dropdown.
document.getElementById("itemSelect").addEventListener("change", function(){
	Item.selectItem(this.value);
});

// Move item up in z-order.
// Ordering changes work by repositioning target in the canvas items array (as their indexed order is considered their z-order)
// and recreating the item dropdown content from new indexed order.
document.getElementById("itemUp").addEventListener("click", function(){
	let selected = parseInt(document.getElementById("itemSelect").value);
	if(selected < canvas.canvasItems.length - 1){
		let moved = canvas.canvasItems.splice(selected, 1);
		canvas.canvasItems.splice(selected + 1, 0, moved[0]);
		canvas.selectedItem = selected + 1;	// Selection was moved to other index position, so update tracker variable.
		repopulateDropdown();
		canvas.draw();
	}
});

// Move item down in z-order.
document.getElementById("itemDown").addEventListener("click", function(){
	let selected = parseInt(document.getElementById("itemSelect").value);
	if(selected > 0){
		let moved = canvas.canvasItems.splice(selected, 1);
		canvas.canvasItems.splice(selected - 1, 0, moved[0]);
		canvas.selectedItem = selected - 1;	// Selection was moved to other index position, so update tracker variable.
		repopulateDropdown();
		canvas.draw();
	}
});

// Remove item.
document.getElementById("itemRemove").addEventListener("click", function(){
	let selected = document.getElementById("itemSelect").value;
	if(selected.trim().length > 0){
		let response = window.confirm("Haluatko poistaa kentän " + canvas.canvasItems[selected].name);
		if(response == true){
			canvas.canvasItems.splice(selected, 1);
			repopulateDropdown();
			Item.selectItem(-1);
		}
	}
});

// Toggle bounding box visibility.
document.getElementById("showBounds").addEventListener("click", function(){
	canvas.itemBounds(this.checked);
});



// --- Form listeners: text item manager.

// Name change.
document.getElementById("textItemName").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setName(this.value);
});

// Content change.
document.getElementById("textItemContent").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setText(this.value);
});

// Font change.
document.getElementById("textItemFont").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setFont(this.value);
});

// Font size change.
document.getElementById("textItemSize").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setSize(this.value);
});

// Font Color change.
document.getElementById("textItemColor").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setTextColor(this.value);
});

// X-position change.
document.getElementById("textItemX").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setPosition();
});

// Y-position change.
document.getElementById("textItemY").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setPosition();
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
	canvas.canvasItems[canvas.selectedItem].setAreaType(this.value);
});

document.getElementById("textItemWidth").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setAreaValues();
});

document.getElementById("textItemHeight").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setAreaValues();
});

// Background draw toggle.
document.getElementById("textItemBackground").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setBackground(this.checked);
});

// Background color change.
document.getElementById("textItemBackgroundColor").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setBackgroundColor(this.value);
});

// Padding width change.
document.getElementById("textItemPadding").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setPadding(this.value);
});

// Border width change.
document.getElementById("textItemBorder").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setBorder(this.value);
});

// Border color change.
document.getElementById("textItemBorderColor").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setBorderColor(this.value);
});

// Roundness change.
document.getElementById("textItemRoundness").addEventListener("input", function(){
	canvas.canvasItems[canvas.selectedItem].setRoundness(this.value);
});



// --- Form listeners: image item manager.

// Name change.
document.getElementById("imageItemName").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setName(this.value);
});

// Image load.
document.getElementById("imageFileInput").addEventListener("change", function(){
	canvas.targetItem = canvas.selectedItem;
	let input = document.getElementById('imageFileInput');
	let file = input.files[0];
	fr = new FileReader();
	fr.onload = () => {
		canvas.canvasItems[canvas.targetItem].image.src = fr.result;
		input.value = '';
	};
	fr.readAsDataURL(file);
});

// X-position change.
document.getElementById("imageItemX").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setPosition();
});

// Y-position change.
document.getElementById("imageItemY").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setPosition();
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
	canvas.canvasItems[canvas.selectedItem].setScalingType(this.value);
});

// Image scale change.
document.getElementById("imageItemScaleRatio").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setScaleRatio(this.value);
});

// Image x-size value change.
document.getElementById("imageItemScaledWidth").addEventListener("change", function(){
	let aspect = canvas.canvasItems[canvas.selectedItem].getAspect();
	if(aspect != -1){
		document.getElementById("imageItemScaledHeight").value = Math.round(this.value / aspect);
	}
	canvas.canvasItems[canvas.selectedItem].setScaleSize();
});

// Image y-size value change.
document.getElementById("imageItemScaledHeight").addEventListener("change", function(){
	let aspect = canvas.canvasItems[canvas.selectedItem].getAspect();
	if(aspect != -1){
		document.getElementById("imageItemScaledWidth").value = Math.round(this.value * aspect);
	}
	canvas.canvasItems[canvas.selectedItem].setScaleSize();
});

document.getElementById("imageItemPreserveAspect").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setPreserveAspect(this.checked);
});


// Background visibility toggle.
document.getElementById("imageItemBackground").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setBackground(this.checked);
});

// Background color change.
document.getElementById("imageItemBackgroundColor").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setBackgroundColor(this.value);
});

// Padding width change.
document.getElementById("imageItemPadding").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setPadding(this.value);
});

// Border width change.
document.getElementById("imageItemBorder").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setBorder(this.value);
});

// Border width change.
document.getElementById("imageItemBorderColor").addEventListener("change", function(){
	canvas.canvasItems[canvas.selectedItem].setBorderColor(this.value);
});

// Border width change.
document.getElementById("imageItemRoundness").addEventListener("input", function(){
	canvas.canvasItems[canvas.selectedItem].setRoundness(this.value);
});
