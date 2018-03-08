

function createComparePanel(flareplot, cellWidth, containerSelector){
    const container = d3.select(containerSelector);

    const colHeaders = [];
    for(f in flareplot.graph.frameDict){
        colHeaders[f] = flareplot.graph.frameDict[f];
    }
    const numCols = colHeaders.length;

    const div = container.append("div")
        .style("border", "1px dashed gray");

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
        .style("line-height", cellWidth+"px")
        .style("position", "absolute")
        .style("bottom", "0px")
        .style("white-space", "nowrap")
        .style("overflow", "visible")
        .style("vertical-align", "middle")
        .style("transform", "rotate("+headerAngle+"deg)")
        .style("left", "50%")
        .style("margin-left", function(d,i){ return ((i - numCols / 2) * cellWidth) + "px"; })
        .text(function(d){ return d; });

    // Cell width hasn't been set yet, so will represent the width of the text. Compute the max width
    const maxHeaderCellWidth = d3.max(d3.merge(headerCells), function(c){ return c.clientWidth; });
    headerCells.style("width", cellWidth+"px");

    // Use the max text width and header rotation angle to compute and set the real height of the header
    const headerHeight = Math.sin(Math.abs(headerAngle) * Math.PI / 180) * maxHeaderCellWidth;
    headerDiv.style("height", headerHeight + "px");

    const bodyDiv = div.append("div")
        .classed("cp-body", true)
        .

    function updateLayout(){
        // // Compute container width
        // const containerStyle = window.getComputedStyle(container.node());
        // const containerPadding = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
        // const containerWidth = parseFloat(container.node().clientWidth) - containerPadding;
    }

    updateLayout();

    return {

    };
}
