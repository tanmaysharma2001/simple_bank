const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

// before testing logging in, we have to create
// an account using register
test('user registration returned again as json', async () => {
    const user = {
        first_name: "Tanmay",
        last_name: "Sharma",
        email: "tanmaysharma2123@gmail.com",
        password: "google12",
        account_type: "DEPOSIT"
    }

    const response = await api
        .post('/register')
        .send(user)
        .expect(201)
        .expect('Content-Type', /text\/html/)

    if(response.text === 'User added with ID: 1') {
        expect(response.text).toBe('User added with ID: 1');
    }
    else {
        expect(response.text).toBe('user already exists, please login');
    }

}, 100000)


// login test
test('user is returned as json after logging in', async () => {
    const response = await api
        .get('/getUsers')
        .expect(200)
        .expect('Content-Type', /application\/json/);

    console.log(response.body[0].email);
}, 100000)

// deleting the created user
test('user is deleted and confirmation is returned afterwards', async () => {
    const response = await api
        .post('/deleteUser/1')
        .expect(200)
        .expect('Content-Type', /text\/html/)

    expect(response.text).toBe('User deleted with id: 1');
})

