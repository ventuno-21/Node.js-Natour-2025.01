function previewFile() {
    console.log('inside previewfile')
    const preview = document.getElementById('postImage');
    console.log('inside previewfile/preview=', preview)

    // const file = document.querySelector('input[type=file]').files[0];
    const file = document.getElementById('photo').files[0]
    console.log('inside previewfile/preview=', file)

    console.log('inside previewfile 2 ')

    const reader = new FileReader();
    reader.addEventListener("load", function () {
        preview.src = reader.result; //show image in <img tag>
        base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
        console.log("file.name=")
        console.log(file.name)

    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
}





const x = document.querySelector('.form-user-data')
if (x) {
    x.addEventListener('submit', e => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', document.getElementById('name').value)
        formData.append('email', document.getElementById('email').value)
        formData.append('photo', document.getElementById('photo').files[0])
        console.log('public/updatesetting.js/formData you updated', formData)

        const email = document.getElementById('email').value
        const name = document.getElementById('name').value
        console.log('public/updatesettings/ email & name', email, name)

        updateSettings(formData, 'data')
    });
}


const y = document.querySelector('.form-user-password')
if (y) {
    y.addEventListener('submit', async e => {
        e.preventDefault()
        document.querySelector('.btn--save-password').textContent = 'Updating ...'

        const passwordCurrent = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value

        console.log('inside updatesetting.js in public folder username & email = ', passwordCurrent, passwordConfirm)
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password')

        document.querySelector('.btn--save-password').textContent = 'save password'
        document.getElementById('password-current').value = ''
        document.getElementById('password-current').value = ''
        document.getElementById('password-confirm').value = ''
    });
}


const updateSettings = async (data, type) => {
    console.log('public/ updatesetting/updatesetting/data = ', data)
    try {
        // console.log('public/ updatesetting / try')

        const url = type === 'password'
            ? "/api/v1/users/update-password"
            : "/api/v1/users/update-me"

        const request = new Request(url, {
            method: "PATCH",
            // because we add photo with different part in our form, and below is only fo json type, I comment it
            // headers: {
            //     'Accept': 'application/json',
            //     'Content-Type': 'application/json'
            // },
            // body: JSON.stringify(data),
            body: data,
        });

        const fetchResponse = await fetch(request);
        const fetchData = await fetchResponse.json();
        // console.log('first fetch response ===', fetchData);
        if (fetchData.status === 'success') {
            console.log(`You ${type.toUpperCase()} is updated sucessfully`)
            // alert('You login successfully')
            swal.fire({
                // title: "Do you want Continue ? ",
                text: "Your data updated successfully",
                icon: "success",
                confirmButtonColor: '#28b487',
            })
            // redirect user after logged in to HOME page
            window.setTimeout(() => {
                location.reload(true);
            }, 2000);
        }
        else {
            swal.fire({
                // title: "Do you want Continue ? ",
                text: "Something went wrong, try again!",
                icon: "error",
                confirmButtonColor: '#28b487',
            })

        }
    } catch (error) {
        console.log('Request failed', error);

    }
}



// const x = document.querySelector('.form-user-data')
// if (x) {
//     x.addEventListener('submit', e => {
//         e.preventDefault()
//         const email = document.getElementById('email').value
//         const name = document.getElementById('name').value
//         console.log('inside updatesetting.js in public folder username & email = ', email, name)
//         updateData(email, name)
//     });
// }



// const updateData = async (email, name) => {
//     console.log('inside updatesetting.jsupdatedata function  in public folder username & email = ', email, name)
//     try {
//         console.log('inside updatesetting.jsupdatedata function  try')

//         const request = new Request("http://127.0.0.1:3000/api/v1/users/update-me", {
//             method: "PATCH",
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ name: name, email: email }),
//             // body: JSON.stringify({ email: 'steve@example.com', password: 'test1234' }),
//         });

//         const fetchResponse = await fetch(request);
//         const data = await fetchResponse.json();
//         console.log('first fetch response ===', data);
//         if (data.status === 'success') {
//             console.log('You data is updated sucessfully')
//             // alert('You login successfully')
//             swal.fire({
//                 // title: "Do you want Continue ? ",
//                 text: "Ypur data updated successfully",
//                 icon: "success",
//                 // buttons: true,
//                 // confirmButtonColor: '#28b487',
//             })
//             // redirect user after logged in to HOME page
//             window.setTimeout(() => {
//                 location.reload(true);
//             }, 2000);
//         }
//         else {
//             swal.fire({
//                 // title: "Do you want Continue ? ",
//                 text: "Something went wrong, try again!",
//                 icon: "error",
//                 // buttons: true,
//                 // confirmButtonColor: '#28b487',
//             })

//         }
//     } catch (error) {
//         console.log('Request failed', error);

//     }
// }


