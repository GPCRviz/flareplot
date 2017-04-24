
/**
 * Parse a graph and return the same reference but with additional fields:
 *
 * nodeMap - a map associating each node name (string) with a node reference
 * nodes - a list of nodes in no particular order
 * edges - a list of (not necessarily distinct) interactions with interaction timepoints (frames)
 * frames - list of list of interactions. First list has an entry for each time point.
 * tracks - TODO
 * trees - TODO
 */
function parse(graph){
    if(!graph.defaults)
        graph.defaults={};

    if(!graph.trees)
        graph.trees=[{"treeLabel":"default", "treePaths":[]}];

    if(!graph.tracks)
        graph.tracks=[{"trackLabel":"default", "trackProperties":[]}];

    // =========== Construct `nodeNames` list =========== \\
    graph.nodeNames = [];

    //Fill nodeNames from edges
    graph.edges.forEach(function(e){
            if ( !(graph.nodeNames.indexOf(e.name1)>-1) )
                graph.nodeNames.push(e.name1);
            if ( !(graph.nodeNames.indexOf(e.name2)>-1) )
                graph.nodeNames.push(e.name2);
            });

    //Fill nodeNames from trees
    graph.trees.forEach(function(t){
    t.treePaths.forEach(function(p){
        var name = p.substring(p.lastIndexOf(".")+1);
        if ( !(graph.nodeNames.indexOf(name)>-1) )
            graph.nodeNames.push(name);
        });
    });

    //Fill nodeNames from tracks
    graph.tracks.forEach(function(t){
        t.trackProperties.forEach(function(c){
            var name = c.nodeName;
            if ( !(graph.nodeNames.indexOf(name)>-1) )
                graph.nodeNames.push(name);
        });
    });

    //console.log(graph.nodeNames);

    // =========== Parse `trees` section ========== \\
    function addToMap(nodeMap, fullName) {
        var i = fullName.lastIndexOf(".");
        var name = fullName.substring(i+1);
        var node = nodeMap[name];
        if (!node) {
            node = nodeMap[name] = {name: name, children: []};
            if (name.length) {
                node.parent = addToMap(nodeMap, fullName.substring(0, i));
                node.parent.children.push(node);
                node.key = name;
            }
        }
        return node;
    };

    graph.trees.forEach(function(t){ 
       var addedNames = [];
       //Ensure that each tree-object has a `tree` attribute with the hierarchy
       t.tree = {};
       t.treePaths.forEach(function(p){
           addToMap(t.tree, p);
           addedNames.push(p.substring(p.lastIndexOf(".")+1));
       });

       //Ensure that even nodes not mentioned in the treePaths are added to the tree
       graph.nodeNames.forEach(function(p){
           if( addedNames.indexOf(p)==-1 ){
               addToMap(t.tree, p);
           }
       });
    });



    //Go through graph.edges and convert name1, name2, and frames to target and source object arrays
    graph.trees.forEach(function(t){
        t.frames = [];
        var summaryEdges = {};
        t.allEdges = [];
        graph.edges.forEach(function(e,i){
            //Set source and target of edge
            var edge = {
                source : t.tree[e.name1],
                target : t.tree[e.name2],      
                key    : ""+t.tree[e.name1].key+'-'+t.tree[e.name2].key,
                color  : e.color || graph.defaults.edgeColor || "rgba(100,100,100,100)",
                width  : e.width || graph.defaults.edgeWidth || 1
            };

            var edgeKey = edge.key;
            if (!summaryEdges[edgeKey]) {
                summaryEdges[edgeKey] = {
                    source: edge.source,
                    target: edge.target,
                    key: edge.key,
                    color: edge.color,
                    width: 1
                }
                t.allEdges.push({
                    source: edge.source,
                    target: edge.target,
                    key: edge.key,
                    color: edge.color,
                    width: 1
                });
            } else {
                summaryEdges[edgeKey].width++;
            }

            //edge.source = t.tree[edge.name1]; console.assert(edge.source);
            //edge.target = t.tree[edge.name2]; console.assert(edge.target);
            //edge.key = ""+i;


            //Add interaction frames
            e.frames.forEach(function(f){
                while(t.frames.length<=f) t.frames.push([]);
                t.frames[f].push(edge);
            });
        });
        t.summaryEdges = summaryEdges;
    });

    // =========== Parse `tracks` section ========== \\

    graph.tracks.forEach(function(track){
        //Ensure that nodes not mentioned in the trackProperties are created with default values
        var remainingNodeNames = [];
        graph.nodeNames.forEach(function(n){ remainingNodeNames.push(n); });

        track.trackProperties.forEach(function(p){ 
            //Remove p.name from remainingNodeNames
            var idx = remainingNodeNames.indexOf(p.nodeName);
            if(idx>-1) remainingNodeNames.splice(idx,1);
        });

        remainingNodeNames.forEach(function(n){
            var color = graph.defaults.trackColor || "white";
            var size  = graph.defaults.trackSize  || 0;
            track.trackProperties.push( { "nodeName":n, "color": color, "size":size } );
        });
    });


    return graph;
}


// Return a list of imports for the given array of nodes.
genLinks = function(nodes) {
    var map = {},
        imports = [];

    // Compute a map from name to node.
    nodes.filter(function(d){ return d.name!=undefined; }).forEach(function(d) {
            map[d.name.substring(d.name.lastIndexOf(".")+1)] = d;
            });

    // For each import, construct a link from the source to target node.
    nodes.filter(function(d){ return d.name==undefined; }).forEach(function(d) {
            while(imports.length<d.edgeEvo.length) 
            imports.push([]);

            d.edgeEvo.forEach(
                    function(w,i){ 
                    if(w>0.0) 
                    imports[i].push({source: map[d.name1], target: map[d.name2], weight: w}); 
                    } 
                    );

            });

    console.log(imports);
    return imports;
}
