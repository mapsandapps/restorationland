cmg.query(document).ready(function () {
    if (cmg.query('.ndn_embed').length) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'http://launch.newsinc.com/js/embed.js';
        script.id = '_nw2e-js';
        head.appendChild(script);
    }
});
