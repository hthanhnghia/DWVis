var svg, force;
var group_color = {'1': "#1e7b1e", '2': "#ADBCA9", "3": "red", "4": "purple", "5": "yellow", "6": "#4867AA"}
var color = d3.scale.category10();
var width = 1000, height = 1000;

var nodes = [], links = [];
var base_nodes = [], base_links = [];
var cur_search_node, cur_facebook_id;

var userCollection = new Mongo.Collection('users');
var nodeCollection = new Mongo.Collection('nodes');
var linkCollection = new Mongo.Collection('links');

Meteor.subscribe('users');
Meteor.subscribe('nodes');
Meteor.subscribe('links');

var user_list;
var graph_nodes;
var graph_links;

Meteor.setTimeout(function() {
   user_list = userCollection.find().fetch();
   graph_nodes = nodeCollection.find().fetch();
   graph_links = linkCollection.find().fetch();

   createGraph();
}, 5000);

createGraph = function ()
{
	force = d3.layout.force()
	    .gravity(.25)
	    //.distance(200)
	    .linkDistance(function(d){
	      if(d.source.group == d.target.group)
	        return 140;

	      else {
	        return 180;
	      }
	    })
	    .charge(-900)
	    .size([width, height]);

	svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	var optArray = [];
	for (var i = 0; i < 500; i++) {
	    var name = user_list[i].name + " (" + user_list[i].forum + ")";
	    optArray.push(name);
	}

	optArray = optArray.sort();
	$(function () {
	    $("#search").autocomplete({
	        source: optArray
	    });
	});

	//Set up tooltip
	/*
	var tip = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function (d) {
	    		return  d.name + "(" +d.no_posts + ")";
		})

	svg.call(tip);

	var link_tip = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function (d) {
	    return  d.value;
	})

	svg.call(link_tip);
	*/
	min_date = new Date(2013, 9, 1)
	max_date = new Date(2016, 2, 1)
	searchRange(min_date, max_date)

	/*
	 * Attach a context menu to a D3 element
	 */

	contextMenuShowing = false;

	d3.select("body").on('contextmenu',function (d,i) {
	    if(contextMenuShowing) {
	        d3.event.preventDefault();
	        d3.select(".popup").remove();
	        contextMenuShowing = false;
	    } else {
	        d3_target = d3.select(d3.event.target);
	        if (d3_target.classed("node")) {
	            //console.log(d3.event.pageY)
	            //console.log(d3.event.pageX)
	            d3.event.preventDefault();
	            contextMenuShowing = true;
	            d = d3_target.datum();

	            // Build the popup
	            if(d.group == 6)
	            {
		            popup = d3.select("body")
		            .append("div")
		            .attr("class", "popup")
		            .style("left", d3.event.pageX + 10 + "px")
		            .style("top", d3.event.pageY - 10 + "px");
		            /*
		            popup.append("h2").text(d.display_division);
		            popup.append("p").text(
		                "The " + d.display_division + " division (wearing " + d.display_color + " uniforms) had " + d.casualties + " casualties during the show's original run.")
		            popup.append("p")
		            .append("a")
		            .attr("href",d.link)
		            .text(d.link_text);
		            */

		            for(var i=0; i<new_nodes.length; i++)
	        			{
	        				if(new_nodes[i].group == 6)
	                {
	                  if (new_nodes[i].name.indexOf("profile.php") !=-1) {
	                    fb_url = new_nodes[i].name;
	                  }

	                  else {
	                    fb_url = "https://www.facebook.com/" + new_nodes[i].name;
	                  }

	                  if(new_nodes[i].name != d.name)
	                  {
	                    popup.append("p")
	      	            .append("a")
	      	            .attr("href",fb_url)
	                    .attr("target","_blank")
	      	            .text(new_nodes[i].display_name);
	                  }
	                  else
	                  {
	                    popup.append("p")
	      	            .append("a")
	      	            .attr("href","https://www.facebook.com/" + new_nodes[i].name)
	                    .attr("target","_blank")
	                    .style("color", "#ff9980")
	                    .style("font-weight", "bold")
	      	            .text(new_nodes[i].display_name);
	                  }
	                }
	        			}
		        }
	        }
	    }
	});
}

