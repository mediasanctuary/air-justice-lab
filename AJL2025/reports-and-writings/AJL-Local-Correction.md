# A Localized Corrective Function

## 1.0 Limitations of PurpleAir Sensors

### Inaccuracy of measurements

A detailed report is available [here](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/reports-and-writings/Corrective-Functions.md)

### Failure to record climatological data

Quoth the above link: 

Some PurpleAir sensors experience performance issues, such as a failure to measure relative humidity. The EPA recommends building a localized model: a linear regression in PM2.5 that uses averaged or instantaneous relative humidity data in the geographical region.

Building a local corrective function is no more resource-intensive than the Air Justice Lab’s current operations, as data already pulled can be used to find the average relative humidity in any region the AJL wishes to examine. Further study into weather patterns - specifically relative humidity - in Albany County, Rensselaer County, and surrounding areas can clarify the time period over which relative humidity should be averaged.

Upon averaging relative humidity in the area, this value can be inserted into datasets where relative humidity was not recorded. From there, the multilinear corrective function can be applied: since, in this specific circumstance, relative humidity is held as a constant, the function becomes a linear regression.

Where possible, the EPA’s multilinear corrective function should be applied. The localized linear regression should only be used if relative humidity is not recorded by PurpleAir sensors.


## External Sources of Data

### Available resources

[Albany, NY NWS Station](https://www.weather.gov/aly)

[Albany, NY Climate Data](https://www.weather.gov/aly/climate)

[Northeast Regional Climate Center](https://www.nrcc.cornell.edu/)

### The issue of historical data

The AJL is awaiting a response from the NRCC after requesting daily climate data for the past year; until then, the AJL has access to the [monthly](https://forecast.weather.gov/product.php?site=NWS&product=CLM&issuedby=ALB) reports spanning the past 12 months and the [daily](https://forecast.weather.gov/product.php?site=NWS&product=CLI&issuedby=ALB) reports spanning the past month. 

The AJL is tracking [relevant climate data](https://docs.google.com/spreadsheets/d/1XaP1y6_JKlXmWJ_GM6xlKWWmWB0-UERUWIhiibs8GAI/edit?usp=sharing) as well, sourced from the Albany, NY NWS station.

## So, How Are We Calculating This, Anyway?

### Means and Standard Deviations

#### Monthly Mean and Stdev - April

From 04/03/2025 - 04/27-2025, the mean relative humidity using daily averages recorded by the Albany, NY NWS Station was 61.2, with a standard deviation of 11.4. When this value is inserted into the RH term of the corrective function - that is, 0.086RH - the mean of 0.086RH becomes 5.3 with a standard deviation of 0.98. This is comparatively small variance to the corrected PM2.5 values, and therefore the AJL may use the mean relative humidity of April in the corrective function when relative humidity is not recorded by PurpleAir sensors.

#### Yearly Mean and Stdev - April 2024 - March 2025

From April 2024 - March 2025, the mean relative humidity recorded using monthly averages by the Albany, NY NWS Station was 65.6, with a standard deviation of 3.9. This comparitively small variance suggests that, for situations where relative humidity is not recorded by PurpleAir sensors, where monthly averages are not available, or where multiple months of data are being corrected at once, the yearly mean relative humidity can also reliably be used in the corrective function.

Where possible, data from PurpleAir sensors should be used first, and monthly averages second. The yearly mean's availability is also important, though, when other options fail.

The AJL will continue to record daily climatological data provided by the NWS in hopes of refining the localized corrective function.
