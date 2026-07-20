const multer =require('multer')
const path = require("path");

const storage = multer.diskStorage({
    destination:(req,file, cb)=>{
      console.log("*******")
        cb(null, 'uploads/categories')
    },
    filename:(req, file,cb)=>{
      console.log("******* filename")

        const uniqueName = Date.now()+file.originalname
        cb(null,uniqueName)
    }
})


const fileFilter =(req, file, cb)=>{
    const allowedTypes = /jpeg|jpg|png|webp/

    const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }

}

const uploadImage = multer({
  storage,
  fileFilter,
});

module.exports = uploadImage