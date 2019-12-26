const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)


test('Should signup a new user', async () => {
    
console.log(process.env.MONGODB_URL)


    const response = await request(app).post('/auth/signup').send({
        name: 'taeyeon',
        email: 'taeyeon@example.com',
        password: 'taeyeon111'
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'taeyeon',
            email: 'taeyeon@example.com',
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('taeyeon111')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/auth/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login nonexistent user', async () => {
    await request(app).post('/auth/login').send({
        email: userOne.email,
        password: 'notmypassword'
    }).expect(400)
})