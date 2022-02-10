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
    const req = {
      url: `${this.options.url}/write`,
      qs: {
        db: this.options.db
      },
      body: payloads.join('\n')
    }
    if (this.options.username) {
      req.auth = { user: this.options.username, pass: this.options.password };
    }
    return rp.post(req);
  }

  query(value) {
    if (!value) throw new Error('`query` is required');
    const req = {
      url: `${this.options.url}/query`,
      qs: {
        db: this.options.db,
        q: value
      }
    };
    if (this.options.username) {
      req.auth = { user: this.options.username, pass: this.options.password };
    }
    return rp.get(req);
  }

  flux(query) {
    const req = {
      url: `${this.options.url}/api/v2/query`,
      headers: {
        'Accept': 'application',
        'Content-type': 'application/vnd.flux'
      },
      body: query
    };
    if (this.options.username) {
      req.headers['Authorization'] = `Token ${this.options.username}:${this.options.password}`;
    }
    return rp.post(req);
  }

}

const influx = {

  db(options) {
    return new DB(options);
  },

  write(options, metrics) {
    return new DB(options).write(metrics);
  },

  query(options, value) {
    return new DB(options).query(value);
  },

  flux(options, query) {
    return new DB(options).flux(query);
  }

};

module.exports = influx;
