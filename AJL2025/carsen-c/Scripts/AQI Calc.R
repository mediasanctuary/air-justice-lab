library(tidyverse)

# Last updated 4/28/25.

# Setup:
# Run line 1
# Set Working Directory to folder with all needed .csv's:
# PurpleAir data pulls
# External climatological reports - if necessary

# Check for standard name formatting for each file - if you pull unaltered from 
# PurpleAir, you should be good.

# Create a vector of all sensor indexes, as well as any sub-vectors for
# desired subgroups.

# This script is written with the sensor indexes corresponding to sensors affiliated
# with the Air Justice Lab (Sanctuary for Independent Media). These values should
# be replaced with the indexes of sensors the user wishes to analyze.

sensor_indexes <- c(220769,220793,164327,156051,166257,87173,149970,149966,
                    166363,151552,166677,166327,166653,151490,151536,166717,156171,
                    156199,164351,166471)

sensor_indexes <- as.character(sensor_indexes)
# Converts each member of sensor_indexes to a character string, in order to read
# file names in the Working Directory.

name_end <- "2025-04-01 2025-04-28 60-Minute Average.csv"
# This is a specific string corresponding to the end of every file name, when 
# left in the format PurpleAir's download tool applies.
# Replace with the string specific to the user's data pull


# Some PurpleAir sensors fail to record climatological data such as temperature
# and relative humidity. Supplemental data may be taken from external sources

# The Albany, NY NWS Station supplied a monthly average relative humidity
# from April 2024 to March 2025, as well as daily average relative humidity for the
# month of April.

# Users of this script may use the National Weather Service's website to pull
# climatological data from a NWS station in the region they are monitoring, or
# may contact a local station directly to request data. Or a secret third thing.

# External relative humidity data is used when PurpleAir's sensors fail to record 
# relative humidity. For Albany, NY, during April 2025, the
# average relative humidity was:

avg_RH <- 61.2

# with a standard deviation of:

stdv_RH <- 11.4

# These values should be adjusted for the date and location of the specific sensors
# the user wishes to analyze.



# This for loop iterates through each index in sensor_indexes, applies the EPA's
# corrective function, and calculates the Daily Air Quality Index (AQI). A
# complete explanation of why this is needed is available on the Air Justice Lab's
# GitHub page.

for(i in 1:length(sensor_indexes)){
  index <- sensor_indexes[i]
  filename <- (paste(index, name_end, sep = " "))
  
  sensor_df <- read.csv(filename)
  
  
  for(i in 1:length(sensor_df$humidity)){
    if(is.na(sensor_df$humidity[i])){
      sensor_df$humidity[i] <- avg_RH
    }
  }
  # Checks if relative humidity was recorded - if not, value replaced with the
  # average relative humidity.
  # This value for this instance is the average taken over the month of April,
  # reported by the Albany, NY NWS Station. A complete explanation for why any
  # particular value is used is available on the AJL's GitHub.
  
  cf_1 <- data.frame(sensor_df$pm2.5_cf_1_a, sensor_df$pm2.5_cf_1_b)
  cf_1$max <- apply(cf_1, 1, max, na.rm = TRUE)
  # By the EPA's standards for correcting PM2.5 measured by PurpleAir's sensors,
  # takes the maximum of PM2.5_cf_1_a and PM2.5_cf_1_b
  
  
  sensor_df.stripped <- data.frame(sensor_df$time_stamp, sensor_df$humidity,
                                   cf_1$max)
  # Create a new dataframe with all relevant information to apply the EPA's
  # corrective function
  
  
  PM2.5_correct <- c()
  # Correct PM2.5 values
  
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
  
  
  TS_days <- c(as.character(sensor_df.stripped$sensor_df.time_stamp))
  TS_days <- substr(TS_days, start = 1, stop = 10)
  sensor_df.stripped$TS_days <- ymd(TS_days)
  # Sorts the not-day data into days - this works IF YOU DON'T TOUCH THE RAW CSV
  # Seriously. Don't touch it.
  
  # These next steps group the data by day and find the daily maximum value of
  # PM2.5 - the value the EPA uses to calculate the Air Quality Index (AQI)
  # You may notice I take an extra step. I can't tell you why, but the script
  # breaks if I don't. Correcting this is left as an exercise for the reader.
  
  sensor_df.stripped.grp <- sensor_df.stripped %>%
    group_by(sensor_df.stripped$TS_days)
  
  daily_max_sensor_df <- data.frame(sensor_df.stripped.grp %>%
                                      summarise(max = max(PM2.5)))
  
  
  
  AQI <- c()
  AQI_cats <- c()
  # Calculates and stores AQI - referencing the EPA's technical guide. A copy
  # and link is available on the Sanctuary's GitHub.
  
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
  
 
  
  
  
  sensor_AQI <- data.frame(daily_max_sensor_df$sensor_df.stripped.TS_days, AQI,
                           AQI_cats)
  names(sensor_AQI) <- c("Date", "AQI", "Category")
  
  write.csv(sensor_AQI, file = (paste(index, "Daily AQI 12-28-2025-01-28.csv", 
                                      sep = " ")))
  # Generates a data frame and writes it to a unique .csv.
  # The new .csv's will be stored in the Working Directory. Please DO NOT
  # change the working directory mid-script [i.e. by running portions of the
  # script and switching in between.] I did not and will not plan for this.
  
}


