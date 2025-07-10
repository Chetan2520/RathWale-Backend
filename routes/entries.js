const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const PdfPrinter = require('pdfmake');
const path = require('path');

// Font setup - ensure these fonts exist in your /fonts folder
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../fonts/Roboto-MediumItalic.ttf'),
  },
};

const printer = new PdfPrinter(fonts);

// Get all entries for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user.id });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new entry
router.post('/', auth, async (req, res) => {
  try {
    const { customerName, bookingDate, items } = req.body;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const entry = new Entry({
      user: req.user.id,
      customerName,
      bookingDate,
      items,
      total,
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update existing entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { customerName, bookingDate, items } = req.body;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { customerName, bookingDate, items, total },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single entry (for viewing)
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download entry as PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const docDefinition = {
      content: [
        // Title
        { text: '🧾 INVOICE', style: 'invoiceTitle', alignment: 'center' },
    
        // Info Section
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Customer Name:\n', style: 'label' },
                { text: `${entry.customerName}\n`, style: 'value' },
              ],
            },
            {
              width: '*',
              alignment: 'right',
              text: [
                { text: 'Booking Date:\n', style: 'label' },
                { text: `${new Date(entry.bookingDate).toLocaleDateString()}\n`, style: 'value' },
              ],
            }
          ],
          margin: [0, 20, 0, 10]
        },
    
        // Table Heading
        { text: 'Order Summary', style: 'sectionHeading' },
    
        // Items Table
        {
          table: {
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Item', style: 'tableHeader' },
                { text: 'Price', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' }
              ],
              ...entry.items.map(item => ([
                { text: item.name, style: 'tableCell' },
                { text: `₹${item.price}`, style: 'tableCell' },
                { text: item.quantity, style: 'tableCell' },
                { text: `₹${item.price * item.quantity}`, style: 'tableCell' }
              ])),
              [
                { text: 'Grand Total', colSpan: 3, alignment: 'right', style: 'totalLabel' }, {}, {},
                { text: `₹${entry.total}`, style: 'totalValue' }
              ]
            ]
          },
          layout: {
            fillColor: (rowIndex) => rowIndex === 0 ? '#d3eafd' : null,
            hLineWidth: () => 0.8,
            vLineWidth: () => 0.4,
            hLineColor: () => '#aaa',
            vLineColor: () => '#ccc',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
          }
        },
    
        // Company Info
        {
          text: '\nMumtaz Associates\nCivil, Architecture & Interior Consultancy',
          style: 'companyInfo',
          alignment: 'center',
          margin: [0, 40, 0, 0]
        },
    
        // Footer
        {
          text: 'Thank you for choosing us!',
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0]
        }
      ],
    
      styles: {
        invoiceTitle: { fontSize: 26, bold: true, color: '#003366', margin: [0, 10, 0, 20] },
        sectionHeading: { fontSize: 16, bold: true, color: '#003366', margin: [0, 20, 0, 10] },
        label: { fontSize: 12, bold: true, color: '#555555' },
        value: { fontSize: 12, color: '#111111' },
        tableHeader: { bold: true, fillColor: '#d3eafd', fontSize: 13, color: '#003366' },
        tableCell: { fontSize: 12, color: '#333333' },
        totalLabel: { fontSize: 13, bold: true, color: '#222' },
        totalValue: { fontSize: 13, bold: true, color: '#007700' },
        companyInfo: { fontSize: 11, bold: true, color: '#555' },
        footer: { fontSize: 10, italics: true, color: '#888888' }
      }
    };
    
    

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill_${entry._id}.pdf`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
