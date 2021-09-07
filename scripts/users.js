export class NotAvailableError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotAvailableError';
    }
}

export let users = (function(){
    let ACCOUNTS = JSON.parse(localStorage.getItem('ACCOUNTS')) || [];
    function push() {
        localStorage.setItem('ACCOUNTS', JSON.stringify(ACCOUNTS));
    }
    function pull() {
        ACCOUNTS = JSON.parse(localStorage.getItem('ACCOUNTS')) || [];
    }
    function get() {
        let copy = [];
        ACCOUNTS.forEach(user => {
            copy.push(Object.assign({}, user));
        });
        return copy;
    }
    function add({ name, surname, email, password } = {}) {
        if(_isAvailable(email)){
            ACCOUNTS.push({
                name: name,
                surname: surname,
                email: email,
                password: password,
            });
        } else {
            throw new NotAvailableError('This email is not available');
        }
    }
    function remove(email, password) {
        let index = ACCOUNTS.findIndex(user => {
            return user.email === email 
                && user.password === password;
        });
    }
    function check(email, password) {
        let valid = false;
        ACCOUNTS.forEach(user => {
            valid = user.email === email && user.password === password;
        });
        return valid;
    }
    function getUser(email, password) {
        let out;
        let i = 0;
        ACCOUNTS.forEach(user => {
            if(user.email === email && user.password === password) {
                i++;
                out = user;
            }
        });
        return out;
    }
    function _isAvailable(currEmail) {
        let available = true;
        ACCOUNTS.forEach(user => {
            if(user.email === currEmail){
                available = false;
            }
        });
        return available;
    }
    return {
        pull: pull,
        push: push,
        get: get,
        add: add,
        remove: remove,
        check: check,
        getUser: getUser,
    }
})();

