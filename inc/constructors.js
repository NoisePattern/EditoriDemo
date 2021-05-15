// CLASS CONSTRUCTORS

// Canvas class constructor.
class Canvas {

	constructor(){
		// Canvas variables
		this.c = document.getElementById("editorCanvas");			// Canvas element.
		this.ctx = this.c.getContext("2d");							// Canvas 2D draw context.
		this.canvasWidth = 1000;									// Initial canvas width.
		this.canvasHeight = 600;									// Initial canvas height.
		this.canvasViewX = 0;										// X and Y offsets of visible area. Can be non-zero when canvas is larger than containing div.
		this.canvasViewY = 0;
		this.viewWidth = 1000;										// Width and height of canvas area visible on screen.
		this.viewHeight = 600;
		this.mouseDragX = 0;										// Dragging reference X and Y values.
		this.mouseDragY = 0;
		this.canvasDragKey = false;									// Canvas drag key (shift) has been pressed.
		this.canvasDragging = false;								// Canvas is currently dragged.
		this.colorCanvas = '#f0f0f0';								// Canvas background color.
		this.bgCanvas = new Image();								// Canvas background image.
		this.bgCanvas.onload = () => {								// Callback for canvas background image loaded event.
			this.bgIsLoaded = true;
			this.draw();
		}
		this.bgIsLoaded = false;									// A background image has been loaded.
		this.bgStretch = false;										// Background image is stretched to canvas size.
		
		this.uiWidth = 450;											// Width of tools UI area.

		// Canvas items variables.
		this.canvasItems = [];										// Array of items created to canvas.
		this.selectedItem = -1;										// Currently selected item.
		this.hoveredItem = -1;										// Item that currently has mouse hover.
		this.draggedItem = -1;										// Item that is currently dragged.
		this.targetItem = -1;										// File upload's target item.
		this.runningCount = 1;										// Running counter for item names.
		this.showBounds = true;										// Toggle for drawing item borders.
	}

	// Draw all canvas content.
	draw(){
		// Background color, and background image if set.
		this.ctx.fillStyle = this.colorCanvas;
		this.ctx.fillRect(0, 0, this.c.width, this.c.height);
		if(this.bgIsLoaded){
			if(this.bgStretch){
				this.ctx.drawImage(this.bgCanvas, 0 - this.canvasViewX, 0 - this.canvasViewY, this.canvasWidth, this.canvasHeight);
			} else {
				this.ctx.drawImage(this.bgCanvas, 0 - this.canvasViewX, 0 - this.canvasViewY);
			}
		}
		// Loop through all items (array index order is used as depth order) and run their draw methods.
		this.canvasItems.forEach(function(item, index){
			item.draw(index);
		});
	}

	// Resize canvas.
	resize(){
		this.canvasWidth = parseInt(document.getElementById('canvasWidth').value);		// Get new canvas width setting.
		this.canvasHeight = parseInt(document.getElementById('canvasHeight').value);	// Get new canvas height setting.
		this.viewWidth = window.innerWidth - this.uiWidth;
		this.viewHeight = window.innerHeight;
		let width = this.canvasWidth;
		let height = this.canvasHeight;
		
		// Resize navigation area to same aspect as actual canvas. 
		n.setNavSize();

		// Fit canvas to its div container if wider or taller than the div.
		if(this.viewWidth < width){
			width = this.viewWidth;
		}
		if(this.viewHeight < height){
			height = this.viewHeight;
		}

		// View position must remain within actual canvas region if canvas size has shrunk.
		this.canvasViewX = Math.min(this.canvasViewX, this.canvasWidth - width);
		this.canvasViewY = Math.min(this.canvasViewY, this.canvasHeight - height);

		// Set canvas size. Canvas content has to be redrawn after canvas element receives a new size.
		this.c.width = width;
		this.c.height = height;
		this.draw();
		
		// Update navbox size and position.
		n.setNavBoxSize();
	}

	// Set background color.
	colorBG(_color){
		this.colorCanvas = _color;
		this.draw();
	}
	// Load background image.
	loadBG(_file){
		let fr = new FileReader();
		fr.onload = () => {
			this.bgCanvas.src = fr.result;
		};
		fr.readAsDataURL(_file);

	}
	// Remove background image.
	removeBG(){
		let input = document.getElementById('canvasFileInput');
		input.value = '';
		this.bgCanvas.scr = '';
		this.bgIsLoaded = false;
		this.draw();		
	}
	
	// Switch background image stretch state.
	stretchBG(_stretch){
		this.bgStretch = _stretch;
		this.draw();
	}
	
	// Switch item bounds display state.
	itemBounds(_state){
		this.showBounds = _state;
		this.draw();
	}
	
