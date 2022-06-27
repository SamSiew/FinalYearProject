const { readFile, writeFile } = require('fs/promises')
const path = require('path')
const { sql } = require('../database')

/* This file populates the database with weather data */

const measurementName = {
    rain: 'Rainfall',
    temperature: 'Temperature',
    relativeHumidity: 'Relative Humidity',
    windSpeed: 'Wind Speed'
}

const weatherDataDir = path.join(__dirname, '../raw_data/weather/vic')

async function getRowsFromCSV(filePath, {startRow=0, endRow=undefined} = {startRow:0, endRow:undefined}) {
    try {
        const buffer = await readFile(filePath)
        const rows = buffer.toString()
                        .split('\n')
                        .slice(startRow, endRow)
                        .map(row => row.split(','))
        return rows
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`File with path: ${filePath} does not exist!`)
            // If file does not exist, then just return empty array
            return []
        } else {
            throw err
        }
    }
    
}

async function getDesignatedWeatherStations() {
    const designatedStations = await sql`
        select 
            lga.location_id as "lgaLocationId",
            lga.designated_weather_station as "stationLocationId",
            l."name" as "stationName"
        from local_government_area lga join location l 
            on lga.designated_weather_station = l.location_id;
    `
    return designatedStations
}

async function getWeatherDataFromFile(filePath) {
    const rows = await getRowsFromCSV(filePath, {
        startRow: 13,   // removed headers
        endRow: -1      // remove totals
    })
    const measurements = rows.map(row => {
        const [
            stationName,
            date,
            evapoTranspiration,
            rain,
            panEvaporation,
            maxTemp,
            minTemp,
            maxRelativeHumidity,
            minRelativeHumidity,
            avgWindSpeed,
            solarRaditaion
        ] = row
        
        // Convert date to ISO format
        let dateISO = date.split('/')
        const [day, month, year] = dateISO
        dateISO = `${year}-${month}-${day}`

        return {
            stationName,
            date: dateISO,
            rain: {
                accumulatedValue: rain,
                units: 'mm',
                measurementName: measurementName.rain
            }, 
            temperature: {
                maxValue: maxTemp,
                minValue: minTemp,
                units: '°C',
                measurementName: measurementName.temperature
            },
            relativeHumidity: {
                maxValue: maxRelativeHumidity,
                minValue: minRelativeHumidity,
                units: '%',
                measurementName: measurementName.relativeHumidity
            },
            windSpeed: {
                avgValue: (avgWindSpeed * 3.6).toFixed(2),       // convert to km/hr
                units: 'km/hr',
                measurementName: measurementName.windSpeed
            }

        }
    })

    return measurements
}

function generateDateRange(from, to) {
    const fromDate = new Date(from.getTime())
    const toDate = new Date(to.getTime())

    if (toDate < fromDate) {
        throw new Error('Start date cannot be greater than end date')
    }
    const dateRange = []

    while (fromDate.getFullYear() <= toDate.getFullYear() && fromDate.getMonth() <= toDate.getMonth()) {
        const year = fromDate.getFullYear().toString()
        let month = (fromDate.getMonth() + 1).toString().padStart(2, '0')
        
        dateRange.push(`${year}${month}`)

        fromDate.setMonth(fromDate.getMonth() + 1)
    }
    
    return dateRange
}

async function getWeatherDataFor({
    stationName,
    from,  // starting year and month
    to     // ending year and month
}) {

    const fileStationName = stationName.replace(/\s/g, '_').toLowerCase()
    const filePath = path.join(weatherDataDir, fileStationName)

    const measurements = []

    for (let date of generateDateRange(from, to)) {
        const weatherData = await getWeatherDataFromFile(
            path.join(filePath, `${fileStationName}-${date}.csv`)
        )

        for (let row of weatherData) {
            measurements.push(row)
        }
    }
    return measurements
}

async function writeMeasurementToDatabase({
    lgaLocationId,
    stationLocationId,
    date,
    maxValue,
    minValue,
    avgValue,
    accumulatedValue,
    units,
    measurementName
}) {
    const startTimestamp = `${date} 00:00 Australia/Melbourne`
    const endTimestamp = `${date} 11:59 Australia/Melbourne`
    maxValue = Number.isNaN(Number.parseFloat(maxValue)) ? null : maxValue
    minValue = Number.isNaN(Number.parseFloat(minValue)) ? null : minValue
    avgValue = Number.isNaN(Number.parseFloat(avgValue)) ? null : avgValue
    accumulatedValue = Number.isNaN(Number.parseFloat(accumulatedValue)) ? null : accumulatedValue

    try {
        await sql`
            with measurement_insert as (
                insert into measurement_record (
                    measurement_id, 
                    start_timestamp, 
                    end_timestamp, 
                    duration,
                    is_predicted
                )
                values (
                    (select measurement_id from measurement where name = ${measurementName}),
                    ${startTimestamp},
                    ${endTimestamp},
                    interval '1 day',
                    false
                )
                returning *
            ),
            weather_insert as (
                insert into weather_record (
                    measurement_record_id,
                    units,
                    station_id,
                    min_value,
                    max_value,
                    avg_value,
                    accumulated_value
                )
                values (
                    (select measurement_record_id from measurement_insert),
                    ${units},
                    ${stationLocationId},
                    ${minValue},
                    ${maxValue},
                    ${avgValue},
                    ${accumulatedValue}
                ) on conflict do nothing
            )
            insert into record_location (measurement_record_id, location_id)
                    values((select measurement_record_id from measurement_insert), ${lgaLocationId});

        `
    } catch (err) {
        if (err.constraint_name !== 'weather_record_check') {
            throw err
        }
    }
}

async function populateWeatherData(fromDate, toDate) {
    const designatedStations = await getDesignatedWeatherStations()

    for (let {lgaLocationId, stationLocationId, stationName} of designatedStations) {
        const weatherData = await getWeatherDataFor({
            stationName,
            from: fromDate,
            to: toDate
        })

        for (let row of weatherData) {
            const measurementsToAdd = ['rain', 'temperature', 'relativeHumidity', 'windSpeed']

            for (let measurement of measurementsToAdd) {
                await writeMeasurementToDatabase({
                    lgaLocationId,
                    stationLocationId,
                    date: row.date,
                    maxValue: row[measurement].maxValue,
                    minValue: row[measurement].minValue,
                    avgValue: row[measurement].avgValue,
                    accumulatedValue: row[measurement].accumulatedValue,
                    units: row[measurement].units,
                    measurementName: row[measurement].measurementName
                })
            }
        }
    }
}

const from = new Date('2017-01')
const to = new Date('2019-12')
populateWeatherData(from, to)
    .catch(err => console.log(err))
    .finally(_ => sql.end({timeout: null}))
    .then(_ => console.log('Done!'))


