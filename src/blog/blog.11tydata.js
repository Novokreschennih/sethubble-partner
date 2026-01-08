module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // 1. ЖЕСТКИЙ ФИЛЬТР:
      // Если это НЕ markdown-файл (значит, это index.njk или что-то другое),
      // мы немедленно возвращаем data.permalink, не вмешиваясь в логику.
      if (!data.page.inputPath.endsWith(".md")) {
        return data.permalink;
      }

      // 2. ЛОГИКА ДЛЯ СТАТЕЙ (.md):
      // Если черновик — выключаем генерацию файла
      if (data.draft) {
        return false;
      }

      // Иначе — стандартное поведение
      return data.permalink;
    },

    eleventyExcludeFromCollections: (data) => {
      // То же самое для списков: если черновик — скрываем
      if (data.page.inputPath.endsWith(".md") && data.draft) {
        return true;
      }
      return data.eleventyExcludeFromCollections;
    },
  },
};