	// Mousebutton down on canvas.
	mouseDown(e){
		let Pos = getMousePos(canvas.c, e);
		// If shift has been pressed, start dragging canvas.
		if(this.canvasDragKey){
			this.canvasDragging = true;
			this.mouseDragX = Pos.x;
			this.mouseDragY = Pos.y;
		}
		// Otherwise, if there is an item under pointer, make it selected.
		else if(this.hoveredItem != -1){
			Item.selectItem(this.hoveredItem);
			// Selected item is also the item being dragged, until mouse up event fires.
			this.draggedItem = this.hoveredItem;
			this.mouseDragX = Pos.x - this.canvasItems[this.hoveredItem].x;
			this.mouseDragY = Pos.y - this.canvasItems[this.hoveredItem].y;
		}
	}
	
	// Mousebutton up on canvas.
	mouseUp(){
		this.canvasDragging = false;
		this.draggedItem = -1;
	}
	
	// Mousepointer leaves canvas.
	mouseLeave(){
		this.canvasDragging = false;
		this.hoveredItem = -1;
		this.draggedItem = -1;
		this.draw();
	}
	
	// Drag canvas.
	mouseMove(e){
		let Pos = getMousePos(canvas.c, e);
		// If an item is currently dragged.
		if(this.draggedItem != -1){
			// Change item position by amount mouse has moved.
			this.canvasItems[this.draggedItem].move(Pos.x - this.mouseDragX, Pos.y - this.mouseDragY);
		}
		// If no item is dragged.
		else {
			// If canvas mousedrag is on, move canvas view.
			if(this.canvasDragging){
				// Calculate amounts moved from previous move position.
				let DX = this.mouseDragX - Pos.x;
				let DY = this.mouseDragY - Pos.y;
				if(DX != 0 || DY != 0){
					// Move view by calculated delta values.
					this.canvasViewX = Math.max(0, Math.min(this.canvasViewX + DX, this.canvasWidth - this.viewWidth));
					this.canvasViewY = Math.max(0, Math.min(this.canvasViewY + DY, this.canvasHeight - this.viewHeight));
					// Set this position as previous position.
					this.mouseDragX = Pos.x;
					this.mouseDragY = Pos.y;
					// Update navigator dragbox position.
					n.setNavBoxPosition(this.canvasViewX / this.canvasWidth * n.navWidth, this.canvasViewY / this.canvasHeight * n.navHeight);
					this.draw();
				}
			}
			// Otherwise check for hovers.
			else {
				// Loop through all items and find if any is under mouse pointer, select it as hovered.
				let previous = this.hoveredItem;
				this.hoveredItem = -1;
				this.canvasItems.forEach(function(item, index){
					if(item.getHover(Pos.x, Pos.y)) canvas.hoveredItem = index;
				});
				// Redraw canvas if hover state has changed and bounding box drawing is enabled (hovered item must get the correct bounding color).
				if(this.showBounds && previous != this.hoveredItem) this.draw();
			}
		}
	}
	
	makeImage(){
		let overlay = document.getElementById("pageOverlay");
		overlay.style.display = "block";
		// Create temp canvas for draw and set it to full canvas size.
		let c2 = document.createElement("canvas");
		c2.width = this.canvasWidth;
		c2.height = this.canvasHeight;
		// Switch draw context to new canvas.
		this.ctx = c2.getContext("2d");
		// Canvas view offsets are set temporarily to zero because they are for viewable canvas, not the target canvas.
		let tempVX = this.canvasViewX;
		let tempVY = this.canvasViewY;
		// Save boundary setting and turn boundaries off.
		let tempBounds = this.showBounds;
		this.showBounds = false;
		this.canvasViewX = 0;
		this.canvasViewY = 0;
		// Draw and open image in new tab.
		this.draw();

		let newTab = window.open();
		newTab.document.write('<img src="' + c2.toDataURL("image/png") + '">');
		// Set draw context back to real canvas and return view offsets to correct values.
		this.ctx = this.c.getContext("2d");
		this.canvasViewX = tempVX;
		this.canvasViewY = tempVY;
		this.showBounds = tempBounds;
		overlay.style.display = "none";
	}
}



// Navigator class constructor.
//
// Navigator lets users quickly change the canvas view's position on canvas by dragging the visible area indicator around the navigation area.
// The navigation area width and height are always at the same ratio as those of canvas. The draggable navigation box's (navbox) width and
// height in relation to navigation area are always the same as visible canvas area's to the canvas. For example, if the visible canvas area
// is only half the width and height of the whole canvas, the navbox is half the width and height of the navigation area.

class Navigator {

