#!/bin/bash

# Redefine these
FLAREPLOTS_DIR="../../"
MDCONTACTS_DIR="../../../../MDContactNetworks/"  

$MDCONTACTS_DIR/dynamic_contacts.py --topology 5xnd_topology.pdb --trajectory 5xnd_trajectory.dcd --all-interactions --output 5xnd_all-contacts.tsv
$FLAREPLOTS_DIR/contacts_to_flare.py --input 5xnd_all-contacts.tsv --itype hbss --output 5xnd_hbss.json

echo "Done. Now upload 5xnd_hbss.json to https://gpcrviz.github.io/flareplot/?p=create"
