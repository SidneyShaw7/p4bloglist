const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

test('blogs are returned in JSON format', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('the unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs');
  const contentsId = response.body.map((r) => r.id);

  expect(contentsId[0]).toBeDefined();
});

test('POST request creates a new blog post', async () => {
  const newBlog = {
    title: 'Test5',
    author: 'Sobaka-Sobaka-Babaka',
    url: 'someurl',
    likes: 1,
  };

  const initialBlogs = await api.get('/api/blogs');
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const lastPosted = await api.get('/api/blogs');
  expect(lastPosted.body).toHaveLength(initialBlogs.body.length + 1);
  const contents = lastPosted.body.map((p) => p.author);
  expect(contents).toContain('Sobaka-Sobaka-Babaka');
});

test('if the "likes" missing from the request, it will default to 0', async () => {
  const newBlog = {
    title: 'Test12',
    author: 'Sobaka-Sobaka',
    url: 'someurl',
  };

  await api.post('/api/blogs').send(newBlog).expect(201);
  const updatedBlogs = await api.get('/api/blogs');
  const lastPosted = updatedBlogs.body[updatedBlogs.body.length - 1];
  console.log(lastPosted);
  expect(lastPosted.likes).toBeDefined();
});

test('if "title" is missing, "400 Bad Request" respond', async () => {
  const newBlog = {
    author: 'Sobaka-GG',
    url: 'someurl',
    likes: 0,
  };

  await api.post('/api/blogs').send(newBlog).expect(400);
  expect(400);
});

test('if "url" is missing, "400 Bad Request" respond', async () => {
  const newBlog = {
    title: 'test13',
    author: 'Sobaka-GG',
    likes: 0,
  };

  await api.post('/api/blogs').send(newBlog).expect(400);
  expect(400);
});

afterAll(async () => {
  await mongoose.connection.close();
});