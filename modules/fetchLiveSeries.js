const http = require('https');

const options = {
  method: 'GET',
  hostname: 'cricbuzz-cricket.p.rapidapi.com',
  port: null,
  path: '/matches/v1/recent',
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
  }
};

function fetchLiveSeries() {
  return new Promise((resolve, reject) => {
    const req = http.request(options, function (res) {
      const chunks = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        const body = Buffer.concat(chunks);
        const bodyString = body.toString();
        try {
          const jsonObject = JSON.parse(bodyString);
          const matchType = jsonObject.typeMatches.find(match => match.matchType === 'International');

          const liveSeries = matchType.seriesMatches.map(function (series) {
            var info1 = series.seriesAdWrapper;
            if (typeof info1 === 'undefined') {
              return null;
            } else {
              return {
                'name': info1.seriesName,
                'ID': info1.seriesId
              };
            }
          }).filter(series => series !== null); 

          resolve(liveSeries);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', function (error) {
      reject(error);
    });

    req.end();
  });
}

module.exports = fetchLiveSeries;
