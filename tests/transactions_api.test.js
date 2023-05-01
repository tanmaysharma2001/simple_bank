const supertest = require('supertest');
const app = require('../app');
const pool = require('../utils/pool');
const { default: expect } = require('expect');
const { log } = require('console');

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


// adding money to accounts
test('depositing money to accounts', async() => {

    // before depositing any money into our accounts
    // we have to login first

    const firstUserLoginInfo = {
        email: "tanmaysharma2123@gmail.com",
        password: "google12"
    }

    const responseFirstUserLoginInfo = await api
        .post('/login')
        .send(firstUserLoginInfo)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    const firstUserToken = responseFirstUserLoginInfo.body.token;

    const firstUserAmountBody = {
        amount: 200,
        account_number: responseFirstUserLoginInfo.body.account_number
    }

    const responseFirstUser = await api
        .post('/users/depositToAccount')
        .set('x-access-token', firstUserToken)
        .send(firstUserAmountBody)
        .expect(201)
        .expect('Content-Type', /text\/html/);
    
    expect(responseFirstUser.text).toBe("Transaction record added with id:1");



    const secondUserLoginInfo = {
        email: "khushpatel@gmail.com",
        password: "ashwini"
    }

    const responseSecondUserLoginInfo = await api
        .post('/login')
        .send(secondUserLoginInfo)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
    const secondUserToken = responseSecondUserLoginInfo.body.token;

    const secondUserAmountBody = {
        amount: 200,
        account_number: responseSecondUserLoginInfo.body.account_number
    }
    
    const responseSecondUser = await api
        .post('/users/depositToAccount')
        .set('x-access-token', secondUserToken)
        .send(secondUserAmountBody)
        .expect(201)
        .expect('Content-Type', /text\/html/);
    
    expect(responseSecondUser.text).toBe("Transaction record added with id:2");

})

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