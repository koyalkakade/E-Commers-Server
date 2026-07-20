const Brand = require('../models/brandModel')

const createBrand = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ success: false, msg: "Please upload image", });
        }

        let { brandName, createdBy, updatedBy } = req.body
        const existingBrand = await Brand.findOne({ brandName: brandName })
        if (existingBrand) {
            return res.status(400).send({ success: false, msg: "Brand already exists..." })
        }

        let brandImage = `/uploads/brands/${req.file.filename}`;
        const newBrand = await Brand.create({ brandName, createdBy, updatedBy, brandImage })
        await newBrand.save()
        //console.log(newBrand)

        res.status(200).send({ success: true, msg: "Successfully Brand Created..." })


    } catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "Server Error", success: false })
    }

}

const getAllBrand=async(req, res)=>{
  try {
        const allBrands = await Brand.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
        res.status(200).send({ allBrands: allBrands, success: true })
    } catch (error) {
         console.log(error.message)
        res.status(500).send({ msg: "Server error", success: false })
    }
}

const updateBrand = async (req, res) => {
    try {
        const id = req.params.ID;
       // console.log(req.file, req.body, 'update brand')

        const brand = await Brand.findById(id);
        if (req.file) {
            brand.brandImage = `/uploads/brands/${req.file.filename}`;
        }

        brand.brandName = req.body.brandName;
        brand.updatedBy = req.body.updatedBy;
        brand.isActive = req.body.isActive;
        await brand.save();

        res.status(200).json({
            success: true,
            msg: "Brand Updated sucessfully.."
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "Server Error", success: false })
    }
}

const deleteBrand = async (req, res) => {
    try {
        const ID = req.params.ID;

        const brand = await Brand.findById(ID);

        if (!brand) {
            return res.status(404).send({
                success: false,
                msg: "brand not found"
            });
        }

        await Brand.findByIdAndDelete(ID);

        return res.status(200).send({
            success: true,
            msg: "brand deleted successfully"
        });
    }
    catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "server error", success: false })
    }
}

module.exports = {
    createBrand,getAllBrand, updateBrand, deleteBrand
}