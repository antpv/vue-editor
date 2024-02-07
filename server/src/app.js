const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

let dbLOL = {
  templateTextarea: `<div>Vue js {{ name }} inside</div>`,
  componentTextarea: `{
  name: 'test',
  data() {
    return {
      name: 'John'
    }
  }
}`,
  cssTextarea: `div {
  background: red
}`
}

app.get('/', (req, res) => {
  res.send(dbLOL)
})

app.post('/', (req, res) => {
  dbLOL = req.body

  res.send(dbLOL)
})

app.listen(8081)
