// MDXComponents.js
// Maps MDX elements to Astro components for consistent rendering

import Heading from './MDXHeading.astro';
import InlineCode from './MDXInlineCode.astro';
import Paragraph from './MDXParagraph.astro';
import List from './MDXList.astro';
import ListItem from './MDXListItem.astro';
import Table from './MDXTable.astro';
import TableRow from './MDXTableRow.astro';
import TableCell from './MDXTableCell.astro';
import Blockquote from './MDXBlockquote.astro';

export const components = {
  h1: (props) => Heading({ ...props, level: 1 }),
  h2: (props) => Heading({ ...props, level: 2 }),
  h3: (props) => Heading({ ...props, level: 3 }),
  h4: (props) => Heading({ ...props, level: 4 }),
  h5: (props) => Heading({ ...props, level: 5 }),
  h6: (props) => Heading({ ...props, level: 6 }),
  code: InlineCode,
  p: Paragraph,
  ul: (props) => List({ ...props, ordered: false }),
  ol: (props) => List({ ...props, ordered: true }),
  li: ListItem,
  table: Table,
  tr: TableRow,
  td: TableCell,
  th: (props) => TableCell({ ...props, isHeader: true }),
  blockquote: Blockquote,
};