/**
 * Created by rfonseca on 5/23/17.
 */


function createProteinViewer(flareplot, pdbFile, container, width, height, callback) {
    var options = {
        width: width,
        height: height,
        antialias: true,
        quality: "medium"
    };
    container.style.width=width+"px";
    var viewer = pv.Viewer(container, options);
    var struc;


    var nameToResiTable = {
        "1x28": ["64", ""],
        "1x29": ["65", ""],
        "1x30": ["66", ""],
        "1x31": ["67", ""],
        "1x32": ["68", ""],
        "1x33": ["69", ""],
        "1x34": ["70", ""],
        "1x35": ["71", ""],
        "1x36": ["72", ""],
        "1x37": ["73", ""],
        "1x38": ["74", ""],
        "1x39": ["75", ""],
        "1x40": ["76", ""],
        "1x41": ["77", ""],
        "1x42": ["78", ""],
        "1x43": ["79", ""],
        "1x44": ["80", ""],
        "1x45": ["81", ""],
        "1x46": ["82", ""],
        "1x47": ["83", ""],
        "1x48": ["84", ""],
        "1x49": ["85", ""],
        "1x50": ["86", ""],
        "1x51": ["87", ""],
        "1x52": ["88", ""],
        "1x53": ["89", ""],
        "1x54": ["90", ""],
        "1x55": ["91", ""],
        "1x56": ["92", ""],
        "1x57": ["93", ""],
        "1x58": ["94", ""],
        "1x59": ["95", ""],
        "1x60": ["96", ""],
        "12x48": ["97", ""],
        "12x49": ["98", ""],
        "12x50": ["99", ""],
        "12x51": ["100", ""],
        "12x52": ["101", ""],
        "2x38": ["102", ""],
        "2x39": ["103", ""],
        "2x40": ["104", ""],
        "2x41": ["105", ""],
        "2x42": ["106", ""],
        "2x43": ["107", ""],
        "2x44": ["108", ""],
        "2x45": ["109", ""],
        "2x46": ["110", ""],
        "2x47": ["111", ""],
        "2x48": ["112", ""],
        "2x49": ["113", ""],
        "2x50": ["114", ""],
        "2x51": ["115", "1"],
        "2x52": ["116", ""],
        "2x53": ["117", "1"],
        "2x54": ["118", ""],
        "2x55": ["119", ""],
        "2x56": ["120", "1"],
        "2x57": ["121", "1"],
        "2x58": ["122", ""],
        "2x59": ["123", ""],
        "2x60": ["124", "1"],
        "2x61": ["125", "1"],
        "2x62": ["126", ""],
        "2x63": ["127", "1"],
        "2x64": ["128", "1"],
        "2x65": ["129", "1"],
        "2x66": ["130", ""],
        "23x48": ["131", ""],
        "23x49": ["132", ""],
        "23x50": ["133", ""],
        "23x51": ["134", ""],
        "23x52": ["135", ""],
        "23x53": ["136", ""],
        "3x22": ["137", ""],
        "3x23": ["138", ""],
        "3x24": ["139", ""],
        "3x25": ["140", ""],
        "3x26": ["141", ""],
        "3x27": ["142", ""],
        "3x28": ["143", "1"],
        "3x29": ["144", "1"],
        "3x30": ["145", ""],
        "3x31": ["146", ""],
        "3x32": ["147", "1"],
        "3x33": ["148", "1"],
        "3x34": ["149", ""],
        "3x35": ["150", ""],
        "3x36": ["151", "1"],
        "3x37": ["152", "1"],
        "3x38": ["153", ""],
        "3x39": ["154", ""],
        "3x40": ["155", "1"],
        "3x41": ["156", ""],
        "3x42": ["157", ""],
        "3x43": ["158", ""],
        "3x44": ["159", ""],
        "3x45": ["160", ""],
        "3x46": ["161", ""],
        "3x47": ["162", ""],
        "3x48": ["163", ""],
        "3x49": ["164", ""],
        "3x50": ["165", "2"],
        "3x51": ["166", ""],
        "3x52": ["167", ""],
        "3x53": ["168", "2"],
        "3x54": ["169", "2"],
        "3x55": ["170", "2"],
        "3x56": ["171", ""],
        "34x50": ["172", ""],
        "34x51": ["173", ""],
        "34x52": ["174", ""],
        "34x53": ["175", ""],
        "34x54": ["176", ""],
        "34x55": ["177", ""],
        "34x56": ["178", ""],
        "34x57": ["179", ""],
        "4x41": ["183", ""],
        "4x42": ["184", ""],
        "4x43": ["185", ""],
        "4x44": ["186", ""],
        "4x45": ["187", ""],
        "4x46": ["188", ""],
        "4x47": ["189", ""],
        "4x48": ["190", ""],
        "4x49": ["191", ""],
        "4x50": ["192", ""],
        "4x51": ["193", ""],
        "4x52": ["194", ""],
        "4x53": ["195", ""],
        "4x54": ["196", ""],
        "4x55": ["197", ""],
        "4x56": ["198", "1"],
        "4x57": ["199", "1"],
        "4x58": ["200", ""],
        "4x59": ["201", "1"],
        "4x60": ["202", "1"],
        "4x61": ["203", "1"],
        "4x62": ["204", ""],
        "4x63": ["205", ""],
        "45x50": ["217", ""],
        "45x51": ["218", ""],
        "45x52": ["219", ""],
        "5x32": ["225", ""],
        "5x33": ["226", ""],
        "5x34": ["227", ""],
        "5x35": ["228", ""],
        "5x36": ["229", ""],
        "5x37": ["230", ""],
        "5x38": ["231", "1"],
        "5x39": ["232", "1"],
        "5x40": ["233", ""],
        "5x41": ["234", ""],
        "5x42": ["235", "1"],
        "5x43": ["236", "1"],
        "5x44": ["237", "1"],
        "5x45": ["238", "1"],
        "5x46": ["239", "1"],
        "5x461": ["240", "1"],
        "5x47": ["241", "1"],
        "5x48": ["242", ""],
        "5x49": ["243", ""],
        "5x50": ["244", ""],
        "5x51": ["245", ""],
        "5x52": ["246", ""],
        "5x53": ["247", ""],
        "5x54": ["248", ""],
        "5x55": ["249", ""],
        "5x56": ["250", ""],
        "5x57": ["251", ""],
        "5x58": ["252", ""],
        "5x59": ["253", ""],
        "5x60": ["254", ""],
        "5x61": ["255", "2"],
        "5x62": ["256", ""],
        "5x63": ["257", ""],
        "5x64": ["258", "2"],
        "5x65": ["259", ""],
        "5x66": ["260", ""],
        "5x67": ["261", ""],
        "5x68": ["262", ""],
        "6x23": ["268", ""],
        "6x24": ["269", ""],
        "6x25": ["270", ""],
        "6x26": ["271", ""],
        "6x27": ["272", ""],
        "6x28": ["273", ""],
        "6x29": ["274", ""],
        "6x30": ["275", ""],
        "6x31": ["276", ""],
        "6x32": ["277", ""],
        "6x33": ["278", "2"],
        "6x34": ["279", ""],
        "6x35": ["280", ""],
        "6x36": ["281", ""],
        "6x37": ["282", "2"],
        "6x38": ["283", "2"],
        "6x39": ["284", ""],
        "6x40": ["285", ""],
        "6x41": ["286", ""],
        "6x42": ["287", ""],
        "6x43": ["288", ""],
        "6x44": ["289", "1"],
        "6x45": ["290", "1"],
        "6x46": ["291", ""],
        "6x47": ["292", ""],
        "6x48": ["293", "1"],
        "6x49": ["294", ""],
        "6x50": ["295", ""],
        "6x51": ["296", "1"],
        "6x52": ["297", "1"],
        "6x53": ["298", ""],
        "6x54": ["299", "1"],
        "6x55": ["300", "1"],
        "6x56": ["301", ""],
        "6x57": ["302", ""],
        "6x58": ["303", "1"],
        "6x59": ["304", "1"],
        "6x60": ["305", ""],
        "6x61": ["306", ""],
        "7x28": ["312", ""],
        "7x29": ["313", ""],
        "7x30": ["314", "1"],
        "7x31": ["315", "1"],
        "7x32": ["316", "1"],
        "7x33": ["317", "1"],
        "7x34": ["318", "1"],
        "7x35": ["319", "1"],
        "7x36": ["320", "1"],
        "7x37": ["321", "1"],
        "7x38": ["322", "1"],
        "7x39": ["323", "1"],
        "7x40": ["324", "1"],
        "7x41": ["325", "1"],
        "7x42": ["326", "1"],
        "7x43": ["327", "1"],
        "7x45": ["328", ""],
        "7x46": ["329", ""],
        "7x47": ["330", ""],
        "7x48": ["331", ""],
        "7x49": ["332", ""],
        "7x50": ["333", ""],
        "7x51": ["334", ""],
        "7x52": ["335", ""],
        "7x53": ["336", ""],
        "7x54": ["337", ""],
        "7x55": ["338", ""],
        "7x56": ["339", ""],
        "7x57": ["340", ""],
        "8x48": ["341", ""],
        "8x49": ["342", ""],
        "8x50": ["343", ""],
        "8x51": ["344", ""],
        "8x52": ["345", ""],
        "8x53": ["346", ""],
        "8x54": ["347", ""],
        "8x55": ["348", ""],
        "8x56": ["349", ""],
        "8x57": ["350", ""],
        "8x58": ["351", ""],
        "8x59": ["352", ""]
    };

    function nameToResi(name) {
        if (name in nameToResiTable) {
            return nameToResiTable[name][0];
        } else {
            console.log("Error looking up " + name);
            return undefined;
        }
    }

    function updateInteractions() {
        viewer.rm("interactions");
        var cm = viewer.customMesh("interactions");
        flareplot.getEdges()
            .filter(function(e){ return e.toggled; })
            .forEach(function(e){
                var name1 = e.edge.name1;
                var name2 = e.edge.name2;
                var resi1 = nameToResi(name1);
                var resi2 = nameToResi(name2);
                if (resi1 !== undefined && resi2 !== undefined) {
                    var atom1 = struc.atom("A." + resi1 + ".CA");
                    var atom2 = struc.atom("A." + resi2 + ".CA");
                    var edgew = 0.5 * e.weight;
                    cm.addTube(atom1.pos(), atom2.pos(), edgew, {cap: true, color: "#333"});
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
        viewer.trace("protein", structure, {color: color.ssSuccession()});
        var ligands = structure.select({rnames: ["YCM", "4VO", "OLC", "CLR", "P04", "P6G", "BF0"]});
        viewer.ballsAndSticks("ligands", ligands);
        viewer.fitTo(structure);
        // viewer.setRotation([1, 0, 0, 0, 0, 1, 0, -1, 0]);
        callback(ret);
    });

    return ret;

}