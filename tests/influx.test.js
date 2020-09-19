const mock = require('pactum').mock;
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
  const id = mock.addMockInteraction({
    withRequest: {
      method: 'POST',
      path: '/write',
      query: {
        db: 'temp'
      },
      body: 'table,Country=India,City=HYD duration=10,load=22.5,status=true,tag="Host"\n' +
        'other-table duration=10 12344'
    },
    willRespondWith: {
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
  assert.ok(mock.isInteractionExercised(id), 'interaction not exercised');
});

test('write - single metrics', async () => {
  const id = mock.addMockInteraction({
    withRequest: {
      method: 'POST',
      path: '/write',
      query: {
        db: 'temp'
      },
      body: 'table,Country=India,City=HYD duration=10,load=22.5,status=true,tag="Host"'
    },
    willRespondWith: {
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
  assert.ok(mock.isInteractionExercised(id), 'interaction not exercised');
});

test('db -> write - multiple metrics', async () => {
  const id = mock.addMockInteraction({
    withRequest: {
      method: 'POST',
      path: '/write',
      query: {
        db: 'temp'
      },
      body: 'table,Country=India,City=HYD duration=10,load=22.5,status=true,tag="Host"\n' +
        'other-table duration=10 12344'
    },
    willRespondWith: {
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
  assert.ok(mock.isInteractionExercised(id), 'interaction not exercised');
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