var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')

module.exports = function (pool) {
    router.get('/', isLoggedIn, async function (req, res, next) {
        const { json } = req.headers

        try {
            const { rows } = await pool.query('SELECT * FROM supplier');
            if (json == 'true') {
                res.status(200).json(rows)
            } else {
                res.render('supplier', { users: req.session.user })
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });
    router.post('/', isLoggedIn, async function (req, res) {
        const { json } = req.headers

        try {
            let sql = `INSERT INTO supplier(name, alamat, telp) VALUES ($1, $2, $3)`
            const post = await pool.query(sql, [ req.body.name, req.body.alamat, req.body.telp])
            if (json == 'true') {
                res.status(200).json(post)
            } else {
                res.render('supplier')
            }

        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.get('/:id_supplier', isLoggedIn, async function (req, res) {
        const { json } = req.headers

        try {
            let id = req.params.id_supplier
            let sql = 'SELECT * FROM supplier WHERE id_supplier = $1'
            const { rows } = await pool.query(sql, [id])
            console.log(rows)
            if (json == 'true') {
                res.status(200).json(rows)
            } else {
                res.render('supplier')
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.put('/:id_supplier', isLoggedIn, async function (req, res) {
        const { json } = req.headers

        try {
            let sql = `UPDATE supplier SET 
              name = $1,
              alamat = $2,
              telp = $3
              WHERE id_supplier = $4`

            const edit = await pool.query(sql,
                [req.body.name,
                req.body.alamat,
                req.body.telp,
                req.params.id_supplier]);

            if (json == 'true') {
                res.status(200).json(edit)
            } else {
                res.render('supplier')
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "error edit supplier" })
        }
    });

    router.delete('/:id_supplier', isLoggedIn, async function (req, res) {
        const { json } = req.headers
        try {
            let id = req.params.id_supplier
            let sql = `DELETE FROM supplier WHERE id_supplier= $1`;

            const hapus = await pool.query(sql, [id])
            if (json == 'true') {
                res.status(200).json(hapus)
              } else {
                res.render('supplier')
              }
            } catch (error) {
            res.status(500)
        }

    });

    return router;
}