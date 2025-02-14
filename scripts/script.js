import fs from 'fs';
import path from 'path';
import parser from '@babel/parser'; // Babel parser to parse JSX syntax

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Print the paths to check
console.log('Current directory:', __dirname);
console.log('Components directory:', path.join(__dirname, '../components'));
console.log('Output file:', path.join(__dirname, '../locales/en.json'));

// Directory containing React components
const COMPONENTS_DIR = path.join(__dirname, '../components','Test.jsx');

// Output JSON file (locales/en.json)
const OUTPUT_FILE = path.join(__dirname, '../locales', 'en.json');

// Extract text content from JSX
const extractText = (jsxContent) => {
  const matches = [];
  const parsed = parser.parse(jsxContent, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  const extractNodes = (node) => {
    if (node.type === 'JSXText') {
      matches.push(node.value.trim());
    }
    if (node.type === 'JSXExpressionContainer' && node.expression) {
      matches.push(`{{${node.expression.name || node.expression.value}}}`);
    }
    if (node.children) {
      node.children.forEach(extractNodes);
    }
  };

  parsed.program.body.forEach((node) => {
    if (node.type === 'JSXElement') {
      extractNodes(node.openingElement);
      extractNodes(node.closingElement);
      node.children.forEach(extractNodes);
    }
  });

  return matches;
};

// Generate JSON translation structure
const generateTranslationJSON = () => {
  const translations = {};
  const files = fs.readdirSync(COMPONENTS_DIR);

  files.forEach((file) => {
    if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const filePath = path.join(COMPONENTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const extractedTexts = extractText(content);

      extractedTexts.forEach((text, index) => {
        const key = `${file.replace(/\.[jt]sx?$/, '')}_text_${index}`;
        translations[key] = text;
      });
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ translation: translations }, null, 2));
  console.log('✅ Localization JSON generated:', OUTPUT_FILE);
};

// Run the script
generateTranslationJSON();
