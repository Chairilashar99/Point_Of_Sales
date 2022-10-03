var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')

module.exports = function (pool) {
  router.get('/',isLoggedIn, async function (req, res, next) {
    const { json } = req.headers
    const user = req.session.user
console.log(req.session.user)
    try {
      const { rows } = await pool.query('SELECT * FROM barang');
      const array = [rows, user]
      if (json == 'true') {
        res.status(200).json(array)
      } else {
        res.render('barang')
      }
    } catch (e) {
      console.log(e)
      res.status(500).json({ message: 'ini eror' })
    }

  });

  router.post('/', isLoggedIn, async function (req, res) {
    const { json } = req.headers

    try {
      let sql = `INSERT INTO barang (id_barang, nama_barang) VALUES ($1, $2)`
      const post = await pool.query(sql, [req.body.id_barang, req.body.nama_barang])
      if (json == 'true') {
        res.status(200).json(post)
      } else {
        res.render('barang')
      }
      
    } catch (e) {
      console.log(e)
      res.status(500).json({ message: 'ini eror' })
    }

  });

  router.get('/:id_barang', isLoggedIn, async function (req, res) {
    const { json } = req.headers

    try {
      let id = req.params.id_barang
      let sql = 'SELECT * FROM barang WHERE id_barang = $1'
      const {rows} = await pool.query(sql, [id])
      console.log(rows)
      if (json == 'true') {
        res.status(200).json(rows)
      } else {
        res.render('barang')
      }
    } catch (e) {
      console.log(e)
      res.status(500).json({ message: 'ini eror' })
    }

  });

  router.put('/:id_barang', isLoggedIn, async function (req, res) {
    const { json } = req.headers

    try {
      let sql = `UPDATE barang SET 
          nama_barang = $1
          WHERE id_barang = $2`

      const edit = await pool.query(sql,
        [req.body.nama_barang,
        req.params.id_barang]);

        if (json == 'true') {
          res.status(200).json(edit)
        } else {
          res.render('barang')
        }
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "error edit barang" })
    }
  });

  router.delete('/:id_barang', isLoggedIn, async function (req, res) {
    const { json } = req.headers
    try {
      let id = req.params.id_barang
      let sql = `DELETE FROM barang WHERE id_barang= $1`;

      const hapus = await pool.query(sql, [id])
      if (json == 'true') {
        res.status(200).json(hapus)
      } else {
        res.render('barang')
      }
    } catch (error) {
      res.status(500)
    }

  });

  return router;
}
