
module.exports = function(req, res) {

	console.log(`\n${req.q.msg}`);
	
	res.sendStatus(200);
}
