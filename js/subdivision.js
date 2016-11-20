/**
 * Modified on basis of the Assignment 5
 * 留空
 *
 * @param      {<type>}        vertices  The vertices
 * @param      {<type>}        faces     The faces
 * @return     {(Array|Mesh)}  { description_of_the_return_value }
 */

function modifyMesh(geometry,subdivisionLevel){
    console.log(geometry);
    var vertices = geometry.attributes.position.array;
    var faces = geometry.attributes.index.array;
    console.log(vertices,faces);
    for (var i = 0; i < subdivisionLevel; ++i)
        mesh = catmullClarkSubdivision(vertices, faces);
    
    Geometry.verticesNeedUpdate = true;
    geometry.elementsNeedUpdate = true;
}


function catmullClarkSubdivision(vertices, faces) {
    var newVertices = [];
    var newFaces = [];
    
    var edgeMap = {};

    function getOrInsertEdge(a, b, centroid) {
        var edgeKey = a < b ? a + ":" + b : b + ":" + a;
        if (edgeKey in edgeMap) {
            return edgeMap[edgeKey];
        } else {
            var idx = newVertices.length;
            newVertices.push(centroid);
            edgeMap[edgeKey] = idx;
            return idx;
        }
    }

    function calculateCentroid(f, newVertices){
        var centroid = new Vector();
        for(var i = 0; i < f.length; i++){
            centroid = centroid.add(newVertices[f[i]]);
        }
        return centroid.multiply(1/f.length);
    }

    //step1: linear subdivision
    for(var i = 0; i < vertices.length; i++){
        newVertices.push(vertices[i]);
    }

    for(var i = 0; i < faces.length; i++){        
        var f = faces[i];
        var centroid = calculateCentroid(f,newVertices);
        newVertices.push(centroid);
        var facePointIndex = newVertices.length-1;

        for( var j = 0; j < f.length; j++){

            var v0 = f[(j-1+f.length)%f.length];
            var v2 = f[(j+1+f.length)%f.length];
            var v1 = f[j];

            var c1 = newVertices[v0].add(newVertices[v1]).multiply(0.5);
            var c2 = newVertices[v1].add(newVertices[v2]).multiply(0.5);

            edgePointA = getOrInsertEdge(v0, v1, c1);
            edgePointB = getOrInsertEdge(v1, v2, c2);

            var nf = [facePointIndex, edgePointA, v1, edgePointB];
            newFaces.push(nf);
        }
    }


    //step2: averaging
    var avgV = [];
    var avgN = [];

    for(var i = 0; i < newVertices.length; i++){
        avgV.push(new Vector(0, 0, 0));
        avgN.push(0);
    }

    for(var i = 0; i < newFaces.length; i++){
        var c = calculateCentroid(newFaces[i],newVertices);
        for(var j = 0; j < newFaces[i].length; j++){
            avgV[newFaces[i][j]] = avgV[newFaces[i][j]].add(c);
            avgN[newFaces[i][j]] += 1;
        }
    }

    for(var i = 0; i < avgV.length; i++){
        avgV[i] = avgV[i].divide(avgN[i]);
    } 

    
    //step3: correction
    for(var i = 0; i < avgV.length; i++){
        newVertices[i] = newVertices[i].multiply(1-4/avgN[i]).add(avgV[i].multiply(4/avgN[i]));
    }
    
    return new Mesh(newVertices, newFaces);
};