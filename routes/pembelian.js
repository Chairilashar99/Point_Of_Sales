var express = require('express');
var router = express.Router();
var pool = require('pg')
var moment = require('moment')

module.exports = function(pool) {



/* GET home page. */
  router.get('/', async function (req, res) {
    const { json } = req.headers
    try {
        const { cari_inv2, searchStartDate2, searchEndDate2 } = req.query
        let search = []
        let count = 1
        let syntax = []
        let sql_count = 'SELECT count(*) AS total FROM barang'
        let sql = 'SELECT * FROM pembelian'
        if (cari_inv2) {
            sql += ' WHERE '
            sql_count += ' WHERE '
            search.push(`%${cari_inv2}%`)
            syntax.push(`no_invoice ilike '%' || $${count++} || '%'`)
            count++
        }
        if (searchStartDate2 && searchEndDate2) {
            if (!sql.includes(' WHERE ')) {
                sql += ' WHERE'
                sql_count += ' WHERE'
            }
            search.push(`${searchStartDate2}`)
            search.push(`${searchEndDate2}`)
            syntax.push(` tanggal_pembelian >= $${count} AND tanggal_pembelian < $${count + 1}`)
            count++
            count++
        } else if (searchStartDate2) {
            if (!sql.includes(' WHERE ')) {
                sql += ' WHERE'
                sql_count += ' WHERE'
            }
            search.push(`${searchStartDate2}`)
            syntax.push(` tanggal_pembelian >= $${count}`)
            count++
        } else if (searchEndDate2) {
            if (!sql.includes(' WHERE ')) {
                sql += ' WHERE'
                sql_count += ' WHERE'
            }
            search.push(`${searchEndDate2}`)
            syntax.push(` tanggal_pembelian <= $${count}`)
            count++
        }

        if (syntax.length > 0) {
            sql += syntax.join(' AND ')


            sql_count += syntax.join(' AND ')
            sql_count += ` GROUP BY no_invoice ORDER BY id_barang ASC`
        }
        sql += ` ORDER BY tanggal_pembelian DESC`

        const { rows } = await pool.query(sql, search);
        //console.log('rows',rows)
        //const noInvoice = req.query.noInvoice ? req.query.noInvoice : rows.length > 0 ? rows[0].no_invoice : '';
        const noInvoice = req.query.noInvoice ? req.query.noInvoice : '';
        console.log(req.query.noInvoice, 'noInvoice')
        const detailsb = await pool.query('SELECT dp.*, v.nama_varian FROM detail_pembelian as dp LEFT JOIN varian as v ON dp.id_varian = v.id_varian WHERE dp.no_invoice = $1 ORDER BY dp.id_detail_beli', [noInvoice]);
        const varianb = await pool.query('SELECT var.*, b.id_barang, b.nama_barang FROM varian as var LEFT JOIN barang as b ON var.id_barang = b.id_barang ORDER BY var.id_barang');
        const gudangb = await pool.query('SELECT * FROM gudang ORDER BY id_gudang');
        const supplierb = await pool.query('SELECT * FROM supplier ORDER BY id_supplier');
        const print2 = await pool.query('SELECT dp.,pe.,v.nama_varian FROM detail_pembelian as dp LEFT JOIN varian as v ON dp.id_varian = v.id_varian LEFT JOIN pembelian as pe ON dp.no_invoice = pe.no_invoice WHERE dp.no_invoice = $1', [noInvoice]);
        const totaljual = await pool.query(`SELECT count(no_invoice) AS totaljual FROM penjualan`)
        const totalbeli = await pool.query(`SELECT count(no_invoice) AS totalbeli FROM pembelian`)
        //console.log('print', print.rows[0].no_invoice)
        res.render('pembelian/list', {
            pembelian: rows,
            moment,
            currencyFormatter,
            gudangb: gudangb.rows,
            supplierb: supplierb.rows,
            detailsb: detailsb.rows,
            varianb: varianb.rows,
            print2,
            query: req.query,
            totaljual: totaljual.rows[0].totaljual,
            totalbeli: totalbeli.rows[0].totalbeli,
            user: req.session.user
        })
    } catch (e) {
        res.send(e)
    }

});
//v
router.post('/create', async function (req, res) {
    const { json } = req.headers
    try {
        const { rows } = await db.query('INSERT INTO pembelian(total_harga_beli) VALUES(0) returning *')
        //res.redirect(`/pembelian/show/${rows[0].no_invoice}`)
        res.json(rows[0])
    } catch (e) {
        res.send(e)
    }
});
//v

//v
router.get('/barang/:id_varian', async function (req, res) {
    const { json } = req.headers
    try {
        const { rows } = await db.query('SELECT var.*, b.id_barang, b.nama_barang FROM varian as var LEFT JOIN barang as b ON var.id_barang = b.id_barang WHERE id_varian = $1 ORDER BY var.id_barang', [req.params.id_varian])
        res.json(rows[0])
    } catch (e) {
        res.send(e)
    }
});
//v
router.post('/additem', async function (req, res) {
    const { json } = req.headers
    try {
        detail = await db.query('INSERT INTO detail_pembelian(no_invoice, id_varian, qty)VALUES ($1, $2, $3) returning *', [req.body.no_invoice, req.body.id_varian, req.body.qty])
        const { rows } = await db.query('SELECT * FROM pembelian WHERE no_invoice = $1', [req.body.no_invoice])
        res.json(rows[0])
    } catch (e) {
        res.send(e)
    }
});
//v
router.post('/upjual', async function (req, res) {
    const { json } = req.headers
    try {
        udatejual = await pool.query('UPDATE pembelian SET id_gudang = $1, id_supplier = $2, total_harga_beli = $3, total_bayar_beli = $4, kembalian_beli = $5 WHERE no_invoice = $6 returning *', [req.body.gudangb, req.body.supplierb, req.body.total_harga_beli, req.body.total_bayar_beli, req.body.kembalian, req.body.no_invoice])
        const { rows } = await pool.query('SELECT * FROM pembelian WHERE no_invoice = $1', [req.body.no_invoice])
        res.json(rows).
    } catch (e) {
        res.send(e)
    }
});
//v
router.get('/details/:no_invoice', async function (req, res) {
    const { json } = req.headers
    try {
        let id = req.params.no_invoice
        let sql = 'SELECT dp.*, v.varian_name FROM detail_pembelian as dp LEFT JOIN varian as v ON dp.barcode = v.barcode WHERE dp.no_invoice = $1 ORDER BY dp.id_detail'
        const { rows } = await pool.query(sql, [id])
        
        if (json == 'true') {
            res.status(200).json(rows)
        } else {
            res.render('   ')
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'ini eror' })
    }

});

router.get('/delete/:no_invoice', async function (req, res) {
    const { json } = req.headers
    try {
        let id = req.params.no_invoice
        let id1 = req.params.no_invoice
        let sql = `DELETE FROM pembelian WHERE no_invoice = $1`;
        let sql1 = `DELETE FROM detail_pembelian WHERE no_invoice = $1`;

        const hapus = await pool.query(sql, [id], sql1, [id1])
        if (json == 'true') {
            res.status(200).json(hapus)
        } else {
            res.redirect('/pembelian')
        }
    } catch (error) {
        res.status(500)
    }

})
        
router.delete('/delitem/:id_detail', async function (req, res) {
    const { json } = req.headers
    try {
        let id = req.params.id_detail
        let sql = `DELETE FROM detail_pembelian WHERE id_detail = $1`;
        const { rows } = await pool.query('SELECT SUM(total_harga)  AS total FROM detail_pembelian WHERE no_invoice = $1', [req.body.no_invoice])
        res.json(rows)

        const hapus = await pool.query(sql, [id])
        if (json == 'true') {
            res.status(200).json(hapus)
        } else {
            res.render('pembelian')
        }
    } catch (error) {
        res.status(500)
    }

});

return router;
}