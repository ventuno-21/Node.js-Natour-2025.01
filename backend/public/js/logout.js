const y = document.querySelector('.nav__el--logout')
if (y) {
    y.addEventListener('click', e => {
        e.preventDefault()
        // console.log('clicked')

        logout()
    })
}



const logout = async () => {
    const url = "/api/v1/users/logout";
    try {
        const response = await fetch(url);
        // console.log('response inside logout =', response)
        if (response.status === 200) {
            swal.fire({
                // title: "Do you want Continue ? ",
                text: "You logout successfully",
                icon: 'warning',
                buttons: true,
                confirmButtonColor: '#28b487',
            })
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
        else {
            console.log('else in try of logout in login.js')
        }

        // const json = await response.json();
        // console.log(json);
    } catch (error) {
        console.log(error)
    }
}