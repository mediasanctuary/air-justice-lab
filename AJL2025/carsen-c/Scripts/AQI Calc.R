library(tidyverse)

library(dplyr)
library(lubridate)
library(ggplot2)

# Last updated 1/29/25.
# Setup:
# Run lines 1-5
# Set Working Directory to folder with all needed .csv's 
# Check for standard formatting for each file - if you pull unaltered from 
# PurpleAir, you should be good.

# This is a user-hostile script.

# Create a vector of all sensor indexes, as well as a vector for the specific 
# sensor indexes you want to look at. Store as numbers - these will be converted 
# to strings.

sensor_indexes <- c(188595,220769,220793,164327,156051,166257,87173,149970,149966,
                   166363,151552,166677,166327,166653,151490,151536,166717,156171,
                   156199,164351,166471)

sensor_indexes.alb <- c(151490,151536,166717,166471,151552,166363,149966,220793)
# The sensors located in Albany County.
sensor_indexes.not <- setdiff(sensor_indexes, sensor_indexes.alb)
# The rest of the sensors.

# NOTE FOR MYSELF: Sensor 188595 did not capture relative humidity data.

# Converts sensor indexes from numeric to character.
sensor_indexes <- as.character(sensor_indexes)
sensor_indexes.alb <- as.character(sensor_indexes.alb)
sensor_indexes.not <- as.character(sensor_indexes.not)

# for loop start: this code is run for each index in sensor_indexes, and generates
# a new .csv file, stored in the Working Directory, tracking Daily AQI per sensor
# by the EPA's standards, applying the EPA's corrective function for PurpleAir 
# sensors.

