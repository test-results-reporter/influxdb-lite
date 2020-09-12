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

test('write', async () => {
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

test('db -> write', async () => {
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

test.run();