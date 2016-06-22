var width = 960;
var height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-400)
    .linkDistance(50)
    .size([width, height]);
//
// var svg = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height);

// var stuff = document.getElementById('mis').innerHTML;

d3.select("#maindiv${divnum}").selectAll("svg").remove();
var svg = d3.select("#maindiv${divnum}").append("svg")
    .attr("width", width)
    .attr("height", height);


var graph = $data ;

force.nodes(graph.nodes) //Creates the graph data structure out of the json data
.links(graph.links)
    .start();

//Create all the line svgs but without locations yet <line class="link" style="stroke-width: 1px;"></line>

var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function (d) {
      return Math.sqrt(d.value);
    });

//Do the same with the circles for the nodes - no

var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .style("opacity", 1)
    .style("fill", function (d) {
    return color(d.group);
})
    .call(force.drag)
    .on('click', connectedNodes)
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



var toggle = 0;
var linkedByIndex = {};
for (i = 0; i < graph.nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
graph.links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
});



function neighboring(a, b) {
    return linkedByIndex[a.index + "," + b.index];
}

function connectedNodes() {

    if (toggle == 0) {

        d = d3.select(this).node().__data__;
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.15;
        });
        toggle = 1;
    } else {
        node.style("opacity", 1);;
        toggle = 0;
    }

}