	constructor(){
		this.nav = document.getElementById("navigation");			// Navigation area ID.
		this.navBox = document.getElementById("navigationBox");		// Draggable navigation box (navbox) ID.
		this.navWidth = 150;				// Width of navigation area.
		this.navHeight = 0;					// Height of navigation area.
		this.maxLength = 150;				// Maximum side length of navigation area.
		this.navBoxX = 0;					// Navbox position relative to navigation area.
		this.navBoxY = 0;
		this.navBoxWidth = 0;				// Navbox width.
		this.navBoxHeight = 0;				// Navbox height.
		this.navBoxHover = false;			// Navbox has hover.
		this.navBoxDrag = false;			// Navbox is being moved.
		this.DX = 0;						// Movement delta reference positions when navbox is moving.
		this.DY = 0;
	}

	// Sets navigation area to same aspect ratio as canvas area.
	setNavSize(){
		// If canvas is wider than taller.
		if(canvas.canvasWidth >= canvas.canvasHeight){
			// Set navigation area width to maximum set height to scale.
			this.navWidth = this.maxLength;
			this.navHeight = Math.round((canvas.canvasHeight / canvas.canvasWidth) * this.navWidth);
		}
		// Otherwise canvas is taller than wider.
		else {
			this.navHeight = this.maxLength;
			this.navWidth = Math.round((canvas.canvasWidth / canvas.canvasHeight) * this.navHeight);
		}
		// Set navigation area dimensions.
		this.nav.style.width = this.navWidth.toString() + "px";
		this.nav.style.height = this.navHeight.toString() + "px";
	}

	// Sets navigation box size.
	setNavBoxSize(){
		// Ratio of navbox width and height to nav-area width and height is the same as canvas view's ratio to canvas.
		this.navBoxWidth = Math.round(this.navWidth * (canvas.c.width / canvas.canvasWidth));
		this.navBoxHeight = Math.round(this.navHeight * (canvas.c.height / canvas.canvasHeight));
		this.navBox.style.width = this.navBoxWidth.toString() + "px";
		this.navBox.style.height = this.navBoxHeight.toString() + "px";
		// Also set position. (It likely has changed if something has prompted a size change.)
		this.setNavBoxPosition(Math.round(this.navWidth * canvas.canvasViewX / canvas.canvasWidth), Math.round(this.navHeight * canvas.canvasViewY / canvas.canvasHeight));
	}

	// Sets navigation box position.
	setNavBoxPosition(_x, _y){
		// Min&max the position inside valid region before setting to CSS. (Rounded values may throw it over by a pixel at certain sizes.)
		this.navBoxX = Math.max(0, Math.min(this.navWidth - this.navBoxWidth, _x));
		this.navBoxY = Math.max(0, Math.min(this.navHeight - this.navBoxHeight, _y));
		this.navBox.style.left = this.navBoxX.toString() + "px";
		this.navBox.style.top = this.navBoxY.toString() + "px";
	}
	
	// Start navbox dragging. Called by eventlistener when mouse is pressed down over nav area.
	dragBegin(e){
		this.navBoxDrag = true;
		// Check if mouse is over the draggable navigation box.
		let Pos = getMousePos(this.nav, e);
		let hover = pointInRectangle(Pos.x, Pos.y, this.navBoxX, this.navBoxY, this.navBoxWidth, this.navBoxHeight);
		// If not over, set the reference position to center of the navbox and reposition it under the mouse pointer.
		if(!hover){
			this.DX = this.navBoxWidth / 2;
			this.DY = this.navBoxHeight / 2;
			// Move box under mouse.
			this.setNavBoxPosition(Math.round(Pos.x - this.DX), Math.round(Pos.y - this.DY));
		}
		// If over, set grip position in relation to mouse over navbox.
		else {
			this.DX = Pos.x - this.navBoxX;
			this.DY = Pos.y - this.navBoxY;
		}
	}

	// Drag navbox.
	dragBox(e){
		// If drag action is running.
		if(this.navBoxDrag){
			// New position is mouse position offset by grip position.
			let Pos = getMousePos(n.nav, e);
			this.setNavBoxPosition(Math.round(Pos.x - this.DX), Math.round(Pos.y - this.DY));
			// If horizontal position of navbox is at maximal right position, give maximal right canvas position instead of calculating it.
			if(this.navBoxX == this.navWidth - this.navBoxWidth){
				canvas.canvasViewX = canvas.canvasWidth - canvas.c.width;
			} else {
				canvas.canvasViewX = Math.max(0, Math.min(Math.round(canvas.canvasWidth * this.navBoxX / this.navWidth), canvas.canvasWidth - canvas.c.width));
			}
			// If vertical position of nav dragbox is at maximal bottom position, give maximal canvas bottom position instead of calculating it.
			if(this.navBoxY == this.navWidth - this.navBoxHeight){
				canvas.canvasViewY = canvas.canvasHeight - canvas.c.height;
			} else {
				canvas.canvasViewY = Math.max(0, Math.min(Math.round(canvas.canvasHeight * this.navBoxY / this.navHeight), canvas.canvasHeight - canvas.c.height));
			}
			canvas.draw();
		}
	}
	
