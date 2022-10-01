var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')

module.exports = function (pool) {
    router.get('/', isLoggedIn, async function (req, res, next) {
        const { json } = req.headers

        try {
            const { rows } = await pool.query('SELECT * FROM gudang');
            if (json == 'true') {
                res.status(200).json(rows)
            } else {
                res.render('gudang')
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });
    router.post('/', isLoggedIn, async function (req, res) {
        const { json } = req.headers

        try {
            let sql = `INSERT INTO gudang(id_gudang, nama_gudang, alamat_gudang) VALUES ($1, $2, $3)`
            const post = await pool.query(sql, [req.body.id_gudang, req.body.nama_gudang, req.body.alamat_gudang])
            if (json == 'true') {
                res.status(200).json(post)
            } else {
                res.render('gudang')
            }

        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.get('/:id_gudang', isLoggedIn, async function (req, res) {
        const { json } = req.headers

        try {
            let id = req.params.id_gudang
            let sql = 'SELECT * FROM gudang WHERE id_gudang = $1'
            const { rows } = await pool.query(sql, [id])
            console.log(rows)
            if (json == 'true') {
                res.status(200).json(rows)
            } else {
                res.render('gudang')
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.put('/:id_gudang', isLoggedIn, async function (req, res) {
        const { json } = req.headers

        try {
            let sql = `UPDATE gudang SET 
              nama_gudang = $1,
              alamat_gudang = $2
              WHERE id_gudang = $3`

            const edit = await pool.query(sql,
                [req.body.nama_gudang,
                req.body.alamat_gudang,
                req.params.id_gudang]);

            if (json == 'true') {
                res.status(200).json(edit)
            } else {
                res.render('gudang')
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "error edit gudang" })
        }
    });

    router.delete('/:id_gudang', isLoggedIn, async function (req, res) {
        const { json } = req.headers
        try {
            let id = req.params.id_gudang
            let sql = `DELETE FROM gudang WHERE id_gudang= $1`;

            const hapus = await pool.query(sql, [id])
            if (json == 'true') {
                res.status(200).json(hapus)
              } else {
                res.render('gudang')
              }
            } catch (error) {
            res.status(500)
        }

    });

    return router;
}
