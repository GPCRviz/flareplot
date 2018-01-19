# Time-flare example

A time-flare represents a temporal network (nodes are static, edges change) that can be visualized on [the flareplot page](https://gpcrviz.github.io/flareplot/?p=create). This example shows how to create a time-flare based on the contacts in a molecular simulation. 

Configure the [`MDContactNetwork`](https://github.com/akma327/MDContactNetworks) dependency, edit the paths in `generate_flare.sh` and run the script:
```bash
bash generate_flare.sh
```
This generates the time-flare `5xnd_hbss.json` containing all side-chain-side-chain hydrogen bonds in the 5XND trajectory.
