"""
Author: Siew Ming Shern
Purpose: Predict Bushfire with FFDI model using Antecedent Precipitation Index
call on anaconda promt: py PredictBushfire.py
reference: https://www.researchgate.net/publication/254943794_Predicting_Forest_Fire_Danger_Using_Improved_Model_Derived_Soil_Moisture_and_Antecedent_Precipitation
"""
import os
import math
import pandas as pd

def main():
    """
    Args: nothing
    Returns: nothing
    Purpose: driver program which is used to run bushfire prediction.
    """
    directory_name = '../dataset/forecasted/'
    # data frame which collating of all weather station and thier respective weather condition.
    output_df = pd.DataFrame(columns=["Year", "Month", "Day", "Max_Temp", "Rainfall", "Wind_Speed", "Humidity", "Lat", "Lon","Station","state","API","FFDI","FFDI_Rate"])
    # perform prediction for ffdi value for all file in directory.
    for filename in os.listdir(directory_name):
        # check if the file is an excel or csv, compute them if they are or skip.
        if check_is_excel(directory_name + filename) or check_is_csv(directory_name + filename):
            output_df = predict_bushfire(directory_name, filename, output_df)
            print('completed prediction for', directory_name + filename)
    # write the output into dataset directory.
    output_filename = directory_name + '../output/bushfire_prediction.csv'
    output_df.to_csv(output_filename, index=False)

def check_is_excel(filename):
    """
    Args:
        filename: name of excel file
    Returns: true if file is an excel file; false if file is not excel file
    Precondition: file must conform to .xlsx format
    """
    if '.xlsx' in filename:
        return True
    else:
        return False

def check_is_csv(filename):
    """
    Args:
        filename: name of csv file
    Returns: true if file is an csv file; false if file is not csv file
    Precondition: file must conform to .csv format
    """
    if '.csv' in filename:
        return True
    else:
        return False

def calculate_API(df):
    """
    Args:
        df: data frame consisting data from dataset
    Returns: data frame after calculating API(antecedent precipitation index)

    The formula can be found below
    References: https://www.researchgate.net/publication/254943794_Predicting_Forest_Fire_Danger_Using_Improved_Model_Derived_Soil_Moisture_and_Antecedent_Precipitation
    """
    #P(a,t) = k P(t−1) + k^2 P(t−2) + ...+ k^n P(t-n)
    k = 0.85
    df['API'] = 0
    df.loc[0, 'API'] = df.loc[0, 'Rainfall']
    for row in range(1, len(df)):
        df.loc[row, 'API'] = df.loc[row, 'Rainfall'] + (k * df.loc[row - 1, 'API'])
    return df

def calculate_FFDI(df):
    """
    Args:
        df: data frame after calculating API(antecedent precipitation index)
    Returns: data frame after calculating FFDI(McArthur Forest Fire Danger Index)
    Precondition: Antecedent precipitation index must be calculated beforehand.

    The formula can be found below
    References:
        https://www.researchgate.net/publication/254943794_Predicting_Forest_Fire_Danger_Using_Improved_Model_Derived_Soil_Moisture_and_Antecedent_Precipitation
        https://www.bushfirecrc.com/sites/default/files/managed/resource/ctr_010_0.pdf
    """
    df['FFDI'] = 0
    df['FFDI_Rate'] = None
    #FFDI 1.275D^0.987 exp{[T / 29.5858] - [H / 28.9855]+[V / 42.735]
    #where D=API, T is temperature, H is relative humidity, V is wind speed
    for row in range(len(df)):
        #
        weather_cond = (df.loc[row, 'Max_Temp'] / 29.5858) - (df.loc[row, 'Humidity'] / 28.9855) + (
                    df.loc[row, 'Wind_Speed'] / 42.735)
        df.loc[row, 'FFDI'] = 1.275 * pow(df.loc[row, 'API'], 0.987) * math.exp(weather_cond)
        """
        if FFDI < 5: Low
        if FFDI < 12: Moderate
        if FFDI < 24: High
        if FFDI < 50: Very High
        else: Extreme
        """
        if df.loc[row, 'FFDI'] < 5:
            df.loc[row, 'FFDI_Rate'] = "Low"
        elif df.loc[row, 'FFDI'] < 12:
            df.loc[row, 'FFDI_Rate'] = "Moderate"
        elif df.loc[row, 'FFDI'] < 24:
            df.loc[row, 'FFDI_Rate'] = "High"
        elif df.loc[row, 'FFDI'] < 50:
            df.loc[row, 'FFDI_Rate'] = "Very High"
        else:
            df.loc[row, 'FFDI_Rate'] = "Extreme"
    return df

def predict_bushfire(directory, filename, output_df):
    """
    Args:
        directory: represent directory of working directory
        filename: name of the file
        output_df: dataframe consisting of all datasets from forecasted directory.
    Returns: data frame after calculating FFDI(McArthur Forest Fire Danger Index)
    Precondition: function for check_is_excel, check_is_excel, calculate_API, and calculate_FFDI should be working
    """
    #concat file path from directory and file
    file_path = directory + filename

    #only run reading file for excel or csv only.
    if check_is_excel(file_path):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    #compute api value for all weather condition in a weather station
    df = calculate_API(df)

    # compute ffdi value for all weather condition in a weather station
    df = calculate_FFDI(df)

    # return collating of all weather station and thier respective weather condition.
    return output_df.append(df, ignore_index=True)

if __name__ == "__main__":
    main()
