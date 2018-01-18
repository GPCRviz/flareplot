#!/usr/bin/env python
"""
Takes an MD-trajectory and a topology file of a molecule, analyzes the hydrogen 
bond network and generates in input-JSON file for use in FlarePlot 
(http://GPCRviz.github.io/FlarePlot). Each vertex will be a residue-number from 
the structure and each edge  will represent a hydrogen bond between any pair of
atoms in the residues detected using the Wernet-Nilsson algorithm [cite].

The trajectory and topology files can be any format readable by the mdtraj library,
which is also the only dependency (see http://mdtraj.org/latest/installation.html 
for installation instructions).

TODO: Add support for secondary structure annotations as a track.

Copyright 2017 AJ Venkatakrishnan, Rasmus Fonseca, Stanford University

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
"""

import sys
import os.path
import mdtraj as md
from collections import defaultdict

def printUsage():
  print("Usage:", sys.argv[0], "<trajectory file> <topology file> [<interaction type>]")
  print("Where <interaction type> can be")
  print("  ALL   - default")
  print("  BB-BB - Backbone-backbone interaction")
  print("  BB-SC - Backbone-side chain interaction")
  print("  SC-SC - Side chain-side chain interaction")
  sys.exit(-1)

if len(sys.argv)<3: printUsage()

trj_file   = sys.argv[1]
top_file   = sys.argv[2]
int_type   = "ALL" if len(sys.argv)<4 else sys.argv[3].upper()
out_file   = os.path.basename(trj_file)+".json"

if not int_type in ["ALL","BB-BB","BB-SC","SC-SC"] : printUsage()
BB_names = ["CA","C","N","O","H","OP1", "OP2", "O5'","O2'","HO2'","O3'"]
def checkType(n1, n2):
  if int_type=="ALL": return True
  if int_type=="BB-BB": return n1 in BB_names and n2 in BB_names
  if int_type=="BB-SC": return n1 in BB_names != n2 in BB_names
  if int_type=="SC-SC": return not n1 in BB_names and not n2 in BB_names
  return True


print("Reading md-trajectory ..")
t = md.load(trj_file, top=top_file)
frame_count = len(t)


print("Analyzing hbond network in %d frames .."%frame_count)

hbonds_allframes = md.wernet_nilsson(t)
hbond_frames = defaultdict(set)

for f,frame in enumerate(t[:]):
  #hbonds = md.baker_hubbard(frame, periodic=True)
  hbonds = hbonds_allframes[f]
  print("Frame %d .. %d hbonds"%(f,hbonds.shape[0]))
  for hbond in hbonds:
    a1 = t.topology.atom(hbond[0])
    a2 = t.topology.atom(hbond[2])
    if not checkType(a1.name, a2.name): continue
    resi1 = a1.residue.index
    resi2 = a2.residue.index
    if resi1 != resi2:
      key = (min(resi1,resi2), max(resi1,resi2))
      hbond_frames[key].add(f)



print("Writing edges to %s .."%out_file)

#Collect entries for edges and trees (grouping of nodes)
edge_entries = []
tree_paths   = set()
for resi1,resi2 in hbond_frames:
  framelist = sorted(list(hbond_frames[(resi1,resi2)]))
  edge_entries.append("    {\"name1\":\"%d\", \"name2\":\"%d\", \"frames\":%s}"%(resi1,resi2,str(framelist)))

  tree_paths.add(resi1)
  tree_paths.add(resi2)




#Write everything
with open(out_file,"w") as of:
  of.write("{\n")
  of.write("  \"edges\": [\n")
  of.write(",\n".join(edge_entries))
  of.write("\n")
  of.write("  ],\n")
  of.write("  \"defaults\":{\"edgeColor\":\"rgba(50,50,50,100)\", \"edgeWidth\":2 }\n")
  of.write("}\n")

