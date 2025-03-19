Read through [PurpleAirGuide.md](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/carsen-c/user-guides/PurpleAirGuide.md) first.

This is a guide to using [AQI Calc.R](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/carsen-c/Scripts/AQI%20Calc.R)

## Understanding the data pulled

**DON’T TOUCH THE .CSV**

Downloading the data directly from PurpleAir records each measurement as a specific type of object. My code relies on preserving these object types.

- For example, `59.08` is a number. `“Hazardous”` is a string. `12-28-2024` is a date.

**“Wait, but some of the sensors didn’t record humidity”**

Yeah, that happens. I'm refining and testing a mathematical model for a corrective function linear in PM2.5 - that is, the measurement of particulate matter with a diameter of 2.5 micrometers and smaller. The current model is located within the script - last updated 1/28/25.

My script accounts for missing values.

**Organizing the raw data.**

Downloading the data directly from PurpleAir leaves the names of the files in a standardized format, as well. Keeping these files together in the same folder, and keeping their names, will make following this guide much easier.

## Help! This is my first time working with R :(

### I. Installing R and RStudio
[RStudio Setup](https://posit.co/download/rstudio-desktop/) - I've also broken down the steps here for convenience.

#### a. Installing R
[R Archive Network](https://cran.rstudio.com/)

Choose your operating system from the provided list, and download the **base.**

#### b. Installing RStudio
Click on the big blue button under "2. Install RStudio." The default directories are sufficient for new users.

### II. Familiarizing yourself with RStudio
When you first open RStudio, it'll look something like this:

![New RStudio](/air-justice-lab/AJL2025/assets/Rblank.PNG)
### III. Using AQI Calc.R - step by step

#### a. Setting up the working directory

#### b. Libraries

#### c. Sensor indices and sorting sensors

#### d. Reading and writing files

### IV. "Wait, so what does this script actually *do?*"

## I know what I'm doing - just give me the basics.

### I. My algorithm.

An algorithm is kind of like an essay outline for solving a problem.

#### a. Reading the data
- Check to make sure all data pulls for each sensor are named in a standardized format (should be automatic, if you don’t touch the raw .csv files)
- Store a list of all sensor indexes
- Iterate through each file via sensor index.

#### b. Applying the corrective function (for each iteration)
- Over each timestamp, max(pm2.5_cf_1_a, pm2.5_cf_1_b) - find the maximum value between the two. Store this value as x.
- Store the corresponding humidity measurement as RH.
- If x <= (is less than or equal to) 343 micrograms per cubic meter: The corrected value = 0.52x - 0.086RH + 5.75
- Else: The corrected value = 0.460393x + 2.91

#### c. Calculating AQI (for each iteration)
- Find the daily maximum value of the corrected PM2.5 measurement
- It’s a bit of a beast of a function best not typed out here, but referencing the EPA's [technical assistance document](https://www.airnow.gov/publications/air-quality-index/technical-assistance-document-for-reporting-the-daily-aqi/) will give it to you
- Record corresponding risk category for each AQI

#### d. Writing the analyzed data (for each iteration)
Create a new .csv for each sensor recording daily timestamp, AQI, and risk category.

