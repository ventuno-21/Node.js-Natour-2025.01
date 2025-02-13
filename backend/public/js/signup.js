
const x = document.querySelector('.form_login')
if (x) {
    x.addEventListener('submit', e => {
        e.preventDefault()
        const name = document.getElementById('name').value
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('passwordConfirm').value
        // console.log('inside login.js in public folder username & pass = ', email, password)
        signup(name, email, password, passwordConfirm)
    });
}


const signup = async (name, email, password, passwordConfirm) => {

    // console.log('email  before fetch request to server =====', name)
    // console.log('email  before fetch request to server =====', password)
    // console.log('pass before fetch request to server =====', email)
    // console.log('pass before fetch request to server =====', passwordConfirm)
    try {
        const request = new Request("/api/v1/users/signup", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, email: email, password: password, passwordConfirm: passwordConfirm }),
            // body: JSON.stringify({ email: 'steve@example.com', password: 'test1234' }),
        });

        const fetchResponse = await fetch(request);
        const data = await fetchResponse.json();
        // console.log('first fetch response ===', data);
        if (data.status === 'success') {
            console.log('You signup successfully')
            swal.fire({
                // title: "Do you want Continue ? ",
                text: "You signup successfully",
                icon: "success",
                buttons: true,
                confirmButtonColor: '#28b487',
            })
            // redirect user after logged in to login page
            window.setTimeout(() => {
                location.assign('/login');
            }, 1000);
        }
        else if (data.status === 'fail') {
            swal.fire({
                // title: "Do you want Continue ? ",
                text: data.message,
                type: "warning",
                icon: "error",
                buttons: true,
                confirmButtonColor: '#28b487',
            })
        }
        // .then((willSubmit) => {
        //   if (!willSubmit) {
        //      return false;
        //   }

    } catch (error) {
        console.log('Request failed', error);

    }
}
