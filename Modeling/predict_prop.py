# Gets player prediction from model
import sys
import pickle
import pandas as pd
from NPB_tools import GetPlayerCareer, recent_average, recent_percentage, shift_target

def AddFeatures(df, target):
    df = shift_target(df, target)
    df = recent_average(df, target, 3)
    df = recent_average(df, target, 5)
    df = recent_average(df, target, 7)
    df = recent_average(df, 'PLUS_MINUS', 3)
    df = recent_percentage(df, 'FGM', 'FGA', 3)
    df = recent_percentage(df, 'FGM', 'FGA', 5)
    return df

def main(player_name, stat):
    print(player_name, stat)
    df_player = GetPlayerCareer(player_name)
    df_player = AddFeatures(df_player, stat)

    cols_to_drop = ['SEASON_ID', 'Player_ID', 'GAME_DATE', 'OPP', 'TEAM', stat + '_target']
    features = list(df_player.columns)
    for col in cols_to_drop:
        features.remove(col)

    # Import model
    model_path = "../Modeling/Models/xgb_{}.pkl".format(stat)
    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    prediction = model.predict(df_player[features])
    string = "{} is projected to obtain {} {} tonight.".format(player_name, prediction[-1], stat)
    return string

args = sys.argv[1:]
print(main(*args))