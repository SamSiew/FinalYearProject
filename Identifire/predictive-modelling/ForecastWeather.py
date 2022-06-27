"""
Author: Siew Ming Shern
Purpose: Forecast weather condition with openweather api
call on anaconda promt: py ForecastWeather.py
reference: https://openweathermap.org/api
"""
import os
import requests
import time
import datetime
import pandas as pd

class WeatherForecast:
    """
    Class for WeatherForecast program
    """
    def __init__(self, start_date, api='ad3d090e749a388432e6eb595ca1c3c5'):
        """
        class init method

        Args:
            start_date: starting date which is expected to forecast
            api: token which will be used to compute weather.
        """
        self.payload = {}
        self.start = start_date
        self.api = api
        self.temp_units = " celsius"
        self.wind_units = " km/hr"

    def runForecast(self):
        """
        Main method which run through each method in the the class to perform forecasting.
        """
        self.init_argument()
        self.forecast()

    def init_argument(self):
        """
        Initialise the argument for api to call forecast
        """
        self.payload.update({'appid': self.api})
        self.payload.update({'units': 'metric'})

    def forecast(self):
        """
        forecasting method which perform forecast on all file in dataset directory.
        """
        directory_name = '../dataset/forecasted/'
        num_file = 0
        #perform forecast on all file in dataset directory.
        for filename in os.listdir(directory_name):
            path = directory_name + filename
            if check_is_excel(path) or check_is_csv(path):
                self.output(path)
                num_file += 1
                print('completed forecast for', path)
        print('number of completed forecast:',num_file)

    def output(self, file):
        """
        write the output of the of calling weather API into csv

        Precondition:
            self.init_argument() must be called before this method

        """
        if check_is_excel(file):
            indata = pd.read_excel(file)
        else:
            indata = pd.read_csv(file)

        # each file will have same latitude, longtitude, station, state
        lat, lon,station,state= indata['Lat'][0], indata['Lon'][0],indata['Station'][0],indata['state'][0]
        self.payload.update({'lat':lat})
        self.payload.update({'lon': lon})

        # call openweather with appid, units, lat and lon of weather station
        data = {'appid': self.payload['appid'],'units': self.payload['units'],'lat': lat, 'lon': lon}
        datframe = pd.DataFrame(columns=["Year", "Month", "Day", "Max_Temp", "Rainfall", "Wind_Speed", "Humidity", "Lat", "Lon","Station","state"])
        # Extract API information of the city
        weather_api = 'https://api.openweathermap.org/data/2.5/onecall?'

        # get request of weather api for forecasting
        r = requests.get(weather_api, data)
        r_dict = r.json()  # JSON file becomes a dictionary
        row = {}
        # retrive the forecasting data for 7 days and save it into a list.
        for days in range(7):
            row["Year"], row["Month"], row["Day"], row["Max_Temp"], row["Humidity"], row["Wind_Speed"], row["Rainfall"] = self.get_forecast(r_dict,days)
            row["Lat"] , row["Lon"],row["Station"],row["state"] = lat, lon, station, state
            datframe = datframe.append(row, ignore_index=True)
        # append the forecasting data into actual datasets.
        indata = indata.append(datframe, ignore_index=True)

        if check_is_excel(file):
            indata.to_excel(file ,index=False)
        else:
            indata.to_csv(file,index=False)

    def get_forecast(self, r_dict, day_th):
        """
        get forecasting value for next 7 days

        Args:
            r_dict: request dictionary which contain all forecasting data
            day_th: specify the N out of 7 days for forecasting data.

        Returns: rows consist of year, month, day, temp, humidity, wind and rain.
        """
        date = r_dict['daily'][day_th]['dt']
        date = datetime.datetime.fromtimestamp(date)
        temp = r_dict['daily'][day_th]['temp']['max']
        humid = r_dict['daily'][day_th]['humidity']
        wind = r_dict['daily'][day_th]['wind_speed']
        if 'rain' in r_dict['daily'][day_th]:
            rain = r_dict['daily'][day_th]['rain']
        else:
            rain = 0
        return int(date.strftime('%Y')),int(date.strftime('%m')),int(date.strftime('%d')), temp, humid, wind*3.6, rain

    def get_past_unix(self, n_days, timezone):
        """
        look up n previous day from today

        Args:
            n_days: number of days to backdate
            timezone: location of time it follows

        Returns: integer represent unix time after the day have been back date from today.

        """
        yesterday = self.start - datetime.timedelta(days=n_days) + datetime.timedelta(seconds=timezone)
        unix_time = time.mktime(yesterday.timetuple())
        return int(unix_time)

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

def main():
    """
    perform forecasting starting today till next 7 days.
    Args: nothing
    """
    #get unix of today
    today = datetime.datetime.utcnow()
    #perform forecasting starting today till next 7 days.
    weather = WeatherForecast(today)
    weather.runForecast()

if __name__ == '__main__':
    main()
