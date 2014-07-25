angular.module('storyviz.directives', ['d3'])
  .directive('storyGraph', ['d3Service', function(d3Service){
    return {
      restrict: 'E',
      scope: {
        ngModel: '=',
        data: '=data',
        onClick: '&'
      },
      link: function(scope, element) {
        d3Service.d3().then(function(d3) {
          var width = 1200;
          var height = 800;
          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%');
          var markerWidth = 6;
          var markerHeight = 6;
          var cRadius = 25;
          var refX = cRadius + (markerWidth * 2) ;
          var refY = -Math.sqrt(cRadius) + 2;
          var drSub = cRadius + refY;
          var color = d3.scale.category20();

          var force = d3.layout.force()
            .charge(-650)
            .linkDistance(150)
            .size([width, height]);

          var graphData = {};
          graphData.nodes = [];
          graphData.links = [];

          // not sure what this is is here for,
          // should it do something down the line?
          // var labelForce = d3.layout.force()
          //   .charge(-100)
          //   .linkDistance(0)
          //   .linkStrength(8)
          //   .size([width, height]);

          var render = function(newData) {
            // stores number of relationships between a source and target

            //format new data to work with existing chart
            // var isNodeIDInChart = function(id){
            //   for (var i =0; i < graphData.nodes.length; i++){
            //     if (graphData.nodes[i].id === id){
            //       return true;
            //     }
            //   }
            //   return false;
            // };

            // var isIDinNewData = function(id){
            //   for (var i =0; i < newData.nodes.length; i++){
            //     if (newData.nodes[i].id === id){
            //       return true;
            //     }
            //   }
            //   return false;
            // };

            // var syncNewData = function(){
            //   for (var i = 0; i < newData.nodes.length; i++){
            //     if(!isNodeIDInChart(newData.nodes[i].id)){
            //       graphData.nodes.push(newData.nodes[i]);
            //     }
            //   }
            //   for (var j = 0; j < graphData.nodes.length; j++){
            //     if(!isIDinNewData(graphData.nodes[i].id)){
            //       graphData.nodes.splice(i, 1);
            //     }
            //   }
            // };


            var numRels = {};
            // console.log('yolo');
            // if (scope.$parent.test === 0){
            //   console.log(graphData);
            //   scope.$parent.testData.nodes = [{name: 'Tyler', id: 1},{name: 'Will', id: 2},{name: 'Bob', id: 3}]
            //   scope.$parent.testData.links = [{source: 0, target: 1, type: 'Kills'}];
            //   // scope.$parent.testData.links = [];

            //   graphData = scope.$parent.testData;
            // }


            // if (scope.$parent.test === 1){
            //   // scope.$parent.testData.links = scope.$parent.testData.links.slice(1);
            //   // scope.$parent.testData.nodes = [];
            //   scope.$parent.testData.nodes.splice(1,1);
            //   scope.$parent.testData.nodes.push({name: 'John', id: 4});
            //   scope.$parent.testData.links = [];
            //   scope.$parent.testData.links = [{source: 0, target: 2, type: 'Kills'}];
            //   // scope.$parent.testData.links.push({source: scope.$parent.testData.nodes.length - 1, target: 0, type: 'Kills'});
            //   graphData = scope.$parent.testData;
            // }

            scope.$parent.test++;


            var referenceNodes = function() {
              for (var i = 0; i < graphData.links.length; i++){
                var sourceIndex = graphData.links[i].source;
                var targetIndex = graphData.links[i].target;
                var sourceObj = graphData.nodes[sourceIndex];
                var targetObj = graphData.nodes[targetIndex];
                graphData.links[i].source = sourceObj;
                graphData.links[i].target = targetObj;
              }
            };



            var countRels = function() {
              // this is returning undefined
              for (var i = 0; i < graphData.links.length; i++) {
                var source;
                var target;
                if (graphData.links[i].source.id === undefined) {
                  source = graphData.links[i].source;
                  target = graphData.links[i].target;
                }
                var key1 = source + ',' + target;
                var key2 = target + ',' + source;

                if (numRels[key1]) {
                  numRels[key1]++;
                } else {
                  numRels[key1] = 1;
                }

                if (numRels[key2]) {
                  numRels[key2]++;
                } else {
                  numRels[key2] = 1;
                }

                // assign the link's position (out of the total number
                // of relationships between its source and target)
                // to its linkIndex
                // Concerned that this is retriggering the render item's watch since this is bound to the
                // same data that is passed in. 
                graphData.links[i].linkIndex = numRels[key1];
              }
            };

            referenceNodes();
            countRels();


            // Adds force graph attributes to each graphData note
            // Also adds 'tick' trigger for animating the force graph as nodes are added.
            force.nodes(graphData.nodes)
              // .links(graphData.links, function(d) { return d.source + "-" + d.target + "-" +  d.type; })
              .links(graphData.links)
              .on("tick", tick)
              .start();


              if ( scope.$parent.test === 1){

            var paths = svg.append("svg:g").selectAll("path")
              .data(force.links());

              }else {

            var paths = svg.selectAll("g:first-of-type").selectAll("path")
              .data(force.links()); 

              }

              paths.exit().remove();

              var path = paths
              .enter().append("svg:path")
              .attr("fill", "none")
              .attr("class", "link")
              .attr("id", function(d){
                return d.type;
              })
              .attr("stroke-width", 3);

              svg.selectAll('#unrequited, #parentchild, #kills')
              .attr("marker-end", "url(#end)");

            svg.append("svg:defs").selectAll("marker")
              .data(["end"])
                .enter().append("svg:marker")
                  .attr("id", String)
                  .attr("viewBox", "0 -5 10 10")
                  .attr("refX", refX)
                  .attr("refY", refY)
                  .attr("markerWidth", markerWidth)
                  .attr("fill", "#009999")
                  .attr("stroke-width", 2)
                  .attr("markerHeight", markerHeight)
                  .attr("orient", "auto")
                .append("svg:path")
                  .attr("d", "M0,-5L10,0L0,5");

            var nodes = svg.selectAll('g.gnode')
              .data(graphData.nodes, function(d){return d.id});

            nodes.exit().remove();

            var gnodes = nodes
              .enter().append('g')
              .classed('gnode', true);

            var node = gnodes.append('circle')
              .attr('class', 'node')
              .attr('r', 25)
              .style('fill', function(d){
                return color(d.id);
              })
              .on('dblclick', function(d, i){
                return scope.onClick({nodeId: d.id});
              })
              .call(force.drag);

            var nodeCircles = nodes.selectAll('circle');

            // if (scope.$parent.test === 1){
            //   scope.$parent.testData = graphData;
            // }


              // if (scope.$parent.test === 2){

              //   svg.selectAll('g.gnode')
              //   .call(force.drag);
              // }

            var labels = gnodes.append("text")
              .attr("text-anchor", "middle")
              .attr("class", "nodeLabels")
              .attr("dy", ".3em")
              .text(function(d) {
                return d.name;
              });

            var textLabels = svg.selectAll("text");

            // Use elliptical arc path segments to doubly-encode directionality.
            function tick() {
              paths.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);

                // get the total link numbers between source and target node
                var index = d.source.index + ',' + d.target.index;

                if(numRels[index] > 1)
                {
                  // if there are multiple links between these two nodes, we need generate different dr for each path
                  dr = dr/(1 + (1/numRels[index]) * (d.linkIndex - 1));
                }

                // generate svg path
                return "M" + d.source.x + "," + d.source.y +
                  "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y;
                  // I think this should be deleted?
                  // "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y;
              });
                
              nodeCircles.attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });

              textLabels.attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });
            }

          };

          // watchGroup a part angular beta
          scope.$watchGroup(['data','data.nodes', 'data.links'], function(newValue) {
            if (newValue !== undefined) {
              // remove all children of svg
              // d3.selectAll("svg > *").remove();
              //figure out how to make this better
              if (scope.data.links){
                render(scope.data);
              }
            }
          });

        }); // end d3Service promise chain
      } // end link function
    }; // end returned object
  } // end dependency injection into directive

]); // end directive
