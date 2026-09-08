export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function parseMarkdown(content: string): string {
    let processedContent = escapeHtml(content);

    // Primeiro, processa tabelas separadamente
    // Encontra e converte tabelas markdown
    const tableRegex = /(\|.+\|[\r\n]+\|[-:| ]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/gm;
    processedContent = processedContent.replace(tableRegex, (tableBlock) => {
        const lines = tableBlock.trim().split('\n').filter(line => line.trim());
        if (lines.length < 2) return tableBlock;

        // Primeira linha é o header
        const headerCells = lines[0].split('|').filter(c => c.trim()).map(c => c.trim());
        // Segunda linha é o separador (ignoramos)
        // Restante são as linhas de dados
        const dataRows = lines.slice(2);

        let html = '<table class="markdown-table"><thead><tr>';
        headerCells.forEach(cell => {
            html += `<th>${cell}</th>`;
        });
        html += '</tr></thead><tbody>';

        dataRows.forEach(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
            html += '<tr>';
            cells.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    });

    // Converte markdown básico para HTML
    // Note from memory: Custom Markdown parsing in `src/pages/ArticlePage.tsx` requires non-greedy regex (e.g., `.*?`) for bold and italic tags to prevent incorrectly capturing and mangling multiple formatted elements on the same line.
    const html = processedContent
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold (Non-greedy)
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic (Non-greedy)
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Code blocks
        .replace(/```python\n([\s\S]*?)```/gim, '<pre class="code-block code-block--python"><code>$1</code></pre>')
        .replace(/```java\n([\s\S]*?)```/gim, '<pre class="code-block code-block--java"><code>$1</code></pre>')
        .replace(/```([\s\S]*?)```/gim, '<pre class="code-block"><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/gim, '<code class="inline-code">$1</code>')
        // Checkmarks (deve vir antes de Lists para não ser consumido por ele)
        .replace(/^- ✅ (.*$)/gim, '<li class="check">✅ $1</li>')
        // Lists
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        // Links [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        // Line breaks
        .replace(/\n\n/gim, '</p><p>');

    return `<p>${html}</p>`;
}
