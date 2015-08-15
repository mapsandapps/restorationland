var widgetlib = marimo.widgetlib;

widgetlib.medley_moderation_form = marimo.extend(widgetlib.request_widget, {
    init: function () {
        widgetlib.request_widget.init.apply(this, arguments);
        this.selector = marimo.printf('#%s', [this.id]);
        return this;
    },
    flag_or_remove: function () {
        var data = {
            thing_id:this.data.kwargs.thing_id, // object id from report_abuse kwargs
            thing_name:this.data.kwargs.thing_name, // "thing name" placeholder from report_abuse kwargs
            content_type_id:this.data.kwargs.content_type_id, // object content type id from report_abuse kwargs
            reason: marimo.$(marimo.printf('%s select', [this.selector])).attr('value') // selected moderation reason from mod form
        };
        marimo.$.ajax({
            url:'/moderation/flag_or_remove/',
            type:'POST',
            data:data,
            context:this,
            success:function(data) {
                var action = data.action; // name of the moderation action that occurred
                var thing_id = data.thing_id; // id for the item moderated
                this.emit(marimo.printf('%s_%s', [thing_id, action])); // Marimo emit for widgets listening for moderation
                this.close(); // close the moderation widget
            },
            error:function(data) {
                var error = widgetlib.request_widget.handle_ajax_error.call(this, data);
                // TODO - show moderation error (may not necessarily use error.msg)
            }
        });
    },
    open: function () {
        marimo.$(this.selector).show();
    },
    close: function () {
        marimo.$(this.selector).hide();
    },
    render: function () {
        var $ = marimo.$;
        var _ = cmg._;
        widgetlib.request_widget.render.call(this);
        this.domwire([{
            event:'click',
            selector:marimo.printf('%s .cmModerationFlagRemoveBtn', [this.selector]),
            cb:this.flag_or_remove
        },{
            event:'click',
            selector:marimo.printf('%s .cmModerationCloseBtn', [this.selector]),
            cb:this.close
        }, {
            event:'click',
            selector:marimo.printf('%s .cmModerationSignin', [this.selector]),
            cb:function(e) {
                var comment_id = $(e.target).parents('.cmListItem').attr('id');
                janrain.on('cmg_login_complete', function() {
                    // See sad comment below about this:
                    $('body').on('comments_rendered', function() {
                        $('a[data-cid='+comment_id+'].report_abuse').click();
                        $('body').trigger('comment_selected', {comment_id: comment_id});
                    });
                });
            }
        }]);
        this.open();
    }
});
