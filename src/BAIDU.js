"use strict";

import Parse from 'parse';
import log from 'npmlog';
import BaiduPush from 'baidu_push';
import { randomString } from './PushAdapterUtils';

const LOG_PREFIX = 'parse-server-push-adapter BAIDU';
const BAIDUMsgExpiresMax = 7 * 24 * 60 * 60; // BAIDU allows a max of 1 week
const BAIDURegistrationTokensMax = 10000;

export default function BAIDU(args) {
  if (typeof args !== 'object' || !args.senderId || !args.apiKey) {
    throw new Parse.Error(Parse.Error.PUSH_MISCONFIGURED,'BAIDU Configuration is invalid');
  }
  this.sender = new BaiduPush({
    apiKey : args.senderId,
    secretKey: args.apiKey
  });
}

BAIDU.BAIDURegistrationTokensMax = BAIDURegistrationTokensMax;

/**
 * Send baidu request.
 * @param {Object} data The data we need to send, the format is the same with api request body
 * @param {Array} devices A array of devices
 * @returns {Object} A promise which is resolved after we get results from baidu
 */
BAIDU.prototype.send = function(data, devices) {
  let pushId = randomString(10);
  // Make a new array
  devices = devices.slice(0);
  let timestamp = Date.now();
  // For android, we can only have 10000 recepients per send, so we need to slice devices to
  // chunk if necessary
  let slices = sliceDevices(devices, BAIDU.BAIDURegistrationTokensMax);
  if (slices.length > 1) {
    log.verbose(LOG_PREFIX, `the number of devices exceeds ${BAIDURegistrationTokensMax}`);
    // Make 1 send per slice
    let promises = slices.reduce((memo, slice) => {
      let promise = this.send(data, slice, timestamp);
      memo.push(promise);
      return memo;
    }, [])
    return Parse.Promise.when(promises).then((results) => {
      let allResults = results.reduce((memo, result) => {
        return memo.concat(result);
      }, []);
      return Parse.Promise.as(allResults);
    });
  }
  // get the devices back...
  devices = slices[0];

  let expirationTime;
  // We handle the expiration_time convertion in push.js, so expiration_time is a valid date
  // in Unix epoch time in milliseconds here
  if (data['expiration_time']) {
    expirationTime = data['expiration_time'];
  }
  // Generate baidu payload
  let baiduPayload = generateBAIDUPayload(data, pushId, timestamp, expirationTime);

  // Build a device map
  let devicesMap = devices.reduce((memo, device) => {
    memo[device.deviceToken] = device;
    return memo;
  }, {});

  let deviceTokens = Object.keys(devicesMap);

  let promises = deviceTokens.map(() => new Parse.Promise());
  let registrationChannelIds = deviceTokens;
  let deviceCount = registrationChannelIds.length;
  let baiduPushType;
  log.verbose(LOG_PREFIX, `sending to ${deviceCount} ${deviceCount > 1 ? 'devices' : 'device'}`);
  if(deviceCount == 1 && baiduPayload.msg != "") {
    baiduPayload['channel_id'] = registrationChannelIds[0];
    baiduPushType = "pushSingle";
  }
  else {
    baiduPushType = "pushAll";
  }

  this.sender[baiduPushType](baiduPayload, (error, response) => {
    if (error) {
      log.error(LOG_PREFIX, `send errored: %s`, JSON.stringify(error, null, 4));
    } else {
      log.verbose(LOG_PREFIX, `BAIDU Response: %s`, JSON.stringify(response, null, 4));
    }
    let results = response || {};
    let { request_id } = response || {};
    registrationChannelIds.forEach((token, index) => {
      let promise = promises[index];
      let result = results ? results : undefined;
      let device = devicesMap[token];
      device.deviceType = 'android';
      let resolution = {
        device,
        request_id,
        response: error || result,
      };
      if(result && result.response_params && result.response_params.msg_id) {
        resolution.transmitted = true;
      } else {
        resolution.transmitted = false;
      }
      promise.resolve(resolution);
    });
  });
  return Parse.Promise.when(promises);
}

/**
 * Generate the baidu payload from the data we get from api request.
 * @param {Object} requestData The request body
 * @param {String} pushId A random string
 * @param {Number} timeStamp A number whose format is the Unix Epoch
 * @param {Number|undefined} expirationTime A number whose format is the Unix Epoch or undefined
 * @returns {Object} A promise which is resolved after we get results from baidu
 */
function generateBAIDUPayload(requestData, pushId, timeStamp, expirationTime) {
  let payload = {
    msg_type: 1,
    msg: JSON.stringify(requestData.data),
    timestamp: timeStamp
  };
  if (expirationTime) {
    // The timeStamp and expiration is in milliseconds but baidu requires in seconds
    let msgExpires = Math.floor((expirationTime - timeStamp) / 1000);
    if (msgExpires < 0) {
      msgExpires = 0;
    }
    if (msgExpires >= BAIDUMsgExpiresMax) {
      msgExpires = BAIDUMsgExpiresMax;
    }
    payload.msg_expires = msgExpires;
  }
  return payload;
}

/**
 * Slice a list of devices to several list of devices with fixed chunk size.
 * @param {Array} devices An array of devices
 * @param {Number} chunkSize The size of the a chunk
 * @returns {Array} An array which contains several arrays of devices with fixed chunk size
 */
function sliceDevices(devices, chunkSize) {
  let chunkDevices = [];
  while (devices.length > 0) {
    chunkDevices.push(devices.splice(0, chunkSize));
  }
  return chunkDevices;
}

BAIDU.generateBAIDUPayload = generateBAIDUPayload;

/* istanbul ignore else */
if (process.env.TESTING) {
  BAIDU.sliceDevices = sliceDevices;
}
