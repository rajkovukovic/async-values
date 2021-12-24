import { defer } from 'rxjs';
import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core';
import type { RxDatabase, RxCollection } from 'rxdb';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb/plugins/pouchdb';
import * as idb from 'pouchdb-adapter-idb';

import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import eventSchema from './schema';

/**
 * RxDB ========================================================================
 */

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBValidatePlugin);
addPouchPlugin(idb);

let dbPromise: Promise<RxDatabase<{ events: RxCollection }, any, any>>;

const _create = async () => {
  dbPromise = createRxDatabase({
    name: 'async-values',
    storage: getRxStoragePouch('idb'),
    ignoreDuplicate: true,
  });
  const db = await dbPromise;
  await db.addCollections({ events: { schema: eventSchema } });
  await db.events.remove();
  await db.addCollections({ events: { schema: eventSchema } });
  return db;
};

const dbInit = () => dbPromise ? dbPromise : _create();


export const dbStream = defer(dbInit);

