module.exports = {
  // Включаем этот файл в коллекцию posts (на случай если глоб в конфиге не зацепит)
  tags: ["posts"],

  eleventyComputed: {
    // Логика работает ТОЛЬКО для файлов внутри src/blog/posts/
    // index.njk находится уровнем выше и этот код его не коснется!

    permalink: (data) => {
      // Если черновик — файл не создаем
      if (data.draft) {
        return false;
      }
      // Иначе — стандартный путь: blog/название-статьи/
      // Если в статье уже есть permalink, используем его, иначе генерируем из заголовка
      return data.permalink || `/blog/{{ title | slugify }}/`;
    },

    eleventyExcludeFromCollections: (data) => {
      // Скрываем черновики из списков
      if (data.draft) {
        return true;
      }
      return data.eleventyExcludeFromCollections;
    },
  },
};
