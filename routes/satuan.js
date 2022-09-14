var var express = require('express');
var router = express.Router();

module.exports = function (pool) {
    router.get('/', async function (req, res, next) {
        const { json } = req.headers

        try {
            const { rows } = await pool.query('SELECT * FROM satuan');
            if (json == 'true') {
                res.status(200).json(rows)
            } else {
                res.render('satuan')
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });
    router.post('/', async function (req, res) {
        const { json } = req.headers

        try {
            let sql = `INSERT INTO satuan(id_satuan, nama_satuan, keterangan) VALUES ($1, $2, $3)`
            const post = await pool.query(sql, [req.body.id_satuan, req.body.nama_satuan, req.body.keterangan])
            if (json == 'true') {
                res.status(200).json(post)
            } else {
                res.render('satuan')
            }

        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.get('/:id_satuan', async function (req, res) {
        const { json } = req.headers

        try {
            let id = req.params.id_satuan
            let sql = 'SELECT * FROM satuan WHERE id_satuan = $1'
            const { rows } = await pool.query(sql, [id])
            console.log(rows)
            if (json == 'true') {
                res.status(200).json(rows)
            } else {
                res.render('satuan')
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.put('/:id_satuan', async function (req, res) {
        const { json } = req.headers

        try {
            let sql = `UPDATE satuan SET 
              nama_satuan = $1,
              keterangan = $2
              WHERE id_satuan = $3`

            const edit = await pool.query(sql,
                [req.body.nama_satuan,
                req.body.keterangan,
                req.params.id_satuan]);

            if (json == 'true') {
                res.status(200).json(edit)
            } else {
                res.render('satuan')
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "error edit satuan" })
        }
    });

    router.delete('/:id_satuan', async function (req, res) {
        const { json } = req.headers
        try {
            let id = req.params.id_satuan
            let sql = `DELETE FROM satuan WHERE id_satuan= $1`;

            const hapus = await pool.query(sql, [id])
            if (json == 'true') {
                res.status(200).json(hapus)
              } else {
                res.render('satuan')
              }
            } catch (error) {
            res.status(500)
        }

    });

    return router;
}
