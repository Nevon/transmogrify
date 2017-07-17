import * as l from 'aws-lambda';

import { Migration } from './migration'


export let up: l.Handler = async (event: any, context: l.Context, callback: l.Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let migration = new Migration(process.env.DATABASE_URL)
  return handler(migration.up, callback);
};

export let down: l.Handler = async (event: any, context: l.Context, callback: l.Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let migration = new Migration(process.env.DATABASE_URL)
  return handler(migration.down, callback);
};

export let create: l.Handler = async (event: any, context: l.Context, callback: l.Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!event.name) {
    return callback(new Error('Name is required'), undefined);
  }

  try {
    let migration = new Migration(process.env.DATABASE_URL)
    let password = await migration.create(event.name)
    return callback(undefined, `Created Database and User ${event.name} with password '${password}'`);
  } catch(err) {
    return callback(err, undefined);
  }
};


export let drop: l.Handler = async (event: any, context: l.Context, callback: l.Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!event.name) {
    return callback(new Error('Name is required'), undefined);
  }

  try {
    let migration = new Migration(process.env.DATABASE_URL)
    migration.drop(event.name)
    return callback(undefined, `Dropped Database and User ${event.name}`);
  } catch(err) {
    return callback(err, undefined);
  }
};

export let check: l.Handler = async (event: any, context: l.Context, callback: l.Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    let migration = new Migration(process.env.DATABASE_URL)
    await migration.check();
    return callback(undefined, 'Connection ok');
  } catch(err) {
    return callback(err, undefined);
  }
};

let handler = async (fn: () => {}, callback: l.Callback) => {
  let results = await fn();

  console.log(`Transmogrify Migrations: ${results}`)

  return callback(undefined, `ok: ${results}`);
};
