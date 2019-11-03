'use strict';

const express = require('express');
const fs = require('fs');
const { Pool } = require('pg');
const ThemeParks = require('themeparks');

ThemeParks.Settings.Cache = "/tmp/themeparks.db";

const app = express();
const pool = new Pool({
    password: fs.readFileSync(process.env.PGPASSFILE)
});
const parks = [
    new ThemeParks.Parks.WaltDisneyWorldMagicKingdom(),
    new ThemeParks.Parks.WaltDisneyWorldEpcot(),
    new ThemeParks.Parks.WaltDisneyWorldHollywoodStudios(),
    new ThemeParks.Parks.WaltDisneyWorldAnimalKingdom()
];

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })  

app.get('/', async (req, res, next) => {
    try {
        const parkTimes = await Promise.all(parks.map(async (park, i) => {
            const waitTimes = await park.GetWaitTimes();
            const attractions = waitTimes.map((attraction) => {
                return {
                    id: attraction.id,
                    name: attraction.name,
                    park_id: i
                };
            });
            const saveTimes = waitTimes.map((attraction) => {
                return {
                    attraction_id: attraction.id,
                    timestamp: attraction.lastUpdate,
                    wait_time: attraction.waitTime,
                    operating: attraction.status == 'Operating'
                }
            })

            const dbClient = await pool.connect();
            try {
                await Promise.all(attractions.map(attraction => {
                    return dbClient.query(
                        'INSERT INTO attractions(id, name) VALUES ($1, $2) ON CONFLICT(id) DO UPDATE SET name = EXCLUDED.name ;',
                        [attraction.id, attraction.name]);
                }));
                await Promise.all(saveTimes.map(waitTime => {
                    return dbClient.query(
                        'INSERT INTO wait_times(attraction_id, timestamp, wait_time, operating) VALUES ($1, $2, $3, $4) ON CONFLICT(attraction_id, timestamp) DO NOTHING;',
                        [waitTime.attraction_id, waitTime.timestamp, waitTime.wait_time, waitTime.operating]);
                }))
            } finally {
                dbClient.release();
            }

            return saveTimes;
        }));
        res.send([].concat.apply([], parkTimes));
    } catch(e) {
        next(e)
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});