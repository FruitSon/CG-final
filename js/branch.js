var Aa = 20;
var Ba = 0.48;
var BETA = 1;
var LATE = 1;
var GROW = 2;
var RATIO = 0.5;

var flowercolor = {color: 0xffffff};
var branchcolor = {color: 0x7e3817};

function Branch(parent,wordtype,t){
	this.parent = parent;
	this.type = wordtype;
	this.globaltime = t;
	this.localtime = 0;
	this.children = new Array();
	this.length = 0;
	this.radium = 0;

	this.localMatrix = new THREE.Matrix4();
	this.globalMatrix = new THREE.Matrix4();
	this.Angle = 0;//(parent === null) ? 0 : parent.Angle;
	this.Anxis = new THREE.Vector3(0,0,1);
	this.line = null;
	this.scale = 1;
	this.lifespan = 0;
}

Branch.prototype.FragmentSource = `
	uniform float time;
	    
    ${NoiseSource}

    varying vec3 gPosition;
    varying vec2 vUv;

    void main() {
        float x = gPosition.x / 1000.0;
        float y = gPosition.y / 1000.0;
        float z = gPosition.z / 1000.0;

        float r = 82.0 / 256.0;
        float g = 30.0 / 256.0;
        float b = 14.0 / 256.0;

        float value = mod(wood(x, y, z), 20.0 / 256.0);

        gl_FragColor = vec4(r + value, g + value, b, 1);
    }
`

//get the lifespan of the tree.
Branch.prototype.CalLifeSpan = function(){
	if(this.children === null){
		this.lifespan = this.type.t + GROW;
		return this.lifespan;
	}
	var maxlife = 0;
	for(var i = 0 ; i < this.children.length ; i++){
		var templife = this.children[i].CalLifeSpan();
		if(templife > maxlife){
			maxlife = templife;
		}
	}
	this.lifespan = maxlife + this.type.t;
	return this.lifespan;
}
//set globaltime to branch
Branch.prototype.setTime = function(t){
	this.globaltime = t;
	this.setLocaltime();
	if(this.children != null){
		for(var i = 0 ; i < this.children.length ; i++)
			this.children[i].setTime(t);
	}
}
//calculate start time of each branch
Branch.prototype.getStartTime = function(){
	if(this.parent === null)
	  return this.type.t;
	else return this.type.t + this.parent.getStartTime();
}
//calculate localtime accroding to globaltime
Branch.prototype.setLocaltime = function(){
	if(this.parent === null){
		if(this.globaltime <= GROW){//this.type.t){
			this.localtime = this.globaltime;
		}else this.localtime = GROW;//this.type.t;
	}else{
		var t =  this.parent.getStartTime();


		if(this.globaltime > t){
			var local = this.globaltime - t;
			if(local <= GROW){//this.type.t){
				this.localtime = local;
			}else this.localtime = GROW;//this.type.t;
		}else this.localtime = 0;

	}
}
//calculate the length of branch according to growth function and local time
Branch.prototype.CalLength = function(){
	switch(this.type.a){
		case "a":
			this.len = Aa * Math.pow(Math.E, Ba * this.localtime) - 1;
			break;
		case "b":
			this.len = Aa * this.localtime;//Aa/Math.pow(BETA,3) * (BETA * Ba - 2) * Math.pow(this.localtime,3)
						  //+ Aa/Math.pow(BETA,2) * (3 - BETA * Ba) * Math.pow(this.localtime,2);
			break;
		case "s":
			this.len = Aa * (Math.pow(Math.E, Ba) - 1) * (Math.pow(Math.E, Ba * this.localtime) - 1);
			break;
		case "F":
			this.len = 5 * this.localtime;
			break;
		case "H":
			this.len = Aa/7 * Math.sqrt(this.localtime);///Math.pow(BETA,3) * (BETA * Ba - 2) * Math.pow(this.localtime,3)
						  //+ Aa/Math.pow(BETA,2) * (3 - BETA * Ba) * Math.pow(this.localtime,2);
			break;
	}
	this.radium = 3 * Math.sqrt(this.localtime) * this.scale * this.scale;
	this.len = this.len * this.scale;
	return this.len;
}
//calculate all branch length
Branch.prototype.setLength = function(){
	this.CalLength();
	if(this.children != null){
		for(var i = 0 ; i < this.children.length ; i++)
			this.children[i].setLength();
	}
}
//set and getlocalMatrix 
Branch.prototype.getLocalMatrix = function(){
	var mr = new THREE.Matrix4();
	var mt = new THREE.Matrix4();
	mr.makeRotationAxis(this.Anxis,this.Angle * Math.PI / 180);
	if(this.parent != null)
	 mt.makeTranslation(0,this.parent.len,0);
	this.localMatrix.multiplyMatrices(mt,mr);
	return this.localMatrix;
}
//calculate globalmatrix for the branch
Branch.prototype.getGlobalMatrix = function(){
	if(this.parent != null && this.parent.parent === null)//parent is root
		this.globalMatrix = this.getLocalMatrix();
	else if(this.parent === null) return this.globalMatrix;
	else this.globalMatrix.multiplyMatrices(this.parent.getGlobalMatrix(),this.getLocalMatrix());
	return this.globalMatrix;
}
//addchild to parent use recursive method to calculate all branch in the tree.
//this function is ralated to L-system turtle move procedure.
Branch.prototype.addChild = function(iteration,limit){
  	if(iteration > limit) this.children = null;
  	else{
 
	  		switch(this.type.a){
	  		//change this.children here
	  		case "a":
	  			this.children.push(new Branch(this,new Word("s",LATE),this.globaltime));
	  			this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			break;
	  		case "b":
	  			this.children.push(new Branch(this,new Word("[",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("b",BETA),this.globaltime));
	  			this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("]",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("[",0),this.globaltime));
				this.children.push(new Branch(this,new Word("b",BETA),this.globaltime));
				this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("]",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("[",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("b",BETA),this.globaltime));
	  			this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("]",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("[",0),this.globaltime));
				this.children.push(new Branch(this,new Word("b",BETA),this.globaltime));
				this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("]",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			break;
	  		case "s":
	  			this.children.push(new Branch(this,new Word("[",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("b",BETA),this.globaltime));
	  			this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("]",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("[",0),this.globaltime));
				this.children.push(new Branch(this,new Word("b",BETA),this.globaltime));
				this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("]",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("[",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("b",BETA),this.globaltime));
	  			this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("]",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("[",0),this.globaltime));
				this.children.push(new Branch(this,new Word("b",BETA),this.globaltime));
				this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("]",0),this.globaltime));
	  			this.children.push(new Branch(this,new Word("F",1),this.globaltime));
	  			break;
	  		case "F":
	  			this.children.push(new Branch(this,new Word("H",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("H",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("H",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("H",1),this.globaltime));
	  			this.children.push(new Branch(this,new Word("H",1),this.globaltime));
	  			break;
	  		case "H":
	  			this.children = null;
	  			break;
	  		case "[":
	  		 	this.children = null;
	  		 	break;
	  		case "]":
	  			this.children = null;
	  			break;
  			}
  			if(this.children !=  null){
  				var counth = 0;
  				var countd = 0;
  				for(var i = 0 ; i < this.children.length ; i++ ){
  					
  					if(i >= 1 && this.children[i-1].type.a === "["){
  						countd++;
  						switch(countd){
  							case 1:
  								this.children[i].Angle -= 45;
  								this.children[i].Anxis = new THREE.Vector3(1,0,0);
  								break;
  							case 2:
  								this.children[i].Angle += 45;
  								this.children[i].Anxis = new THREE.Vector3(0,0,1);
  								break;
  							case 3:
  								this.children[i].Angle += 45;
  								this.children[i].Anxis = new THREE.Vector3(1,0,0);
  								break;
  							case 4:
  								this.children[i].Angle -= 45;
  								this.children[i].Anxis = new THREE.Vector3(0,0,1);
  								break;
  						}
  					}
  					if(this.children[i].type.a === "H"){
  						counth++;
  						this.children[i].Anxis = new THREE.Vector3(0,0,1);
  						this.children[i].Angle += counth * 72;
  					}
  					if(this.children[i].type.a === "F"){
  						var d = getRandomInt(1,3);
  						switch(d){
  							case 1:
  								this.children[i].Angle += 90;
  								break;
  							case 2:
  								this.children[i].Angle -= 90;
  								break;
  						}
  					}

  					if(this.parent === null)
  					  this.children[i].scale = this.scale * RATIO;
  					else if(this.children[i].type.a === "b") this.children[i].scale = this.scale * 0.7;
  					else this.children[i].scale = this.scale * 0.9;
  					// this.children[i].radium = this.radium * this.scale/(this.scale + 1);
  					this.children[i].addChild(iteration+1,limit);
				}
			}
	
  	}
}

