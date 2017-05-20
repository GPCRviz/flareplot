var includeElems = [];
var include_nodes = [];

var excludeElems = [];
var exclude_nodes = [];

var frameDict;
var frameIndex_to_collabel;


function getFrameDict(contents){
    // Get mapping from column label to index
    var content_dict = JSON.parse(contents);
    if("frameDict" in content_dict){
        return content_dict["frameDict"];
    }
    return;
}

function getFingerprintColumns(contents){
    // Get fingerprint column labels
    var column_labels = []
    frameDict = JSON.parse(contents)["frameDict"];
    for (key in frameDict){
        column_labels.push(frameDict[key]);
    }
    return column_labels;
}

function updateIntersectFrames(){
    // Update the UI when user clicks table cell
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

function twoStateSelection(el, row, col){
    // Allows users to toggle between include or ignore 
    include_nodes = [];

    var index = includeElems.indexOf(el)
    if(index >= 0){
        el[0][0].className = "ignore";
        includeElems.splice(index, 1);
    } else {
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


function threeStateSelection(el, row, col){
    // Allows user to toggle between include, exclude, and ignore nodes
    include_nodes = [];
    exclude_nodes = [];

    var includeIndex = includeElems.indexOf(el);
    var excludeIndex = excludeElems.indexOf(el);


    if(!(includeIndex >= 0) && !(excludeIndex >= 0)){
        el.html("&#10003")
        includeElems.push(el);
    }
    else if((includeIndex >= 0) && !(excludeIndex >= 0)){
        includeElems.splice(includeIndex, 1);
        el.html("&#10007")
        excludeElems.push(el);
    }
    else if(excludeIndex >= 0){
        excludeElems.splice(excludeIndex, 1);
        el.html("")
        el[0][0].className = "ignore";
    }

    for (var i = 0; i < includeElems.length; i++){
        includeElems[i][0][0].className = "include";

        include_nodes.push(includeElems[i].col_header);
    }
    for (var j = 0; j < excludeElems.length; j++){
        excludeElems[j][0][0].className = "exclude";
        exclude_nodes.push(excludeElems[j].col_header);
    }

    console.log("Include Nodes: ", include_nodes, "Exclude Nodes: ", exclude_nodes)
}


function initFingerprintPanel(containerId, columnNames, callback, show_header, col_label_height){
    // Creates the grid and attaches printClick callback to each cell
    var numRows = 1;
    var numCols = columnNames.length;

    var outerPanel = d3.select(containerId).append("div")
        .attr("class", "fpPanelOuter")
        .attr("id", "fingerprintOuter")

    var panel = d3.select("#fingerprintOuter").append("table")
        .attr("class", "fpPanel")
        .attr("id", "fingerprint")


    // Column Headers
    var column_header_panel = panel.append("thead").append("tr");
    var col_headers = []
    for (var c = 0; c < numCols; ++c){
        var col_header = column_header_panel.append("th").style("height", col_label_height).append("span");
        if(show_header){
            col_header.html(columnNames[c]);
            col_headers.push(col_header);
        }else{
            col_header.html("");
            col_headers.push(col_header)
        }
    }


    // Fingerprint cells
    for (var r = 0; r < numRows; ++r){
        var tr = panel.append("tbody").append('tr');
        for (var c = 0; c < numCols; ++c){
            var cell = tr.append('td');
            cell.html("")
            cell.col_header = columnNames[c]; // Attribute to keep track of column header
            cell.on('click', function(el, r, c){
                return function(){
                    callback(el, r, c);
                }
            }(cell, r, c), false);
        }
    }

    return panel
}


function calcFingerprints(contents){
    function Comparator(a, b) {
        if (a[1] > b[1]) return -1;
        if (a[1] < b[1]) return 1;
        return 0;
    }

    var fingerprint_dict = {};
    var content_dict = JSON.parse(contents);
    var edges = content_dict["edges"];
    for (var i = 0; i < edges.length; i++){
        var e = edges[i];
        var frames = e["frames"];
        if(frames.length == 0){
            continue
        }
        var name1 = e["name1"];
        var name2 = e["name2"];
        if(!(frames in fingerprint_dict)){
            fingerprint_dict[frames] = 1;
        }else{
            fingerprint_dict[frames] += 1;
        }
    }


    fingerprint_list = [];
    for (key in fingerprint_dict){
        fingerprint_list.push([key, fingerprint_dict[key]]);
    }

    // Sort by frequency
    fingerprint_list = fingerprint_list.sort(Comparator);
    p = fingerprint_list;
    return fingerprint_list;
}


function threeStateRowSelection(tr, r, columnNames){
    include_nodes = []
    exclude_nodes = []
    var row_cells = tr[0][0].cells;

    for (var i = 0; i < row_cells.length; i++){
        var state = row_cells[i].className;
        if(state == "include"){
            include_nodes.push(columnNames[i])
        }else if(state == "exclude"){
            exclude_nodes.push(columnNames[i])
        }
    }
}


function initScrollableFingerprintPanel(containerId, columnNames, fingerpint_list, callback, show_header, col_label_height){
    // Creates the grid and attaches printClick callback to each cell
    var numRows = fingerprint_list.length;
    var numCols = columnNames.length;

    var outerPanel = d3.select(containerId).append("div")
        .attr("class", "fpPanelOuter")
        .attr("id", "fingerprintOuter")

    var panel = d3.select("#fingerprintOuter").append("table")
        .attr("class", "fpScrolldown")
        .attr("id", "scrolldown");

    // Column Headers
    var column_header_panel = panel.append("thead").append("tr");
    var col_headers = [];
    for (var c = 0; c < numCols; c++){
        var col_header = column_header_panel.append("th").style("height", col_label_height).append("span");
        if(show_header){
            col_header.html(columnNames[c]);
            col_headers.push(col_header)
        }else{
            col_header.html("");
            col_headers.push(col_header)
        }
    }


    // Fingerprint cells
    var scroll_panel_body = panel.append("tbody")
    for (var r = 0; r < numRows; r++){
        var fpattern = fingerprint_list[r][0].split(",").map(Number);
        var count = fingerprint_list[r][1];

        var tr = scroll_panel_body.append('tr');
        for (var c = 0; c < numCols; c++){

            var cell = tr.append('td')
            cell.col_header = columnNames[c]; // Attribute to keep track of column header
            if(fpattern.includes(c)){
                cell[0][0].className = 'include';
            }else{
                cell[0][0].className = 'exclude';
            }
        }
        tr.on('click', function(tr, r, columnNames){
            return function(){
                callback(tr, r, columnNames);
            }
        }(tr, r, columnNames), false);

    }

    return panel
}
