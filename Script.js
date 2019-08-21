var canvas, context, startTime, lastTime, curTime, elapsedTime, delta, nextFrame, nextBalloon, radiusWidth, radiusHeight, popSound;
var colors = ["#FF0000", "#FF6A00", "#FFD800", "#00C116", "#0026FF", "#B200FF", "#FF00DC", "#C0C0C0", "#00FFFF"];
var balloons = [];
var touchX = null;
var touchY = null;
var fps = 31;

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

	popSound = new Audio("pop.mp3");

	GameLoop();
});

function TouchStart(e)
{
	popSound.play();
	popSound.pause();

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

		touchX = null;
		touchY = null;
	}

	if (remove.length > 0)
		popSound.play();

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

function DrawBalloon(balloon)
{
	var offset = Math.round(radiusWidth / 3);
	var gradient = context.createRadialGradient(balloon.x + offset, balloon.y - offset, 1, balloon.x + offset, balloon.y - offset, radiusWidth);
	gradient.addColorStop(0, "white");
	gradient.addColorStop(1, balloon.color);

	context.beginPath();
	context.ellipse(balloon.x, balloon.y, radiusWidth, radiusHeight, Math.PI, 0, 2 * Math.PI);
	context.fillStyle = gradient;
	context.fill();

	context.lineWidth = 2;
	context.strokeStyle = 'black';
	context.stroke();
}