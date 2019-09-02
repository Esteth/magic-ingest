'use strict';

const {BigQuery} = require('@google-cloud/bigquery');
const express = require('express');
const ThemeParks = require('themeparks');

ThemeParks.Settings.Cache = "/tmp/themeparks.db";

const app = express();
const bigQuery = new BigQuery();
const parks = [
    new ThemeParks.Parks.WaltDisneyWorldMagicKingdom(),
    new ThemeParks.Parks.WaltDisneyWorldEpcot(),
    new ThemeParks.Parks.WaltDisneyWorldHollywoodStudios(),
    new ThemeParks.Parks.WaltDisneyWorldAnimalKingdom()
];

app.get('/', async (req, res, next) => {
    try {
        await Promise.all(parks.map(async (park, i) => {
            const waitTimes = await park.GetWaitTimes();
            const attractions = waitTimes.map((attraction) => {
                return {
                    id: attraction.id,
                    name: attraction.name,
                    park_id: i
                };
            });
            await bigQuery
                .dataset('wait_times')
                .table('attractions')
                .insert(attractions)
        }));
        res.send([].concat.apply([], parkWaitTimes));
    } catch(e) {
        next(e)
    }
});

app.get('/consolidate', async (req, res, next) => {
    try {
        await Promise.all(parks.map(async (park, i) => {
            const waitTimes = await park.GetWaitTimes();
            const attractions = waitTimes.map((attraction) => {
                return {
                    id: attraction.id,
                    name: attraction.name,
                    park_id: i
                };
            });
            const newIds = 
                await bigQuery
                    .dataset('wait_times')
                    .query(
                        `SELECT
                            id
                        FROM
                            attractions
                        WHERE id IN (${attractions.map((a) => a.id).join(',')})`) 
        }));
        
        bigQuery.dataset('wait_times').table('attractions').insert()
        res.send([].concat.apply([], parkWaitTimes));
    } catch(e) {
        next(e)
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});