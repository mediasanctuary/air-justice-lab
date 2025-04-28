# Air Justice Lab
Air Justice Lab is a community air monitoring and educational initiative based at NATURE Lab and serving the greater Capital Region.

This branch is home to our most recent code base (Spring 2025) - scripts for analyzing and visualizing data are stored here, as well as raw data pulls from [PurpleAir](https://www2.purpleair.com/) and climatological reports from the [Albany, NY NWS Station](https://www.weather.gov/aly/climate)

As of 4/28/25, the current workflow is such that AJL manually pulls data from PurpleAir, and that externally-sourced data is recorded by hand.

PurpleAir’s sensors measure one of six types of air pollution recognized by the Environmental Protection Agency called particulate matter (PM). All sizes of PM inhalants are linked to harmful health outcomes, and especially so for vulnerable groups such as children, the elderly, and ill and disabled folks. The Air Justice Lab, in particular, monitors PM2.5 - particulate matter with a diameter of 2.5 micrometers and smaller - as it relates to the EPA’s Air Quality Index (AQI).

## Dependencies
[PurpleAir API](https://develop.purpleair.com/dashboards/keys)

[RStudio](https://posit.co/downloads/)

## Important things to read

### PurpleAir and Sensor Error
PurpleAir's relatively inexpensive air quality monitors make environmental activism accessible to citizen scientists. However, the methodology of measuring concentration of particulate matter leads to some significant but consistent error. The sensors are optically-based - that is, they [use lasers to count particles in the air](https://www2.purpleair.com/pages/technology) - and readings are affected by climate.

The Environmental Protection Agency (EPA) has modeled corrective functions that process and clean raw data from PurpleAir. The full papers are available within the [assets folder](https://github.com/mediasanctuary/air-justice-lab/tree/AJL-Spring-2025/AJL2025/assets).

The Air Justice Lab has also developed a localized corrective function, based on the EPA's recommendations, that can be used when PurpleAir sensors fail to record climatological data. The AJL's corrective function is specific to the Capitol Region, but the method it was built with may be applicable to any persons or organizations with access to data from a local weather station.

### Interpreting and Analyzing Data from PurpleAir
PurpleAir's [interactive map](https://map.purpleair.com/air-quality-standards-us-epa-aqi?opt=%2F1%2Flp%2Fa10%2Fp604800%2FcC0#2.09/47.3/-65.83) automatically uses their readings of PM2.5 and calculates the corresponding AQI. However, when pulling sets of data, there isn't a built-in calculator.

The Air Justice Lab therefore has written scripts that calculate AQI. The [Technical Assistance Document](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/assets/AQI-Technical-Assistance-Document.pdf) published by the EPA shows this process in detail.

## Getting Started
As of 3/12/2025, each intern and their scripts are available in this branch. Therefore, the reader is free to peruse the different methods and problem-solving, and choose to use and follow what they wish. 

Note that the user guides for one script will not apply to the others.
