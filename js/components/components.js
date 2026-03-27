
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

const COMPS = {
    box            : Box,
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
    component      : Component
}

export {COMPS} ; 
