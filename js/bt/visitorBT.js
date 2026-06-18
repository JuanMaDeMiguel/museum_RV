
import {Selector, Sequence, Condition, Action, Status} from './behaviorTree.js' ;
import {Trajectory} from '../components/trajectory.js' ;

// Visitor BT (root is a Selector):
//
//   [Selector ?]
//   ├── [Sequence →]  ← STAY PAUSED (looking at a painting)
//   │   ├── Is paused? (Condition)
//   │   └── Wait / resume trip (Action)
//   └── [Sequence →]  ← ARRIVE AT WAYPOINT
//       ├── Arrived at waypoint? (Condition)
//       └── Start pause (Action)
//
// If neither branch fires (still walking, not yet arrived) the Selector
// returns FAILURE: that's fine, it just means "keep walking", which the
// Arrive/Seek steering components already do every tick on their own.

function isPaused(entity) {
	return !!entity.blackboard.paused ;
}

function waitOrResume(entity, dt) {
	entity.blackboard.pauseTimer -= dt ;
	if (entity.blackboard.pauseTimer > 0) return Status.RUNNING ;
	entity.blackboard.paused = false ;
	entity.getComponent(Trajectory).next() ;
	return Status.SUCCESS ;
}

function arrivedAtWaypoint(entity) {
	const target = entity.blackboard.target ;
	if (!target) return false ;
	return BABYLON.Vector3.Distance(entity.position, target) < 0.5 ;
}

function startPause(entity) {
	entity.blackboard.paused = true ;
	entity.blackboard.pauseTimer = entity.getComponent(Trajectory).pauseTime ;
	return Status.SUCCESS ;
}

function buildVisitorBT() {
	return new Selector([
		new Sequence([ new Condition(isPaused), new Action(waitOrResume) ]),
		new Sequence([ new Condition(arrivedAtWaypoint), new Action(startPause) ]),
	]) ;
}

export {buildVisitorBT} ;
