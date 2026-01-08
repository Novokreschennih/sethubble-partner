module.exports = {
  // Все файлы в этой папке автоматически получают тег "posts"
  // (если ты не используешь addCollection в .eleventy.js, это полезно,
  // но у нас коллекция настроена через glob, так что это страховка)

  eleventyComputed: {
    // Логика для Скрытия Черновиков
    permalink: (data) => {
      // Если в статье стоит draft: true — файл не создаем
      if (data.draft) {
        return false;
      }
      // Иначе используем стандартное поведение
      return data.permalink;
    },

    // Убираем черновики из списков (коллекций), чтобы они не висели пустыми ссылками
    eleventyExcludeFromCollections: (data) => {
      // Если это черновик — исключаем
      if (data.draft) {
        return true;
      }
      // Если файл сам просил его исключить (например, index.njk) — уважаем это
      return data.eleventyExcludeFromCollections;
    },
  },
};
