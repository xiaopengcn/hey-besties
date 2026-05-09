const https = require('https');
const zlib = require('zlib');

function sanitizeHost(host) {
  const cleaned = String(host || '').trim().replace(/\/+$/, '');
  if (!cleaned) {
    return '';
  }
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  return `https://${cleaned}`;
}

function buildQWeatherUrl(apiHost, pathname, location) {
  const encodedLocation = encodeURIComponent(location);
  return `${sanitizeHost(apiHost)}${pathname}?location=${encodedLocation}`;
}

function redactWeatherConfig(config) {
  const apiKey = String(config.apiKey || '');
  return {
    apiHost: config.apiHost,
    apiKey: apiKey ? `${apiKey.slice(0, 4)}***` : ''
  };
}

function logInfo(message, meta) {
  console.log(`[getWeather] ${message}`, meta || {});
}

function logError(message, meta) {
  console.error(`[getWeather] ${message}`, meta || {});
}

function decodeResponseBody(buffer, contentEncoding = '') {
  return new Promise((resolve, reject) => {
    const encoding = String(contentEncoding || '').toLowerCase();
    const done = (error, output) => {
      if (error) {
        reject(error);
        return;
      }
      resolve((output || buffer).toString('utf8'));
    };

    if (encoding.includes('gzip')) {
      zlib.gunzip(buffer, done);
      return;
    }

    if (encoding.includes('deflate')) {
      zlib.inflate(buffer, done);
      return;
    }

    if (encoding.includes('br') && typeof zlib.brotliDecompress === 'function') {
      zlib.brotliDecompress(buffer, done);
      return;
    }

    resolve(buffer.toString('utf8'));
  });
}

function requestJson(url, apiKey) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          'X-QW-Api-Key': apiKey,
          'Accept-Encoding': 'gzip, deflate, br'
        }
      },
      (response) => {
        const chunks = [];

        response.on('data', (chunk) => {
          chunks.push(chunk);
        });

        response.on('end', async () => {
          try {
            const raw = await decodeResponseBody(Buffer.concat(chunks), response.headers['content-encoding']);
            const parsed = JSON.parse(raw);
            resolve({
              statusCode: response.statusCode,
              data: parsed
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on('error', reject);
  });
}

function encodeCoordinate(value) {
  return Number(value).toFixed(6);
}

function mapWeatherPayload(geoData, weatherData) {
  const location = geoData.location && geoData.location[0] ? geoData.location[0] : {};
  const now = weatherData.now || {};

  return {
    cityName: location.adm2 || location.name || '',
    districtName: location.name && location.name !== location.adm2 ? location.name : '',
    temperature: Number(now.temp),
    feelsLike: Number(now.feelsLike || now.temp),
    conditionText: now.text || '',
    conditionCode: now.icon || ''
  };
}

exports.main = async (event) => {
  const apiKey = process.env.QWEATHER_API_KEY;
  const apiHost = sanitizeHost(process.env.QWEATHER_API_HOST);
  if (!apiKey) {
    throw new Error('missing QWEATHER_API_KEY');
  }
  if (!apiHost) {
    throw new Error('missing QWEATHER_API_HOST');
  }

  const latitude = encodeCoordinate(event.latitude);
  const longitude = encodeCoordinate(event.longitude);
  const location = `${longitude},${latitude}`;

  const config = {
    apiHost,
    apiKey
  };

  const geoUrl = buildQWeatherUrl(apiHost, '/geo/v2/city/lookup', location);
  const weatherUrl = buildQWeatherUrl(apiHost, '/v7/weather/now', location);

  logInfo('start weather lookup', {
    location,
    config: redactWeatherConfig(config)
  });

  try {
    const [geoResponse, weatherResponse] = await Promise.all([
      requestJson(geoUrl, apiKey),
      requestJson(weatherUrl, apiKey)
    ]);
    const geoData = geoResponse.data;
    const weatherData = weatherResponse.data;

    if (geoData.code !== '200' || weatherData.code !== '200') {
      logError('upstream qweather error', {
        location,
        geoCode: geoData.code,
        weatherCode: weatherData.code,
        geoStatusCode: geoResponse.statusCode,
        weatherStatusCode: weatherResponse.statusCode
      });
      throw new Error(`weather upstream error: ${geoData.code}/${weatherData.code}`);
    }

    const result = mapWeatherPayload(geoData, weatherData);
    logInfo('weather lookup success', {
      location,
      cityName: result.cityName,
      districtName: result.districtName,
      temperature: result.temperature,
      conditionText: result.conditionText
    });
    return result;
  } catch (error) {
    logError('weather lookup failed', {
      location,
      message: error.message
    });
    throw error;
  }
};

module.exports = {
  main: exports.main,
  sanitizeHost,
  buildQWeatherUrl,
  redactWeatherConfig,
  decodeResponseBody
};
