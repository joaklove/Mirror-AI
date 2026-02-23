import type { JournalEntry } from './journalService';

export type ExportFormat = 'json' | 'csv' | 'markdown' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeImages: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  dimensions?: string[];
  tags?: string[];
}

export const exportService = {
  async exportData(
    entries: JournalEntry[],
    options: ExportOptions
  ): Promise<{ blob: Blob; filename: string }> {
    let filteredEntries = entries;

    if (options.dateRange) {
      filteredEntries = entries.filter(e => {
        const date = new Date(e.timestamp);
        return date >= options.dateRange!.start && date <= options.dateRange!.end;
      });
    }

    if (options.dimensions && options.dimensions.length > 0) {
      filteredEntries = filteredEntries.filter(e => 
        e.dimension && options.dimensions!.includes(e.dimension)
      );
    }

    if (options.tags && options.tags.length > 0) {
      filteredEntries = filteredEntries.filter(e =>
        e.tags?.some(tag => options.tags!.includes(tag))
      );
    }

    let content: string;
    let mimeType: string;
    let extension: string;

    switch (options.format) {
      case 'json':
        content = this.exportToJson(filteredEntries);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        content = this.exportToCsv(filteredEntries);
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
        break;
      case 'markdown':
        content = this.exportToMarkdown(filteredEntries);
        mimeType = 'text/markdown;charset=utf-8;';
        extension = 'md';
        break;
      case 'pdf':
        return this.exportToPdf(filteredEntries);
      default:
        throw new Error('Unsupported format');
    }

    const blob = new Blob([content], { type: mimeType });
    const filename = `mirror-ai-export-${Date.now()}.${extension}`;

    return { blob, filename };
  },

  exportToJson(entries: JournalEntry[]): string {
    const data = {
      exportDate: new Date().toISOString(),
      totalEntries: entries.length,
      entries: entries.map(e => ({
        id: e.id,
        content: e.content,
        timestamp: e.timestamp,
        tags: e.tags,
        dimension: e.dimension,
        images: e.images,
      })),
    };
    return JSON.stringify(data, null, 2);
  },

  exportToCsv(entries: JournalEntry[]): string {
    const headers = ['日期', '时间', '内容', '维度', '标签', '图片数量'];
    const rows = entries.map(e => {
      const date = new Date(e.timestamp);
      return [
        date.toLocaleDateString('zh-CN'),
        date.toLocaleTimeString('zh-CN'),
        `"${(e.content || '').replace(/"/g, '""')}"`,
        e.dimension || '',
        `"${(e.tags || []).join(', ')}"`,
        e.images?.length || 0,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },

  exportToMarkdown(entries: JournalEntry[]): string {
    const lines = [
      '# 心镜 AI 日记导出',
      '',
      `导出时间：${new Date().toLocaleString('zh-CN')}`,
      `记录总数：${entries.length}`,
      '',
      '---',
      '',
    ];

    const dimensionLabels: Record<string, string> = {
      psychology: '心理/情绪',
      cognitive: '认知/思维',
      efficiency: '效率/行动',
      social: '社交/关系',
      health: '健康/身体',
      finance: '财务/资源',
    };

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    sortedEntries.forEach((entry, index) => {
      const date = new Date(entry.timestamp);
      const dimension = entry.dimension ? dimensionLabels[entry.dimension] || entry.dimension : '';
      
      lines.push(`## ${index + 1}. ${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN')}`);
      lines.push('');
      
      if (dimension) {
        lines.push(`**维度：** ${dimension}`);
        lines.push('');
      }
      
      if (entry.tags && entry.tags.length > 0) {
        lines.push(`**标签：** ${entry.tags.join(', ')}`);
        lines.push('');
      }
      
      lines.push(entry.content || '');
      lines.push('');
      
      if (entry.images && entry.images.length > 0) {
        lines.push(`*附件：${entry.images.length} 张图片*`);
        lines.push('');
      }
      
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  },

  async exportToPdf(entries: JournalEntry[]): Promise<{ blob: Blob; filename: string }> {
    const markdown = this.exportToMarkdown(entries);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('无法打开打印窗口');
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>心镜 AI 日记导出</title>
          <style>
            body {
              font-family: "Noto Serif SC", "SimSun", serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.8;
            }
            h1 { text-align: center; color: #2c4a3e; }
            h2 { color: #2c4a3e; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
            .meta { color: #666; font-size: 0.9em; }
            .tags { color: #666; }
            hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
            @media print {
              body { padding: 0; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          ${markdown
            .replace(/^# .+$/gm, '<h1>$&</h1>')
            .replace(/^## .+$/gm, '<h2>$&</h2>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^---$/gm, '<hr>')
            .replace(/\n/g, '<br>')
          }
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    await new Promise(resolve => setTimeout(resolve, 500));
    printWindow.print();

    return { 
      blob: new Blob([html], { type: 'text/html' }), 
      filename: `mirror-ai-export-${Date.now()}.html` 
    };
  },

  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
