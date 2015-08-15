(function() {
    var $ = marimo.$;
    var _ = cmg._;
    var widgetlib = marimo.widgetlib;

    widgetlib.medley_comments = marimo.extend(widgetlib.request_widget, {
        init: function (data) {
            this.id = data.id;
            this.murl = data.murl;
            this.data = data;
            this.selector = '#' + this.id;
            this.blank_error = '<p class="sprite iconAlert">Please enter some text for your comment.</p>';
            this.post_error = '<p class="sprite iconAlert">There was a problem posting your comment. Please try again.</p>';

            this.parse_hash();

            $(window).bind('hashchange', _(function() {
                this.permalink_guard = false;
                this.parse_hash();
                this.setup_permalink();
            }).bind(this));

            this.on('comments_loaded', _(function() {
                this.setup_events();
                _(_(this.setup_permalink).bind(this)).delay(500);
            }).bind(this));

            $('body').on('comment_selected', _(function(e, data) {
                var comment_id = data.comment_id;
                var eq = _(function(x,y) { return x === y; }).bind({}, Number(comment_id));
                var ids = _(this.data.context.comments).pluck('comment_id');
                if (!_(ids).any(eq)) { return; }
                this.scroll_to_comment(comment_id);
            }).bind(this));

            this.add_request();

            return this;
        },
        transform: function (data) {
            // comment status context (the kwargs are required now to keep the Marimo template tag DRY);
            // the kwargs must be passed in from the page gen cached Django template for performance reasons
            data.context.comments_on = this.data.kwargs.comments_on;
            data.context.comments_frozen = this.data.kwargs.comments_frozen;

            // anonymous context (for non-admin users)
            // use $.cookie for premium sites, else cmg.get_cookie() for other sites
            var current_user = ($.cookie) ? $.cookie('ur_name') : cmg.get_cookie('ur_name');
            if (current_user) {
                data.context.current_screen_name = current_user;
            } else {
                data.context.anonymous = true;
            }

            // edit links
            // fix for Date.now() support in IE8 and older
            if (!Date.now) {
                Date.now = function() { return new Date().valueOf(); };
            }
            var now = Date.now() / 1000;
            _(data.context.comments).each(function(post) {
                // set editable node based on edit_expiration context node and frozen comments state
                post.editable = (data.context.comments_frozen !== true && post.poster === current_user && now-post.submitted_ts < (data.context.edit_expiration*60));
            });

            // pagination links
            var num_pages = data.context.num_pages;
            var page = data.context.page;

            var both = (num_pages > 1 && page > 1 && page !== num_pages); // condition for showing Next and Previous links
            var just_first = (num_pages > 2 && page !== 1); // condition for showing First link
            var just_last = (num_pages > 2 && page !== num_pages); // condition for showing Last link
            var just_previous = (num_pages > 1 && page === num_pages); // condition for showing ONLY Previous link
            var just_next = (num_pages > 1 && page === 1); // condition for showing ONLY Next link

            data.context.page_first = just_first; // first context to wrap around First link
            data.context.page_last = just_last; // last context to wrap around Last link
            data.context.page_newer = (both || just_next); // newer context to wrap around Next link
            data.context.page_older = (both || just_previous); // older context to wrap around Previous link

            // pagination item count
            var items_current_page = data.context.comments.length; // snag the current item count from the context array
            var items_per_page = data.context.comments_per_page; // snag the comments per page from the context
            var items_lower = (page * items_per_page) - (items_per_page - 1);
            var items_upper = items_lower + (items_current_page - 1);

            data.context.page_start_index = items_lower; // JS hack of Django Page.start_index()
            data.context.page_end_index = items_upper; // JS hack of Django Page.end_index()

            data.context.newlines = function () {
                return function (text, render) {
                    var str = render(text);
                    str = str.replace(/\n{2,}/g, "<br/><br/>");
                    return str.replace(/\n/g, "<br/>");
                };
            };

            return data;
        },
        parse_hash: function () {
            var hash_fragment = window.location.hash;
            var match = hash_fragment.match(/\/comment\/p(\d+)\/c(\d+)/);
            if (match) {
                this.data.kwargs.page = match[1];
                this.data.kwargs.highlight = match[2];
            }
        },
        refresh: function () {
            this.add_request();
            marimo.make_request();
        },
        hard_refresh: function () {
            this.add_request({cache_bust:true});
            marimo.make_request();
        },
        hide_edit_box: function (e) {
            var edit_form = $(e.target).parent(); // Marimo edit form
            var edit_alert = edit_form.parent().find('#comment_edit_alert'); // Marimo edit alert
            var comment_body = edit_form.parent().find('.cmCommentBody'); // Marimo actively edited comment body
            edit_form.hide(); // hide the comment edit form
            edit_alert.hide(); // hide the comment edit alert
            comment_body.removeClass('cmCommentPostEditHighlight round comment-post-edit-highlight').show(); // remove the highlighted comment body classes (animations would've been dequeued in show_edit_box method); immediately show the comment body
        },
        show_edit_box: function (e) {
            var cid = $(e.target).attr('data-cid'); // comment cid value
            if (!cid) { return console.error('panic: no comment_id in edit'); }

            var alert_selector = this.selector + ' #comment_edit_alert'; // Marimo comment widget edit alert
            var form_selector = this.selector + ' #comment_edit_form'; // Marimo comment widget edit form
            var comment_container_selector = ' #' + cid + ' .cmCommentContainer'; // Marimo specific comment container
            var comment_body_selector = '#' + cid + ' .cmCommentBody'; // Marimo specific comment body
            var post_text = $(comment_body_selector + ' p').html(); // comment text value

            $(form_selector + ' input[name=cid]').attr('value', cid); // set comment cid value on hidden input
            $(form_selector + ' textarea').attr('value', post_text); // set comment text value on textarea

            var edit_alert = $(alert_selector).detach(); // remove the commented edit alert container from the DOM
            var edit_form = $(form_selector).detach(); // remove the comment edit form container from the DOM
            edit_alert.hide(); // hide the detached alert in the event that it's visible prior to being detached from the DOM

            $(comment_body_selector).stop(true,true).hide(); // stop any comment body animation w/ clearQueue and jumpToEnd true; immediately hide the comment body
            $(comment_container_selector).prepend(edit_form).prepend(edit_alert); // prepend the comment edit alert and form containers to the comment container
            edit_form.show(); // show the edit form
            $('.cmCommentBody').not(comment_body_selector).show(); // show ALL comment bodies (reset) except (not) the one you're working with if 2+ edit links available
        },
        wrap_error: function(error) {
            return '<p class="sprite iconAlert">' + error.msg + '</p>';
        },
        edit: function () {
            var form_selector = this.selector + ' #comment_edit_form';
            var alert_selector = this.selector + ' #comment_edit_alert';
            // handle blank edit form
            if (!$(form_selector + ' textarea').attr('value')) {
                $(alert_selector).html(this.blank_error).show();
                return false;
            }
            $(form_selector + ' .cmCommentSubmitBtn').attr('disabled','disabled').attr('value','Please wait...');
            $.ajax({
                url:'/medley-comments/edit/',
                type:'POST',
                context:this,
                dataType:'json',
                data: {
                    cid:$(form_selector + ' input[name="cid"]').attr('value'),
                    text: $(form_selector + ' textarea').attr('value')
                },
                success: function (data) {
                    this.permalink_guard = false;
                    this.data.kwargs.highlight = data.cpage;
                    this.data.kwargs.highlight = data.cid;
                    this.hard_refresh();
                },
                error: function(data) {
                    var error = this.handle_ajax_error(data);
                    $(alert_selector).html(this.wrap_error(error)).show();
                    $(form_selector + ' .cmCommentSubmitBtn').removeAttr('disabled').attr('value','Edit comment');
                }
            });
        },
        post: function () {
            var form_selector = this.selector + ' #comment_post_form';
            var alert_selector = this.selector + ' #comment_post_alert';
            // handle blank post form
            if (!$(form_selector +' textarea').attr('value')) {
                $(alert_selector).html(this.blank_error).show();
                return false;
            }
            $(form_selector + ' .cmCommentSubmitBtn').attr('disabled','disabled').attr('value','Please wait...');
            $.ajax({
                url:'/medley-comments/post/',
                type:'POST',
                dataType:'json',
                context:this,
                data: {
                    content_type_id: $(form_selector + ' input[name=content_type_id]').attr('value'),
                    object_id: $(form_selector + ' input[name=object_id]').attr('value'),
                    site_id: $(form_selector + ' input[name=site_id]').attr('value'),
                    text: $(form_selector + ' textarea').attr('value')
                },
                success: function(data) {
                    if (!data.cpage || !data.cid) {
                        $(alert_selector).html(this.post_error).show();
                        $(form_selector + ' .cmCommentSubmitBtn').removeAttr('disabled').attr('value','Post comment');
                        return false;
                    }
                    fire_omniture_event(cmg.s_coxnews,'event36','Comment Posted'); // Omniture event36 for posting comment
                    this.permalink_guard = false;
                    this.data.kwargs.page = data.cpage;
                    this.data.kwargs.highlight = data.cid;
                    this.hard_refresh();
                },
                error: function(data) {
                    var error = this.handle_ajax_error(data);
                    $(alert_selector).html(this.wrap_error(error)).show();
                    $(form_selector + ' .cmCommentSubmitBtn').removeAttr('disabled').attr('value','Post comment');
                    // toleratating == here
                    if (error.status == '403') {
                        $(form_selector + ' .cmCommentSubmitBtn').attr('disabled','disabled');
                        $(form_selector + ' textarea').attr('disabled','disabled').css('background-color','#eee');
                    }
                }
            });
        },
        report_abuse: function (e) {
            var cid = $(e.target).attr('data-cid'); // capture the target comment id
            if (!cid) { return console.error('panic: no comment id in report_abuse'); } // throw an error if there IS no comment id
            var kwargs = {
                thing_id:cid, // comment id from report abuse event target
                thing_name:'comment', // can be used for any object, so we need to name what's being removed
                content_type_id:this.data.comment_ct // comment content type id from medley comments view
            };
            if (!marimo.widgets.comment_mod_form_alert) {
                var widget_args = {
                    id: 'comment_mod_form_alert', // DOM id for comment mod form / alert widget
                    murl: this.data.murl, // ???
                    widget_prototype: 'medley_moderation_form', // Marimo widgetlib prototype to use
                    widget_name: 'medley_moderation_form', // ???
                    kwargs:kwargs, // bits/pieces for showing the right Mustache moderation template
                    args:[] // content type id and object id NOT required for abuse form
                };
                marimo.add_widget(widget_args);
            } else {
                marimo.widgets.comment_mod_form_alert.update({kwargs: kwargs});
            }
            marimo.widgets.comment_mod_form_alert.add_request();

            // moderation widget jQuery object
            var moderation_div = $('#comment_mod_form_alert');
            // 1. remove the moderation widget from the DOM
            // 2. hide the moderation widget first, in case it's already displayed
            // 3. clear the moderation widget's HTML content
            moderation_div.html('').hide().detach();

            // move the comment moderation widget to the appropriate comment
            $(this.selector + ' #' + cid + ' .cmCommentContainer').prepend(moderation_div);

            marimo.make_request();
            this.on(marimo.printf('%s_removed', [cid]), this.hard_refresh);
            this.on(marimo.printf('%s_flagged', [cid]), function() {
                // TODO: show success message in #comment_mod_form_alert (remove any Mustache template DOM elements first)
            });
        },
        goto_page: function (page_num) {
            this.scroll_to_comment(this.data.context.comments[0].comment_id);
            fire_omniture_event(cmg.s_coxnews,'event23','Comment Navigation'); // Omniture event23 for page navigation
            this.data.kwargs.page = Number(page_num);
            this.refresh();
        },
        change_page: function (direction) {
            this.scroll_to_comment(this.data.context.comments[0].comment_id);
            fire_omniture_event(cmg.s_coxnews,'event23','Comment Navigation'); // Omniture event23 for page navigation
            this.data.kwargs.page = Number(this.data.kwargs.page) + Number(direction);
            this.refresh();
        },
        first_page: function() {this.goto_page(1);},
        last_page: function() {this.goto_page(this.data.context.num_pages);},
        previous_page: function() {this.change_page(-1);},
        next_page: function() {this.change_page(1);},
        setup_permalink: function () {
            // we only want to do this once. we don't want to mess with
            // the comments display as the user pages, it will confuse
            // them. so guard the permalink code so it just runs on first
            // render.
            if (this.permalink_guard) { return; }
            var cid = this.data.kwargs.highlight;
            if (!cid) { return; }
            var self = this;
            $(this.selector+' div.cmListItem').each(function() {
                if (String(cid) === String($(this).attr('id'))) {
                    self.scroll_to_comment(cid);
                    return false;
                }
            });
            this.permalink_guard = true;
        },
        scroll_to_comment: function(comment_id) {
            var scroll_top = $('#'+comment_id).offset().top,
                comment_body = '#' + comment_id + ' .cmCommentBody';
            $(function(){
                $('html, body').animate({'scrollTop':scroll_top}, 1000);
                $(comment_body)
                    .addClass('cmCommentPostEditHighlight round comment-post-edit-highlight')
                    .delay(500)
                    .removeClass('cmCommentPostEditHighlight round comment-post-edit-highlight', 1250);
            });
        },
        setup_events: function () {
            if ($('html').hasClass('ie7')) {
                // ie7 compat hack since it can't handle the hashchange event we
                // listen for in .init().
                var self = this;
                $(this.selector+' a.permalink').click(function(e){
                   self.permalink_guard = false;
                   self.parse_hash();
                   self.setup_permalink();
                });
            }

            this.domwire([{
                    event:'submit',
                    selector:this.selector + ' #comment_post_form',
                    cb:this.post
                }, {
                    event:'submit',
                    selector:this.selector + ' #comment_edit_form',
                    cb:this.edit
                }, {
                    event:'click',
                    selector:this.selector + ' #comment_edit_form .cmCommentCancelBtn',
                    cb:this.hide_edit_box
                }, {
                    event:'click',
                    selector:this.selector + ' .report_abuse',
                    cb:this.report_abuse
                }, {
                    event:'click',
                    selector:this.selector + ' .edit',
                    cb:this.show_edit_box
                }, {
                    event:'click',
                    selector:this.selector+' .cmPaginationContainer .cmPaginationPrevious',
                    cb:this.previous_page
                }, {
                    event:'click',
                    selector:this.selector+' .cmPaginationContainer .cmPaginationNext',
                    cb:this.next_page
                }, {
                    event:'click',
                    selector:this.selector+' .cmPaginationContainer .cmPaginationFirst',
                    cb:this.first_page
                }, {
                    event:'click',
                    selector:this.selector+' .cmPaginationContainer .cmPaginationLast',
                    cb:this.last_page
            }]);
        },
        render: function() {
            widgetlib.request_widget.render.call(this);
            /* this is very sad. there is a serious bug/flaw in how marimo does
             * events in that it assumes that when you call .on(), you want your
             * handler to fire if that event has already happened at least once.
             * this is very useful but it should be a separate method called
             * .when(). until then, there is no way to set up a listener
             * dynamically for an event that has already happened and trigger only
             * when it happens again. because of this sad fact we have to do this
             * dumbness.
             */
            $('body').trigger('comments_rendered');
        }
    });

    widgetlib.premium_comments = marimo.extend(widgetlib.medley_comments, {
        init: function(data) {
            widgetlib.medley_comments.init.call(this, data);

            this.blank_error = 'Please enter some text for your comment.';
            this.post_error = '<p>There was a problem posting your comment. Please try again.</p>';

            return this;
        },
        add_request: function (options) {
            options = options || {};
            var self = this;
            if (typeof options.callback === 'function') {
                var old_cb = options.callback;
                options.callback = function (data, cb) {
                    self._check_auth(data, function (data) {
                        old_cb(data, cb);
                    });
                };
            } else {
                options.callback = function (data, cb) {
                    self._check_auth(data, function (data) {
                        if (typeof cb === 'function') cb(data);
                    });
                };
            }
            widgetlib.medley_comments.add_request.call(this, options);
        },
        _check_auth: function (data, cb) {
            var context = data && data[0] && data[0].context;
            if (!context) return cb(data);

            var auth_url = 'http://' + cmg.site_meta.domain + '/profile/janus-auth/';
            cmg.authorization.check(auth_url, function(json) {
                context.authorized = json.authorized;
                cb(data);
           });
        },
        wrap_error: function(error) {
            // pass through for premium
            return error.msg;
        },
        transform: function(data) {
            data = widgetlib.medley_comments.transform.call(this, data);

            // if there are at least five comments for premium comments, we will show the bottom tabs
            if (data.context.total_comments > 4) {
                data.context.comments_has_minimum = false;
            } else {
                data.context.comments_has_minimum = true;
            }
            return data;
        },
        setup_events: function() {
            widgetlib.medley_comments.setup_events.call(this);
            this.domwire([{
                    event:'click',
                    selector:this.selector+' .comment-tab-post',
                    cb:this.toggle_tab_post_comment
                }, {
                    event:'click',
                    selector:this.selector+' .comment-tab-all',
                    cb:this.toggle_tab_all_comments
            }]);
        },
        toggle_tab_post_comment: function(e) {
            $('#comment-tab-post-content').show();
            $('#comment-tab-all-content').hide();
            $('.comment-tab-post').addClass('active');
            $('.comment-tab-all').removeClass('active');
            $('html, body').animate({scrollTop: $('#comment').position().top}, 1000); // Scroll to top of comments
        },
        toggle_tab_all_comments: function(e) {
            $('#comment-tab-post-content').hide();
            $('#comment-tab-all-content').show();
            $('.comment-tab-post').removeClass('active');
            $('.comment-tab-all').addClass('active');
            $('html, body').animate({scrollTop: $('#comment').position().top}, 1000); // Scroll to top of comments
        }
    });
})();
