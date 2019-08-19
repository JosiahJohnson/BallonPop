var canvas, context, startTime, lastTime, curTime, elapsedTime, delta, ballonRadius;
var nextBallon = 0;
var colors = ["#FF0000", "#FF6A00", "#FFD800", "#00C116", "#0026FF", "#B200FF", "#FF00DC", "#FFFFFF", "#A0A0A0", "#00FFFF"];
var ballons = [];

$(function ()
{
	document.addEventListener("touchstart", TouchStart, { passive: false });

	//set canvas size
	var width = $(window).width();
	var height = $(window).height();
	var ratio = 0.70;
	height = Math.round(width /ratio);
	//width = Math.round(height * ratio);
	ballonRadius = Math.round(height * 0.08);

	canvas = document.getElementById("BallonCanvas");
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
	//player.TouchEnd = false;
	//player.TouchStartX = e.touches[0].clientX;
	//player.TouchStartY = e.touches[0].clientY;
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
	//check ballon delay
	if (elapsedTime > nextBallon)
	{
		CreateBallon();

		var delay = GetRandomNumber(500, 1500);
		nextBallon = elapsedTime + delay;
	}

	//move ballons
	for (var i = 0; i < ballons.length; i++)
	{
		var ballon = ballons[i];
		var speed = delta * ballon.speed;

		ballon.curY -= speed;

		if (ballon.curX + 2 < ballon.endX)
			ballon.curX += ballon.hSpeed;
		else if (ballon.curX - 2 > ballon.endX)
			ballon.curX -= ballon.hSpeed;
		else
		{
			//set new x destination
			ballon.endX = GetRandomNumber(ballonRadius, canvas.width - ballonRadius);
		}

		//remove if off screen. splicing too early will cause shifting bug.
		if (ballon.curY < -canvas.height)
			ballons.splice(i, 1);
	}

	//console.log(ballons.length);
}

function Render()
{
	context.clearRect(0, 0, canvas.width, canvas.height);

	//draw ballons
	for (var i = 0; i < ballons.length; i++)
	{
		DrawBallon(ballons[i]);
	}
}

function GetRandomNumber(min, max)
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function CreateBallon()
{
	var minX = ballonRadius;
	var maxX = canvas.width - ballonRadius;

	var ballon = {};
	ballon.curX = GetRandomNumber(minX, maxX);
	ballon.curY = canvas.height + ballonRadius;
	ballon.endX = GetRandomNumber(minX, maxX);
	ballon.color = colors[GetRandomNumber(0, colors.length - 1)];
	ballon.speed = GetRandomNumber(90, 110) / 10;
	ballon.hSpeed = GetRandomNumber(15, 25) / 100;

	ballons.push(ballon);
}

function DrawBallon(ballon)
{
	context.beginPath();
	context.arc(ballon.curX, ballon.curY, ballonRadius, 0, 2 * Math.PI, false);
	context.fillStyle = ballon.color;
	context.fill();
	context.lineWidth = 2;
	context.strokeStyle = 'black';
	context.stroke();
}