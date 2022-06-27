#Author: Siew Ming Shern
#Purpose: perform white box testing for preprocessing utility file.

options(warn=-1)
library(testthat)
source("Preprocessing_Util.R", chdir = TRUE)

#check whether list_csv_file is working with 3 different file
test_that('list_csv_file', {
  actual <- list_csv_file("test_set/test")
  expected <- c("test_set/test/test_1.csv","test_set/test/test_2.csv","test_set/test/test_3.csv")
  expect_equal(actual,expected)
})

#Check if collate_csv_file function can be used to find all csv file in a given directory
test_that('collate_csv_file', {
  file_path <- list_csv_file("test_set/test")
  actual <- collate_csv_file(data.frame(),file_path)
  expected <- read.csv("test_set/test_result_collate_csv_file.csv")
  expect_equal(actual,expected)
})

#Check if imputation function can be used to replace all empty entry in any rows with mean value.
test_that('imputation', {
  data_frame <- read.csv("test_set/test_input.csv")
  actual <- imputation(data_frame)
  expected <- read.csv("test_set/test_result_imputation.csv")
  expect_equal(actual,expected)
})

#Check if extract_year function can be used to extract date to (year,month and day).
test_that('extract_year', {
  data_frame <- read.csv("test_set/test_input_2.csv")
  actual <- extract_year(data_frame)
  actual$Year = as.numeric(as.character(actual$Year))
  actual$Month = as.numeric(as.character(actual$Month))
  actual$Day = as.numeric(as.character(actual$Day))
  expected <- read.csv("test_set/test_result_extract_year.csv")
  expect_equal(actual,expected)
})

#Check if transform_wind speed function can be used to change m/sec to km/hr with math formula.
test_that('transform_windspeed', {
  data_frame <- read.csv("test_set/test_input_2.csv")
  actual <- transform_windspeed(data_frame)
  expected <- read.csv("test_set/test_result_transform_windspeed.csv")
  expect_equal(actual,expected)
})

#Check if feature_selection function can be used to filter all unused column.
test_that('feature_selection', {
  features <- c("Date", "Max_Temp", "Rainfall", "Wind_Speed", "Humidity","Station")
  data_frame <- read.csv("test_set/test_input_2.csv")
  actual <- feature_selection(data_frame,features)
  expected <- read.csv("test_set/test_result_feature_select.csv")
  expect_equal(actual$Date,expected$Date)
  expect_equal(actual$Max_Temp,expected$Max_Temp)
  expect_equal(actual$Rainfall,expected$Rainfall)
  expect_equal(actual$Wind_Speed,expected$Wind_Speed)
  expect_equal(actual$Humidity,expected$Humidity)
  expect_equal(actual$Station,expected$Station)
  expect_equal(length(actual),length(expected))
})
