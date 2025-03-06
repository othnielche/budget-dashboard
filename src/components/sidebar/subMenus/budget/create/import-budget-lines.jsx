// src/components/sidebar/subMenus/budget/create/import-budget-lines.jsx
import React, { useState, useContext } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Upload, File, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDropzone } from 'react-dropzone';
import { AuthContext } from '@/contexts/authContext';
import API from '@/lib/axios';
import { SkippedBudgetLines } from '@/components/dropzone-components/skipped-budget-lines';


const ImportBudgetLines = () => {
  const [file, setFile] = useState(null);
  const {user} = useContext(AuthContext);
  const [skippedBudgetLines, setSkippedBudgetLines] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setSelectedFileName(acceptedFiles[0].name);
      // Reset previous import results when a new file is selected
      setSkippedBudgetLines([]);
      setImportResult(null);
    },
    onDropRejected: () => {
      setFile(null);
      setSelectedFileName('');
    },
    accept: 'text/csv',
    multiple: false
  });

  const handleUpload = () => {
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
  
      const token = user.token
  
      API.post('/budgetline/import-budget-lines', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          // Store the entire response for displaying appropriate messages
          setImportResult(response.data);
          
          // Set skipped budget lines if they exist
          const skippedLines = response.data.errors || [];
          setSkippedBudgetLines(skippedLines);
        })
        .catch(error => {
          console.error(error);
          // Handle error response if it contains skipped lines
          if (error.response && error.response.data && error.response.data.errors) {
            setSkippedBudgetLines(error.response.data.errors);
            setImportResult(error.response.data);
          }
        })
        .finally(() => {
          setIsUploading(false);
        });
    }
  };

  const resetForm = () => {
    setFile(null);
    setSelectedFileName('');
    setSkippedBudgetLines([]);
    setImportResult(null);
  };

  return (
    <div className=''>
      <Card className="relative flex flex-col gap-6 overflow-hidden">
        <CardContent>
          <div className="p-6">
            <div {...getRootProps()} className={`grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25 ${
              isDragActive ? 'border-muted-foreground/50' : ''
            }`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="font-medium text-muted-foreground">
                    {isDragActive ? 'Drop the file here' : 'Drag \'n\' drop a file here, or click to select a file'}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    You can upload a CSV file
                  </p>
                </div>
              </div>
            </div>
            {file && (
              <Card className="mt-6 transition duration-300 ease-in-out border-dashed border" style={{ opacity: file ? 1 : 0, maxHeight: file ? '100px' : '0' }}>
                <div className='flex flex-row text-center items-center justify-center'>
                  <p className="">Selected File:</p>
                  <p className="ml-2 font-semibold">{selectedFileName}</p>
                </div>
              </Card>
            )}
            
            {importResult && (
              <div className={`mt-4 p-4 rounded-md ${
                importResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <p className="font-medium">{importResult.message}</p>
                {importResult.totalRows && (
                  <p className="text-sm mt-1">
                    Total rows processed: {importResult.totalRows}
                    {importResult.importedCount !== undefined && ` | Imported: ${importResult.importedCount}`}
                    {importResult.errors && ` | Errors: ${importResult.errors.length}`}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={resetForm}
          >
            Cancel
          </Button>
          <Button 
            className="ml-4 hover:bg-green-400 bg-green-500" 
            variant="" 
            size="lg" 
            onClick={handleUpload}
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <div className="flex items-center">
                <LoaderCircle className="animate-spin h-5 w-5 "/> 
                <span className="ml-2">Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Upload className="mr-2" size={20} /> 
                <span>Upload File</span>
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
      <div>
        {skippedBudgetLines.length > 0 && (
          <SkippedBudgetLines skippedBudgetLines={skippedBudgetLines} />
        )}
      </div>
    </div>
  );
};

export default ImportBudgetLines;