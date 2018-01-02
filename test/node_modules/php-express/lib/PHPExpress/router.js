module.exports = function(req, res) {
    res.render(req.path.slice(1), {
        method: req.method,
        get: req.query,
        post: req.body
    });
};