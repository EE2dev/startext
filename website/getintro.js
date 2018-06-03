function getMyIntro() {
  var myIntro = [];
  var nextPage;
  var nextLine;
  var page;
  var queryVar;
  var pageCounter;
  var lineCounter;

  page = [];
  pageCounter = 0;
  lineCounter = 1;
  queryVar = decodeURIComponent(getAllUrlParams()["p" + pageCounter + "l" + lineCounter]);
  nextPage = (queryVar !== "undefined");

  while(nextPage){
    nextLine = (queryVar !== "undefined");
    console.log(queryVar);
    console.log(nextLine);

    while (nextLine){
      page.push(queryVar);
      lineCounter = lineCounter + 1;
      queryVar = decodeURIComponent(getAllUrlParams()["p" + pageCounter + "l" + lineCounter]);
      nextLine = (queryVar !== "undefined");
      console.log(queryVar);
      console.log(nextLine);  
    }

    queryVar = getAllUrlParams()["p" + pageCounter + "dl"];
    if (queryVar !== undefined) {
      page.defaultLine = startext[queryVar];
    }

    myIntro.push(page);

    pageCounter = pageCounter + 1;
    lineCounter = 1;
    page = [];
    queryVar = decodeURIComponent(getAllUrlParams()["p" + pageCounter + "l" + lineCounter]);
    nextPage = (queryVar !== "undefined");                
  }

  // options
  myIntro.background = decodeURIComponent(getAllUrlParams()["o0"]);
  if (myIntro.background === "COLOR") {
    myIntro.backgroundColor = decodeURIComponent(getAllUrlParams()["o1"]);
  } else {
    myIntro.backgroundImage = decodeURIComponent(getAllUrlParams()["o1"]);
  }
  myIntro.fontFamily = decodeURIComponent(getAllUrlParams()["o2"]);
  myIntro.explosionStrength = decodeURIComponent(getAllUrlParams()["o3"]);
  myIntro.transitionSpeed = decodeURIComponent(getAllUrlParams()["o4"]);
  myIntro.pause = decodeURIComponent(getAllUrlParams()["o5"]);
  myIntro.replay = (decodeURIComponent(getAllUrlParams()["o6"]) === "true");
  
  return myIntro;
}

// function from: https://www.sitepoint.com/get-url-parameters-with-javascript/
function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      // paramName = paramName.toLowerCase();
      // paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}