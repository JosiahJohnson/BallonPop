var canvas, context, startTime, lastTime, curTime, elapsedTime, delta, nextFrame, nextBalloon, radiusWidth, radiusHeight;
var colors = ["#FF0000", "#FF6A00", "#FFD800", "#00C116", "#0026FF", "#B200FF", "#FF00DC", "#000000", "#00FFFF"];
var balloons = [];
var touchX = null;
var touchY = null;
var fps = 31;
var impactFrames = [];
var impactX = null;
var impactY = null;
var popped = [];
var poppedFrames = [];

$(function ()
{
	document.addEventListener("touchstart", TouchStart, { passive: false });

	//set canvas size
	var width = $(window).width();
	var height = $(window).height();
	var ratio = 0.70;

	if (width > 500)
		width = 500;

	height = Math.round(width /ratio);
	radiusWidth = Math.round(height * 0.10);
	radiusHeight = Math.round(radiusWidth * 1.15)

	canvas = document.getElementById("BalloonCanvas");
	context = canvas.getContext("2d");
	canvas.width = width;
	canvas.height = height;

	lastTime = performance.now();
	startTime = lastTime;
	nextBalloon = lastTime;
	nextFrame = lastTime;

	GameLoop();
});

function TouchStart(e)
{
	e.preventDefault();
	touchX = e.touches[0].clientX;
	touchY = e.touches[0].clientY;
}

function GameLoop(newtime)
{
	requestAnimationFrame(GameLoop);

	curTime = newtime;
	delta = (curTime - lastTime) / 100;
	elapsedTime = curTime - startTime;

	Update();

	if (elapsedTime > nextFrame)
		Render();

	lastTime = curTime;
}

function Update()
{
	//check balloon delay
	if (elapsedTime > nextBalloon)
	{
		CreateBalloon();

		var delay = GetRandomNumber(500, 1500);
		nextBalloon = elapsedTime + delay;
	}

	var remove = [];

	//check for popped balloons
	if (touchX != null && touchY != null)
	{
		for (var i = 0; i < balloons.length; i++)
		{
			var balloon = balloons[i];

			if (touchX > (balloon.x - radiusWidth) && touchX < (balloon.x + radiusWidth) && touchY > (balloon.y - radiusHeight) && touchY < (balloon.y + radiusHeight))
				remove.push(i);
		}

		if (remove.length > 0 && impactFrames.length == 0 && poppedFrames.length == 0)
		{
			impactFrames = [.2, .4, .6, .8, 1, .8];
			impactX = touchX;
			impactY = touchY;

			for (var i = 0; i < remove.length; i++)
			{
				var pop = {};
				pop.x = balloons[remove[i]].x;
				pop.y = balloons[remove[i]].y;
				pop.color = balloons[remove[i]].color;
				popped.push(pop);
			}

			poppedFrames = [1.1, 1.3, 1.5];
		}

		touchX = null;
		touchY = null;
	}

	for (var i = 0; i < balloons.length; i++)
	{
		//move balloons
		var balloon = balloons[i];
		var speed = delta * balloon.speed;

		balloon.y -= speed;

		if (balloon.dir == 0)
			balloon.x -= balloon.hSpeed;
		else
			balloon.x += balloon.hSpeed;

		//check if off screen
		if (balloon.y < -radiusHeight && !remove.includes(i))
			remove.push(i);
	}
	
	if (remove.length > 0)
	{
		//remove balloons
		remove.sort((a, b) => (a - b));

		for (var i = (remove.length - 1); i >= 0; i--)
		{
			balloons.splice(remove[i], 1);
		}
	}
}

function Render()
{
	context.clearRect(0, 0, canvas.width, canvas.height);

	//draw balloons
	for (var i = 0; i < balloons.length; i++)
	{
		DrawBalloon(balloons[i]);
	}

	//draw pops
	if (poppedFrames.length > 0)
	{
		var mult = poppedFrames[0];

		for (var i = 0; i < popped.length; i++)
		{
			DrawBalloon(popped[i], mult);
		}

		poppedFrames.shift();

		if (poppedFrames.length == 0)
			popped = [];
	}

	//draw impact
	if (impactFrames.length > 0)
	{
		var mult = impactFrames[0];
		DrawImpact(impactX, impactY, Math.round(radiusWidth * mult));
		impactFrames.shift();
	}

	nextFrame = elapsedTime + ((1 / fps) * 1000);
}

function GetRandomNumber(min, max)
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function CreateBalloon()
{
	var balloon = {};
	balloon.x = GetRandomNumber(radiusWidth, canvas.width - radiusWidth);
	balloon.y = canvas.height + radiusHeight;
	balloon.dir = GetRandomNumber(0, 1);
	balloon.color = colors[GetRandomNumber(0, colors.length - 1)];
	balloon.speed = GetRandomNumber(90, 110) / 10;
	balloon.hSpeed = GetRandomNumber(15, 25) / 100;

	balloons.push(balloon);
}

function DrawBalloon(balloon, mult = 1.0)
{
	var offset = Math.round((radiusWidth * mult) / 3);
	var gradient = context.createRadialGradient(balloon.x + offset, balloon.y - offset, 1, balloon.x + offset, balloon.y - offset, Math.round(radiusWidth * mult));
	gradient.addColorStop(0, "white");
	gradient.addColorStop(1, balloon.color);

	context.beginPath();
	context.ellipse(balloon.x, balloon.y, Math.round(radiusWidth * mult), Math.round(radiusHeight * mult), Math.PI, 0, 2 * Math.PI);
	context.fillStyle = gradient;
	context.fill();

	context.lineWidth = 2;
	context.strokeStyle = 'black';
	context.stroke();

	var sideLength = Math.round((radiusWidth * mult) / 7);
	var startY = balloon.y + Math.round(radiusHeight * mult);
	context.beginPath();
	context.moveTo(balloon.x, startY);
	context.lineTo(balloon.x - sideLength, startY + sideLength);
	context.lineTo(balloon.x + sideLength, startY + sideLength);
	context.lineTo(balloon.x, startY);
	context.fillStyle = balloon.color;
	context.fill();
	context.stroke();
}

function DrawImpact(x, y, size)
{
	var third = Math.round(size / 5);
	var half = Math.round((third * 3) / 2);
	context.beginPath();
	context.moveTo(x - half, y - half + third);
	context.lineTo(x - size, y - size);
	context.lineTo(x - half + third, y - half);
	context.lineTo(x, y - size);
	context.lineTo(x + half - third, y - half);
	context.lineTo(x + size, y - size);
	context.lineTo(x + half, y - half + third);
	context.lineTo(x + size, y);
	context.lineTo(x + half, y + half - third);
	context.lineTo(x + size, y + size);
	context.lineTo(x + half - third, y + half);
	context.lineTo(x, y + size);
	context.lineTo(x - half + third, y + half);
	context.lineTo(x - size, y + size);
	context.lineTo(x - half, y + half - third);
	context.lineTo(x - size, y);
	context.lineTo(x - half, y - half + third);
	context.fillStyle = "white";
	context.fill();
}

function DrawPiece(balloon)
{
	var offset = Math.round(radiusWidth / 4);
	var startX = balloon.x + offset;
	var startY = balloon.y - offset;
	context.beginPath();
	context.moveTo(startX, startY);
	context.lineTo(startX, startY - radiusHeight);
	context.arcTo(startX + radiusHeight, startY - radiusHeight, startX + radiusHeight, startY, radiusHeight);
	context.lineTo(startX, startY);
	context.stroke();
}
