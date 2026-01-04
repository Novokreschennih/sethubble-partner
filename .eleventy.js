const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // 1. Копируем папку assets
  eleventyConfig.addPassthroughCopy("src/assets");

  // 2. Фильтр для красивых дат (Dec 27, 2025)
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // 3. ДОБАВЛЕННЫЙ ФИЛЬТР (dateIso)
  eleventyConfig.addFilter("dateIso", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISODate();
  });

  // 4. Настройки путей
  return {
    markdownTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
