# Embedding FlarePlots

To embed a FlarePlot on a homepage you'll need to:

 * Include js and css dependencies in the header
 * Place a container div
 * Construct a json that satisfies the [FlarePlot input format](https://github.com/GPCRviz/FlarePlot/tree/master/input)
 * Call `createFlareplot` with the width of your plot, a container selector, and the json object

A minimal working template looks as follow

```html
<html>
<head>
    <!-- FlarePlot dependencies -->
    <script src="https://d3js.org/d3.v3.min.js"></script>

    <!-- FlarePlot javascript files -->
    <script src="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-main.js"></script>
</head>
<body>
    <div id="flare-container"></div>
    <script>
        var jsonData = {
            edges: [
                { name1: "A", name2: "B", frames: [0,1,2] },
                { name1: "A", name2: "C", frames: [1] },
                { name1: "B", name2: "C", frames: [0,2] }
            ]
        };
        var plot = createFlareplot(500, jsonData, "#flare-container");
    </script>
</body>
</html>
```
This will create a 500-by-500 pixel circular plot with three nodes (A, B, and C) of which only A-B and B-C are
connected (corresponding to frame 0). The FlarePlot library is written so it can easily be restyled or connected to
other dynamic elements on the page. The
following sections outline how to add different controls and the [Developer API](#Developer-API) shows all available
functions.

## Reading json from a local file

The d3-library has a convenient mechanism for reading json files:
```html
<html>
<head>
    <!-- FlarePlot dependencies -->
    <script src="https://d3js.org/d3.v3.min.js"></script>

    <!-- FlarePlot javascript files -->
    <script src="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-main.js"></script>
</head>
<body>
    <div id="flare-container"></div>
    <script>
        d3.json("abc.json", function(jsonData){
            var plot = createFlareplot(500, jsonData, "#flare-container");
        });
    </script>
</body>
</html>
```

## Styling the plot

The style of the plot can be modified through css. Most importantly, the edges and nodes will be decorated with `
.link` and `.node` classes. A template css files that looks sensible when the number of nodes is high can be included
```html
<html>
<head>
    <!-- FlarePlot dependencies -->
    <script src="https://d3js.org/d3.v3.min.js"></script>

    <!-- FlarePlot javascript files -->
    <script src="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-main.js"></script>
    <script src="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-rangeslider.js"></script>

    <!-- FlarePlot styling -->
    <link href="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-main.css" rel="stylesheet"></link>
</head>
<body>
    <div id="flare-container"></div>
    <script>
        d3.json("abc.json", function(jsonData){
            var plot = createFlareplot(500, jsonData, "#flare-container");
        });
    </script>
</body>
</html>
```
This will make edges transparent and node fonts much smaller and responsive to mouse hovering.


## Navigating time-varying data

FlarePlot includes a range-slider extension that allows to change the currently selected time-point and inspect
averages over intervals of frames. To use it
 * Include the required js and css file
 * Place a container div
 * Call `createRangeSlider` with the container selector, and the `plot` object

```html
<html>
<head>
    <!-- FlarePlot dependencies -->
    <script src="https://d3js.org/d3.v3.min.js"></script>

    <!-- FlarePlot javascript files -->
    <script src="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-main.js"></script>
    <script src="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-rangeslider.js"></script>

    <!-- FlarePlot styling -->
    <link href="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-main.css" rel="stylesheet"></link>
    <link href="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-rangeslider.css" rel="stylesheet"></link>
</head>
<body>
    <div id="flare-container"></div>
    <div id="slider-container" style="width:500px"></div>
    <script>
        d3.json("abc.json", function(jsonData){
            var plot = createFlareplot(500, jsonData, "#flare-container");
            createRangeSlider("#slider-container", plot);
        });
    </script>
</body>
</html>
```
This will place a range-slider below the plot. The appearance can be changed by modifying the corresponding css.

## Switching between trees and tracks

TODO

## Navigating comparative data

FlarePlot includes a fingerprint panel that allows the user to select for edges between nodes that are included or excluded from a particular column of the data frame. To use it
  * Format json input to have a frameDict mapping indices to column names
  * Include the required js and css file
  * Place a container div
  * Call 'initFingerprintPanel' or 'initScrollableFingerprintPanel' with the container selector, and the 'plot' object

```html
<html>
<head>
    <!-- FlarePlot dependencies -->
    <script src="https://d3js.org/d3.v3.min.js"></script>

    <!-- FlarePlot javascript files -->
    <script src="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-main.js"></script>
    <script src="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-fingerprintpanel.js"></script>

    <!-- FlarePlot styling -->
    <link href="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-main.css" rel="stylesheet"></link>
    <link href="http://cdn.rawgit.com/GPCRviz/FlarePlot/master/flareplot-fingerprintpanel.css" rel="stylesheet"></link>
</head>
<body>
    <div id="flare-container"></div>
    <div id="slider-container" style="width:500px"></div>
    <script>
        var jsonData = {
          "edges": [
            {"name1":"A", "name2":"B", "frames":[2,3]},
            {"name1":"A", "name2":"C", "frames":[0,1]},
            {"name1":"A", "name2":"D", "frames":[0,1,2,3]},
            {"name1":"B", "name2":"D", "frames":[2]}
          ],
          "frameDict": {
            "0":"B2AR",
            "1":"mOR",
            "2":"dOR",
            "3":"A2A"
          }
        }

        var plot = createFlareplot(500, jsonData, "#flare-container");
        frameDict = getFrameDict(jsonData)
        if(frameDict){
          flareplot.framesIntersect([]) //show all interactions to begin with

          var columnNames = getFingerprintColumns(contents);
          panel = initFingerprintPanel("#maincontent", columnNames, threeStateSelection, true, '75px');
          panel.on("click", updateIntersectFrames)
        }
    </script>
</body>
</html>
```
This will place a fingerprint panel below the plot. The appearance can be changed by modifying the corresponding css. 

# Developer API

The following functions are available after a `plot` object has been created:
  * `plot.getNumFrames()` - Returns the number of frames
  * `plot.setFrame(frameNum)` - Updates the flareplot to reflect the indicated frame
  * `plot.framesIntersect(subset)` - Updates the flareplot to reflect the intersection of interactions over all frames in the `subset` array.
  * `plot.framesIntersect(start, end)` - Updates the flareplot to reflect the intersection of interactions over all frames between `start` (inclusive), and `end` (not inclusive).
  * `plot.framesSum(subset)` - Updates the flareplot to reflect the sum of interactions over all frames in the `subset` array.
  * `plot.framesSum(start, end)` - Updates the flareplot to reflect the sum of interactions over all frames between `start` (inclusive), and `end` (not inclusive).
  * `plot.getTrackNames()` - Return an array with names of all tracks in the json.
  * `plot.setTrack(trackNum)` - Updates the node colors/annotation to reflect the indicated track index.
  * `plot.getTreeNames()` - Return an array with names of all trees in the json.
  * `plot.setTree(treeNum)` - Updates the node order to reflect the indicated tree index.
  * `plot.addNodeToggleListener(l)` - Listen for node toggle events. `l` is assumed to be a callback function that takes a node as argument.
  * `plot.addNodeHoverListener(l)` - Listen for node toggle events. `l` is assumed to be a callback function that takes a node as argument.
  * `plot.addEdgeToggleListener(l)` - Listen for node toggle events. `l` is assumed to be a callback function that takes an edge as argument.
  * `plot.addEdgeHoverListener(l)` - Listen for node toggle events. `l` is assumed to be a callback function that takes an edge as argument.
