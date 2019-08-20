var canvas, context, startTime, lastTime, curTime, elapsedTime, delta, balloonRadius;
var nextBalloon = 0;
var colors = ["#FF0000", "#FF6A00", "#FFD800", "#00C116", "#0026FF", "#B200FF", "#FF00DC", "#FFFFFF", "#A0A0A0", "#00FFFF"];
var balloons = [];
var touchX = null;
var touchY = null;

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
	balloonRadius = Math.round(height * 0.10);

	canvas = document.getElementById("BalloonCanvas");
	context = canvas.getContext("2d");
	canvas.width = width;
	canvas.height = height;

	lastTime = (new Date()).getTime();
	startTime = lastTime;
	GameLoop();
});

function TouchStart(e)
{
	e.preventDefault();
	touchX = e.touches[0].clientX;
	touchY = e.touches[0].clientY;
}

function GameLoop()
{
	requestAnimationFrame(GameLoop);

	curTime = (new Date()).getTime();
	delta = (curTime - lastTime) / 100;
	elapsedTime = curTime - startTime;

	Update();
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
		console.log(touchX);

		for (var i = 0; i < balloons.length; i++)
		{
			var balloon = balloons[i];

			if (touchX > (balloon.x - balloonRadius) && touchX < (balloon.x + balloonRadius) && touchY > (balloon.y - balloonRadius) && touchY < (balloon.y + balloonRadius))
				remove.push(i);
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
		if (balloon.y < -balloonRadius && !remove.includes(i))
			remove.push(i);
	}

	//remove balloons
	remove.sort((a, b) => (a - b));
	for (var i = remove.length - 1; i >= 0; i--)
	{
		balloons.splice(remove[i], 1);
	}

	//console.log(balloons.length);
}

function Render()
{
	context.clearRect(0, 0, canvas.width, canvas.height);

	//draw balloons
	for (var i = 0; i < balloons.length; i++)
	{
		DrawBalloon(balloons[i]);
	}
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
	balloon.x = GetRandomNumber(balloonRadius, canvas.width - balloonRadius);
	balloon.y = canvas.height + balloonRadius;
	balloon.dir = GetRandomNumber(0, 1);
	balloon.color = colors[GetRandomNumber(0, colors.length - 1)];
	balloon.speed = GetRandomNumber(90, 110) / 10;
	balloon.hSpeed = GetRandomNumber(15, 25) / 100;

	balloons.push(balloon);
}

function DrawBalloon(balloon)
{
	context.beginPath();
	context.arc(balloon.x, balloon.y, balloonRadius, 0, 2 * Math.PI, false);
	context.fillStyle = balloon.color;
	context.fill();

	context.lineWidth = 2;
	context.strokeStyle = 'black';
	context.stroke();

	context.beginPath();
	context.arc(balloon.x + Math.round(balloonRadius / 4), balloon.y - Math.round(balloonRadius / 4), Math.round(balloonRadius / 3), 0, 2 * Math.PI, false);
	context.fillStyle = "white";
	context.fill();
}
