var width = 1000;
var height = 1000;
var default_color = "grey"
var color = d3.scale.category20();

var graph = $data;


//will return links outgoing from node
function outgoingLinks(node) {
  return d3.select("#maindiv${divnum}")
  .selectAll(".link")
  .filter(function(d) {
    return d.source.id == node[0][0].__data__.id;
  });
}

//will return links incoming from node
function incomingLinks(node) {
  return d3.select("#maindiv${divnum}")
  .selectAll(".link")
  .filter(function(d) {
    return d.target.id == node[0][0].__data__.id;
  });
}

//will highlight all items with color
function highlightItems(color, items){
  items.style({"stroke":color, "opacity": "1"});
}

//will reset all items to default color
function unhighlightItems(items) {
  items.style({"stroke":default_color});
}

var force = d3.layout.force()
    .charge(-1500)
    .linkDistance(200)
    .size([width, height]);


d3.select("#maindiv${divnum}").selectAll("svg").remove();

var svg = d3.select("#maindiv${divnum}").append("svg")
    .attr("width", width)
    .attr("height", height);




force.nodes(graph.nodes).links(graph.links).start();

//Create all the line svgs but without locations yet <line class="link" style="stroke-width: 1px;"></line>

var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function(d, i) { console.log(d); return d.weight});

//Do the same with the circles for the nodes - no

var opacity_toggle = false;

var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", function(d) {

      if("algorithm_filter" in d){
        return 15*d.algorithm_filter
      }
      return 10

    })
    .style("opacity", 1)
    .style("fill", function (d) {
        return color(d.group);
    })
    .call(force.drag)
    // .on('mouseover', connectedNodes)
    // .on('mouseout', connectedNodes)
    .on('mouseover', function(d){
      highlightItems("green", outgoingLinks(d3.select(this)))
      highlightItems("red", incomingLinks(d3.select(this)))
    })
    .on('mouseout', function(d){
      unhighlightItems(outgoingLinks(d3.select(this)))
      unhighlightItems(incomingLinks(d3.select(this)))
    })
    .on('click', function(d) {
      if(opacity_toggle){
        link.style("opacity", ".2");
      }else{
        link.style("opacity", "1");
      }
      opacity_toggle = !opacity_toggle;
    })
    .on("dblclick",function(d){
      // console.log("Hello world");
      d.fixed = ! d.fixed;

      if(d.fixed){
        d3.select(this).style("stroke", "black").style("stroke-width", "4px");
      }else{
        d3.select(this).style("stroke", "black").style("stroke-width", "0px");
      }

    });

//Now we are giving the SVGs co-ordinates - looks like the force layout is generating the co-ordinates which this code is using to up date the attributes of the SVG elements

force.on("tick", function () {
    link.attr("x1", function (d) {
        return d.source.x;
    })
        .attr("y1", function (d) {
        return d.source.y;
    })
        .attr("x2", function (d) {
        return d.target.x;
    })
        .attr("y2", function (d) {
        return d.target.y;
    });

    node.attr("cx", function (d) {
        return d.x;
    })
        .attr("cy", function (d) {
        return d.y;
    });
});


//
// var toggle = 0;
// var linkedByIndex = {};
// for (i = 0; i < graph.nodes.length; i++) {
//     linkedByIndex[i + "," + i] = 1;
// };
// graph.links.forEach(function (d) {
//     linkedByIndex[d.source.index + "," + d.target.index] = 1;
// });
//
//
//
// function neighboring(a, b) {
//     return linkedByIndex[a.index + "," + b.index];
// }
//
// function connectedNodes() {
//     if (toggle == 0) {
//         d = d3.select(this).node().__data__;
//         node.style("opacity", function (o) {
//             return neighboring(d, o) | neighboring(o, d) ? 1 : 0.15;
//         });
//         toggle = 1;
//     } else {
//         node.style("opacity", 1);;
//         toggle = 0;
//     }
// }
