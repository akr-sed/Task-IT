// middleware/errorHandler.js
export default (err, req, res, next) => {
    try {
        console.error("Unhandled error:", err);
        res.status(500).json({
            error: "server error",
            detail: err.message || err
        });
    } catch (catchErr) {
        console.error("Error in error handler:", catchErr);
    }
};
