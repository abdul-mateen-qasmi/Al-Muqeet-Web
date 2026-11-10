import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWorkers, getTransactions, getSettings } from '@/lib/db';
import { FileSpreadsheet, Download, FileJson } from 'lucide-react';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { Worker, Transaction } from '@/types';

export function Reports() {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all');

  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: getWorkers });
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => getTransactions() });
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  // Generate Excel Document with styling
  const generateExcel = async (type: 'statement' | 'ledger' | 'outstanding') => {
    if (!settings) return;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Loan Manager';
    workbook.created = new Date();

    // Theme Constants
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    const headerFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 10, color: { argb: 'FFFFFFFF' }, bold: true };
    const cellFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 10 };
    const currencyFormat = '#,##0.00;(#,##0.00);-';

    const applyHeaderStyle = (row: ExcelJS.Row) => {
      row.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    };

    if (type === 'statement' && selectedWorkerId !== 'all') {
      const worker = workers.find(w => w.id === selectedWorkerId);
      if (!worker) return;

      const sheet = workbook.addWorksheet(`${worker.name} Statement`);

      // Title Block
      sheet.mergeCells('A1:F1');
      sheet.getCell('A1').value = 'Worker Statement';
      sheet.getCell('A1').font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1F3864' } };
      sheet.getCell('A2').value = `Worker: ${worker.name}`;
      sheet.getCell('A3').value = `Generated: ${format(new Date(), 'dd-MMM-yyyy')}`;
      sheet.getCell('A4').value = `Currency: ${settings.currency}`;

      // Headers
      const headerRow = sheet.addRow(['Date', 'Description', 'Loan Given', 'Repayment', 'Balance', 'Note']);
      applyHeaderStyle(headerRow);
      sheet.views = [{ state: 'frozen', ySplit: 5 }];

      const workerTxs = transactions
        .filter(t => t.worker_id === worker.id)
        .sort((a, b) => new Date(a.tx_date).getTime() - new Date(b.tx_date).getTime());

      let runningBal = 0;
      workerTxs.forEach(tx => {
        const isLoan = tx.type === 'loan';
        runningBal += isLoan ? Number(tx.amount) : -Number(tx.amount);

        const row = sheet.addRow([
          new Date(tx.tx_date),
          isLoan ? 'Loan Given' : 'Repayment Received',
          isLoan ? Number(tx.amount) : null,
          !isLoan ? Number(tx.amount) : null,
          runningBal,
          tx.note || ''
        ]);

        row.getCell(1).numFmt = 'dd-mmm-yyyy';
        row.getCell(3).numFmt = currencyFormat;
        row.getCell(4).numFmt = currencyFormat;
        row.getCell(5).numFmt = currencyFormat;
        row.font = cellFont;
      });

      // Totals
      const totalRow = sheet.addRow(['', 'Closing Balance', { formula: `SUM(C6:C${workerTxs.length+5})` }, { formula: `SUM(D6:D${workerTxs.length+5})` }, runningBal, '']);
      totalRow.font = { name: 'Arial', size: 10, bold: true };
      totalRow.getCell(3).numFmt = currencyFormat;
      totalRow.getCell(4).numFmt = currencyFormat;
      totalRow.getCell(5).numFmt = currencyFormat;

      sheet.getColumn('A').width = 15;
      sheet.getColumn('B').width = 25;
      sheet.getColumn('C').width = 15;
      sheet.getColumn('D').width = 15;
      sheet.getColumn('E').width = 15;
      sheet.getColumn('F').width = 30;

    } else if (type === 'outstanding') {
       const sheet = workbook.addWorksheet('Outstanding Balances');

       sheet.mergeCells('A1:G1');
       sheet.getCell('A1').value = `Outstanding Balances as of ${format(new Date(), 'dd-MMM-yyyy')}`;
       sheet.getCell('A1').font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1F3864' } };

       const headerRow = sheet.addRow(['#', 'Worker', 'Total Loaned', 'Total Repaid', 'Outstanding Balance', 'Last Loan Date', 'Last Repayment Date']);
       applyHeaderStyle(headerRow);
       sheet.views = [{ state: 'frozen', ySplit: 2 }];

       let rowIndex = 3;
       workers.forEach(w => {
         const wTx = transactions.filter(t => t.worker_id === w.id);
         let loaned = 0;
         let repaid = 0;
         let lastLoan: Date | null = null;
         let lastRepay: Date | null = null;

         wTx.forEach(tx => {
           if(tx.type === 'loan') {
             loaned += Number(tx.amount);
             if(!lastLoan || new Date(tx.tx_date) > lastLoan) lastLoan = new Date(tx.tx_date);
           } else {
             repaid += Number(tx.amount);
             if(!lastRepay || new Date(tx.tx_date) > lastRepay) lastRepay = new Date(tx.tx_date);
           }
         });

         const out = loaned - repaid;
         if(out > 0) {
           const row = sheet.addRow([rowIndex-2, w.name, loaned, repaid, out, lastLoan, lastRepay]);
           row.getCell(3).numFmt = currencyFormat;
           row.getCell(4).numFmt = currencyFormat;
           row.getCell(5).numFmt = currencyFormat;
           row.getCell(6).numFmt = 'dd-mmm-yyyy';
           row.getCell(7).numFmt = 'dd-mmm-yyyy';
           row.font = cellFont;
           rowIndex++;
         }
       });

       sheet.columns.forEach(c => { c.width = 20; });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LoanManager_${type}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    link.click();
  };

  const generateBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      workers,
      transactions,
      settings
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LoanManager_Backup_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-3xl lg:text-[40px] font-heading font-bold text-text-primary mb-1">Reports</h1>
        <p className="text-text-muted">Export data to Excel or create a full JSON backup.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Worker Statement */}
        <div className="bg-card rounded-card border border-border p-6 flex flex-col gap-6">
          <div>
            <div className="w-12 h-12 bg-card-raised rounded-full flex items-center justify-center mb-4 border border-border text-accent-lime">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold mb-1">Worker Statement</h3>
            <p className="text-sm text-text-muted">Full record with running balance for a specific worker.</p>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="bg-canvas border border-border rounded-input px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-lime outline-none appearance-none cursor-pointer w-full"
            >
              <option value="all" disabled>Select a worker...</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button
              onClick={() => generateExcel('statement')}
              disabled={selectedWorkerId === 'all'}
              className="w-full flex items-center justify-center gap-2 bg-card-raised border border-border text-text-primary px-5 py-3 rounded-input font-medium hover:bg-border/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download Excel
            </button>
          </div>
        </div>

        {/* Outstanding Balances */}
        <div className="bg-card rounded-card border border-border p-6 flex flex-col gap-6">
          <div>
            <div className="w-12 h-12 bg-card-raised rounded-full flex items-center justify-center mb-4 border border-border text-accent-coral">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold mb-1">Outstanding Balances</h3>
            <p className="text-sm text-text-muted">List of all workers who still must repay, largest balance first.</p>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => generateExcel('outstanding')}
              className="w-full flex items-center justify-center gap-2 bg-card-raised border border-border text-text-primary px-5 py-3 rounded-input font-medium hover:bg-border/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime"
            >
              <Download className="w-4 h-4" /> Download Excel
            </button>
          </div>
        </div>

        {/* Full JSON Backup */}
        <div className="bg-card rounded-card border border-border p-6 flex flex-col gap-6">
          <div>
            <div className="w-12 h-12 bg-card-raised rounded-full flex items-center justify-center mb-4 border border-border text-text-muted">
              <FileJson className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-heading font-bold mb-1">Full Backup</h3>
            <p className="text-sm text-text-muted">Download the complete ledger database in JSON format for safekeeping.</p>
          </div>

          <div className="mt-auto">
            <button
              onClick={generateBackup}
              className="w-full flex items-center justify-center gap-2 bg-card-raised border border-border text-text-primary px-5 py-3 rounded-input font-medium hover:bg-border/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-lime"
            >
              <Download className="w-4 h-4" /> Download JSON
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
