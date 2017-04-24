

function createFlareplot(width, json, divId){
    var w = width;
    var h   = w;
    var rx  = w * 0.5;
    var ry  = w * 0.5;
    var rotate = 0;
    var discRad = 55;

    if( typeof json == "string" ){
        json = JSON.parse(json);
    }

    var stdEdgeColor = "rgba(0,0,0,200)";
    var svg;
    var div;
    var bundle;
    var line;
    var nodes;
    var splines;
    var links;
    var graph;

    var selectedTree = 0;
    var selectedTrack = 0;
    var toggledNodes = {};
    var splineDico;

    return (function() {

        function create_bundle() {
            cluster = d3.layout.cluster()
                .size([360, ry - discRad])
                .sort(function(a, b) {
                    var aRes = a.key.match(/[0-9]*$/);
                    var bRes = b.key.match(/[0-9]*$/);
                    if(aRes.length==0 || bRes.length==0){
                        aRes = a.key;
                        bRes = b.key;
                    }else{
                        aRes = parseInt(aRes[0]);
                        bRes = parseInt(bRes[0]);
                    }
                    return d3.ascending(aRes, bRes);
                });

            //json  = JSON.parse(json_text);
            graph = parse(json);
            nodes = cluster.nodes(graph.trees[selectedTree].tree[""]);
            links = graph.trees[selectedTree].frames;
            bundle = d3.layout.bundle();
            splines = bundle(links[0]);
            splineDico = buildSplineIndex(splines);

            links = graph.trees[selectedTree].allEdges;
            splines = bundle(links);

            line = d3.svg.line.radial()
                .interpolate("bundle")
                .tension(0.85)
                .radius(function(d) { return d.y; })
                .angle(function(d) { return d.x / 180 * Math.PI; });

            d3.select(divId).style("position","relative");

            div = d3.select(divId).insert("div")
                .style("width", w + "px")
                .style("height", h + "px")
                .style("-webkit-backface-visibility", "hidden");

            svg = div.append("svg:svg")
                .attr("width", w)
                .attr("height", h)
                .append("svg:g")
                .attr("transform", "translate(" + rx + "," + ry + ")");

            //// Find the width of the node-name track. Temporarily add all text, go through them and get max-width
            //var tmpTexts = svg.selectAll("g.node")
            //    .data(nodes.filter(function(n) { return !n.children; }), function(d) { return d.key; })
            //    .enter().append("svg:g")
            //    .attr("class", "node")
            //    .attr("id", function(d) { return "node-" + d.key; })
            //    .append("text")
            //    .text(function(d) { return d.key; });
            //var maxTextWidth = d3.max(svg.selectAll("text")[0], function(t){ return t.getBBox().width; });
            //svg.selectAll("g.node").remove();


            var path = svg.selectAll("path.link")
                .data(links, function(d,i){
                    var key = "source-" + d.source.key + "target-" + d.target.key;
                    return key;
                })
                .enter().append("svg:path")
                .attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes) {
                        ret += " toggled";
                    }
                    return ret;
                })
                .style("stroke-width",function(d){
                    return 0;
                })
                .style("stroke",function(d){ return ("color" in d)?d.color:stdEdgeColor; })
                .style("fill","none")
                .attr("d", function(d, i) { return line(splines[i]); })
                .on("mouseenter", function(d,i){ return; /*console.log(this);*/ });




            svg.selectAll("g.node")
                .data(nodes.filter(function(n) { return !n.children; }), function(d) { return d.key; })
                .enter().append("svg:g")
                .attr("class", "node")
                .attr("id", function(d) { return "node-" + d.key; })
                .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
                .append("text")
                .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
                .attr("dy", ".31em")
                .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
                .text(function(d) { return d.key; })
                .on("mouseover", mouseoverNode)
                .on("mouseout", mouseoutNode)
                .on("click", toggleNode);


            var arcW = 250.0/(graph.nodeNames.length)*Math.PI/360;
            var arc = d3.svg.arc()
                .innerRadius(ry-15)
                .outerRadius(function(d,i){
                  var sz = d.size;
                  if(!sz) { sz = 0.0; }
                  var or = ry-15+sz*15;
                  return or;
                })
                .startAngle(-arcW)
                .endAngle(arcW);

            svg.selectAll("g.trackElement")
                .data(graph.tracks[selectedTrack].trackProperties, function(d){ return d.nodeName; })
                .enter().append("svg:g")
                .attr("class", "trackElement")
                .attr("id", function(d) { return "trackElement-" + d.nodeName; })
                .append("path")
                .attr("transform", function(d) {
                    var x = graph.trees[selectedTree].tree[d.nodeName].x;
                    return "rotate("+x+")" ;
                })
                .style("fill", function(d){ return d.color; })
                .attr("d", arc);

            setFrame(0);
        }

        /**
         *
         * @param clusterDefinition {}
         *
         * keys are the key of the cluster
         * values are array that correspond to node keys
         *
         */
        function assignCluster(clusterDefinition, oldCluster, graph) {

            var nodesMap = clusterDefinition.tree;
            var root = nodesMap[""];
            var rootNodes = root.children;

            // recursively copy x and y propery from the old cluster
            rootNodes.forEach(copyAndGoThruChildren);
            function copyAndGoThruChildren(node) {

                var newNode;
                var nodeKey = node.key;
                if   (nodesMap[nodeKey]) {
                    newNode = nodesMap[nodeKey];
                    var oldNode =  oldCluster.tree[nodeKey];
                    if (oldNode) {
                        newNode.oldX = oldNode.x;
                        newNode.oldY = oldNode.y;
                    }
                } else
                {
                    // it could happen that an new node come (in case of intermediate level)
                    newNode = nodesMap[nodeKey];
                    newNode.clusterName = nodeKey;

                }
                if (newNode.children && newNode.children.length > 0) {
                    newNode.children.forEach(copyAndGoThruChildren);
                }
            }
        }


        /**
         * Find the total number of frames in the graph.
         * @returns {number}
         */
        function getNumFrames(){
            var maxFrame = -1;
            graph.edges.forEach(function(e){
                maxFrame = Math.max(maxFrame,  Math.max.apply(Math, e.frames));
            });
            return maxFrame+1;
        }

        /**
         * Change the state of the flareplot so it reflects the interactions in the indicated frame.
         * @param frameNum a number indicating the frame to set.
         */
        function setFrame(frameNum){
            rangeSum(frameNum,frameNum+1);
        }

        /**
         * Update the state of the flareplot so it reflects the intersection over a range.
         * @param rangeStart first frame to include (must be less than `rangeEnd`)
         * @param rangeEnd first frame after `rangeStart` that should not be included
         */
        function rangeIntersect(rangeStart, rangeEnd){
            splines = bundle(links);
            var path = svg.selectAll("path.link");

            path.style("stroke-width",
                function(d,i){
                    var count = graph.edges[i].frames.rangeCount(rangeStart, rangeEnd-1);
                    return count==rangeEnd-rangeStart?2:0;
                })
                .attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes) {
                        ret += " toggled";
                    }
                    return ret;
                })
                //.attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
                .style("stroke",function(d){ return ("color" in d)?d.color:stdEdgeColor; })
                .attr("d", function(d, i) { return line(splines[i]); });

        }

        /**
         * Update the state of the flareplot so it reflects the sum over a range.
         * @param rangeStart first frame to include (must be less than `rangeEnd`)
         * @param rangeEnd first frame after `rangeStart` that should not be included
         */
        function rangeSum(rangeStart, rangeEnd){
            splines = bundle(links);
            var path = svg.selectAll("path.link");

            var widthScale = d3.scale.linear()
                .domain([1,Math.max(1,rangeEnd-rangeStart)])
                .range([2,10]);

            path.style("stroke-width",
                function(d,i){
                    var count = graph.edges[i].frames.rangeCount(rangeStart, rangeEnd-1);
                    return count==0?count:widthScale(count);
                })
                .attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes) {
                        ret += " toggled";
                    }
                    return ret;
                })
                //.attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
                .style("stroke",function(d){ return ("color" in d)?d.color:stdEdgeColor; })
                .attr("d", function(d, i) { return line(splines[i]); });
        }

        /**
         * Update the state of the flareplot so it reflects the intersection over a subset.
         * @param subset a list of numbers indicating which frames to include
         */
        function subsetIntersect(subset){
            splines = bundle(links);
            var path = svg.selectAll("path.link");

            path.style("stroke-width",
                function(d,i) {
                    for (var c = 0; c < subset.length; c++) {
                        var frame = subset[c];
                        var iud = graph.edges[i].frames.indexUpDown(frame);
                        if (iud[0] != iud[1]) return 0;
                    }
                    return 2;
                })
                .attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes)
                        ret+=" toggled";
                    return ret;
                })
                .style("stroke",function(d){ return ("color" in d)?d.color:stdEdgeColor; })
                .attr("d", function(d, i) { return line(splines[i]); });

        }

        /**
         * Update the state of the flareplot so it reflects the sum over a subset.
         * @param subset a list of numbers indicating which frames to include
         */
        function subsetSum(subset){
            splines = bundle(links);
            var path = svg.selectAll("path.link");

            var widthScale = d3.scale.linear()
                .domain([1,subset.length])
                .range([2,10]);

            path.style("stroke-width",
                function(d,i){
                    var count = 0;
                    subset.forEach(function(f){
                        var iud = graph.edges[i].frames.indexUpDown(f);
                        if( iud[0] == iud[1] ){ count++; }
                    });
                    return count==0?0:widthScale(count);
                })
                .attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes) {
                        ret += " toggled";
                    }
                    return ret;
                })
                //.attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
                .style("stroke",function(d){ return ("color" in d)?d.color:stdEdgeColor; })
                .attr("d", function(d, i) { return line(splines[i]); });
        }

        /**
         * Update the state of the flareplot so it reflects the intersection over the specified selection. If
         * `selection` and `optionalSelection` are both numbers then the intersection will be taken over the range of
         * frames spanned by the two. If `selection` is an array of numbers the intersection will be taken over the
         * frames in the array. If the arguments don't satisfy these requirements an error is thrown.
         * @param selection
         * @param optionalSelection
         * @returns {*}
         */
        function framesIntersect(selection, optionalSelection) {
            if (typeof selection === "number" && typeof optionalSelection === "number") {
                return rangeIntersect(selection, optionalSelection);
            }
            if (Object.prototype.toString.call(selection) === "[object Array]" && optionalSelection === undefined) {
                return subsetIntersect(selection);
            }
            throw "framesIntersect must take either two integers (range), or an array (subset) as argument";
        }

        /**
         * Update the state of the flareplot so it reflects the sum over the specified selection. If `selection` and
         * `optionalSelection` are both numbers then the intersection will be taken over the range of frames spanned by
         * the two. If `selection` is an array of numbers the intersection will be taken over the frames in the array.
         * If the arguments don't satisfy these requirements an error is thrown.
         * @param selection
         * @param optionalSelection
         * @returns {*}
         */
        function framesSum(selection, optionalSelection) {
            if (typeof selection === "number" && typeof optionalSelection === "number") {
                return rangeSum(selection, optionalSelection);
            }
            if (Object.prototype.toString.call(selection) === "[object Array]" && optionalSelection === undefined) {
                return subsetSum(selection);
            }
            throw "framesSum must take either two integers (range), or an array (subset) as argument";
        }

        function toggleNode(d){
            var toggled = !d3.select(this.parentNode).classed("toggledNode");
            d3.select(this.parentNode)
                .classed("toggledNode", function(){return toggled; });

            var name = d.name.substring(d.name.lastIndexOf(".")+1);
            if(!toggled)
                delete toggledNodes[name];
            else
                toggledNodes[name] = "";

            path = svg.selectAll("path.link")
                .classed("toggled", function(d) {
                    return ( d.source.key in toggledNodes || d.target.key in toggledNodes)
                });

        }


        function mouseoverNode(d) {
            svg.selectAll("path.link.target-" + d.key)
                .classed("target", true)
                .each(updateNodes("source", true));

            svg.selectAll("path.link.source-" + d.key)
                .classed("source", true)
                .each(updateNodes("target", true));
        }

        function mouseoutNode(d) {
            svg.selectAll("path.link.source-" + d.key)
                .classed("source", false)
                .each(updateNodes("target", false));

            svg.selectAll("path.link.target-" + d.key)
                .classed("target", false)
                .each(updateNodes("source", false));
        }

        function updateNodes(name, value) {
            return function(d) {
                //if (value) this.parentNode.appendChild(this);
                svg.select("#node-" + d[name].key).classed(name, value);
            };
        }

        function getTreeNames(){
            var ret = [];
            for (var t=0; t<graph.trees.length; t++ ){
                ret.push(graph.trees[t].treeLabel);
            }
            return ret;
        }

        function setTree(treeIdx){
            var oldTreeIdx = selectedTree;
            selectedTree = treeIdx;
            assignCluster(graph.trees[selectedTree], graph.trees[oldTreeIdx], graph);
            var recomposedSplines = [];
            nodes = cluster.nodes(graph.trees[selectedTree].tree[""]);

            links = Object.values(graph.trees[selectedTree].summaryEdges);

            svg.selectAll("g.node")
                .data(nodes.filter(function(n) { return !n.children; }), function(d) { return d.key})
                .transition().duration(500)
            //.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
                .attrTween("transform", function(d) {
                    var oldMatrix = "rotate(" + (d.oldX - 90) + ")translate(" + d.y + ")";
                    var newMatrix = "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                    return d3.interpolateString(oldMatrix, newMatrix);
                })
                .select("text")
                .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
                .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; });

            var arcW = 250.0/(graph.nodeNames.length)*Math.PI/360;
            var arc = d3.svg.arc()
                .innerRadius(ry-15)
                .outerRadius(function(d){
                    var sz = d.size;
                    if(!sz) sz = 0.0;
                    return ry-15+sz*15;
                })
                .startAngle(-arcW)
                .endAngle(arcW);

            svg.selectAll("g.trackElement")
                .select("path")
                .transition().duration(500)
                .attrTween("transform", function(d) {
                    var node = graph.trees[selectedTree].tree[d.nodeName];
                    var oldMatrix = "rotate(" + (node.oldX) + ")";
                    var newMatrix = "rotate(" + (node.x) + ")";
                    return d3.interpolateString(oldMatrix, newMatrix);
                })
                .style("fill", function(d){ return d.color; })
                .attr("d", arc);


            // transition the splines
            var newSplines = bundle(Object.values((graph.trees[selectedTree].summaryEdges)));
            var newSplinesDico = buildSplineIndex(newSplines);


            var done = false;
            var path = svg.selectAll("path.link").data(links, function(d){
                return  d.key;
            });

            // i dont understand how d3 orders the spline array, so we need
            path.transition().attrTween("d",
                function(d, i, a) {

                    //if (i != 2) return;
                    // make a copy of the targeted Spline, and put all x to the value of OldX..
                    var oldSpline = [];
                    var key = d.key;

                    var oldSplineIdx =  splineDico[key];
                    var newSplineIdx = newSplinesDico[key];
                    if (oldSplineIdx === void 0 || newSplineIdx === void 0) {
                        console.log("Not found Spline with key", key);
                        return;
                    }

                    for (var j = 0; j < splines[oldSplineIdx].length; j++) {
                        var s = Object.assign({}, splines[oldSplineIdx][j]);
                        oldSpline.push(s);
                    }
                    oldSpline = oldSpline.map(function(s) {
                        return {x: s.x, y: s.y};
                    });

                    var simpleSpline = newSplines[newSplineIdx].map(function(s) {
                        return {x: s.x, y:s.y, key:s.key}
                    });
                    // now if oldspine is missing controlpoints
                    var delta = simpleSpline.length - oldSpline.length;
                    if (oldSpline.length < simpleSpline.length) {
                        //positive delta
                        var recomposedOldSpline = [];
                        // we make the assumption that we start with 3 control points
                        // but they may be more complicated situations
                        // if delta =  2   0 - 0, 1-0, 2-1, 3-2, 4-2  (3 to 5 )
                        // if delta =  4   0-0 1-0 2-0, 3-1, 4-2, 5-2, 6-2  ( 3 to 7 )
                        // if delta = 2 ( 5 to 7) what happens ?
                        // if delta = 4 ( 5 to 9) what happens ?
                        for (i = 0, currentIndex = 0; i < simpleSpline.length; i++) {
                            recomposedOldSpline[i] = oldSpline[currentIndex];
                            if (i <= delta/2 || currentIndex >= oldSpline.length - 1) { } else {
                                currentIndex++;
                            }
                        }
                    } else if (delta < 0) { // (5 < 3)
                        // newer spline has less target point than older spline
                        var recomposedNewSpline = [];
                        // -2, 5 to 3   => 0 -0, 1-0, 2-1, 3-2,4-2  (simplespline 3, oldSpine = 5)
                        // -4 ,7 to 3   => 0-0, 1-0, 2-0, 3-1, 4-2 5-2 6-2
                        delta = Math.abs(delta);
                        for (i = 0, currentIndex = 0; i < oldSpline.length; i++) {
                            recomposedNewSpline[i] = simpleSpline[currentIndex];
                            if (i <= Math.floor(delta / 2) || currentIndex >= simpleSpline.length - 1) {} else {
                                currentIndex++;
                            }
                        }
                        simpleSpline = recomposedNewSpline;
                        recomposedOldSpline = oldSpline;

                    } else
                    {
                        recomposedOldSpline = oldSpline;
                    }
                    recomposedSplines.push(simpleSpline);
                    var interpolate = d3.interpolate(recomposedOldSpline, simpleSpline);
                    // we can update the splines at the next loop, or it will mess D3
                    setTimeout(function(){
                        if (!done){
                            done = true;
                            splines = recomposedSplines;
                            splineDico = buildSplineIndex(recomposedSplines);
                            // we do not want to rebind data here
                        }

                    }, 500);

                    return function(t) {
                        return line(interpolate(t))
                    };
                })
                .duration(500);

        }

        /**
         * For all splines in the array, create an index that match the key of
         * the link and the index in the spline array.
         */
        function buildSplineIndex(splines) {
            var linkKeyToSplineIdx = {};
            splines.forEach(function(spline, idx){
                var source = spline[0].key;
                var target = spline[spline.length-1].key;
                var key = source + "-" + target;
                linkKeyToSplineIdx[key] = idx;
            });
            return linkKeyToSplineIdx;
        }


        function getTrackNames(){
            var ret = [];
            for(var t=0;t<graph.tracks.length;t++){
                ret.push(graph.tracks[t].trackLabel);
            }
            return ret;
        }

        function setTrack(trackIdx){
            selectedTrack = trackIdx;
            //var arcW = 250.0/(graph.nodeNames.length)*Math.PI/360;
            //d3.svg.arc()
            //    .innerRadius(ry-15)
            //    .outerRadius(function(d){
            //      var sz = d.size;
            //      if(!sz) sz = 0.0;
            //      var or = ry-15+sz*15;
            //      return or;
            //    })
            //    .startAngle(-arcW)
            //    .endAngle(arcW);

            //var arc = d3.svg.arc()
            //    .innerRadius(ry-80)
            //    .outerRadius(ry-70)
            //    .startAngle(-arcW)
            //    .endAngle(arcW);

            svg.selectAll("g.trackElement")
                .data(graph.tracks[selectedTrack].trackProperties, function(d){ return d.nodeName; })
                .select("path")
                .transition()
                .style("fill", function(d){ return d.color; });

        }

        var nodeToggleListeners = [];
        var nodeHoverListeners  = [];
        var edgeToggleListeners = [];
        var edgeHoverListeners  = [];

        function addNodeToggleListener(l){ nodeToggleListeners.push(l); }
        function addNodeHoverListener(l){  nodeHoverListeners.push(l);  }
        function addEdgeToggleListener(l){ edgeToggleListeners.push(l); }
        function addEdgeHoverListener(l){  edgeHoverListeners.push(l);  }

        create_bundle();

        return {
            getNumFrames: getNumFrames,
            setFrame: setFrame,
            framesIntersect: framesIntersect,
            framesSum: framesSum,
            setTrack: setTrack,
            setTree: setTree,
            getTreeNames: getTreeNames,
            getTrackNames: getTrackNames,
            addNodeToggleListener: addNodeToggleListener,
            addNodeHoverListener: addNodeHoverListener,
            addEdgeToggleListener: addEdgeToggleListener,
            addEdgeHoverListener: addEdgeHoverListener,
            graph: graph//, for debugging purposes
        }
    }) ();
}

