const express = require('express')
const request = require('request')
const plotlib = require('nodeplotlib')

const app = express()
const port = 8081
const bearer_token = '' // Insert bearer token here from logging into Nike Run Club

/*
 * Path for time: /sport/v3/me/activities/after_time/${time}
 * Path for paginate: /sport/v3/me/activities/after_id/${before_activity_uuid}
 * Path for activity metrics: /sport/v3/me/activity/${activity_uuid}?metrics=ALL
 */

app.listen(port, () => {
    console.log(`Coming at you live on port ${port}` )
})

app.get('/', function (req, res) {
    res.send('Homepage baby!')
})

app.get('/runs', function (req, res) {
    // TODO: Find Auth method without need for bearer token as it updates
    // TODO: Collect paging data and do multiple requests to create a single JSON data result
    console.log('route /runs')
    var options = {
        url: 'https://api.nike.com/sport/v3/me/activities/after_time/1597107641113',
        method: 'GET',
        json: true,
        headers: {
            Authorization: 'Bearer ' + bearer_token,
            'Content-Type': 'application/json'
        }
    }
    request(options, (error, response, body) => {
        // Post JSON to the server to view
        res.send(body)
        // paging.after_time indicates a new page with more data
        // If paging only has property before_id, then it is the last page
        //console.log(body.paging.after_time)
        plotDistance(body)
    })
})

function plotDistance(data) {
    let totalDates = []
    let totalDistances = []
    let totalPaces = []
    data.activities.forEach(activity => activity.summaries.forEach(data => {
        if (data.metric === 'distance') {
            console.log(`Activity: ${activity.id}, Metric: ${data.metric}, Value: ${data.value}`)
            const distance = parseFloat(data.value).toFixed(2)
            const date = new Date(activity.start_epoch_ms).toISOString().replace(/T/, ' ').replace(/\..+/, '')
            totalDistances.push(distance)
            totalDates.push(date)
        }
        if (data.metric === 'pace') {
            console.log(`Pace/km: ${data.value}`)
            const pace = parseFloat(data.value).toFixed(2)
            totalPaces.push(pace)
        }
    }))


    console.log(totalDistances, totalDates, totalPaces)
    const layout = {
        title: 'Total Distance Ran (KM)',
        xaxis: {
            title: 'Date/Time Run Began'
        },
        yaxis: {
            title: 'Distance (KM)'
        }
    }
    const trace = [{
        x: totalDates,
        y: totalDistances,
        mode: 'lines+markers',
        name: 'KM Ran'
    },
    {
        x: totalDates,
        y: totalPaces,
        mode: 'lines+markers',
        name: 'Average Pace'
    }]
    plotlib.plot(trace, layout)
}
