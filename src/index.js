const rp = require('phin-retry');

/**
 * @param {string} value 
 */
function parseMeasurement(value) {
  return value.replace(/,/g, '\\,').replace(/ /g, '\\ ');
}

/**
 * @param {string} value 
 */
function parseTag(value) {
  return parseMeasurement(value).replace(/=/g, '\\=');
}

/**
 * @param {string | number} value 
 */
function parseField(value) {
  if (typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`;
  return value;
}

class DB {

  /**
   * @param {import("./index").InfluxOptions} options 
   */
  constructor(options) {
    if (!options) throw new Error('`options` are required');
    if (!options.url) throw new Error('`url` is required');
    if (options.version && options.version == 'v2') {
      if (!options.bucket) throw new Error('`bucket` is required');
      if (!options.org) throw new Error('`org` is required');
      if (!options.precision) options.precision = 'ns';
    } else {
      if (!options.db) throw new Error('`db` is required');
    }
    /** @type {import("./index").InfluxOptions} */
    this.options = options;
  }

  /**
   * @param {import("./index").Metric | import("./index").Metric[]} metrics 
   */
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
      const tags = Object.keys(item.tags || {}).map(key => `,${parseTag(key)}=${parseTag(item.tags[key])}`).join('');
      const fields = Object.keys(item.fields).map(key => `${parseTag(key)}=${parseField(item.fields[key])}`).join(',');
      const timestamp = item.timestamp ? ` ${item.timestamp}` : '';
      payloads.push(`${parseMeasurement(item.measurement)}${tags} ${fields}${timestamp}`);
    }
    const req = this.getRequest();
    req.body = payloads.join('\n');
    return rp.post(req);
  }

  /**
   * @param {string} value 
   */
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

  /**
   * @param {string} query 
   */
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

  getRequest() {
    const req = { qs: {}, headers: {} }
    if (this.options.version === 'v2') {
      req.url = `${this.options.url}/api/v2/write`;
      req.qs.org = this.options.org;
      req.qs.bucket = this.options.bucket;
      req.qs.precision = this.options.precision;
      if (this.options.token) {
        req.headers['Authorization'] = `Token ${this.options.token}`;
      }
    } else {
      req.url = `${this.options.url}/write`;
      req.qs.db = this.options.db;
      if (this.options.username) {
        req.auth = { user: this.options.username, pass: this.options.password };
      }
    }
    return req;
  }

}

const influx = {

  /**
   * @param {import("./index").InfluxOptions} options 
   */
  db(options) {
    return new DB(options);
  },

  /**
   * @param {import("./index").InfluxOptions} options 
   * @param {import("./index").Metric | import("./index").Metric[]} metrics 
   */
  write(options, metrics) {
    return new DB(options).write(metrics);
  },

  /**
   * @param {import("./index").InfluxOptions} options
   * @param {string} value 
   */
  query(options, value) {
    return new DB(options).query(value);
  },

  /**
   * @param {import("./index").InfluxOptions} options 
   * @param {string} query 
   */
  flux(options, query) {
    return new DB(options).flux(query);
  }

};

module.exports = influx;
