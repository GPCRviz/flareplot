#!/usr/bin/env python
"""
Takes an MD-trajectory, a topology file, and a uniprot-ID of a GPCR and generates 
in input-JSON file for use in FlarePlot (http://GPCRviz.github.io/FlarePlot). Each 
vertex will be a residue in the structure named using the GPCRdb naming convention
and each edge  will represent a hydrogen bond between any pair of atoms in the 
residues detected using the Wernet-Nilsson algorithm [cite].

The trajectory and topology files can be any format readable by the mdtraj library,
which is also the only dependency (see http://mdtraj.org/latest/installation.html 
for installation instructions).


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

if len(sys.argv)!=4:
  print("Usage:", sys.argv[0], "<trajectory file> <topology file> <uniprot id>")
  sys.exit(-1)


trj_file   = sys.argv[1]
top_file   = sys.argv[2]
uniprot_id = sys.argv[3]
out_file   = os.path.basename(trj_file)+".json"

print("Reading GPCRdb naming database ..")
import gpcrdb_naming
resi_to_group = {}
resi_to_name = {}
found_uniprot_id = False
for res in gpcrdb_naming.residue_labels:
  if res[0]==uniprot_id:
    found_uniprot_id = True
    cname = res[4]
    resi_to_group[res[1]] = res[3] # cname[:cname.find(".")]
    resi_to_name[res[1]] = cname[:cname.find(".")]+cname[cname.find("x"):]

if not found_uniprot_id:
  print("ERROR: uniprot id '%s' wasn't found in GPCRdb naming database"%uniprot_id)
  sys.exit(-1)


print("Reading md-trajectory ..")
t = md.load(trj_file, top=top_file)
frame_count = len(t)


print("Analyzing hbond network in %d frames .."%frame_count)

hbonds_allframes = md.wernet_nilsson(t)
hbond_frames = defaultdict(set)

for f,frame in enumerate(t[:100]):
  #hbonds = md.baker_hubbard(frame, periodic=True)
  hbonds = hbonds_allframes[f]
  print("Frame %d .. %d hbonds"%(f,hbonds.shape[0]))
  for hbond in hbonds:
    resi_1 = t.topology.atom(hbond[0]).residue.index
    resi_2 = t.topology.atom(hbond[2]).residue.index
    if resi_1 != resi_2:
      key = (min(resi_1,resi_2), max(resi_1,resi_2))
      hbond_frames[key].add(f)


print("Analyzing network centrality ..")

#Build networkx graph
centrality = defaultdict(int)
for resi1,resi2 in hbond_frames:
  if not resi1 in resi_to_name: continue
  if not resi2 in resi_to_name: continue
  resn1 = resi_to_name[resi1] if resi1 in resi_to_name else t.topology.residue(resi1).name 
  resn2 = resi_to_name[resi2] if resi2 in resi_to_name else t.topology.residue(resi2).name 
  if resn1=="None" or resn2=="None": continue

  interaction_count = len(hbond_frames[(resi1,resi2)])
  weight = interaction_count/frame_count
  centrality[resn1] += weight
  centrality[resn2] += weight

#Normalize centrality to the range [0:1]
min_centrality = min([centrality[v] for v in centrality]) 
max_centrality = max([centrality[v] for v in centrality]) 
for v in centrality:
  centrality[v] = (centrality[v]-min_centrality)/(max_centrality-min_centrality)


print("Writing edges to %s .."%out_file)

#Collect entries for edges and trees (grouping of nodes)
edge_entries = []
tree_paths   = set()
for resi1,resi2 in hbond_frames:
  if not resi1 in resi_to_name: continue
  if not resi2 in resi_to_name: continue
  resn1 = resi_to_name[resi1] if resi1 in resi_to_name else t.topology.residue(resi1).name 
  resn2 = resi_to_name[resi2] if resi2 in resi_to_name else t.topology.residue(resi2).name 
  if resn1=="None" or resn2=="None": continue

  framelist = sorted(list(hbond_frames[(resi1,resi2)]))
  edge_entries.append("    {\"name1\":\"%s\", \"name2\":\"%s\", \"frames\":%s}"%(resn1,resn2,str(framelist)))

  tree_paths.add(resi_to_group[resi1]+"."+resn1)
  tree_paths.add(resi_to_group[resi2]+"."+resn2)


#Collect entries for the helix track (coloring of nodes)
helix_track_entries = []
helix_colors = ["#78C5D5","#459BA8","#79C268","#C5D747","#F5D63D","#F18C32","#E868A1","#BF63A6"]
for tp in tree_paths:
  try:
    #res_name = tp[tp.rfind("x")+1:]
    res_name = tp[tp.rfind(".")+1:]
    res_helix = int(tp[tp.rfind(".")+1:tp.find("x")])
    helix_track_entries.append("      { \"nodeName\": \"%s\", \"color\": \"%s\", \"size\":\"1.0\" }"%(res_name,helix_colors[res_helix]))
  except ValueError: pass
  except IndexError: pass


#Collect entries for the centrality track
centrality_track_entries = []
def ccol(val):
  col1 = (255,127,80)
  col2 = (255,255,255)
  rgb = tuple([int(c1*val+c2*(1-val)) for c1,c2 in zip(col1,col2)])
  return '#%02x%02x%02x' % rgb

for tp in tree_paths:
  try:
    res_name = tp[tp.rfind(".")+1:]
    res_helix = int(tp[tp.rfind(".")+1:tp.find("x")])
    cent_val = centrality[res_name]
    centrality_track_entries.append("      { \"nodeName\": \"%s\", \"color\": \"%s\", \"size\":\"%s\" }"%(res_name,ccol(cent_val), cent_val))
  except ValueError: pass
  except IndexError: pass


#Write everything
with open(out_file,"w") as of:
  of.write("{\n")
  of.write("  \"edges\": [\n")
  of.write(",\n".join(edge_entries))
  of.write("\n")
  of.write("  ],\n")
  of.write("  \"trees\": [\n")
  of.write("    {\n")
  of.write("      \"treeLabel\":\"Helices\",\n")
  of.write("      \"treePaths\": [\n")
  of.write(",\n".join(["        \""+tp+"\"" for tp in tree_paths]))
  of.write("\n")
  of.write("      ]\n")
  of.write("    }\n")
  of.write("  ],\n")
  of.write("  \"tracks\": [\n")
  of.write("    {\n")
  of.write("    \"trackLabel\": \"Helices\",\n")
  of.write("    \"trackProperties\": [\n")
  of.write(",\n".join(helix_track_entries))
  of.write("\n")
  of.write("    ]},\n")
  of.write("    {\n")
  of.write("    \"trackLabel\": \"Degree centrality\",\n")
  of.write("    \"trackProperties\": [\n")
  of.write(",\n".join(centrality_track_entries))
  of.write("\n")
  of.write("    ]}\n")
  of.write("  ],\n")
  of.write("  \"defaults\":{\"edgeColor\":\"rgba(50,50,50,100)\", \"edgeWidth\":2 }\n")
  of.write("}\n")

