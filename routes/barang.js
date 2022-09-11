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

    router.get('/:id', async function (req, res) {
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

    router.put('/:id_barang', async function (req, res) {
        try {
          let sql = `UPDATE barang SET 
          nama_barang = $1
          WHERE id_barang = $2`
    
          const edit = await pool.query(sql,
            [req.body.nama_barang,
            req.params.id_barang]);
    
          res.status(200).json(edit)
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "error edit barang" })
        }
      });
    
      router.delete('/:id_barang', async function (req, res) {
        try {
          let id = req.params.id_barang
          let sql = `DELETE FROM barang WHERE id_barang= $1`;
    
          const hapus = await pool.query(sql, [id])
          res.status(200).json(hapus)
        } catch (error) {
          res.status(500)
        }
    
      });
    
    return router;
}
