(function(){
	var GAME_SIZE = {width:700, height: 500};
	var GAME_SCALE = 10;

	var canvas = document.getElementById('game');
	//var context = canvas.getContext('2d');

	canvas.width = GAME_SIZE.width;
	canvas.height = GAME_SIZE.height;

	var world = boxbox.createWorld(canvas, {
		scale: GAME_SCALE,
		gravity: {x:0, y:9.8}
	});

	var boundaryTemplate = {
		name: "boundary",
		shape: "square",
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
		context.fillText("(" + parseInt(pos.x) + "," + parseInt(pos.y) + ")", pos.x * GAME_SCALE, pos.y * GAME_SCALE);
	}

	var ballon = world.createEntity({
		name: "ballon", 
		shape: "circle", 
		radius: .3,
		density: 2,
		x: 2,
		y: 5,
		$fellOff: false,
		onRender: renderEntityPositionFunction,
		onStartContact: function(entity){
			if(entity.name() == "boundary" && this.$fellOff === false){
				this.clearVelocity("moving");
				BALLOON_DIRECTION *= -1;
				this.setVelocity( "moving", BALLOON_SPEED, BALLOON_DIRECTION);
			}
		},
		onImpact:function(entity){
			if(entity.name() == "nail"){
				this.clearVelocity("moving");
				this.clearForce("moving");
				this.$fellOff = true;
			}
		}
	});

	var upthrustForce = (2 * (22 / 7) * (.3 * .3)) * 9.8;
	ballon.setForce( "moving", upthrustForce, 0 );
	ballon.setVelocity( "moving", BALLOON_SPEED, BALLOON_DIRECTION);
	
	var MAX_FORCE = 100;

	var thrower = world.createEntity({
		name: "thrower",
		shape: "square",
		color: "black",
		width: 2,
		height: 7,
		x: 30,
		y: 48,
		$power:60,
		onKeydown: function(event){
			console.log(event);
			if(this.$power < 100){
				if(event.keyCode === 38){ //UP
					this.$power += 1;
				}
			}
			
			if(this.$power > 1){
				if(event.keyCode === 40){ //DOWN
					this.$power -= 1;
				}
			}
		},
		onRender: function(context){
			var entityPos = this.position();
			var entitySize = {width: 2, height: 7};

			var x = entityPos.x - entitySize.width / 2 + .3;
			var y = entityPos.y - entitySize.height / 2 + .3;
			var width = entitySize.width - .6;
			var height = entitySize.height - .6;

			//var size = {width: this.width(), height: this.height()};
			// console.log(size);

			context.fillStyle = "grey";
			context.fillRect(x * GAME_SCALE, (y + (1-this.$power/MAX_FORCE) * height) * GAME_SCALE, width * GAME_SCALE, (this.$power/MAX_FORCE) * height * GAME_SCALE);

			var powerTextX = x + width + 1;
			var powerTextY = y + height/2;

			context.fillText(this.$power + "N", powerTextX * GAME_SCALE, powerTextY * GAME_SCALE);
		}
	});

	var nail = world.createEntity({
		name: "nail", 
		shape: "circle", 
		radius: .3,
		density: 2,
		x:30,
		y:41,
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