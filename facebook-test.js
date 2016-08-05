var FB = require('fb');
console.log("yo")
//horizons id 229300807402194
//parker's id 1688425971402749
// var fb = Facebook.withAccessToken('EAAYsgV1owZC0BALvQNXJKmSmlhWk4LYaZAZBoCOw3j1enc9UyPZCcnbYRkkVxmKnrRPAZCfezhHNVbIOW1M7hgdeWILcnXb9lPpHoLZBuzimBHfv4ZCCrSZC2ZCBxsPodDbOzdMezcfAoORRts55CpO2BQp7zGj981EAZD')
// FB.setAccessToken(userToken); //put at top of index route
// module.exports = {
// fb = new FB.Facebook({
//             access_token:'EAAYsgV1owZC0BALvQNXJKmSmlhWk4LYaZAZBoCOw3j1enc9UyPZCcnbYRkkVxmKnrRPAZCfezhHNVbIOW1M7hgdeWILcnXb9lPpHoLZBuzimBHfv4ZCCrSZC2ZCBxsPodDbOzdMezcfAoORRts55CpO2BQp7zGj981EAZD', 
//             appId:process.env.FB_CLIENT_ID, 
//             appSecret: process.env.FB_CLIENT_SECRET});
// FB.options({
//             access_token:'EAAYsgV1owZC0BALvQNXJKmSmlhWk4LYaZAZBoCOw3j1enc9UyPZCcnbYRkkVxmKnrRPAZCfezhHNVbIOW1M7hgdeWILcnXb9lPpHoLZBuzimBHfv4ZCCrSZC2ZCBxsPodDbOzdMezcfAoORRts55CpO2BQp7zGj981EAZD', 
//             appId:process.env.FB_CLIENT_ID, 
//             appSecret: process.env.FB_CLIENT_SECRET})
// FB.api('/10209110890401272/accounts', function (res) { //takes facebook user id and gets pages that they administer
//   if(!res || res.error) {
//    console.log(!res ? 'error occurred' : res.error);
//    return;
//   }
//   console.log(res);
// });

// FB.api('/1688425971402749/insights/page_views_total', function (res) {
//   if(!res || res.error) {
//    console.log(!res ? 'error occurred' : res.error);
//    return;
//   }
//   console.log("TOTAL RESPONSE", res)
//   console.log("RESPONSE   ", res.data[2].values); //get's 28 day values
// })

//GETS PAGE IMPRESSIONS OVER 1 MONTH, PERIOD (**, week, day) 
//~~~~~~~~~~~~~~FUNCTION TO GET TIME IN UNIX BY NUMBER OF DAYS
function time(days){
  var until = Math.floor(Date.now() / 1000); //datenow
  var since = until - days*24*60*60;
  return {until: until, since: since}
}

// ~~~~~~~~~~~~~~FUNCTION TO GET IMPRESSIONS PER DAY FOR XX DAYS
// function pageImpressions(days, pageId){
//   var time = time(days);
//   FB.api(
//       "/"+pageId+"/insights/page_impressions?since="+time.since+"&&+until="+time.until, //handles pagination by time
//       {
//           "period": "days_28"
//       },
//       function (response) {
//         var arr = [];
//         if (response && !response.error) {
//           response.data[0].values.forEach(function(day){
//             arr.push({value: day.value, end_time: day.end_time}) 
//           })
//           /* handle the result */
//           console.log("page_impressions",arr)
//         }
//         }
// )};
// ~~~~~~~~~~~~~~FUNCTION TO GET NUMBER OF IMPRESSIONS THAT CAME FROM ALL YOUR POSTS

