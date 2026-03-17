const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const path = require("path");
const htmlmin = require("html-minifier-terser");

module.exports = function (eleventyConfig) {
  // -----------------------------------------------------------------
  // 1. ОПТИМИЗАЦИЯ КАРТИНОК (Shortcode)
  // Использование в статьях: {% image "src/assets/img/photo.jpg", "Описание" %}
  // -----------------------------------------------------------------
  eleventyConfig.addNunjucksAsyncShortcode(
    "image",
    async function (src, alt, sizes = "100vw") {
      if (!src) return "";

      // Настройка: куда сохранять и какие форматы делать
      let metadata = await Image(src, {
        widths: [300, 600, 1200, "auto"], // Генерируем 3 размера + оригинал
        formats: ["avif", "webp", "jpeg"], // AVIF для лучшего сжатия + WebP + Jpeg
        outputDir: "./_site/img/", // Папка куда положить готовое
        urlPath: "/img/", // Ссылка для HTML
        quality: {
          jpeg: 80,
          webp: 82,
          avif: 75,
        },
        sharpOptions: {
          animated: true,
          limitInputPixels: false,
        },
        sharpWebpOptions: {
          quality: 82,
          effort: 4,
        },
        sharpAvifOptions: {
          quality: 75,
          effort: 4,
        },
      });

      let imageAttributes = {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
        fetchpriority: "auto",
      };

      return Image.generateHTML(metadata, imageAttributes);
    },
  );

  // -----------------------------------------------------------------
  // 2. RSS FEED (Для SEO и подписок)
  // Файл будет доступен по адресу /feed.xml
  // -----------------------------------------------------------------
  eleventyConfig.addPlugin(pluginRss);

  // -----------------------------------------------------------------
  // 3. КОЛЛЕКЦИИ (Более надежный способ)
  // Собираем все .md файлы из папки blog, кроме index.md
  // -----------------------------------------------------------------
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/posts/*.md");
  });

  // -----------------------------------------------------------------
  // 4. ФИЛЬТРЫ И КОПИРОВАНИЕ
  // -----------------------------------------------------------------

  // Копируем статику
  eleventyConfig.addPassthroughCopy("src/assets");
  // Копируем robots.txt и прочее, если появятся в корне src
  eleventyConfig.addPassthroughCopy({ "src/public": "/" });

  // Фильтр даты (Dec 01, 2026)
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // Фильтр даты для SEO (2026-01-01)
  eleventyConfig.addFilter("dateIso", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISODate();
  });

  // Фильтр даты для RSS (RFC 3339)
  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISO();
  });

  // -----------------------------------------------------------------
  // 6. МИНИФИКАЦИЯ HTML (Production)
  // -----------------------------------------------------------------
  const isProduction = process.env.ELEVENTY_ENV === "production";

  if (isProduction) {
    eleventyConfig.addTransform("htmlmin", async function (content) {
      if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
        try {
          return await htmlmin.minify(content, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeOptionalTags: true,
          });
        } catch (e) {
          console.error("HTML minification error:", e);
          return content;
        }
      }
      return content;
    });
  }

  // -----------------------------------------------------------------
  // 7. НАСТРОЙКИ
  // -----------------------------------------------------------------
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
