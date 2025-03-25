/**
 * Utility class for generating report frontmatter with consistent formatting
 */

/**
 * Generates frontmatter for reports with consistent formatting
 * @param {Object} options - Options for the frontmatter
 * @param {Date} [options.date] - Date for the report (defaults to current date)
 * @param {string[]} [options.authors] - List of authors (defaults to ["Michael Staton"])
 * @param {string} [options.augmentedWith] - AI tool used (defaults to "Windsurf on Claude 3.5 Sonnet")
 * @param {string} [options.category] - Report category (defaults to "Data-Augmentation")
 * @param {string[]} [options.tags] - List of tags
 * @returns {string} Formatted frontmatter
 */
function generateReportFrontmatter({
  date = new Date(),
  authors = ["Michael Staton"],
  augmentedWith = "Windsurf on Claude 3.5 Sonnet",
  category = "Data-Augmentation",
  tags = [
    "Documentation-Standards",
    "YAML",
    "Memory-Management",
    "Session-Logs",
    "Prompts"
  ]
} = {}) {
  // Format date strings
  const dateStr = date.toISOString().split('T')[0];
  const datetimeStr = date.toISOString().replace('.000', '');

  // Format authors with proper indentation
  const authorsStr = authors.map(author => ` - ${author}`).join('\n');

  // Format tags as unordered list without quotes
  const tagsStr = tags.map(tag => `- ${tag}`).join('\n');

  return `---
date: ${dateStr}
datetime: ${datetimeStr}
authors: 
${authorsStr}
augmented_with: '${augmentedWith}'
category: ${category}
tags:
${tagsStr}
---`;
}

module.exports = {
  generateReportFrontmatter
};