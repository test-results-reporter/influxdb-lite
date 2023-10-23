#!/usr/bin/env node
const sade = require('sade');

const insert = require('./commands/insert');

const prog = sade('influxdb-lite');
prog.version('1.0.1');

prog.command('insert')
  .option('--url', 'influx url')
  .option('--username', 'name of the user')
  .option('--password', 'password of the user')
  .option('--db', 'name of the database')
  .option('--measurement', 'name of the measurement')
  .option('--tags', 'key value pairs of tags')
  .option('--fields', 'key value pairs of fields')
  .option('--ts', 'timestamp')
  .action(async (opts) => {
    try {
      await insert.run(opts);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

prog.parse(process.argv);