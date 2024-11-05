import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generatePDF = () => {
  const doc = new jsPDF('p', 'pt', 'letter');

  // Add group name
  doc.setFontSize(24);
  doc.text(flashcard.group, 40, 50, { align: 'center' });

  // Add group image
  if (flashcard.image) {
    doc.addImage(flashcard.image, 'JPEG', 100, 80, 400, 250); // Adjust positioning and size as needed
  }

  // Add group description
  doc.setFontSize(14);
  doc.text(flashcard.description, 40, 360, { align: 'justify', maxWidth: 500 });

  // Add terms
  let startY = 420; // Adjust starting Y position for terms

  flashcard.terms.forEach((term, index) => {
    if (index > 0) {
      doc.addPage(); // Add new page for each term
      startY = 40; // Reset startY for new page
    }

    // Term name
    doc.setFontSize(16);
    doc.text(`Term ${index + 1}: ${term.term}`, 40, startY, { maxWidth: 500 });

    // Term definition
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(term.definition, 500);
    doc.text(splitText, 40, startY + 20);

    // Term image
    if (term.image) {
      doc.addImage(term.image, 'JPEG', 100, startY + 80, 400, 250); // Adjust positioning and size as needed
    }

    startY += 350; // Adjust for next term
  });

  return doc;
};
