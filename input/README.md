#Generating input to FlarePlot

The input format to FlarePlots is a JSON file with the format described below. We also provide a set of premade scripts that generate such JSON files.


* [GPCRtraj2flare](https://raw.githubusercontent.com/GPCRviz/FlarePlot/master/scripts/GPCRtraj2flare.zip) - Takes a molecular dynamics trajectory, topology, and UNIPROT-id of a GPCR and generates a FlarePlot input-file (JSON). For example:
```bash
python3 GPCRtraj2flare.py mor_active_bu72.nc mor_active_bu72.psf OPRM_MOUSE
```

[hbonds2flare](https://raw.githubusercontent.com/GPCRviz/FlarePlot/master/scripts/hbonds2flare.py) - Takes a molecular dynamics trajectory and topology of any molecular chain and generates a FlarePlot input-fie<F12>le that shows hydrogen bond interactions. Can be used to filter by type of interactions: backbone-backbone, backbone-side chain, or side chain-side chain. For example:
```bash
python3 hbonds2flare.py mor_active_bu72.nc mor_active_bu72.psf SC-SC
```


## Input format
A generated JSON could look like the following:

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

