/// <reference path="jquery.d.ts" />

module M {
    'use strict';

    export class Button {
        static DISABLE_SELECTOR = '.disable-double-submit';
        static DEFAULT_DISABLE_TIMEOUT = 3000;
        static BUTTON_DATA_ATTRIBUTE = 'm:button';

        /**
         * button element.
         */
        $btn:JQuery;
        /**
         * text to show on the button in loading.
         */
        loadingText:string;
        /**
         * original text on the button.
         */
        originalText:string;
        /**
         * accessor function name for text on the button.
         */
        textMethod:string;

        /**
         * form element closest to button.
         */
        $form:JQuery;

        private isHiddenAdded:bool = false;

        isEnabled:bool = true;

        constructor(element:HTMLElement) {
            this.$btn = $(element);
            this.$form = this.$btn.closest('form');
            this.loadingText = this.$btn.data('disable-with');
            this.textMethod = 'val';
            this.originalText = this.$btn.val();
            this.$btn.data(Button.BUTTON_DATA_ATTRIBUTE, this); // attach
        }

        static getButton(btn:HTMLElement):bool {
            var $btn = $(btn);
            return $btn.data(Button.BUTTON_DATA_ATTRIBUTE);
        }

        static populate(btn:HTMLElement):Button {
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
            }
            return  button;
        }

        disable():void {
            this.isEnabled = false;
            this.$btn.attr('disabled', true);
            if (this.loadingText && this.originalText) {
                // change txt
                (<any> this.$btn[this.textMethod])(this.loadingText);
            }
        }

        enable():void {
            if (this.loadingText && this.originalText) {
                // change txt
                (<any> this.$btn[this.textMethod])(this.originalText);
            }
            this.$btn.attr('disabled', false);
            this.isEnabled = true;
        }

        hasForm():bool {
            return (<any> this.$form).size() > 0;
        }

        setPreventDoubleSubmit(timeout:number = Button.DEFAULT_DISABLE_TIMEOUT):void {
            var buttonName = this.$btn.attr('name');

            if (!this.isHiddenAdded && buttonName) {
                var hidden = $('<input>', {
                    type: 'hidden',
                    val: this.$btn.val(),
                    name: buttonName
                });

                this.$btn.after(hidden);
                this.isHiddenAdded = true;
            }

            this.$form.submit((e) => {
                Button.disableAll();
                setTimeout(() => {
                    Button.enableAll();
                }, timeout);
            });
        }

        setPreventDoubleClick(timeout:number = Button.DEFAULT_DISABLE_TIMEOUT):void {
            Button.disableAll();
            setTimeout(() => {
                Button.enableAll();
            }, timeout);
        }

        preventDoubleSubmit(timeout:number = Button.DEFAULT_DISABLE_TIMEOUT):void {
            if (this.isEnabled) {
                var isSubmit = this.$btn.is(':submit');

                if (isSubmit && this.hasForm()) {
                    this.setPreventDoubleSubmit(timeout);
                } else {
                    this.setPreventDoubleClick(timeout);
                }
            }
        }

        static disableAll():void {
            $(Button.DISABLE_SELECTOR).each((i, e:HTMLElement) => {
                Button.populate(e).disable();
            });
        }

        static enableAll():void {
            $(Button.DISABLE_SELECTOR).each((i, e:HTMLElement) => {
                Button.populate(e).enable();
            });
        }
    }

    export class StyledButton extends Button {
        constructor(element:HTMLElement) {
            super(element);
            this.textMethod = 'html';
            this.originalText = this.$btn.html();
            if (this.loadingText && this.originalText) {
                var text = this.$btn.text();
                this.loadingText = this.originalText.replace(text, this.loadingText);
            }
        }

        disable():void {
            this.$btn.addClass('disabled');
            super.disable();
        }

        enable():void {
            this.$btn.removeClass('disabled');
            super.enable();
        }

    }

    export class LinkButton extends StyledButton {
        href:string;

        constructor(element:HTMLElement) {
            super(element);
            this.href = this.$btn.attr('href');
        }

        disable():void {
            super.disable();
            this.$btn.attr('href', 'javascript:void(0)');
        }

        enable():void {
            super.enable();
            this.$btn.attr('href', this.href);
        }

        setPreventDoubleClick(timeout:number = Button.DEFAULT_DISABLE_TIMEOUT):void {
            super.setPreventDoubleClick(timeout);
            location.href = this.href;
        }
    }
}

$(function () {
    // setup
    $(document).on('click', M.Button.DISABLE_SELECTOR, function (e) {
        if (this === e.target) {
            var button = M.Button.populate(this);
            button.preventDoubleSubmit(M.Button.DEFAULT_DISABLE_TIMEOUT);
        }
    });
});