for(i in 1:length(sensor_indexes)){
  index <- sensor_indexes[i]
  filename <- (paste(index, "2024-12-28 2025-01-28 60-Minute Average.csv", sep = " "))
  
  sensor_df <- read.csv(filename)
  
  # Checks if relative humidity was recorded - if not, value replaced with 0.
  # A longer explanation for why this is an acceptable estimate is available
  # by phone at 256-509-4140.
  
  for(i in 1:length(sensor_df$humidity)){
    if(is.na(sensor_df$humidity[i])){
      sensor_df$humidity[i] <- 0
    }
  }
  
  # By the EPA's standards for correcting PM2.5 measured by PurpleAir's sensors,
  # take the maximum of PM2.5_cf_1_a and PM2.5_cf_1_b
  
  cf_1 <- data.frame(sensor_df$pm2.5_cf_1_a, sensor_df$pm2.5_cf_1_b)
  cf_1$max <- apply(cf_1, 1, max, na.rm = TRUE)
  
  # Create a new dataframe with all relevant information to apply the EPA's
  # corrective function
  
  sensor_df.stripped <- data.frame(sensor_df$time_stamp, sensor_df$humidity,
                                   cf_1$max)
  # Correct PM2.5 values
  
  PM2.5_correct <- c()
  
  for(i in 1:nrow(sensor_df.stripped)){
    pm <- sensor_df.stripped$cf_1.max[i]
    rh <- sensor_df.stripped$sensor_df.humidity[i]
    if(pm <= 343){
      x <- 0.524 * pm - 0.0862 * rh + 5.75
    }
    else{
      x <- 0.460393 * pm + 2.91
    }
    
    if(x <= 0){
      x <- 0
    }
    
    PM2.5_correct <- append(PM2.5_correct, x)
  }
  
  sensor_df.stripped$PM2.5 <- PM2.5_correct
  
  # Sort the not-day data into days - this works IF YOU DON'T TOUCH THE RAW CSV
  # Seriously. Don't touch it. Or, do, but fixing the rest of the code to 
  # accommodate your mistake is left as an exercise for the reader.
  
  TS_days <- c(as.character(sensor_df.stripped$sensor_df.time_stamp))
  TS_days <- substr(TS_days, start = 1, stop = 10)
  sensor_df.stripped$TS_days <- ymd(TS_days)
  
  # These next steps group the data by day and find the daily maximum value of
  # PM2.5 - the value the EPA uses to calculate the Air Quality Index (AQI)
  # You may notice I take an extra step. I can't tell you why, but the script
  # breaks if I don't. Correcting this is left as an exercise for the reader.
  
  sensor_df.stripped.grp <- sensor_df.stripped %>%
    group_by(sensor_df.stripped$TS_days)
  
  daily_max_sensor_df <- data.frame(sensor_df.stripped.grp %>%
    summarise(max = max(PM2.5)))
  
  # Calculating and storing AQI - referencing the EPA's technical guide, which 
  # I'll link later.
  
  AQI <- c()
  AQI_cats <- c()
  
  # Start of another goddamn for loop
  
  for(i in 1:nrow(daily_max_sensor_df)){
    x <- daily_max_sensor_df$max[i]
    
    if(0 <= x & x <= 9.0){
      y <- ((50 - 0)/(9.0-0.0))*(x - 0.0) + 0
    }
    else{
      if(9.1 <= x & x <= 35.4){
        y <- ((100 - 51)/(35.4 - 9.1))*(x - 9.1) + 51
      }
      else{
        if(35.5 <= x & x <= 55.4){
          y <- ((150 - 101)/(55.4 - 35.5))*(x - 35.5) + 101
        }
        else{
          if(55.5 <= x & x <= 125.4){
            y <- ((200 - 151)/(125.4 - 55.5))*(x - 55.5) + 151
          }
          else{
            if(125.5 <= x & x <= 225.4){
              y <- ((300 - 201)/(225.4 - 125.5))*(x - 125.5) + 201
            }
            # The EPA's technical assistance document for calculating AQI
            # gets a little hairy around AQIs of 500+. But if we're there
            # already then we all have much bigger problems.
            else{
              if(x < 0){
                y <- 0
              }
              else{
                y <- ((500-301)/(325.4 - 225.5))*(x - 225.5) + 301
              }
            }
          }
        }
      }
    }
    y <- round(y)
    AQI <- append(AQI, y)
    
  }
  
  # And, then, another for loop to track the categories the EPA has assigned to
  # a given AQI.
  
  for(i in 1:length(AQI)){
    x <- AQI[i]
    if(0 <= x & x <= 50){
      y <- "Good"
    }
    else{
      if(51 <= x & x <= 100){
        y <- "Moderate"
      }
      else{
        if(101 <= x & x <= 150){
          y <- "Unhealthy for Sensitive Groups"
        }
        else{
          if(151 <= x & x <= 200){
            y <- "Unhealthy"
          }
          else{
            if(201 <= x & x <= 300){
              y <- "Very unhealthy"
            }
            else{
              if(301 <= x){
                y <- "Hazardous"
              }
              else{
                y <- "ERROR"
              }
            }
          }
        }
      }
    }
    AQI_cats <- append(AQI_cats, y)
  }
  
  # Generate a data frame and write it to a unique .csv, to avoid losing work.
  # To my (limited) knowledge, this loop will overwrite the dataframe each turn.
  # So, I'm giving this method a shot. Computational efficiency is for chumps.
  
  # The new .csv's will be stored in the Working Directory. Please DO NOT
  # change the working directory mid-script [i.e. by running portions of the
  # script and switching in between.] I did not and will not plan for this.
  
  sensor_AQI <- data.frame(daily_max_sensor_df$sensor_df.stripped.TS_days, AQI,
                           AQI_cats)
  names(sensor_AQI) <- c("Date", "AQI", "Category")
  
  write.csv(sensor_AQI, file = (paste(index, "Daily AQI 12-28-2025-01-28.csv", 
                                      sep = " ")))
}

# The next big project I have in mind for myself is graph generation that isn't
# hardcoded. But that's for another night, and I'm cutting it off here. 
# Last updated 1/29/25.
