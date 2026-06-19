
import {Selector, Sequence, Condition, Action, Status} from './behaviorTree.js' ;
import {Trajectory} from '../components/trajectory.js' ;

// Guide BT (same shape as the visitor BT, see visitorBT.js):
//
//   [Selector ?]
//   ├── [Sequence →]  ← PRESENTING A PAINTING (paused, looking at it)
//   │   ├── Is paused? (Condition)
//   │   └── Wait, then resume the tour (Action)
//   └── [Sequence →]  ← ARRIVED AT A WAYPOINT
//       ├── Arrived at waypoint? (Condition)
//       └── Pause-if-painting, else walk on (Action)
//
// The guide walks a Trajectory. Some waypoints are "stops" (in front of a
// painting): { pause: seconds, look: Vector3 }. At a stop the guide pauses and
// publishes blackboard.lookTarget so the trailing group (FollowGuide + Gaze)
// gathers and turns to look at the same painting. Plain waypoints are crossed
// without pausing, which lets the guide lead the group from the hall into a room.

function makeIsPaused(){
	return (entity) => !!entity.blackboard.paused ;
}

function makeWaitOrResume(){
	return (entity, dt) => {
		entity.blackboard.pauseTimer -= dt ;
		if (entity.blackboard.pauseTimer > 0) return Status.RUNNING ;
		entity.blackboard.paused = false ;
		entity.blackboard.lookTarget = null ;            // stop presenting (read by the group)
		entity.blackboard.gazeTarget = null ;            // guide stops looking at the painting
		entity.getComponent(Trajectory).next() ;
		return Status.SUCCESS ;
	} ;
}

function makeArrived(){
	return (entity) => {
		const target = entity.blackboard.target ;
		if (!target) return false ;
		return BABYLON.Vector3.Distance(entity.position, target) < 0.6 ;
	} ;
}

// stops: { [waypointIndex]: { pause: seconds, look: BABYLON.Vector3 } }
function makeOnArrive(stops){
	return (entity) => {
		const traj = entity.getComponent(Trajectory) ;
		const stop = stops[traj.index] ;
		if (stop && stop.pause > 0){
			entity.blackboard.paused     = true ;
			entity.blackboard.pauseTimer = stop.pause ;
			entity.blackboard.lookTarget = stop.look || null ;   // group looks here
			entity.blackboard.gazeTarget = stop.look || null ;   // guide looks here too
		} else {
			traj.next() ;                                 // cross plain waypoint, keep walking
		}
		return Status.SUCCESS ;
	} ;
}

function buildGuideBT(stops){
	const safeStops = stops || {} ;
	return new Selector([
		new Sequence([ new Condition(makeIsPaused()),  new Action(makeWaitOrResume()) ]),
		new Sequence([ new Condition(makeArrived()),   new Action(makeOnArrive(safeStops)) ]),
	]) ;
}

export {buildGuideBT} ;
