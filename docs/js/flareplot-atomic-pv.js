/**
 * Edited by akma327 on 5/31/17.
 */

function interactionLabel(itype){
    // Map itype acronym to description (ie wb to Water-mediated )
    if(itype === "sb"){
        return "Salt bridges";
    }else if(itype === "pc"){
        return "Pi-cation contacts";
    }else if(itype === "ps"){
        return "Pi-stacking contacts";
    }else if(itype === "ts"){
        return "T-stacking contacts";
    }else if(itype === "vdw"){
        return "Van Der Waals contacts"
    }else if(itype === "hbbb"){
        return "Backbone-backbone hydrogen bond contacts";
    }else if(itype === "hbsb"){
        return "Sidechain-backbone hydrogen bond contacts";
    }else if(itype === "hbss"){
        return "Sidechain-sidechain hydrogen bond contacts";
    }else if(itype === "wb"){
        return "Water-mediated contacts";
    }else if(itype === "wb2"){
        return "Extended water-mediated contacts";
    }else if(itype === "hlb"){
        return "Ligand-backbone hydrogen bond contacts";
    }else if(itype === "hls"){
        return "Ligand-sidechain hydrogen bond contacts";
    }else if(itype === "lwb"){
        return "Water-mediated ligand contacts";
    }else if(itype === "lwb2"){
        return "Extended water-mediated ligand contacts";
    }
}   


function getResidueToAtomContacts(contents){
    // Get mapping from column label to index
    var content_dict = contents;
    if("residue_to_atomic_contacts" in content_dict){
        return content_dict["residue_to_atomic_contacts"];
    }
    else{
        console.log("residue_to_atomic_contacts doesn't exist in this flareplot input");
    }
    return;
}

function getReceptorIndex(contents, uniprot){
    // Get the index of uniprot receptor from frameDict
    var frameDict = contents.frameDict;
    for (var receptorIndex in frameDict){
        if(frameDict[receptorIndex].indexOf(uniprot) !== -1){
            return receptorIndex;
        }
    }
}

function getChain(column_header){
    // Get the chain id from column header (ie A from OPRD_HUMAN_4N6H_A)
    col_head_comp = column_header.split("_")
    if(col_head_comp.length == 4){
        return col_head_comp[3] + ".";
    }else{
        return "A.";
    }
}

function pdb_to_colheader(pdbFile){
    // Convert pdb file path to column_header (ie ../resources/opioid/structures/OPRD_HUMAN_4N6H_A.pdb to OPRD_HUMAN_4N6H_A)
    var x = pdbFile.split("/")
    var column_header = x[x.length - 1].split(".")[0]
    return column_header
}

