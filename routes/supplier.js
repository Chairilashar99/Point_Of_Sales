var express = require('express');
var router = express.Router();

module.exports = function (pool) {
    router.get('/', async function (req, res, next) {
        try {
            const { rows } = await pool.query('SELECT * FROM supplier');
            console.log(rows)
            res.status(200).json(rows)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.post('/', async function (req, res) {
        try {
            let sql = `INSERT INTO supplier(id_supplier, nama_supplier, alamat_supplier, telepon, email) VALUES ($1, $2, $3, $4, $5)`
            const post = await pool.query(sql, [req.body.id_supplier, req.body.nama_supplier, req.body.alamat_supplier, req.body.telepon, req.body.email])
            res.status(200).json(post)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.get('/:id', async function (req, res) {
        try {
            let id = req.params.id_supplier
            let sql = 'SELECT * FROM supplier WHERE id_supplier = $1'
            const editGet = await pool.query(sql, [id])
            res.status(200).json(editGet)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.put('/:id_supplier', async function (req, res) {
        try {
            let sql = `UPDATE supplier SET 
          nama_supplier = $1,
          alamat_supplier = $2,
          telepon = $3,
          email = $4
          WHERE id_supplier = $5`

            const edit = await pool.query(sql,
                [req.body.nama_supplier,
                req.body.alamat_supplier,
                req.body.telepon,
                req.body.email,
                req.params.id_supplier]);

            res.status(200).json(edit)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "error edit supplier" })
        }
    });

    router.delete('/:id_supplier', async function (req, res) {
        try {
            let id = req.params.id_supplier
            let sql = `DELETE FROM supplier WHERE id_supplier= $1`;

            const hapus = await pool.query(sql, [id])
            res.status(200).json(hapus)
        } catch (error) {
            res.status(500)
        }

    });

    return router;
}