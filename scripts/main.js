import { FormValidation } from  './FormValidation.js';
import { users, NotAvailableError } from './users.js';

const AVATAR_SCRIPT = '<script id="avatarScript" src="https://cdn.jsdelivr.net/npm/jdenticon@3.1.1/dist/jdenticon.min.js" integrity="sha384-l0/0sn63N3mskDgRYJZA6Mogihu0VY3CusdLMiwpJ9LFPklOARUcOiWEIGGmFELx" crossorigin="anonymous" async></script>';
const MSGS = {
    firstName: "Enter your first name from 3 to 15 characters long",
    lastName:  "Enter your last name from 3 to 15 characters long",
    email:  "Enter your email from 3 to 15 characters long (it must include @)",
    password:  "Enter a secure password from 8 to 255 characters (may include special symbols and spaces)",
}
const FADE_TIME = 500;

let loggedIn = false;


let signInBtn = $('.signIn .btn');
let signUpBtn = $('.signUp .btn');
let formBg = $('.formBg');
let body = $(document.body);
let signIn = $('.signInForm form')[0];
let signUp = $('.signUpForm form')[0];
let activeAccount = $('.activeAccountForm form')[0];

signUpBtn.click(event => {
    formBg.addClass('active');
    body.addClass('active');
    $(signUp).parent().addClass('active');
    $(signIn).parent().addClass('inactive');
});

signInBtn.click(event => {
    formBg.removeClass('active');
    body.removeClass('active');
    $(signUp).parent().removeClass('active');
    $(signIn).parent().removeClass('inactive');
});

let signUpForm = new FormValidation(signUp, register);
let signInForm = new FormValidation(signIn, login);
let activeAccountForm = new FormValidation(activeAccount);

$(signUp.submitBtn).click(() => {
    $('.input-error-message').remove();
    $(signUpForm.inputs).each((_,input) => {
        if(!Boolean($(input).data('valid'))) {
            if($(input).next().is('.message')){
                $(input).next().remove();
            }
            showMessage($(input), MSGS[$(input).attr('name')]);
        }
    });
});

$(activeAccount.logout).click(logout)
$(activeAccount.delete).click(deleteAccount)

function login() {
    users.pull();
    let FORM = signInForm.form[0];
    loggedIn = true;
    let email = FORM.email.value;
    let password = FORM.password.value;
    let valid = users.check(email, password);
    if(valid){
        $(signUp).parent().fadeOut(FADE_TIME);
        $(signIn).parent().fadeOut(FADE_TIME, () => {
        $(body).addClass('logged').removeClass('active');
        $(formBg).addClass('logged');
            setTimeout(() => {
                $(activeAccount).parent().slideDown(FADE_TIME);
                renderUserData(users.getUser(email, password));
            }, FADE_TIME);
        });
    } else {
        signUpForm.makeInvalid(FORM.email);
        signUpForm.makeInvalid(FORM.password);
        showMessage(FORM.password, 'Incorrect email or password');
    }
}

function logout() {
    loggedIn = false;
    $(activeAccount).parent().slideUp(FADE_TIME, () => {
        $(formBg).removeClass('logged active');
        $(signUp).parent().removeClass('active').fadeIn();
        $(signIn).parent().removeClass('active').fadeIn();
        $(body).removeClass('logged active');
    });

}

function register() {
    $('.in-use-error-message').remove();
    let FORM = signUpForm.form[0];
    let data = {
        name: FORM.firstName.value,
        surname: FORM.lastName.value,
        email: FORM.email.value,
        password: FORM.password.value,
    }
    try {
        users.pull();
        users.add(data);
        users.push();
        setTimeout(() => {
            signUpForm.reset(true);
            $(signInBtn).trigger('click');
            signInForm.reset(true);
        }, 500);
    } catch(err) {
        if(err instanceof NotAvailableError){
            showMessage($(FORM.email), 'Such email is already in use', 'in-use-error-message');
        } 
    }
}

function deleteAccount() {
    if(confirm('Are you sure?')){
        let FORM = activeAccountForm.form[0];
        let email = $(FORM.email).val();
        let password = $(FORM.password).val();
        users.remove(email, password);
        logout();
        setTimeout(() => {
            if(confirm('Save changes forever?')){
                users.push();
            }
        }, FADE_TIME * 2);
    }
}

function showMessage(elem, msg, _class="input-error-message") {
    let h = $(elem).innerHeight();
    let offset = $(elem).position();
    let style = `left: ${offset.left}px; top: ${offset.top + h + 5}px`;
    let msgDiv = `<div class="message ${_class}" style="${style}">${msg}</div>`;
    $(elem).after(msgDiv);
    signUpForm.makeInvalid($(elem));
}

function renderUserData(user) {
    const FORM = activeAccountForm.form[0];
    $(FORM.firstName).val(user.name);
    $(FORM.lastName).val(user.surname);
    $(FORM.email).val(user.email);
    $(FORM.password).val(user.password);
    $('#avatarScript').remove();
    $('#avatar').attr('data-jdenticon-value', `user${user.avatar}`);
    $('script').eq(0).after(AVATAR_SCRIPT);
}