function upload_button(el, callback) {
    var uploader = document.getElementById(el);
    var reader = new FileReader();

    reader.onload = function(e) {
        var contents = e.target.result;
        callback(contents);
    };

    uploader.addEventListener("change", handleFiles, false);

    function handleFiles() {
        d3.select("#table").text("loading...");
        var file = this.files[0];
        reader.readAsText(file);
    }
}



/**
 * Gets the index of the value just above and just below `key` in a sorted array.
 * If the exact element was found, the two indices are identical.
 */
function indexUpDown(key) {
  "use strict";

  var minIdx = 0;
  var maxIdx = this.length - 1;
  var curIdx, curElm, resIdx;

  while (minIdx <= maxIdx) {
    resIdx = curIdx = (minIdx + maxIdx) / 2 | 0;
    curElm = this[curIdx];

    if (curElm < key)      minIdx = curIdx + 1;
    else if (curElm > key) maxIdx = curIdx - 1;
    else return [curIdx,curIdx];
  }

  return [minIdx,maxIdx];
}

/** Get the number of entries whose value are greater than or equal to `start`
 * and lower than or equal to `end` in a sorted array*/
function rangeCount(start, end){
  var startIdx = this.indexUpDown(start)[0];
  var endIdx   = this.indexUpDown(end)[1];
  return endIdx-startIdx+1;
}

Array.prototype.indexUpDown = indexUpDown;
Array.prototype.rangeCount = rangeCount;

// var list = [1,2,5,10,15,16];
// function testRange(l,s,e, expected){
//   var res = l.rangeCount(s,e);
//     console.log("["+l+"].count("+s+","+e+") -> "+res+" expects "+expected+(res==expected?" PASS":" FAILED"));
// }
//
// testRange(list,   0,  0, 0);
// testRange(list,   0,  1, 1);
// testRange(list, -10, -1, 0);
// testRange(list,   1,  1, 1);
// testRange(list,   1,  2, 2);
// testRange(list,   2,  2, 1);
// testRange(list,   2,  4, 1);
// testRange(list,   2,  5, 2);
// testRange(list,  16, 16, 1);
// testRange(list,  16, 20, 1);
// testRange(list,  17, 17, 0);
