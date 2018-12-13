const crypto = require('crypto');
const fs = require('fs');

const argument = 'path';

const jsonSchema = {
  properties: {
    path: { type: "string" },
    function: { 
      enum: [
        "md5", 
        "sha1",
        "sha224",
        "sha256", 
        "sha384",
        "sha512",
      ],
      default: "md5",
    },
  },
  required: ['path'],
}

function hash(path, fn) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(fn);
	  const readStream = fs.createReadStream(path);
	  readStream.on('error', reject)
	  readStream.on('data', chunk => {
      hash.update(chunk);
    });
	  readStream.on('end', () => {
      let hashdigest = hash.digest();
      resolve(hashdigest.toString('hex'));
    });
  });
}

module.exports = {
  argument,
  jsonSchema,
  command: (input) => {
    return hash(input.path, input.function);
  },
};