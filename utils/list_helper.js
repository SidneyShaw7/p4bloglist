// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  const reducer = blogs.reduce((sum, blog) => sum + blog.likes, 0);

  return blogs.length === 0 ? 0 : reducer;
};

const favoriteBlog = (blogs) => {
  const max = blogs.reduce((sum, blog) => Math.max(sum, blog.likes), -Infinity);

  const favoriteBlog = blogs.filter((blog) => blog.likes === max);
  return favoriteBlog[0].title, favoriteBlog[0].author, favoriteBlog[0].likes;
  // console.log(
  //   favoriteBlog[0].title,
  //   favoriteBlog[0].author,
  //   favoriteBlog[0].likes
  // ),
  // console.log(favoriteBlog)
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
