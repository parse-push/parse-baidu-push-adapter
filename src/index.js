"use strict";
// ParsePushAdapter is the default implementation of
// PushAdapter, it uses GCM or BAIDU for android push and APNS
// for ios push.
import log from 'npmlog';

/* istanbul ignore if */
if (process.env.VERBOSE || process.env.VERBOSE_PARSE_SERVER_PUSH_ADAPTER) {
  log.level = 'verbose';
}

import ParsePushAdapter from './ParsePushAdapter';
import GCM from './GCM';
import APNS from './APNS';
import BAIDU from './BAIDU';
import * as utils from './PushAdapterUtils';

export default ParsePushAdapter;
export { ParsePushAdapter, GCM, APNS, BAIDU, utils };
