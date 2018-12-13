'use strict';

const _ = require('lodash');
const async = require('async');
const pino = require('pino');

const templateOptions = { 
  interpolate: /\${([\s\S]+?)}/g, // ${variable}
};

const argument = 'tasks';

const jsonSchema = {
  properties: {
    tasks: { type: "array", },
    log: { 
      type: "boolean",
      default: false,
    },
    parallel: { 
      type: ["boolean", "integer"], 
      default: false,
    },
    taskListFormat: {
      enum: ['typeAsKey'],
      default: 'typeAsKey',
    },
    validate: {
      default: true,
    },
    setDefaults: {
      default: true,
    },
    processTemplates: {
      default: true,
    },
  },
  required: ["tasks",],
};

const command = (input, cb, engine) => {
  const arrayOfTasks = input.tasks;
  const queue = [];

  // Handle parallel vs waterfall
  if(input.parallel === false) {
    // Push a starting function that doesn't take a waterfall'd output
    queue.push((cb) => cb(null, {}));
  }

  // Handle logger
  let logger = null;
  if(input.log) {
    logger = pino({ prettyPrint: { colorize: true } });
  }

  // Compiled validation schema registry
  const schemas = {};

  // For each task in the list
  _.forEach(arrayOfTasks, (task) => {
    // For each commandType and command (input) - there should be only one
    // TODO { type: hash, path: ...} => { hash: { path: ... } }
    _.forEach(task, (command, commandType) => {
      if(_.isString(command)) { } // TODO

      // This is the function we're going to queue
      const waterfallFunction = (context, cb) => {
        // Run each value through the templater
        _.forEach(command, (value, key) => {
          const template = _.template(value, templateOptions)
          command[key] = template(context);
        });

        engine.run(commandType, command, (err, output) => {
          if(input.log) {
            logger.info({
              parallel: input.parallel,
              type: commandType,
              input: command,
              output: output,
            });
          }
          cb(err, {
            previous: {
              command: commandType,
              input: command,
              output: output,
            },
          });
        });
      };
      // End the function we're going to queue

      // Push the function to the queue
      // Wrap the parrallel call as it doesn't pass the previous output
      if(input.parallel === false) {
        queue.push(waterfallFunction);
      } else {
        queue.push((callback) => waterfallFunction({}, callback));
      }
      // There shouldn't be more than one command
    });
    // Go to the next task
  });

  // Begin processing: waterfall, parallel, or parallel with a concurrency limit
  if(input.parallel === false ) {
    async.waterfall(queue, (err, results) => {
      cb(err, results.previous.output);
    });
  } else {
    if (input.n === undefined) {
      async.parallel(queue, (err, results) => {
        cb(err, results);
      })
    } else {
      async.parallelLimit(queue, input.n, (err, results) => {
        cb(err, results);
      });
    }
  }
  // Done processing
}

module.exports = {
  tasks: {
    argument,
    jsonSchema,
    command,
  },
};