const { readFile, writeFile } = require('fs/promises')
const path = require('path')
const { sql } = require('../database')

/* This file populates locations in the database
    It currently only populates select locations
*/

const statesFile = path.join(__dirname, '../raw_data/locations/VIC_simplified.geojson')
const lgaFile = path.join(__dirname, '../raw_data/locations/lga_cleaned_removed_unincorporated.geojson')
const stationsFile = path.join(__dirname, '../raw_data/locations/weather_stations.csv')
const closestStationsFile = path.join(__dirname, '../raw_data/locations/lga_closest_weather_stations.csv')

const locationType = {
    country: 'country',
    state: 'state',
    lga: 'local_government_area',
    weatherStation: 'weather_station'
}

// Populate countries
// currently only Australia
// code can be extended to include multiple countries
async function populateCountries() {
    const countries = [{
        name: 'Australia',
        abbreviation: 'AUS'
    }]

    const countryInserts = countries.map(country => {
        return sql`
            with u1 as (
                insert into location(name, description, location_type)
                values (${country.name}, ${country.description}, ${locationType.country})
                returning *
            )
            insert into ${sql(locationType.country)} (location_id, abbreviation)
            values ((select u1.location_id from u1), ${country.abbreviation})
        `
    })    
    await Promise.all(countryInserts)
}

// populate states
// currently only Victoria
async function populateStates() {
    const data = await readFile(statesFile)
    const states = JSON.parse(data)
    const coordinates = states.features[0].geometry.coordinates
    const polygon = coordinates[0].map(([lat, lng]) => `(${lat}, ${lng})`)
        .join(',')

    const victoria = {
        name: 'Victoria',
        abbreviation: 'VIC',
        countryAbrv: 'AUS',
        locationCoords: polygon
    }
    
    await sql`
            with u1 as (
                insert into location(name, location_coords, location_type)
                values (${victoria.name}, ${victoria.locationCoords}, ${locationType.state})
                returning *
            )
            insert into ${sql(locationType.state)} (location_id, abbreviation, country_id)
            values (
                (select u1.location_id from u1), 
                ${victoria.abbreviation},
                (select location_id from country where abbreviation = ${victoria.countryAbrv})
            )
        `
}

async function populateLGA() {
    const data = await readFile(lgaFile)
    const lgaData = JSON.parse(data)
    const LGAs = lgaData.features.map(feat => {
        return {
            name: feat.properties['VIC_LGA__2'],
            abbvName: feat.properties['VIC_LGA__3'],
            locationCoords: feat.geometry.coordinates[0][0].map(([lng, lat]) => `(${lat}, ${lng})`).join(',')
        }
    })

    for (let lga of LGAs) {
        await sql`
            with u1 as (
                insert into location(name, location_coords, location_type)
                values (${lga.name}, ${lga.locationCoords}, ${locationType.lga})
                returning *
            )
            insert into ${sql(locationType.lga)} (location_id, abbv_name, state_id)
            values (
                (select u1.location_id from u1), 
                ${lga.abbvName},
                (select location_id from location where name = 'Victoria' )
            );
        `
    }
}

async function populationWeatherStations() {
    
    const data = await readFile(stationsFile)
    const stations = data.toString()
                         .split('\n')
                         .slice(1) // remove header
                         .map(s => s.split(','))
                         .map(([state, stationName, lat, lng]) => {
                             return {
                                 name: stationName, 
                                 locationCoords: `(${lat}, ${lng})`
                             }
                         })

    for (let station of stations) {
        await sql`
            with u1 as (
                insert into location(name, location_coords, location_type)
                values (${station.name}, ${station.locationCoords}, ${locationType.weatherStation})
                returning *
            )
            insert into ${sql(locationType.weatherStation)} (location_id, lga_id)
            values (
                (select u1.location_id from u1), 
                (select location_id
                    from ${sql(locationType.lga)} lga join location l using (location_id)
                    where (select location_coords from u1) && l.location_coords
                )
            );
        `
    }
         
}

