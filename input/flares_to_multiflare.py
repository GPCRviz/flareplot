#!/usr/bin/env python3

"""
Take a list of single-flare files and convert them to a multi-flare file.

See https://github.com/GPCRviz/flareplot/tree/master/input for detailed
definitions of different types of flare files. Briefly, a single-flare is a
flareplot input file where the value of the `frames` attribute of each edge is
`[0]`. This corresponds e.g. to the contact network of a single protein
structure. A multi-frame has edges with multiple values in the `frames` list,
but each index has a label specified in a `frameDict` entry. Multi-frames are
used to generate finger-print comparison flareplots.

Example
=======
"""

import json
import os
import re


def main():
    """
    Main function called once at the end of this module. Configures and parses command line arguments, parses input
    files and generates output files.
    """
    # Parse command line arguments
    import argparse as ap
    parser = ap.ArgumentParser(description=__doc__, formatter_class=ap.RawTextHelpFormatter)

    parser.add_argument("--output",
                        required=True,
                        type=ap.FileType("w"),
                        help="Multi-flare output json")

    parser.add_argument("--single-flares",
                        required=True,
                        type=ap.FileType("r"),
                        dest="input",
                        nargs="+",
                        help="Single flare input jsons")

    parser.add_argument("--names",
                        type=str,
                        nargs="+",
                        default=None,
                        help="Names to assign to each single flare. Uses input file names by default")

    args = parser.parse_args()

    if not args.names:
        args.names = list(map(lambda x: os.path.basename(os.path.splitext(x.name)[0]), args.input))
    elif len(args.names) != len(args.input):
        print("The number of --names arguments must match the number of --single-flares")
        exit(1)

    singleflares = list(map(read_json, args.input))
    multiflare = compose_flares(singleflares, args.names)

    pretty_json = json.dumps(multiflare, indent=2)
    # Put list-of-numbers on a single line
    pretty_json = re.sub(r"(?<=\d,)\n *|(?<=\[)\n *(?=\d)|(?<=\d)\n *(?=\])", "", pretty_json, flags=re.MULTILINE)

    # Write to output file
    args.output.write(pretty_json)
    args.output.close()


def read_json(file):
    return json.loads(file.read())


def compose_flares(singleflares, names):
    ret = {
        "edges": [],
        "frameDict": {}
    }

    # Compose edges.
    def findedge(edge):
        node_names = set([edge["name1"], edge["name2"]])
        for e in ret["edges"]:
            if e["name1"] in node_names and e["name2"] in node_names:
                return e
        return None

    for flareidx, flare in enumerate(singleflares):
        for edge in flare["edges"]:
            existing_edge = findedge(edge)
            if existing_edge is None:
                existing_edge = {"name1": edge["name1"],
                                 "name2": edge["name2"],
                                 "frames": [],
                                 "colors": [],
                                 "widths": []}
                ret["edges"].append(existing_edge)

            existing_edge["frames"].append(flareidx)
            if "color" in edge:
                existing_edge["colors"].append(edge["color"])
            if "width" in edge:
                existing_edge["widths"].append(float(edge["width"]))

    for edge in ret["edges"]:
        if edge["widths"]:
            width_sum = sum(edge["widths"]) + (len(singleflares) - len(edge["widths"])) * 1.0
            edge["width"] = width_sum / len(singleflares)
        del edge["widths"]

        if edge["colors"]:
            edge["color"] = edge["colors"][0]  # TODO: Average colors
        del edge["colors"]

    # Compose trees - currently it just takes the trees of the first flare
    if any(map(lambda f: "trees" in f and len(f["trees"]) > 1, singleflares)):
        print("Error, can't compose flares that have multiple trees")
        # TODO: Print which flares have multiple trees
        exit(1)

    if any(map(lambda f: "trees" in f and len(f["trees"]) == 1, singleflares)):
        ret["trees"] = [{"treeLabel": "DefaultTree", "treePaths": []}]

        def findpath(p):
            p_label = p[p.rfind(".")+1:]
            for tp in ret["trees"][0]["treePaths"]:
                tp_label = tp[tp.rfind(".")+1:]
                if tp_label == p_label:
                    return tp
            return None

        for flare in singleflares:
            if "trees" in flare and len(flare["trees"]) > 0:
                for treepath in flare["trees"][0]["treePaths"]:
                    existing_path = findpath(treepath)
                    if existing_path is None:
                        ret["trees"][0]["treePaths"].append(treepath)
                    elif existing_path != treepath:
                        print("Can't compose conflicting tree-paths:")
                        print("> "+existing_path)
                        print("> "+treepath)
                        exit(1)

    # Compose tracks - currently adds all tracks
    # TODO: Check for identical tracks and only add one
    if any(map(lambda f: "tracks" in f and len(f["tracks"]) > 0, singleflares)):
        ret["tracks"] = []
        for flare,flarename in zip(singleflares, names):
            if "tracks" in flare and len(flare["tracks"]) > 0:
                for track in flare["tracks"]:
                    ret["tracks"].append({"trackLabel": track["trackLabel"]+"_"+flarename,
                                          "trackProperties": track["trackProperties"]})

    # Compose frameDict
    for frameidx, name in enumerate(names):
        ret["frameDict"][str(frameidx)] = name

    return ret


if __name__ == "__main__":
    main()


__license__ = "Apache License 2.0"
__maintainer__ = "Rasmus Fonseca"
__email__ = "fonseca.rasmus@gmail.com"
