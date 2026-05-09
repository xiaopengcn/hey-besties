const test = require('node:test');
const assert = require('node:assert/strict');
const zlib = require('node:zlib');

const {
  buildQWeatherUrl,
  sanitizeHost,
  redactWeatherConfig,
  decodeResponseBody
} = require('../cloudfunctions/getWeather/index');

test('builds qweather request urls from the configured host', () => {
  const url = buildQWeatherUrl('https://abc123.re.qweatherapi.com', '/v7/weather/now', '121.473700,31.230400');

  assert.equal(
    url,
    'https://abc123.re.qweatherapi.com/v7/weather/now?location=121.473700%2C31.230400'
  );
});

test('sanitizes qweather host by trimming trailing slashes', () => {
  assert.equal(
    sanitizeHost('https://abc123.re.qweatherapi.com///'),
    'https://abc123.re.qweatherapi.com'
  );
});

test('sanitizes qweather host by adding https when only a bare host is configured', () => {
  assert.equal(
    sanitizeHost('abc123.re.qweatherapi.com'),
    'https://abc123.re.qweatherapi.com'
  );
});

test('redacts weather config before logging', () => {
  const redacted = redactWeatherConfig({
    apiHost: 'https://abc123.re.qweatherapi.com',
    apiKey: 'super-secret-key'
  });

  assert.equal(redacted.apiHost, 'https://abc123.re.qweatherapi.com');
  assert.equal(redacted.apiKey, 'supe***');
});

test('decodes gzip-compressed qweather responses before JSON parsing', async () => {
  const payload = Buffer.from(JSON.stringify({ code: '200', now: { temp: '24' } }), 'utf8');
  const compressed = zlib.gzipSync(payload);

  const text = await decodeResponseBody(compressed, 'gzip');

  assert.equal(text, payload.toString('utf8'));
});