Branch.prototype.Setline = function(tree){
	if(this.len > 0){
			var start = new THREE.Vector3(0,0,0);
	    	var end = new THREE.Vector3(0,this.len,0);
	    	var m = this.getGlobalMatrix();
	    	var n = new THREE.Matrix4();
	    	n.makeTranslation(0,1.5 * this.len,0);
	    	n.multiplyMatrices(m,n);
	    	start.applyMatrix4(m);
	    	end.applyMatrix4(m);

		if(this.type.a === "H"){
			var geometry = new THREE.SphereGeometry( this.len, 32, 32 );
			var material = new THREE.MeshBasicMaterial( flowercolor );
			this.line = new THREE.Mesh( geometry, material );
			this.line.position.applyMatrix4(n);
			// var material = new THREE.LineBasicMaterial({color: 0xffff00});
		 //    var geometry = new THREE.Geometry();
			// geometry.vertices.push(start,end);
			// this.line = new THREE.LineSegments( geometry, material );
		}else{
			// var material = new THREE.LineBasicMaterial({color: 0x00ff00});
		 //    var geometry = new THREE.Geometry();
			// geometry.vertices.push(start,end);
			// this.line = new THREE.LineSegments( geometry, material );

			// var material = new THREE.MeshBasicMaterial( branchcolor );
			var material = new THREE.ShaderMaterial({
				uniforms:{
					time: { value: 1.0 }
				},
				vertexShader : VertexSource,
				fragmentShader : this.FragmentSource
			});
			// var material2 = new THREE.MeshBasicMaterial( {color: 0xffff00} );
			if(this.localtime < this.type.t || this.children === null){
				this.line = createCylinderFromEnds(material, 0.5 * this.radium , this.radium , end , start, 16, false);
			}
			else{ this.line = createCylinderFromEnds(material, this.children[0].radium, this.radium, end, start, 16, false);
			}
		}
			
		
	}
}
//add segement to trees
Branch.prototype.AddtoScene = function(tree){
	if(this.len > 0){
	 this.Setline();
	 tree.add(this.line);
	 if(this.children != null){
		for(var i = 0 ; i < this.children.length ; i++)
			this.children[i].AddtoScene(tree);
	 }
	}
}