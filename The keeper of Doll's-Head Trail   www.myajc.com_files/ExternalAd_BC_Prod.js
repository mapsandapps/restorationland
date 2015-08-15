/*
 * Adify Brightcove Companion support script
 * -----------------------------------------
 *
 * Adapted from Brightcove VAST 2.0 documentation:
 * http://developer.brightcove.com/en/articles/working-vast-20-external-companion-ads
 *
 * Notes:
 * - Brightcove invokes bcsyncroadblock() when a companion is received
 * - Supporting functions create Companion objects; assign attributes and target div
 * - render() pushes the content to the page
 * - Valid VAST 2.0 companion formats supported: StaticResource, HTMLResource, IFrameResource
 */

var companionSet = [];
var companionSizes = {};

function Companion(id, data, w, h){
    this.id = id;
    this.data = data;
    this.width = w;
    this.height = h;
    this.click = '';
    this.format = '';
    this.targetDiv = 'companion-' + this.width + 'x' + this.height;
    this.setTargetDiv = function(id){
        this.targetDiv = id;
    }
    this.setClick = function(clickurl){
        this.click = clickurl;
    }
    this.setFormat = function(f){
        this.format = f;
    }
    this.toString = function(){
        if (this.format == 'StaticResource'){
            if (this.click != ''){
                return '<a href="' + this.click + '"><img style="border:none" src="' + this.data + '" width="' + this.width + '" height="' + this.height + '"/></a>';
            } else {
                return '<img style="border:none" src="' + this.data + '" width="' + this.width + '" height="' + this.height + '"/>';
            }
        }
        if (this.format == 'IFrameResource'){
            return '<iframe frameborder=0 width="' + this.width + '" height="' + this.height + '" src="' + this.data + '" />';
        }
        if (this.format == 'HTMLResource'){
            return this.data; // TODO: what do you want to do with the click?
        }
    }
}

function makeStaticAd(id, xml, w, h){
    var staticAd = new Companion(id, xml.childNodes[0].nodeValue, w, h);
    staticAd.setFormat('StaticResource');
    companionSet[id] = staticAd;
}

function makeHtmlAd(id, xml, w, h){
    var htmlAd = new Companion(id, xml.childNodes[0].nodeValue, w, h);
    htmlAd.setFormat('HTMLResource');
    companionSet[id] = htmlAd;
}

function makeIframeAd(id, xml, w, h){
    var iframeAd = new Companion(id, xml.childNodes[0].nodeValue, w, h);
    iframeAd.setFormat('IFrameResource');
    companionSet[id] = iframeAd;
}

function parseCompanionClickThrough(id, xml){
    url = xml.childNodes[0].nodeValue;
    var ad = companionSet[id]; // pointer by reference
    ad.setClick(url); // no need to update companionSet
}

function processDivIds(){
    for (var k in companionSet){
        size = companionSet[k].width + 'x' + companionSet[k].height;
        if (companionSizes[size] > 0){
            companionSizes[size] += 1;
        } else {
            companionSizes[size] = 1;
        }
    }

    for (var k in companionSet){
        var sz = companionSet[k].width + 'x' + companionSet[k].height;
        companionSet[k].targetDiv = companionSet[k].targetDiv + '-' + companionSizes[sz];
        companionSizes[sz] = companionSizes[sz] - 1;
    }
}

function render(){
    for (var k in companionSet){
        if (companionSet[k].targetDiv != 'undefined' && document.getElementById(companionSet[k].targetDiv)){
            document.getElementById(companionSet[k].targetDiv).innerHTML = companionSet[k].toString();
        }
    }
}

function bcsyncroadblock(xml){
    cmg.query('#HP01').addClass('hp01').attr('id','companion-728x90-1'); // for companion ads
    cmg.query('#RP01').addClass('rp01').attr('id','companion-300x250-1'); // for companion ads

    vastXML = getXMLDoc(xml);
    companions = vastXML.getElementsByTagName('Companion');

    for (var i = 0; i < companions.length; i++){
        var cwidth = companions[i].attributes.getNamedItem('width').nodeValue;
        var cheight = companions[i].attributes.getNamedItem('height').nodeValue;

        for (var j = 0; j < companions[i].childNodes.length; j++){
            var companionDetailNode = companions[i].childNodes[j];

            if (companionDetailNode.nodeType != 3){
                if (companionDetailNode.nodeName == 'StaticResource'){
                    var creativeType = companionDetailNode.attributes.getNamedItem('creativeType').nodeValue;
                    if (creativeType == 'text/html'){
                        makeIframeAd(i, companionDetailNode, cwidth, cheight);
                    } else {
                        makeStaticAd(i, companionDetailNode, cwidth, cheight);
                    }
                } else if (companionDetailNode.nodeName == 'IFrameResource'){
                    //parseIFrameResource(i,companionDetailNode, cwidth, cheight);
                } else if (companionDetailNode.nodeName == 'HTMLResource'){
                    makeHtmlAd(i, companionDetailNode, cwidth, cheight);
                } else if (companionDetailNode.nodeName == 'CompanionClickThrough'){
                    parseCompanionClickThrough(i, companionDetailNode);
                }
            } //!=3
        } //for
    } //for
    processDivIds();
    render();
}

function getXMLDoc(pXML){
    var adXML;
    if (window.ActiveXObject){
        //parses the XML for IE browsers
        adXML = new ActiveXObject("Microsoft.XMLDOM");
        adXML.async = false;
        adXML.loadXML(pXML);
    } else if (window.XMLHttpRequest){ //parses the XML for Mozilla browsers
        adXML = (new DOMParser()).parseFromString(pXML, "text/xml");
    }
    return adXML;
}