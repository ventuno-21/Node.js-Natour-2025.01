
const bookBtn = document.getElementById('book-tour')
if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing ...'
        const { tourId } = e.target.dataset
        bookTour(tourId)
    })
}


const stripe = Stripe('pk_test_51QrMkfPBkS7Jrk0dzKhyqlFD9mmmxgqcjfn8oqcEfDuK04ovWERjeUhZsiBCbqIFVpIU4KaUEXfJYYqpN0nuKmEw00OgP7Zvtj',
    { betas: ['custom_checkout_beta_5'] },
)

// mostly based on stripe documents: https://docs.stripe.com/checkout/custom/quickstart?client=js
export const bookTour = async tourId => {
    try {
        console.log('public/stripe/bookTour/ tourId = ', tourId)
        // 1) get a checkout  session from the server
        await fetch(`/api/v1/bookings/checkout/${tourId}`, { method: 'POST' })
            .then((response) => response.json())
            .then((json) => stripe.initCheckout({ clientSecret: json.clientSecret }))
            .then((checkout) => {
                console.log(checkout);
            });
        // 2) Create checkout form 
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })


    } catch (error) {
        console.log('public/stripe/bookTour/ error in catch = ', error)

    }



}