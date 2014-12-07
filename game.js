(function(){
	var GAME_SIZE = {width:700, height: 500};


	var canvas = document.getElementById('game');
	//var context = canvas.getContext('2d');

	canvas.width = GAME_SIZE.width;
	canvas.height = GAME_SIZE.height;

	var world = boxbox.createWorld(canvas, {
		scale:10,
		gravity: {x:0, y:9.8}
	});

	var boundaryTemplate = {
		name: "boundary",
		shapre: "square",
		color: "lightblue",
		borderColor: "transparent",
		type: "static",
		width:GAME_SIZE.width,
		height:GAME_SIZE.height
	};

	var leftBoundary = world.createEntity(boundaryTemplate, { width: 2, x: 1 });
	var rightBoundary = world.createEntity(boundaryTemplate, { width: 2, x: 69 });
	var bottomBoundary = world.createEntity(boundaryTemplate, { height: 2, y: 49 });

	var BALLOON_SPEED = 10;
	var BALLOON_DIRECTION = 90;


	var renderEntityPositionFunction = function(context){
		var pos = this.position();
		//console.log(pos);
		context.fillText("(" + parseInt(pos.x) + "," + parseInt(pos.y) + ")", pos.x * 10, pos.y * 10);
	}

	var ballon = world.createEntity({
		name: "ballon", 
		shape: "circle", 
		radius: .3,
		density: 2,
		x:10,
		y:5,
		onRender: renderEntityPositionFunction,
		onStartContact: function(entity){
			if(entity.name() == "boundary"){
				this.clearVelocity("moving");
				BALLOON_DIRECTION *= -1;
				this.setVelocity( "moving", BALLOON_SPEED, BALLOON_DIRECTION);
			}
		},
		onImpact:function(entity){
			if(entity.name() == "nail"){
				this.clearVelocity("moving");
				this.clearForce("moving");
			}
		}
	});

	var upthrustForce = (2 * (22 / 7) * (.3 * .3)) * 9.8;
	ballon.setForce( "moving", upthrustForce, 0 );
	 ballon.setVelocity( "moving", BALLOON_SPEED, BALLOON_DIRECTION);
	
	var nail = world.createEntity({
		name: "nail", 
		shape: "circle", 
		radius: .3,
		density: 2,
		y:30,
		x:30,
		$thrown: false,
		onRender: renderEntityPositionFunction,
		onKeydown: function(event){
			if(this.$thrown === false){
				this.applyImpulse(10, 0);
				this.$thrown = true;
			}
		}
	});

	//nail.applyImpulse(132, 0);
	//nail.setVelocity("to kill", 12.5, 0);
	//nail.applyImpulse(141.3, 0);

})()