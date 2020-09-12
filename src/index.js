const rp = require('phin-retry');

class DB {

  constructor(options) {
    this.options = options;
  }

  write(data) {
    const payloads = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const tags = Object.keys(item.tags || {}).map(key => `,${key}=${item.tags[key]}`).join('');
      const fields = Object.keys(item.fields).map(key => typeof item.fields[key] === 'string' ? `${key}="${item.fields[key]}"` : `${key}=${item.fields[key]}`).join(',');
      const timestamp = item.timestamp ? ` ${item.timestamp}` : '';
      payloads.push(`${item.measurement}${tags} ${fields}${timestamp}`);
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

  write(options, data) {
    return new DB(options).write(data);
  }

};

module.exports = influx;
