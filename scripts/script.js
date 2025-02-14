import fs from 'fs';
import path from 'path';
import parser from '@babel/parser';
import traverse from '@babel/traverse';

// Get the current file's directory
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Directory containing React components
const COMPONENTS_DIR = '/Users/gurucharanch/Desktop/knit_poc/knit_poc/components';
const OUTPUT_FILE = '/Users/gurucharanch/Desktop/knit_poc/knit_poc/locales/en.json';

// Log the full path of the components directory
console.log('Looking for components in:', COMPONENTS_DIR);

// Function to extract text content from JSX using Babel traverse
const extractText = (jsxContent) => {
  const matches = [];
  
  const parsed = parser.parse(jsxContent, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'], // Ensure JSX & TypeScript are enabled
  });

  traverse.default(parsed, {
    JSXText({ node }) {
      const text = node.value.trim();
      if (text) {
        matches.push(text);
        console.log('Extracted JSX Text:', text);
      }
    },
  });

  return matches;
};

// Function to generate JSON translation file
const generateTranslationJSON = () => {
  const translations = {};

  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error('❌ Components directory does not exist:', COMPONENTS_DIR);
    return;
  }

  const files = fs.readdirSync(COMPONENTS_DIR);

  files.forEach((file) => {
    if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const filePath = path.join(COMPONENTS_DIR, file);

      if (!fs.existsSync(filePath)) {
        console.error('❌ File not found:', filePath);
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`\n📄 Processing file: ${file}`);
      console.log('File content:', content);

      const extractedTexts = extractText(content);
      console.log('Extracted Texts:', extractedTexts);

      extractedTexts.forEach((text, index) => {
        const key = `${file.replace(/\.[jt]sx?$/, '')}_text_${index}`;
        translations[key] = text;
      });
    }
  });

  // Ensure the output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ translation: translations }, null, 2));
  console.log('\n✅ Localization JSON generated:', OUTPUT_FILE);
};

// Run the script
generateTranslationJSON();
