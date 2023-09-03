const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  console.log('Request Body:', request.body);
  const blog = new Blog(request.body);
  console.log(blog);

  if (!blog.hasOwnProperty('likes')) {
    blog.likes = 0;
  }

  if (!request.body.url || !request.body.title) {
    return response.status(400).end();
  }

  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

module.exports = blogsRouter;
