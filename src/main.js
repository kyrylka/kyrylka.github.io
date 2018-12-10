(function(w,d){
    
    // object which holds the info about the absract cords of the gameField
    class Tile {
        constructor(x, y){
            this.x = x;
            this.y = y;
            this.occupied = false;
        }

        changeOccupation(){
            if(this.occupied===true){
                this.occupied=false;
            }else{
                this.occupied=true;
            }
        }
    } 
    
    // object which renders the elements on the screen

    class HtmlConstructor{
        constructor(type){
            this.visual = d.createElementNS('http://www.w3.org/2000/svg', type);                        
        }

        setElemAttributes(attrs){
            for(var keys in attrs){
                this.visual.setAttribute(keys, attrs[keys]);
            }
        }

        displayElement(parent){            
            if(typeof parent.visual != "undefined"){
                parent.visual.append(this.visual);
            }else if(typeof parent!= "undefined"){
                parent.append(this.visual);
            }else{
                throw "Parent is not defined";   
            }            
        }
    }
    class GameField extends HtmlConstructor{
        constructor(){
			super('svg');
			// field size atributes
			this.fieldWidth = 10;
			this.fieldHeight = 24;
			this.setElemAttributes({'viewBox':'0 0 98 240'});
			// Tiles containers
			this.tiles = new Array(this.fieldWidth);
			for(var i=0; i<10; i++){
				this.tiles[i]=new Array(this.fieldHeight);
			}			
            for(var i=0; i<this.fieldWidth; i++){
                for(var j=0; j<this.fieldHeight; j++){
					this.tiles[i][j]= new Tile((10*i),(10*j));
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
    }    
    class Block extends HtmlConstructor{
        constructor(){
            super('rect');
            this.setElemAttributes({'width': 8, 'height': 8, 'style': 'fill: rgb(0,0,0); stroke:rgb(0,0,0)'});            
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
				}								
			}
		}

		addTo(parent){
			this.parent = parent;      
            for(var i=0; i< this.blocks.length; i++){
                this.blocks[i].addTo(parent);                
			}
			this.Occupy();           
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
							/* Event to tell that movement is not possible*/ 
							let event = new Event('stopMovement', {bubbles:true});
							this.blocks[i].visual.dispatchEvent(event);							
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
				}
			} else {
				/* Event to tell that movement is not possible*/ 
				let event = new Event('stopMovement', {bubbles:true});
				this.blocks[0].visual.dispatchEvent(event);				
			}
			// TODO: removed after fix of occupation
			console.log('filed');
			console.log(this.parent.mapOfOccupiedFileds());
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
			for(var i=0; i<newCords.length; i++){
				var elem = newCords[i];
				if(elem.x<0 || elem.x>(this.parent.fieldWidth*10-10) || elem.y<0 || elem.y>(this.parent.fieldHeight*10-10)){
					passed = false;
					break;
				}
				var x = newCords.x/10,
					y = newCords.y/10;

				if(this.parent.tiles[x][y].occupied){
					passed = false;
					break;
				}
			}					
			if(passed){
				for(var i=0; i<this.blocks.length; i++){
					this.blocks[i].setPosition(newCords[i].x, newCords[i].y);
				}
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

    /*--------------------Main Code-------------------------*/
    var center = {'x':40, 'y': 0}; // the blocks would append at this point left top angle

    var field= new GameField();
    field.displayElement(d.getElementById('container'));
	var elementInFocus  = randomizeBlocks();
	elementInFocus.addTo(field);

	var interval = setInterval(function(){
		elementInFocus.moveDown(field);
	}, 1000);

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


	/*--------------------Controls-------------------------*/
	w.addEventListener('keydown', function(){
		// s char code
		if(this.event.which === 83 ){
			elementInFocus.moveDown(field);			
		// a char code
		}else if(this.event.which === 65){
			elementInFocus.moveLeft();
		// d char code
		}else if(this.event.which === 68){
			elementInFocus.moveRight();
		// w char code 87
		}else if(this.event.which === 87){
			elementInFocus.rotate();
		}
		
	});
	/*------------------End of Controls----------------------*/
	w.addEventListener('stopMovement', function(){
		elementInFocus = randomizeBlocks();
		elementInFocus.addTo(field);
		console.log(elementInFocus);	
	}) 
})(window, document)
