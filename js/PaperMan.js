



// Skeleton( bones, boneInverses, useVertexTexture )

// var bones = [];

// var head = new THREE.Bone();
// var leftShoulder = new THREE.Bone();
// var rightShoulder = new THREE.Bone();
// var leftHand = new THREE.Bone();
// var rightHand = new THREE.Bone();
// var mid = new THREE.Bone();
// var leftLeg = new THREE.Bone();
// var rightLeg = new THREE.Bone();
// var leftFoot = new THREE.Bone();
// var rightFoot = new THREE.Bone();

// mid.add(head)
// mid.add()


function PaperMan() {
	var that = {};

	var init = function() {
		var bones = [];
		var shoulder = new THREE.Bone();
		var elbow = new THREE.Bone();
		var hand = new THREE.Bone();

		shoulder.add( elbow );
		elbow.add( hand );

		bones.push( shoulder );
		bones.push( elbow );
		bones.push( hand );

		shoulder.position.x = -1000;
		elbow.position.y = 0;
		hand.position.y = 1000;

		var armSkeleton = new THREE.Skeleton( bones );

		//Set seleketon
		//radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded, thetaStart, thetaLength)
		var geometry = new THREE.CylinderGeometry( 100, 100, 1000, 5, 15, 5, 30 );

		//Create the skin indices and skin weights
		for ( var i = 0; i < geometry.vertices.length; i ++ ) {
			
			// Imaginary functions to calculate the indices and weights
			// This part will need to be changed depending your skeleton and model
			var skinIndex = i;
			var skinWeight = 0.5;
			
			// Ease between each bone
			geometry.skinIndices.push( new THREE.Vector4( skinIndex, skinIndex + 1, 0, 0 ) );
			geometry.skinWeights.push( new THREE.Vector4( 1 - skinWeight, skinWeight, 0, 0 ) );		
			
		}

		var mesh = that.mesh = new THREE.SkinnedMesh( geometry );

		// See example from THREE.Skeleton for the armSkeleton
		var rootBone = armSkeleton.bones[ 0 ];
		mesh.add( rootBone );

		// Bind the skeleton to the mesh
		mesh.bind( armSkeleton );

		return that;
	}

	return init();
}