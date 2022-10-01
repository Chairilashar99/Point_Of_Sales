var express = require('express');
var router = express.Router();

/* GET home page. */
module.exports = function(pool) {
router.get('/login', function(req, res) {
  res.render('login')
})

router.post('/login', async function(req, res) {
  try{
    const { email, password } = req.body
    console.log(email, password)
    
    const {rows} = await pool.query('select * from users where email = $1', [email])
   
    if(rows.length == 0) {
      throw 'email tidak terdaftar'
    }
  
    if(rows[0].password != password){
      throw 'password salah'
    }
  
    res.render('login')
  } catch (err) {
    console.log(err)
    res.send(err)
    }
})

router.get('/register', function(req, res) {
  res.render('register')
})

router.post('/register', async (req, res) => {
  try{
  const { email, name, password, repassword, role } = req.body
  console.log(email, name, password, repassword, role)
  if (password != repassword) {
    throw 'password tidak sama'
  }
  const {rows} = await pool.query('select * from users where email = $1', [email])
 
  if(rows.length > 0) {
    throw 'email sudah terdaftar coba lagi'
  }

  const createUser = await pool.query('insert into users(email, name, password, role) values($1, $2, $3, $4)', [email, name, password, role])

  res.render('login')
} catch (err) {
  console.log(err)
  res.send(err)
  }
})

return router;
}