	// Ends dragging.
	dragEnd(){
		this.navBoxDrag = false;
	}
}

// Item class base constructor.
class Item {

	constructor(_x = 0, _y = 0){
		this.name = '';												// Name displayed on layer control.
		this.x = _x;												// Item x-position.
		this.y = _y;												// Item y-position.
		this.posX = 0;												// Content area x-position. 
		this.posY = 0;												// Content area y-position.
		this.width = 0;												// Content area width.
		this.height = 0;											// Content area height.
		this.roundness = 0;											// Corner roundness percentage. Roundless of zero draws sharp corners, hundred draws fully round corners.
																	// Actual size is calculated from shorter side. Thus, full roundness turns squares into circles, rectangles into pills.
		this.padding = 0;											// Width of padding in pixels. Padding wraps around content area and uses its color.
		this.background = true;										// Draw background toggle. When set to false content area will be transparent. Also affects padding.
		this.backgroundColor = '#ffffff';							// Content area background color. Padding will use same color.
		this.border = 0;											// Width of border in pixels. Border wraps around padding. Set to zero to draw no border. 
		this.borderColor = '#000000';								// Border color.
		this.colorBorderDefault = 'rgba(0, 0, 0, 0.1)';				// Boundary color default value.
		this.colorBorderHover = 'rgba(0, 0, 0, 0.5)';				// Boundary color when item is hovered.
		this.colorBorderSelected = 'rgba(255, 128, 0, 0.5)';		// Boundary color when item is selected.	}
	}

	// Makes given item selected and runs UI updates accordingly.
	static selectItem(_item){
		// Make given item the currently selected item.
		canvas.selectedItem = _item;
		// Update dropdown selection to this item.
		document.getElementById("itemSelect").value = _item;
		// Display this item's manager panel.
		this.displayItemManager(_item);
		// Draw canvas if bounding boxes are displayed (the correct bounds must now be get the active selection color).
		if(canvas.showBounds) canvas.draw();
	}

	static displayItemManager(_item){
		// If item index has been given, show manager form with its data.
		if(_item >= 0){
			// If item is text item, text item manager is made visible.
			if(canvas.canvasItems[_item].type === 'text'){
				document.getElementById('textItem').style.display = 'block';
				document.getElementById('imageItem').style.display = 'none';
			}
			// If item is image item, image item manager is made visible.
			else if(canvas.canvasItems[_item].type === 'image'){
				document.getElementById('textItem').style.display = 'none';
				document.getElementById('imageItem').style.display = 'block';
			}
			// Have the item send its data to form elements.
			canvas.canvasItems[_item].updateUI();
		}
		// Hide managers.
		else {
			document.getElementById('textItem').style.display = 'none';
			document.getElementById('imageItem').style.display = 'none';
		}
	}
	// Sets base area size. All items define their own function.
	setArea(){
	}

	// Sets item name.
	setName(_name){
		this.name = _name;
		repopulateDropdown();
	}
	
	// Sets item position.
	setPosition(){
		let _x = 0;
		if(this.type === 'text') _x = parseInt(document.getElementById('textItemX').value);
		else if(this.type === 'image') _x = parseInt(document.getElementById('imageItemX').value);
		let _y = 0;
		if(this.type === 'text') _y = parseInt(document.getElementById('textItemY').value);
		else if(this.type === 'image') _y = parseInt(document.getElementById('imageItemY').value);
		this.move(_x, _y);
		
	}

	// Sets background visibility.
	setBackground(_background){
		this.background = _background;
		canvas.draw();
	}

	// Sets background color.
	setBackgroundColor(_color){
		this.backgroundColor = _color;
		canvas.draw();
	}

	// Sets padding size.
	setPadding(_padding){
		this.padding = parseInt(_padding);
		canvas.draw();
	}

	// Sets border size.
	setBorder(_border){
		this.border = parseInt(_border);
		canvas.draw();
	}
	
	// Sets border color.
	setBorderColor(_color){
		this.borderColor = _color;
		canvas.draw();
	}

	// Sets edge roundness.
	setRoundness(_roundness){
		this.roundness = parseInt(_roundness);
		canvas.draw();
	}

	// Checks if given coordinates are inside item's outermost bounds.
	getHover(_x, _y){
		let offset = this.padding + this.border;
		let hover = pointInRectangle(
			_x + canvas.canvasViewX,
			_y + canvas.canvasViewY,
			this.posX - offset,
			this.posY - offset,
			this.width + offset * 2 - 1,
			this.height + offset * 2 - 1
		);
		return hover;
	}

