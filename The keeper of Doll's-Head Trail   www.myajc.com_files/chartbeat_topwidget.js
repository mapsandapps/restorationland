/*jslint browser: true*/
/*globals cmg*/

function chartbeat_topwidget(divid, domain, limit, target, use_proxy) {
    this.divid = divid;
    this.domain = domain || this.clean_domain(location.host);
    this.limit = parseInt(limit, 10) || 5;

    var thisObj = this;
    var jsonp = 'cback' + Math.round(Math.random()*10000000);
    chartbeat_topwidget[jsonp] = function(data) {
        var drawWrapper = function(success) {
            return function(blacklistRules) {
                thisObj.draw(data, success ? blacklistRules || [] : []);
            };
        };
        cmg.query.ajax('/analytics/blacklist-rules/')
            .success(drawWrapper(true))
            .error(drawWrapper(false));
    };
    var dataurl;

    // Request twice as many as we need in case some are excluded by blacklist rules.
    var request_limit = this.limit * 2;
    // Optional 5th argument triggers new behavior, and leaves the previous use case in place
    if (use_proxy) {
        dataurl = '//' + location.host + '/api/proxyapi/' + target + '/?host=' + this.domain +
                  '&jsonp=chartbeat_topwidget.' + jsonp + "&limit=" + request_limit;
    } else {
        dataurl = 'http://api.chartbeat.com/toppages/?host=' + this.domain +'&jsonp=chartbeat_topwidget.' +
                  jsonp + '&apikey=' + target + "&limit=" + request_limit;
    }
    var headID = document.getElementsByTagName('head')[0];
    var newScript = document.createElement('script');
    this.mysite_tracking(this.domain);

    newScript.type = 'text/javascript';
    newScript.src = dataurl;
    headID.appendChild(newScript);
}

chartbeat_topwidget.rule_attribute_map = {
    'PA': 'path',
    'TI': 'i'
};

chartbeat_topwidget.rule_operator_map = {
    'CO': /* Contains */ function (s, x) { return s.indexOf(x) !== -1; },
    'SW': /* Starts with */ function (s, x) { return s.indexOf(x) === 0; },
    'EW': /* Ends with */ function (s, x) { return s.indexOf(x, s.length - x.length) !== -1; },
    'EQ': /* Equals */ function (s, x) { return s === x; }
};

chartbeat_topwidget.unblacklist = function(pages, blacklistRules) {
    blacklistRules = blacklistRules || [];
    return pages.filter(function(page) {
        return !blacklistRules.some(function (rule) {
            var operator = chartbeat_topwidget.rule_operator_map[rule.operator] || function () { return false; },
                attribute = page[chartbeat_topwidget.rule_attribute_map[rule.attribute]],
                attributeLower = attribute && attribute.toLowerCase(),
                valueLower = rule.value && rule.value.toLowerCase(),
                blacklisted = attributeLower && valueLower && operator(attributeLower, valueLower);
            if (blacklisted && window.console) {
                console.log('Trending now page excluded: ' + JSON.stringify(page));
            }
            return blacklisted;
        });
    });
};

// Due to Chartbeat's "subdomain handling" feature, paths may come back as 'foo.com/blah'
// which will be interpreted as a relative path.  If our path appears to start with a
// domain we should prefix it with '//' so it points to the correct location.
chartbeat_topwidget.shim_path = function(path) {
    // Regex stolen from http://stackoverflow.com/a/20046959/1313611
    // See the domains tested in testPathShim for example matches.
    var isDomainRegex =
            /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9\-]{2,30}\.[a-zA-Z]{2,3})$/,
        isHttpRegex = /^https?:\/\/.*/,
        parts = path.split('/'),
        head = parts[0];
    if (isDomainRegex.test(head)) {
        var tail = Array.prototype.slice.call(parts, 1),
            newParts = [head].concat(tail);
        return '//' + newParts.join('/');
    }
    if (!isHttpRegex.test(path) && path.length && path[0] !== '/') {
        return '/' + path;
    }
    return path;
};

chartbeat_topwidget.prototype.show = function(pages, blacklistRules) {
    pages = chartbeat_topwidget.unblacklist(pages, blacklistRules).slice(0, this.limit);
    var toListItem = function (page) {
        var path = encodeURI(chartbeat_topwidget.shim_path(page.path));
        return '<li><a href="' + path + '?ref=cbTopWidget' + window.mysiteTracking + '">' + page.i + '</a></li>';
    };
    return '<ul>' + (pages.length === 0 ? '<li>Currently no pages listed.</li>'
                                        : pages.map(toListItem).join('')) +
           '</ul>';
};

