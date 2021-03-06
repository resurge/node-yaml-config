/**
* node-yaml-config.js
* -------------------
* Load yaml config files
* Author: Johann-Michael Thiebaut <johann.thiebaut@gmail.com>
*/

/**
* Dependencies
*/

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var extend = require('node.extend');

/**
* Hash of loaded files
*/

var loaded_files = {};

function replaceEnvVariables(data) {
  if(Array.isArray(data)) {
    return data.map(function(elem) {
      return replaceEnvVariables(elem);
    });
  } else if(typeof(data) === 'object') {
    for(var key in data) {
      if(data.hasOwnProperty(key)) {
        data[key] = replaceEnvVariables(data[key]);
      }
    }
  } else if(typeof(data) === 'string') {
    var pattern = /^\$(\w+)$/;
    if(pattern.test(data)) {
      var variableName = data.match(pattern)[1];
      return variableName in process.env ? process.env[variableName] : null;
    }
  }

  return data;
}

/**
* Reads a yaml configuration file
*/

function read(filename) {
  var data = yaml.load(fs.readFileSync(filename));
  data = replaceEnvVariables(data);

  loaded_files[filename] = data;

  return data;
}

/**
* Loads a yaml configuration
* If the file has already been parsed, the file is not read again.
*/

function load(filename, env) {
  var data, default_config, extension_config;

  filename = path.resolve(filename);

  if (loaded_files.hasOwnProperty(filename)) {
    data = loaded_files[filename];
  } else {
    data = read(filename);
  }

  env = env || process.env.NODE_ENV || 'development';

  default_config = data.default || {};
  extension_config = data[env] || {};

  return extend(true, extend(true, {}, default_config), extension_config);
}

/**
* Expose `load`
*/

exports.load = load;

/**
* Expose `reload`
*/

exports.reload = read
