var _ndnBkmHost = 'pp-serve.newsinc.com';
var _cachedHost = 'http://dme.newsinc.com'.slice(7);

var _ndnBuyerId = 'atlantajournalconstitutio_12699';
var distributorId = '12699';
var partnerId = '129';

var _matchers = [];
var placements;

var _insid = '', _uut = '';
var getLegacyEmbedUrl,handleAmazonEmbed;
                        isMTP = true;
                      var NDNAnalytics = (typeof (NDNAnalytics) == 'undefined') ? {} : NDNAnalytics;

NDNAnalytics.ANALYTICS_USER_TOKEN = "ANALYTICS_USER_TOKEN";
NDNAnalytics.BASE_SERVICE_URL = "http://analytics.newsinc.com/";

NDNAnalytics.hasFlash = navigator.mimeTypes && navigator.mimeTypes.length ? Array.prototype.slice.call(navigator.mimeTypes).some(function(a) { return "application/x-shockwave-flash" == a.type; }) : /MSIE/.test(navigator.userAgent) ? eval("try { new ActiveXObject('ShockwaveFlash.ShockwaveFlash') && !0 } catch(e) { !1 };") : !1;

NDNAnalytics.generateUuid = function () {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [];
    var r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (var i = 0; i < 36; i++) {
        if (!uuid[i]) {
            r = 0 | Math.random() * 16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    var d = new Date();
    return (uuid.join('') + d.getTime());
};

NDNAnalytics.setAnalyticsCookie = function () {
    var cookieCheck = NDNAnalytics.getAnalyticsUserToken();
    if (cookieCheck === null) {
        var token = NDNAnalytics.generateUuid();
        NDNAnalytics.setCookie(NDNAnalytics.ANALYTICS_USER_TOKEN, token, 30);
        return token;
    } else {
        return cookieCheck;
    }
};

NDNAnalytics.getAnalyticsUserToken = function () {
    return NDNAnalytics.getCookie(NDNAnalytics.ANALYTICS_USER_TOKEN);
};

NDNAnalytics.appendScript = function (url) {
    var script = document.createElement("script");
    script.setAttribute("src", url);
    script.setAttribute("type", "text/javascript");
    var head1 = document.getElementsByTagName("head")[0];
    head1.appendChild(script);
};

NDNAnalytics.setCookie = function (sName, sValue, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = sName + "=" + escape(sValue) + ((expiredays === null) ? "" : ";expires=" + exdate.toGMTString());
};

NDNAnalytics.getCookie = function (sName) {
    var aCookie = document.cookie.split("; ");
    for (var i = 0; i < aCookie.length; i++) {
        var aCrumb = aCookie[i].split("=");
        if (sName == aCrumb[0]) return unescape(aCrumb[1]);
    }
    return null;
};

NDNAnalytics.savePageView = function (WidgetID, FullUrl, ParentUrl, SiteSectionID, AdNetworkID) {
    var token = NDNAnalytics.setAnalyticsCookie();
    var wsUrl = NDNAnalytics.BASE_SERVICE_URL + 'AnalyticsProvider/jsonp/analytics/PageViewJSONP?' +
        'wid=' + WidgetID + '&uut=' + token + '&furl=' + FullUrl +
        '&purl=' + ParentUrl + '&ssid=' + SiteSectionID + '&anid=' + AdNetworkID;
    NDNAnalytics.appendScript(wsUrl);
};





var NDNRender = (typeof(NDNRender) == 'undefined') ? {} : NDNRender;

NDNRender.vh = "javascript:void(null);";

NDNRender.url = document.URL.replace(/'/g,"%27") ; //chrome and safari dont encode single-quotes in the url

NDNRender.title = document.title.substring(0,150);// To customize, scroll to "Start Customization"

getCanonicalURL = function() {

//(Open Graph): <meta property="og:url" content="http://www.detroitnews.com/article/20140219/BIZ/302190145">
   var metas = document.getElementsByTagName('meta'); 
   for (i=0; i<metas.length; i++) { 
      if (metas[i].getAttribute("property") == "og:url") { 
         return metas[i].getAttribute("content"); 
      } 
   } 

//search: <link rel="canonical" href="http://www.detroitnews.com/article/20140219/BIZ/302190145" />
   var links = document.getElementsByTagName('link'); 
   for (i=0; i<links.length; i++) { 
      if (links[i].getAttribute("rel") == "canonical") { 
         return links[i].getAttribute("href"); 
      } 
   } 

};


targetsMap = function(url) {
    var uparts = url.split(/[\?\#]+/); //split at ? or #
    var splits = uparts[0].split('/');      

    // All URL parts
    this.urlparts = new Object();   
    this.urlparts.target = new Array(); 
    // var upt = new Array();
    for (i=3; i < splits.length ; i++) {
      var subsplits = splits.slice(0,i);
      this.urlparts.target[i-3] = subsplits.join('/') + "/";
    }
    //this.urlparts.target = upt.join(',');
    this.urlparts.shortDesc = "All URL parts";
    this.urlparts.longDesc  = "Match all url parts";

    // Canonical url
    this.canonical = new Object();
    this.canonical.target = (typeof canonical_url === 'undefined') ? getCanonicalURL() : canonical_url;
console.log("[Perfect Pixel] OG/canonical url = " + this.canonical.target);
    this.canonical.shortDesc = "Open Graph or Canonical URL";
    this.canonical.longDesc  = "Place selected videos on pages that contain the same Open Graph url tag or canonical URL tag";

    // exact matcher
    this.exactMatch = new Object();
    this.exactMatch.target = url;
    this.exactMatch.shortDesc = "Default";
    this.exactMatch.longDesc  = "Place selected videos on this URL";

    // NYDN/  http://dev.assets.newsinc.com/QA/perfectpixel/qa/20130220/41212/singleboth_00.html*
    // match without query params
    this.dropParams = new Object();
    this.dropParams.target = uparts[0]+'*';
    this.dropParams.shortDesc = "Ignore query parameters";
    this.dropParams.longDesc  = "Place selected videos on this page with your predefined query parameters appended to the end of the URL";
  
    // LEE/  http://dev.assets.newsinc.com/QA/perfectpixel/qa/20130220/*/singleboth_00.html
    // drop slug line before last component
    var newarr = splits.slice(0, (splits.length - 2));
    newarr[newarr.length] = '*';
    newarr[newarr.length] = splits[splits.length - 1];
    this.leeSlug = new Object();
    this.leeSlug.target = newarr.join('/');
    this.leeSlug.shortDesc = "Ignore slug name";
    this.leeSlug.longDesc  = "Place your selected videos on this URL while allowing the slug name to change at any time";
  
    // CHARLOTTE/  http://dev.assets.newsinc.com/QA/perfectpixel/qa/20130220/41212/* 
    // drop last component in URL
    newarr = splits.slice(0, (splits.length - 1));
    newarr[newarr.length] = '*';
    this.charlotte = new Object();
    this.charlotte.target = newarr.join('/');
    this.charlotte.shortDesc = "Ignore everything in the URL past article ID";
    this.charlotte.longDesc  = "Place your selected videos on the current page + ignore any positions in the URL following the article ID";
   
    // COX/  http://www.palmbeachpost.com/*/nWWWx/
    // Ignore positions in the URL path and slug name
    newarr = splits.slice(0, 3);    //get the base url
    newarr[newarr.length] = '*';
    newarr[newarr.length] = splits[splits.length - 2]; //get the last part
    newarr[newarr.length] = '';
    this.cox = new Object();
    this.cox.target = newarr.join('/');
    this.cox.shortDesc = "Ignore positions in the URL path and slug name";
    this.cox.longDesc  = "Place your selected videos on the current page/ URL + ignore all positions between the base URL and the article ID";

    // DENVER/  http://www.denverpost.com/*/ci_22784626/*  
    // ignore second position of the url path and everything past the article ID    
    newarr = splits.slice(0, (splits.length - 1));
    newarr[newarr.length] = '*'; //ignore past the article ID
    newarr[3] = "*"; //ignore second position
    this.denver = new Object();
    this.denver.target = newarr.join('/');
    this.denver.shortDesc = "Ignore the second position of the URL path and everything past the article ID";
    this.denver.longDesc  = "Place selected videos on the current URL and ignore the second position between the base URL and the article ID";  

    // OMAHA  Handle both kinds of urls below
    //     http://omaha.com/article/20130709/AP09/130709671#article-title 
    //     http://omaha.com/article/20130709/AP09/130709671/12#article-title    
    if(splits.length == 8){
        newarr = splits.slice(0, (splits.length - 1));        
    }else{
        var n = splits[splits.length-1].indexOf('#');
        splits[splits.length-1] = splits[splits.length-1].substring(0, n != -1 ? n : splits[splits.length-1].length);        
        newarr = splits.slice(0, (splits.length));
    }
    newarr[newarr.length-1] = newarr[newarr.length-1] + '*';
    this.omaha = new Object();
    this.omaha.target = newarr.join('/');
    this.omaha.shortDesc = "Ignore everything in the URL past article ID";
    this.omaha.longDesc  = "Place your selected videos on the current page + ignore any positions in the URL following the article ID";
  
    // CSM/  http://www.csmonitor.com/USA/Politics/2013/0411/foo-bar-baz*  
    // ignore query params and "-video" at the end of the url    
    newarr = uparts[0];   // get the url without query params    
    if(newarr.slice(newarr.length-6,newarr.length).toUpperCase() === "-video".toUpperCase()){
        newarr = newarr.slice(0,newarr.length-6);
    }
    this.csm = new Object();
    this.csm.target = newarr + '*';
    this.csm.shortDesc = "Ignore query parameters and -video";
    this.csm.longDesc = "Place selected videos on the current URL and ignore query parameters and -video at the end of the url";

    // OMAHA_SECTION/  http://www.omaha.com/article/*/LIVING*  
    // ignore third position of the url path and everything past the section    
    newarr = splits.slice(0, (splits.length - 2));
    newarr[newarr.length] = '';     
    newarr[4] = "*"; //ignore third position    
    this.omahaSection = new Object();
    this.omahaSection.target = newarr.join('/');
    this.omahaSection.shortDesc = "Target a Section";
    this.omahaSection.longDesc  = "Place selected content on the current URL and ignore the third position between the base URL and the article ID";  
    
    // OMAHA-SECTION-2/  http://www.omaha.com/article/*/LIVING*  
    // ignore third position of the url path and everything past the section    
    newarr = splits.slice(0, 6);
    newarr[newarr.length] = '';     
    newarr[4] = "*";    
//    joins[joins.length] = newarr.join('/');
    this.omahaSection2 = new Object();
    this.omahaSection2.target = newarr.join('/');
    this.omahaSection2.shortDesc = "Target a Section2";
    this.omahaSection2.longDesc  = "Place selected content on the current URL and ignore the third position between the base URL and the article ID";  

  return this;
};

function renderTarget(x,isDefault){

  var _id = "t-" + x.shortDesc.replace(/\s+/g, '-').toLowerCase();

  var _label = $("<label class='target_loc_container' />");
  var _input = document.createElement('input');
  _input.setAttribute("type", "radio");
  _input.setAttribute("name", "target_loc");
  _input.setAttribute("class", "target_loc_radio");
  //strip * from end of target if exists
  if(x.target.charAt(x.target.length - 1)=='*'){
    _input.value = x.target.substring(0,x.target.length - 1);
  }else{
    _input.value = x.target;
  }
  //_input.value = x.target;
  if(isDefault==true){
     _input.setAttribute("checked", true);
  }
  _label.append(_input);
  
  var _span =  document.createElement('span'); 
  _span.setAttribute("class", "target_loc_span");
  _span.innerHTML = x.shortDesc;
  _label.append(_span);

  var _detailsLink = document.createElement('span');
  _detailsLink.setAttribute("onClick","$('#" + _id + "').toggle('show');$(this).toggleClass('target_loc_btn_down');");
  //_detailsLink.setAttribute("style","cursor:pointer;padding:4px;border:2px solid #f00;");
  _detailsLink.setAttribute("class","target_loc_btn_up");
  _detailsLink.innerHTML = "";
  _label.append(_detailsLink);
  
  var _detailsDiv = document.createElement('div');
  _detailsDiv.setAttribute("id",_id);
  _detailsDiv.setAttribute("style","display:none;padding:4px;word-wrap:break-word;");
  _detailsDiv.innerHTML = x.longDesc;
  _detailsDiv.innerHTML += "<br/><br/><span style='color:#F58800'>"+x.target+"</span>";
  _label.append(_detailsDiv);
  
  $("#target_loc").append(_label);
}


//
(function() {

var url;
var tm;

if (typeof ndn_target_url === 'undefined'){ //i.e. we are not in the bookmarklet

    url = NDNRender.url;
    tm = targetsMap(url);

}else{ //i.e. we are in the bookmarklet

    url = ndn_target_url;
    tm = targetsMap(url);

    $("#target_loc").empty();  

//Start Customization
//Comment out the renderTarget calls that are not needed
//To set the default checked radio button, use the second param(true/false)

//    renderTarget(tm.exactMatch,true);           
      renderTarget(tm.dropParams,true);
//    renderTarget(tm.leeSlug,false);
//    renderTarget(tm.charlotte,false);
//    renderTarget(tm.cox,false);
//    renderTarget(tm.denver,false);
//    renderTarget(tm.csm,true);

//End Customization
            ndn_target_url =  $("input[name='target_loc']:checked").val();

    $("input[name='target_loc']").change(
      function() { ndn_target_url =  $("input[name='target_loc']:checked").val();        
        $("input[name='target_loc']").next().css('color', 'black');
        $("input[name='target_loc']:checked").next().css('color', '#F58800'); } 
    );

  } //end else

//Start Customization
//Comment out the matchers that are not needed

    _matchers.push.apply(_matchers, tm.urlparts.target);
    _matchers.push(tm.canonical.target);
    _matchers.push(tm.dropParams.target.slice(0,-1));

/*
    _matchers.push(tm.leeSlug.target);
    _matchers.push(tm.charlotte.target);
    _matchers.push(tm.cox.target);
    _matchers.push(tm.denver.target);
    _matchers.push(tm.csm.target);
    _matchers.push(tm.omahaSection.target);
    _matchers.push(tm.omahaSection2.target);
    _matchers.push(tm.omaha.target);
*/

    _matchers.push(tm.exactMatch.target); //keep at the end

})();

NDNRender.setAttribute = function(e, k, v) {
  if (k == "class") {
    e.setAttribute("className", v);   // set both "class" and "className"
  }
  return e.setAttribute(k, v);
};

NDNRender.createElement = function(e, attrs) {
    var el = document.createElement(e);
    for (var k in attrs) {
        if (k == "text") {
            el.appendChild(document.createTextNode(attrs[k]));
        } else {
            NDNRender.setAttribute(el, k, attrs[k]);
        }
    }
    return el;
};

NDNRender.remove = function(e) {
    e.parentNode.removeChild(e);
};

NDNRender.loadScript = function(_src) {
    var e = document.createElement('script');
    e.src = _src;
    e.type = "text/javascript";
    e.async = true;
//    var NDNScript = document.getElementsByTagName('head')[0];
//    NDNScript.appendChild(e);
//    document.body.appendChild(e);
    document.getElementsByTagName("head")[0].appendChild(e);

};

NDNRender.loadScriptCB = function(url,callback) {
  var script = document.createElement("script")
  script.type = "text/javascript";
  if(script.readyState) {  //IE
    script.onreadystatechange = function() {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {  //Others
    script.onload = function() {
      callback();
    };
  }
  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}

NDNRender.listen = function(elem, evnt, func) {
    if (elem.addEventListener) // W3C DOM
        elem.addEventListener(evnt,func,false);
    else if (elem.attachEvent) { // IE DOM
        var r = elem.attachEvent("on"+evnt, func);
        return r;
    }
};

NDNRender.urlVars = function() {

  var uparts = NDNRender.url.split(/[\?\#]+/); //split at ? or #
  var splits = uparts[0].split('/');

  var joins = new Array();
  for (i=3; i < splits.length ; i++) {
     var subsplits = splits.slice(0,i);
     joins[i-3] = subsplits.join('/') + "/";
  }

  joins[joins.length] = uparts[0];

  var newarr = splits.slice(0, (splits.length - 2));
  newarr[newarr.length] = '*';
  newarr[newarr.length] = splits[splits.length - 1];

  joins[joins.length] = newarr.join('/');

  if (uparts.length > 1) {
    joins[joins.length] = uparts.join('?');
  }

    // COX/  http://www.palmbeachpost.com/*/nWWWx/
    // Ignore positions in the URL path and slug name
    newarr = splits.slice(0, 3);    //get the base url
    newarr[newarr.length] = '*';
    newarr[newarr.length] = splits[splits.length - 2]; //get the last part
    newarr[newarr.length] = '';
    joins[joins.length] = newarr.join('/');

    // DENVER/  http://www.denverpost.com/*/ci_22784626/
    // ignore second position of the url path and everything past the article ID
    newarr = splits.slice(0, (splits.length - 1));
    newarr[newarr.length] = '';
    newarr[3] = "*";
    joins[joins.length] = newarr.join('/');

    // OMAHA/ http://omaha.com/article/20130709/AP09/130709671*
    if(splits.length == 8){
        newarr = splits.slice(0, (splits.length - 1));
    }else{
        var n = splits[splits.length-1].indexOf('#');
        splits[splits.length-1] = splits[splits.length-1].substring(0, n != -1 ? n : splits[splits.length-1].length);
        newarr = splits.slice(0, (splits.length));
    }
    joins[joins.length] = newarr.join('/');

    // CSM/  http://www.csmonitor.com/USA/Politics/2013/0411/foo-bar-baz*
    // ignore query params and "-video" at the end of the url
    newarr = uparts[0];   // get the url without query params
    if(newarr.slice(newarr.length-6,newarr.length).toUpperCase() === "-video".toUpperCase()){
        newarr = newarr.slice(0,newarr.length-6);
    }
    joins[joins.length] = newarr;

    // OMAHA-SECTION/  http://www.omaha.com/article/*/LIVING*
    // ignore third position of the url path and everything past the section
    newarr = splits.slice(0, 6);
    newarr[newarr.length] = '';
    newarr[4] = "*";
    joins[joins.length] = newarr.join('/');

  return "'" + joins.join("','") + "'";
};

var writeWidget = function(placementID){
  var orig_document_write = document.write;
  var pardiv = document.getElementById(placements["widget@"+placementID].target);
  while( pardiv.hasChildNodes()){ pardiv.removeChild(pardiv.lastChild);}
  NDNRender.loadScriptCB(('https:' == document.location.protocol ? 'https://' : 'http://') + _cachedHost + '/js/postscribe-version-1.1.0/htmlParser/htmlParser.js',function(){
    NDNRender.loadScriptCB(('https:' == document.location.protocol ? 'https://' : 'http://') + _cachedHost + '/js/postscribe-version-1.1.0/postscribe.js', function(){
      if (NDNAnalytics.hasFlash){
        postscribe(pardiv,placements["widget@"+placementID].embed);
 //       pardiv.style.cssText = 'display: block; margin: 0px;';
        NDNAnalytics.savePageView(23681, encodeURIComponent(NDNRender.url), null, placements["widget@"+placementID].sitesection, placements["widget@"+placementID].freewheel);
      }
    });
  });
  document.write = orig_document_write;
};

function getUrlParameters(parameter, staticURL, decode){
   var currLocation = (staticURL.length)? staticURL : window.location.search,
       parArr = currLocation.split("?")[1].split("&"),
       returnBool = true;   
   for(var i = 0; i < parArr.length; i++){
        parr = parArr[i].split("=");
        if(parr[0] == parameter){
            return (decode) ? decodeURIComponent(parr[1]) : parr[1];
            returnBool = true;
        }else{
            returnBool = false;            
        }
   }   
   if(!returnBool) return false;  
};

function getBehavior(isMTP, WID, bhvr){
  if(bhvr){
    return bhvr;
  }else{
    if ((WID==24222) || (WID==15468)){
      return "AP";
    }else{
      if (isMTP){
        return "MTP";
      }else{
        return "CTP";
      }
    }
  }
};

(function($) {

  getPlacements = function(){
    if(_matchers.length === 0){
      var placementsURL = ("https:" == document.location.protocol ? "https://" : "http://") + _ndnBkmHost
      + "/repub/" + _ndnBuyerId + "/getPlacements.js?pid=" + partnerId + "&dpid=" + distributorId + "&title=" + encodeURIComponent(NDNRender.title) + "&uut=" + _uut + "&insid=" + _insid + "&loc=" + encodeURIComponent(NDNRender.url) + "&matchers="
      + encodeURIComponent(NDNRender.urlVars());
    }else{
      var placementsURL = ("https:" == document.location.protocol ? "https://" : "http://") + _ndnBkmHost
      + "/repub/"+ _ndnBuyerId + "/getPlacements.js?pid=" + partnerId + "&dpid=" + distributorId + "&title=" + encodeURIComponent(NDNRender.title) + "&uut=" + _uut + "&insid=" + _insid + "&loc=" + encodeURIComponent(NDNRender.url) + "&matchers="
      + encodeURIComponent("'" + _matchers.join("','") + "'");
    }
    return JSON.parse($.ajax({
      type: 'GET',
      url: placementsURL,
      dataType: 'json',
      global: false,
      async:false,
      success: function(data) {
        return data;
      }
    }).responseText);
  }

  //placements = getPlacements();

  getLegacyEmbedUrl = function (containerElementId) {
    console.log("[Perfect Pixel] getLegacyEmbedUrl('" + containerElementId + "') called");
    for(var i=0;i<placements.length;i++){
      if(placements[i].target == containerElementId){
        if(placements[i].render_app == 'blank'){
          console.log("[Perfect Pixel] Auto-blocker exists for " + containerElementId);
          return;
        }
        if(placements[i].ndn_vid_id == '' || placements[i].ndn_vid_id == '0'){
          console.log("[Perfect Pixel] No VID for " + containerElementId);
          return;
        }
        console.log("[Perfect Pixel] Returning " + placements[i].render_app + " placement " + placements[i].url);
        return placements[i].url;
      }
    }
    console.log("[Perfect Pixel] There are no placements for " + containerElementId);
    return;
  };

  handleAmazonEmbed = function(containerElementId) {
//    console.log("[Perfect Pixel] handleAmazonEmbed('"+containerElementId+"') called");
    if(placements["widget@"+containerElementId]){
      writeWidget(containerElementId);
      return true;
    }else{return false;}
  }

})(_nw2e.jQuery);


var _ndnq = _ndnq || [], _nw2e = _nw2e || [];
_ndnq.push(['when', 'initialized', function() {
  _nw2e.Ndn_Analytics.getIds().done(function() {

    _insid = _nw2e.Ndn_Analytics.getPageViewSessionId() || '';
    _uut = _nw2e.Ndn_Analytics.getUniqueUserId() || '';

    placements = getPlacements();
    var jsonPlacements = (typeof(placements.placements) !== 'undefined') ? placements.placements : [];
    var jsonRecommendations = (typeof(placements.recData) !== 'undefined') ? placements.recData.videos : [];
    var recIndex = 0;
    for(var i=0;i<jsonPlacements.length;i++){
      if(jsonPlacements[i].render_app=='dynamic'){
        var dynVID = (typeof(jsonRecommendations[recIndex]) !== 'undefined') ? jsonRecommendations[recIndex].vid : "";
        jsonPlacements[i].ndn_vid_id = dynVID;
        jsonPlacements[i].url = jsonPlacements[i].url.split("?")[0]+ '?VID='+dynVID+'&'+jsonPlacements[i].url.split("?")[1];
        recIndex++; 
      }
    }
    placements = jsonPlacements;

    _nw2e.jQuery('.ndn_embed:not(.ndn_embedded,[data-config-legacy-embed-url])[data-config-distributor-id="' + distributorId + '"]').each(function() {

      _legacyEmbedUrl = getLegacyEmbedUrl(_nw2e.jQuery(this).attr('id'));
      if(_legacyEmbedUrl){
       _nw2e.jQuery(this)
        .attr('data-config-legacy-embed-url', _legacyEmbedUrl )
          .removeClass('ndn_embed')
          .removeClass('ndn_embedding');

       var playOnMouseover = true, clickToPlay = false, autoPlay = false;
       var behavior = getBehavior(isMTP,getUrlParameters("WID",_legacyEmbedUrl), getUrlParameters("bhvr",_legacyEmbedUrl));

       // Embed the player using the NDN Player Suite's JavaScript API
       if (behavior=='MTP') {
        _ndnq.push(['embed', this, {
         autoPlay: false,
         playOnMouseover: 1
        }]);
       }
       else if (behavior=='CTP') {
        _ndnq.push(['embed', this, {
         autoPlay: false,
         playOnMouseover: 0
        }]);
       }
       else if (behavior=='AP') {
        _ndnq.push(['embed', this, {
         autoPlay: true,
         playOnMouseover: 0
        }]);
       }
       else {
        // The default embed behavior
        _ndnq.push(['embed', this]);
       }
      } //end if(_legacyEmbedUrl)

      if (handleAmazonEmbed(_nw2e.jQuery(this).attr('id'))) {
        return;
      }

    });

    // (_nw2e.Ndn_App || _nw2e.Ndn_Widget).embedWidgetsFromContainersOnPage();

  }); // To make execute logic without delay, remove this line (and other marked line above)
}]);

      