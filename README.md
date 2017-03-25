# Flareplots

Flareplots illustrate contacts between grouped nodes and are useful for exploring interaction graphs. They have a time-slider to illustrate the evolution of dynamically changing networks and circular layers of color-coded annotations.

## Input format
The input is a JSON-file that could look like the following:

```json
{
  "edges":[
    {"name1":"ARG135", "name2":"ASP134", "frames":[0,1,2,3,4,6,7,8,9]},
    {"name1":"ASP134", "name2":"TRP161", "frames":[4,5,6,7]},
    {"name1":"TYR223", "name2":"ARG135", "frames":[4,5,6,9]},
    {"name1":"TYR223", "name2":"TYR306", "frames":[0,1,2,5,6,7,8]},
    {"name1":"TYR306", "name2":"VAL54",  "frames":[1,4,5,6,7,8]}
  ]
}
```
      
Here ARG135 and ASP134 interacts at times 0 to 4 and 6 to 9. Names are ordered alphabetically unless it is suffixed by a number in which case the number determines the order. 

The input-json can contain three sections
 * edges - a list of edge-definitions and the time-points in which they exist
 * trees - a list of tree-definitions each indicating an ordering and grouping of the nodes
 * tracks - a list of node-properties each indicating node color, weight and possibly annotation. 
 * defaults - an object that specifies default properties of edges and nodes

### Edges
This section has the format
```json
  "edges":[
    {"name1":<string>, "name2":<string>, "frames":<int-list>, "color":<string>, "width":<int>},
    ...
  ]
```
The fields `name1`, `name2`, and `frames` are mandatory but the others are not. If no `trees` or `tracks` are specified, the names used in the `edges` section will be collected and used as node-definitions. The `color` field follows CSS standards, so can be either `red`, `#FF0000`, `rgb(255,0,0)`.

The edge-width is measured in pixels. 

### Trees
This section has the format
```json
  "trees":[
    { "treeName":<string>, "treePaths":<string-list> },
     ...
  ]
```
Each tree has a name and a set of paths. Each "path" is a dot-separated list of branches in the path from the node to the root in a tree. This tree is used to order and group nodes. In the following example, `Asn1` and `Pro2` will be placed in the same group because theyre both children of `helix1` while `His3` will be placed in a separate group. 
```json
  "trees":[
    { "treeName":"Group-order",
      "treePaths": [
        "Root.helix1.Asn1",
        "Root.helix1.Pro2",
        "Root.helix2.His3"
      ]
    }
  ]
```

### Tracks
This section has the format
```json
  "tracks":[
    { "trackName":<string>, 
      "nodeProperties": [
        {"nodeName":<string>, "color":<string>, "size":<float>, "label":<string>},
        ...
      ]
    }
    ...
  ]
```

Each track specifies visual cues for each of the nodes. If `color` is specified and `size` is non-zero a box will appear next to the node-label with the indicated color. The width of the box depends on the number of nodes around the flare-plot and the height of the box by the `size` parameter which should be a number between 0 and 1. 

If `color` is not specified but `label` is, the track will contain a text-label. The node-labels are considered a special track which by default is enabled and placed closest to the center. This default can be overwritten by adding a special track named "nodelabels". In the following example, same-sized boxes will appear as the inner track and node-labels appear as the outer track
```json
  "tracks":[
    { "trackName":"Boxes",
      "nodeProperties":[
        {"nodeName":"Asn1", "color":"blue", "size":1.0},
        {"nodeName":"Pro2", "color":"blue", "size":1.0},
        {"nodeName":"His3", "color":"red",  "size":1.0}
      ]
    },
    { "trackName":"nodelabels", 
      "nodeProperties":[
        {"nodeName":"Asn1", "label":"Asn1"},
        {"nodeName":"Pro2", "label":"Pro2"},
        {"nodeName":"His3", "label":"His3"},
      ]
    }
  ]
```
The `nodeProperties` entry is not required, so the above example could equivalently be written
```json
  "tracks":[
    { "trackName":"Boxes",
      "nodeProperties":[
        {"nodeName":"Asn1", "color":"blue", "size":1.0},
        {"nodeName":"Pro2", "color":"blue", "size":1.0},
        {"nodeName":"His3", "color":"red",  "size":1.0}
      ]
    },
    { "trackName":"nodelabels" }
  ]
```


### Defaults
This section has the format
```json
  "defaults":{"color":<string>, "width":<int>}
```
where none of the fields are mandatory, but if specified they set edge-defaults. When a node is selected, the adjacent interactions are highlighted by removing the transparency. The default color should therefore ideally have a bit of transparency, which can be specified using e.g. `rgba(255,0,0,100)`. 


# Developer API

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
Where `plotfile.json` contains a json file with the format specified above.

The following functions are available after a dataset has been loaded:
  * `plot.getTrees()` - Returns list of tree-names
  * `plot.setTree(t)` - Updates the ordering of nodes to reflect the tree with index `t`
  * `plot.getTracks()` - Returns list of track-names
  * `plot.setTrack(t)` - Updates the node colors/annotation to reflect the track with index `t`
  * `plot.addTickListener(l)` - Add a callback function, `l`, that gets invoked whenever the time-frame changes. This function must take 2 arguments. The first will be the current frame-number, and the second will be a list of tuples indicating 1) name of first and second node, 2) edge color, and 3) edge width.
  * `plot.addNodeToggleListener(l)` - 
  * `plot.addNodeHoverListener(l)` - 
  * `plot.addEdgeToggleListener(l)` - 
  * `plot.addEdgeHoverListener(l)` - 
