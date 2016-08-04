var FB = require('fb');
console.log("yo")
// var fb = Facebook.withAccessToken('EAAYsgV1owZC0BALvQNXJKmSmlhWk4LYaZAZBoCOw3j1enc9UyPZCcnbYRkkVxmKnrRPAZCfezhHNVbIOW1M7hgdeWILcnXb9lPpHoLZBuzimBHfv4ZCCrSZC2ZCBxsPodDbOzdMezcfAoORRts55CpO2BQp7zGj981EAZD')
FB.setAccessToken('EAAYsgV1owZC0BAJlvoHKIQiocrJxxQtY2C7ethC5j5PR6LLEkiXlgTOxf16ZCcZCbrL2LaGNMAzLYqPA4b6lHp8Nt25lFSHkbq8io9jBzB42pKjSRZAFcJteZB7p3fTXsFMyzEmYAYyZAN1TMsWXq1SUvZBDrIZCi94ZD');
fb = new FB.Facebook({
            access_token:'EAAYsgV1owZC0BALvQNXJKmSmlhWk4LYaZAZBoCOw3j1enc9UyPZCcnbYRkkVxmKnrRPAZCfezhHNVbIOW1M7hgdeWILcnXb9lPpHoLZBuzimBHfv4ZCCrSZC2ZCBxsPodDbOzdMezcfAoORRts55CpO2BQp7zGj981EAZD', 
            appId:process.env.FB_CLIENT_ID, 
            appSecret: process.env.FB_CLIENT_SECRET});
FB.options({
            access_token:'EAAYsgV1owZC0BALvQNXJKmSmlhWk4LYaZAZBoCOw3j1enc9UyPZCcnbYRkkVxmKnrRPAZCfezhHNVbIOW1M7hgdeWILcnXb9lPpHoLZBuzimBHfv4ZCCrSZC2ZCBxsPodDbOzdMezcfAoORRts55CpO2BQp7zGj981EAZD', 
            appId:process.env.FB_CLIENT_ID, 
            appSecret: process.env.FB_CLIENT_SECRET})
FB.api('/10209110890401272/accounts', function (res) { //takes facebook user id and gets pages that they administer
  if(!res || res.error) {
   console.log(!res ? 'error occurred' : res.error);
   return;
  }
  console.log(res);
});

FB.api('/1688425971402749/insights/page_views_total', function (res) {
  if(!res || res.error) {
   console.log(!res ? 'error occurred' : res.error);
   return;
  }
  console.log("TOTAL RESPONSE", res)
  console.log("RESPONSE   ", res.data[2].values); //get's 28 day values
});

//make function for rendering page names by id, and then adding that page to the dashboard by id