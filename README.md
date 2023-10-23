# influxdb-lite

A light-weight library to write data to InfluxDB.

- Parse Special Characters
- Inbuilt Retry Mechanisms

## Example

### Influx DB v1

```javascript
const influx = require('influxdb-lite');

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

### Influx DB v2

```javascript
const influx = require('influxdb-lite');

await influx.write(
    {
      url: 'http://influx.url',
      version: 'v2',
      bucket: 'bucket name',
      org: 'org',
      token: 'token',
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
```


## CLI

### Insert Data

```shell
npx influxdb-lite insert --url <influx-base-url> --username <user> --password <pass> --db <database> --measurement <measurement> --tags "key=value" --fields "key=value" --ts <timestamp>
```

### Note

Inspired from [influxdb-v2](https://www.npmjs.com/package/influxdb-v2)