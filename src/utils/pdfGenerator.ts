
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf'; // Fixed import statement - jsPDF is a named export

export const saveAsImage = async (elementId: string, filename: string = 'invoice.png'): Promise<string> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found`);
  }

  try {
    const canvas = await html2canvas(element, { 
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Create a download link
    const link = document.createElement('a');
    link.setAttribute('download', filename);
    link.setAttribute('href', imgData);
    link.click();
    
    return imgData;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

export const generatePDF = async (elementId: string, filename: string = 'invoice.pdf'): Promise<string> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found`);
  }

  try {
    const canvas = await html2canvas(element, { 
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
    
    // Return the PDF as base64
    return pdf.output('datauristring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
