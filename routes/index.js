var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')

const bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET home page. */
module.exports = function (pool) {
  router.get('/', function (req, res) {
    res.render('login', {
      info: req.flash('info')
    });
  });

  router.post('/', async function (req, res) {
    try {

      const { email, password } = req.body
      await pool.query('SELECT * FROM users where email = $1', [email], (err, data) => {
        if (err) {
          console.log(err)
          return res.send(err)
        }
        if (data.rows.length == 0) {
          req.flash('info', 'email not found')
          return res.redirect('/')
        }
        bcrypt.compare(password, data.rows[0].password, function (err, result) {
          if (err) {
            console.log(err)
            return res.send(err)
          }
          if (!result) {
            req.flash('info', 'incorrect password')
            return res.redirect('/')
          }
          req.session.user = data.rows[0]
          res.redirect('/utama')

        })
      })
    
      } catch (err) {
        console.log(err)
        req.flash('info', err)
        // res.redirect('/barang')
      }
    })

  router.get('/register', function (req, res) {
    res.render('register', { info: req.flash('info') })
  })

  router.post('/register', async (req, res) => {
    try {
      const { email, name, password, repassword, role } = req.body
      console.log(email, name, password, repassword, role)
      if (password != repassword) {
        throw 'password tidak sama'
      }
      const { rows } = await pool.query('select * from users where email = $1', [email])

      if (rows.length > 0) {
        throw 'email sudah terdaftar coba lagi'
      }

      const hash = bcrypt.hashSync(password, saltRounds);
      const createUser = await pool.query('insert into users(email, name, password, role) values($1, $2, $3, $4)', [email, name, hash, role])
      req.flash('info', 'selamat, akun anda telah dibuat, silahkan login')
      res.redirect('/')
    } catch (err) {
      console.log(err)
      req.flash('info', err)
      res.redirect('/register')
    }
  })

  router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
      res.redirect('/')
    })
  })

  router.get('/utama', isLoggedIn, function (req, res) {
    res.render("utama", { users: req.session.user })

  })


  return router;
}
