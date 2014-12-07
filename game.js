var KEYCODES_ARROWS_UP = 38;
var KEYCODES_ARROWS_DOWN = 40;
var KEYCODES_SPACE = 32;

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

(function(){
	var GAME_SIZE = {width:700, height: 500};
	var GAME_SCALE = 10;
	var GAME_GRAVITY = 9.8;

	var currentLevel = {
		name: "Bomba level",
		targets: [
		{negative: true, speed:10, direction: -90, x: 12, y:10, radius: .3},
		{negative: false, speed:10, direction: 90, x: 50, y:20, radius: .3},
		{negative: true, speed:10, direction:-90, x: 40, y:30, radius: .3}],
		rocket: {
			minForce: 30,
			maxForce: 2,
			density: .4
		}
	}
	
	var failTrials = -1;

	var canvas = document.getElementById('game');

	canvas.width = GAME_SIZE.width;
	canvas.height = GAME_SIZE.height;

	var worldConfig = {
		scale: GAME_SCALE,
		gravity: {x:0, y:GAME_GRAVITY}
	};
	var world = boxbox.createWorld(canvas, worldConfig);

	var createNewLevel = function(level){

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

		var renderEntityPositionFunction = function(context){
			var pos = this.position();
			//console.log(pos);
			context.font="11px Verdana";
			context.fillStyle="black";
			context.fillText("(" + parseInt(pos.x) + "," + parseInt(pos.y) + ")", (pos.x+1) * GAME_SCALE, pos.y * GAME_SCALE);
			context.fillText("mass: " + round(this.$mass, 2) + " kg", (pos.x + 5) * GAME_SCALE, pos.y * GAME_SCALE);

			if(this.$speed)
				context.fillText("speed: " + this.$speed+ " m/s", (pos.x + 5) * GAME_SCALE, (pos.y + 1) * GAME_SCALE);
		}

		var targetTemplate = {
			name: "misdirectionTarget", 
			shape: "circle",
			density: 2,
			$fellOff: false,
			onRender: renderEntityPositionFunction,
			init: function(){
				this.setForce( "moving", this.$mass * GAME_GRAVITY, 0 );
				this.setVelocity( "moving", this.$speed, this.$direction);
			},
			onStartContact: function(entity){
				if(entity.name() == "boundary" && this.$fellOff === false){
					this.clearVelocity("moving");
					this.$direction *= -1;
					this.setVelocity( "moving", this.$speed, this.$direction);
				}
			},
			onImpact:function(entity){
				if(entity.name() == "rocket"){
					setTimeout(function(){
							world.pause();
							world.cleanup(worldConfig);
							createNewLevel();
					}, 1);
				}
			}
		};

		for(var i=0; i<level.targets.length; i++){
			world.createEntity(targetTemplate, {
				name: level.targets[i].negative ? "misdirectionTarget" : "target",
				color: level.targets[i].negative ? "red" : "lightblue",
				x: level.targets[i].x,
				y: level.targets[i].y,
				radius: level.targets[i].radius,
				$mass: targetTemplate.density * ((22 / 7) * (level.targets[i].radius * level.targets[i].radius)),
				$speed: level.targets[i].speed,
				$direction: level.targets[i].direction,

			})
		}

		var launcher = world.createEntity({
			name: "launcher",
			shape: "square",
			color: "lightblue",
			width: 2,
			height: 7,
			x: 35.5,
			y: 48,
			$force:level.rocket.maxForce,
			onKeydown: function(event){
				if(event.keyCode === KEYCODES_ARROWS_UP){ //UP
					if(this.$force < level.rocket.maxForce){
						if(event.ctrlKey){
							this.$force += 0.1;
						}
						else{
							this.$force += 1;
						}
						this.$force = round(this.$force, 1);
					}
				}
				else if(event.keyCode === KEYCODES_ARROWS_DOWN){ //DOWN
					if(this.$force > level.rocket.minForce){
						if(event.ctrlKey){
							this.$force -= 0.1;
						}
						else{
							this.$force -= 1;
						}
						this.$force = round(this.$force, 1);
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

				context.fillStyle = "white";
				context.fillRect(x * GAME_SCALE, (y + (1-this.$force/level.rocket.maxForce) * height) * GAME_SCALE, width * GAME_SCALE, (this.$force/level.rocket.maxForce) * height * GAME_SCALE);

				var powerTextX = x + width + 1;
				var powerTextY = y + height/2;

				context.fillStyle = "black";
				context.fillText(this.$force + "N", powerTextX * GAME_SCALE, powerTextY * GAME_SCALE);
			}
		});

		var rocketTemplate = {
			name: "rocket", 
			shape: "polygon",
			points: [{x: 0.5, y: -1}, {x: 1, y: 0}, {x: 0, y: 0}],
			//radius: .3,
			density: level.rocket.density,
			$mass: level.rocket.density * 0.5 * 1 * 1,//2 * ((22 / 7) * (.3 * .3)),
			x:35,
			y:36,
			$thrown:true,
			onRender: function(context){
				renderEntityPositionFunction.call(this, context);
				if(this.$thrown){
					this.color("lightblue");
				}
				else{
					this.color("grey");	
				}
			},
			onKeydown: function(event){
				if(event.keyCode === KEYCODES_SPACE){
					if(this.$thrown === false){
						this.setForce("upward", launcher.$force, 0);
						this.$thrown = true;
					}
				}
			},
			onStartContact: function(entity){
				if(entity.name() === "launcher"){
					this.$thrown = false;
				}
				failTrials++;
				console.log(failTrials);
			}
		};

		var rocket = world.createEntity(rocketTemplate);

		world.onTick(function(){
			if(rocket.position().y < -2){
				rocket.destroy()
				rocket = world.createEntity(rocketTemplate);
			}
		});

		world.onRender(function(context){
			context.fillStyle = "black";
			context.font="13px Verdana";
			var t = failTrials > -1 ? failTrials : 0;
			context.fillText("Failed Trials: " + t, 22, 10);
		});
	};

	createNewLevel(currentLevel);
})()