# Time-flare highpass example

One way of comparing two or more time-evolving networks is to compare only the most frequently occurring interactions. The `timeflare_highpass.py` script takes a time-flare representing for example a simulation and returns a single-frame flare where only interactions that occur with a certain frequency are retained. When multiple highpass single-frame flares have been generated they can then be combined using the `flares_to_multiflare.py`.

To perform a comparison between the first and second half of the 5xnd trajectory, make sure the [`MDContactNetwork`](https://github.com/akma327/MDContactNetworks) dependency is satisfied, edit the paths in `generate_flare.sh` and run the script:
```bash
bash generate_flare.sh
```
This generates the multi-flare `5xnd_compareHalves.json` which can be uploaded to [the flareplot page](https://gpcrviz.github.io/flareplot/?p=create) to illustrate differences and similarities between the first half and the second half of the simulation. 

It is straightforward to modify this script to compare entire simulations of the same molecule. 
