//word type 
function Word(a,t){
	this.a = a;//word character
	this.t = t;//time to move on to next level.
}

function Word2(a,t,w){
	this.a = a;//word character
	this.t = t;//time to move on to next level
	this.w = w;//initial width
}

function Anxio(string){
	this.anxio = new Array();
	this.anxio.push(new Word("!",1));
	this.anxio.push(new Word("F",200));
	this.anxio.push(new Word("/",45));
	this.anxio.push(new Word("A",0));
}
