# Embedding FlarePlots

The FlarePlot library is written so it can easily be connected to other dynamic elements on the page. See for example the [GPCR demo](https://gpcrviz.github.io/FlarePlot/gpcr_demo.html). For a minimum working example of an embedded FlarePlot see the `minimum.html` file.

## Developer API

The following outlines an API for developers wishing to incorporate a flareplot on a homepage. The general template should be 
```html
<html>
<head>
<script src="d3.js" />
<script src="flareplot-main.js" />
<script src="flareplot-parser.js" />
</head>
<body>
    <div id="flare-container"></div>
    <script> 
      d3.text("plotfile.json", function(data) {
        var plot = createFlareplot("flare-container", data);
      });
    </script>
</body>
</html>
```
Where `plotfile.json` contains a JSON file with the [correct format](https://github.com/GPCRviz/FlarePlot/tree/master/input).

The following functions are available after a dataset has been loaded:
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
