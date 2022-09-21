var express = require('express');
var router = express.Router();
var pool = require('pg');
var path = require('path')
var moment = require('moment');
const fileUpload = require('express-fileupload');


module.exports = function (pool) {

    router.get('/', async function (req, res) {
        const { json } = req.headers

        try {
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


            const data = await pool.query(sql)

            if (json == 'true') {
                res.status(200).json(data.rows)
            } else {
                res.render('varian')
            }



        } catch (err) {
            console.log(err)
            res.status(500).json({ message: "error tampilkan varian" })
        }
    })


    router.get('/select', async function (req, res) {
        const { json } = req.headers

        try {
            let sql = `SELECT id_barang, nama_barang FROM barang`
            const { rows } = await pool.query(sql)
            if (json == 'true') {
                res.status(200).json(rows)
            } else {
                res.render('varian')
            }

        } catch (err) {
            console.log(err)
            res.status(500).json({ message: "error tampilkan varian" })
        }
    })



//     router.get('/info/:id', async function (req, res) {
//         const { json } = req.headers

//         try {
//             let id = req.params.id
//             let sql = `SELECT var.barcode,
//         var.varian_name,
//         bar.id_barang,
//         bar.nama_barang,
//           var.stock,
//           var.buy_price,
//           var.sell_price,
//           var.pictures
// FROM varian var
// INNER JOIN barang bar ON bar.id_barang = var.id_barang WHERE barcode = $1;`
//             const { rows } = await pool.query(sql, [id])
//             if (json == 'true') {
//                 res.status(200).json(rows)
//             } else {
//                 res.render('varian')
//             }
//         } catch (e) {
//             console.log(e)
//             res.status(500).json({ message: 'ini eror' })
//         }

//     });



    router.post('/', async function (req, res) {
        // console.log(req.body, req.files)
        const { json } = req.headers
        // console.log(req.headers)
        console.log(req.body)
        try {
            let pictures;
            let uploadPath;

            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded.');
            }
            // The name of the input field (i.e. "pictures") is used to retrieve the uploaded file
            pictures = req.files.gambar;

            const filename = `A${Date.now()}-${pictures.name}`
            uploadPath = path.join(__dirname, '../public', 'images', filename);

            console.log(uploadPath)
            // Use the mv() method to place the file somewhere on your server

            pictures.mv(uploadPath, function (err) {
                const { barcode, varian_name, stock, buy_price, sell_price, id_barang } = req.body
                console.log('barcode', barcode)
                const filename1 = `{${filename}}`

                const rows = pool.query(`INSERT INTO varian( barcode, varian_name, stock, pictures, sell_price, buy_price, id_barang) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [barcode, varian_name, stock, filename1, sell_price, buy_price, id_barang])

                if (json == 'true') {
                    res.status(200).json(rows)
                } else {
                    res.render('varian')
                }

                if (err)
                    return res.status(500).send(err);

                if (err) {
                    return console.error(err.message);
                }
            })

        } catch (err) {
            res.status(500).json({ message: "gagal add data" })
        }
    })

    router.get('/:id', async function (req, res) {
        const { json } = req.headers

        try {
            let id = req.params.id
            let sql = `SELECT var.barcode,
                    var.varian_name,
                    bar.id_barang,
                    bar.nama_barang,
                      var.stock,
                      var.buy_price,
                      var.sell_price,
                      var.pictures
FROM varian var
INNER JOIN barang bar ON bar.id_barang = var.id_barang WHERE barcode = $1;`
            const { rows } = await pool.query(sql, [id])
            if (json == 'true') {
                res.status(200).json(rows)
            } else {
                res.render('varian')
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'ini eror' })
        }

    });

    router.put('/:id', async function (req, res) {
        console.log('body', req.body)
        const { json } = req.headers
        try {
            const { barcodeedit, varian_nameedit, stockedit, buy_priceedit, sell_priceedit, id_barangedit } = req.body

            let pictures;
            let uploadPath;
            if (!req.files || Object.keys(req.files).length === 0) {
                const edit = pool.query(`UPDATE varian set 
                varian_name = $1,
                stock = $2,
                  sell_price = $3,
                   buy_price = $4,
                  id_barang = $5
              WHERE barcode = $6`, [varian_nameedit, stockedit, buy_priceedit, sell_priceedit, id_barangedit, barcodeedit])
                if (json == 'true') {
                    res.status(200).json(edit)
                } else {
                    res.render('varian')
                }
            } else {
                // The name of the input field (i.e. "pictures") is used to retrieve the uploaded file
                pictures = req.files.gambaredit;
                const filename = `A${Date.now()}-${pictures.name}`
                uploadPath = path.join(__dirname, '/../public', 'images', filename);
                // Use the mv() method to place the file somewhere on your server
                pictures.mv(uploadPath, function (err) {

                    const { barcodeedit, varian_nameedit, stockedit, buy_priceedit, sell_priceedit, id_barangedit } = req.body
                    const filename1 = `{${filename}}`
                    console.log('fileUpload', req.body)
                    const editfile = pool.query(`UPDATE varian set 
                varian_name = $1,
                stock = $2,
                 pictures = $3,
                  sell_price = $4,
                   buy_price = $5,
                  id_barang = $6
              WHERE barcode = $7`, [varian_nameedit, stockedit, filename1, buy_priceedit, sell_priceedit, id_barangedit, barcodeedit])
                    if (json == 'true') {
                        res.status(200).json(editfile)
                    } else {
                        res.render('varian')
                    }
                })
            }
        } catch (eror) {
            res.status(500).json({ message: 'upload gagal' })
        }
    });

    router.delete('/:barcode', async function (req, res) {
        const { json } = req.headers
        try {
            let id = req.params.barcode
            let sql = `DELETE FROM varian WHERE barcode= $1`;

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