# influxdb-v1

A light-weight library to write data to InfluxDB.

- Parse Special Characters
- Inbuilt Retry Mechanisms

## Example

```javascript
const influx = require('influxdb-v1');

await influx.write(
    {
      url: 'http://influx.url',
      db: 'database name'
    },
    [
      {
        measurement: 'web',
        fields: {
          load: 12.34
        }
      },
      {
        measurement: 'web',
        fields: {
          load: 5.4
        },
        tags: {
          host: 'linux'
        },
        timestamp: Date.now()
      }
    ]
  );

// or

const db = influx.db({ url: 'http://influx.url', db: 'database name'});
await db.write({
  measurement: 'web',
  fields: {
    load: 12.34
  }
});

// query

const db = influx.db({ url: 'http://influx.url', db: 'database name', username: 'user', password: 'pass' });
await db.query('SELECT * FROM measurement');
await db.flux('from(bucket:"telegraf")');
```

### Note

Inspired from [influxdb-v2](https://www.npmjs.com/package/influxdb-v2)