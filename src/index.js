const rp = require('phin-retry');

function pM(value) {
  return value.replace(/,/g, '\\,').replace(/ /g, '\\ ');
}

function pT(value) {
  return pM(value).replace(/=/g, '\\=');
}

function pF(value) {
  if (typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`;
  return value;
}

class DB {

  constructor(options) {
    if (!options) throw new Error('`options` are required');
    if (!options.url) throw new Error('`url` is required');
    if (!options.db) throw new Error('`db` is required');
    this.options = options;
  }

  write(metrics) {
    if (!metrics) throw new Error('`metrics` are required');
    const payloads = [];
    if (!Array.isArray(metrics)) {
      metrics = [metrics];
    }
    for (let i = 0; i < metrics.length; i++) {
      const item = metrics[i];
      if (!item) throw new Error('`metrics` are required');
      if (!item.measurement) throw new Error('`measurement` is required');
      if (!item.fields) throw new Error('`fields` are required');
      const tags = Object.keys(item.tags || {}).map(key => `,${pT(key)}=${pT(item.tags[key])}`).join('');
      const fields = Object.keys(item.fields).map(key => `${pT(key)}=${pF(item.fields[key])}`).join(',');
      const timestamp = item.timestamp ? ` ${item.timestamp}` : '';
      payloads.push(`${pM(item.measurement)}${tags} ${fields}${timestamp}`);
    }
    return rp.post({
      url: `${this.options.url}/write`,
      qs: {
        db: this.options.db
      },
      body: payloads.join('\n')
    });
  }

}

const influx = {

  db(options) {
    return new DB(options);
  },

  write(options, metrics) {
    return new DB(options).write(metrics);
  }

};

module.exports = influx;