function Graph() {
    force
        .nodes(nodes)
        .links(links)
        .start();

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("g")
        .attr("class", function(d) {if(d.type == 1) return "link-group";})
        .append("line")
        .attr("class", "link")
        .attr("id",function(d,i) { return "link" + i; })
        //.style("stroke-width", function(d) { if(d.source.name == cur_search_node || d.target.name == cur_search_node) return 3; else return 0.5; })
        .style("stroke-width", function(d) {
            if((d.source.group == d.target.group) || d.source.group == 6 || d.target.group == 6)
              return Math.log(d.value);
            else
            {
              if(typeof d.value === 'string')
              {
                score = parseFloat(d.value.split(",")[0]);
              }
              else {
                score = d.value;
              }
              return score*6;
            }
          })
        .style("stroke-opacity", function(d) { if(d.source.name == cur_search_node || d.target.name == cur_search_node || d.source.group != d.target.group) return 0.8; else return 0.2; })
        .style("stroke", function(d) { if(d.source.group != d.target.group) {if(d.source.name != cur_search_node && d.target.name != cur_search_node) return "#ffcccc"; else return "#ff9980";} else return "grey"; })
        .style("display", function(d) { if(d.source.group == 6 && d.target.group == 6) return "none"; })
        //.style("stroke-dasharray", function(d) { if(d.source.group != d.target.group && d.source.name != cur_search_node && d.target.name != cur_search_node) return ("5, 5"); else return "0"; })
        //.style("stroke-width", function(d) { return d.value; })
        //.on('mouseover', link_tip.show) //Added
        //.on('mouseout', link_tip.hide); //Added

    var gnodes = svg.selectAll('g.gnode')
        .data(nodes)
        .enter()
        .append('g')
        .classed('gnode', true);

    var node = gnodes.append("circle")
        .attr("class", "node")
        //.attr("r", function(d) { if(d.no_posts >= 600) return d.no_posts/100.0; else return 6; })
        .attr("r", function(d) { return 10; })
        .style("fill", function(d) { return group_color[d.group]; })//return color(d.group); })
        .style("display", function(d) { if(d.group == 6 && d.index != cur_facebook_id) return "none"; })
      .call(force.drag)
        //.on('dblclick', expandNode) //Added code ;
        .on('click', expandNode) //Added code ;
        //.on('mouseover', tip.show) //Added
        //.on('mouseout', tip.hide); //Added

    var labels = gnodes.append("text")
        .text(function(d) { if(d.group == 6 && d.index != cur_facebook_id) return ""; else return d.name; });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        gnodes.attr("transform", function(d) {
            return 'translate(' + [d.x, d.y] + ')';
        });
    });

    //Create an array logging what is connected to what
    var linkedByIndex = {};
    for (i = 0; i < nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };
    links.forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    //This function looks up whether a pair are neighbours
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }
    function expandNode() {
        //remove pop up window
        d3.select(".popup").remove();
        contextMenuShowing = false;

        d = d3.select(this).node().__data__;
        searchNode(d.name, d.forum)
    }

};

function findNodeIndex(name, forum) {
    for (var i=0; i < base_nodes.length; i++) {
        if (base_nodes[i].name === name && base_nodes[i].forum === forum)
            return i;
    };
}

function findNeighbourNodes(node, nodeIndex, new_nodes, new_links, node_ids) {
    for(var i = 0, size = base_links.length; i < size ; i++){
        l = base_links[i];
        if(l.source == nodeIndex)
        {
            n = base_nodes[l.target];

            if(jQuery.inArray(n, new_nodes) === -1)
            {
                new_nodes.push(n)
                node_ids.push(l.target)

                if(n.forum != node.forum)
                {
                    findNeighbourNodes(n, l.target, new_nodes, new_links, node_ids);
                }
            }
            //new_links.push({"source": 0 , "target": new_nodes.length - 1, "value": l.value });
        }

        if(l.target == nodeIndex)
        {
            n = base_nodes[l.source];

            if(jQuery.inArray(n, new_nodes) === -1)
            {
                new_nodes.push(n)
                node_ids.push(l.source)

                if(n.forum != node.forum)
                {
                    findNeighbourNodes(n, l.source, new_nodes, new_links, node_ids);
                }
            }
        }
    }
}

