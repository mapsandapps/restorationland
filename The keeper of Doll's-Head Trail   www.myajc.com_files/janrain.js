/*
 * Janrain encapsulation
 *
 * This module wraps janrain's capture widget javascript to provide custom
 * events, conditional loading, and easier unit testing.
 *
 */
(function(cmg) {
    var protocol = window.location.protocol,
        hostname = window.location.hostname;
    window.janrain = {
        init: function() {
            /* This function takes care of  loading janrain's widget js,
             * initialize this object's state, and setting up the events for
             * signalling the readiness of janrain/the dom. We also enumerate our stylesheets here.
             */
            if (!cmg || !(cmg.janrain_app_id && cmg.janrain_client_id)) {
                console.error('could not find janrain settings; falling back to hardcoded which are almost certainly wrong.');
            }
            if (!cmg._ || !cmg.query) { return console.error('janrain module requires jquery and underscore.'); }
            var _ = cmg._,
                $ = cmg.query;
            this._events = {};
            window.janrainCaptureWidgetOnLoad = _(this.on_widget_load).bind(this);
            var ready_states = ['complete', 'loaded', 'interactive'];
            if (_(ready_states).indexOf(document.readyState) > -1 && $('#signIn').length > 0) {
                janrain.ready = true;
            }
            else {
                function isReady() { janrain.ready = true; }
                if (document.addEventListener) {
                    document.addEventListener("DOMContentLoaded", isReady, false);
                }
                else {
                   window.attachEvent('onload', isReady);
                }
            }

            /* why not just enumerate these in the object literal in settings?
             * Because we need to get cmg.mediaurl. An object property lookup
             * is a side-effect and no side-effects should trigger when a
             * module is loaded so this must happen in .init().
             */
            this.settings.capture.stylesheets.push(cmg.mediaurl+'css/vendor/janrain.css');
            /* disabled this because all the styles from janrain.css work
             * across browsers.
             */
            // this.settings.capture.mobileStylesheets.push(cmg.mediaurl+'css/vendor/janrain-mobile.css');

            this.load_janrain_js();

            return this;
        },
        settings: {
            // deprecated and now set on server:
            // these are kept around in case we have to overwrite the server
            // settings in an emergency.
            //format: 'two column',
            //providers: ['facebook', 'google', 'twitter', 'yahoo'],
            //providersPerPage: '6',
            //actionText: ' ',
            //borderColor: '#ffffff',
            //width:300,
            //backgroundColor: '#ffffff',
            //language: 'en',
            //appUrl: 'https://cmg-dev.rpxnow.com',
            cmg: {
                // where to load their javascript from
                js_url: (protocol === 'https:'?'https://':'http://') + ((cmg && cmg.janrain_js_url) || 'd16s8pqtk4uodx.cloudfront.net/cmg-dev/load.js')
            },
            capture: {
                // refer to official janrain docs for explanation of these.
                redirectUri: protocol+'//'+hostname, // a mostly unused fallback url
                appId: (cmg && cmg.janrain_app_id) || 'u8wz9dtmm99upmpu52bazczfq3',
                clientId: (cmg && cmg.janrain_client_id) || '5cdyk76ckd8j6ux7pc4xyx8szpj28g5b',
                captureServer: (cmg && cmg.janrain_capture_server) || 'https://cmg.dev.janraincapture.com',
                responseType: 'token',
                dataDefaults: {registrationUrl: window.location.href},
                registerFlow: 'socialRegistration',
                flowVersion: 'HEAD',
                flowName: 'signIn',
                recaptchaPublicKey: '6LeVKb4SAAAAAGv-hg5i6gtiOV4XrLuCDsJOnYoP',
                setProfileData: '',
                stylesheets: [],
                mobileStylesheets: [],
                confirmModalClose: '',
                noModalBorderInlineCss: true,
                modalBorderColor: '#7AB433',
                modalBorderRadius: 5,
                modalBorderWidth: 5,
                modalBorderOpacity: 1,
                modalCloseHtml: '<span class="janrain-icon-16 janrain-icon-ex2"></span>',
                // federate settings
                federate: true,
                federateServer: (cmg && cmg.janrain_federate_server) || 'https://cmg-dev.janrainsso.com',
                federateXdReceiver: protocol+'//'+hostname+'/auth/federate_xd',
                federateLogoutUri: protocol+'//'+hostname+'/auth/logout',
                federateLogoutCallback: function() {
                    window.location = cmg.query('.cmLogout').attr('href');
                },
                federateEnableSafari: true
            },
            share: {
                message : "",
                title : "",
                url : "",
                description : "",
                attributionDisplay : false,
                previewMode : 0,
                shortenUrl : false,
                bodyBackgroundColor : "#FFFFFF",
                bodyBackgroundColorOverride : true,
                bodyColor : "#333",
                bodyContentBackgroundColor : "#ffffff",
                bodyFontFamily : "Helvetica",
                bodyTabBackgroundColor : "#FFFFFF",
                elementBackgroundColor : "#ffffff",
                elementBorderColor : "#ccc",
                elementBorderRadius : "3",
                elementButtonBorderRadius : "3",
                elementButtonBoxShadow : "0",
                elementColor : "#333333",
                elementHoverBackgroundColor : "#333333",
                elementLinkColor : "#173951"
            },
            type: 'embed',
            tokenUrl: 'http://www.coxmediagroup.com/',
            tokenAction: 'event',
            packages: ['login', 'capture','share']
        },
        on: function(evnt, cb) {
            /* wrap janrain's event handler code to provide custom events. uses
             * a helper method depending on what kind of event is being
             * listened to.
             */
            // TODO BUG:
            // if on is called with a janrain event before janrain js is loaded
            // it will go into custom events. i'm too burned out to fix that
            // right now.
            if (this.events && this.events[evnt]) {
                this._janrain_on(evnt, cb);
            }
            else { this._custom_on(evnt, cb); }
       },
       _custom_on: function(evnt, cb) {
            var _ = cmg._;
            if (!_(this._events).has(evnt)) {
                this._events[evnt] = {
                    triggered: false,
                    handlers: [],
                    add_handler: function(cb) {
                        this.handlers.push(cb);
                    },
                    trigger: function() {
                        this.triggered = true;
                        _(this.handlers).each(function(x) { x(); });
                    }
                };
            }
            var evnt_obj = this._events[evnt];
            evnt_obj.add_handler(cb);
            if (evnt_obj.triggered) {
                cb();
            }
       },
       _janrain_on: function(evnt, cb) {
            // call janrain's event handler
            this.events[evnt].addHandler(cb);
        },
        trigger: function(evnt) {
            // trigger a custom event
            if (cmg._(this._events).has(evnt)) {
                this._events[evnt].trigger();
            }
        },
        on_widget_load: function() {
            /* This function is what is called when the janrain js is done
             * loading. It means we now have full access to all of janrain's js
             * api and can start its ui.
             */
            var $ = cmg.query;
            var _ = cmg._;

            // We need to decide which screen and/or flow to use. Sadly the
            // only way we can figure this out is by examining the URL.
            // each individual page *should* be able to call ui.start on its
            // own. however since we need the signIn screen to show on nearly
            // every page we'd have to do some synchronous trickery to be able
            // to switch the screenToRender/flow before needing to call
            // ui.start. I don't like that this code is tied to the URL of the
            // page but it seemed like the alternative was far more confusing
            // and potentially even harder to maintain. I'd love someone to
            // disagree with me and make this better.
            // (this code is awful)
            var path = window.location.pathname;
            var matches = _(path.match).bind(path);
            var screen;
            if (matches('verify-email')) {
                this.settings.capture.screenToRender = 'verifyEmail';
            }
            else if (matches('change-password')) {
                this.settings.capture.screenToRender = 'changePassword';
                this.on('onCaptureProfileSaveSuccess', function(data) {
                    //The following query string parameter is provided by janraincapture.com.
                    //You need to log into the admin to set it.
                    var next_url = cmg.parse_qs(window.location.search)['next'];
                    if (next_url) {
                        // redirect to the url found in the 'next' parameter.
                        window.location = decodeURIComponent(next_url);
                    } else {
                        // fallback to the default
                        window.location = '/auth/signin';
                    }
                });
            }
            else if (matches('profile/edit/private')) {
                this.settings.capture.flowName = 'editProfile';
                this.on('onCaptureProfileSaveSuccess', _(function() {
                    // send the new profile to medley for processing. Medley
                    // returns with the potentially updated displayName of the
                    // user; update the UI with that name.
                    var uuid = $.cookie('ur_uuid', {path:'/'});
                    if (!uuid) { return console.error('panic: cannot find ur_uuid cookie'); }
                    $.ajax({
                        url: '/auth/ajax/handle-profile-save',
                        data: {uuid:uuid},
                        dataType:'json',
                        type: 'post',
                        context: this,
                        success: function(data) {
                            if (!data || !data.display_name) {
                                return console.error('panic: cannot find display_name in response');
                            }
                            var display_name = data.display_name;
                            $.cookie('ur_name', '', {expires:-2, path:'/'});
                            $.cookie('ur_name', display_name, {path:'/'});
                            cmg.update_auth_message();
                        }
                    });
                }).bind(this));
                this.on('onCaptureSessionNotFound', function() {
                    // handle case where janrain's cookie timed out before
                    // medley's. send user to standalone signin page with a
                    // return redirect to here.
                    window.location = '/auth/signin?return='+window.location;
                });
            }
            else { janrain.settings.capture.screenToRender = 'signIn'; }

            ///// copypasta from janrain devs with tweaks
            // we may be called upon to update/merge this with new code from
            // them. Or fix it ourselves.
            function _addListener(element, type, listener) {
                if (!element) {
                    return false;
                }
                if (typeof window.attachEvent === 'object') {
                    element.attachEvent('on' + type, listener);
                } else {
                    element.addEventListener(type, listener, false);
                }
            }
            janrain.capture.ui.registerFunction('displayNameValidation', function(name, value, validation) {
                   var displayNameRegex = /^[a-zA-Z0-9_-]+$/;
                   if (displayNameRegex.test(value)) {
                       var whitespace = /\s/;
                       if (whitespace.test(value)) {
                           //console.log("displayNameValidation false");
                           return false;
                       } else {
                           //console.log("displayNameValidation true");
                           return true;
                       }
                   } else {
                       //console.log("displayNameValidation false");
                       return false;
                   }
            });
            janrain.capture.ui.registerFunction('zipCodeValidation', function(name, value, validation) {
                   var zipCodeRegex = /^[0-9]{5}(?:-[0-9]{4})?$/;
                   return Boolean(zipCodeRegex.test(value));
            });
            janrain.capture.ui.registerFunction('phoneNumberValidation', function(name, value, validation) {
                   var phoneNumberRegex = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
                   return Boolean(phoneNumberRegex.test(value));
            });
            var emailValue;
            janrain.on('onCaptureRenderComplete', function(result){
                if (result.screen === 'signIn') {
                    _addListener(document.getElementById('forgotPasswordLink'), 'click', function(){
                        emailValue = document.getElementById('capture_signIn_traditionalSignIn_emailAddress').value;
                    });
                }
                if (result.screen === 'forgotPassword') {
                    if (emailValue) {
                        document.getElementById('capture_forgotPassword_forgotPassword_emailAddress').value = emailValue;
                    }
                }
            });
            // TODO here may be a bug, this will possibly run before the logging in event is done.
            // but it hasn't come up yet sooooo....
            janrain.on('onCaptureEmailVerificationSuccess', function(result){
                janrain.on('cmg_login_complete', function() {
                    if(result.userData && result.userData.registrationUrl) {
                        window.location = result.userData.registrationUrl;
                    }
                });
            });
            /////// end

            // start janrain's ui magic. this is required to use/do anything
            // besides configure settings and events.
            janrain.capture.ui.start();

            var login = _(function(data) {
                // handle a janrain login in medley. This callback logs the
                // user into medley and updates the UI.
                // It also updates the uuid cookie.
                if (!(data && data.userData && data.userData.uuid)) {
                    this.trigger('cmg_login_failed');
                    console.error('got bad data from janrain: '+data);
                    return;
                }
                var uuid = data.userData.uuid;
                $.cookie('ur_uuid', uuid, {path:'/'});
                this.login_xhr = $.ajax({
                    url: '/auth/ajax/handle-auth',
                    data: {uuid:uuid},
                    type:'post',
                    context: this,
                    success: function() {
                        this.capture.ui.modal.close();
                        cmg.update_auth_message();
                        this.trigger('cmg_login_complete');
                    },
                    error: _(this.trigger).bind(this, 'cmg_login_failed')
                });
            }).bind(this);

            var register = _(function(data) {
                // If this was a social login then log the user in
                // automatically. OW do nothing.
                if (!(data && data.action)) {
                    console.error('panic: register callback got strange object');
                    this.trigger('cmg_registration_failed');
                    return;
                }
                if (data.action !== 'traditionalRegister') { login(data); }
            }).bind(this);

            // omniture tracking
            var omni = {
                fire: function(evnt, msg, data) {
                    if (data && data.userData) {
                        omni.userDataHandler(data, true);
                    }
                    cmg.s_coxnews.linkTrackVars = 'events,' + omni.userDataTrackVars();
                    cmg.s_coxnews.linkTrackEvents = evnt;
                    cmg.s_coxnews.events = evnt;
                    cmg.s_coxnews.tl(document, 'o', msg);
                }
            };
            omni.onProviderLoginStart = _(omni.fire).bind(omni, 'event48', 'Login popup opened');
            omni.onProviderLoginStart = _.once(omni.onProviderLoginStart);
            omni.onProviderLoginError = _(omni.fire).bind(omni, 'event49', 'Error in login popup');
            omni.onProviderLoginSuccess = _(omni.fire).bind(omni, 'event50', 'Login Success');
            omni.onReturnExperienceFound = _(omni.fire).bind(omni, 'event52', 'Logged in via cookie');
            omni.onReturnExperienceFound = _.once(omni.onReturnExperienceFound);

            omni.userDataHandler = cmg.s_coxnews.utilities.userdata.transformer;

            omni.userDataTrackVars = cmg.s_coxnews.utilities.userdata.track_vars;

            // this is a custome event. we trigger it ourselves in the login callback.
            this.on('cmg_login_complete', _(omni.fire).bind(omni, 'event51', 'Login Completed'));

            this.omni = omni;

            this.on('onCaptureLoginSuccess', login);
            this.on('onCaptureRegistrationSuccess', register);
            this.on('onCaptureEmailVerificationSuccess', login);

            this.on('onCaptureScreenShow', omni.onProviderLoginStart);
            this.on('onCaptureLoginSuccess', omni.onProviderLoginSuccess);
            this.on('onCaptureProfileSaveFailed', omni.onProviderLoginError);
            this.on('onCaptureSaveFailed', omni.onProviderLoginError);
            this.on('onCaptureRegistrationFailed', omni.onProviderLoginError);
            this.on('onCaptureFederateLogin', omni.onReturnExperienceFound);
            // end of metrics

            // Error handling; these errors are PANIC errors after which the
            // user just has to refresh the page.
            _([
                'cmg_login_failed',
                'cmg_registration_failed'
            ]).each(_(function(x) {
                this.on(x, function() {
                    console.error(x);
                    cmg.error_dialog();
                });
            }).bind(this));

            // These errors are recoverable and just need to be reported to the console.
            _([
                'onCaptureSaveFailed',
                'onCaptureRegistrationFailed',
                'onCaptureLoginFailed',
                'onCaptureLinkAccountError'
            ]).each(_(function(x) {
                this.on(x, function() {
                    console.log(x);
                });
            }).bind(this));

            this.on('onCaptureScreenShow', _(function() {
                if (cmg.refresh_timer) {
                    clearTimeout(cmg.refresh_timer);
                }
            }).once());

            // set up the mobile/newsletter signup redirects
            // they use the same login flow but when the user is done they need
            // to be shuttled off to special places.
            var redirect = _(function(e) {
                e.preventDefault();
                var href = $(e.target).attr('href'),
                    do_redirect = function() { window.location = href; };
                if (this.capture.ui.hasActiveSession()) {
                    return do_redirect();
                }
                this.capture.ui.modal.open();
                this.on('cmg_login_complete', do_redirect);
            }).bind(this);

            var $body = $('body');
            var delegate = _($body.delegate).bind($body);
            // mogreet, favorites
            _([
                '.cmFeedUtilities .sprite.iconMobile a',
                'span.favorite a'
            ]).each(function(selector) { delegate(selector, 'click', redirect); });

            // logging out
            delegate('.cmLogout', 'click', _(function(e) {
                e.preventDefault();
                $.cookie('ur_name', '', {expires:-2, path:'/'});
                $.cookie('ur_metrics', '', {expires:-2, path:'/'});
                this.capture.ui.endCaptureSession();
                // window is sent to logout URI in federateLogoutCallback.
            }).bind(this));

            // modal opener
            delegate('.cmOpenJanrainModal', 'click', _(function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.capture.ui.modal.open('signIn');
                janrain.settings.capture.federate = true;
            }).bind(this));

            // all done; pages that need to set up additional behaviors can
            // listen for this event.
            this.trigger('cmg_ready');
        },
        _fired_janrain_events: function() {
            // really just for debugging in the console
            var e = this.events;
            return cmg._(e).chain()
                .keys()
                .filter(function(x) { return e[x].firedEvents && e[x].firedEvents.length > 0; })
                .value();
        },
        load_janrain_js: function() { cmg.query.getScript(this.settings.cmg.js_url); }
    };
})(window.cmg);
