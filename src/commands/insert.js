const influx = require('../index');

function parse(value) {
  if (value === 'true' || value === 'false') {
    return Boolean(value);
  }
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

async function run(opts) {
  const tags = {};
  const fields = {};
  if (opts.tags) {
    opts.tags = Array.isArray(opts.tags) ? opts.tags : [opts.tags];
    for (let i = 0; i < opts.tags.length; i++) {
      const element = (opts.tags)[i];
      const pair = element.split('=');
      tags[pair[0]] = pair[1];
    }
  }
  if (opts.fields) {
    opts.fields = Array.isArray(opts.fields) ? opts.fields : [opts.fields];
    for (let i = 0; i < opts.fields.length; i++) {
      const element = (opts.fields)[i];
      const pair = element.split('=');
      fields[pair[0]] = parse(pair[1]);
    }
  }
  await influx.write({
    url: opts.url,
    username: opts.username,
    password: opts.password,
    db: opts.db
  }, [
    {
      measurement: opts.measurement,
      tags,
      fields,
      timestamp: opts.timestamp
    }
  ]);
}

module.exports = {
  run
}