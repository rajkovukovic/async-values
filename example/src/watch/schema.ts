import type { RxJsonSchema } from "rxdb/dist/types/types";
import type { AVStreamEvent } from "./AVWatch";

const streamEventSchema: RxJsonSchema<AVStreamEvent> = {
  title: 'stream event',
  description: 'RXJS stream event',
  version: 0,
  type: 'object',
  indexes: [
    'id',
    'timestamp',
    'streamName',
    'streamPhase',
    'type',
    'data',
  ],
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
    },
    timestamp: {
      type: 'number'
    },
    streamName: {
      type: 'string',
    },
    streamPhase: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    data: {
      type: 'any',
    }
  },
  required: ['id', 'timestamp', 'streamName', 'type'],
};

export default streamEventSchema;
