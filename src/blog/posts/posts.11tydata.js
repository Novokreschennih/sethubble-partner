module.exports = {
  // Включаем тег 'posts' для всех статей
  tags: ["posts"],

  // ВАЖНО: Указываем шаблон для всех статей в этой папке!
  layout: "layouts/post.njk",

  eleventyComputed: {
    permalink: (data) => {
      if (!data.page.inputPath.endsWith(".md")) {
        return data.permalink;
      }
      if (data.draft) {
        return false;
      }
      return data.permalink || `/blog/{{ title | slugify }}/`;
    },

    eleventyExcludeFromCollections: (data) => {
      if (data.page.inputPath.endsWith(".md") && data.draft) {
        return true;
      }
      return data.eleventyExcludeFromCollections;
    },
  },
};
