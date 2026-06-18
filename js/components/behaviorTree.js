
import {Component} from './component.js' ;

// Runs a behavior-tree root (see js/bt/behaviorTree.js) on this entity every tick.
class BehaviorTree extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.register() ;
		this.root = data.root || null ;
		entity.blackboard = entity.blackboard || {} ;
	}

	execute(dt){
		if (this.root) this.root.tick(this.entity, dt) ;
	}
}

export {BehaviorTree} ;