search = function ()
{
    //remove popup window
    d3.select(".popup").remove();
    contextMenuShowing = false;

    var selectedVal = document.getElementById('search').value.split(" (");
    var name = selectedVal[0];
    var forum = selectedVal[1].slice(0,-1);
    searchNode(name, forum);
}

function searchNode(name, forum) {
    //find the node
    cur_search_node = name
    var nodeIndex = findNodeIndex(name, forum);

    var node = svg.selectAll(".node");

    //find neighbour in the same forum
    node = base_nodes[nodeIndex];

    new_nodes = [node];
    new_links = [];
    new_node_ids = [nodeIndex];

    findNeighbourNodes(node, nodeIndex, new_nodes, new_links, new_node_ids);

    for(var i = 0, size = base_links.length; i < size ; i++){
        l = base_links[i];
        source = l.source;
        target = l.target;
        source_id = jQuery.inArray(source, new_node_ids);
        target_id = jQuery.inArray(target, new_node_ids);

        if((source_id !== -1) && (target_id !== -1))
        {
            if(jQuery.inArray(l, new_links) === -1)
            {
              if(l["type"] != undefined)
                new_links.push({"source": source_id , "target": target_id, "value": l.value, "type": l["type"]});
              else
                new_links.push({"source": source_id , "target": target_id, "value": l.value });
            }

            if(l.source < 500 && l.target >= 500)
              cur_facebook_id = target_id;

            if(l.source >= 500 && l.target < 500)
              cur_facebook_id = source_id;
        }
    }

    nodes = new_nodes;
    links = new_links;

    svg.selectAll("*").remove();
    visualization = new Graph();
}

searchRange = function(min_date, max_date) {
    min_month = min_date.getMonth() + 1;
  	min_year = min_date.getFullYear();
  	max_month = max_date.getMonth() + 1;
  	max_year = max_date.getFullYear();
  	months = []

  	console.log(graph_nodes)

  	if(min_year == max_year)
  	{
  		for(var i=min_month; i <= max_month; i++) {
  			months.push(min_year+'/'+i);
  		}
  	}

  	else
  	{
  		for(var i=min_month; i <= 12; i++) {
  			months.push(min_year+'/'+i);
  		}

  		for(var i=min_year+1; i <= max_year-1; i++) {
  			for(var j=1; j<=12; j++) {
  				months.push(i+'/'+j);
  			}
  		}

  		for(var i=1; i <= max_month; i++) {
  			months.push(max_year+'/'+i);
  		}
  	}

  	new_nodes = [];
    new_links = [];
    edges = {}

    for(var j=0; j<user_list.length; j++)
    {
      new_nodes[j] = JSON.parse(JSON.stringify(user_list[j]));
    }

  	for(var i=0; i<months.length; i++) {
  		month = months[i];
  		if(month in graph_nodes)
  		{
  			month_data = graph_nodes[month];

  			for(var j=0; j<user_list.length; j++)
  			{
          for(var k=0; k<month_data.length; k++)
    			{
            if (new_nodes[j].name === month_data[k].name && new_nodes[j].forum === month_data[k].forum)
            {
              new_nodes[j].no_posts += month_data[k].no_posts;
            }
          }
  			}
  		}

  		if(month in graph_links)
  		{
  			month_data = graph_links[month];

			for(var j=0; j<month_data.length; j++)
			{
				edge = month_data[j].source + "/" + month_data[j].target
				if(edge in edges)
				{
					if(month_data[j].type != 1)
					{
						new_links[edges[edge]].value += month_data[j].value;
					}
				}
				else
				{
					new_links.push(JSON.parse(JSON.stringify(month_data[j])));
					edges[edge] = new_links.length - 1;
				}
			}
  		}
  	}

  	base_nodes = new_nodes;
    base_links = new_links;

    console.log("DKM")
    console.log(base_nodes);
    console.log(base_links)
}

//visualization = new Graph(graph);
