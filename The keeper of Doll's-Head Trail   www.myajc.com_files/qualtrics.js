//create holder for qualtrics objects
cmg.cmg_qualtrics = {};

cmg.cmg_qualtrics.load = function(){
    //slightly modified zone loading script
    var cmg_qualtrics_zid = cmg.cmg_qualtrics.getMyQueryString("zid");
    if(cmg_qualtrics_zid != ""){
    var cmg_qualtrics_ed = '';
    var cmg_qualtrics_url='https://siteintercept.qualtrics.com/WRSiteInterceptEngine/?Q_ZID=' + cmg_qualtrics_zid  + cmg_qualtrics_ed;
    var cmg_qualtrics_sampleRate=parseInt(cmg.cmg_qualtrics.getMyQueryString("rate"));
    var q_si_f = function(){
        if (Math.random() >= cmg_qualtrics_sampleRate/100)
            return;
    var s=document.createElement('script');
        s.type='text/javascript';
        s.src=cmg_qualtrics_url+'&Q_LOC='+encodeURIComponent(window.location.href);
        if(document.body)document.body.appendChild(s);};
        try{if (window.addEventListener){
            window.addEventListener('load',q_si_f,false);
        }else if (window.attachEvent){
            r=window.attachEvent('onload',q_si_f);}
        else {}
        }catch(e){};
    }
}

cmg.cmg_qualtrics.getMyQueryString = function(key, default_) {
    //get the query string items for the current script
    //is there a utility object that may hold this?
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index];
        if (default_ == null) default_ = "";
            key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(myScript.src);
        if (qs == null)
            return default_;
        else
            return qs[1];
}
//load qualtrics zone
cmg.cmg_qualtrics.load();
