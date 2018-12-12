# parse-baidu-push-adapter
The original code of this repo has been taken from https://github.com/parse-community/parse-server-push-adapter  

The licence is kept as is, the code from the above repo was cloned on the 10th of DEC 2018

This repo is extended to support push messages to android devices using Baidu

**Usage**

Originally this push adapter supports only GCM/FCM and APNS, as an extension support for Baidu push server has been added.

How to use

1) Set a config param in the parse server configuartion list

2) If the config param is set and the value of the param is "baidu" only then the push messages to android devices will be sent through Baidu server

3) If th eparm is not set or has any other value other than "baidu" then for android devices GCM will be used 

4) APNS ther eis no changes and works as is in the original repo 

Eg: 
{
  pushServer : "baidu" 
}

Thanks to Florent Vilmart and everyone who has contributed to this adapter https://github.com/parse-community/parse-server-push-adapter

You can enable verbose logging with environment variables:

VERBOSE=1

or 

VERBOSE_PARSE_SERVER_PUSH_ADAPTER=1
This will produce a more verbose output for all the push sending attempts