	// Sets item to given coordinate location.
	move(_x, _y){
		this.x = _x;
		this.y = _y;
		this.setArea();
		this.updateUI();
		canvas.draw();
	}

	// Draws background to cover base area and padding.
	drawBackground(){
		if(this.background){
			// If corners are rounded, save canvas state and clip draw area.
			if(this.roundness > 0){
				canvas.ctx.save();
				let path = this.createRoundedPath(this.padding);
				canvas.ctx.clip(path);
			}
			canvas.ctx.fillStyle = this.backgroundColor;
			canvas.ctx.fillRect(this.posX - this.padding - canvas.canvasViewX, this.posY - this.padding - canvas.canvasViewY, this.width + this.padding * 2, this.height + this.padding * 2);
			// Restore canvas state.
			if(this.roundness > 0){
				canvas.ctx.restore();
			}
		}
	}

	// Calculate a rounded clip to use in draw operations.
	createRoundedPath(_offset){
		let radius = Math.min(this.width / 2, this.height / 2) * (this.roundness / 100);
		let path = new Path2D();
		path.moveTo(this.posX - canvas.canvasViewX + radius, this.posY - canvas.canvasViewY - _offset);
		path.lineTo(this.posX - canvas.canvasViewX + this.width - radius, this.posY - canvas.canvasViewY - _offset);
		path.arcTo(this.posX - canvas.canvasViewX + this.width + _offset, this.posY - canvas.canvasViewY - _offset, this.posX - canvas.canvasViewX + this.width + _offset, this.posY - canvas.canvasViewY + radius, Math.max(0, radius + _offset));
		path.lineTo(this.posX - canvas.canvasViewX + this.width + _offset, this.posY - canvas.canvasViewY + this.height - radius);
		path.arcTo(this.posX - canvas.canvasViewX + this.width + _offset, this.posY - canvas.canvasViewY + this.height + _offset, this.posX - canvas.canvasViewX + this.width - radius, this.posY - canvas.canvasViewY + this.height + _offset, Math.max(0, radius + _offset));
		path.lineTo(this.posX - canvas.canvasViewX + radius, this.posY - canvas.canvasViewY + this.height + _offset);
		path.arcTo(this.posX - canvas.canvasViewX - _offset, this.posY - canvas.canvasViewY + this.height + _offset, this.posX - canvas.canvasViewX - _offset, this.posY - canvas.canvasViewY + this.height - radius, Math.max(0, radius + _offset));
		path.lineTo(this.posX - canvas.canvasViewX - _offset, this.posY - canvas.canvasViewY + radius);
		path.arcTo(this.posX - canvas.canvasViewX - _offset, this.posY - canvas.canvasViewY - _offset, this.posX - canvas.canvasViewX + radius, this.posY - canvas.canvasViewY - _offset, Math.max(0, radius + _offset));
		return path;
	}

	// Draws border outside a region defined by base area and padding.
	drawBorder(){
		if(this.border > 0){
			canvas.ctx.beginPath();
			canvas.ctx.strokeStyle = this.borderColor;
			canvas.ctx.lineWidth = this.border;
			// Canvas linedraw operation wants the line's middle position as coordinates, so the correct position to draw is half the border's width, plus padding.
			let adjust = this.padding + this.border / 2 - 1;
			// Calculate radius for rounded corners.
			let radius = 0;
			if(this.roundness > 0) radius = Math.min(this.width / 2, this.height / 2) * (this.roundness / 100);
			
			if(radius > 0){
				var path = this.createRoundedPath(adjust);
			} else {
				var path = new Path2D();
				path.moveTo(this.posX - adjust - this.border / 2 - canvas.canvasViewX, this.posY - adjust - canvas.canvasViewY);
				path.lineTo(this.posX + this.width + adjust - canvas.canvasViewX, this.posY - adjust - canvas.canvasViewY);
				path.lineTo(this.posX + this.width + adjust - canvas.canvasViewX, this.posY + this.height + adjust - canvas.canvasViewY);
				path.lineTo(this.posX - adjust - canvas.canvasViewX, this.posY + this.height + adjust - canvas.canvasViewY);
				path.lineTo(this.posX - adjust - canvas.canvasViewX, this.posY - adjust - canvas.canvasViewY);
			}
			canvas.ctx.stroke(path);
		}
	}

