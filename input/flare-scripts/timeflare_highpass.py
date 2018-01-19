#!/usr/bin/env python3

"""
Takes a time-flare and returns a single-flare containing only interactions that
occur more than a specific fraction of time (high-pass).

See https://github.com/GPCRviz/flareplot/tree/master/input for detailed
definitions of different types of flare files. Briefly, a time-flare is a
flareplot input file where the `frames` contains potentially multiple integer
values. Usually this would represent e.g. an interactions presence at certain
time-points in a simulation. A single-flare is a flareplot input file where the
value of the `frames` attribute of each edge is `[0]`. In this case the
interactions retained in the output are those that occur most frequently.
"""

import json
import re


def main():
    """
    Main function called once at the end of this module. Configures and parses command line arguments, parses input
    files and generates output files.
    """
    # Parse command line arguments
    import argparse as ap
    parser = ap.ArgumentParser(description=__doc__, formatter_class=ap.RawTextHelpFormatter)

    parser.add_argument("--input",
                        required=True,
                        type=ap.FileType("r"),
                        help="Time-flare input json")

    parser.add_argument("--output",
                        required=True,
                        type=ap.FileType("w"),
                        help="Single-flare output json")

    parser.add_argument("--min_frequency",
                        type=float,
                        default=0.5,
                        help="Only interactions that occur this frequently are retained (value between 0.0 and 1.0)")

    parser.add_argument("--first_frame",
                        type=int,
                        default=0,
                        help="If only a subset of frames should be considered this value indicates the first frame")

    parser.add_argument("--last_frame",
                        type=int,
                        default=-1,
                        help="If only a subset of frames should be considered this value indicates the last frame."
                             "If the value is negative, then all remaining frames are considered.")

    args = parser.parse_args()

    timeflare = read_json(args.input)
    flatten_frames(timeflare, args.min_frequency, args.first_frame, args.last_frame)

    pretty_json = json.dumps(timeflare, indent=2)
    # Put list-of-numbers on a single line
    pretty_json = re.sub(r"(?<=\d,)\n *|(?<=\[)\n *(?=\d)|(?<=\d)\n *(?=\])", "", pretty_json, flags=re.MULTILINE)

    # Write to output file
    args.output.write(pretty_json)
    args.output.close()


def read_json(file):
    return json.loads(file.read())


def flatten_frames(flare, min_frequency, first_frame, last_frame):
    if "edges" not in flare:
        print("No edges in input file")
        exit(1)

    if last_frame < 0:
        last_frame = max(flare["edges"], key=lambda e: max(e["frames"]))

    # Count total number of frames in range
    total_frames = last_frame - first_frame + 1
    if total_frames < 1:
        print("No valid frames specified")
        exit(1)

    # Compress "frames" lists into either [] or [0] depending on their frequency in the specified time-range
    for edge in flare["edges"]:
        frames_in_range = len([f for f in edge["frames"] if first_frame <= f <= last_frame])
        if frames_in_range >= min_frequency * total_frames:
            edge["frames"] = [0]
        else:
            edge["frames"] = []

    # Remove edges with empty "frames"
    flare["edges"] = [e for e in flare["edges"] if e["frames"]]

    return flare


if __name__ == "__main__":
    main()


__license__ = "Apache License 2.0"
__maintainer__ = "Rasmus Fonseca"
__email__ = "fonseca.rasmus@gmail.com"
