
class Component {

	constructor(data, entity){
		this.entity = entity ; 
	}
	
	register(dt){
		this.entity.components.push(this) ; 
	}
	
	execute(t){}

}

export {Component} ; 
