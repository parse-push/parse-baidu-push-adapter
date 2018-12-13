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

# parse-baidu-push-adapter

This package works seamlessly with parse-server to send push notification using GCM/FCM and Baidu to any android device and also supports APNS

# Getting Started 

npm install @parse-push/parse-baidu-push-adapter

Configure the parse-server to use Baidu push server by setting this config parameter 

Along with these parameters below add pushServer : "baidu"

{
  "databaseURI": "mongodb://localhost:27017/parse",
  "cloud": "./persist/cloud/main",
  "appId": "myAppId",
  "masterKey": "masterKey",
  "serverURL": "http://*.*.*.*:****",
  "usePostgreSQL": false,
  "filesSubDirectory": "/home/ubuntu/ws/temp",
  "pushServer" : "baidu", <----- If you intend to use Baidu Push server then you must add this 
  "push": {
    "android": {
    	"senderId": "<senderId>",
    	"apiKey": "<apiKey>"
    }
  }
}

If you wish to use GCM/FCM then just remove the pushServer config that is all 
