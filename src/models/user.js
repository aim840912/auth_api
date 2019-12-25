const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        requried: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})
// 很多時候，我們會遇到必須隱藏貓鼬對象的某些屬性的情況，尤其是當我們在響應中發送這些對象時。
// 例如，假設您有一個API端點，例如：/ user /：id。顯然，您將發送用戶對像作為對此請求的響應。
// 但是，在發送對像到響應中之前，您需要刪除某些用戶架構屬性（例如密碼）。
// Laravel開發人員可以將其與Eloquent 模型中的$ hidden數組相關聯，該數組在響應中發送對象之前會自動隱藏給定的屬性列表。
// 貓鼬還沒有開箱即用的解決方案（尚未）。但這很容易實現，儘管有點冗長。解決方案是在Mongoose模式上定義一個自定義.toJSON（）方法，
// 並刪除您不想在響應中返回的屬性。
// 例如，假設您要從UserSchema刪除password屬性，可以通過在schema類中添加以下代碼來做到這一點：
userSchema.methods.toJSON = function () {// 不懂
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avator

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}
// Credential 證書
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

// const User = mongoose.model('User', userSchema)
// module.exports = User

const User = mongoose.model('User', userSchema)

module.exports=User