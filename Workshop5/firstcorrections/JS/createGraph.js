function createGraph() {
	// select the svg currently on the page
	// use the width and height given in the svg "<svg width="2000" height="500"></svg>"
	// use the margins to help with the layout
	var svg = d3.select("svg"),
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width = +svg.attr("width") - margin.left - margin.right,
	height = +svg.attr("height") - margin.top - margin.bottom,
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// used to create a time object (see https://github.com/d3/d3-time-format#locale_format )
	var parseTime = d3.timeParse("%V/%Y");
	
	// now scale the x-axis based on time (see: https://github.com/d3/d3-scale#scaleTime )
	var x = d3.scaleTime()
		.rangeRound([0, width]);
	// now scale the y-axis based on the numerical values (using a linear scaling) (see: https://github.com/d3/d3-scale#scaleLinear )
	var y = d3.scaleLinear()
		.rangeRound([height, 0]); 
	
	// read in the CSV (see: https://github.com/d3/d3-dsv )
	// we need to return both an x position and y position
	// in this case, x = both when the antibody was taken (time) and when they were infected (time)
	// y = is just the antibody count (linear)
	// CORRECTION! months need to be changed to weeks
	d3.csv("../data/back-mapping-file.csv", function(d) {
		return d;
	}, function(error, data) {
		console.log(data);
		if (error) throw error;
		dataPoints = []
		data.forEach(function(d) {
			a = +d.antibody;
			year1 = d.taken_year;
			week1 = d.taken_month;
			// create date 1 as an object (see above: var parseTime = d3.timeParse("%V/%Y");)
			date1 = parseTime(week1+"/"+year1);
			year2 = d.infected_year;
			week2 = d.infected_month;
			// create date 2 as an object (see above: var parseTime = d3.timeParse("%V/%Y");)
			date2 = parseTime(week2+"/"+year2);
			dataPoints.push({"antibody":a,"taken":date1,"infected":date2})
		})
		// in this case, we are only mapping the "taken date" vs "the antibody count"
		// d3.extent will find BOTH the lower and upper bounds of an array (min and max)
		x.domain(d3.extent(dataPoints, function(d) {  return d.taken; }));
		y.domain(d3.extent(dataPoints, function(d) { return d.antibody; }));
		
		// create the x-axis
		g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x))
			.select(".domain")
			.remove();
		// create the y-axis
		g.append("g")
			.call(d3.axisLeft(y))
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Anitbody");
		// create the points
		g.selectAll("circle.datapoints")
			.data(dataPoints).enter().append("circle")
			.attr("fill", "none")
			.style("stroke", "steelblue")
			.style("stroke-width", 1.5)
			.style("stroke-opacity", .7)
			.attr("cx", function(d) { return x(d.taken)})
			.attr("cy", function(d) { return y(d.antibody)})
			.attr("r", "2px");
	});	
}