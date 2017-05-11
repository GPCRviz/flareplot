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
        // include_nodes.push(includeElems[i][0][0].innerText)
        include_nodes.push(includeElems[i].col_header);
    }
    for (var j = 0; j < excludeElems.length; j++){
        excludeElems[j][0][0].className = "exclude";
        // exclude_nodes.push(excludeElems[j][0][0].innerText)
        exclude_nodes.push(excludeElems[j].col_header);
    }

    console.log("Include Nodes: ", include_nodes, "Exclude Nodes: ", exclude_nodes)
}


function initFingerprintPanel(containerId, columnNames, numRows, callback){
    // Creates the grid and attaches printClick callback to each cell
    var numCols = columnNames.length;
    var i = 0;

    var outerPanel = d3.select(containerId).append('div')
        .attr("class", "fpPanelOuter")
        .attr("id", "fingerprintOuter")

    var panel = d3.select("#fingerprintOuter").append('table')
        .attr('class', 'fpPanel')
        .attr('id', 'fingerprint')


    // Column Headers
    var column_header_panel = panel.append("thead").append('tr');
    var col_headers = []
    for (var c = 0; c < numCols; ++c){
        var col_header = column_header_panel.append('th').append("span")
        col_header.html(columnNames[c]);
        col_headers.push(col_header)
    }


    // Fingerprint cells
    for (var r = 0; r < numRows; ++r){
        var tr = panel.append("tbody").append('tr');
        for (var c = 0; c < numCols; ++c){
            var cell = tr.append('td');
            cell.col_header = columnNames[c]; // Attribute to keep track of column header
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
            include_nodes.push(includeElems[i].col_header);
        }
    }
    console.log(include_nodes)
}


var frameDict;
var frameIndex_to_collabel


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
    var frameDict = JSON.parse(contents)["frameDict"]
    for (key in frameDict){
        console.log(frameDict[key])
        column_labels.push(frameDict[key]);
    }
    return column_labels;
}

function updateIntersectFrames(){
    frameIndex_to_collabel = {}
    for (frameIndex in frameDict){
        var collabel = frameDict[frameIndex]
        frameIndex_to_collabel[collabel] = frameIndex
    }


    var include_sel = [];
    for (var i = 0; i < include_nodes.length; i++){
        include_sel.push(frameIndex_to_collabel[include_nodes[i]]);
    }

    var exclude_sel = [];
    for (var i = 0; i < exclude_nodes.length; i++){
        exclude_sel.push(frameIndex_to_collabel[exclude_nodes[i]]);
    }

    if(exclude_sel.length == 0){
        flareplot.framesIntersect(include_sel);
    }else{
        flareplot.framesIntersectSubtract(include_sel, exclude_sel)
    }
    
}