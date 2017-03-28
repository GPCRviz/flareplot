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
  * `plot.getTrees()` - Returns list of tree-names
  * `plot.setTree(t)` - Updates the ordering of nodes to reflect the tree with index `t`
  * `plot.getTracks()` - Returns list of track-names
  * `plot.setTrack(t)` - Updates the node colors/annotation to reflect the track with index `t`
  * `plot.addTickListener(l)` - Add a callback function, `l`, that gets invoked whenever the time-frame changes. This function must take 2 arguments. The first will be the current frame-number, and the second will be a list of tuples indicating 1) name of first and second node, 2) edge color, and 3) edge width.
  * `plot.addNodeToggleListener(l)` - *Not yet implemented*
  * `plot.addNodeHoverListener(l)` - *Not yet implemented*
  * `plot.addEdgeToggleListener(l)` - *Not yet implemented*
  * `plot.addEdgeHoverListener(l)` - *Not yet implemented*
