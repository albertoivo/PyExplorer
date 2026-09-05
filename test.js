const content = '- ✅ Check\n- Item';
let html = content
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^- ✅ (.*$)/gim, '<li class="check">✅ $1</li>');
console.log("Original order:");
console.log(html);

html = content
        .replace(/^- ✅ (.*$)/gim, '<li class="check">✅ $1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>');
console.log("Reversed order:");
console.log(html);
