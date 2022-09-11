var express = require('express');
var router = express.Router();

module.exports = function (pool) {
    router.get('/', async function (req, res, next) {
        try {
            const { rows } = await pool.query('SELECT * FROM gudang');
            console.log(rows)
            res.status(200).json(rows)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.post('/', async function (req, res) {
        try {
            let sql = `INSERT INTO gudang(id_gudang, nama_gudang, alamat_gudang) VALUES ($1, $2, $3)`
            const post = await pool.query(sql, [req.body.id_gudang, req.body.nama_gudang, req.body.alamat_gudang])
            res.status(200).json(post)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.get('/:id', async function (req, res) {
        try {
            let id = req.params.id_gudang
            let sql = 'SELECT * FROM gudang WHERE id_gudang = $1'
            const editGet = await pool.query(sql, [id])
            res.status(200).json(editGet)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.put('/:id_gudang', async function (req, res) {
        try {
            let sql = `UPDATE gudang SET 
          nama_gudang = $1,
          alamat_gudang = $2
          WHERE id_gudang = $3`

            const edit = await pool.query(sql,
                [req.body.nama_gudang,
                req.body.alamat_gudang,
                req.params.id_gudang]);

            res.status(200).json(edit)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "error edit gudang" })
        }
    });

    router.delete('/:id_gudang', async function (req, res) {
        try {
            let id = req.params.id_gudang
            let sql = `DELETE FROM gudang WHERE id_gudang= $1`;

            const hapus = await pool.query(sql, [id])
            res.status(200).json(hapus)
        } catch (error) {
            res.status(500)
        }

    });

    return router;
}
