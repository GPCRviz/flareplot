
/**
 * Creates a fingerprintpanel controlling the specified flareplot and contained in the specified container.
 * @param flareplot a flareplot object that will be controlled with this fingerprintpanel
 * @param containerId a string indicating a css selection of the container to which the panel will be added.
 * @param showHeader a boolean indicating whether column headers are shown
 * @param colLabelHeight a css-style height indicator for the header
 */
function createFingerprintPanel(flareplot, containerId, show_header, col_label_height) {

    let include_nodes = [];

    let exclude_nodes = [];

    let frameIndex_to_collabel;
    const maxFrame = flareplot.graph.edges.reduce((acc, e) => Math.max(acc, e.frames.reduce( (facc, f) => Math.max(facc, f), 0 )), 0);
    let frameDict = flareplot.graph.frameDict;
    if (!frameDict) {
        frameDict = {};
        for (c = 0; c <= maxFrame; c += 1){
            frameDict[c.toString()] = c.toString();
        }
    }

    function updateIntersectFrames() {
        // Update the UI when user clicks table cell
        frameIndex_to_collabel = {};
        for (frameIndex in frameDict) {
            let collabel = frameDict[frameIndex]
            frameIndex_to_collabel[collabel] = frameIndex;
        }

        let include_sel = [];
        for (i = 0; i < include_nodes.length; i += 1) {
            include_sel.push(frameIndex_to_collabel[include_nodes[i]]);
        }

        let exclude_sel = [];
        for (i = 0; i < exclude_nodes.length; i += 1) {
            exclude_sel.push(frameIndex_to_collabel[exclude_nodes[i]]);
        }

        if (exclude_sel.length == 0) {
            flareplot.framesIntersect(include_sel);
        } else {
            flareplot.framesIntersectSubtract(include_sel, exclude_sel)
        }
    }

    function calcFingerprints(graph) {
        function Comparator(a, b) {
            if (a[1] > b[1]) { return -1; }
            if (a[1] < b[1]) { return 1; }
            return 0;
        }

        var fingerprint_dict = {};
        graph.edges.forEach(function(e, i){
            if (e.frames.length == 0) {
                return;
            }
            if (!(e.frames in fingerprint_dict)) {
                fingerprint_dict[e.frames] = 1;
            } else {
                fingerprint_dict[e.frames] += 1;
            }
        });

        fingerprint_list = [];
        for (key in fingerprint_dict) {
            fingerprint_list.push([key, fingerprint_dict[key]]);
        }

        // Sort by frequency
        fingerprint_list = fingerprint_list.sort(Comparator);
        return fingerprint_list;
    }


    function threeStateRowSelection(tr, r, columnNames) {
        include_nodes = [];
        exclude_nodes = [];
        var row_cells = tr[0][0].cells;

        for (var i = 0; i < row_cells.length; i++) {
            var state = row_cells[i].className;
            if (state == "include") {
                include_nodes.push(columnNames[i])
            } else if (state == "exclude") {
                exclude_nodes.push(columnNames[i])
            }
        }
    }


    function initScrollableFingerprintPanel(containerId, columnNames, fingerprint_list, show_header, col_label_height) {
        // Creates the grid and attaches printClick callback to each cell
        var numRows = fingerprint_list.length;
        var numCols = columnNames.length;

        var panel = d3.select(containerId).append("table")
            .attr("class", "fpScrolldown")
            .attr("id", "scrolldown");

        // Column Headers
        var column_header_panel = panel.append("thead").append("tr");
        var col_headers = [];
        for (var c = 0; c < numCols; c++) {
            var col_header = column_header_panel.append("th").style("height", col_label_height).append("span");
            if (show_header) {
                col_header.html(columnNames[c]);
                col_headers.push(col_header)
            } else {
                col_header.html("");
                col_headers.push(col_header)
            }
        }


        // Fingerprint cells
        var scroll_panel_body = panel.append("tbody")
        for (var r = 0; r < numRows; r++) {
            var fpattern = fingerprint_list[r][0].split(",").map(Number);
            var count = fingerprint_list[r][1];

            var tr = scroll_panel_body.append("tr");
            for (var c = 0; c < numCols; c++) {

                var cell = tr.append("td")
                cell.col_header = columnNames[c]; // Attribute to keep track of column header
                if (fpattern.includes(c)) {
                    cell[0][0].className = "include";
                }
                else {
                    cell[0][0].className = "exclude";
                }
            }
            tr.on("click", function (tr, r, columnNames) {
                return function () {
                    threeStateRowSelection(tr, r, columnNames);
                }
            }(tr, r, columnNames), false);

        }

        var legend = d3.select(containerId).append("table")
            .attr("class", "fpScrollLegend")
            .attr("id", "scrollLegend")
            .append("tr");

        legend.append("td").attr("class", "include");
        legend.append("td").attr("class", "text").html("&nbsp &nbsp Intersect &nbsp &nbsp");
        legend.append("td").attr("class", "exclude");
        legend.append("td").attr("class", "text").html("&nbsp &nbsp Exclude &nbsp &nbsp");

        return panel
    }

    var fingerprint_list = calcFingerprints(flareplot.graph);
    var colNames = [];
    for (key in frameDict){
        colNames.push(frameDict[key]);
    }
    const panel = initScrollableFingerprintPanel(
        containerId,
        colNames,
        fingerprint_list,
        show_header,
        col_label_height
    );
    panel.on("click", updateIntersectFrames);

    return {};
}