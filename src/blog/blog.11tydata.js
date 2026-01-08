module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // 1. ПРОВЕРКА НА ГЛАВНУЮ:
      // Если в файле включена пагинация (это index.njk)
      // или имя файла заканчивается на index
      if (data.pagination || data.page.filePathStem.endsWith("/index")) {
        // Возвращаем undefined. Это сигнал для 11ty:
        // "Используй свою стандартную логику, я не вмешиваюсь".
        return undefined;
      }

      // 2. ЛОГИКА ЧЕРНОВИКОВ:
      if (data.draft) {
        return false; // Не создавать файл
      }

      // 3. ДЛЯ ОБЫЧНЫХ СТАТЕЙ:
      // Возвращаем то, что указано в статье, или undefined (стандарт)
      return data.permalink;
    },

    eleventyExcludeFromCollections: (data) => {
      if (data.draft) {
        return true;
      }
      return data.eleventyExcludeFromCollections;
    },
  },
};
