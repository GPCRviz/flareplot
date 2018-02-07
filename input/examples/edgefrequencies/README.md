# Time-flare mean-slice example

A time-flare can be visualized by averaging interactions over a certain time-range. The `timeflare_edgefrequencies.py` script takes a time-flare representing for example a simulation and returns a single-frame flare with edge-weights corresponding to the frequency within a specified time-slice.

To visualize frequent contacts in the 5xnd bundle, make sure the [`MDContactNetwork`](https://github.com/akma327/MDContactNetworks) dependency is satisfied, edit the paths in `generate_flare.sh` and run the script:
```bash
bash generate_flare.sh
```
This generates the weighted single-flare `5xnd_hbss-frequencies.json` which can be uploaded to [the flareplot page](https://gpcrviz.github.io/flareplot/?p=create) to visualize the frequencies of side-chain side-chain hydrogen bonds. 
