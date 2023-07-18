// Write your tests here
const db = require('../data/dbConfig')
const request = require('supertest')
const server = require('./server')

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

test('sanity', () => {
  expect('ha').toBe('ha')
})

describe('[GET] /jokes', () => {
  const newUser = { username: "yw6636", password: '6843' }
  test('displays error when there is no token', async () => {
    await request(server).post('/api/auth/register').send(newUser)
    await request(server).post('/api/auth/login').send(newUser)
    const data = await request(server).get('/api/jokes')
    expect(data.body.message).toBe('token required')
  })
  test('returns a list of jokes while authorized', async () => {
    await request(server).post('/api/auth/register').send(newUser)
    const res = await request(server).post('/api/auth/login').send(newUser)
    const data = await request(server).get('/api/jokes').set('Authorization', `${res.body.token}`)
    expect(data.body).toHaveLength(3)
  })
})

describe('[POST] /auth/register', () => {
  const newUser = { username: "yw6636", password: '6843' }
  test('new user is now registered the database', async () => {
    await request(server).post('/api/auth/register').send(newUser);
    const rows = await db('users')
    expect(rows).toHaveLength(1)
  })
  // test('system returns right username and password', async () => {
  //   const res = await request(server).post('/api/auth/register').send(newUser)
  //   expect(res.body.username).toMatch(newUser.username)
  //   expect(res.body.password).not.toMatch(newUser.password)
  // })
})

describe('[POST] /auth/login', () => {
  const newUser = { username: "yw6636", password: "6843"}
  test("successful login gives a token", async () => {
    await request(server).post('/api/auth/register').send(newUser)
    const res = await request(server).post('/api/auth/login').send(newUser)
    expect(res.body.token).toBeDefined()
  })
  test("unsuccessful login shows an error", async () => {
    await request(server).post('/api/auth/register').send(newUser)
    const res = await request(server).post('/api/auth/login').send({ username: newUser.username, password: '6833'})
    expect(res.body.message).toBe('invalid credentials')
  })
})