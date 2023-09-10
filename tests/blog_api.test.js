const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Blog = require('../models/blog');

const api = supertest(app);

let authToken;

describe('making blogs with auth user', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    // await Blog.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'Nikita', passwordHash });
    await user.save();

    const response = await api
      .post('/api/login')
      .send({ username: 'Nikita', password: 'sekret' })
      .expect(200);

    authToken = response.body.token;

    const newBlog = {
      title: 'Test',
      author: 'Sobaka',
      url: 'someurl',
      likes: 1,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201);
  });

  test('blogs are returned in JSON format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs');
    console.log(response);
    console.log(response.body);
    const contentsId = response.body.map((r) => r.id);

    expect(contentsId[0]).toBeDefined();
  });

  test('POST request creates a new blog post', async () => {
    // WORKS!
    const newBlog = {
      title: 'Test1',
      author: 'Sobaka',
      url: 'someurl',
      likes: 1,
    };

    const initialBlogs = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const lastPosted = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(lastPosted.body).toHaveLength(initialBlogs.body.length + 1);
    const contents = lastPosted.body.map((p) => p.author);
    expect(contents).toContain('Sobaka');
  });

  test('if the "likes" missing from the request, it will default to 0', async () => {
    // WORKS!
    const newBlog = {
      title: 'Test12',
      author: 'Sobaka-Sobaka',
      url: 'someurl',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201);

    const updatedBlogs = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    const lastPosted = updatedBlogs.body[updatedBlogs.body.length - 1];
    console.log(lastPosted);
    expect(lastPosted.likes).toBeDefined();
  });

  test('if "title" is missing, "400 Bad Request" respond', async () => {
    // WORKS!
    const initialBlogs = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    const newBlog = {
      author: 'Sobaka-GG',
      url: 'someurl',
      likes: 0,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(400);

    const lastPosted = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(400);
    expect(lastPosted.body).toHaveLength(initialBlogs.body.length);
  });

  test('if "url" is missing, "400 Bad Request" respond', async () => {
    // WORKS!
    const initialBlogs = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    const newBlog = {
      title: 'test13',
      author: 'Sobaka-GG',
      likes: 0,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(400);

    const lastPosted = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(400);
    expect(lastPosted.body).toHaveLength(initialBlogs.body.length);
  });

  test('a blog can be deleted', async () => {
    //WORKS!
    const blogsAtStart = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    const blogToDelete = blogsAtStart.body[0];
    console.log(blogToDelete);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    const blogsAtEnd = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1);

    const title = blogsAtEnd.body.map((b) => b.title);

    expect(title).not.toContain(blogToDelete.title);
  });

  test('a blog can be updated', async () => {
    const blogsAtStart = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    const blogToUpdate = blogsAtStart.body[0];

    blogToUpdate.likes = 3;

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(blogToUpdate)
      .expect(200);

    const blogsAtEnd = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);
    const updatedBlog = blogsAtEnd.body[0];

    expect(updatedBlog.likes).toBe(3);
  });

  test('adding a blog fails if a token is not provided', async () => {
    const newBlog = {
      title: 'Test1',
      author: 'Sobaka',
      url: 'someurl',
      likes: 1,
    };

    const initialBlogs = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    await api
      .post('/api/blogs')
      // .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);

    const lastPosted = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(401);
    expect(lastPosted.body).toHaveLength(initialBlogs.body.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
