const fs = require('fs');
const path = require('path');

const DEV = /[\u0900-\u097F]/;
const LATIN = /[A-Za-z]/;
const ACCENTED = /[\u00C0-\u00FF]/;
const OTHER_SCRIPTS = /[\u0600-\u06FF\u0E00-\u0E7F\u0980-\u09FF\u0A00-\u0A7F\u0400-\u04FF]/;

const EXTS = ['.html', '.htm', '.js', '.json', '.txt', '.md', '.css'];
const IGNORE_DIRS = new Set(['.git', 'node_modules', '.vscode', 'dist', 'build']);

const tally = {};
const findings = [];
let filesScanned = 0;

function cleanLine(line) {
    // HTML tags strip karun shuddh text scan karnyasathi
    return line.replace(/<[^>]*>/g, ' ');
}

function scanFile(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        return;
    }
    filesScanned++;
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        const lineNo = index + 1;
        const textOnly = cleanLine(line); // Tag-free text
        const foundInLine = new Set();

        // 1. Latin + Devanagari & Accented + Devanagari Check
        for (let i = 0; i < textOnly.length - 1; i++) {
            const char1 = textOnly[i];
            const char2 = textOnly[i + 1];

            const isLatinDev = (LATIN.test(char1) && DEV.test(char2)) || (DEV.test(char1) && LATIN.test(char2));
            const isAccentedDev = (DEV.test(char1) && ACCENTED.test(char2)) || (ACCENTED.test(char1) && DEV.test(char2));

            if (isLatinDev || isAccentedDev) {
                const frag = char1 + char2;
                if (!foundInLine.has(frag)) {
                    foundInLine.add(frag);
                    tally[frag] = (tally[frag] || 0) + 1;
                    findings.push({ path: filePath, lineNo, frag, snippet: line.trim() });
                }
            }
        }

        // 2. Other Foreign Scripts (Thai/Arabic/Cyrillic)
        if (OTHER_SCRIPTS.test(textOnly)) {
            const match = textOnly.match(OTHER_SCRIPTS);
            if (match) {
                const frag = match[0];
                if (!foundInLine.has(frag)) {
                    foundInLine.add(frag);
                    tally[frag] = (tally[frag] || 0) + 1;
                    findings.push({ path: filePath, lineNo, frag, snippet: line.trim() });
                }
            }
        }

        // 3. Specific Common Typos
        if (textOnly.includes('ह्रु')) {
            if (!foundInLine.has('ह्रु')) {
                foundInLine.add('ह्रु');
                tally['ह्रु'] = (tally['ह्रु'] || 0) + 1;
                findings.push({ path: filePath, lineNo, frag: 'ह्रु', snippet: line.trim() });
            }
        }
    });
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.has(file)) {
                traverseDir(fullPath);
            }
        } else if (EXTS.includes(path.extname(file).toLowerCase())) {
            scanFile(fullPath);
        }
    }
}

console.log("======================================================================");
console.log(`  संतवाणी encoding स्कॅन (Node.js) — स्कॅनिंग सुरू आहे...`);
console.log("======================================================================\n");

traverseDir('.');

const total = Object.values(tally).reduce((a, b) => a + b, 0);

if (total === 0) {
    console.log("कोणतीही समस्या सापडली नाही. सर्व फाइल्स स्वच्छ आहेत!\n");
} else {
    console.log(`एकूण ${filesScanned} फाइल्स स्कॅन झाल्या.`);
    console.log(`एकूण ${total} संशयास्पद तुकडे सापडले.\n`);
    
    console.log("----------------------------------------------------------------------");
    console.log("भाग १ : कोणता तुकडा किती वेळा आला (VS Code चालीत Replace करा)");
    console.log("----------------------------------------------------------------------");
    
    const sortedTally = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    sortedTally.forEach(([frag, count]) => {
        console.log(`  ${String(count).padStart(5)} ×    '${frag}'`);
    });

    console.log("\n----------------------------------------------------------------------");
    console.log("भाग २ : प्रत्येक जागेचा तपशील");
    console.log("----------------------------------------------------------------------\n");

    findings.forEach(item => {
        console.log(`  ${item.path}:${item.lineNo} [Fragment: '${item.frag}']`);
        console.log(`      ${item.snippet}\n`);
    });
}
