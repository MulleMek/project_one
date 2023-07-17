(function Clocks(){
	let el = {
		hours: document.getElementById('clock-hours'),
	};

	let interval = null;
	let flipflop = false;

	function draw(){
		let hours = document.getElementById('clock-hours');
		
		if (!hours) return;
		
		let d = new Date();
		
		hours.innerText = d.toLocaleTimeString().replace(/\:\d\d$/, '').replace(":", flipflop ? ":" : " ");
		flipflop = !flipflop;
	};

	draw();
	interval = setInterval(draw, 1000);
})();