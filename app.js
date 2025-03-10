const express = require('express');
const axios = require('axios');
const { performance } = require('perf_hooks');
const stats = require('simple-statistics');
const path = require('path');

const app = express();
const PORT = 3000;

const serverUrl = 'https://316fe607-5d5c-4f79-a5ef-0e67b0235714-00-200qw15w8fg0c.janeway.replit.dev';

// Then use this URL in your axios or fetch calls

app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve HTML page
});

app.get('/test-results', async (req, res) => {
    const frequencies = [16, 8, 4, 2, 1];
    const dataSizes = [128, 256, 512, 1024, 2048];
    let results = [];

    for (let freq of frequencies) {
        for (let size of dataSizes) {
            const testStats = await testRTT(freq, size);
            results.push({ frequency: freq, dataSize: size, ...testStats });
        }
    }

    res.json(results);
});

async function testRTT(frequency, dataSize) {
    const interval = 1000 / frequency;
    const requestData = 'x'.repeat(dataSize);
    let rttMeasurements = [];

    for (let i = 0; i < 10; i++) { // Reduced to 10 for faster testing
        const start = performance.now();
        // await axios.post(`http://localhost:${PORT}/ping`, { data: requestData });
        await axios.post(`${serverUrl}/ping`, { data: requestData });
        const end = performance.now();
        rttMeasurements.push(end - start);
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    return {
        min: stats.min(rttMeasurements),
        max: stats.max(rttMeasurements),
        mean: stats.mean(rttMeasurements),
        median: stats.median(rttMeasurements),
        stddev: stats.standardDeviation(rttMeasurements),
        skewness: stats.sampleSkewness(rttMeasurements),
    };
}

app.post('/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: Date.now() });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
