const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const app = express();
const path = require("path");

// MongoDB connection
const Mongo_Url = 'mongodb://localhost:27017/social';
main()
.then(() => console.log('MongoDB is connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function main(){
  await mongoose.connect(Mongo_Url);
}

// Middleware
app.use(cors({
  origin: 'https://frontendsocial.netlify.app'
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Define a user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  socialHandle: {
    type: String,
    required: true,
  },
  images: [String],
});
const User = mongoose.model('User', userSchema);

// File upload setup (Multer)
const storage = multer.diskStorage({
  destination: './uploads', // Folder for uploaded images
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// app.post("/",async(req,res)=>{
//   const {name,socialHandle} = req.body;
//   // const imagePaths = req.images.map((file) => file.path);

//   const data = {
//     name: name,
//     socialHandle: socialHandle,
//     // images : imagePaths,
//   }
//   await User.insertMany([data])
// });

// app.post('/', upload.array('images', 10), (req, res) => {
//   const { name, socialHandle } = req.body;
//   const files = req.files;

//   console.log('Name:', name);
//   console.log('Social Media Handle:', socialHandle);
//   console.log('Files:', files);

//   res.status(200).send('Form data received');
// });

app.post('/', upload.array('images', 10), async (req, res) => {
  const { name, socialHandle } = req.body;
  const imagePaths = req.files.map((file) => file.path); // Extract file paths

  try {
    // Create a new User entry in MongoDB
    const newUser = new User({
      name,
      socialHandle,
      images: imagePaths, // Store the image paths
    });

    await newUser.save(); // Save the data to MongoDB

    res.status(200).json({ message: 'Form data and images saved successfully' });
  } catch (error) {
    console.error('Error saving to database:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});


app.listen(8080, () => {
  console.log(`App is listening to port 8080`);
});