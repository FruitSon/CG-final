
function Tree(){
	this.tree = new THREE.Object3D();
	//if(type == 1)
		this.branches = new Branch(null,new Word("a",1),0);
	//else this.branches = new Branch2(null,new Word("b",1),0);
	this.time = 0;
}
//calculate all the branch in this tree.
Tree.prototype.Buildtree = function(limit){
	this.branches.addChild(1,limit);
}
Tree.prototype.CalTimelimit = function(){
	return this.branches.CalLifeSpan();
}
//culculate length of each branch in the tree
Tree.prototype.CalBranchLength = function(t){
	this.branches.setTime(t);
	this.branches.setLength();
}
//add all branches to tree
Tree.prototype.AddBranch = function(){
	this.branches.AddtoScene(tr.tree);
}
//remove a branch from the tree
Tree.prototype.RemoveAllBranch = function(){
	if(tr.tree.children.length > 0){
		for(var i = tr.tree.children.length - 1 ; i >= 0 ; i --){
			let obj = tr.tree.children[i];
			tr.tree.remove(obj);
		}
    }
}