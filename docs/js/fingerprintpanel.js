var includeElems = []
var include_nodes = []

var excludeElems = []
var exclude_nodes = []


function threeStateSelection(el, row, col, i){
    // Allows user to toggle between include, exclude, and ignore nodes
    
    include_nodes = [];
    exclude_nodes = [];

    var includeIndex = includeElems.indexOf(el);
    var excludeIndex = excludeElems.indexOf(el);


    if(!(includeIndex >= 0) && !(excludeIndex >= 0)){
        includeElems.push(el);
    }
    else if((includeIndex >= 0) && !(excludeIndex >= 0)){
        includeElems.splice(includeIndex, 1);
        excludeElems.push(el);
    }
    else if(excludeIndex >= 0){
        excludeElems.splice(excludeIndex, 1);
        el[0][0].className = "ignore";
    }

    for (var i = 0; i < includeElems.length; i++){
        includeElems[i][0][0].className = "include";
        include_nodes.push(includeElems[i][0][0].innerText)
    }
    for (var j = 0; j < excludeElems.length; j++){
        excludeElems[j][0][0].className = "exclude";
        exclude_nodes.push(excludeElems[j][0][0].innerText)
    }

    console.log("Include Nodes: ", include_nodes, "Exclude Nodes: ", exclude_nodes)
}



function initFingerprintPanel(containerId, columnNames, numRows, callback){
    // Creates the grid and attaches printClick callback to each cell
    var numCols = columnNames.length;
    var i = 0;
    var panel = d3.select(containerId).append('table')
        .attr("class", "fpPanel")
        .attr("id", "fingerprint")

    for (var r = 0; r < numRows; ++r){
        var tr = panel.append('tr');
        for (var c = 0; c < numCols; ++c){
            var cell = tr.append('td');
            cell.html(columnNames[c]);
            cell.on('click', function(el, r, c, i){
                return function(){
                    callback(el, r, c, i);
                }
            }(cell, r, c, i), false);
        }
    }

    return panel
}


function twoStateSelection(el, row, col, i){
    // Allows users to toggle between include or ignore 
    include_nodes = [];

    var index = includeElems.indexOf(el)
    if(index >= 0){ 
        el[0][0].className = "ignore";
        includeElems.splice(index, 1);
    } 
    else{
        includeElems.push(el)
    }
    if(includeElems.length != 0){
        for (var i = 0; i < includeElems.length; i++){
            includeElems[i][0][0].className = "include";
            include_nodes.push(includeElems[i][0][0].innerText);
        }
    }
    console.log(include_nodes)
}


var frameDict;


function getFrameDict(contents){
    var content_dict = JSON.parse(contents)
    if("frameDict" in content_dict){
        return content_dict["frameDict"];
    }
    return;
}

function getFingerprintColumns(contents){
    // Get fingerprint column labels
    var column_labels = []
    for (key in JSON.parse(contents)["frameDict"]){
        column_labels.push(key);
    }
    return column_labels;
}

function updateIntersectFrames(){
    // console.log("updateIntersectFrames", frameDict)
    console.log("include_nodes", include_nodes)
    var selection = [];
    for (var i = 0; i < include_nodes.length; i++){
        selection.push(frameDict[include_nodes[i]]);
    }
    flareplot.framesIntersect(selection);
}