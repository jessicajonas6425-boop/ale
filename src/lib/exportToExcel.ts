import * as XLSX from 'xlsx';

export function exportToExcel<T extends object>(data: T[], fileName: string, sheetName = 'Dados') {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate buffer & trigger download
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    // Fallback to CSV if needed
    fallbackExportCSV(data, fileName);
  }
}

function fallbackExportCSV<T extends object>(data: T[], fileName: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(';');
  const rows = data.map((obj) =>
    Object.values(obj)
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(';')
  );
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
