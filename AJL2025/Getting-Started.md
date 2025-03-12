This branch is home to our most recent code base (Spring 2025) - scripts for analyzing and visualizing data are stored here, as well as raw data pulls from [PurpleAir](https://www2.purpleair.com/).

For now, everyone working on this has their own separate folder for however they wish to share and explain their work. Eventually, we'll want to consolidate this, but the priority is getting it out there and recorded. Feel free to edit and reorganize however its best, we can focus on formatting everything later.

# Air Justice Lab
Air Justice Lab is a community air monitoring and educational initiative based at NATURE Lab and serving the greater Capital Region.

This branch is home to our most recent code base (Spring 2025) - scripts for analyzing and visualizing data are stored here, as well as raw data pulls from [PurpleAir](https://www2.purpleair.com/).

PurpleAir’s sensors measure one of six types of air pollution recognized by the Environmental Protection Agency (as of December 2024) called particulate matter (PM). All sizes of PM inhalants are linked to harmful health outcomes, and especially so for vulnerable groups such as children, the elderly, and ill and disabled folks. The Air Justice Lab, in particular, monitors PM2.5 - particulate matter with a diameter of 2.5 micrometers and smaller - as it relates to the EPA’s Air Quality Index (AQI).

## Dependencies
[PurpleAir API Key](https://develop.purpleair.com/dashboards/keys)

[RStudio)(https://posit.co/downloads/)

## Important things to read

### PurpleAir and Sensor Error
PurpleAir's relatively inexpensive air quality monitors make environmental activism accessible to citizen scientists. However, the methodology of measuring concentration of particulate matter leads to some significant but consistent error. The sensors are optically-based - that is, they [use lasers to count particles in the air](https://www2.purpleair.com/pages/technology) - and readings are affected by weather and climate.

The Environmental Protection Agency (EPA) has created and updated corrective functions that process and clean raw data from PurpleAir. The full papers are available within the [assets folder](https://github.com/mediasanctuary/air-justice-lab/tree/AJL-Spring-2025/AJL2025/assets).

The Air Justice Lab is also working on and testing their own corrective function. The EPA's function will be used for analysis - this side project is being worked on in order to increase understanding over how the EPA's functions were built.

### Interpreting and Analyzing Data from PurpleAir
PurpleAir's [interactive map](https://map.purpleair.com/air-quality-standards-us-epa-aqi?opt=%2F1%2Flp%2Fa10%2Fp604800%2FcC0#2.09/47.3/-65.83) automatically uses their readings of PM2.5 and calculates the corresponding AQI. However, when pulling sets of data, there isn't a built-in calculator.

The Air Justice Lab therefore has written scripts that calculate AQI. The [Technical Assistance Document](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/assets/AQI-Technical-Assistance-Document.pdf) published by the EPA shows this process in detail.
