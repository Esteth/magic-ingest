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
                    timestamp: Date.parse(attraction.lastUpdate),
                    wait_time: attraction.waitTime,
                    operating: attraction.status == 'Operating'
                }
            })

            const dbClient = await pool.connect();
            try {
                const dbRes = await dbClient.query('SELECT $1::text as message', ['Hello world!']);
                console.log(dbRes.rows[0]);
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