function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

(function(){
	var GAME_SIZE = {width:700, height: 500};
	var GAME_SCALE = 10;
	var GAME_GRAVITY = 9.8;

	var canvas = document.getElementById('game');
	var failTrials = -1;

	//var context = canvas.getContext('2d');

	canvas.width = GAME_SIZE.width;
	canvas.height = GAME_SIZE.height;

	var world = boxbox.createWorld(canvas, {
		scale: GAME_SCALE,
		gravity: {x:0, y:GAME_GRAVITY}
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

	var BALLOON_SPEED = 20;
	var BALLOON_DIRECTION = 90;


	var renderEntityPositionFunction = function(context){
		var pos = this.position();
		//console.log(pos);
		context.font="11px Verdana";
		context.fillStyle="black";
		context.fillText("(" + parseInt(pos.x) + "," + parseInt(pos.y) + ")", pos.x * GAME_SCALE, pos.y * GAME_SCALE);
		context.fillText("mass: " + round(this.$mass, 2) + " kg", (pos.x + 5) * GAME_SCALE, pos.y * GAME_SCALE);

		if(this.$speed)
			context.fillText("speed: " + this.$speed+ " m/s", (pos.x + 5) * GAME_SCALE, (pos.y + 1) * GAME_SCALE);
	}

	var ballon = world.createEntity({
		name: "ballon", 
		shape: "circle", 
		radius: .3,
		density: 2,
		$mass: 2 * ((22 / 7) * (.3 * .3)),
		x: 2,
		y: 10,
		$fellOff: false,
		$speed: BALLOON_SPEED,
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

	ballon.setForce( "moving", ballon.$mass * GAME_GRAVITY, 0 );
	ballon.setVelocity( "moving", BALLOON_SPEED, BALLOON_DIRECTION);
	
	var MAX_FORCE = 40;
	var MIN_FORCE = 2;

	var thrower = world.createEntity({
		name: "thrower",
		shape: "square",
		color: "black",
		width: 2,
		height: 7,
		x: 35.5,
		y: 48,
		$force:MAX_FORCE,
		onKeydown: function(event){
			console.log(event);
			if(this.$force < MAX_FORCE){
				if(event.keyCode === 38){ //UP
					this.$force += 1;
				}
			}
			
			if(this.$force > MIN_FORCE){
				if(event.keyCode === 40){ //DOWN
					this.$force -= 1;
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
			context.fillRect(x * GAME_SCALE, (y + (1-this.$force/MAX_FORCE) * height) * GAME_SCALE, width * GAME_SCALE, (this.$force/MAX_FORCE) * height * GAME_SCALE);

			var powerTextX = x + width + 1;
			var powerTextY = y + height/2;

			context.fillText(this.$force + "N", powerTextX * GAME_SCALE, powerTextY * GAME_SCALE);
		}
	});

	nailTemplate = {
		name: "nail", 
		shape: "polygon",
		points: [{x: 0.5, y: -1}, {x: 1, y: 0}, {x: 0, y: 0}],
		//radius: .3,
		density: .4,
		$mass: .4 * 0.5 * 1 * 1,//2 * ((22 / 7) * (.3 * .3)),
		x:35,
		y:36,
		$thrown:true,
		onRender: function(context){
			renderEntityPositionFunction.call(this, context);
			if(this.$thrown){
				this.color("red");
			}
			else{
				this.color("black");	
			}
		},
		onKeydown: function(event){
			if(event.keyCode === 32){
				if(this.$thrown === false){
					console.log(thrower.$force);
					this.setForce("upward", thrower.$force, 0);
					this.$thrown = true;
				}
			}
		},
		onStartContact: function(entity){
			if(entity.name() === "thrower"){
				this.$thrown = false;
			}
			failTrials++;
			console.log(failTrials);
		}
	};

	var nail = world.createEntity(nailTemplate);

	world.onTick(function(){
		if(nail.position().y < -2){
			nail.destroy()
			nail = world.createEntity(nailTemplate);
		}
	});

	world.onRender(function(context){
		context.fillStyle = "black";
		context.font="13px Verdana";
		var t = failTrials > -1 ? failTrials : 0;
		context.fillText("Failed Trials: " + t, 22, 10);
	});


	//nail.applyImpulse(132, 0);
	//nail.setVelocity("to kill", 12.5, 0);
	//nail.applyImpulse(141.3, 0);

})()