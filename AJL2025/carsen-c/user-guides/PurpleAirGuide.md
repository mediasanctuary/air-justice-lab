# A Guide to Working With PurpleAir 
This is a step-by-step guide for anyone who would like to integrate data from PurpleAir sensors into their community science and environmental activism.

## Reading Data from PurpleAir's Sensors
### I. Creating API Keys

Each PurpleAir user must create their own API keys in order to interact with any of its sensors meaningfully. An API basically lets your computer contact and interact with PurpleAir’s computers and scripts, so you can read (look at data from any sensor operated by PurpleAir) and write (have your computer perform specific interactions with PurpleAir sensors) without having to physically download data from a sensor.

#### A. Creating an account
Create an account through PurpleAir. Each account comes with a number of “points,” which allow you to pull some amount of data for free. 

It’s most efficient to make one large pull and then clean up and analyze it in other software.

#### B. Creating API Keys
Go to the [developer page:](https://develop.purpleair.com/dashboards/organization)

##### i. Create or rename a project. All new users start with a project ready; I renamed mine to “AJL - Carsen”

##### ii. Generate an API key by clicking on the purple button that says “ + API key.” You’ll want two: one of the type “Read” and one of the type “Write.”

This is toggleable. You also want to make sure the keys are “Enabled” and may label them however it helps you

### II. Getting data

Without access to the sensor IDs directly, I used [PurpleAir’s map](https://map.purpleair.com/air-quality-standards-us-epa-aqi?opt=%2F1%2Flp%2Fa10%2Fp2592000%2FcC5#12.63/42.7203/-73.6788) and cross-referenced the sensor indexes with the [Sanctuary’s sensor database.](https://docs.google.com/spreadsheets/d/1wBSrNwCtetKQs3XNUZnrLjtH0rG9Gr9igFVqSLAeTWA/edit?usp=sharing)- last checked, 1/28/25.

You can pull data from any sensor on the map with its sensor index. [PurpleAir explains it better than me](https://community.purpleair.com/t/sensor-indexes-and-read-keys/4000)

#### a. [Using PurpleAir’s API](https://api.purpleair.com/#api-groups-create-group) - pulls real-time data, may be more intuitive for folks used to working with similar APIs; cannot download batch data of multiple sensors.

#### b. [Using PurpleAir’s downloading tool](https://community.purpleair.com/t/setting-up-the-purpleair-data-download-tool/4999) - quicker, can download batch data, more intuitive for folks less familiar with computer programming; takes more time to set up

Setting up the download tool is like setting up any application. Your computer’s antivirus software may flag it as a suspicious download. If you use the link provided in this document, it is safe to override this. 

If you feel distrustful of the downloading tool, working with the API is just as effective.

#### c. Choosing parameters.

I referenced the EPA’s [technical assistance document](https://www.airnow.gov/publications/air-quality-index/technical-assistance-document-for-reporting-the-daily-aqi/) for the reporting of air quality and the [correction of PurpleAir PM2.5 measurements](https://www.epa.gov/sites/default/files/2021-05/documents/toolsresourceswebinar_purpleairsmoke_210519b.pdf). If these links are no longer active, PDFs are available [here](https://drive.google.com/drive/folders/1S2HjGhb5oyVl8R_TG8TtTs8-P0C4Hb2Y?usp=sharing)

In summary - the necessary parameters to examine, for accurate reporting of the daily air quality index, AQI, using PurpleAir sensors, are:
- humidity (reported as: relative humidity, expressed as a percentage)
- pm2.5 cf_1_a
- pm2.5 cf_1_b

AQI is calculated using the maximum PM2.5 reading of the day - it is therefore prudent to take averages along an hourly interval or less (e.g. 10 minutes)

Download as a .csv
