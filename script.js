function showBooking() {

    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });

}


// BOOK COURIER

document.getElementById("courierForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const customerName =
            document.getElementById("customerName").value;

        const phone =
            document.getElementById("phone").value;

        const pickup =
            document.getElementById("pickup").value;

        const delivery =
            document.getElementById("delivery").value;

        const weight =
            document.getElementById("weight").value;


        const response = await fetch("/book-courier", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                customerName: customerName,

                phone: phone,

                pickup: pickup,

                delivery: delivery,

                weight: weight

            })

        });


        const result = await response.json();


        if (result.success) {

            document.getElementById("bookingMessage").innerHTML =
                "✅ " + result.message +
                "<br>📦 Your Tracking ID is: <b>" +
                result.trackingId +
                "</b>";

            document.getElementById("courierForm").reset();

        } else {

            document.getElementById("bookingMessage").innerHTML =
                "❌ " + result.message;

        }

    }
);


// TRACK COURIER

async function trackCourier() {

    const id =
        document.getElementById("trackingId").value;

    if (id === "") {

        document.getElementById("trackingResult").innerHTML =
            "⚠️ Please enter Tracking ID.";

        return;

    }

    const response =
        await fetch("/track/" + id);

    const result =
        await response.json();


    if (result.success) {

        document.getElementById("trackingResult").innerHTML =

            "📦 Tracking ID: " + result.data.trackingId +
            "<br>📍 Pickup: " + result.data.pickupLocation +
            "<br>🏠 Delivery: " + result.data.deliveryLocation +
            "<br>🚚 Status: " + result.data.status;

    } else {

        document.getElementById("trackingResult").innerHTML =
            "❌ Courier not found.";

    }

}


// PAYMENT

// ===============================
// PAYMENT
// ===============================

document.getElementById("paymentForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const trackingId =
            document.getElementById("paymentTrackingId").value.trim();

        const amount =
            document.getElementById("amount").value;

        const paymentMethod =
            document.getElementById("paymentMethod").value;

        const paymentMessage =
            document.getElementById("paymentMessage");

        try {

            const response = await fetch("/make-payment", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    trackingId: trackingId,
                    amount: amount,
                    paymentMethod: paymentMethod
                })

            });

            const result = await response.json();

            if (result.success) {

                paymentMessage.innerHTML =
                    "✅ " + result.message +
                    "<br>💳 Payment ID: <b>" +
                    result.payment.paymentId +
                    "</b>" +
                    "<br>📦 Tracking ID: <b>" +
                    result.payment.trackingId +
                    "</b>" +
                    "<br>💰 Amount: ₹" +
                    result.payment.amount +
                    "<br>💳 Method: " +
                    result.payment.paymentMethod;

                document.getElementById("paymentForm").reset();

            } else {

                paymentMessage.innerHTML =
                    "❌ " + result.message;

            }

        } catch (error) {

            console.log(error);

            paymentMessage.innerHTML =
                "❌ Payment server error.";

        }

    }
);
// ===============================
// TRACK COURIER
// ===============================

document.getElementById("trackingForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const trackingId =
            document.getElementById("trackingId").value.trim();

        const result =
            document.getElementById("trackingResult");

        try {

            const response = await fetch(
                "/track-courier/" + trackingId
            );

            const data = await response.json();

            if (data.success) {

                const courier = data.courier;

                result.innerHTML = `
                    <div class="tracking-card">

                        <h3>📦 Courier Details</h3>

                        <p>
                            <b>Tracking ID:</b>
                            ${courier.trackingId}
                        </p>

                        <p>
                            <b>Customer:</b>
                            ${courier.customerName}
                        </p>

                        <p>
                            <b>Pickup:</b>
                            ${courier.pickupLocation}
                        </p>

                        <p>
                            <b>Delivery:</b>
                            ${courier.deliveryLocation}
                        </p>

                        <p>
                            <b>Weight:</b>
                            ${courier.packageWeight} kg
                        </p>

                        <p>
                            <b>Status:</b>
                            ${courier.status}
                        </p>

                    </div>
                `;

            } else {

                result.innerHTML =
                    "❌ Courier not found.";

            }

        } catch (error) {

            console.log(error);

            result.innerHTML =
                "❌ Server connection error.";

        }

    }
);