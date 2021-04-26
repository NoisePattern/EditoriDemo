// CLASS CONSTRUCTORS

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
		this.navBoxX = 0;					// Navbox position relative to navigation area.
		this.navBoxY = 0;
		this.navBoxWidth = 0;				// Navbox width.
		this.navBoxHeight = 0;				// Navbox height.
		this.navBoxHover = false;			// Navbox has hover.
		this.navBoxDrag = false;			// Navbox is being moved.
		this.DX = 0;						// Movement delta reference positions when navbox is moving.
		this.DY = 0;
	}

	// Sets navigation area size.
	setNavSize(){
		this.nav.style.width = this.navWidth.toString() + "px";
		// Calculate height by scaling it from area width by canvas' aspect ratio.
		this.navHeight = Math.round((canvasHeight / canvasWidth) * this.navWidth);
		this.nav.style.height = this.navHeight.toString() + "px";
	}

	// Sets navigation box size.
	setNavBoxSize(){
		// Ratio of navbox width and height to nav-area width and height is the same as canvas view's ratio to canvas.
		this.navBoxWidth = Math.round(this.navWidth * (c.width / canvasWidth));
		this.navBoxHeight = Math.round(this.navHeight * (c.height / canvasHeight));
		this.navBox.style.width = this.navBoxWidth.toString() + "px";
		this.navBox.style.height = this.navBoxHeight.toString() + "px";
		// Also set position. (It likely has changed if something has prompted a size change.)
		this.setNavBoxPosition(Math.round(this.navWidth * canvasViewX / canvasWidth), Math.round(this.navHeight * canvasViewY / canvasHeight));
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
			console.log("MX: " + Pos.x.toString() + " MY: " + Pos.y.toString());
			this.DX = this.navBoxWidth / 2;
			this.DY = this.navBoxHeight / 2;
			console.log("DX:" + this.DX.toString() + " DY: " + this.DY.toString());
			// Move box under mouse.
			this.setNavBoxPosition(Math.round(Pos.x - this.DX), Math.round(Pos.y - this.DY));
		}
		// If over, set grip position in relation to mouse over navbox.
		else {
			this.DX = Pos.x - this.navBoxX;
			this.DY = Pos.y - this.navBoxY;
			console.log("DX:" + this.DX.toString() + " DY: " + this.DY.toString());
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
				canvasViewX = canvasWidth - c.width;
			} else {
				canvasViewX = Math.max(0, Math.min(Math.round(canvasWidth * this.navBoxX / this.navWidth), canvasWidth - c.width));
			}
			// If vertical position of nav dragbox is at maximal bottom position, give maximal canvas bottom position instead of calculating it.
			if(this.navBoxY == this.navWidth - this.navBoxHeight){
				canvasViewY = canvasHeight - c.height;
			} else {
				canvasViewY = Math.max(0, Math.min(Math.round(canvasHeight * this.navBoxY / this.navHeight), canvasHeight - c.height));
			}
			drawCanvas();
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
		this.name = '';						// Name displayed on layer control.
		this.x = _x;						// Item x-position.
		this.y = _y;						// Item y-position.
		this.posX = 0;						// Content area x-position. 
		this.posY = 0;						// Content area y-position.
		this.width = 0;						// Content area width.
		this.height = 0;					// Content area height.
		this.roundness = 0;					// Corner roundness percentage. Roundless of zero draws sharp corners, hundred draws fully round corners.
											// Actual size is calculated from shorter side. Thus, full roundness turns squares into circles, rectangles into pills.
		this.padding = 0;					// Width of padding in pixels. Padding wraps around content area and uses its color.
		this.background = true;				// Draw background toggle. When set to false content area will be transparent. Also affects padding.
		this.backgroundColor = '#ffffff';	// Content area background color. Padding will use same color.
		this.border = 0;					// Width of border in pixels. Border wraps around padding. Set to zero to draw no border. 
		this.borderColor = '#000000';		// Border color.
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
		drawCanvas();
	}

	// Sets background color.
	setBackgroundColor(_color){
		console.log(_color);
		this.backgroundColor = _color;
		drawCanvas();
	}

	// Sets padding size.
	setPadding(_padding){
		this.padding = parseInt(_padding);
		drawCanvas();
	}

	// Sets border size.
	setBorder(_border){
		this.border = parseInt(_border);
		drawCanvas();
	}
	
	// Sets border color.
	setBorderColor(_color){
		this.borderColor = _color;
		drawCanvas();
	}

	// Sets edge roundness.
	setRoundness(_roundness){
		this.roundness = parseInt(_roundness);
		drawCanvas();
	}

	// Checks if given coordinates are inside item's outermost bounds.
	getHover(_x, _y){
		let offset = this.padding + this.border;
		let hover = pointInRectangle(
			_x + canvasViewX,
			_y + canvasViewY,
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
		drawCanvas();
	}

	// Draws background to cover base area and padding.
	drawBackground(){
		if(this.background){
			// If corners are rounded, save canvas state and clip draw area.
			if(this.roundness > 0){
				ctx.save();
				let path = this.createRoundedPath(this.padding);
				ctx.clip(path);
			}
			ctx.fillStyle = this.backgroundColor;
			ctx.fillRect(this.posX - this.padding - canvasViewX, this.posY - this.padding - canvasViewY, this.width + this.padding * 2, this.height + this.padding * 2);
			// Restore canvas state.
			if(this.roundness > 0){
				ctx.restore();
			}
		}
	}

	// Calculate a rounded clip to use in draw operations.
	createRoundedPath(_offset){
		let radius = Math.min(this.width / 2, this.height / 2) * (this.roundness / 100);
		let path = new Path2D();
		path.moveTo(this.posX - canvasViewX + radius, this.posY - canvasViewY - _offset);
		path.lineTo(this.posX - canvasViewX + this.width - radius, this.posY - canvasViewY - _offset);
		path.arcTo(this.posX - canvasViewX + this.width + _offset, this.posY - canvasViewY - _offset, this.posX - canvasViewX + this.width + _offset, this.posY - canvasViewY + radius, Math.max(0, radius + _offset));
		path.lineTo(this.posX - canvasViewX + this.width + _offset, this.posY - canvasViewY + this.height - radius);
		path.arcTo(this.posX - canvasViewX + this.width + _offset, this.posY - canvasViewY + this.height + _offset, this.posX - canvasViewX + this.width - radius, this.posY - canvasViewY + this.height + _offset, Math.max(0, radius + _offset));
		path.lineTo(this.posX - canvasViewX + radius, this.posY - canvasViewY + this.height + _offset);
		path.arcTo(this.posX - canvasViewX - _offset, this.posY - canvasViewY + this.height + _offset, this.posX - canvasViewX - _offset, this.posY - canvasViewY + this.height - radius, Math.max(0, radius + _offset));
		path.lineTo(this.posX - canvasViewX - _offset, this.posY - canvasViewY + radius);
		path.arcTo(this.posX - canvasViewX - _offset, this.posY - canvasViewY - _offset, this.posX - canvasViewX + radius, this.posY - canvasViewY - _offset, Math.max(0, radius + _offset));
		return path;
	}

	// Draws border outside a region defined by base area and padding.
	drawBorder(){
		if(this.border > 0){
			ctx.beginPath();
			ctx.strokeStyle = this.borderColor;
			ctx.lineWidth = this.border;
			// Canvas linedraw operation wants the line's middle position as coordinates, so the correct position to draw is half the border's width, plus padding.
			let adjust = this.padding + this.border / 2 - 1;
			// Calculate radius for rounded corners.
			let radius = 0;
			if(this.roundness > 0) radius = Math.min(this.width / 2, this.height / 2) * (this.roundness / 100);
			
			if(radius > 0){
				var path = this.createRoundedPath(adjust);
			} else {
				var path = new Path2D();
				path.moveTo(this.posX - adjust - this.border / 2 - canvasViewX, this.posY - adjust - canvasViewY);
				path.lineTo(this.posX + this.width + adjust - canvasViewX, this.posY - adjust - canvasViewY);
				path.lineTo(this.posX + this.width + adjust - canvasViewX, this.posY + this.height + adjust - canvasViewY);
				path.lineTo(this.posX - adjust - canvasViewX, this.posY + this.height + adjust - canvasViewY);
				path.lineTo(this.posX - adjust - canvasViewX, this.posY - adjust - canvasViewY);
			}
			ctx.stroke(path);
		}
	}

	// Draws highlight boundary around hovered or selected item.
	drawBounds(_index){
		if(showBounds){
			ctx.lineWidth = 2;
			if(selectedItem == _index) ctx.strokeStyle = colorBorderSelected;
			else if(hoveredItem == _index) ctx.strokeStyle = colorBorderHover;
			else ctx.strokeStyle = colorBorderDefault;
			ctx.strokeRect(
				this.posX - this.padding - this.border - 1 - canvasViewX,
				this.posY - this.padding - this.border - 1 - canvasViewY,
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
			drawCanvas();
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
		drawCanvas();
	}

	// Set scaling ratio.
	setScaleRatio(_scaleRatio){
		this.scaleRatio = _scaleRatio;
		this.setArea();
		this.updateUI();
		drawCanvas();
	}

	// Set manual scale.
	setScaleSize(){
		this.scaledWidth = Math.round(document.getElementById("imageItemScaledWidth").value);
		this.scaledHeight = Math.round(document.getElementById("imageItemScaledHeight").value);
		this.setArea();
		drawCanvas();
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
		drawCanvas();
		
	}

	// Draw item to canvas.
	draw(_index){
		this.drawBackground();
		this.drawBorder();
		// If corners are rounded save canvas state and create clip area.
		if(this.roundness > 0){
			ctx.save();
			let path = this.createRoundedPath(0);
			ctx.clip(path);
		}
		// If image is drawn at original size.
		if(this.scaling == 0){
			ctx.drawImage(this.image, this.x - canvasViewX, this.y - canvasViewY);
		}
		// If image is drawn with percentage scaling.
		else if(this.scaling == 1){
			ctx.drawImage(this.image, this.x - canvasViewX, this.y - canvasViewY, this.image.width * (this.scaleRatio / 100), this.image.height * (this.scaleRatio / 100));
		}
		// If image is drawn with manual scaling.
		else if(this.scaling == 2){
			ctx.drawImage(this.image, this.x - canvasViewX, this.y - canvasViewY, this.scaledWidth, this.scaledHeight);
		}
		// Restore canvas.
		if(this.roundness > 0){
			ctx.restore();
		}
		this.drawBounds(_index);
	}
}

// Text item class.
class TextItem extends Item {

	constructor( _x, _y, _text = '(ei tekstiä)', _font = 'Arial', _fontSize = '20', _color = '#000000'){
		super(_x, _y);
		this.type = "text";
		this.font = _font;
		this.fontSize = _fontSize;
		this.textColor = _color;
		this.areaType = 0;
		this.setText(_text);
	}

	// Sets item data to form.
	updateUI(){
		document.getElementById('textItemName').value = this.name;
		document.getElementById('textItemContent').value = this.text;
		document.getElementById('textItemFont').value = this.font;
		document.getElementById('textItemSize').value = this.fontSize;
		document.getElementById('textItemColor').value = this.textColor;
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

	// Calculate item area size.
	setArea(){
		// If area is set to automatic resize.
		if(this.areaType == 0){
			// Get text measurements and update area.
			ctx.font = this.fontSize + "px " + this.font;
			ctx.textBaseline = "top";
			this.measures = ctx.measureText(this.text);
			this.posX = this.x;
			this.posY = this.y - Math.abs(this.measures.actualBoundingBoxAscent);
			this.width = Math.round(this.measures.width);
			this.height = Math.round(Math.abs(this.measures.actualBoundingBoxDescent) + Math.abs(this.measures.actualBoundingBoxAscent));
		}
		// If area is locked to manually input size.
		else if(this.areaType == 1){
			this.posX = this.x;
			this.posY = this.y - Math.abs(this.measures.actualBoundingBoxAscent);
			this.width = Math.round(document.getElementById("textItemWidth").value);
			this.height = Math.round(document.getElementById("textItemHeight").value);
		}
	}

	// Set area type.
	setAreaType(_type){
		this.areaType = _type;
		this.setArea();
		drawCanvas();
	}
	
	// Set area values.
	setAreaValues(){
		this.setArea();
		drawCanvas();
	}

	// Set contained text.
	setText(_text){
		this.text = _text;
		this.setArea();
		this.updateUI();
		drawCanvas();
	}

	// Set font.
	setFont(_font){
		this.font = _font;
		this.setArea();
		this.updateUI();
		drawCanvas();
	}
	
	// Set text size.
	setSize(_size){
		this.fontSize = parseInt(_size);
		this.setArea();
		this.updateUI();
		drawCanvas();
	}
	
	// Set text color.
	setTextColor(_color){
		this.textColor = _color;
		drawCanvas();
	}

	// Draw item to canvas.
	draw(_index){
		this.drawBackground();
		this.drawBorder();
		this.drawBounds(_index);

		// Draw text content.
		ctx.textBaseline = "top";
		ctx.font = this.fontSize + "px " + this.font;
		ctx.fillStyle = this.textColor;
		ctx.fillText(this.text, this.x - canvasViewX, this.y - canvasViewY);
		//ctx.globalAlpha = 1;
	}
}