function createAtomicProteinViewer(flareplot, contents, pdbFile, structure_files, container, width, height, callback) {
    var column_header = pdb_to_colheader(pdbFile);

    var options = {
        width: width,
        height: height,
        antialias: true,
        quality: "medium"
    };
    container.style.width=width+"px";
    var viewer = pv.Viewer(container, options);
    var struc; // structure the user selected to view
    var background_struc; // keeps track of the background reference structure to align camera to

    var residue_to_atomic_contacts = getResidueToAtomContacts(contents);
    var receptorIndex = getReceptorIndex(contents, column_header);

    var col_header_comp = column_header.split("_")
    var uniprot = col_header_comp[0] + "_" + col_header_comp[1];
    var nameToResiTable;
    d3.json("../tables/uniprot_to_gpcrdb.json", function(data){
        nameToResiTable = data[uniprot];
    });

    function nameToResi(name) {
        if (!nameToResiTable){
            console.error.log("Resi table not yet loaded");
            return undefined;
        }
        if (name in nameToResiTable) {
            return nameToResiTable[name][0];
        }
        else if(name.indexOf("LIG") !== -1){
            return name;
        }
        else {
            console.log("Error looking up " + name);
            return undefined;
        }
    }


    var active_residues = [];

    function updateInteractions() {
        viewer.rm("selected_residues");
        active_residues = [];
        viewer.rm("interactions");

        var cm = viewer.customMesh("interactions");
        flareplot.getEdges()
        // .filter(function(e){ return e.toggled; })
        .forEach(function(e){
            var name1 = e.edge.name1;
            var name2 = e.edge.name2;
            var resi1 = nameToResi(name1);
            var resi2 = nameToResi(name2);

            if (resi1 !== undefined && resi2 !== undefined) {
                var key = name1 + ":" + name2;
                atomic_interactions = residue_to_atomic_contacts[key][receptorIndex]
                if(atomic_interactions !== undefined){
                    for (i = 0; i < atomic_interactions.length; i++){
                        var pv_atom_obj = [];

                        // Parse atoms into the resid and atomtype
                        var atoms = atomic_interactions[i].split(":");
                        for (j = 0; j < atoms.length; j++){
                            var resi_atom = atoms[j].split("-");
                            var residue = resi_atom[0];
                            var atom_type = resi_atom[1];

                            var resname = residue.substring(0,3);
                            var resid = residue.substring(3, residue.length);
                            pv_atom_obj.push([resid, atom_type]);
                        }

                        // create atom structure and tube between atom coordinates
                        var edgew = 0.1 * e.weight;

                        var resid1 = pv_atom_obj[0][0].toString();
                        var resid2 = pv_atom_obj[1][0].toString();
                        var atom_type1 = pv_atom_obj[0][1];
                        var atom_type2 = pv_atom_obj[1][1];
                        var chain = getChain(column_header);

                        var atom1 = struc.atom(chain + resid1 + "." + atom_type1);
                        var atom2 = struc.atom(chain + resid2 + "." + atom_type2);

                        // console.log(resid1, atom_type1, resid2, atom_type2)

                        // Add residue indices to update visualization
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

                        // Residue to residue interaction
                        if(pv_atom_obj.length == 2){
                            cm.addTube(atom1.pos(), atom2.pos(), edgew, {cap: true, color: "#333"});
                        }

                        // Water-mediated interactions
                        else if(pv_atom_obj.length == 3){
                            water1 = pv_atom_obj[2][0].toString();

                            atom_type3 = pv_atom_obj[2][1];

                            atom3 = struc.atom(chain + water1 + "." + atom_type3);

                            // Render water as spheres
                            cm.addSphere(atom3.pos(), 1, { color : 'red' });

                            // Render tubes to show connections
                            cm.addTube(atom1.pos(), atom3.pos(), edgew, {cap: true, color: "#333"});
                            cm.addTube(atom3.pos(), atom2.pos(), edgew, {cap: true, color: "#333"});
                        }

                        // Extended water-mediated interactions
                        else if(pv_atom_obj.length == 4){
                            water1 = pv_atom_obj[2][0].toString();
                            water2 = pv_atom_obj[3][0].toString();

                            atom_type3 = pv_atom_obj[2][1];
                            atom_type4 = pv_atom_obj[3][1];

                            atom3 = struc.atom(chain + water1 + "." + atom_type3);
                            atom4 = struc.atom(chain + water2 + "." + atom_type4);

                            // Render water as spheres
                            cm.addSphere(atom3.pos(), 1, { color : 'red' });
                            cm.addSphere(atom4.pos(), 1, { color : 'red' });

                            // Render tubes to show connections
                            cm.addTube(atom1.pos(), atom3.pos(), edgew, {cap: true, color: "#333"});
                            cm.addTube(atom3.pos(), atom4.pos(), edgew, {cap: true, color: "#333"});
                            cm.addTube(atom4.pos(), atom2.pos(), edgew, {cap: true, color: "#333"});
                        }

                        // Show the residues involved in the interactions
                        pv.io.fetchPdb(pdbFile, function (structure) {
                            struc = structure;
                            var selected_residues = structure.select({rnums:active_residues})
                            viewer.ballsAndSticks("selected_residues", selected_residues);
                        });
                    }
                }
            }
        });
    }

    flareplot.addFrameListener(updateInteractions);
    flareplot.addNodeToggleListener(updateInteractions);

    // function indexToClusterColor(idx) {
    //     var colTab = {"": [0.5, 0.5, 0.5, 1], "1": [0, 1, 1, 1], "2": [1, 0, 1, 1]};
    //     for (var key in nameToResiTable) {
    //         if (nameToResiTable.hasOwnProperty(key)) {
    //             if (nameToResiTable[key][0] == "" + idx) {
    //                 return colTab[nameToResiTable[key][1]];
    //             }
    //         }
    //     }
    //     return colTab[""];
    // }

    // function updateColors(clustered) {
    //     viewer.rm("protein");
    //     var geom = viewer.trace("protein", struc, {color: color.ssSuccession()});
    //     if (clustered) {
    //         function clusterCol() {
    //             return new pv.color.ColorOp(function (atom, out, index) {
    //                 var col = indexToClusterColor(atom.residue().num());
    //                 out[index + 0] = col[0];
    //                 out[index + 1] = col[1];
    //                 out[index + 2] = col[2];
    //             });
    //         }

    //         geom.colorBy(clusterCol());
    //     }
    // }

    var ret = {
        getPV: function() { return viewer; }
    };


    // Load in every aligned structure as a background
    for (i = 0; i < structure_files.length; i++){
        var single_struc = structure_files[i];
        pv.io.fetchPdb(single_struc, function (structure) {
            background_struc = structure;
            var background_protein = viewer.points("protein_" + i.toString(), background_struc, {color: color.ssSuccession()});
            viewer.fitTo(background_struc);
            background_protein.setOpacity(0.0);
            callback(ret);
        });
    }

    // Load in another copy of the actual structure the user selected to analyze
    pv.io.fetchPdb(pdbFile, function (structure) {
        struc = structure;
        var protein = viewer.tube("protein", struc, {color: color.ssSuccession()});
        viewer.fitTo(struc);
        viewer.fitTo(background_struc);
        protein.setOpacity(0.50);
        callback(ret);
    });
    
    
    return ret;

}
