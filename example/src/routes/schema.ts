const streamEventSchema = {
  title: 'stream event',
  description: 'RXJS stream event',
  version: 0,
  type: 'object',
  indexes: [
    'id',
    'timestamp',
    'streamName',
    'type',
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
    type: {
      type: 'string',
    },
  },
  required: ['id', 'timestamp', 'streamName', 'type'],
};

export default streamEventSchema;
