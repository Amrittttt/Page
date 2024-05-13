const express = require("express"); 
const cors = require("cors"); 
const Axios = require("axios"); 
const app = express(); 
const PORT = 8000; 

app.use(cors()); 
app.use(express.json()); 

// app.post('/',(req,res)=>{
// 	let x=req.body.piu;
// 	console.log(x);
// 	res.send(x);
// } )

app.post("/", (req, res) => { 
	//getting the required data from the request 
	let code = req.body.code; 
	let language = req.body.language; 
	let input = req.body.input; 

	if (language === "python") { 
		language = "py"
	} 

	let data = ({ 
		"code": code, 
		"language": language, 
		"input": input 
	}); 

	let config = { 
		method: 'post', 
		url: '.netlify/functions/enforcecode', 
		headers: { 
			'Content-Type': 'application/json'
		}, 
		data: data 
	}; 
	//calling the code compilation API 
	Axios(config) 
		.then((response) => { 
			res.send(response.data) 
			console.log(response.data) 
		}).catch((error) => { 
			console.log(error); 
		}); 

	
}) 

app.listen(8000, () => { 
	console.log(`Server listening on port ${PORT}`); 
});
