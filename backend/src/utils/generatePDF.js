const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePrescriptionPDF = (prescription, appointment, doctor, patient, filePath) => {
  return new Promise((resolve, reject) => {
    // Ensure directories exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);

    // Header / Clinic Brand
    doc.fillColor('#1e3a8a').fontSize(24).text('MedBook Healthcare Network', { align: 'center' });
    doc.fillColor('#10b981').fontSize(10).text('Digital Prescriptions Portal', { align: 'center' });
    doc.moveDown(1);
    
    // Draw line
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // Doctor & Patient Grid
    const yStart = doc.y;
    doc.fillColor('#1e3a8a').fontSize(12).text('DOCTOR:', 50, yStart);
    doc.fillColor('#374151').fontSize(11).text(`Dr. ${doctor.user ? doctor.user.name : 'Medical Specialist'}`, 50, yStart + 18);
    doc.fontSize(10).text(`${doctor.qualifications.join(', ')}`, 50, yStart + 32);
    doc.text(`${doctor.specialization ? doctor.specialization.name : 'General Department'}`, 50, yStart + 46);
    doc.text(`${doctor.hospital ? doctor.hospital.name : 'MedBook Hospital'}`, 50, yStart + 60);

    doc.fillColor('#1e3a8a').fontSize(12).text('PATIENT:', 320, yStart);
    doc.fillColor('#374151').fontSize(11).text(`${patient.user ? patient.user.name : 'Valued Patient'}`, 320, yStart + 18);
    doc.fontSize(10).text(`Gender: ${patient.gender || 'Not Specified'}`, 320, yStart + 32);
    doc.text(`Blood Group: ${patient.bloodGroup || 'Unknown'}`, 320, yStart + 46);
    doc.text(`Date: ${new Date(prescription.date).toLocaleDateString()}`, 320, yStart + 60);

    doc.moveDown(5);
    
    // Draw line
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // Rx Symbol
    doc.fillColor('#10b981').fontSize(20).text('Rx', 50, doc.y);
    doc.moveDown(0.5);

    // Table Header for Medicines
    const tableTop = doc.y;
    doc.fillColor('#1e3a8a').fontSize(10);
    doc.text('Medicine Name', 50, tableTop);
    doc.text('Dosage', 220, tableTop);
    doc.text('Instruction', 320, tableTop);
    doc.text('Duration', 450, tableTop);

    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).stroke();
    
    let currentY = tableTop + 22;
    doc.fillColor('#374151');
    
    if (prescription.medicines && prescription.medicines.length > 0) {
      prescription.medicines.forEach((med) => {
        doc.text(med.name, 50, currentY);
        doc.text(med.dosage, 220, currentY);
        doc.text(med.instruction || 'After meals', 320, currentY);
        doc.text(med.duration, 450, currentY);
        currentY += 20;
      });
    }

    doc.moveDown(2);
    doc.y = currentY + 10;

    // Notes
    if (prescription.notes) {
      doc.fillColor('#1e3a8a').fontSize(12).text('Advice / Notes:', 50, doc.y);
      doc.fillColor('#374151').fontSize(10).text(prescription.notes, 50, doc.y + 16);
      doc.moveDown(2.5);
    }

    // Signature Area
    const footerY = doc.y + 35;
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(350, footerY).lineTo(500, footerY).stroke();
    doc.fillColor('#374151').fontSize(10).text('Doctor Signature', 350, footerY + 5, { align: 'center', width: 150 });

    doc.end();

    writeStream.on('finish', () => resolve(true));
    writeStream.on('error', (err) => reject(err));
  });
};

module.exports = generatePrescriptionPDF;