// function(days, pageId){
//   FB.api(
//       "/"+pageId+"/insights/page_posts_impressions?since="+sinceTime+"&&+until="+untilTime, //handles pagination by time
//       {
//           "period": "days_28"
//       },
//       function (response) {
//         var arr = [];
//         if (response && !response.error) {
//           response.data[0].values.forEach(function(day){
//             arr.push({value: day.value, end_time: day.end_time}) 
//           })
//           /* handle the result */
//           console.log("page_posts_impressions",arr)
//         }
//         }
// )};
// // ~~~~~~~~~~~~~~USED TO TEST POST FUNCTIONS
// var postArr = [{ time: '2016-07-27T22:04:31+0000',
//     postId: '229300807402194_321307394868201' },
//   { time: '2016-07-19T04:13:53+0000',
//     postId: '229300807402194_317520615246879' },
//   { time: '2016-07-19T03:38:52+0000',
//     postId: '229300807402194_317507131914894' },
//   { time: '2016-07-19T03:15:42+0000',
//     postId: '229300807402194_317500351915572' },
//   { time: '2016-07-19T00:58:23+0000',
//     postId: '229300807402194_317462508586023' },
//   { time: '2016-07-19T00:46:24+0000',
//     postId: '229300807402194_317459641919643' },
//   { time: '2016-07-19T00:31:11+0000',
//     postId: '229300807402194_317451868587087' }];
// // ~~~~~~~~~~~~~~FUNCTION TO GET POST FOR XX DAYS

// FB.api( //might have to use post id and not blog id
//       "/229300807402194/feed?since="+sinceTime+"&&until="+untilTime, 
//       function (response) {
//         if (response && !response.error) {
//           // console.log(response.data)
//           response.data.forEach(function(day){
//             postArr.push({time:day.created_time, postId: day.id})
//           })
//           console.log("POST ARRAY", postArr)
//         }
//       }
//   );

// //~~~~~~~~~~~~~~FUNCTION TO GET LIKES/COMMENTS/SHARES PER DAY FOR PAST 28 DAYS
// var storiesArr = [];
// postArr.forEach(function(post){FB.api( //might have to use post id and not blog id
//       "/"+post.postId+"/insights/post_stories", //The number of stories generated about your Page post ('Stories')
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           storiesArr.push({time: post.time, stories: response.data[0].values[0].value})

//           console.log("post_stories",response.data[0].values)
           
//         }
//       }
//   );
// })
// console.log("yo",storiesArr); //asynchronous
// FB.api( //might have to use post id and not blog id
//       "/1688425971402749/insights/post_impressions", //The number of impressions per post
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_impressions",response)
//         }
//       }
//   );
// FB.api( //might have to use post id and not blog id
//       "/1688425971402749/insights/post_video_views", //The number of impressions per post
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_impressions",response)
//         }
//       }
//   );
// FB.api( //might have to use post id and not blog id
//       "/1688425971402749/insights/post_engaged_users", //The number of impressions per post
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_impressions",response)
//         }
//       }
//   );
// FB.api(
//       "/1688425971402749/insights/post_storytellers_by_country", //The number of stories generated about your Page post ('Stories')
//       {
//           "period": "days_28"
//       },
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_storytellers_by_country",response)
//         }
//       }
//   );
// FB.api(
//       "/1688425971402749/insights/post_storytellers_by_city", //The number of People Talking About the Page by user city
//       {
//           "period": "days_28"
//       },
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_storytellers_by_city",response)
//         }
//       }
//   );

// FB.api(
//       "/1688425971402749/insights/post_storytellers_by_gender", //The number of People Talking About the Page by user age and gender

//       {
//           "period": "days_28"
//       },
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_storytellers_by_gender",response)
//         }
//       }
//   );
// FB.api(
//       "/1688425971402749/insights/page_fan_adds", //The number of People Talking About the Page by user age and gender

//       {
//           "period": "days_28"
//       },
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_storytellers_by_gender",response)
//         }
//       }
//   );
//~~~~~~~~~~~~~~~~~~~~~ page_fans
// FB.api(
//       "/1688425971402749/insights/page_fans", //The number of People Talking About the Page by user age and gender

//       {
//           "period": "days_28"
//       },
//       function (response) {
//         if (response && !response.error) {
//           /* handle the result */
//           console.log("post_storytellers_by_gender",response)
//         }
//       }
//   );
// // PAGE LIKES
// //https://graph.facebook.com/{{pagename}}/insights/page_views?access_token={{access_token_key}}&since=1420070400&until=1421625600 (UNIX TIME)

// FB.api(
//     "/{page-id}/likes",
//     function (response) {
//       if (response && !response.error) {
//         /* handle the result */
//       }
//     }
// );
// }

module.exports = {
  time: time
}
//make function for rendering page names by id, and then adding that page to the dashboard by id