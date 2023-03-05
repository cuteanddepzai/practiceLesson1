const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const User = require('../models/userModel')
const Email = require('../toolSearchQuery/Email')
const { promisify } = require('util')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,

    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token , cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};


exports.signup = async (req, res, next) => {
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        })

        createSendToken(user, 201, res)
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err
        })
    }
}
exports.signupAsGoogle = async (req , res , next) => {
    try{
        const {googleId , email , name} = req.body

        const checkUser = await User.findOne({email : email})

        if (!checkUser) {
            const UserAsGoogle = new User({
                email : email ,
                name : name ,
                googleId : googleId
            })
    
            await UserAsGoogle.save({validateBeforeSave : false})
    
            createSendToken(UserAsGoogle, 201, res)
        }
        else {
            createSendToken(checkUser, 200, res)
        }
    }
    catch(err){
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}
exports.login = async (req, res, next) => {
    try {
        if (!req.body.email || !req.body.password) {
            throw new Error('please provide email and password')
        }

        const user = await User.findOne({ email: req.body.email }).select('+password')

        if (!user || !(await user.correctPassword(req.body.password, user.password))) {
            throw new Error('Incorrect email or password')
        }


        createSendToken(user, 200, res)
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}


exports.protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            throw new Error('bạn chưa đăng nhập , làm ơn đăng nhập để truy cập');
        }
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            throw  new Error('The user belonging to this token does no longer exist.')
        }
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            throw new Error('User recently changed password! Please log in again.');
        }
        req.user = currentUser;
        
        next();
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
}

exports.isLoggedIn = async (req, res, next) => { //pug
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET_KEY
            );

            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            res.locals.user = currentUser;
            return next()
        }
        catch (err) {
            return next()
        }
    }
    next();
}

exports.logout = (req, res, next) => {
    res.cookie('jwt', 'tuyendeptrai', {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
}
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new Error('You do not have permission to perform this action')
            );
        }

        next();
    };
};

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        throw new Error('Tài khoản này không có');
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:5000/api/v1/users/resetPassword/${resetToken}`;

    try {
        await new Email(user, resetURL).resetPassword()

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        throw new Error('There was an error sending the email. Try again later!');
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('Sử dụng mã mới , mã này đã  hết hạn để reset lại mật khẩu');
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }

};

exports.updatePassword = async (req, res, next) => {
    try {

        const user = await User.findById(req.user.id).select('+password');
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            throw new Error('Mật khẩu hiện tại không đúng');
        }

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();
        res.cookie('jwt', 'tuyendeptrai', {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        res.status(200).json({
            status: 'success'
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    }
};

