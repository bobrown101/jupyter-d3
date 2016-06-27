/* GLOBALS */

var width  = 1000;           // width of svg image
var height = 1000;           // height of svg image
var margin = 20;            // amount of margin around plot area
var pad = margin / 2;       // actual padding amount
var radius = 15;             // fixed node radius
var yfixed = 400 - pad - radius;  // y position for all nodes
var xfixed = pad + radius;

var json_data = $data;

/* HELPER FUNCTIONS */

// Generates a tooltip for a SVG circle element based on its ID
function addTooltip(circle) {
    var x = parseFloat(circle.attr("cx"));
    var y = parseFloat(circle.attr("cy"));
    var r = parseFloat(circle.attr("r"));
    var text = circle.attr("id");

    var tooltip = d3.select("#maindiv${divnum}")
        .append("text")
        .text(text)
        .attr("x", x)
        .attr("y", y)
        .attr("dy", -r * 2)
        .attr("id", "tooltip");

    var offset = tooltip.node().getBBox().width / 2;

    if ((x - offset) < 0) {
        tooltip.attr("text-anchor", "start");
        tooltip.attr("dx", -r);
    }
    else if ((x + offset) > (width - margin)) {
        tooltip.attr("text-anchor", "end");
        tooltip.attr("dx", r);
    }
    else {
        tooltip.attr("text-anchor", "middle");
        tooltip.attr("dx", 0);
    }
}

/**
 * Will return an array of links that have the "source"
 */
function outgoingLinks(node) {
  return d3.select("#plot")
  .selectAll(".link")
  .filter(function(d) {
    // console.log("---------");
    // console.log("link source: " + d.source.id);
    // console.log("node id: " + node.attr("id"))
    // console.log(d.source.id == node.attr("id"));
    return d.source.id == node.attr("id");
  });
}

function incomingLinks(node) {
  return d3.select("#plot")
  .selectAll(".link")
  .filter(function(d) {
    // console.log("---------");
    // console.log("link source: " + d.source.id);
    // console.log("node id: " + node.attr("id"))
    // console.log(d.source.id == node.attr("id"));
    return d.target.id == node.attr("id");
  });
}

function highlightItems(color, items){
  items.style({"stroke":color, "stroke-width": "8px", "opacity": "1"});
}

function unhighlightItems(items) {
  items.style({"stroke":"", "stroke-width": "", "opacity": ""});
}

/* MAIN DRAW METHOD */

// Draws an arc diagram for the provided undirected graph
function arcDiagram(graph) {
    // create svg image

    d3.select("#maindiv${divnum}").selectAll("svg").remove();

    var svg  = d3.select("#maindiv${divnum}")
        .append("svg")
        .attr("id", "arc")
        .attr("width", width)
        .attr("height", height);

    // draw border around svg image
    // svg.append("rect")
    //     .attr("class", "outline")
    //     .attr("width", width)
    //     .attr("height", height);

    // create plot area within svg image
    var plot = svg.append("g")
        .attr("id", "plot")
        // .attr("transform", "translate(" + pad + ", " + pad + ")")
        .attr("wdith", width + "px")
        .attr("height", height + "px");


    graph.links.forEach(function(d, i) {
      // fix graph links to map to objects instead of indices
        d.source = isNaN(d.source) ? d.source : graph.nodes[d.source];
        d.target = isNaN(d.target) ? d.target : graph.nodes[d.target];
    });

    graph.nodes.forEach(function(d, i) {
      // if there is an attribute "modularitygroup" convert it to "group"
      //thats what d3 uses to generate a unique color per group

      d.group = "modularitygroup" in d ? d.modularitygroup : 0;
    })

    // must be done AFTER links are fixed
    linearLayout(graph.nodes);

    // draw links first, so nodes appear on top
    drawLinks(graph.links);

    // draw nodes last
    drawNodes(graph.nodes);
}

// Layout nodes linearly, sorted by group
function linearLayout(nodes) {

    // sort nodes by group
    nodes.sort(function(a, b) {
        return a.group - b.group;
    })

    // used to scale node index to x position
    var xscale = d3.scale.linear()
        .domain([0, nodes.length - 1])
        .range([radius, width - margin - radius]);

    // // calculate pixel location for each node
    // nodes.forEach(function(d, i) {
    //     d.x = xscale(i);
    //     d.y = yfixed;
    // });

    // calculate pixel location for each node
    nodes.forEach(function(d, i) {
        d.x = xfixed;
        d.y = xscale(i);
    });
}

// Draws nodes on plot
function drawNodes(nodes) {
    // used to assign nodes color by group
    var color = d3.scale.category20();

    d3.select("#plot").selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("group", function(d, i) {return d.group; })
        .attr("id", function(d, i) { return d.id; })
        .attr("cx", function(d, i) { return d.x; })
        .attr("cy", function(d, i) { return d.y; })
        // .attr("r",  function(d, i) { return radius; })
        .attr("r",  function(d, i) { return d.centrality * radius; })
        .style("fill",   function(d, i) { return color(d.group); })
        // .on("mouseover", function(d, i) { addTooltip(d3.select(this)); })
        // .on("mouseout",  function(d, i) { d3.select("#tooltip").remove(); })
        // .on('mouseover', function(d){
        //   console.log(d);
        //   var nodeSelection = d3.select(this).style({"stroke-width":"4px", "stroke":"black"});
        //   nodeSelection.select("text").style({opacity:'1.0'});
        // })
        .on('mouseover', function(d){
          highlightItems("green", outgoingLinks(d3.select(this)))
          highlightItems("red", incomingLinks(d3.select(this)))
        })
        .on('mouseout', function(d){
          unhighlightItems(outgoingLinks(d3.select(this)))
          unhighlightItems(incomingLinks(d3.select(this)))
        });
}

// Draws nice arcs for each link on plot
function drawLinks(links) {
    // scale to generate radians (just for lower-half of circle)
    var radians = d3.scale.linear()
        .domain([0,0]);
        // .domain([Math.PI / 2, 3 * Math.PI / 2]);
        // .domain([-Math.PI / 2, Math.PI / 2]);

    var arc = d3.svg.arc()
      .startAngle(0)
      .endAngle(Math.PI);
    // // path generator for arcs (uses polar coordinates)
    // var arc = d3.svg.line.radial()
    //     .interpolate("basis")
    //     .tension(0)
    //     .angle(function(d) { return radians(d);})

    // add links
    d3.select("#plot").selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("transform", function(d, i) {
            // // arc will always be drawn around (0, 0)
            // // shift so (0, 0) will be between source and target
            // var xshift = d.source.x + (d.target.x - d.source.x) / 2;
            // var yshift = yfixed;
            // return "translate(" + xshift + ", " + yshift + ")";

            // arc will always be drawn around (0, 0)
            // shift so (0, 0) will be between source and target
            var xshift = xfixed;
            var yshift = d.source.y + (d.target.y - d.source.y) / 2;
            return "translate(" + xshift + ", " + yshift + ")";

        })
        .attr("d", function(d, i) {
            // get y distance between source and target
            var ydist = Math.abs(d.source.y - d.target.y);

            // set arc radius based on y distance
            // arc.radius(ydist / 2);
            arc.innerRadius(ydist / 2);
            arc.outerRadius(ydist / 2);

            // want to generate 1/3 as many points per pixel in x direction
            var points = d3.range(0, Math.ceil(ydist / 3));

            // set radian scale domain
            radians.domain([0, points.length - 1]);

            // return path for arc
            return arc(points);
        });
}

arcDiagram(json_data);
