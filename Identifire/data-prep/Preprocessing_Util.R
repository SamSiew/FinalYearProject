#find list of csv given a directory name
list_csv_file <- function(directory){
  file_loc <- list.files(paste(directory,"/",sep = ""), full.names = TRUE, pattern="*.csv")
  return(file_loc)
}

#collate all file given file_loc into a single data frame.
#file_loc will use list.files to collate all 
collate_csv_file <- function(dataframe,file_loc){
  for (files in file_loc) {
    col_names <- c("Station", "Date", "Etrans", "Rainfall", "Epan", "Max_Temp", "min_Temp", "Humidity", "Min_hum", "Wind_Speed", "Rad")
    df_day <- read.csv(text=paste0(head(readLines(files), -1), collapse="\n"), skip = 12, col.names = col_names)
    dataframe <- rbind(dataframe, df_day)
  }
  return(dataframe)
}

# imputate data frame to replace empty entry with mean
imputation <- function(new_df){
  for(i in 1:ncol(new_df)){
    new_df[is.na(new_df[,i]), i] <- mean(new_df[,i], na.rm = TRUE)
  }
  return(new_df)
}

# extract date into year, month and day.
extract_year <- function(new_df){
  new_df['Year'] = format(as.Date(new_df$Date, format="%d/%m/%Y"),"%Y")
  new_df['Month'] = format(as.Date(new_df$Date, format="%d/%m/%Y"),"%m")
  new_df['Day'] = format(as.Date(new_df$Date, format="%d/%m/%Y"),"%d")
  return(new_df)
}

#find list of csv given a directory name
transform_windspeed <- function(new_df){
  new_df['Wind_Speed'] = 3.6 * new_df['Wind_Speed'] 
  return(new_df)
}

#filter set of feature in dataset.
feature_selection <- function(new_df,feature_set){
  output <- subset(new_df, select = feature_set)
  return(output)
}

#do 
get_data_table <- function(directory,unique_val){
  #find the csv file recursively inside data directory and make it into string which can be used to find later.
  file_loc <- list_csv_file(directory)
  
  #if directory is not empty continue
  if(length(file_loc) != 0){
    #collate all weather condition throughout month into a single weather condition for a single weather station.
    weather_dataframe <- data.frame()
    weather_dataframe <- collate_csv_file(weather_dataframe, file_loc)
    
    #get data frame of list of station.
    station_db <- read.csv("station_db.csv",fill=TRUE,header = FALSE)
    colnames(station_db) <- c("station_num", "state","product_num","Station","unknown","Lat","Lon")
    
    #merge each entry in raw data with corresponding station in station_db.csv
    #helps to retrieve lat and lon of station based on list of station.
    new_df = merge(x = weather_dataframe,y = station_db,by ="Station",all.x = TRUE)
    
    #apply all empty entry with NA
    new_df[] <- lapply(new_df, function(x) {
      is.na(levels(x)) <- levels(x) == "NA"
      x
    })
    
    #if lat and lon column is not empty, we can continue to compute.
    if(sum(is.na(new_df$Lat)) == 0 && sum(is.na(new_df$Lon))==0)
    {
      #preprocessing start here!
      
      #imputation
      new_df = imputation(new_df)
      
      #feature extract
      new_df = extract_year(new_df)
      
      #Transform measurement unit -> m/sec = 3.6 km/hr
      new_df = transform_windspeed(new_df)
      
      #Feature Selection
      features <- c("Year", "Month", "Day", "Max_Temp", "Rainfall", "Wind_Speed", "Humidity", "Lat", "Lon","Station","state")
      output <- feature_selection(new_df,features)
      
      #create dataset for raw data in dataset and another in forecasted folder for prediction purpose.
      filename_forecast = paste('../dataset/forecasted/',new_df$Station[1],'-',unique_val,".csv",sep = "")
      write.csv(output, filename_forecast, row.names=FALSE)
      filename = paste('../dataset/',new_df$Station[1],'-',unique_val,".csv",sep = "")
      write.csv(output, filename, row.names=FALSE)
    }
  }
}
#end 
