const { mock } = require('pactum');
const test = require('uvu').test;
const assert = require('uvu/assert');

const influx = require('../src/index');

test.before(() => {
  return mock.start();
});

test.after(() => {
  return mock.stop();
});

test('write - multiple metrics', async () => {
  const id = mock.addInteraction({
    request: {
      method: 'POST',
      path: '/write',
      queryParams: {
        db: 'temp'
      },
      body: 'table,Country=India,City=HYD duration=10,load=22.5,status=true,tag="Host"\n' +
        'other-table duration=10 12344'
    },
    response: {
      status: 200
    }
  });
  await influx.write(
    { url: 'http://localhost:9393', db: 'temp' },
    [
      {
        measurement: 'table',
        fields: {
          duration: 10,
          load: 22.5,
          status: true,
          tag: 'Host'
        },
        tags: {
          Country: 'India',
          City: 'HYD'
        }
      },
      {
        measurement: 'other-table',
        fields: {
          duration: 10
        },
        timestamp: 12344
      }
    ]
  );
  assert.ok(mock.getInteraction(id).exercised, 'interaction not exercised');
});

test('write - single metrics', async () => {
  const id = mock.addInteraction({
    request: {
      method: 'POST',
      path: '/write',
      queryParams: {
        db: 'temp'
      },
      body: 'table,Country=India,City=HYD duration=10,load=22.5,status=true,tag="Host"'
    },
    response: {
      status: 200
    }
  });
  await influx.write(
    { url: 'http://localhost:9393', db: 'temp' },
    {
      measurement: 'table',
      fields: {
        duration: 10,
        load: 22.5,
        status: true,
        tag: 'Host'
      },
      tags: {
        Country: 'India',
        City: 'HYD'
      }
    }
  );
  assert.ok(mock.getInteraction(id).exercised, 'interaction not exercised');
});

test('write - with authentication', async () => {
  const id = mock.addInteraction({
    request: {
      method: 'POST',
      path: '/write',
      headers: {
        'Authorization': 'Basic dXNlcjpwYXNz'
      },
      queryParams: {
        db: 'temp'
      },
      body: 'table,Country=India,City=HYD duration=10,load=22.5,status=true,tag="Host"'
    },
    response: {
      status: 200
    }
  });
  await influx.write(
    { url: 'http://localhost:9393', db: 'temp', username: 'user', password: 'pass' },
    {
      measurement: 'table',
      fields: {
        duration: 10,
        load: 22.5,
        status: true,
        tag: 'Host'
      },
      tags: {
        Country: 'India',
        City: 'HYD'
      }
    }
  );
  assert.ok(mock.getInteraction(id).exercised, 'interaction not exercised');
});

test('write - single metric with special characters', async () => {
  const id = mock.addInteraction({
    request: {
      method: 'POST',
      path: '/write',
      queryParams: {
        db: 'temp'
      },
      body: 'first\\,\\ table,Country=India\\,\\ ASIA,City=HYD\\=SEC duration=10,load=22.5,status=true,tag="Host \\"Metric\\""'
    },
    response: {
      status: 200
    }
  });
  await influx.write(
    { url: 'http://localhost:9393', db: 'temp' },
    {
      measurement: 'first, table',
      fields: {
        duration: 10,
        load: 22.5,
        status: true,
        tag: 'Host "Metric"'
      },
      tags: {
        Country: 'India, ASIA',
        City: 'HYD=SEC'
      }
    }
  );
  assert.ok(mock.getInteraction(id).exercised, 'interaction not exercised');
});

test('db -> write - multiple metrics', async () => {
  const id = mock.addInteraction({
    request: {
      method: 'POST',
      path: '/write',
      queryParams: {
        db: 'temp'
      },
      body: 'table,Country=India,City=HYD duration=10,load=22.5,status=true,tag="Host"\n' +
        'other-table duration=10 12344'
    },
    response: {
      status: 200
    }
  });
  const db = influx.db({ url: 'http://localhost:9393', db: 'temp' });
  await db.write(
    [
      {
        measurement: 'table',
        fields: {
          duration: 10,
          load: 22.5,
          status: true,
          tag: 'Host'
        },
        tags: {
          Country: 'India',
          City: 'HYD'
        }
      },
      {
        measurement: 'other-table',
        fields: {
          duration: 10
        },
        timestamp: 12344
      }
    ]
  );
  assert.ok(mock.getInteraction(id).exercised, 'interaction not exercised');
});

test('db -> null', () => {
  let err;
  try {
    const db = influx.db(null);  
  } catch (error) {
    err = error;
  }
  assert.equal(err.toString(), 'Error: `options` are required');
});

test('db -> no url', () => {
  let err;
  try {
    const db = influx.db({});  
  } catch (error) {
    err = error;
  }
  assert.equal(err.toString(), 'Error: `url` is required');
});

test('db -> no db', () => {
  let err;
  try {
    const db = influx.db({ url: 'xyz'});  
  } catch (error) {
    err = error;
  }
  assert.equal(err.toString(), 'Error: `db` is required');
});

test('db -> write - null', async () => {
  const db = influx.db({ url: 'http://localhost:9393', db: 'temp' });
  let err;
  try {
    await db.write(null);  
  } catch (error) {
    err = error;
  }
  assert.equal(err.toString(), 'Error: `metrics` are required');
});

test('db -> write - [ null ]', async () => {
  const db = influx.db({ url: 'http://localhost:9393', db: 'temp' });
  let err;
  try {
    await db.write([ null ]);  
  } catch (error) {
    err = error;
  }
  assert.equal(err.toString(), 'Error: `metrics` are required');
});

test('db -> write - no measurement', async () => {
  const db = influx.db({ url: 'http://localhost:9393', db: 'temp' });
  let err;
  try {
    await db.write({});  
  } catch (error) {
    err = error;
  }
  assert.equal(err.toString(), 'Error: `measurement` is required');
});

test('db -> write - no fields', async () => {
  const db = influx.db({ url: 'http://localhost:9393', db: 'temp' });
  let err;
  try {
    await db.write({ measurement: 'xyz' });  
  } catch (error) {
    err = error;
  }
  assert.equal(err.toString(), 'Error: `fields` are required');
});

test.run();