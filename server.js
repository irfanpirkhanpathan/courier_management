const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

const client = new MongoClient("mongodb://127.0.0.1:27017");

let db;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


// ======================================
// BOOK COURIER
// ======================================

app.post("/book-courier", async (req, res) => {

    try {

        const {
            customerName,
            phone,
            pickup,
            delivery,
            weight
        } = req.body;


        // Generate Tracking ID
        const trackingId =
            "TR" + Math.floor(1000 + Math.random() * 9000);


        // Generate Customer ID
        const customerId =
            "C" + Date.now();


        // ==================================
        // CUSTOMER
        // ==================================

        await db.collection("customer").insertOne({

            customerId: customerId,

            name: customerName,

            phone: phone,

            createdAt: new Date()

        });


        // ==================================
        // COURIER
        // ==================================

        await db.collection("couriers").insertOne({

            trackingId: trackingId,

            customerId: customerId,

            customerName: customerName,

            phone: phone,

            pickupLocation: pickup,

            deliveryLocation: delivery,

            packageWeight: Number(weight),

            status: "Booked",

            paymentStatus: "Not Paid",

            bookingDate: new Date()

        });


        // ==================================
        // ROUTE
        // ==================================

        await db.collection("routes").insertOne({

            routeId: "R" + Date.now(),

            trackingId: trackingId,

            pickupLocation: pickup,

            deliveryLocation: delivery,

            status: "Active",

            createdAt: new Date()

        });

        console.log("✅ Route saved:", trackingId);


        // ==================================
        // NOTIFICATION
        // ==================================

        await db.collection("notification").insertOne({

            notificationId: "N" + Date.now(),

            trackingId: trackingId,

            customerId: customerId,

            message: "Courier booked successfully.",

            status: "Sent",

            createdAt: new Date()

        });

        console.log("✅ Notification saved:", trackingId);


        // ==================================
        // RESPONSE
        // ==================================

        res.json({

            success: true,

            trackingId: trackingId,

            message: "Courier booked successfully!"

        });


    } catch (error) {

        console.log("❌ Booking Error:", error);

        res.status(500).json({

            success: false,

            message: "Courier booking failed."

        });

    }

});



// ======================================
// TRACK COURIER
// ======================================

app.get("/track-courier/:trackingId", async (req, res) => {

    try {

        const trackingId =
            req.params.trackingId;


        const courier =
            await db.collection("couriers").findOne({

                trackingId: trackingId

            });


        if (!courier) {

            return res.json({

                success: false,

                message: "Courier not found"

            });

        }


        res.json({

            success: true,

            courier: courier

        });


    } catch (error) {

        console.log("❌ Tracking Error:", error);

        res.status(500).json({

            success: false,

            message: "Tracking error"

        });

    }

});



// ======================================
// PAYMENT
// ======================================

app.post("/make-payment", async (req, res) => {

    try {

        const {
            trackingId,
            amount,
            paymentMethod
        } = req.body;


        console.log("Payment Request:", req.body);


        // ==================================
        // FIND COURIER
        // ==================================

        const courier =
            await db.collection("couriers").findOne({

                trackingId: trackingId

            });


        if (!courier) {

            return res.json({

                success: false,

                message: "Tracking ID not found"

            });

        }


        // ==================================
        // CREATE PAYMENT
        // ==================================

        const payment = {

            paymentId: "PAY" + Date.now(),

            trackingId: trackingId,

            customerId: courier.customerId,

            amount: Number(amount),

            paymentMethod: paymentMethod,

            paymentStatus: "Paid",

            paymentDate: new Date()

        };


        // SAVE PAYMENT
        await db.collection("payments").insertOne(payment);


        console.log("✅ Payment saved:", trackingId);


        // ==================================
        // UPDATE COURIER
        // ==================================

        await db.collection("couriers").updateOne(

            {
                trackingId: trackingId
            },

            {
                $set: {

                    paymentStatus: "Paid"

                }

            }

        );


        // ==================================
        // PAYMENT NOTIFICATION
        // ==================================

        await db.collection("notification").insertOne({

            notificationId: "N" + Date.now(),

            trackingId: trackingId,

            customerId: courier.customerId,

            message:
                "Payment of ₹" +
                amount +
                " received successfully.",

            status: "Sent",

            createdAt: new Date()

        });


        console.log(
            "✅ Payment notification saved:",
            trackingId
        );


        // ==================================
        // RESPONSE
        // ==================================

        res.json({

            success: true,

            message: "Payment successful!",

            payment: payment

        });


    } catch (error) {

        console.log("❌ Payment Error:", error);

        res.status(500).json({

            success: false,

            message: "Payment failed."

        });

    }

});



// ======================================
// START SERVER
// ======================================

async function startServer() {

    try {

        await client.connect();

        db = client.db("courierDB");


        console.log(
            "✅ MongoDB Connected Successfully"
        );


        app.listen(PORT, () => {

            console.log(
                `✅ Website running at http://localhost:${PORT}`
            );

        });


    } catch (error) {

        console.log(
            "❌ MongoDB Error:",
            error
        );

    }

}


startServer();