# Generating input to flareplot

The input format to flareplots is a JSON file with the format described in the sections below. We also provide a set of premade scripts that generate such input-files from protein structures or simulations which can then be visualized on [the flareplot homepage](https://gpcrviz.github.io/flareplot/?p=create):

[`contacts_to_flare.py`](https://raw.githubusercontent.com/GPCRviz/flareplot/master/input/contacts_to_flare.py) - Takes a protein contact-file from by [MDContactNetwork](https://github.com/Eigenstate/vmd-python) and generates a flareplot input-file (JSON). Assuming you have [vmd-python](https://github.com/Eigenstate/vmd-python) installed and [MDContactNetwork](https://github.com/Eigenstate/vmd-python) in your `PATH`, the following commands will generate a flareplot JSON with side-chain hydrogen bonds from a trajectory:
```bash
cd examples/timeflare
dynamic_contacts.py --topology 5xnd_topology.pdb --trajectory 5xnd_trajectory.dcd --all-interactions --output 5xnd_all-contacts.tsv
contacts_to_flare.py --input 5xnd_all-contacts.tsv --itype hbss --output 5xnd_hbss.json
```
The resulting `5xnd_hbss.json` can then be uploaded and visualized [here](https://gpcrviz.github.io/flareplot/?p=create).


[`flares_to_multiflare.py`](https://raw.githubusercontent.com/GPCRviz/flareplot/master/input/contacts_to_flare.py) - Takes multiple flare JSONs (with matching labels) and generates a single "multi-flare" that is useful for showing differences and similarities between contact networks. The following commands generates flareplot input for three DHFR crystal structures and groups them together in a multiflare:
```bash
cd examples/multiflare/

# Generate contact networks
static_contacts.py --topology 4KJJ.pdb --all-interactions --output 4KJJ_all-contacts.tsv
static_contacts.py --topology 4KJK.pdb --all-interactions --output 4KJK_all-contacts.tsv
static_contacts.py --topology 4KJL.pdb --all-interactions --output 4KJL_all-contacts.tsv

# Generate single-frame flare JSONS
contacts_to_flare.py --input 4KJJ_all-contacts.tsv --itype hbss --output 4KJJ_hbss.json
contacts_to_flare.py --input 4KJK_all-contacts.tsv --itype hbss --output 4KJK_hbss.json
contacts_to_flare.py --input 4KJL_all-contacts.tsv --itype hbss --output 4KJL_hbss.json

# Combine them into a multi-flare
flares_to_multiflare.py --single-flares 4KJ?_hbss.json --output DHFR_compare_hbss.json
```
The resulting `5xnd_hbss.json` can then be uploaded and visualized [here](https://gpcrviz.github.io/flareplot/?p=create).

For more examples see the [`example`](https://github.com/GPCRviz/flareplot/tree/master/input/examples) folder.


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
    { "treeLabel":<string>, 
      "treeProperties": [
        {"path": <string>, "key": <string>},
        ...
      ]
    },
     ...
  ]
```
Each tree has a name and a set of paths. Each "path" is a dot-separated list of branches in the path from the node to the root in a tree and is used to group nodes. The optional "key" string wont be visible in the flareplot, but will be used to sort leaf nodes. In the following example, `Asn1` and `Pro2` will be placed in the same group because theyre both children of `helix1` while `His3` will be placed in a separate group. 
```json
  "trees":[
    { "treeLabel":"Group-order",
      "treeProperties": [
        {"path": "Root.helix1.Asn1", "key": "1"},
        {"path": "Root.helix1.Pro2", "key": "2"},
        {"path": "Root.helix2.His3", "key": "3"}
      ]
    }
  ]
```

### Tracks
This section has the format
```json
  "tracks":[
    { "trackLabel":<string>, 
      "trackProperties": [
        {"nodeName":<string>, "color":<string>, "size":<float>},
        ...
      ]
    }
    ...
  ]
```

Each track specifies visual cues for each of the nodes. If `color` is specified and `size` is non-zero a box will appear next to the node-label with the indicated color. The width of the box depends on the number of nodes around the flare-plot and the height of the box by the `size` parameter which should be a number between 0 and 1. 
```json
  "tracks":[
    { "trackLabel":"Boxes",
      "trackProperties":[
        {"nodeName":"Asn1", "color":"blue", "size":1.0},
        {"nodeName":"Pro2", "color":"blue", "size":1.0},
        {"nodeName":"His3", "color":"red",  "size":1.0}
      ]
    }
  ]
```


### Defaults
This section has the format
```json
  "defaults":{"color":<string>, "width":<int>}
```
where none of the fields are mandatory, but if specified they set edge-defaults. When a node is selected, the adjacent interactions are highlighted by removing the transparency. The default color should therefore ideally have a bit of transparency, which can be specified using e.g. `rgba(255,0,0,100)`. 

