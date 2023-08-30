const _ = require('lodash');
// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  const reducer = blogs.reduce((sum, blog) => sum + blog.likes, 0);

  return blogs.length === 0 ? 0 : reducer;
};

const favoriteBlog = (blogs) => {
  const max = blogs.reduce((sum, blog) => Math.max(sum, blog.likes), -Infinity);

  const favoriteBlog = blogs.filter((blog) => blog.likes === max);
  return {
    title: favoriteBlog[0].title,
    author: favoriteBlog[0].author,
    likes: favoriteBlog[0].likes,
  };
};

const mostBlogs = (blogs) => {
  const authors = _.flatMap(blogs, (blog) => [blog.author]);
  const authorsBlogs = _.countBy(authors);
  const mostCommonAuthor = _.maxBy(
    _.keys(authorsBlogs),
    (author) => authorsBlogs[author]
  );

  return {
    author: mostCommonAuthor,
    blogs: authorsBlogs[mostCommonAuthor],
  };
};

const mostLikes = (blogs) => {
  const authors = _.groupBy(blogs, 'author');
  const authorsLikes = _.mapValues(authors, (blogs) => _.sumBy(blogs, 'likes'));

  const authorMostLikes = _.maxBy(
    _.keys(authorsLikes),
    (author) => authorsLikes[author]
  );
  return {
    author: authorMostLikes,
    likes: authorsLikes[authorMostLikes],
  };
};
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
