import React, { useState } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

function App() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);

  // This is needed to avoid a webpack issue related to PDF.js
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };
console.log(selectedPages,'selectedpages');
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(res.data.filename);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageToggle = (pageNumber) => {
    if (selectedPages.includes(pageNumber)) {
      setSelectedPages(selectedPages.filter((page) => page !== pageNumber));
    } else {
      setSelectedPages([...selectedPages, pageNumber]);
    }
  };
  const handleCreatePDF = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pages', JSON.stringify(selectedPages));
  
    try {
      console.log('FormData:', formData); // Log FormData object before making the request
      const res = await axios.post('http://localhost:5000/create-pdf', formData, {
        responseType: 'blob',
      });
  
      console.log('Response:', res); // Log the response from the backend
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'new_pdf.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error creating PDF:', err); // Log any errors that occur during the request
    }
  };

  return (
    <div>
      <h1>Upload PDF</h1>
      <input type="file" onChange={onFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {filename && <p>Selected file: {filename}</p>}
      {file && (
        <div>
          <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                onClick={() => handlePageToggle(index + 1)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
          <button onClick={handleCreatePDF}>Create  PDF</button>
        </div>
      )}
    </div>
  );
}

export default App;
