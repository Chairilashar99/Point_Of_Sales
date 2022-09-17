var express = require('express');
var router = express.Router();
var pool = require('pg');
var path = require('path')
var moment = require('moment');


module.exports = function (pool) {

    router.get('/', function (req, res) {
        const { json } = req.headers
        let limit = 5
        let currentOffset;
        let totalPage;
        let currentLink;
        let pageInput = parseInt(req.query.page)


        if (!req.query.page) {
            currentOffset = 1;
            pageInput = 1;
        } else {
            currentOffset = parseInt(req.query.page);
        }
        const offset = (limit * currentOffset) - limit;


        if (req.url === '/') {
            currentLink = '/?page=1'
        } else {
            if (req.url.includes('/?page')) {
                currentLink = req.url
            } else {
                if (req.url.includes('&page=')) {
                    currentLink = req.url
                } else {
                    if (req.url.includes('&page=')) {
                    } else {
                        currentLink = req.url + `&page=${pageInput}`
                    }
                }
            }
        }

        const { cari_id, cari_nama } = req.query
        let search = []
        let count = 1
        let syntax = []
        let sql_count = `SELECT count(var.barcode) AS total FROM varian var
        INNER JOIN barang bar ON bar.id_barang = var.id_barang`
        let sql = `SELECT var.barcode,
    var.varian_name,
    bar.id_barang,
    bar.nama_barang,
      var.stock,
      var.buy_price,
      var.sell_price,
      var.pictures
FROM varian var
INNER JOIN barang bar ON bar.id_barang = var.id_barang`
        if (cari_id) {
            sql += ' WHERE '
            sql_count += ' WHERE '
            search.push(`%${cari_id}%`)
            syntax.push(`barcode ILIKE $${count}`)
            count++
        }
        if (cari_nama) {
            if (!sql.includes(' WHERE ')) {
                sql += ' WHERE'
                sql_count += ' WHERE '
            }
            search.push(`%${cari_nama}%`)
            syntax.push(` varian_name ILIKE $${count}`)
            count++
        }

        if (syntax.length > 0) {
            sql += syntax.join(' AND ')
            sql += ` ORDER BY barcode ASC`

            sql_count += syntax.join(' AND ')
            sql_count += `GROUP BY var.barcode ORDER BY barcode ASC`
        }
        sql += ` LIMIT 5 OFFSET ${offset}`
        console.log(sql_count, search)
        db.query(sql_count, search, (err, data) => {
            if (err) console.log(err)

            totalPage = Math.ceil(data.rows[0].total / limit)
            db.query(sql, search, (err, rows) => {

                if (err) console.log(err)
                res.render('varian', {
                    rows: rows.rows, currentDir: 'varian',
                    current: '', page: totalPage, currentPage: pageInput, currentUrl: currentLink,
                    link: req.url, query: req.query
                });
            })
        })
    })

    router.get('/api', (req, res) => {
        const { json } = req.headers
        db.query(`SELECT var.barcode,
        var.varian_name,
        bar.id_barang,
        bar.nama_barang,
          var.stock,
          var.buy_price,
          var.sell_price,
          var.pictures
FROM varian var
INNER JOIN barang bar ON bar.id_barang = var.id_barang`, (err, rows) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ message: "error ambil data", error: `${err}` })
            }
            if (rows.rows.length == 0) {
                return res.status(500).json({ message: "data not found" })
            }
            const data = rows.rows
            data['currentDir'] = 'varian'
            data['current'] = ''
            res.status(200).json(data)
        })
    })

    router.get('/api/:id', (req, res) => {
        const { json } = req.headers
        db.query(`SELECT var.barcode,
        var.varian_name,
        bar.id_barang,
        bar.nama_barang,
          var.stock,
          var.buy_price,
          var.sell_price,
          var.pictures
FROM varian var
INNER JOIN barang bar ON bar.id_barang = var.id_barang WHERE var.id_barang = $1`, [req.params.id], (err, rows) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ message: "error ambil data", error: `${err}` })
            }
            if (rows.rows.length == 0) {
                return res.status(500).json({ message: "data not found" })
            }
            const data = rows.rows
            data['currentDir'] = 'varian'
            data['current'] = ''
            res.status(200).json(data)
        })
    })

    router.get('/info/:id', (req, res) => {
        const { json } = req.headers
        db.query(`SELECT var.barcode,
        var.varian_name,
        bar.id_barang,
        bar.nama_barang,
          var.stock,
          var.buy_price,
          var.sell_price,
          var.pictures
FROM varian var
INNER JOIN barang bar ON bar.id_barang = var.id_barang WHERE barcode = $1;`, [req.params.id], (err, rows) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ message: "error ambil data", error: `${err}` })
            }
            if (rows.rows.length == 0) {
                return res.status(500).json({ message: "data not found" })
            }
            const data = rows.rows[0]
            data['currentDir'] = 'varian'
            data['current'] = ''
            res.status(200).json(data)
        })
    })

    router.get('/add', function (req, res) {
        const { json } = req.headers
        db.query('SELECT * FROM barang', (err, rowsB) => {
            if (err) console.log(err)

            const barang = rowsB.rows

            res.render('varian_add', { currentDir: 'varian', current: '', barang, satuan, gudang, moment });
        })
    })

    router.post('/add', function (req, res) {
        const { json } = req.headers
        let pictures;
        let uploadPath;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        // The name of the input field (i.e. "pictures") is used to retrieve the uploaded file
        pictures = req.files.pictures;
        const filename = `A${Date.now()}-${pictures.name}`
        uploadPath = path.join(__dirname, '/../public', 'pictures', filename);
        // Use the mv() method to place the file somewhere on your server
        pictures.mv(uploadPath, function (err) {
            if (err)
                return res.status(500).send(err);
            const { generate, custom_input, nama, stok, harga_jual, harga_beli, barang} = req.body
            if (generate == 'on') {
                db.query('SELECT * FROM barcode_varian()', (err, rows) => {
                    if (err) console.log(err)
                    let barcode = rows.rows[0].barcode_varian
                    db.query(`INSERT INTO varian(barcode, varian_name,
                stock, pictures, sell_price,
                 buy_price, id_barang) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [barcode, nama, stok, filename, harga_jual, harga_beli, barang], (err) => {
                        if (err) {
                            return console.error(err.message);
                        }
                        res.redirect('/varian')
                    })
                })
            }
            if (generate == 'off') {
                let barcode = custom_input
                db.query(`INSERT INTO varian(barcode, varian_name,
                     stock,pictures, sell_price,
                      buy_price,id_barang) 
     VALUES ($1, $2, $3, $4, $5, $6, $7)`, [barcode, nama, stok, filename, harga_jual, harga_beli, barang], (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    res.redirect('/varian')
                })
            }
        });
    })

    router.get('/edit/:id', (req, res) => {
        const { json } = req.headers
        db.query('SELECT * FROM barang', (err, rowsB) => {
            if (err) console.log(err)


            const barang = rowsB.rows
            db.query(`SELECT var.barcode,
                    var.varian_name,
                    bar.id_barang,
                    bar.nama_barang,
                      var.stock,
                      var.buy_price,
                      var.sell_price,
                      var.pictures
FROM varian var
INNER JOIN barang bar ON bar.id_barang = var.id_barang WHERE barcode = $1;`, [req.params.id], (err, rows) => {
                if (err) {
                    return console.error(err.message);
                }
                res.render('varian_edit', { rows: rows.rows, currentDir: 'varian', current: '', barang, satuan, gudang });
            })
        })
    })

    router.post('/edit/:id', async function (req, res) {
        const { json } = req.headers
        const { custom_input,nama, stok, saved_pictures, harga_jual, harga_beli, barang } = req.body
        let pictures;
        let uploadPath;
        if (!req.files || Object.keys(req.files).length === 0) {
            db.query(`UPDATE varian set 
                varian_name = $1,
                stock = $2,
                 pictures = $3,
                  sell_price = $4,
                   buy_price = $5,
                  id_barang = $6,
              WHERE barcode = $7`, [nama, stok, saved_pictures, harga_jual, harga_beli, barang, custom_input], (err) => {
                if (err) {
                    return console.error(err.message);
                }
                res.redirect('/varian')
            })
        } else {
            // The name of the input field (i.e. "pictures") is used to retrieve the uploaded file
            pictures = req.files.pictures;
            const filename = `A${Date.now()}-${pictures.name}`
            uploadPath = path.join(__dirname, '/../public', 'pictures', filename);
            // Use the mv() method to place the file somewhere on your server
            pictures.mv(uploadPath, function (err) {
                if (err)
                    return res.status(500).send(err);
                //  const {custom_input, nama, barang, stok, harga, satuan, gudang } = req.body

                db.query(`UPDATE varian set 
                varian_name = $1,
                stock = $2,
                 pictures = $3,
                  sell_price = $4,
                   buy_price = $5,
                  id_barang = $6,
              WHERE barcode = $7`, [nama, stok, saved_pictures, harga_jual, harga_beli, barang, custom_input], (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    res.redirect('/varian')
                })
            })
        }
    })
    router.get('/delete/:barcode', async function (req, res) {
        const { json } = req.headers
        try {
            let id = req.params.barcode
            let sql = `DELETE FROM varian WHERE barcode = $1`;

            const hapus = await pool.query(sql, [id])
            if (json == 'true') {
                res.status(200).json(hapus)
            } else {
                res.render('varian')
            }
        } catch (error) {
            res.status(500)
        }

    });

    return router;
}

