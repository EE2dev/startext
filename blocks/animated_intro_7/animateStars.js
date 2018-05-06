let pathDurations = [];
let pathEndpoints = [];
let app; // the main class in stars.js to create the particles

const containerDiv = "div.chart";
const explosionStrength = 0.002;
const transitionSpeed = 7;
const showPaths = false;
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

const myText = ["My favorite dish is", "pizza", "and", "ice cream"];
animate(myText);

function animate(myText){
	WebFont.load({
		google: { families: ['Indie Flower']},
		fontactive: function(familyName, fvd){ //This is called once font has been rendered in browser
			createTextpaths(myText);
			createPaths();
			calculatePathEndpoints();
			intializeStars();
			animateStars();
		},
	});
}

function createTextpaths(_textArray) {
	let sel = d3.select(containerDiv)
		.append("div")
		.attr("class", "header")
		.append("svg")
		.attr("width", document.body.clientWidth)
		.attr("height", document.body.clientHeight-8);

	createGradient(sel, "grad1");
  
	// add textpaths for all strings 
	for (let i = 0; i < _textArray.length; i++) {
		sel.append("text")
			.attr("class", "headline")
			.attr("class", () => (i < _textArray.length - 1) ? "headline no-effect h" + i : "headline effect h" + i)
			.attr("dy", "0.7em")
			.append("textPath")
			.attr("class", () => (i < _textArray.length - 1) ? "trans no-effect" : "trans effect")
			.attr("href", "#textpath" + i)
			.style("text-anchor","middle")
			.attr("startOffset","50%")
			.text(_textArray[i]); 
	}
}

function createGradient(selection, idValue) {
	let lg = selection.append("defs")
		.append("linearGradient")
		.attr("id", idValue);

	lg.append("stop")
		.attr("offset", "0%")
		.style("stop-color", "rgb(255, 0, 171)")
		.style("stop-opacity", 1);
  
	lg.append("stop")
		.attr("offset", "25%")
		.style("stop-color", "rgb(0, 168, 255)")
		.style("stop-opacity", 1);

	lg.append("stop")
		.attr("offset", "50%")
		.style("stop-color", "rgb(171, 0, 255)")
		.style("stop-opacity", 1);

	lg.append("stop")
		.attr("offset", "75%")
		.style("stop-color", "rgb(255, 171, 0)")
		.style("stop-opacity", 1);

	lg.append("stop")
		.attr("offset", "100%")
		.style("stop-color", "rgb(168, 255, 0)")
		.style("stop-opacity", 1);
}

function createPaths() {
	const container = d3.select(containerDiv).node().getBoundingClientRect();
	const selTP =  d3.selectAll(containerDiv + " text.headline");
	let selS =  d3.selectAll(containerDiv + " svg");

	selTP.each(function(d, i){
		let pos = {};
		let str;
		pos.width = container.width;
		pos.xStart = 0;
		pos.yStart = 100 + i * 50;

		selS.append("path")
			.attr("class", "headline trans" + " h" + i)
			.attr("id", "textpath" + i)
			.attr("d", () => {
				if (i < selTP.size() - 1) {
					str =  "M" + pos.xStart + ", " + pos.yStart + " L" + (pos.width + pos.xStart) + ", " + pos.yStart;
				} else {
					const controlPoint = 50;
					let curveHeight = 30;
					let iTimes = Math.floor(pos.width / controlPoint);
					if (iTimes % 2 === 0) { iTimes -= 1;}
					const r = (pos.width - iTimes * controlPoint) / 2;

					str =  "M" + pos.xStart + ", " + pos.yStart + " l " + r + ", 0";
					for (let i = 1; i <= iTimes; i++) {
						curveHeight = curveHeight * -1;
						str += " q " + (controlPoint / 2) + " " + curveHeight + " " + controlPoint + " 0 ";
					}
					str += " l " + r + ", 0";
				}
				return str;
			});
	});
}

function calculatePathEndpoints() {
	d3.selectAll("text.headline")
		.each(function(d,i) {
			let selPath = d3.select("path.headline.h" + i).node();
			let pathLength = selPath.getTotalLength();
			let textLength = d3.select(this).node().getComputedTextLength();
			let start = pathLength * .5 - textLength / 2;
			let length = textLength;
			pathEndpoints.push({start, length});
			let duration = textLength * transitionSpeed;
			pathDurations.push(duration);
			if (showPaths) { // show points for illustration
				showEndpoints(selPath, pathLength, textLength); 
			}
		});
}

function showEndpoints(_selection, pathLength, textLength) {
	d3.selectAll("path")
		.style("stroke", "yellow")
		.style("stroke-width", "2px")
		.style("stroke-dasharray", 5);
	let startPoint = _selection.getPointAtLength(pathLength * .5 - textLength / 2);
	let endPoint = _selection.getPointAtLength(pathLength * .5 + textLength / 2);
	d3.select("svg").append("circle").attr("cx", startPoint.x).attr("cy", startPoint.y).attr("r", 10).attr("fill", "lightblue").attr("opacity", .6);      
	d3.select("svg").append("circle").attr("cx", endPoint.x).attr("cy", endPoint.y).attr("r", 10).attr("fill", "lightblue").attr("opacity", .6);
}

function intializeStars() {
	let bBox = d3.select("div.header").node().getBoundingClientRect();
	let divh = d3.select(containerDiv)
		.insert("div", "div.header")
		.attr("class", "stars");

	divh.append("canvas")
		.attr("id", "view")
		.attr("width", bBox.width)
		.attr("height", bBox.height);

	starOptions.view = document.querySelector("#view");
  
	let background = new Image();
	background.src = backgroundImage;
	starOptions.backgroundImage = background;

	app = new App(starOptions);
	window.addEventListener("load", app.start());
	window.focus();
}

function starsAlongPath(path, index) {
	return function(d, i, a) {
		return function(t) {
			let p = path.getPointAtLength(pathEndpoints[index].start + t * pathEndpoints[index].length);
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
			let start = pathEndpoints[pathEndpoints.length-1].start;
			let length = pathEndpoints[pathEndpoints.length-1].length;
      
			for (let t = 0; t < 1; t = t + explosionStrength) { 
				let p = path.getPointAtLength(start + t * length);
				app2.spawn(p.x , p.y);        
			}

			setTimeout( function() {
				app2.setActivate(false); // disable requestAnimationFrame calls
			}, 3000);
		}
	}
}