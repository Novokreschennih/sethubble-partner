module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // 1. ЛОГИКА ДЛЯ ЧЕРНОВИКОВ:
      // Если в статье стоит draft: true — мы явно запрещаем создание файла.
      if (data.draft) {
        return false;
      }

      // 2. ДЛЯ ВСЕГО ОСТАЛЬНОГО (включая index.njk и обычные статьи):
      // Мы ничего не возвращаем (undefined).
      // Это критически важно! Это сигнал для 11ty:
      // "Используй свои стандартные механизмы, пагинацию и настройки из Front Matter".
      return undefined;
    },

    eleventyExcludeFromCollections: (data) => {
      // Убираем черновики из списков (коллекций)
      if (data.draft) {
        return true;
      }
      // Иначе оставляем стандартное поведение
      return data.eleventyExcludeFromCollections;
    },
  },
};