// Designated weather station for each lga
async function designateWeatherStations() {
    // For LGA with weather station inside it, just pick one!
    await sql`
        update ${sql(locationType.lga)} lga set (designated_weather_station) = 
        (select ws.location_id from weather_station ws
            where ws.lga_id = lga.location_id
            limit 1
        );
    `

    // For LGA with no weather station inside it, pick closest weather station!
    // This is a very slow query and so use existing query result if possible
    let data
    try {
        data = await readFile(closestStationsFile)
    } catch (err) {
        if (err.code === 'ENOENT') {    // File doesn't exist
            await getClosestStations()
        } else {
            throw err;
        }
    }
    if (!data) {
        data = await readFile(closestStationsFile)
    }
    const closestStations = data.toString()
                                .split('\n')
                                .slice(1)       // remove header
                                .map(s => {
                                    [lga_location_id, _, station_location_id] = s.split(',')
                                    return {lga_location_id, station_location_id}
                                })
    for (closestStation of closestStations) {
        await sql`
            update ${sql(locationType.lga)} 
            set designated_weather_station = ${closestStation.station_location_id}
            where location_id = ${closestStation.lga_location_id}
        `
    }
}

/* *********************************IMPORTANT********************************************
    Since not all weather stations have enough data,
    manually change the designated weather station for the following LGAs:
     - FRANKSTON -> change to moorabin airport
     - CASEY -> change to moorabin airport
     - MITCHELL -> change to Wallan (KILMORE GAP)
 *********************************IMPORTANT********************************************
*/

async function manuallyOverrideDesignatedWeatherStations() {
    await sql`
        update local_government_area 
        set designated_weather_station = (
            select location_id from location where name = 'MOORABBIN AIRPORT'
            and location_type = 'weather_station'
        )
        where abbv_name in ('CASEY', 'FRANKSTON');
    `

    await sql`
        update local_government_area 
        set designated_weather_station = (
            select location_id from location where name = 'WALLAN (KILMORE GAP)'
            and location_type = 'weather_station'
        )
        where abbv_name in ('MITCHELL');     
    `
}

async function getClosestStations() {

    const closestStations = await sql`
        with no_station as (
            select lga.location_id, lga.abbv_name, l.location_coords 
            from local_government_area lga 
            join location l using (location_id)
            left join weather_station ws
                on ws.lga_id = lga.location_id
            where ws.location_id is null
        ),
        closest_station_distance as (
            select ns.location_id, min((ns.location_coords <-> l2.location_coords::point)) as min_distance
            from weather_station ws2 
                join location l2 using (location_id)
                cross join no_station ns
            group by ns.location_id
        )
        select 
            ns.location_id as "lga_location_id", 
            ns.abbv_name as "lga_abbv_name", 
            l3.location_id as "station_location_id", 
            l3."name" as "station_name"
        from weather_station ws3 
            join location l3 using (location_id) 
            join
            (no_station ns join closest_station_distance cs on ns.location_id = cs.location_id)
                on (ns.location_coords <-> l3.location_coords::point) = cs.min_distance;
    `
    let closestStationsCsvData = 'lga_location_id,lga_abbv_name,station_location_id,station_name\n'
    
    closestStationsCsvData += closestStations.map(cs => `${cs.lga_location_id},${cs.lga_abbv_name},${cs.station_location_id},${cs.station_name}`)
                                             .join('\n')

    await writeFile(closestStationsFile, closestStationsCsvData)    
}

populateCountries()
    .then(_ => populateStates())
    .then(_ => populateLGA())
    .then(_ => populationWeatherStations())
    .then(_ => designateWeatherStations())
    .then(_ => manuallyOverrideDesignatedWeatherStations())
    .catch(err => console.log(err))
    .finally(_ => sql.end({timeout: null}))
    
    