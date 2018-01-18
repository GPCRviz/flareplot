#!/bin/bash

# Redefine these
FLAREPLOTS_DIR="../../"
MDCONTACTS_DIR="../../../../MDContactNetworks/"  

$MDCONTACTS_DIR/static_contacts.py --topology 4KJJ.pdb --all-interactions --output 4KJJ_all-contacts.tsv
$MDCONTACTS_DIR/static_contacts.py --topology 4KJK.pdb --all-interactions --output 4KJK_all-contacts.tsv
$MDCONTACTS_DIR/static_contacts.py --topology 4KJL.pdb --all-interactions --output 4KJL_all-contacts.tsv

$FLAREPLOTS_DIR/contacts_to_flare.py --input 4KJJ_all-contacts.tsv --itype hbss --output 4KJJ_hbss.json
$FLAREPLOTS_DIR/contacts_to_flare.py --input 4KJK_all-contacts.tsv --itype hbss --output 4KJK_hbss.json
$FLAREPLOTS_DIR/contacts_to_flare.py --input 4KJL_all-contacts.tsv --itype hbss --output 4KJL_hbss.json

$FLAREPLOTS_DIR/flares_to_multiflare.py --single-flares 4KJ?_hbss.json --output DHFR_compare_hbss.json

echo "Done. Now upload DHFR_compare_hbss.json to https://gpcrviz.github.io/flareplot/?p=create"
