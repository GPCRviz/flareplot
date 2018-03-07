

function createComparePanel(flareplot, cellWidth, containerSelector){
    const container = d3.select(containerSelector);

    const colHeaders = [];
    for(f in flareplot.graph.frameDict){
        colHeaders[f] = flareplot.graph.frameDict[f];
    }
    const numCols = colHeaders.length;

    const div = container.append("div")
        .style("border", "1px dashed gray");

    const headers = div.append("div")
        .selectAll(".header")
        .data(colHeaders)
        .enter()
        .append("div")
        .classed("header", true)
        .style("width", cellWidth)
        .style("height", cellWidth)
        .style("position", "absolute")
        .style("border", "1px dashed red")
        .style("overflow", "visible")
        .text(function(d){ return d; });

    function updateLayout(){
        // Compute container width
        const containerStyle = window.getComputedStyle(container.node());
        const containerPadding = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
        const containerWidth = parseFloat(container.node().clientWidth) - containerPadding;

        console.log(headers);
        headers
            .style("left", function(d,i){
                console.log(d);
                console.log((containerWidth - numCols * cellWidth) / 2 + i * cellWidth);
                return (containerWidth - numCols * cellWidth) / 2 + i * cellWidth;
            })
    }

    updateLayout();

    return {

    };
}
