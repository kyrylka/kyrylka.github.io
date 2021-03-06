(function(w,d){
    
    // object which holds the info about the absract cords of the gameField
    class Tile {
        constructor(x, y){
            this.x = x;
            this.y = y;
			this.occupied = false;
			this.associatedBlock = {};
        }

        changeOccupation(){
            if(this.occupied===true){
                this.occupied=false;
            }else{
                this.occupied=true;
            }
		}
		
		associateBlock(block){
			this.associatedBlock = block;
		}

		deAssociateBlock(){
			this.associatedBlock = {};
		}
    } 
    
    // object which renders the elements on the screen

    class HtmlConstructor{
        constructor(type){
            this.visual = d.createElementNS('http://www.w3.org/2000/svg', type);                        
        }

        setElemAttributes(attrs){
            for(var keys in attrs){
				if(keys==='image'){
					this.visual.setAttributeNS('http://www.w3.org/1999/xlink', 'href', attrs[keys]);	
				}else{
                	this.visual.setAttribute(keys, attrs[keys]);
				}
			}
        }

        displayElement(parent){
			this.parent = parent;         
            if(typeof parent.visual != "undefined"){
                parent.visual.append(this.visual);
            }else if(typeof parent!= "undefined"){
                parent.append(this.visual);
            }else{
                throw "Parent is not defined";   
            }            
        }
	}
	class Text extends HtmlConstructor{
		constructor(text){
			super('text');
			this.visual.innerHTML = text;
		}

		changeText(text){
			this.visual.innerHTML = text;
		}
	}
    class GameField extends HtmlConstructor{
        constructor(){
			super('svg');
			// field size atributes
			this.fieldWidth = 10;
			this.fieldHeight = 24;
			this.setElemAttributes({'viewBox':'-3 -3 180 245'});
			// Tiles containers
			this.tiles = new Array(this.fieldWidth);
			for(var i=0; i<this.fieldWidth; i++){
				this.tiles[i]=new Array(this.fieldHeight);
			}			
            for(var i=0; i<this.fieldWidth; i++){
                for(var j=0; j<this.fieldHeight; j++){
					this.tiles[i][j]= new Tile((10*i),(10*j));
				}
			}
			// here the user interface would be created
			const borders = new HtmlConstructor('rect');			
			borders.setElemAttributes({'x':-1, 'y':-1, 'width':this.fieldWidth*10+1, 'height': this.fieldHeight*10+1, 'style':'stroke: black; fill:none;'});
			borders.displayElement(this.visual);
			const pointsText = new Text('Score:');
			pointsText.setElemAttributes({'x': 105, 'y':11, 'style': 'font:8px sans-serif'});
			pointsText.displayElement(this.visual);
			const pointsCounter = new Text('00000');
			pointsCounter.setElemAttributes({'x': 130, 'y':11, 'style': 'font:8px sans-serif;',  'id':'points'});
			pointsCounter.displayElement(this.visual);
			// mobile compatibility
			if (!window.matchMedia("(max-width: 800px)").matches) {
				// web version
				var controlsDescrArr = ['W - rotate', 'A - move left', 'D - move right', 'S - move down'];
				for( var i=0; i< controlsDescrArr.length; i++){
					let textLine = new Text(controlsDescrArr[i]);
					textLine.setElemAttributes({'x': 115, 'y':(80 +8*i), 'style': 'font:7px sans-serif'});
					textLine.displayElement(this.visual);
				}
			}else{
				// mob version
				var mobBtns = d.getElementsByClassName('mobBtn');
				for(var i=0; i < mobBtns.length; i++ ){
					mobBtns[i].style.display = "block";
				}
			}
		}
		
		// Utility to turn on the debugging mode
		mapOfOccupiedFileds(){
			var output ='';
			for(var j=0; j < this.fieldHeight; j++){				
				for(var i=0; i<this.fieldWidth; i++){					
					if(this.tiles[i][j].occupied){
						output+='[+]';
					}else{
						output+='[ ]';
					}
				}
				output+='\n';				
			}
			return output;	
		}

		findFilledLines(){
			//console.log('Actual');
			//console.log(this.mapOfOccupiedFileds());
			var filledLines = []; 
			for(var j=0; j < this.fieldHeight; j++){
				var filled = true;			
				for(var i=0; i<this.fieldWidth; i++){					
					if(this.tiles[i][j].occupied != true){
						filled = false;
						break;						
					}
					if(i === (this.fieldWidth - 1) && filled){
						filledLines.push(j);
					}								
				}								
			}
			//console.log(filledLines);
			return filledLines;
		}

		removeFilledLine(lineIndex){			
			for(var i = 0; i < this.fieldWidth; i++ ){
				this.tiles[i][lineIndex].associatedBlock.visual.remove();
				this.tiles[i][lineIndex].deAssociateBlock();
				this.tiles[i][lineIndex].changeOccupation();
			}
			if(lineIndex != 0){
				for(var i=(lineIndex - 1); i>=0; i--){
					for(var j=0; j < this.fieldWidth; j++){
						if(this.tiles[j][i].occupied){
							this.tiles[j][i].associatedBlock.setPosition(this.tiles[j][i].x, (this.tiles[j][i].y+10));
							this.tiles[j][i+1].associateBlock(this.tiles[j][i].associatedBlock);
							this.tiles[j][i].changeOccupation();//remove the occupation of previous location
							this.tiles[j][i+1].changeOccupation();//occupi the next location of block
							this.tiles[j][i].deAssociateBlock();
						}
					}
				}
			}
		}

		replaceFilledLineImage(lineIndex){
			for(var i = 0; i < this.fieldWidth; i++){
				this.tiles[i][lineIndex].associatedBlock.setElemAttributes({'image':'src/face_smile.png'});
			}
		}

		removeGameField(){
			this.parent.removeChild(this.parent.childNodes[0]);			
		}
    }    
    class Block extends HtmlConstructor{
        constructor(){
            //super('rect');
			//this.setElemAttributes({'width': 8, 'height': 8, 'style': 'fill: rgb(0,0,0); stroke:rgb(0,0,0)'});
			super('image');
			this.setElemAttributes({'width': 9, 'height': 9, 'image': 'src/face_initial.png', 'style': 'stroke:rgb(0,0,0)'});					        
        }

        setPosition(x, y){			
			this.x = x;
			this.y = y;			
			this.setElemAttributes({'x': this.x, 'y': this.y});			
        }

        addTo(parent){
			super.displayElement(parent);			
        }
    }    

	// gameElements which are placed at the top 

	class GameElement {
		constructor(center){
			this.center = {};
			this.center.x = center.x;
			this.center.y = center.y;
			this.blocks = new Array(4);
			for(var i=0; i< this.blocks.length; i++){
				this.blocks[i]= new Block();
			}
		}
 /*-------------------- Utility -------------------------*/
		// finds the value of x for the block located at the very left on the element
 		minX(){
			var min=this.blocks[1].x;			
			for(var i=0; i<this.blocks.length; i++){
				if(this.blocks[i].x< min){
					min = this.blocks[i].x;
				}
			}
			return min;
		}
		// finds the value of x for the block located at the very rigth of the GameElement
		maxX(){
			var max=this.blocks[1].x;
			for(var i=0; i<this.blocks.length; i++){
				if(this.blocks[i].x> max){
					max = this.blocks[i].x;
				}
			}
			return max;
		}
		// finds the value of y for the block located at the very bottom of the GameElement
		maxY(){
			var max=this.blocks[1].y;
			for(var i=0; i<this.blocks.length; i++){
				if(this.blocks[i].y> max){
					max = this.blocks[i].y;
				}
			}
			return max;
		}		
		
		Occupy(){
			for(var i=0; i<this.blocks.length; i++){
				var j, k;
				j = this.blocks[i].x/10;
				k = this.blocks[i].y/10;
				if(!this.parent.tiles[j][k].occupied){
					this.parent.tiles[j][k].changeOccupation();
					this.parent.tiles[j][k].associateBlock(this.blocks[i]);
				}								
			}
		}

		deOccupy(){
			for(var i=0; i<this.blocks.length; i++){
				var j, k;
				j = this.blocks[i].x/10;
				k = this.blocks[i].y/10;
				if(this.parent.tiles[j][k].occupied){
					this.parent.tiles[j][k].changeOccupation();
					this.parent.tiles[j][k].deAssociateBlock(this.blocks[i]);	
				}								
			}
		}

		addTo(parent){
			this.parent = parent;
			var passed = true;
			for(var i=0; i<this.blocks.length; i++){
				var j, k;
				j = this.blocks[i].x/10;
				k = this.blocks[i].y/10;				
				if(this.parent.tiles[j][k].occupied){
					passed = false;
					/*Game over Event*/
					let event = new Event('gameOver', {bubbles:true});
					w.dispatchEvent(event);						
					break;
				}
			}
			if(passed){     
            	for(var i=0; i< this.blocks.length; i++){
                	this.blocks[i].addTo(parent);                
				}
				this.Occupy();
			}      
		}		
		
/*-------------------- Position change -------------------------*/
		moveDown(){
			if(this.maxY()<(this.parent.fieldHeight*10 - 10)){
				var passed = true;
				if(typeof this.parent!="undefined"){
					this.deOccupy();
					for(var i=0; i< this.blocks.length; i++){
						var j, k;
						j = this.blocks[i].x/10;
						k = (this.blocks[i].y + 10)/10;
						if(this.parent.tiles[j][k].occupied){
							passed = false;																			
							break;							
						}
					}
					this.Occupy();														
				}
				if(passed){
					this.center.y=this.center.y+10;
					if(typeof this.parent!="undefined"){
						this.deOccupy();
					}
					for(var i=0; i<this.blocks.length; i++){
						this.blocks[i].setPosition(this.blocks[i].x, (this.blocks[i].y+10));
					}
					if(typeof this.parent!="undefined"){
						this.Occupy();
					}
				}else{
					// event to tell that the movement is not possible
					let event = new Event('stopMovement', {bubbles:true});
					this.blocks[i].visual.dispatchEvent(event);
				}
			} else {
				/* Event to tell that movement is not possible*/ 
				let event = new Event('stopMovement', {bubbles:true});
				this.blocks[0].visual.dispatchEvent(event);				
			}
			// TODO: removed after fix of occupation
			//console.log('filed');
			//console.log(this.parent.mapOfOccupiedFileds());
        }
        
        moveLeft(){				
			if(this.minX()-10>=0){
				var passed = true;
				if(typeof this.parent!="undefined"){
					this.deOccupy();
					for(var i=0; i< this.blocks.length; i++){
						var j, k;
						j = (this.blocks[i].x-10)/10;
						k = this.blocks[i].y/10;
						if(this.parent.tiles[j][k].occupied){
							passed = false;													
							break;							
						}
					}
					this.Occupy();					
				}
				if(passed){
					this.deOccupy();
					this.center.x= this.center.x-10;
            		for(var i=0; i<this.blocks.length; i++){								
						this.blocks[i].setPosition((this.blocks[i].x-10), this.blocks[i].y);			
					}
					this.Occupy();
				}
			}            
        }

        moveRight(){
			if(this.maxX()<=(this.parent.fieldWidth*10-20)){
				var passed = true;
				if(typeof this.parent!="undefined"){
					this.deOccupy();
					for(var i=0; i< this.blocks.length; i++){
						var j, k;
						j = (this.blocks[i].x+10)/10;
						k = this.blocks[i].y/10;
						if(this.parent.tiles[j][k].occupied){
							passed = false;													
							break;							
						}
					}
					this.Occupy();					
				}
				if (passed){
					this.deOccupy();				
					this.center.x = this.center.x+10;			
            		for(var i=0; i<this.blocks.length; i++){												
						this.blocks[i].setPosition((this.blocks[i].x+10), this.blocks[i].y);
					}
					this.Occupy();
				}
			}         
		}

		rotate(){
			var newCords=[];						
            for(var i=0; i< this.blocks.length; i++){
				var x = this.blocks[i].x;
				var y = this.blocks[i].y;
				var deltaX = (x - this.center.x);
				var deltaY = (y - this.center.y);				
				if(deltaY!=0){
					y-=deltaY;
					x-=deltaY;						
				} 
				if(deltaX!=0){
					x-=deltaX;
					y+=deltaX;
				}
				newCords.push({'x':x,'y':y});				
			}			
			var passed = true;
			this.deOccupy();			
			for(var i=0; i<newCords.length; i++){
				var elem = newCords[i];
				if(elem.x<0 || elem.x>(this.parent.fieldWidth*10-10) || elem.y<0 || elem.y>(this.parent.fieldHeight*10-10)){
					passed = false;					
					break;
				}
				var x = elem.x/10,
					y = elem.y/10;				
				if(this.parent.tiles[x][y].occupied){
					passed = false;					
					break;
				}
			}
			this.Occupy();				
			if(passed){
				this.deOccupy();
				for(var i=0; i<this.blocks.length; i++){
					this.blocks[i].setPosition(newCords[i].x, newCords[i].y);
				}
				this.Occupy();
			}			
        }	
	}
	/*-------------------- Tertis blocks types -------------------------*/
    class LineElement extends GameElement{
        constructor(center){
            super(center);
			for(var i=-1; i<this.blocks.length-1; i++){                
                this.blocks[i+1].setPosition((center.x + i*10), center.y);                
            }            
        }                
	}
	
	class zigRight extends GameElement{
		constructor(center){
			super(center);
			var x, y;
			x=1;
			y=0;
			for(var i=0; i<this.blocks.length; i++){
				if(i===0 || i%2 === 0 ){
					this.blocks[i].setPosition((center.x + x*10), (center.y+ y*10));
					x--;
				}else{
					this.blocks[i].setPosition((center.x + x*10), (center.y + y*10));
					y++;
				}
			}
		}
	}

	class zigLeft extends GameElement{
		constructor(center){
			super(center);
			var x, y;
			x=-1;
			y=0;
			for(var i=0; i<this.blocks.length; i++){
				if(i===0 || i%2 === 0 ){
					this.blocks[i].setPosition((center.x + x*10), (center.y+ y*10));
					x++;
				}else{
					this.blocks[i].setPosition((center.x + x*10), (center.y + y*10));
					y++;
				}
			}			
		}
	}

	class Square extends GameElement{
		constructor(center){
			super(center);
			var x, y;
			x=0;
			y=0;
			for(var i=0; i<this.blocks.length; i++){
				if(i===0 || i%2 === 0 ){
					this.blocks[i].setPosition((center.x + x*10), (center.y+ y*10));
					x++;
				}else{
					this.blocks[i].setPosition((center.x + x*10), (center.y + y*10));
					y++;
					x--;
				}
			}			
		}
		rotate(){
			return 0;
		}
	}

	class RL extends GameElement{
		constructor(center){
			super(center);
			var x, y;
			x=-1;
			y=-1;
			for(var i=0; i<this.blocks.length; i++){
				if(i===0 ){
					this.blocks[i].setPosition((center.x + x*10), (center.y+ y*10));					
					y++;
				}else{
					this.blocks[i].setPosition((center.x + x*10), (center.y + y*10));
					x++;
				}
			}
			// Moved one tile down to avoid bug withone block out of scope drawing
			for(var i=0; i<this.blocks.length; i++){
				this.blocks[i].setPosition(this.blocks[i].x, (this.blocks[i].y+10));
			}			
		}		
	}

	class LL extends GameElement{
		constructor(center){
			super(center);
			var x, y;
			x=1;
			y=-1;
			for(var i=0; i<this.blocks.length; i++){
				if(i===0 ){
					this.blocks[i].setPosition((center.x + x*10), (center.y+ y*10));					
					y++;
				}else{
					this.blocks[i].setPosition((center.x + x*10), (center.y + y*10));
					x--;
				}
			}
			// Moved one tile down to avoid bug with one block out of scope drawing
			for(var i=0; i<this.blocks.length; i++){
				this.blocks[i].setPosition(this.blocks[i].x, (this.blocks[i].y+10));
			}						
		}		
	}    

	/*-------------------- Utilities -------------------------*/
	function randomizeBlocks(){
		var index = Math.floor((Math.random() * 6));
		switch(index){
			case 0: 
				return new LineElement(center);
			case 1:
				return new zigRight(center);
			case 2:
				return new zigLeft(center);
			case 3:
				return new Square(center);
			case 4:
				return new RL(center);
			case 5:
				return new LL(center);
			default:
				throw "The block do not exists";
		}
	}
	
	function addRemoveMultipleEventListeners(element, listenersTypes, func, action){
		if(action === 'add'){
			for(let i=0; i<listenersTypes.length; i++){
				element.addEventListener(listenersTypes[i], func);
			}
		}else if(action === 'remove'){
			for(let i=0; i<listenersTypes.length; i++){
				element.removeEventListener(listenersTypes[i], func);
			}
		}else{
			throw "Command not supported";
		}

	}

	function isMovementBtnClick(className, event){
		if(event.type === 'click'){
			return this.event.target.classList.value.indexOf(className) > -1
				|| this.event.target.parentNode.classList.value.indexOf(className) >-1
		}
	}

	/*--------------------Main Code-------------------------*/
	const startBtn = d.getElementById('startBtn');
	const restartBtn = d.getElementById('restartBtn');	
	var moveSpeed = 1000;
	var points = 0;
	var center = {'x':40, 'y': 0}; // the blocks would append at this point left top angle
	startBtn.addEventListener("click", _startGame);

	/*--------------------Swipe event added----------------*/
	d.addEventListener('touchstart', handleTouchStart);
	d.addEventListener('touchmove', handleTouchMove);

	var xDown = null;                                                        
	var yDown = null;

	function getTouches(evt) {		
  		return evt.touches ||             // browser API
        	   evt.originalEvent.touches; // jQuery
		}                                                     

	function handleTouchStart(evt) {
		const firstTouch = getTouches(evt)[0];		;                                  
    	xDown = firstTouch.clientX;                                      
		yDown = firstTouch.clientY;
		                                  
	};                                                

	function handleTouchMove(evt) {		
    	if ( ! xDown || ! yDown ) {			
        	return;
		}
		
    	var xUp = evt.touches[0].clientX;                                    
    	var yUp = evt.touches[0].clientY;

    	var xDiff = xDown - xUp;
		var yDiff = yDown - yUp;
		var event;
    	if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        	if ( xDiff > 0 ) {
				/* left swipe */
				event = new Event('leftSwipe', {bubbles:true});					    	
        	} else {
				/* right swipe */
				event = new Event('rightSwipe', {bubbles:true});
       		}                       
    	} else {
        	if ( yDiff > 0 ) {
				/* up swipe */
				event = new Event('upSwipe', {bubbles:true});
        	} else { 
				/* down swipe */
				event = new Event('downSwipe', {bubbles:true});
        	}                                                                 
		}
		d.dispatchEvent(event);
		/* reset values */
    	xDown = null;
    	yDown = null;                                             
	};

	/*---------------End of Swipe event added--------------*/

	function _startGame(){		
		/*--------------------Controls-------------------------*/		
		function _movementControls(){			
			// s char code
			if(this.event.which === 83 || isMovementBtnClick('down', this.event) || this.event.type === 'downSwipe' ){
				elementInFocus.moveDown();			
			// a char code
			}else if(this.event.which === 65 || isMovementBtnClick('left', this.event) || this.event.type === 'leftSwipe' ){
				elementInFocus.moveLeft();
			// d char code
			}else if(this.event.which === 68 || isMovementBtnClick('right', this.event) || this.event.type === 'rightSwipe' ){
				elementInFocus.moveRight();
			// w char code 87
			}else if(this.event.which === 87 || isMovementBtnClick('rotate', this.event) || this.event.type === 'upSwipe' ){
				elementInFocus.rotate();
			}		
		};	
		/*------------------End of Controls----------------------*/
		// Game pause should be incapsulated
    	var field= new GameField();
    	field.displayElement(d.getElementById('container'));
		var elementInFocus  = randomizeBlocks();
		elementInFocus.addTo(field);
		const pointsCalc = d.getElementById('points');
		addRemoveMultipleEventListeners(w, ['keydown','click','leftSwipe','rightSwipe','upSwipe','downSwipe'], _movementControls, 'add');
		//w.addEventListener('keydown', _movementControls);
		w.interval = setInterval(function(){
			elementInFocus.moveDown(field);
		}, moveSpeed);		

		/*Movement imposible event handler*/
		const _moveDownEventHandler = function(){			

			// filled lines removal 

			var arrOfFilledLines=field.findFilledLines();		
			if(arrOfFilledLines.length!=0 && typeof arrOfFilledLines!='undefined'){
				
				for(let i=0; i < arrOfFilledLines.length; i++){
					let promise = new Promise(function(resolve, reject){
						field.replaceFilledLineImage(arrOfFilledLines[i]);
						addRemoveMultipleEventListeners(w, ['keydown','click','leftSwipe','rightSwipe','upSwipe','downSwipe'], _movementControls, 'remove');
						//w.removeEventListener('keydown', _movementControls);
						clearInterval(w.interval);
						w.interval='stop';
						setTimeout(function(){							
							resolve(i);							
						}, moveSpeed);										
						// points assignement 
						points+=1;						
						var pointsToDisplay = points.toString();
						if(pointsToDisplay.length < 5){
							var zerosToAdd = 5- pointsToDisplay.length;					
							for (var j=0; j< zerosToAdd; j++){
								pointsToDisplay='0'+ pointsToDisplay;
							}
						}
						if(points%10 === 0 && moveSpeed!= 100){
							moveSpeed-=100;
						}
						pointsCalc.innerHTML = pointsToDisplay;
					});
					promise.then((i)=>{
						field.removeFilledLine(arrOfFilledLines[i]);
						if(i===(arrOfFilledLines.length-1)){									
							elementInFocus = randomizeBlocks();
							elementInFocus.addTo(field);
							//console.log(elementInFocus);
							w.interval = setInterval(function(){
								elementInFocus.moveDown(field);
							}, moveSpeed);
							addRemoveMultipleEventListeners(w, ['keydown','click','leftSwipe','rightSwipe','upSwipe','downSwipe'], _movementControls, 'add');
							//w.addEventListener('keydown', _movementControls);
						}
					});
				}				
				
			}else{
				elementInFocus = randomizeBlocks();
				elementInFocus.addTo(field);
				//console.log(elementInFocus);	
			}		
		}	
		w.addEventListener('stopMovement', _moveDownEventHandler);

		/*Gameover event handler*/

		w.addEventListener('gameOver', function (){
			w.removeEventListener('stopMovement', _moveDownEventHandler);
			addRemoveMultipleEventListeners(w, ['keydown','click','leftSwipe','rightSwipe','upSwipe','downSwipe'], _movementControls, 'remove');
			//w.removeEventListener('keydown', _movementControls);
			clearInterval(w.interval);
			w.interval='stop';
			let children = field.visual.getElementsByTagName('image');
			for(var i=0; i < children.length; i++){
				children[i].remove();
			}
			let text = new Text('Game Over!\n\rYou have earned: '+points);
			text.setElemAttributes({'x':2,'y': (field.fieldHeight*10/2 - 20), 'style':'font: bold 6px sans-serif;'});			
			let back = new HtmlConstructor('rect');
			back.setElemAttributes({'x':0,'y': (field.fieldHeight*10/2 -27), 'style': 'fill: white;', 'width':field.fieldWidth*10, 'height':'10'});
			back.displayElement(field);
			text.displayElement(field);
			//console.log('Game has been finished. No more console messages should appear here');
		});
		
		/*Restart game logic is here*/ 
		startBtn.style.display = 'none';
		restartBtn.style.display = 'inline-block';
		restartBtn.addEventListener('click', _restartGame);	

		function _restartGame(){
			moveSpeed = 1000;		
			points = 0;
			pointsCalc.innerHTML = points;
			//remove event handlers in case they were active
			addRemoveMultipleEventListeners(w, ['keydown','click','leftSwipe','rightSwipe','upSwipe','downSwipe'], _movementControls, 'remove');
			//w.removeEventListener('keydown', _movementControls);
			w.removeEventListener('stopMovement', _moveDownEventHandler);

			// recreation of the game field
			field.removeGameField();
			field = new GameField();
    		field.displayElement(d.getElementById('container'));
			elementInFocus  = randomizeBlocks();
			elementInFocus.addTo(field);
			
			// initiation of the event handlers related to the elemnt movement
			w.addEventListener('stopMovement', _moveDownEventHandler);
			addRemoveMultipleEventListeners(w, ['keydown','click','leftSwipe','rightSwipe','upSwipe','downSwipe'], _movementControls, 'add');
			//w.addEventListener('keydown', _movementControls);

			// restarts element movement if it has been stopped			
			if(w.interval==='stop'){
				w.interval = setInterval(function(){
					elementInFocus.moveDown(field);
				}, moveSpeed);
			}
		}
	}	
})(window, document)
