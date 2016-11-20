var DrawTree = function(){
      var parent = new THREE.Object3D();
      var n  = 1;
      var t;//time word over V
      var w = new String("X");//word over V, initial tree
      var turtlepos = new THREE.Vector3(0, 0, 0);//current position
      var turtleface = new THREE.Vector3(90,90,90);//the angle that turtleface
      // var turtlefacex = 90;
      var posStack = new Array();
      var angleStack = new Array();
      var stepStack = new Array();
      var angle2Stack = new Array();
      var anxisStack = new Array();
      var trunkStack = new Array();
      var steplen = 300.0;
      var ydegree = 35.7;
      var xdegree = 35.7;
      var zdegree = 90;
      var anxis = 0;
      var Radium = 100;
      var ratio = 0.7;
      var n = 5;

      for(var i = 0 ; i < n ; i++){
            var str = new String();
            // str += "s";
            for(var j = 0 ; j < w.length ; j++) {
                  if(w[j] === "F") str += "F";
                  else if(w[j] === "X") {
                        c = getRandomInt(1,4);
                        switch(c){
                         case 1: str += "FF[+X][^X][-X][vX][X]";break;
                         case 2: str += "FF[+X][-X]";break;
                         case 3: str += "FF[vX][^X]";break;
                        }
                  }
                  else str += w[j];
            }
            w = str;
      }

      for(var k = 0 ; k < w.length ; k++){
            var c = w[k];
            switch(c){
                  case "<":
                        anxis = 2;
                        turtleface = new THREE.Vector3(turtleface.x , turtleface.y, turtleface.z + zdegree);
                        break;
                  case ">":
                        anxis = 2;
                        turtleface = new THREE.Vector3(turtleface.x , turtleface.y, turtleface.z - zdegree);
                        break;
                  case "^":
                        anxis = 1;
                        xdegree = Math.random() * 60;
                        turtleface = new THREE.Vector3(turtleface.x + xdegree, turtleface.y, turtleface.z);
                        break;
                  case "v":
                        anxis = 1;
                        xdegree = Math.random() * 60;
                        turtleface = new THREE.Vector3(turtleface.x - xdegree, turtleface.y, turtleface.z);
                        break;
                  case "+":
                        anxis = 0;
                        ydegree = Math.random() * 60;
                        turtleface = new THREE.Vector3(turtleface.x , turtleface.y + ydegree, turtleface.z);
                        break;
                  case "-":
                        anxis = 0;
                        ydegree = Math.random() * 60;
                        turtleface = new THREE.Vector3(turtleface.x , turtleface.y - ydegree, turtleface.z);
                        break;
                  case "[":
                        posStack.push(turtlepos);
                        angleStack.push(turtleface);
                        // angle2Stack.push(turtlefacex);
                        trunkStack.push(Radium);
                        anxisStack.push(anxis);
                        stepStack.push(steplen);
                        steplen = steplen*ratio;
                        break;
                  case "]":
                        turtlepos = posStack.pop();
                        turtleface = angleStack.pop();
                        // turtlefacex = angle2Stack.pop();
                        anxis = anxisStack.pop();
                        steplen = stepStack.pop();
                        Radium = trunkStack.pop();
                        // anxis = anxisStack.pop();
                        break;
                  case "F":
                        if(anxis === 0){
                              var y = Math.sin(turtleface.y * Math.PI / 180) * steplen;
                              var x = Math.cos(turtleface.y * Math.PI / 180 ) * steplen;
                              var destpos = new THREE.Vector3(turtlepos.x + x, turtlepos.y + y, turtlepos.z);
                        }else if(anxis === 1){
                              var z = Math.cos(turtleface.x * Math.PI / 180) * steplen;
                              var y = Math.sin(turtleface.x * Math.PI / 180) * steplen;
                              var destpos = new THREE.Vector3(turtlepos.x, turtlepos.y + y, turtlepos.z + z);
                        }else if(anxis === 2){
                              var z = Math.sin(turtleface.z * Math.PI / 180) * steplen;
                              var x = Math.cos(turtleface.z * Math.PI / 180) * steplen;
                              var destpos = new THREE.Vector3(turtlepos.x + x, turtlepos.y , turtlepos.z + z);
                        }
                        var material = new THREE.MeshBasicMaterial( {color: 0x824d12} );
                        var cylinder = createCylinderFromEnds(material,ratio*Radium, Radium, destpos, turtlepos,16,false);
                        parent.add( cylinder );

                        turtlepos = destpos;
                        Radium = ratio*Radium;
            }
      }
      return parent;
}

