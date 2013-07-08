var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var M;
(function (M) {
    'use strict';

    var LogLevel = (function () {
        function LogLevel() {
        }
        LogLevel.DEBUG = 0;
        LogLevel.INFO = 1;
        LogLevel.WARN = 2;
        LogLevel.ERROR = 3;
        return LogLevel;
    })();
    M.LogLevel = LogLevel;

    M.LOG_LEVEL = LogLevel.DEBUG;

    var Logger = (function () {
        function Logger() {
        }
        Logger.debug = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (M.LOG_LEVEL <= LogLevel.DEBUG) {
                console.log.apply(console, args);
            }
        };

        Logger.info = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (M.LOG_LEVEL <= LogLevel.INFO) {
                console.info.apply(console, args);
            }
        };

        Logger.warn = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (M.LOG_LEVEL <= LogLevel.WARN) {
                console.warn.apply(console, args);
            }
        };

        Logger.error = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (M.LOG_LEVEL <= LogLevel.ERROR) {
                console.error.apply(console, args);
            }
        };
        return Logger;
    })();
    M.Logger = Logger;

    var Button = (function () {
        function Button(element) {
            this.isHiddenAdded = false;
            this.isEnabled = true;
            this.$btn = $(element);
            this.$form = this.$btn.closest('form');
            this.loadingText = this.$btn.data('disable-with');
            this.textMethod = 'val';
            this.originalText = this.$btn.val();
            this.$btn.data(Button.BUTTON_DATA_ATTRIBUTE, this);
        }
        Button.getButton = function (btn) {
            var $btn = $(btn);
            return $btn.data(Button.BUTTON_DATA_ATTRIBUTE);
        };

        Button.populate = function (btn) {
            var $btn = $(btn);
            var button = $btn.data(Button.BUTTON_DATA_ATTRIBUTE);
            if (!button) {
                if ($btn.is('button, div')) {
                    button = new StyledButton(btn);
                } else if ($btn.is('a')) {
                    button = new LinkButton(btn);
                } else {
                    button = new Button(btn);
                }
                M.Logger.debug("new", button);
            }
            return button;
        };

        Button.prototype.disable = function () {
            this.isEnabled = false;
            this.$btn.attr('disabled', true);
            if (this.loadingText && this.originalText) {
                (this.$btn[this.textMethod])(this.loadingText);
            }
        };

        Button.prototype.enable = function () {
            if (this.loadingText && this.originalText) {
                (this.$btn[this.textMethod])(this.originalText);
            }
            this.$btn.attr('disabled', false);
            this.isEnabled = true;
        };

        Button.prototype.hasForm = function () {
            return (this.$form).size() > 0;
        };

        Button.prototype.setPreventDoubleSubmit = function (timeout) {
            if (typeof timeout === "undefined") { timeout = Button.DEFAULT_DISABLE_TIMEOUT; }
            var _this = this;
            var buttonName = this.$btn.attr('name');

            if (!this.isHiddenAdded && buttonName) {
                var hidden = $('<input>', {
                    type: 'hidden',
                    val: this.$btn.val(),
                    name: buttonName
                });

                this.$btn.after(hidden);
                M.Logger.debug('add hidden', hidden);
                this.isHiddenAdded = true;
            }

            this.$form.submit(function (e) {
                Button.disableAll();
                setTimeout(function () {
                    Button.enableAll();
                    M.Logger.debug('stop  prevent double submit', _this.$btn);
                }, timeout);
                M.Logger.debug('start prevent double submit', _this.$btn);
            });
        };

        Button.prototype.setPreventDoubleClick = function (timeout) {
            if (typeof timeout === "undefined") { timeout = Button.DEFAULT_DISABLE_TIMEOUT; }
            var _this = this;
            Button.disableAll();
            setTimeout(function () {
                Button.enableAll();
                M.Logger.debug('stop  prevent double click', _this.$btn);
            }, timeout);
            M.Logger.debug('start prevent double click', this.$btn);
        };

        Button.prototype.preventDoubleSubmit = function (timeout) {
            if (typeof timeout === "undefined") { timeout = Button.DEFAULT_DISABLE_TIMEOUT; }
            if (this.isEnabled) {
                var isSubmit = this.$btn.is(':submit');

                if (isSubmit && this.hasForm()) {
                    this.setPreventDoubleSubmit(timeout);
                } else {
                    this.setPreventDoubleClick(timeout);
                }
            }
        };

        Button.disableAll = function () {
            $(Button.DISABLE_SELECTOR).each(function (i, e) {
                Button.populate(e).disable();
            });
        };

        Button.enableAll = function () {
            $(Button.DISABLE_SELECTOR).each(function (i, e) {
                Button.populate(e).enable();
            });
        };
        Button.DISABLE_SELECTOR = '.disable-double-submit';
        Button.DEFAULT_DISABLE_TIMEOUT = 3000;
        Button.BUTTON_DATA_ATTRIBUTE = 'm:button';
        return Button;
    })();
    M.Button = Button;

    var StyledButton = (function (_super) {
        __extends(StyledButton, _super);
        function StyledButton(element) {
            _super.call(this, element);
            this.textMethod = 'html';
            this.originalText = this.$btn.html();
            if (this.loadingText && this.originalText) {
                var text = this.$btn.text();
                this.loadingText = this.originalText.replace(text, this.loadingText);
            }
        }
        StyledButton.prototype.disable = function () {
            this.$btn.addClass('disabled');
            _super.prototype.disable.call(this);
        };

        StyledButton.prototype.enable = function () {
            this.$btn.removeClass('disabled');
            _super.prototype.enable.call(this);
        };
        return StyledButton;
    })(Button);
    M.StyledButton = StyledButton;

    var LinkButton = (function (_super) {
        __extends(LinkButton, _super);
        function LinkButton(element) {
            _super.call(this, element);
            this.href = this.$btn.attr('href');
        }
        LinkButton.prototype.disable = function () {
            _super.prototype.disable.call(this);
            this.$btn.attr('href', 'javascript:void(0)');
        };

        LinkButton.prototype.enable = function () {
            _super.prototype.enable.call(this);
            this.$btn.attr('href', this.href);
        };

        LinkButton.prototype.setPreventDoubleClick = function (timeout) {
            if (typeof timeout === "undefined") { timeout = Button.DEFAULT_DISABLE_TIMEOUT; }
            _super.prototype.setPreventDoubleClick.call(this, timeout);
            location.href = this.href;
        };
        return LinkButton;
    })(StyledButton);
    M.LinkButton = LinkButton;
})(M || (M = {}));

$(function () {
    if (typeof console === 'undefined') {
        window.console = {};
        console.log = console.info = console.warn = console.error = function () {
        };
    }

    $(document).on('click', M.Button.DISABLE_SELECTOR, function (e) {
        if (this === e.target) {
            var button = M.Button.populate(this);
            button.preventDoubleSubmit(M.Button.DEFAULT_DISABLE_TIMEOUT);
        }
    });
});
