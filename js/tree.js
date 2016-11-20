
function Tree(){
	this.tree = new THREE.Object3D();
	//if(type == 1)
		this.branches = new Branch(null,new Word("a",1),0);
	//else this.branches = new Branch2(null,new Word("b",1),0);
	this.time = 0;
	this.timeLimit = 0;
}
//calculate all the branch in this tree.
Tree.prototype.Buildtree = function(limit){
	this.branches.addChild(1,limit);
	this.timeLimit = this.branches.CalLifeSpan();
}

//culculate length of each branch in the tree
Tree.prototype.CalBranchLength = function(t){
	this.branches.setTime(t);
	this.branches.setLength();
}
//add all branches to tree
Tree.prototype.AddBranch = function(){
	this.branches.AddtoScene(this.tree);
}
//remove a branch from the tree
Tree.prototype.RemoveAllBranch = function(){
	if(this.tree.children.length > 0){
		for(var i = this.tree.children.length - 1 ; i >= 0 ; i --){
			let obj = this.tree.children[i];
			this.tree.remove(obj);
		}
    }
}