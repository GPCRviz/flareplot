

function createFlareplot(width, json, divId){
    var w = width,
        h   = w,
        rx  = w / 2,
        ry  = w / 2,
        rotate = 0;

    var summaryTransitionTime = 400;
    var summaryRange = [4, 10];

    if (!divId) {
        divId = '#evobundlediv';
    } else {
        divId = '#' + divId;
    }

    var cluster = d3.layout.cluster()
        .size([360, ry - 120])
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

    var stdEdgeColor = "rgba(0,0,0,200)";
    var stdEdgeWidth = 2;
    var svg, div, bundle, line, nodes, splines, links, graph;
    var summaryMode = false;

    var selectedTree = 0;
    var selectedTrack = 0;
    var toggledNodes = {};
    var splineDico;

    return (function() {

        function create_bundle(json_text) {

            bundle = d3.layout.bundle();

            line = d3.svg.line.radial()
                .interpolate("bundle")
                .tension(.85)
                .radius(function(d) { return d.y; })
                .angle(function(d) { return d.x / 180 * Math.PI; });

            d3.select(divId).style("position","relative");

            div = d3.select(divId).insert("div")
                .style("width", w + "px")
                .style("height", w + "px")
                .style("-webkit-backface-visibility", "hidden");

            svg = div.append("svg:svg")
                .attr("width", w)
                .attr("height", h)
                .append("svg:g")
                .attr("transform", "translate(" + rx + "," + ry + ")");

            svg.append("svg:path")
                .attr("class", "arc")
                .attr("d", d3.svg.arc().outerRadius(ry - 120).innerRadius(0).startAngle(0).endAngle(2 * Math.PI));
                //.on("mousedown", mousedown);

            d3.select(divId + " .switchButton").on("click", function() {
                transitionToCluster();
            });

            d3.select(divId + " .summaryButton").on("click", function() {
                transitionToSummary();
            });

            json  = JSON.parse(json_text)
            graph = parse(json);
            nodes = cluster.nodes(graph.trees[selectedTree].tree[""]);
            links = graph.trees[selectedTree].frames;
            splines = bundle(links[0]);
            splineDico = buildSplineIndex(splines);

            var path = svg.selectAll("path.link")
                .data(links[0], function(d,i){
                    var key = "source-" + d.source.key + "target-" + d.target.key;
                    return key;
                })
                .enter().append("svg:path")
                .attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes)
                        ret+=" toggled";
                    return ret;
                })
                .style("stroke-width",function(d){ return d.width?d.width:stdEdgeWidth; })
                .style("stroke",function(d){ return ("color" in d)?d.color:stdEdgeColor; })
                .attr("d", function(d, i) { return line(splines[i]); });

            svg.selectAll("g.node")
                .data(nodes.filter(function(n) { return !n.children; }), function(d) { return d.key})
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

            var maxWidth = d3.max(svg.selectAll("text")[0], function(t){ return t.getBBox().width; });

            var arcW = 250.0/(graph.nodeNames.length)*Math.PI/360;
            var arc = d3.svg.arc()
                .innerRadius(ry-80)
                .outerRadius(function(d,i){ 
                  var sz = d.size;
                  if(!sz) sz = 0.0;
                  var or = ry-80+sz*15; 
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

            d3.select(divId + " input[type=range]")
                .on("input", function() {
                    line.tension(this.value / 100);
                    var path = svg.selectAll("path.link"); // you need to reselect cause the data can have changed
                    path.attr("d", function(d, i) { return line(splines[i]); });
                });



            //d3.select(window)
            //    .on("mousemove", mousemove)
            //    .on("mouseup", mouseup);


            //Set up controls
            var ch = 35,
                cp = 2,
                cw = 3*ch+2*cp;


        //<div id="evocontrols" style="position:absolute;top:780px;left:0px;width:100%;font-size:18px;">
        //    <span  id="controls"></span>
        //    <input id="timeRange" type="range" min="0" max="1000" value="0" />
        //    <span id="timeLabel">0</span>
        //</div>
            var controlDiv = d3.select(divId)
                .append("div")
                .attr("id","evocontrols")
                .style("position","absolute")
                .style("bottom","3px")
                .style("left","0px")
                .style("width","100%")
                //.style("height","20px")
                .style("font-size","18px");

            var controls = controlDiv
                .append("span")
                .attr("id","controls")
                .style("width",cw)
                .style("height",ch)
                .append("svg:svg")
                .attr("width", cw)
                .attr("height", ch);

            var controlData = [
                {xoffset:0, id:"reverse",   symbol:"<<", callback:reverse},
                {xoffset:1, id:"playpause", symbol:">", callback:playpause},
                {xoffset:2, id:"forward",   symbol:">>", callback:forward}
            ];

            //buttons = controls.selectAll("g")
            //    .data(controlData)
            //  .enter().append("g").append("circle")
            var buttons = controls.selectAll("g")
                .data(controlData)
                .enter().append("g");

            buttons
                .append("circle")
                .style("fill",  "white")
                .style("stroke","gray")
                .style("stroke-width","1")
                .attr("r",  ch/2-cp)
                .attr("cx", function(d){ return d.xoffset*(ch+cp)+ch/2; })
                .attr("cy", function(d){ return ch/2; })
                .style("cursor", "pointer")
                .on("click", function(d){ d.callback(); });

            buttons
                .append("text")
                .attr("id", function(d){ return d.id; })
                .attr("x", function(d){ return d.xoffset*(ch+cp)+ch/2; })
                .attr("y", function(d){ return ch/2; })
                //.style("dominant-baseline","central")
                .style("alignment-baseline","middle")
                .style("text-anchor","middle")
                .style("font-size",ch/3)
                .attr('pointer-events', 'none')
                .html(function(d){ return d.symbol; });

        //    <input id="timeRange" type="range" min="0" max="1000" value="0" />
            //d3.select("div#evocontrols #timeRange")
            controlDiv
                .append("input")
                .attr("id","timeRange")
                .attr("type","range")
                .attr("min","0")
                .attr("max","1000")
                .attr("value","0")
                .style("width",(w-2*cw-20)+"px")
                .style("height", ch+"px")
                .attr("max", links.length-1)
                .on("input", function(){fireTickListeners(this.value);} );

        //    <span id="timeLabel">0</span>
            //d3.select("div#evocontrols #timeLabel")
            controlDiv
                .append("span")
                .attr("id","timeLabel")
                .text("0")
                .style("position","relative")
                .style("left", "20px")
                .style("alignment-baseline","middle")
                .style("width",cw+"px")
                .style("line-height", ch+"px")
                .style("height", ch+"px")
                .style("bottom", "13px");


            // we need to that here as we
            d3.select("input#timeRange")
                .attr("max", links.length-1)
                .on("input.tick", function(){
                    fireTickListeners(this.value);
                });



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




        var playing = false;
        var frameskip = 1;
        var curFrame = 0;

        function setFrame(frame){
            if (summaryMode) {
                return // make no sense to setFrame in summary mode
            }
            curFrame = frame;
            d3.select(divId + " span[id=timeLabel]")
                .text(""+frame);

            splines = bundle(links[frame]);
            path = svg.selectAll("path.link")
                .data(links[frame], function(d,i){ return "source-" + d.source.key + "target-" + d.target.key;});//, function(d){ return {source:d.source, target:d.target}; });

            path.enter().append("path")
                .attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes)
                        ret+=" toggled";
                    return ret;
                });
            //.attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; });
            path.style("stroke-width",function(d){ return d.width?d.width:stdEdgeWidth; })
                .attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes)
                        ret+=" toggled";
                    return ret;
                })
                //.attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
                .style("stroke",function(d){ return ("color" in d)?d.color:stdEdgeColor; })
                .attr("d", function(d, i) { return line(splines[i]); });

            path.exit().remove();

            curFrame = frame;
        }

        var tickListeners = [];
        tickListeners[0] = setFrame;

        function fireTickListeners(frame){
            for(var i=0;i<tickListeners.length;i++){
                tickListeners[i](frame);
            }
        }

        function playTick(){
            var timeRange = d3.select(divId + " input[id=timeRange]");
            var curValue = parseInt(timeRange[0][0].value);
            if(playing && curValue+frameskip<links.length-1) {
                var skip = Math.min(frameskip, links.length-1-frameskip);
                timeRange[0][0].value = curValue+skip;
                fireTickListeners(curValue+skip);
                //setFrame(curValue+skip);

                setTimeout(playTick, 50);
            }else{
                playing=false;
            }

            //Update play/pause symbol
            var sym = playing?"#":">";
            d3.select(divId + " #playpause")
                .html(sym);
        }

        function playpause(){
            playing = !playing;
            if(playing) {
                playTick();
            }
        }

        function reverse(){
            var timeRange = d3.select(divId + " input[id=timeRange]");
            var minVal = timeRange.attr("min");
            timeRange[0][0].value = minVal;
            fireTickListeners(minVal);
            //setFrame(minVal);
        }

        function forward(){
            playing = false;
            var timeRange = d3.select(divId + " input[id=timeRange]");
            var maxVal = timeRange.attr("max");
            timeRange[0][0].value = maxVal;
            fireTickListeners(maxVal);
            //setFrame(maxVal);
        }


        function toggleNode(d,i){
            var toggled = !d3.select(this.parentNode).classed("toggledNode");
            d3.select(this.parentNode)
                .classed("toggledNode", function(d){return toggled; });

            var name = d.name.substring(d.name.lastIndexOf(".")+1);
            if(!toggled)
                delete toggledNodes[name];
            else
                toggledNodes[name] = "";

            path = svg.selectAll("path.link")
                .classed("toggled", function(d) {
                    return ( d.source.key in toggledNodes || d.target.key in toggledNodes)
                });

            //svg.selectAll("path.link/target-"+d.key);
            fireTickListeners(curFrame);
        }

        //function mouse(e) {
        //    return [e.pageX - rx, e.pageY - ry];
        //}

        //function mousedown() {
        //    m0 = mouse(d3.event);
        //    d3.event.preventDefault();
        //}

        //function mousemove() {
        //    if (m0) {
        //        var m1 = mouse(d3.event),
        //            dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
        //        div.style("-webkit-transform", "translateY(" + (ry - rx) + "px)rotateZ(" + dm + "deg)translateY(" + (rx - ry) + "px)");
        //    }
        //}

        //function mouseup() {
        //    if (m0) {
        //        var m1 = mouse(d3.event),
        //            dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;

        //        rotate += dm;
        //        if (rotate > 360) rotate -= 360;
        //        else if (rotate < 0) rotate += 360;
        //        m0 = null;

        //        div.style("-webkit-transform", null);

        //        svg
        //            .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
        //            .selectAll("g.node text")
        //            .attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
        //            .attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
        //            .attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
        //    }
        //}


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
            for ( t in graph.trees ){
                if (!graph.trees[t].treeLabel) {
                    ret.push("Non-named tree");
                } else {
                    ret.push(graph.trees[t].treeLabel);
                }
            }
            return ret;
        }

        function setTree(treeIdx){
            var oldTreeIdx = selectedTree;
            selectedTree = treeIdx;
            assignCluster(graph.trees[selectedTree], graph.trees[oldTreeIdx], graph);
            var recomposedSplines = [];
            nodes = cluster.nodes(graph.trees[selectedTree].tree[""]);

            links = summaryMode ?
                Object.values(graph.trees[selectedTree].summaryEdges) :
                graph.trees[selectedTree].frames[curFrame];

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
                .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })

            var arcW = 250.0/(graph.nodeNames.length)*Math.PI/360;
            var arc = d3.svg.arc()
                .innerRadius(ry-80)
                .outerRadius(function(d,i){ 
                  var sz = d.size;
                  if(!sz) sz = 0.0;
                  var or = ry-80+sz*15; 
                  return or; 
                })
                .startAngle(-arcW)
                .endAngle(arcW);
            //var arc = d3.svg.arc()
            //    .innerRadius(ry-80)
            //    .outerRadius(ry-70)
            //    .startAngle(-arcW)
            //    .endAngle(arcW);

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
            var newSplines =
                summaryMode ? bundle(Object.values((graph.trees[selectedTree].summaryEdges))) :
                bundle(graph.trees[selectedTree].frames[curFrame]);
            var newSplinesDico = buildSplineIndex(newSplines);


            var done = false;
            var path = svg.selectAll("path.link").data(links, function(d,i){
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
                        console.log('Not found Spline with key', key);
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


        function getTrackNames(){
            var ret = [];
            for ( t in graph.tracks ){
                if (!graph.tracks[t].trackLabel) {
                    ret.push('Non named track');
                } else {
                    ret.push(graph.tracks[t].trackLabel);
                }
            }
            return ret;
        }

        function setTrack(trackIdx){
            selectedTrack = trackIdx;
            var arcW = 250.0/(graph.nodeNames.length)*Math.PI/360;
            var arc = d3.svg.arc()
                .innerRadius(ry-80)
                .outerRadius(function(d,i){ 
                  var sz = d.size;
                  if(!sz) sz = 0.0;
console.log(sz);
                  var or = ry-80+sz*15; 
                  return or; 
                })
                .startAngle(-arcW)
                .endAngle(arcW);
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

        function cross(a, b) {
            return a[0] * b[1] - a[1] * b[0];
        }

        function dot(a, b) {
            return a[0] * b[0] + a[1] * b[1];
        }


        function parseCluster(cluster) {
            var keyValuesClusterArray = cluster.split('"');
            var numberOfObjects = Math.floor(keyValuesClusterArray.length / 2);
            var clusterDefinition = {};
            for (var i = 0; i < numberOfObjects; i++) {
                var keys = keyValuesClusterArray[i * 2 + 1].split(' ');

                clusterDefinition[keyValuesClusterArray[i * 2]] = keys;
                keys.forEach(function(k){
                    graph.nodeMap[k].present = true;
                });
            }
            var absentCluster = [];
            graph.nodes.forEach(function(n){
                if (!n.present) {
                    absentCluster.push(n.name);
                }
            });
            clusterDefinition['Others'] = absentCluster;

            // for whatever reasons, i have 2 MORE nodes here !!
            return clusterDefinition;
        }
        // For all splines in the array, create an index that match the key of
        // the link and the index in the spline array
        function buildSplineIndex(splines) {
            var linkKeyToSplineIdx = {};
            splines.forEach(function(spline, idx){
                var source = spline[0].key;
                var target = spline[spline.length-1].key;
                var key = source + '-' + target;
                linkKeyToSplineIdx[key] = idx;
            });
            return linkKeyToSplineIdx;
        }

        function transitionToSummary(){
            //links contains all the frames
            if (summaryMode) {
                // take from setFrame, but with transition
                links = graph.trees[selectedTree].frames
                splines = bundle(links[curFrame]);
                splineDico = buildSplineIndex(splines);
                path = svg.selectAll("path.link")
                    .data(links[curFrame], function(d){ return d.key});

                path.attr("class", function(d) {
                    var ret = "link source-" + d.source.key + " target-" + d.target.key;
                    if( d.source.key in toggledNodes || d.target.key in toggledNodes)
                        ret+=" toggled";
                    return ret;
                });

                path.transition()
                    .duration(summaryTransitionTime)
                    .style("stroke-width",function(d){ return d.width? d .width : stdEdgeWidth; });

                path.exit()
                    .transition()
                    .duration(summaryTransitionTime)
                    .style("stroke-width", 0)
                    .remove();
                summaryMode = !summaryMode;
                return;
            }

            if(playing) { playpause(); }
            summaryMode = !summaryMode;
            summaryLinks = Object.values(graph.trees[selectedTree].summaryEdges);

            //TODO(chab) decide how we set the extent for the width of the links
            var summaryLinksExtent = d3.extent(summaryLinks, function(d) {
                return d.width;
            });

            var linkWidthScale = d3.scale.linear()
                .domain(summaryLinksExtent)
                .range(summaryRange);

            splines = bundle(summaryLinks);
            splineDico = buildSplineIndex(splines);

            var path = svg.selectAll("path.link")
                .data(summaryLinks, function(d,i){
                    return d.key;
                });

            path.enter().insert("svg:path")
                .style("stroke-width",function(d){ return 0; });
            path.attr("class", function(d) {
                var ret = "link source-" + d.source.key + " target-" + d.target.key;
                if( d.source.key in toggledNodes || d.target.key in toggledNodes)
                    ret+=" toggled";
                return ret;
            }).attr("d", function(d, i) { return line(splines[i]); })
                .style("stroke",function(d){ return ("color" in d)?d.color:stdEdgeColor; })
                .transition().duration(summaryTransitionTime)
                .style("stroke-width",function(d){
                    return linkWidthScale(d.width)
                });
            path.exit().remove();
        }

        function download() {


                // grab SVG
                var html = d3.select("svg")
                    .attr("version", 1.1)
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .node().parentNode.innerHTML;
                //d3.select("#svgdataurl").html(img);
                var DOMURL = self.URL || self.webkitURL || self;
                var svg = new Blob([html], {type: 'image/svg+xml'});
                var url = DOMURL.createObjectURL(svg);
                // rasterize
                var canvas = document.querySelector("canvas"),
                    context = canvas.getContext("2d");
                var image = new Image;
                image.src = url;
                image.onload = function() {
                    context.drawImage(image, 0, 0);
                    DOMURL.revokeObjectURL(url);
                    //save and serve it as an actual filename
                    binaryblob();
                    //create a link that will force the user to download
                    var a = document.createElement("a");
                    a.download = "sample.png";
                    a.href = canvas.toDataURL("image/png");
                    var pngimg = '<img src="'+a.href+'">';
                    d3.select("#pngdataurl").html(pngimg);
                    a.click();
                    a.remove();
                    context.clearRect(0, 0, 1000, 1000);
                    d3.select("#pngdataurl").html('');
                    d3.select("#img").html('');
                    //remove the link and the fake canvas

            };

            function binaryblob(){
                var byteString = atob(document.querySelector("canvas").toDataURL().replace(/^data:image\/(png|jpg);base64,/, "")); //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                var dataView = new DataView(ab);
                var blob = new Blob([dataView], {type: "image/png"});
                var DOMURL = self.URL || self.webkitURL || self;
                var newurl = DOMURL.createObjectURL(blob);

                var img = '<img src="'+newurl+'">';
                d3.select("#img").html(img);
            }
        }



        create_bundle(json);

        return {
            setTrack: setTrack,
            setTree: setTree,
            getTreeNames: getTreeNames,
            getTrackNames: getTrackNames,
            toggleSummary: transitionToSummary,
            download: download,
            graph: graph// for debugging purposes
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

