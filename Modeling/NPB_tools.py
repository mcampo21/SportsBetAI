import nba_api
import pandas as pd
import time
import pickle

from nba_api.stats.static import players
from nba_api.stats.endpoints import playergamelog


def GetPlayerCareer(name):
    # Load active player list from pickle file
    with open('../Data/activePlayerList.pickle', 'rb') as file:
        activePlayers = pickle.load(file)

    player_info = players.find_players_by_full_name(name)[0]
    
    if not player_info:
        return False

    career = []
    removeCols = ['Game_ID', 'MATCHUP', 'FG_PCT', 'FG3_PCT', 'FT_PCT', 'VIDEO_AVAILABLE']
    seasonYears = seasonYears = ["20{}-{}".format(16+i, 16+i+1) for i in range(8)]

    for season in seasonYears:
        try:
            gamelog = playergamelog.PlayerGameLog(player_id=player_info['id'], season=season)
        except:
            print("Invalid Entry for {} season. Player stats not found.".format(season))
            continue
            
        df_gamelog = gamelog.get_data_frames()[0]

        if len(df_gamelog) > 1:
            df_gamelog['MATCHUP'] = df_gamelog['MATCHUP'].apply(lambda x : x.split())
            df_gamelog['HOME'] = df_gamelog['MATCHUP'].apply(lambda x : 1 if x[1] == 'vs.' else 0)
            df_gamelog['OPP'] = df_gamelog['MATCHUP'].apply(lambda x : x[2])
            df_gamelog['TEAM'] = df_gamelog['MATCHUP'][0][0]
            df_gamelog['GAME_DATE'] = pd.to_datetime(df_gamelog['GAME_DATE'], format='%b %d, %Y')
            df_gamelog['WL'].replace({'L': 0, 'W': 1}, inplace=True)
            df_gamelog['REST'] = 0
            
            for idx in df_gamelog.index[1:]:
                date_difference = df_gamelog['GAME_DATE'].iloc[idx] - df_gamelog['GAME_DATE'].iloc[idx - 1]
                df_gamelog.at[idx, 'REST'] = date_difference.days

            df_gamelog.drop(columns= removeCols, inplace=True)
            df_gamelog = df_gamelog[::-1]   # reverse game order
            df_gamelog = df_gamelog.reset_index(drop=True)
            career.append(df_gamelog)
    
    # Combine all season into one consecutive data frame
    df_career = pd.concat(career) if len(career) > 1 else None

    return df_career


# one lag time step
def shift_target(df, target):
    df[target + '_target'] = df[target].shift(-1)
    df.dropna(inplace=True)
    return df

# rolling window
def recent_average(df, target, games=5):
    shifted_stat = df[target]
    window = shifted_stat.rolling(window=games).mean()
    df['LAST_' + str(games) + '_' + target] = window
    return df

def recent_percentage(df, target1, target2, games=5):
    shifted_stat1 = df[target1]
    shifted_stat2 = df[target2]
    stat_percentage = shifted_stat1 / shifted_stat2
    window = stat_percentage.rolling(window=games).mean()
    df['LAST_' + str(games) + '_' + target1 + '_PCT'] = window
    return df