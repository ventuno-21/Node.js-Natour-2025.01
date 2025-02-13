
const x = document.querySelector('.form_login')
if (x) {
  x.addEventListener('submit', e => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    // console.log('inside login.js in public folder username & pass = ', email, password)
    login(email, password)
  });
}


const login = async (email, password) => {
  // const email = email
  // const password = password
  // console.log('email  before fetch request to server =====', password)
  // console.log('pass before fetch request to server =====', email)
  try {
    const request = new Request("/api/v1/users/login", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, password: password }),
      // body: JSON.stringify({ email: 'steve@example.com', password: 'test1234' }),
    });

    const fetchResponse = await fetch(request);
    const data = await fetchResponse.json();
    // console.log('first fetch response ===', data);
    if (data.status === 'success') {
      console.log('You login successfully')
      // alert('You login successfully')
      swal.fire({
        // title: "Do you want Continue ? ",
        text: "You login successfully",
        icon: "success",
        buttons: true,
        confirmButtonColor: '#28b487',
      })
      // redirect user after logged in to HOME page
      window.setTimeout(() => {
        location.assign('/');
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



// import axios from 'axios';
// import { showAlert } from './alerts';
// const axios = require('axios')
// import swal from "sweetalert";
// const swal = require('sweetalert')
// import swal from "/../../node_modules/sweetalert2/src/sweetalert2.js"
// import { swal } from "sweetalert2"
// import swal from "/./../../node_modules/sweetalert2/src/sweetalert2.js"
// import swal from "../../node_modules/sweetalert2/dist/sweetalert2.all"
// import Swal from 'sweetalert2'
// const fs = require('fs')
// const { swal } = require(['sweetalert'])


// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: 'http://127.0.0.1:3000/api/v1/users/logout'
//     });
//     if ((res.data.status = 'success')) location.reload(true);
//   } catch (err) {
//     console.log(err.response);
//     showAlert('error', 'Error logging out! Try again.');
//   }
// };



// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: 'http://127.0.0.1:3000/api/v1/users/logout'
//     });
//     if ((res.data.status = 'success')) location.reload(true);
//   } catch (err) {
//     console.log(err.response);
//     showAlert('error', 'Error logging out! Try again.');
//   }
// };

// const login = async (email, password) => {
//   try {
//     console.log('inside try in login.js===', email, password)
//     const res = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:3000/api/v1/users/login',
//       data: {
//         email,
//         password
//       }
//     });
//     console.log(' axios response inside login.js = ', res.data)
//     if (res.data.status === 'success') {
//       console.log('You login successfully')
//       // showAlert('success', 'Logged in successfully!');
//       // window.setTimeout(() => {
//       //   location.assign('/');
//       // }, 1500);
//     }
//   } catch (err) {
//     console.log('error inside login of login.js ==', err)
//     console.log('error inside login of login.js ==', err.response.data.message)

//     // showAlert('error', err.response.data.message);
//   }
// };




// document.querySelector('.form_login').addEventListener('submit', e => {
//   e.preventDefault()
//   const email = document.getElementById('email').value
//   const password = document.getElementById('password').value
//   console.log('inside login.js in public folder username & pass = ', email, password)
//   login(email, password)
// })

// document.querySelector('.nav__el--logout').addEventListener('click', logout())
