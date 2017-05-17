/**
 * Created by rfonseca on 5/16/17.
 */

var flareplot;

function fileRead(contents){
    "use strict";

    document.getElementById("maincontent").innerHTML = "";
    flareplot = createFlareplot(600, contents, "#maincontent");

    d3.select("#maincontent div")
        .style("position", "relative")
        .style("left", "50%")
        .style("margin-left", "-300px");


    var selectorContainer = d3.select("#maincontent").append("div");
    var selectorAdded = createSelectors(flareplot, selectorContainer.node());
    if( !selectorAdded ){
        selectorContainer.remove();
    }

    // Create fingerprint panel if frameDict is included in contents
    frameDict = getFrameDict(contents)
    if(frameDict){
        flareplot.framesIntersect([]) //show all interactions to begin with
        // Interactive Mode
        var columnNames = getFingerprintColumns(contents);
        var panel = initFingerprintPanel("#maincontent", columnNames, threeStateSelection, true, '115px');

        // Precomputed Fingerprints
        // var fingerprint_list = calcFingerprints(contents);
        // var panel = initrollableFingerprintPanel("#maincontent", columnNames, fingerprint_list, threeStateRowSelection, true, '110px');

        panel.on("click", updateIntersectFrames)
    } else {
        d3.select("#maincontent")
            .append("div")
            .attr("id", "slider-container")
            .style("width","600px")
            .style("height","30px")
            .style("position","relative")
            .style("left","50%")
            .style("margin-left","-300px");

        var slider = createD3RangeSlider(0,flareplot.getNumFrames(), "#slider-container", true);
        slider.onChange(function(newRange){
            flareplot.framesSum(newRange.begin, newRange.end+1);
        });
    }


    //document.getElementById("maincontent").children[0].style.width="100%";
    //document.getElementById("rangeSlider").style.width="500px";
}

var reader = new FileReader();
reader.onload = function(e) {
    var contents = e.target.result;
    fileRead(contents);
};

function handleFile() {
    document.getElementById("maintext").innerHTML = "<p>Loading ...</p>";
    var file = this.files[0];
    reader.readAsText(file);
}

var uploader = document.getElementById("uploader");
uploader.addEventListener("change", handleFile, false);

function loadExample(fileName){
    d3.text(fileName, function(json_text){
        fileRead(json_text);
    });
}


loadExample("resources/gpcr_brain_demo.json");
