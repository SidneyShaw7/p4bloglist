const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

describe('when there is initially one user in DB', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });
    const user1 = new User({ username: 'LEE', passwordHash });
    await user.save();
    await user1.save();
  });

  test('creation succeeds with a fresh username', async () => {
    // const usersAtStart = helper.usersInDb();
    const usersAtStart = await api.get('/api/users');

    const newUser = {
      username: 'nidmitri',
      name: 'Nikita Dmitriev',
      password: 'nikdmitriev',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    // const usersAtEnd = await helper.usersInDb();
    const usersAtEnd = await api.get('/api/users');
    console.log(usersAtEnd.body);
    console.log(usersAtStart.body);
    expect(usersAtEnd.body).toHaveLength(usersAtStart.body.length + 1);

    const usernames = usersAtEnd.body.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails if password is too short', async () => {
    const usersAtStart = await api.get('/api/users');

    const newUser = {
      username: 'ni',
      name: 'Nikita Dmitriev',
      password: 'ni',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await api.get('/api/users');
    expect(usersAtStart.body).toHaveLength(usersAtEnd.body.length);
  });

  test('creation fails if username is not unique or too short', async () => {
    const usersAtStart = await api.get('/api/users');

    const newUser = {
      username: 'LEE',
      name: 'LEE LEE',
      password: 'LEE',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await api.get('/api/users');
    expect(usersAtStart.body).toHaveLength(usersAtEnd.body.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
