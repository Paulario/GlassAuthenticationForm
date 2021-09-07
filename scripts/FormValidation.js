export class FormValidation {
    constructor(form, ...callbacks) {
        this.form = $(form);
        this.form.reset = this.reset.bind(this);
        this.submitBtn = $(':submit', $(this.form));
        this.inputs = $(':input:not(:button, :submit, :reset, button[type="submit"])', $(this.form));
        this.submitBtn.click(this.onClick.bind(this));
        this.callbacks = callbacks;
        let checkInput = this.checkInput.bind(this);

        this.inputs.each((_,input) => {
            $(input).blur(() => {
                checkInput(input);
                if(Boolean($(input).data('valid'))) {
                    this.makeValid(input);
                } else {
                    this.makeInvalid(input);
                }
            });
        });
    }

    onClick() {
        event.preventDefault();
        this.validate();
        this.callbacks.forEach(cb => {
            if(this.allValid()){
                cb.call(this, $(this.form));
            }
        });
        return;
    }

    validate() {
        $(this.inputs).each((_,input) => {
            this.checkInput(input);
            if(Boolean($(input).data('valid'))) {
                this.makeValid(input);
            } else {
                this.makeInvalid(input);
            }
        });
    }

    checkInput(input) {
        let checker = $(input).data('checker');
        let pattern = $(input).attr('pattern');
        let value = $(input).val();
        let isValid = false;
        if(pattern){
            isValid = this.checkers.custom(pattern)(value);
        } else if(checker && Object.keys(this.checkers).includes(checker)){
            isValid = this.checkers[checker](value);
        } else {
            // alert(`No pattern provided for the input!`)
        }
        $(input).data('valid', isValid);
    }

    makeValid(input) {
        $(input).addClass('valid').removeClass('invalid');
    }

    makeInvalid(input) {
        $(input).addClass('invalid').removeClass('valid');
    }

    allValid(){
        let check = true;
        $(this.inputs).each((_,input) => {
            check &= Boolean($(input).data('valid'));
        });
        return check;
    }

    reset(clear=false){
        $(this.form).trigger('reset');
        if(clear){
            this.inputs.val('');
        }
        $(this.inputs).each(function(_,elem) {
            $(elem).removeClass('valid invalid');
        });
    }

    checkers = {
        email(email){
            email = email.trim();
            let regExp = /^(\w+((\.|-)\w+)?\.?)+@(gmail|ukr)\.(ua|com|org|net)$/;
            return regExp.test(email);
        },
        name(name){
            let regExp = /^[A-Za-z]{3,18}$/;
            return regExp.test(name);
        },
        phone(phone){
            phone = phone.trim();
            let regExp = /^\+38\(0\d{2}\)-\d{2}-\d{2}-\d{3}$/;
            return regExp.test(phone);
        },
        password(password){
            password = password.trim();
            let regExp = /^(\w|\s){8,255}$/;
            return regExp.test(password);
        },
        custom(pattern){
            return function(value){
                let regExp = new RegExp(pattern);
                return regExp.test(value);
            }
        }
    }
}

