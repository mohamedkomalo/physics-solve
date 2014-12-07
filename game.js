(function(){
	var GAME_SIZE = {width:700, height: 500};


	var canvas = document.getElementById('game');
	canvas.width = GAME_SIZE.width;
	canvas.height = GAME_SIZE.height;

	var world = boxbox.createWorld(canvas, {scale:10,
		gravity: {x:0, y:9.8}});


	var ground = world.createEntity({
		name: "ground",
		shapre: "square",
		color: "red",
		type: "static",
		width: GAME_SIZE.width,
		height:2,
		y: 30,
	})

	var ground = world.createEntity({
		name: "ground",
		shapre: "square",
		color: "red",
		type: "static",
		width: 2,
		height:GAME_SIZE.height,
		x: 48
	})

	var ballon = world.createEntity({
		name: "ballon", 
		shape: "circle", 
		radius: 1,
		density: 2,
		onTick:function(){
			//console.log(ballon.position());
			//world.createJoint(ballon, ground, {type:"distance"});
		},
		onImpact:function(entity){
			if(entity.name() == "nail"){
				this.clearVelocity("moving");
				this.clearForce("moving");
				console.log('done');
			}
		},
		x:10,
		y:5
	});
	
	var nail = world.createEntity({
		name: "nail", 
		shape: "circle", 
		radius: 1,
		density: 2,
		onTick:function(){
			console.log(ballon.position());
			//world.createJoint(ballon, ground, {type:"distance"});
		},
		onRender: function(){

		},
		y:30,
		x:30
	});

	//nail.applyImpulse(132, 0);
	var upthrustForce = (2 * (22 / 7) * (1 * 1)) * 9.8;
	console.log(upthrustForce);
	ballon.setForce( "moving", upthrustForce, 0 );
	ballon.setVelocity( "moving", 10, 90 );
	//nail.setVelocity("to kill", 12.5, 0);
	nail.applyImpulse(141.3, 0);

})()