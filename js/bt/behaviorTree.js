
const Status = {
	SUCCESS : "SUCCESS",
	FAILURE : "FAILURE",
	RUNNING : "RUNNING"
} ;

class Node {
	tick(entity, dt) { return Status.FAILURE ; }
}

// Selector ("?") : tries children left-to-right, stops at first non-FAILURE.
class Selector extends Node {
	constructor(children) { super() ; this.children = children ; }
	tick(entity, dt) {
		for (const child of this.children) {
			const status = child.tick(entity, dt) ;
			if (status !== Status.FAILURE) return status ;
		}
		return Status.FAILURE ;
	}
}

// Sequence ("->") : runs children left-to-right, stops at first non-SUCCESS.
class Sequence extends Node {
	constructor(children) { super() ; this.children = children ; }
	tick(entity, dt) {
		for (const child of this.children) {
			const status = child.tick(entity, dt) ;
			if (status !== Status.SUCCESS) return status ;
		}
		return Status.SUCCESS ;
	}
}

// Decorator: inverts SUCCESS/FAILURE, leaves RUNNING untouched.
class Inverter extends Node {
	constructor(child) { super() ; this.child = child ; }
	tick(entity, dt) {
		const status = this.child.tick(entity, dt) ;
		if (status === Status.SUCCESS) return Status.FAILURE ;
		if (status === Status.FAILURE) return Status.SUCCESS ;
		return status ;
	}
}

class Succeeder extends Node {
	constructor(child) { super() ; this.child = child ; }
	tick(entity, dt) { this.child.tick(entity, dt) ; return Status.SUCCESS ; }
}

class Failer extends Node {
	constructor(child) { super() ; this.child = child ; }
	tick(entity, dt) { this.child.tick(entity, dt) ; return Status.FAILURE ; }
}

// Leaf: Boolean question, never RUNNING.
class Condition extends Node {
	constructor(fn) { super() ; this.fn = fn ; }
	tick(entity, dt) { return this.fn(entity, dt) ? Status.SUCCESS : Status.FAILURE ; }
}

// Leaf: performs a game action, fn must return a Status.
class Action extends Node {
	constructor(fn) { super() ; this.fn = fn ; }
	tick(entity, dt) { return this.fn(entity, dt) ; }
}

export {Status, Node, Selector, Sequence, Inverter, Succeeder, Failer, Condition, Action} ;
