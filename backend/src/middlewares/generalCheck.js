// middleware/errorHandler.js
export default (err, req, res) => {
    try {
        res.status(500).json({
            error: "server error",
            detail: err.message || err
        });
    } catch (err) {}
};
