# Multi-flare example

A multi-flare is used to compare multiple single-frame flares on [the flareplot page](https://gpcrviz.github.io/flareplot/?p=create). This example shows how to create a multi-flare based on the contacts in three structures of the DHFR molecule solved using room-temperature crystallography. 

Configure the [`MDContactNetwork`](https://github.com/akma327/MDContactNetworks) dependency, edit the paths in `generate_flare.sh`, and run the script:
```bash
bash generate_flare.sh
```
This generates the multi-flare `DHFR_compare_hbss.json` for comparing all side-chain-side-chain hydrogen bonds in the three structures.
