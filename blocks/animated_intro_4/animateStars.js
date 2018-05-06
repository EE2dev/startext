let pathDurations = [];
let pathEndpoints = [];
let app; // the main class in stars.js to create the particles

const containerDiv = "div.chart";
const explosionStrength = 0.002;
const transitionSpeed = 7;
const starOptions = {
	mouseListener: false,
	texture: document.querySelector("#star-texture-white"),
	frames: createFrames(5, 80, 80),
	maxParticles: 2000,
	backgroundColor: "#111111",
	blendMode: "lighter",
	filterBlur: 50,
	filterContrast: 300,
	useBlurFilter: true,
	useContrastFilter: true
};

const myText = ["The font-family of this text", "is", "Indie Flower"];
animate(myText);

function animate(myText){
	WebFont.load({
		google: { families: ["Indie Flower"]},
		fontactive: function(familyName, fvd){ //This is called once font has been rendered in browser
			displayText(myText);
			createPaths();
			intializeStars();
			animateStars();
		},
	});
}

function displayText(_textArray) {
	let sel = d3.select(containerDiv);
  
	// add headers for all strings
	for (let i = 0; i < _textArray.length; i++) {
		sel.append("div")
		  .attr("class", () => (i === _textArray.length - 1) ? "last header h" + i : "header h" + i)
			.append("h1")
		  .attr("class", "trans")
		  .text(_textArray[i]); 
	}
}

function createPaths() {
	let bBox = d3.select(containerDiv).node().getBoundingClientRect();
	let sel = d3.select(containerDiv)
	  .append("div")
		.attr("class", "paths")
	  .append("svg")
		.attr("width", bBox.width)
		.attr("height", bBox.height);
  
	const container = d3.select(containerDiv).node().getBoundingClientRect();
  
	d3.selectAll(containerDiv + " h1")
	  .each(function(d,i) {
			let bBox = d3.select(this).node().getBoundingClientRect();
			let xTranslate = d3.select("div.chart").node().getBoundingClientRect().x;
			let pos = {};
			pos.width = bBox.width;
			pos.xStart = (container.width - bBox.width) / 2;
			pos.yStart = bBox.y + (bBox.height / 2) - container.y;

			let p = sel.append("path")
				.attr("class", "header hidden trans " + "h" + i)
				.attr("d", (d) => {
					let str =  "M" + pos.xStart + ", " + pos.yStart
				+ " L" + (pos.width + pos.xStart) + ", " + pos.yStart;
					return str;
				});
		
			let duration = p.node().getTotalLength() * transitionSpeed;
			pathDurations.push(duration);
	  });
}

function intializeStars() {
	let bBox = d3.select(containerDiv).node().getBoundingClientRect();
	d3.select(containerDiv).insert("div", ".h0")
		.attr("class", "stars")
	  .append("canvas")
		.attr("id", "view")
		.attr("width", bBox.width)
		.attr("height", bBox.height);

	starOptions.view = document.querySelector("#view");
	app = new App(starOptions);
	window.addEventListener("load", app.start());
	window.focus();
}

function starsAlongPath(path) {
	let l = path.getTotalLength();
	return function(d, i, a) {
		return function(t) {
			let p = path.getPointAtLength(t * l);
			app.spawn(p.x , p.y);
			return "translate(0,0)";
		};
	};
}

function animateStars() {
	let durations = pathDurations.concat(pathDurations);
	let chainedSel = d3.selectAll(".trans").data(durations);
	chainedTransition(chainedSel);

	function chainedTransition(_chainedSel, _index = 0) {
		const num_headers = _chainedSel.size() / 2;
		let nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
		transitionNext(nextSel);
    
		function transitionNext(_selection){
			console.log(_index);
			if (_index === num_headers - 1) {
				setTimeout( function() { 
					app.setActivate(false); // disable requestAnimationFrame calls
					transitionLast(_selection);
				}, 1000);  
			}
			else {
				// the text
				_selection.filter((d,i) => i === 0)
					.transition()
					.duration(d => d)
					.delay(1000)
					.ease(d3.easeLinear)
					.style("opacity", 1);
				// the path
				let sel = _selection.filter((d,i) => i === 1);
				sel.transition()
					.duration(d => d)
					.delay(1000)
					.ease(d3.easeLinear)
					.attrTween("transform", starsAlongPath(sel.node(), _index))
					.on ("end", function() {
						_index = _index + 1;
						if (num_headers > _index) { 
							nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
							transitionNext(nextSel);
						} 
					});
			}
		}

		function transitionLast(_selection){
			starOptions.texture = document.querySelector("#star-texture");
			let app2 = new App(starOptions);
			window.addEventListener("load", app2.start());
			window.focus();
			// the text
			_selection.filter((d,i) => i === 0)
				.transition()
				.duration(0)
				.style("opacity", 1);

			// the path
			let path = _selection.filter((d,i) => i === 1).node();
			let l = path.getTotalLength();
			
			for (let t = 0; t < 1; t = t + explosionStrength) { 
				let p = path.getPointAtLength(t * l);
				app2.spawn(p.x , p.y);        
			}

			setTimeout( function() {
				app2.setActivate(false); // disable requestAnimationFrame calls
			}, 3000);
		}
	}
}