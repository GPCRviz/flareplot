/**
 * Edited by akma327 on 5/31/17.
 */


function getResidueToAtomContacts(contents){
    // Get mapping from column label to index
    var content_dict = JSON.parse(contents);
    if("residue_to_atomic_contacts" in content_dict){
        return content_dict["residue_to_atomic_contacts"];
    }
    else{
        console.log("residue_to_atomic_contacts doesn't exist in this flareplot input");
    }
    return;
}


function getNameToResiTable(uniprot){
    // Gets the mapping from gpcrdb to resid for a particular uniprot
    var uniprot_to_gpcrdb = (function () {
        var uniprot_to_gpcrdb;
        $.ajax({
            'async': false,
            'global': false,
            'url': '../tables/uniprot_to_gpcrdb.json',
            'dataType': "json",
            'success': function (data) {
                uniprot_to_gpcrdb = data;
            }
        });
        return uniprot_to_gpcrdb;
    })(); 
    return uniprot_to_gpcrdb[uniprot]
}

function getReceptorIndex(contents, uniprot){
    // Get the index of uniprot receptor from frameDict
    var frameDict = getFrameDict(contents);
    for (var receptorIndex in frameDict){
        if(frameDict[receptorIndex].indexOf(uniprot) !== -1){
            return receptorIndex;
        }
    }
}


function createAtomicProteinViewer(flareplot, contents, column_header, pdbFile, container, width, height, callback) {
    var options = {
        width: width,
        height: height,
        antialias: true,
        quality: "medium"
    };
    container.style.width=width+"px";
    var viewer = pv.Viewer(container, options);
    var struc;

    var residue_to_atomic_contacts = getResidueToAtomContacts(contents);
    var receptorIndex = getReceptorIndex(contents, column_header);

    var col_header_comp = column_header.split("_")
    var uniprot = col_header_comp[0] + "_" + col_header_comp[1];
    var nameToResiTable = getNameToResiTable(uniprot);
    

    function nameToResi(name) {
        if (name in nameToResiTable) {
            return nameToResiTable[name][0];
        } else {
            console.log("Error looking up " + name);
            return undefined;
        }
    }


    var active_residues = [];

    function updateInteractions() {
        viewer.rm("interactions");
        // viewer.rm("selected_residues");
        var cm = viewer.customMesh("interactions");
        flareplot.getEdges()
        .filter(function(e){ 

            return e.toggled; })
        .forEach(function(e){
            var name1 = e.edge.name1;
            var name2 = e.edge.name2;
            var resi1 = nameToResi(name1);
            var resi2 = nameToResi(name2);

            if (resi1 !== undefined && resi2 !== undefined && (name1 !== name2)) {
                var key = name1 + ":" + name2;
                atomic_interactions = residue_to_atomic_contacts[key][receptorIndex]
                if(atomic_interactions !== undefined){
                    for (i = 0; i < atomic_interactions.length; i++){
                        var pv_atom_obj = [];
                        var atoms = atomic_interactions[i].split(":");
                        for (j = 0; j < atoms.length; j++){
                            var resi_atom = atoms[j].split("-");
                            var residue = resi_atom[0];
                            var resid = residue.substring(3, residue.length);

                            var atom_type = resi_atom[1];
                            pv_atom_obj.push([resid, atom_type]);
                        }

                        var edgew = 0.05 * e.weight;
                        if(pv_atom_obj.length == 2){
                            resid1 = pv_atom_obj[0][0].toString();
                            resid2 = pv_atom_obj[1][0].toString();
                            atom_type1 = pv_atom_obj[0][1];
                            atom_type2 = pv_atom_obj[1][1];
                            atom1 = struc.atom("A." + resid1 + "." + atom_type1);
                            atom2 = struc.atom("A." + resid2 + "." + atom_type2);

                            console.log(resid1, atom_type1, resid2, atom_type2);
                            cm.addTube(atom1.pos(), atom2.pos(), edgew, {cap: true, color: "#333"});

                            if(active_residues.indexOf(resid1) == -1){
                                active_residues.push(resid1);
                            }else{
                                active_residues.splice(resid1, 1);
                            }

                            if(active_residues.indexOf(resid2) == -1){
                                active_residues.push(resid2);
                            }else{
                                active_residues.splice(resid2, 1);
                            }

                            console.log("active_residues", active_residues)

                            // Update the two residue pairs to lines 
                            pv.io.fetchPdb(pdbFile, function (structure) {
                                struc = structure;
                                var selected_residues = structure.select({rnums:active_residues})
                                viewer.ballsAndSticks("selected_residues", selected_residues);
                            });
                        }
                    }
                }
            }
        });
    }

    flareplot.addFrameListener(updateInteractions);
    flareplot.addNodeToggleListener(updateInteractions);

    function indexToClusterColor(idx) {
        var colTab = {"": [0.5, 0.5, 0.5, 1], "1": [0, 1, 1, 1], "2": [1, 0, 1, 1]};
        for (var key in nameToResiTable) {
            if (nameToResiTable.hasOwnProperty(key)) {
                if (nameToResiTable[key][0] == "" + idx) {
                    return colTab[nameToResiTable[key][1]];
                }
            }
        }
        return colTab[""];
    }

    function updateColors(clustered) {
        viewer.rm("protein");
        var geom = viewer.trace("protein", struc, {color: color.ssSuccession()});
        if (clustered) {
            function clusterCol() {
                return new pv.color.ColorOp(function (atom, out, index) {
                    var col = indexToClusterColor(atom.residue().num());
                    out[index + 0] = col[0];
                    out[index + 1] = col[1];
                    out[index + 2] = col[2];
                });
            }

            geom.colorBy(clusterCol());
        }
    }

    var ret = {
        getPV: function() { return viewer; }
    };

    pv.io.fetchPdb(pdbFile, function (structure) {
        struc = structure;
        viewer.tube("protein", structure, {color: color.ssSuccession()});
        // var ligands = structure.select({rnames: ["YCM", "4VO", "OLC", "CLR", "P04", "P6G", "BF0"]});
        // viewer.ballsAndSticks("ligands", ligands);
        viewer.fitTo(structure);
        viewer.forEach(function(object){
            object.setOpacity(0.5);
        });
        // viewer.setRotation([1, 0, 0, 0, 0, 1, 0, -1, 0]);
        callback(ret);
    });

    return ret;

}
