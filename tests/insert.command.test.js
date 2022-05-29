const { mock } = require('pactum');
const test = require('uvu').test;
const assert = require('uvu/assert');

const insert = require('../src/commands/insert');

test.before(() => {
  return mock.start();
});

test.after(() => {
  return mock.stop();
});

test('write - single tag and value', async () => {
  const id = mock.addInteraction({
    request: {
      method: 'POST',
      path: '/write',
      queryParams: {
        db: 'temp'
      },
      body: 'table,Country=India duration=10'
    },
    response: {
      status: 200
    }
  });
  await insert.run(
    { 
      url: 'http://localhost:9393',
      db: 'temp',
      measurement: 'table',
      tags: 'Country=India',
      fields: 'duration=10'
    }
  );
  assert.ok(mock.getInteraction(id).exercised, 'interaction not exercised');
});

test('write - multiple tags and values', async () => {
  const id = mock.addInteraction({
    request: {
      method: 'POST',
      path: '/write',
      queryParams: {
        db: 'temp'
      },
      body: 'table,Country=India,City=HYD duration=10,status=true,tag="Host"'
    },
    response: {
      status: 200
    }
  });
  await insert.run(
    { 
      url: 'http://localhost:9393',
      db: 'temp',
      measurement: 'table',
      tags: ['Country=India', 'City=HYD'],
      fields: ['duration=10', 'status=true', 'tag=Host']
    }
  );
  assert.ok(mock.getInteraction(id).exercised, 'interaction not exercised');
});

test.run();