	// Draws highlight boundary around hovered or selected item.
	drawBounds(_index){
		if(canvas.showBounds){
			canvas.ctx.lineWidth = 2;
			if(canvas.selectedItem == _index) canvas.ctx.strokeStyle = this.colorBorderSelected;
			else if(canvas.hoveredItem == _index){
				canvas.ctx.strokeStyle = this.colorBorderHover;
			}
			else canvas.ctx.strokeStyle = this.colorBorderDefault;
			canvas.ctx.strokeRect(
				this.posX - this.padding - this.border - 1 - canvas.canvasViewX,
				this.posY - this.padding - this.border - 1 - canvas.canvasViewY,
				this.width + (this.padding + this.border) * 2 + 2,
				this.height + (this.padding + this.border) * 2 + 2
			);
		}
	}
}

// Image item class.
class ImageItem extends Item {

	constructor(_x = 0, _y = 0){
		super(_x, _y);
		this.type = "image";
		this.scaling = 0;				// Scaling types: 0 = original, 1 = percentage, 2 = manual size.
		this.scaleRatio = 100;			// If percentage scaling is used, current scaling ratio.
		this.scaledWidth = 0;			// If manual size scaling is used, scaled width.
		this.scaledHeight = 0;			// If manual size scaling is used, scaled height.
		this.preserveAspect = false;	// When using manual size scaling, preservation of image aspect ratio.
		this.width = 100;				// Unscaled width.
		this.height = 100;				// Unscaled height.
		this.hasImage = false;
		this.image = new Image();
		this.image.src = defaultImage;
		this.image.onload = () => {		// When image is set, use onload callback to calculate area size and update canvas.
			this.hasImage = true;
			this.scaling = 0;
			this.setArea(true);
			this.updateUI();
			canvas.draw();
		};
	}

	// Sets item data to form.
	updateUI(){
		document.getElementById('imageItemName').value = this.name;
		document.getElementById('imageItemX').value = this.x;
		document.getElementById('imageItemY').value = this.y;
		document.getElementById('imageItemSizeType').value = this.scaling;
		document.getElementById('imageItemScaleRatio').value = this.scaleRatio;
		document.getElementById('imageItemScaledWidth').value = this.scaledWidth;
		document.getElementById('imageItemScaledHeight').value = this.scaledHeight;
		document.getElementById('imageItemPreserveAspect').checked = this.preserveAspect;
		let newheight = 0;
		if(this.scaling == 0){
			document.getElementById("imageItemSizeManual").style.display = "none";
			document.getElementById("imageItemSizeScaled").style.display = "none";
		}
		else if(this.scaling == 1){
			document.getElementById("imageItemSizeManual").style.display = "none";
			document.getElementById("imageItemSizeScaled").style.display = "flex";
			newheight = document.getElementById("imageItemSizeScaled").offsetHeight;
		}
		else if(this.scaling == 2){
			document.getElementById("imageItemSizeManual").style.display = "flex";
			document.getElementById("imageItemSizeScaled").style.display = "none";
			newheight = document.getElementById("imageItemSizeManual").offsetHeight;
		}
		document.getElementById("imageItemResizer").style.height = newheight.toString() + "px";
		document.getElementById('imageItemBackground').checked = this.background;
		document.getElementById('imageItemBackgroundColor').value = this.backgroundColor;
		document.getElementById('imageItemPadding').value = this.padding;
		document.getElementById('imageItemBorder').value = this.border;
		document.getElementById('imageItemBorderColor').value = this.borderColor;
		document.getElementById('imageItemRoundness').value = this.roundness;
	}

	// Get image aspect ratio.
	getAspect(){
		if(!this.preserveAspect) return -1;
		else return this.image.width / this.image.height;
	}
	
	// Set new image.
	setImage(_image){
		this.image.src = _image;		// Setting .src executes onload() which has a callback with a drawCanvas() to update displayed image.
	}

	// Calculate area size.
	setArea(_Init = false){
		// Images do not have overflow, so their content area coordinates equal item coordinates.
		this.posX = this.x;
		this.posY = this.y;
		if(this.hasImage == true){
			// No scaling: area equals image size.
			if(this.scaling == 0){
				this.width = this.image.width;
				this.height = this.image.height;
				if(_Init){
					this.scaledWidth = this.width;
					this.scaledHeight = this.height;
				}
			}
			// Percentage scaling: area equals image size times scale ratio.
			else if(this.scaling == 1){
				this.width = Math.round(this.image.width * (this.scaleRatio / 100));
				this.height = Math.round(this.image.height * (this.scaleRatio / 100));
			}
			// Manual scaling: area equals user input values.
			else if(this.scaling == 2){
				this.width = this.scaledWidth;
				this.height = this.scaledHeight;
			}
		}
	}

	// Set scaling type.
	setScalingType(_type){
		this.scaling = _type;
		this.setArea();
		canvas.draw();
	}

	// Set scaling ratio.
	setScaleRatio(_scaleRatio){
		this.scaleRatio = _scaleRatio;
		this.setArea();
		this.updateUI();
		canvas.draw();
	}

