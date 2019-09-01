'use strict';

const express = require('express');
const ThemeParks = require('themeparks');

const app = express();

const magicKingdom = new ThemeParks.Parks.WaltDisneyWorldMagicKingdom();
const epcot = new ThemeParks.Parks.WaltDisneyWorldEpcot();
const hollywoodStudios = new ThemeParks.Parks.WaltDisneyWorldHollywoodStudios();
const animalKingdom = new ThemeParks.Parks.WaltDisneyWorldAnimalKingdom();

app.get('/', (req, res) => {
    Promise.all(
        [
            magicKingdom.GetWaitTimes(),
            epcot.GetWaitTimes(),
            hollywoodStudios.GetWaitTimes(),
            animalKingdom.GetWaitTimes()
        ])
        .then((parks) => {
            res.send([].concat.apply([], parks));
        }).catch((error) => {
            res.status(500).send(error)
        });
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});