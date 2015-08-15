(function ($) {
    $.fn.cmgsubnavify = function () {
        var active_item,
            $this = this,
            $subnav_content = $('div.nav-bar-subnav-content'),
            timeout = null,
            delta = 500, //mouse movement timeout
            tapped = null,
            tapped_times = 0,
            section_nav_height = 24,
            subnav_ad_height = 50,
            hide_me = function () {
                clearTimeout(timeout);
                $('div.nav-bar-subnav-ad').hide(0, function () {
                    $('a.dropdown-toggle').not($('a.dropdown-toggle', this)).removeClass('active');
                    $('div.nav-bar-subnav-content').hide();
                    $('div.nav-bar-subnav').addClass('hide');
                });
                active_item = undefined;
            };

        cmg.henka({
            min: 767
        }).init(function () {
        }).off(function () {
            $this.find('li').each(function () {
                var $this = $(this);

                $this.unbind('mouseover.cmgSubNavify touchstart.cmgSubNavify');
                $this.find('ul.subnav-sections').unwrap();
                if ($this.find('i.icon-minus').length > 0) {
                    $this.find('ul.subnav-sections').css('height', 'auto');
                } else {
                    $this.find('ul.subnav-sections').css('height', '0');
                }
            });
        }).on(function () {
            $this.find('li').each(function () {
                var $li = $(this),
                    normal_height;

                //copy bootstrap subnav without event bindings
                var _subnav = $li.find('.dropdown-menu'),
                    $subnav = _subnav.clone().removeClass('dropdown-menu'),
                    subnav_html = $subnav.html(); //needed for IE8 handling

                _subnav = $li.find('ul.subnav-sections');

                if (_subnav.parent().is('div.cmgBlockDisplay')) {
                    _subnav.unwrap();
                }

                _subnav.wrap('<div class="cmgBlockDisplay" style="display:none;overflow:hidden;visibility:hidden;" />');

                $li.on('mouseover.cmgSubNavify touchstart.cmgSubNavify', function (e) {
                    if (timeout !== null) {
                        clearTimeout(timeout);
                    }

                    timeout = setTimeout(function () {
                        if (active_item == $li) {
                            return;
                        }
                        active_item = $li;

                        $('a.dropdown-toggle').not($('a.dropdown-toggle', active_item)).removeClass('active');
                        $('a', active_item).addClass('active');

                        $subnav_content.html('')
                            .append($('<i/>', {
                                'class': 'icon-spinner'
                            }))
                            .show()
                            .load('/treemenus/menu/' + $li.data('menu') + '/', function (responseText) {
                                var $this = $(this);

                                if ($subnav.length > 0) {
                                    if ($subnav.html().length < subnav_html.length) {
                                      //ie8 fix
                                      $subnav.html(subnav_html);
                                    }
                                }

                                $this.prepend($subnav);
                                $('div.nav-bar-subnav').removeClass('hide');

                                if (responseText.trim().length > 0) {
                                    // Adjust heights
                                    if (normal_height === undefined || normal_height === 0 || normal_height === 74) {
                                        normal_height = Math.max.apply(Math, $.map($('ul.subnav-sections, div.subnav-list-latest, div.subnav-list-more-in', $this), function (el) {
                                            return $(el).outerHeight(true);
                                        }));
                                    }

                                    var height = normal_height + section_nav_height + subnav_ad_height + 'px';
                                    $('ul.subnav-sections, div.subnav-list-latest, div.subnav-list-more-in').height(height);
                                    setTimeout(function () {
                                        $(this).css('height', height);
                                        $('div.nav-bar-subnav-ad').css('top', normal_height + section_nav_height + 'px').show();
                                    }, 0);

                                    // For subnav on higher breakpoints, add a query string to text links to track what's clicked
                                    $('.subnav-list-latest a').each(function () {
                                        var href = $(this).attr('href');
                                        $(this).attr('href', href + subnav_url);
                                    });

                                    // For subnav on higher breakpoints, add a query string to image links to track what's clicked
                                    $('.subnav-list-more-in a').each(function () {
                                        var href = $(this).attr('href');
                                        $(this).attr('href', href + subnav_image);
                                    });
                                } else {
                                    hide_me(); //hide submenu if if there is no content
                                }
                            });
                    }, delta);

                    if (e.type === 'touchstart') {
                        tapped_times += 1;
                        if (tapped_times <= 1) {
                            $(document).on('touchstart.cmgSubNavify', function (e) {
                                if (!$(e.target).parent().is('div.nav-bar-subnav-content, div.subnav-list-latest')) {
                                    $(this).unbind('touchstart.cmgSubNavify');
                                    hide_me(); //hide submenu on a touch to close menu
                                    e.preventDefault();
                                }

                                if ($(e.target).is('a, img', 'figcaption')) {
                                  location.href = $(e.target).is('img') ? $(e.target).parent('a').attr('href') : $(e.target).attr('href');
                                  $(e.target).addClass('active');
                               }
                            });
                            e.preventDefault();
                        }

                        if (tapped_times <= 3) {
                            //a timeout to clear the double tap timer
                            tapped = setTimeout(function () {
                                tapped_times = 0;
                            }, delta);
                        }

                        if (tapped_times > 2) {
                            e.preventDefault();
                            location.href = $('a', this).attr('href');
                        }
                    }
                }) //end here
                .parent().on('mouseleave', hide_me);
            });
        }).update(true);
    };
}(cmg.query));