	// Set manual scale.
	setScaleSize(){
		this.scaledWidth = Math.round(document.getElementById("imageItemScaledWidth").value);
		this.scaledHeight = Math.round(document.getElementById("imageItemScaledHeight").value);
		this.setArea();
		canvas.draw();
	}
	
	// Toggle aspect ratio preservation.
	setPreserveAspect(_value){
		this.preserveAspect = _value;
		if(_value == true){
			// TODO: recalculate either width or height, depending which one is currently stretched.
			// -> if image is too wide, recalculate width to aspect.
			// -> if image is too tall, recalculate height to aspect.
			if(this.scaledWidth / this.scaledHeight >= this.getAspect()){
				this.scaledWidth = Math.round(this.getAspect() * this.scaledHeight);
			} else {
				this.scaledHeight = Math.round(this.scaledWidth / this.getAspect());
			}
		}
		this.setArea();
		this.updateUI();
		canvas.draw();
		
	}

	// Draw item to canvas.
	draw(_index){
		this.drawBackground();
		this.drawBorder();
		// If corners are rounded save canvas state and create clip area.
		if(this.roundness > 0){
			canvas.ctx.save();
			let path = this.createRoundedPath(0);
			canvas.ctx.clip(path);
		}
		// If image is drawn at original size.
		if(this.scaling == 0){
			canvas.ctx.drawImage(this.image, this.x - canvas.canvasViewX, this.y - canvas.canvasViewY);
		}
		// If image is drawn with percentage scaling.
		else if(this.scaling == 1){
			canvas.ctx.drawImage(this.image, this.x - canvas.canvasViewX, this.y - canvas.canvasViewY, this.image.width * (this.scaleRatio / 100), this.image.height * (this.scaleRatio / 100));
		}
		// If image is drawn with manual scaling.
		else if(this.scaling == 2){
			canvas.ctx.drawImage(this.image, this.x - canvas.canvasViewX, this.y - canvas.canvasViewY, this.scaledWidth, this.scaledHeight);
		}
		// Restore canvas.
		if(this.roundness > 0){
			canvas.ctx.restore();
		}
		this.drawBounds(_index);
	}
}

// Text item class.
class TextItem extends Item {

	constructor( _x, _y, _text = ['(ei tekstiä)'], _font = 'Arial', _fontSize = '20', _color = '#000000'){
		super(_x, _y);
		this.type = "text";
		this.font = _font;
		this.fontSize = _fontSize;
		this.textColor = _color;
		this.lineSpacing = Math.round(_fontSize * 0.25);
		this.align = 0;											// Set from dropdown: 0 = left, 1 = centered, 2 = right.
		this.areaType = 0;										// Set from dropdown: 0 = automatic sizing, 1 = locked to user-input dimensions.
		this.text = _text;										// Each line of text is an array entry.
		this.setArea();
		canvas.draw();
	}

	// Sets item data to form.
	updateUI(){
		document.getElementById('textItemName').value = this.name;
		document.getElementById('textItemContent').value = this.text.join("\r\n");
		// Resize textarea to this textitem's text content and reset horizontal scroll to left edge.
		this.setTextarea(document.getElementById('textItemContent'));
		document.getElementById('textItemContent').scrollLeft = 0;
		document.getElementById('textItemFont').value = this.font;
		document.getElementById('textItemSize').value = this.fontSize;
		document.getElementById('textItemColor').value = this.textColor;
		document.getElementById('textItemLineSpacing').value = this.lineSpacing;
		document.getElementById('textItemAlign').value = this.align;
		document.getElementById('textItemX').value = this.x;
		document.getElementById('textItemY').value = this.y;
		document.getElementById('textItemAreaType').value = this.areaType;
		let newheight = 0;
		if(this.areaType == 0){
			document.getElementById('textItemAreaManual').style.display = "none";
		} else if(this.areaType == 1){
			document.getElementById('textItemAreaManual').style.display = "flex";
			newheight = document.getElementById('textItemAreaManual').offsetHeight;
		}
		document.getElementById('textItemResizer').style.height = newheight.toString() + "px";
		document.getElementById('textItemWidth').value = this.width;
		document.getElementById('textItemHeight').value = this.height;
		document.getElementById('textItemBackground').checked = this.background;
		document.getElementById('textItemBackgroundColor').value = this.backgroundColor;
		document.getElementById('textItemPadding').value = this.padding;
		document.getElementById('textItemBorder').value = this.border;
		document.getElementById('textItemBorderColor').value = this.borderColor;
		document.getElementById('textItemRoundness').value = this.roundness;
	}

