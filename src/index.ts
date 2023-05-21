// Express
import express from 'express'

// App Init
const PORT = process.env.PORT || 5000
const app = express()

// Run the app
app.listen(PORT, () => {
	console.log(`Easy Copies API started at port ${PORT}`)
})
