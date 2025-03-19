Read through [PurpleAirGuide.md](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/carsen-c/user-guides/PurpleAirGuide.md) first.

This is a guide to using [AQI Calc.R](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/carsen-c/Scripts/AQI%20Calc.R)

## Understanding the data pulled

This user guide assumes you have downloaded data from PurpleAir. Much of learning how to use AQI Calc.R involves practicing with it. So, if you haven't done so, please follow [PurpleAirGuide.md](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/carsen-c/user-guides/PurpleAirGuide.md) and download some data to practice with.

[Sample data](https://github.com/mediasanctuary/air-justice-lab/tree/AJL-Spring-2025/AJL2025/carsen-c/sample-data) is available as well, but I sincerely encourage trying to pull data yourself.

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

![New RStudio](/AJL2025/assets/Rblank.PNG)

To create a new file, click "File" > "New file" > "R Script"

![New R script pathway](/AJL2025/assets/newfile.png)

To open an existing file - like AQL Calc.R - click "Open File..." and find "AQL Calc.R"

![Open existing file](/AJL2025/assets/openfile.png)

### III. Using AQI Calc.R - step by step

The very first step is to download [AQI Calc.R](https://github.com/mediasanctuary/air-justice-lab/blob/AJL-Spring-2025/AJL2025/carsen-c/Scripts/AQI%20Calc.R)

Once you have this, open AQI Calc.R in RStudio. It should look something like this:

![AQI Calculator script first several lines](/AJL2025/assets/aqicalcsc.PNG)

#### a. Setting up the working directory

If you didn't edit or otherwise mess with your batch download from PurpleAir, there is a perfectly good folder on your computer to set as the working directory. Its name will be in the format of: "PurpleAir Download [Date of Download]"

For example, my folder is named "PurpleAir Download 1-28-2025," and is located at "C:\Users\[redacted]\Downloads\Purp\PurpleAir Download 1-28-2025"

To set the working directory, click "Session" > "Set Working Directory" > "Choose working directory"

![Setting the working directory](/AJL2025/assets/workingdirectory.png)

Make sure your working directory is as specific as possible and down to the most specific subfolder - that is, you can see every file from PurpleAir like this:

![Subfolder with all PurpleAir data](/AJL2025/assets/directory.PNG)

Now, you're ready to start running code.

#### b. Libraries

A library in R stores a bunch of functions written in R that you can call to make a lot of stuff easier. Without these pre-loaded functions, you'd have to write the functions yourself. 

AQI Calc.R depends on a few libraries - therefore, the first five lines must be run before you do anything else.

Highlight the first five lines, and click "Run."

![Running libraries](/AJL2025/assets/runlibraries.png)

#### c. Sensor indices and sorting sensors
The sensor index is a number that identifies a specific PurpleAir sensor. These indices are written into the names of data pulled from specific sensors automatically.

To look at specific sensors, a list of the indices can be kept. The indices of sensors affiliated with the Air Justice Lab are: '188595,220769,220793,164327,156051,166257,87173,149970,149966, 166363,151552,166677,166327,166653,151490,151536,166717,156171,156199,164351,166471'

For your specific uses, make sure to list your or your organization's target sensors. Subsets of your sensors may also be useful to look at.

AQI Calc.R stores the sensor indexes as a vector of numeric objects. Make sure that the blue numbers are a list of the specific indices you want to look at; AQI Calc.R comes pre-loaded with the Air Justice Lab's sensors.

This vector is subdivided into two smaller vectors, as AQI Calc.R was initially written to compare the two groups. You may subset your indices however you want, or not at all.


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

