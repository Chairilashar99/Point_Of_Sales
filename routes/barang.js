var express = require('express');
var router = express.Router();


module.exports = function (pool) {
    router.get('/', async function (req, res, next) {
        try {
            const { rows } = await pool.query('SELECT * FROM barang');
            console.log(rows)
            res.status(200).json(rows)
        } catch (e) {
            console.log(e)
            res.status(500).json({message : 'ini eror'})
        }

    });

    router.post('/', async function (req, res) {
        try {
            let sql = `INSERT INTO barang (id_barang, nama_barang) VALUES ($1, $2)`
            const post = await pool.query(sql, [req.body.id_barang, req.body.nama_barang])
            res.status(200).json(post)
        } catch (e) {
            console.log(e)
            res.status(500).json({message : 'ini eror'})
        }

    });

    router.put('/:id', async function (req, res) {
        try {
            let id = req.params.id_barang
            let sql = 'SELECT * FROM barang WHERE id_barang = $1'
            const editGet = await pool.query(sql, [id])
            res.status(200).json(editGet)
        } catch (e) {
            console.log(e)
            res.status(500).json({message : 'ini eror'})
        }

    });
 


       
    return router;
}
