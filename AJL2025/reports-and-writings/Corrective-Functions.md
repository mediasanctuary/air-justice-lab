# Correcting PurpleAir's Data

## 1.0 - Summary

PurpleAir sensors, when compared to regulatory instruments - that is, air quality measurement instruments that meet federal requirements for precision and accuracy - inaccurately report the presence of PM2.5 in both ambient and smoke-impacted conditions. 

## 1.1 - PurpleAir’s Limitations
### The Optical Sensor
PurpleAir sensors are optical sensors. Optical sensors calculate PM2.5 concentrations using 90-degree light scattering. The measured intensity can be used to determine the average molecular weight of large molecules, like those which make up PM2.5. All optical sensors have issues with accuracy, because there are many factors that affect the optical-mass relationship, including high humidity, smoke, and temperature fluctuations.

# Corrective Functions
## 2.0 - Correcting All PurpleAir Data
### Feasibility
PurpleAir’s sensors have been shown to be precise: different sensors in the same environment will all produce similar readings. Therefore, it is possible to develop a corrective function that applies to all data pulled from any sensor across the U.S.

### Methodology
The EPA considered several mathematical models and focused on two structures: a linear regression (that is, the corrective function depends solely on PM2.5 measurements), and a multilinear model (the corrective function depends on both PM2.5 measurements and relative humidity measurements.)

The multilinear corrective function is the most applicable to the Air Justice Lab’s goals, and is the function the EPA recommends for most operations. The EPA acknowledges that a localized corrective function - that is, one that responds to the specific regional climate’s effects on optical sensors - can be useful.

### Local Corrections
Some PurpleAir sensors experience performance issues, such as a failure to measure relative humidity. The EPA recommends building a localized model: a linear regression in PM2.5 that uses averaged or instantaneous relative humidity data in the geographical region.

Building a local corrective function is no more resource-intensive than the Air Justice Lab’s current operations, as data already pulled can be used to find the average relative humidity in any region the AJL wishes to examine. Further study into weather patterns - specifically relative humidity - in Albany County, Rensselaer County, and surrounding areas can clarify the time period over which relative humidity should be averaged.

Upon averaging relative humidity in the area, this value can be inserted into datasets where relative humidity was not recorded. From there, the multilinear corrective function can be applied: since, in this specific circumstance, relative humidity is held as a constant, the function becomes a linear regression.

Where possible, the EPA’s multilinear corrective function should be applied. The localized linear regression should only be used if relative humidity is not recorded by PurpleAir sensors.

## 2.1 - Corrective Functions
### Ambient Air Quality (that is, smokeless)
If PAcf_1  <= 343:

PM2.5 = 0.524PAcf_1 - 0.0852*RH + 5.72

where PAcf_1 = the average of channels A and B

RH = relative humidity as a percent

### Ambient Air Quality - without relative humidity
If PAcf_1  <= 343:

PM2.5 = 0.524PAcf_1 - 0.0852*X + 5.72

where PAcf_1 = the average of channels A and B

X = the average local relative humidity calculated using weather data from other PurpleAir sensors

### Smoke Conditions
If PAcf_1  <= 343:

PM2.5 = 0.51PAcf_1 - 3.21

where PAcf_1 = the average of channels A and B

### Smoke Conditions - but much worse
If PAcf_1  is > 343:

PM2.5 = 0.46PAcf_1 + (3.93 * 10-4)(PAcf_1)2 + 2.97

where PAcf_1 = the average of channels A and B

## Source
[Development and Application of a United States wide correction for
PMdata collected with the PurpleAir sensor](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/assets/amt-2020-413.pdf)
