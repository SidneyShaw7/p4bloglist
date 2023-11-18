const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// { user: userIdFromToken }

blogsRouter.get('/', async (request, response) => {
  const userIdFromToken = request.userId
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })
  // const blogs = await Blog.find({})
  response.json(blogs)
})

// Create a new blog
blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
    user: user.id,
  })

  if (!request.body.url || !request.body.title) {
    return response.status(400).end()
  }

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

// Delete a blog
blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'invalid user' })
  }
  user.blogs = user.blogs.filter(
    (userBlog) => userBlog.toString() !== blog._id.toString()
  )

  await user.save()
})

// Change a blog
blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
    // user: blog.user.name,
  }).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })
  response.status(200).json(updatedBlog)
})

// Create a new comment
blogsRouter.post('/:id/comments', async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  const comment = {
    text: body.text,
    user: user.id,
  }

  blog.comments = blog.comments.concat(comment)

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

// Delete a comment
blogsRouter.delete(
  '/:blogId/comments/:commentId',
  async (request, response) => {
    const user = request.user

    const blog = await Blog.findById(request.params.blogId)

    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }

    const comment = blog.comments.id(request.params.commentId)

    if (!comment) {
      return response.status(404).json({ error: 'Comment not found' })
    }

    if (comment.user.toString() !== user.id.toString()) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    comment.remove()

    const savedBlog = await blog.save()

    response.status(204).end()
  }
)

module.exports = blogsRouter
