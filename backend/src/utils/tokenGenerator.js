// authMiddleware.js
import Session from '../models/session.js'

export default async function (req, res) {
    try {
        const userId = req.userId
        const user = req.user

        // getting user ip
        const ip = req.ip || req.headers['x-forwarded-for'];

        // getting user device info
        const deviceId = req.headers['x-device-id'];
        const deviceName = req.headers['x-device-name'];
        const deviceOsVersion = req.headers['x-device-osversion'];

        // check if any header is missing
        if (!deviceId || !deviceName || !deviceOsVersion) {
            return res.status(400).json({ error: "Missing device headers" });
        }

        // delete old device token
        await Session.deleteOne({ 'device.deviceId':deviceId })
        // store user device info , ip , id
        const tokenHolder = new Session({
            userId: userId,
            ip: ip,
            device: {
                deviceId: deviceId,
                deviceName: deviceName,
                deviceOsVersion: deviceOsVersion,
            }
        })

        await tokenHolder.save()

        return res.status(200).send({
            message: "user logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token: tokenHolder['token']
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({
            error: error,
        })
    }



};