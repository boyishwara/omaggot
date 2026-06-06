const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
                walkDir(dirPath, callback);
            }
        } else {
            callback(dirPath);
        }
    });
}

const targetExtensions = ['.md', '.ts', '.tsx'];

walkDir('.', function(filePath) {
    if (targetExtensions.includes(path.extname(filePath))) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('—')) {
            content = content.replace(/—/g, ' - ');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Replaced em-dashes in: ' + filePath);
        }
    }
});
