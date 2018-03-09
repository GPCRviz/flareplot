

function createComparePanel(flareplot, cellWidth, containerSelector){
    const clickListeners = [];


    function initialize() {
        const container = d3.select(containerSelector);

        // ------------- Initialize panel header -------------
        const colHeaders = [];
        for (let f in flareplot.graph.frameDict) {
            if (flareplot.graph.frameDict.hasOwnProperty(f)) {
                colHeaders[f] = flareplot.graph.frameDict[f];
            }
        }
        const numCols = colHeaders.length;

        const div = container.append("div");
            // .style("border-bottom", "1px solid #AAA");
            // .style("border", "1px dashed gray");

        const headerAngle = -50;

        const headerDiv = div.append("div")
            .classed("cp-header", true)
            .style("position", "relative");
        const headerCells = headerDiv
            .selectAll(".cp-headerCell")
            .data(colHeaders)
            .enter()
            .append("div")
            .classed("cp-headerCell", true)
            .style("line-height", cellWidth + "px")
            .style("position", "absolute")
            .style("bottom", "0px")
            .style("white-space", "nowrap")
            .style("overflow-y", "visible")
            .style("vertical-align", "middle")
            .style("transform", "rotate(" + headerAngle + "deg)")
            .style("left", "50%")
            .style("margin-left", function (d, i) {
                return ((i - numCols / 2) * cellWidth) + "px";
            })
            .text(function (d) {
                return d;
            });

        // Cell width hasn't been set yet, so will represent the width of the text. Compute the max width
        const maxHeaderCellWidth = d3.max(d3.merge(headerCells), function (c) {
            return c.clientWidth;
        });
        headerCells.style("width", cellWidth + "px");

        // Use the max text width and header rotation angle to compute and set the real height of the header
        const headerHeight = Math.sin(Math.abs(headerAngle) * Math.PI / 180) * maxHeaderCellWidth;
        headerDiv.style("height", headerHeight + "px");


        // ------------- Initialize panel body -------------
        const fingerprints = computeFingerprints(flareplot.graph);
        console.log(fingerprints)
        const numRows = fingerprints.length;
        const activeRowBorderWidth = 2;

        // Scrollable body
        const bodyDiv = div.append("div")
            .classed("cp-body", true)
            .style("position", "relative")
            .style("height", (cellWidth*5.5)+"px")
            .style("overflow-y", "auto")

        // The rows are duplicated in 2 layers because of how css positions things with/without border.
        // The bottom layer (z-index -1) are used to display dividers (border-bottom)
        // The top layer rows contain the actual cells
        bodyDiv.selectAll(".cp-row-bottom")
            .data(fingerprints).enter()
            .append("div")
            .attr("class", "cp-row-bottom")
            .style("position", "absolute")
            .style("z-index", "-1")
            .style("width", (numCols * cellWidth) + "px")
            .style("height", cellWidth + "px")
            .style("top", function(d,i){ return (activeRowBorderWidth + i * cellWidth) + "px"; })
            .style("left", "50%")
            .style("border-bottom", "1px solid #DDD")
            .style("margin-left", -(numCols * cellWidth / 2) + "px");

        const rows = bodyDiv.selectAll(".cp-row")
            .data(fingerprints).enter()
            .append("div")
            .attr("class", "cp-row")
            .style("position", "absolute")
            .style("box-sizing", "content-box")
            .style("width", (numCols * cellWidth) + "px")
            .style("height", cellWidth + "px")
            .style("top", function(d,i){ return (activeRowBorderWidth + i * cellWidth) + "px"; })
            .style("left", "50%")
            .style("border-radius", "3px")
            .style("border-color", "#bcc1dd")
            .style("border-width", activeRowBorderWidth+"px")
            .style("margin-left", -(numCols * cellWidth / 2) + "px")
            .on("mouseover", function(rd, ri){
                d3.select(this).style("border-style", "solid")
                    .style("margin-top", "-"+activeRowBorderWidth+"px")
                    .style("margin-left", -(activeRowBorderWidth + numCols * cellWidth / 2) + "px");

                // Show edit button
                if(this.editTimer){
                    clearTimeout(this.editTimer);
                }
                editButtons.style("display", function(d, i){
                    if(i==ri){
                        return "inline";
                    }
                    return "none";
                });
            })
            .on("mouseout", function(d, ri){
                if(!d.clicked) {
                    d3.select(this).style("border-style", "none")
                        .style("margin-top", "0px")
                        .style("margin-left", -(numCols * cellWidth / 2) + "px");
                }

                // Hide edit button
                let self = this;
                this.editTimer = setTimeout(function(){
                    console.log("delayed leave")
                    editButtons.style("display", function(d, i){
                        if(i==ri) return "none";
                        return this.style.display;
                    });
                    delete self.editTimer;
                }, 1500);
            })
            .on("click", function(d){
                // Reset existing
                fingerprints.forEach(function(fp){
                    if(fp.clicked) delete fp.clicked;
                });
                rows.each(function(){
                    d3.select(this).style("border-style", "none")
                        .style("margin-top", "0px")
                        .style("margin-left", -(numCols * cellWidth / 2) + "px");
                });

                d.clicked = true;
                d3.select(this).style("border-style", "solid")
                    .style("margin-top", "-" + activeRowBorderWidth + "px")
                    .style("margin-left", -(activeRowBorderWidth + numCols * cellWidth / 2) + "px");
            });

        // Place cells
        rows.each(function(rd, ri){
            // For each row generate numCols data entries and set their content based on the fingerpring
            const rowData = new Array(numCols)
                .fill({})
                .map(function(v,i) {
                    if (rd.fingerprint.indexOf(i) >= 0) {
                        return {included: true, symbol: "+", colIdx: i, rowIdx: ri, rowData: rd, colHeader: colHeaders[i]};
                    } else {
                        return {included: false, symbol: "-", colIdx: i, rowData: rd, rowIdx: ri, colHeader: colHeaders[i]};
                    }
                });

            // Add cell divs to the row
            d3.select(this).selectAll(".cp-cell")
                .data(rowData).enter()
                .append("div")
                .classed("cp-cell", true)
                .classed("cp-cell-active", function(d){ return d.included; })
                .classed("cp-cell-inactive", function(d){ return !d.included; })
                .style("position", "absolute")
                .style("width", cellWidth+"px")
                .style("height", cellWidth+"px")
                .style("line-height", cellWidth+"px")
                .style("top", "0px")
                .style("left", function(d, i){ return (cellWidth * i) + "px"; })
                .style("text-align", "center")
                .style("vertical-align", "middle")
                .text(function(d){ return d.symbol; })
                .style("cursor", "pointer")
                .on("click", function(d){
                    fireClickListeners(d);

                    const included = rowData.filter(d => d.included).map(d => d.colIdx);
                    const excluded = rowData.filter(d => !d.included).map(d => d.colIdx);
                    flareplot.framesIntersectSubtract(included, excluded);
                })
        });


        // --------------------- Three state edit layer ----------------------
        const editSvg =
            "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NzYgNTEyIj4KCTxwYXRoIHN0eWxlPSJm" +
            "aWxsOiNjMGNhZDEiIGQ9Ik00MDIuMyAzNDQuOWwzMi0zMmM1LTUgMTMuNy0xLjUgMTMuNyA1LjdWNDY0YzAgMjYuNS0yMS41IDQ4LTQ4" +
            "IDQ4SDQ4Yy0yNi41IDAtNDgtMjEuNS00OC00OFYxMTJjMC0yNi41IDIxLjUtNDggNDgtNDhoMjczLjVjNy4xIDAgMTAuNyA4LjYgNS43" +
            "IDEzLjdsLTMyIDMyYy0xLjUgMS41LTMuNSAyLjMtNS43IDIuM0g0OHYzNTJoMzUyVjM1MC41YzAtMi4xLjgtNC4xIDIuMy01LjZ6bTE1" +
            "Ni42LTIwMS44TDI5Ni4zIDQwNS43bC05MC40IDEwYy0yNi4yIDIuOS00OC41LTE5LjItNDUuNi00NS42bDEwLTkwLjRMNDMyLjkgMTcu" +
            "MWMyMi45LTIyLjkgNTkuOS0yMi45IDgyLjcgMGw0My4yIDQzLjJjMjIuOSAyMi45IDIyLjkgNjAgLjEgODIuOHpNNDYwLjEgMTc0TDQw" +
            "MiAxMTUuOSAyMTYuMiAzMDEuOGwtNy4zIDY1LjMgNjUuMy03LjNMNDYwLjEgMTc0em02NC44LTc5LjdsLTQzLjItNDMuMmMtNC4xLTQu" +
            "MS0xMC44LTQuMS0xNC44IDBMNDM2IDgybDU4LjEgNTguMSAzMC45LTMwLjljNC00LjIgNC0xMC44LS4xLTE0Ljl6Ii8+PC9zdmc+";

        // Place edit buttons
        const editButtons = bodyDiv.selectAll(".cp-edit")
            .data(d3.merge(rows)).enter()
            .append("div")
            .attr("class", "cp-edit")
            .style("position", "absolute")
            .style("display", "none")
            .style("width", cellWidth + "px")
            .style("line-height", cellWidth + "px")
            .style("top", function(d,i){ return (activeRowBorderWidth + i * cellWidth) + "px"; })
            .style("left", "50%")
            .style("margin-left", ((numCols + 1.5) * cellWidth / 2) + "px")
            .on("click", function(d){
                console.log(d);
                d3.select(d)
                    .style("display", "none")
            });
        editButtons
            .append("img")
            .attr("src", "data:image/svg+xml;base64,"+editSvg)
            .attr("height", (cellWidth*0.4)+"px")
            .style("cursor", "pointer");


    }

    function displayEditButton(rowIdx){


    }

    /**
     * Computes fingerprints and sorts them by their frequency.
     * A fingerprint is an ordered list of distinct integers (corresponding to the frames section of an edge). This
     * function determines how many unique such lists there are and for each distinct list indicates how many times
     * it occurs. For example:
     *     computeFingerprints( {
     *       edges: [
     *         {frames: [0,1,3]},
     *         {frames: [1,2]},
     *         {frames: [0,1,3]}
     *       ])
     *       // Returns [ {count: 2, fingerprint: [0,1,3]}, {count: 1, fingerprint: [1,2]} ]
     */
    function computeFingerprints(flareGraph){
        console.log("computeFingerprints")

        // For simplicity, convert fingerprints to comma-separated string and use a dict to look up duplicates
        const retDict = {};

        // Go through edges and add to retDict
        flareGraph["edges"].forEach(function(edge){
            const fpString = edge["frames"]+""
            if(fpString in retDict){
                retDict[fpString].count += 1;
            }else{
                retDict[fpString] = {count: 1, fingerprint: edge["frames"].slice()};
            }
        });

        // Remove the keys from retDict
        const ret = [];
        for(let fpString in retDict){
            ret.push(retDict[fpString]);
        }

        // Sort by count
        ret.sort(function(a,b){ return b.count - a.count; });

        return ret;
    }

    function addClickListener(cl){
        // Check if cl is a function
        if(cl && {}.toString.call(cl) === '[object Function]'){
            clickListeners.push(cl);
        }
    }

    function fireClickListeners(data){
        clickListeners.forEach(function(cl){
            cl(data);
        });
    }



    initialize();

    return {
        addClickListener: addClickListener
    };
}
