const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  comments: [
    {
      text: String,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    returnedObject.comments =
      document.comments?.map((comment) => {
        return {
          id: comment._id,
          text: comment.text,
          user: comment.user,
        }
      }) || []
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.comments._id
  },
})

module.exports = mongoose.model('Blog', blogSchema)
