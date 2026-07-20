const multer =require('multer')
const path = require("path");

const storage = multer.diskStorage({
    destination:(req,file, cb)=>{
      console.log("*******")
        cb(null, 'uploads/taskFiles')
    },
    filename:(req, file,cb)=>{
      console.log("******* filename")
        const fileNm=file.originalname.replace(" ", "_")
        const uniqueName = Date.now()+fileNm
        cb(null,uniqueName)
    }
})


const fileFilter =(req, file, cb)=>{
    const allowedTypes = /pdf|doc|docx|xls|xlsx/

    const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOC files are allowed"));
  }

}

const uploadFiles = multer({
  storage,
  fileFilter,
});

module.exports = uploadFiles