chartbeat_topwidget.prototype.draw = function(pages, blacklistRules) {
    document.getElementById(this.divid).innerHTML = this.show(pages, blacklistRules);
};

chartbeat_topwidget.prototype.clean_domain = function(domain) {
  domain = domain.replace(/^https?:\/\//i,'');
  domain = domain.replace(/\s*/g,'');
  domain = domain.replace(/^(www.)/i,'');
  domain = domain.replace(/\/.*/g,'');
  domain = domain.replace(/[^0-9A-Za-z.\-]*/g,'');
  return domain;
};

chartbeat_topwidget.prototype.mysite_tracking = function(domain) {
    if (domain.substring(0,2) === 'my') {
        this.site = domain.replace(/^([a-z0-9\-]+)(?:\.com|\.net)$/, '$1');
        window.mysiteTracking = '&icmp=' + this.site + '_internallink_cbpopular_bottom';
    } else {
        window.mysiteTracking = '';
    }
    return window.mysiteTracking;
};

// TODO: Refactor this into a component with jasmine tests. [CMSTC-1180]
chartbeat_topwidget.test_suite = (function () {
    var assert = function(test, msg) {
        if (!test) {
            throw Error('AssertionError: ' + (msg || test + ' is not true.'));
        }
    };
    var assertEqual = function(x, y) { assert(x === y, x + ' !== ' + y); };
    var assertDefined = function(x) { assert(x !== undefined, 'Value is undefined'); };
    var assertStartsWith = function(s, prefix) { assertEqual(s.slice(0, prefix.length), prefix); };
    return {
        run: function() {
            Object.keys(chartbeat_topwidget.test_suite).filter(function(k) {
                return (/^test/).test(k);
            }).forEach(function(k) {
                console.log('Running ' + k);
                chartbeat_topwidget.test_suite[k]();
                console.log('Passed!');
            });
        },
        // This test requires blacklist rules added to the admin that conform to [CMSTC-1050].
        testUnblacklist: function() {
            var badPages = [
                {path: '/foo/bar/', i: 'Contact Us'},
                {path: '/', i: 'Home'},
                {path: '/weblogs/blah/', i: 'Blah'},
                {path: '/s/sports/', i: 'Sports'},
                {path: '/contact-us/blah/', i: 'Get in touch'}
            ];
            var goodPages = [
                {path: '/foo/', i: 'Foo'},
                {path: '/bar/', i: 'Bar'},
                {path: '/baz/', i: 'Baz'},
                {path: '/quux/', i: 'Quux'}
            ];

            var blacklistRules;
            cmg.query.ajax({url: '/analytics/blacklist-rules/', async: false})
                .success(function(data) { blacklistRules = data; });

            var pages = Array.prototype.concat.apply(badPages, goodPages),
                resultPages = chartbeat_topwidget.unblacklist(pages, blacklistRules),
                resultPagesJson = JSON.stringify(resultPages),
                goodPagesJson = JSON.stringify(goodPages);
            assertDefined(resultPagesJson);
            assertDefined(goodPagesJson);
            assertEqual(resultPagesJson, goodPagesJson);
        },
        testShow: function() {
            var emptyBlacklistRules = [];
            var show = chartbeat_topwidget.prototype.show.bind({limit: 5});
            var result, expected;
            result = show([], emptyBlacklistRules);
            expected = '<ul><li>Currently no pages listed.</li></ul>';
            assertEqual(result, expected);
            result = show([{path: '/foo/bar/', i: 'Foo Bar'}], emptyBlacklistRules);
            expected = '<ul><li><a href';
            assertStartsWith(result, expected);
        },
        testPathShim: function() {
            var paths = [
                {value: 'foo.com/foo', expected: '//foo.com/foo'},
                {value: '/bar/', expected: '/bar/'},
                {value: 'baz/', expected: '/baz/'},
                {value: 'quux.museum/quux/quux/', expected: '//quux.museum/quux/quux/'},
                {value: 'spam.co.uk/eggs/', expected: '//spam.co.uk/eggs/'},
                {value: 'http://haha.com/blah/', expected: 'http://haha.com/blah/'},
                {value: 'https://haha.com/blah/', expected: 'https://haha.com/blah/'}
            ];
            paths.forEach(function(path) {
                assertEqual(chartbeat_topwidget.shim_path(path.value), path.expected);
            });
        }
    };
}());