	// Sets textarea element's height to contained text's height.
	setTextarea(_area){
		// Get pixel widths of textarea's top and bottom borders.
		let borderTop = parseInt(getComputedStyle(_area).borderTopWidth.slice(0, -2));
		let borderBottom = parseInt(getComputedStyle(_area).borderBottomWidth.slice(0, -2));
		// Set height first to 1px.
		_area.style.height = "1px";
		// Get the larger of minimum height and height of content (total text content height plus paddding) and set it as textarea height.
		let height = Math.max(115, _area.scrollHeight);
		_area.style.height = height + "px";
		// If height of content is still larger than client height (content that is visible inside the element) it means either the borders or a horizontal scrollbar
		// neither of which is part of scrollHeight are eating textarea height and obstructing content. Add the difference between content height and visible height
		// to textarea height so all text is made visible.
		if(_area.scrollHeight - _area.clientHeight > 0){
			let extra = (_area.scrollHeight - _area.clientHeight) + borderTop + borderBottom;
			_area.style.height = (height + extra) + "px";
		}
	}

	// Calculate item area size.
	setArea(){
		// If area is set to automatic resize.
		if(this.areaType == 0){
			// Get text measurements and update area.
			canvas.ctx.font = this.fontSize + "px " + this.font;
			canvas.ctx.textBaseline = "top";
			this.posX = this.x;
			this.width = 0;
			this.height = 0;
			// Loop through each line of text and update width and height values.
			this.text.forEach((line, index) => {
				let measures = canvas.ctx.measureText(line);
				if(this.width < Math.round(measures.width)) this.width = Math.round(measures.width);
				if(index == 0) this.posY = this.y - Math.abs(measures.actualBoundingBoxAscent);
				this.height += parseInt(this.fontSize);
				if(index < this.text.length - 1) this.height += this.lineSpacing;
			});
			// Add some extra to height so font descenders remain inside the box.
			this.height += parseInt(this.fontSize) * 0.2;
		}
		// If area is locked to manually input size.
		else if(this.areaType == 1){
			let measures = canvas.ctx.measureText(this.text[0]);
			this.posX = this.x;
			this.posY = this.y - Math.abs(measures.actualBoundingBoxAscent);
			this.width = Math.round(document.getElementById("textItemWidth").value);
			this.height = Math.round(document.getElementById("textItemHeight").value);
		}
	}

	// Set area type.
	setAreaType(_type){
		this.areaType = _type;
		this.setArea();
		canvas.draw();
	}
	
	// Set area values.
	setAreaValues(){
		this.setArea();
		canvas.draw();
	}

	// Set contained text.
	setText(_text){
		// Split text into an array at linefeeds.
		this.text = _text.split(/\r?\n/);
		this.setArea();
		this.updateUI();
		canvas.draw();
	}

	// Set font.
	setFont(_font){
		this.font = _font;
		this.setArea();
		this.updateUI();
		canvas.draw();
	}
	
	// Set text size.
	setSize(_size){
		this.fontSize = parseInt(_size);
		this.setArea();
		this.updateUI();
		canvas.draw();
	}

	// Set text color.
	setTextColor(_color){
		this.textColor = _color;
		canvas.draw();
	}
	
	// Set linespacing.
	setLineSpacing(_lineSpacing){
		this.lineSpacing = parseInt(_lineSpacing);
		this.setArea();
		this.updateUI();
		canvas.draw();
	}

	// Set text alignment.
	setAlign(_align){
		this.align = parseInt(_align);
		canvas.draw();
	}
	
	// Draw item to canvas.
	draw(_index){
		this.drawBackground();
		this.drawBorder();
		this.drawBounds(_index);

		// Draw text content. Set context font and color according to this textitem.
		canvas.ctx.textBaseline = "top";
		canvas.ctx.font = this.fontSize + "px " + this.font;
		canvas.ctx.fillStyle = this.textColor;
		// Loop through all text lines.
		this.text.forEach((line, index) => {
			// If text is left-aligned.
			if(this.align == 0){
				canvas.ctx.textAlign = "left";
				canvas.ctx.fillText(line, this.x - canvas.canvasViewX, this.y - canvas.canvasViewY + index * (parseInt(this.fontSize) + this.lineSpacing));
			}
			// If text is center-aligned.
			else if(this.align == 1){
				canvas.ctx.textAlign = "center";
				canvas.ctx.fillText(line, this.x - canvas.canvasViewX + Math.round(this.width / 2), this.y - canvas.canvasViewY + index * (parseInt(this.fontSize) + this.lineSpacing));
			}
			// If text is right-aligned.
			else if(this.align == 2){
				canvas.ctx.textAlign = "right";
				canvas.ctx.fillText(line, this.x - canvas.canvasViewX + this.width, this.y - canvas.canvasViewY + index * (parseInt(this.fontSize) + this.lineSpacing));
			}
		});
	}
}
