
import {Component}      from  './component.js' ; 
import {Sphere}         from  './sphere.js' ; 
import {Box}            from  './box.js' ; 
import {Sky}            from  './sky.js' ; 
import {Ground}         from  './ground.js' ; 
import {Wall}           from  './wall.js' ; 
import {Poster}         from  './poster.js' ; 
import {Position}       from  './position.js' ; 
import {Rotation}       from  './rotation.js' ; 
import {AnchoredTo}     from  './anchoredTo.js' ; 
import {LookAtPoint}    from  './lookAtPoint.js' ;
import {LookAtCamera}   from './lookAtCamera.js' ; 
import {BrownianMotion} from './brownianMotion.js' ;
import {Model}          from './model.js' ;
import {Person}         from './person.js' ;
import {Seek}           from './seek.js' ;
import {Arrive}          from './arrive.js' ;
import {Trajectory}      from './trajectory.js' ;
import {LookAtForward}   from './lookAtForward.js' ;
import {BehaviorTree}    from './behaviorTree.js' ;

const COMPS = {
    box            : Box,
    model          : Model,
    person         : Person,
    sphere         : Sphere,
    wall           : Wall,
    sky            : Sky,
    ground         : Ground,
    poster         : Poster,
    position       : Position,
    rotation       : Rotation,
    anchoredTo     : AnchoredTo,
    lookAtPoint    : LookAtPoint,
    lookAtCamera   : LookAtCamera,
    brownianMotion : BrownianMotion,
    seek           : Seek,
    arrive         : Arrive,
    trajectory     : Trajectory,
    lookAtForward  : LookAtForward,
    behaviorTree   : BehaviorTree,
    component      : Component
}

export {COMPS} ; 
