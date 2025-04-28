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

## So, How Are We Calculating This, Anyway?
