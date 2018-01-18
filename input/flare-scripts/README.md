# Scripts for generating and transforming flareplots

This folder contains a set of scripts for working with flareplots. The scripts for creating flareplots mainly work on molecular contact networks, but the general transformation scripts apply to any data represented as flare-files. 

## Time-flare script
[`contacts_to_flare.py`](https://raw.githubusercontent.com/GPCRviz/flareplot/master/input/flare-scripts/contacts_to_flare.py) - Takes a protein contact-file from by MDContactNetwork and generates a flareplot input-file (JSON). Assuming you have [vmd-python](https://github.com/Eigenstate/vmd-python) installed and [MDContactNetwork](https://github.com/akma327/MDContactNetworks) in your `PATH`, the following commands will generate a flareplot JSON with side-chain hydrogen bonds from a trajectory:
```bash
cd examples/timeflare
dynamic_contacts.py --topology 5xnd_topology.pdb --trajectory 5xnd_trajectory.dcd --all-interactions --output 5xnd_all-contacts.tsv
contacts_to_flare.py --input 5xnd_all-contacts.tsv --itype hbss --output 5xnd_hbss.json
```
The resulting `5xnd_hbss.json` can then be uploaded and visualized [here](https://gpcrviz.github.io/flareplot/?p=create).
![Time-flare flowchart](../imgs/Timeflare-input-flow.png)



## Multi-flare script
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
![Multi-flare flowchart](../imgs/Multiflare-input-flow.png)
