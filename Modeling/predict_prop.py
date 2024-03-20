# Gets player prediction from model
import sys

args = sys.argv[1:]

def main(player, stat):

    string = player + " is projected to score 25 " + stat + " tonight."
    return string

print(main(*args))