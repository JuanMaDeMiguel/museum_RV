
import {Component} from './component.js' ;

// Holds the waypoint list for a Newton/Kine entity and exposes the current
// target through entity.blackboard.target. Advancing is driven externally
// (typically by a BehaviorTree action) via next().
class Trajectory extends Component {

	constructor(data, entity){
		super(data, entity) ;
		this.waypoints = (data.waypoints || []).map(p => new BABYLON.Vector3(p.x, p.y || 0, p.z)) ;
		this.pauseTime = data.pauseTime !== undefined ? data.pauseTime : 2.0 ;
		this.loop = data.loop !== false ;
		this.direction = data.reverse ? -1 : 1 ;
		this.index = data.startIndex !== undefined ? data.startIndex : 0 ;

		entity.blackboard = entity.blackboard || {} ;
		entity.blackboard.target = this.waypoints[this.index] || null ;
	}

	next(){
		this.index += this.direction ;
		if (this.index >= this.waypoints.length) {
			this.index = this.loop ? 0 : this.waypoints.length - 1 ;
		}
		if (this.index < 0) {
			this.index = this.loop ? this.waypoints.length - 1 : 0 ;
		}
		this.entity.blackboard.target = this.waypoints[this.index] ;
	}
}

export {Trajectory} ;
