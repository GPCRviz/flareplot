#!/bin/bash

# Redefine these
FLAREPLOTS_DIR="../../flare-scripts"
MDCONTACTS_DIR="../../../../MDContactNetworks"  

$MDCONTACTS_DIR/dynamic_contacts.py --topology 5xnd_topology.pdb --trajectory 5xnd_trajectory.dcd --all-interactions --output 5xnd_all-contacts.tsv
$FLAREPLOTS_DIR/contacts_to_flare.py --input 5xnd_all-contacts.tsv --itype all --output 5xnd_all.json
$FLAREPLOTS_DIR/timeflare_highpass.py --input 5xnd_all.json --first_frame 1 --last_frame 10 --output 5xnd_highpass_firsthalf.json
$FLAREPLOTS_DIR/timeflare_highpass.py --input 5xnd_all.json --first_frame 11 --last_frame 20 --output 5xnd_highpass_secondhalf.json
$FLAREPLOTS_DIR/flares_to_multiflare.py --single-flares 5xnd_highpass_*half.json --output 5xnd_compareHalves.json

echo "Done. Now upload 5xnd_compareHalves.json to https://gpcrviz.github.io/flareplot/?p=create"
