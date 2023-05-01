const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);


// creating some accounts on which we will
// test our api
test('First user created', async () => {
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

}, 100000);


test('Second user created', async () => {
    const user = {
        first_name: "Khush",
        last_name: "patel",
        email: "khushpatel@gmail.com",
        password: "ashwini",
        account_type: "DEPOSIT"
    }

    const response = await api
        .post('/register')
        .send(user)
        .expect(201)
        .expect('Content-Type', /text\/html/)

    if(response.text === 'User added with ID: 2') {
        expect(response.text).toBe('User added with ID: 2');
    }
    else {
        expect(response.text).toBe('user already exists, please login');
    }

}, 100000);


// adding money to first account
// test('depositing money to first account', async() => {
//
//     const account_number = await api
//         .get('/users/:')
//
//     const body = {
//         amount: 200,
//         account_number:
//     }
//
//
//     const response = await api
//         .post('/users/depositToAccount')
//         .expect(201)
//         .expect('Content-Type', /text\/html/);
//
// })

test('user is deleted and confirmation is returned afterwards', async () => {
    const response = await api
        .post('/deleteUser/1')
        .expect(200)
        .expect('Content-Type', /text\/html/)

    expect(response.text).toBe('User deleted with id: 1');
})

test('user is deleted and confirmation is returned afterwards', async () => {
    const response = await api
        .post('/deleteUser/2')
        .expect(200)
        .expect('Content-Type', /text\/html/)

    expect(response.text).toBe('User deleted with id: 2');
})