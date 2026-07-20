function validateUser(data) {

    const { name, email, password, contactNumber } = data;

    if (!name || !email || !password || !contactNumber) {
        return {
            success: false,
            msg: "All fields are required."
        };
    }

    if (name.trim().length < 2) {
        return {
            success: false,
            msg: "Name must be at least 3 characters."
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
            success: false,
            msg: "Invalid email address."
        };
    }

    if (password.length < 6) {
        return {
            success: false,
            msg: "Password must be at least 6 characters."
        };
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(contactNumber)) {
        return {
            success: false,
            msg: "Contact Number must contain exactly 10 digits."
        };
    }

    return {
        success: true
    };
}

module.exports = validateUser;