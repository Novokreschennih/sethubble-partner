module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // 1. ЗАЩИТА: Если это главная страница блога (index.njk),
      // мы не вмешиваемся, чтобы не сломать пагинацию.
      if (data.page.base === "index.njk") {
        return data.permalink;
      }

      // 2. ЛОГИКА ЧЕРНОВИКОВ:
      // Если стоит draft: true — файл не создаем (permalink = false)
      if (data.draft) {
        return false;
      }

      // 3. СТАНДАРТ:
      // Для всех остальных файлов возвращаем обычную ссылку
      return data.permalink;
    },

    eleventyExcludeFromCollections: (data) => {
      // Исключаем черновики из списков
      if (data.draft) {
        return true;
      }
      return data.eleventyExcludeFromCollections;
    },
  },
};
