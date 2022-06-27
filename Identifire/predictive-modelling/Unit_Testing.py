"""
Author: Siew Ming Shern
Purpose: Perform white box testing on ForecastWeather.py and PredictBushfire.py
call on anaconda promt: py Unit_Testing.py
"""
import sys
import os
import unittest
import datetime
import warnings
import json
import ast
import PredictBushfire
import pandas as pd
from ForecastWeather import WeatherForecast

def block_print():
    sys.stdout = open(os.devnull, 'w')

class UnitTest(unittest.TestCase):

    def setUp(self):
        """
        Sets up a valid command with all valid arguments entered
        """
        warnings.simplefilter('ignore')
        self.input = WeatherForecast(datetime.datetime.strptime("10.10.2020 09:38:17", "%d.%m.%Y %H:%M:%S"))
        self.input.init_argument()
        # self.input.payload = {'units': 'metric', 'appid': 'ad3d090e749a388432e6eb595ca1c3c5'}

    def test_get_past_unix(self):
        """
        Test wheather get_past_unix function is working using examples 1 day , 2 day or 3 day before
        """
        self.assertEqual(self.input.get_past_unix(1, 34200), 1602230897)
        self.assertEqual(self.input.get_past_unix(2, 34200), 1602144497)
        self.assertEqual(self.input.get_past_unix(3, 34200), 1602058097)

    def test_get_forecast(self):
        """
        Test wheather get_forecast is working using examples
        """
        test_file = open('test_future_paylord.txt')
        test = json.load(test_file)

        with open('test_future_result.txt', 'r') as data_file:
            test_result_file = data_file.read()
        test_result = ast.literal_eval(test_result_file)

        row = {}
        for n_day in range(len(test_result)):
            row["Year"], row["Month"], row["Day"], row["Max_Temp"], row["Humidity"], row["Wind_Speed"], row["Rainfall"]= self.input.get_forecast(test,n_day + 1)
            self.assertEqual(row['Year'],test_result[n_day]['Year'])
            self.assertEqual(row['Month'], test_result[n_day]['Month'])
            self.assertEqual(row['Day'], test_result[n_day]['Day'])
            self.assertAlmostEqual(row['Max_Temp'], test_result[n_day]['Max_Temp'])
            self.assertAlmostEqual(row['Humidity'], test_result[n_day]['Humidity'])
            self.assertAlmostEqual(row['Wind_Speed'], test_result[n_day]['Wind_Speed'])
            self.assertAlmostEqual(row['Rainfall'], test_result[n_day]['Rainfall'])

    def test_calculate_API(self):
        """
        Test wheather API is working using examples
        """
        data = {'Year': [2020, 2020, 2020, 2020, 2020],
                'Month': [8, 8, 8, 8, 8],
                'Day': [31, 27, 24, 22, 23],
                'Max_Temp': [12.5, 20.7, 12.4,11.1,11.5],
                'Rainfall': [1, 0, 2.8, 4.4,25.6],
                'Wind_Speed': [116.64, 90.72,142.56,64.8,116.64],
                'Humidity': [72, 72, 67,59, 63]
        }
        result = {
            'API': [1.00, 0.85, 3.52, 7.39, 31.89]
        }
        df = pd.DataFrame(data)
        df = PredictBushfire.calculate_API(df)
        api_list = df['API'].to_list()
        for index in range(len(api_list)):
            self.assertAlmostEqual(result['API'][index], api_list[index], 2)


    def test_calculate_FFDI(self):
        """
        Test wheather FFDI is working using examples
        """
        data = {'Year': [2020, 2020, 2020, 2020, 2020],
                'Month': [8, 8, 8, 8, 8],
                'Day': [31, 27, 24, 22, 23],
                'Max_Temp': [12.5, 20.7, 12.4, 11.1, 11.5],
                'Rainfall': [1, 0, 2.8, 4.4, 25.6],
                'Wind_Speed': [116.64, 90.72, 142.56, 64.8, 116.64],
                'Humidity': [72, 72, 67, 59, 63]
                }
        result = {
            'FFDI': [2.49, 1.52, 18.71, 7.95, 99.95]
        }
        df = pd.DataFrame(data)
        df = PredictBushfire.calculate_API(df)
        df = PredictBushfire.calculate_FFDI(df)
        api_list = df['FFDI'].to_list()
        for index in range(len(api_list)):
            self.assertAlmostEqual(result['FFDI'][index], api_list[index], 2)


if __name__ == '__main__':
    unittest.main()
