import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ColumnMappingStep from './ColumnMappingStep';
// import DataValidationStep from './DataValidationStep';
// import TransformationStep from './TransformationStep';
// import SummaryStep from './SummaryStep';
import { CheckCircle2 } from "lucide-react";
import { FiInfo } from 'react-icons/fi';

const STEPS = [
  { id: 'mapping', title: 'Column Mapping' },
  { id: 'validation', title: 'Data Validation' },
  { id: 'transformation', title: 'Data Transformation' },
  { id: 'summary', title: 'Summary' }
];

export default function AnalysisSettings({ onComplete,  }) {

      // Sample data
      const sourceColumns = [
          { id: 'col1', name: 'Purchase Order', summary: 'Unique identifier for each purchase order' , required:true},
          { id: 'col2', name: 'Order Date', summary: 'Date when the purchase order was created' , required:true},
          { id: 'col3', name: 'Vendor', summary: 'Supplier or vendor information' , required:true},
          { id: 'col4', name: 'Amount', summary: 'Total value of the purchase order', required:true  },
          { id: 'col5', name: 'Currency', summary: 'Currency of the transaction' , required:false },
        ];
        
        const targetColumns = [
          { id: 'firstName', name: 'First Name', dataType: 'string', required: true },
          { id: 'lastName', name: 'Last Name', dataType: 'string', required: true },
          { id: 'email', name: 'Email', dataType: 'email', required: true },
          { id: 'phoneNumber', name: 'Phone Number', dataType: 'string', required: false },
          { id: 'birthDate', name: 'Birth Date', dataType: 'date', required: false },
          { id: 'address', name: 'Address', dataType: 'string', required: false },
          { id: 'city', name: 'City', dataType: 'string', required: false },
          { id: 'state', name: 'State', dataType: 'string', required: false },
          { id: 'zipCode', name: 'ZIP Code', dataType: 'string', required: false },
        ];
        
        // Initial mapping (optional)
        const initialMapping = {
          col1: 'firstName',
          col2: 'lastName',
          col3: 'email',
        };
        const [currentStepIndex, setCurrentStepIndex] = useState(0);
        const [mappingData, setMappingData] = useState({
          columnMapping: initialMapping,
          validationRules: {},
          transformations: {},
        });
  const currentStep = STEPS[currentStepIndex];
  
  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete(mappingData);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const updateMappingData = (fieldName, value) => {
    setMappingData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  const renderStep = () => {
    switch (currentStep.id) {
      case 'mapping':
        return (
          <ColumnMappingStep
            sourceColumns={sourceColumns}
            targetColumns={targetColumns}
            mapping={mappingData.columnMapping}
            onChange={(mapping) => updateMappingData('columnMapping', mapping)}
          />
        );
      case 'validation':
        return (
          <DataValidationStep
            columns={mappingData.columnMapping}
            rules={mappingData.validationRules}
            onChange={(rules) => updateMappingData('validationRules', rules)}
          />
        );
      case 'transformation':
        return (
          <TransformationStep
            columns={mappingData.columnMapping}
            transformations={mappingData.transformations}
            onChange={(transformations) => updateMappingData('transformations', transformations)}
          />
        );
      case 'summary':
        return (
          <SummaryStep
            mappingData={mappingData}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="p-4 w-full mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`flex items-center justify-center rounded-full w-10 h-10 ${
                index < currentStepIndex 
                  ? 'bg-green-100 text-green-600' 
                  : index === currentStepIndex 
                    ? 'bg-green-800 text-white' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {index < currentStepIndex ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
              </div>
              <span className={`mt-2 text-sm ${
                index === currentStepIndex ? 'text-green-800 font-medium' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              
            </div>
          ))}
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {/* <h2 className="text-xl font-semibold mb-4">{currentStep.title}</h2> */}
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <p className='flex  items-center text-sm gap-2 font-light'><FiInfo />All required columns are mapped</p>
            <div className='flex gap-4'>
                <Button 
                variant="ghost" 
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                >
                Back
                </Button>
                
                <Button 
                className="bg-green-900"
                onClick={handleNext}
                >
                {currentStepIndex === STEPS.length - 1 ? 'Complete' : 'Continue'}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Create empty stubs for other steps
function DataValidationStep() { return <div>Data Validation Step (to be implemented)</div>; }
function TransformationStep() { return <div>Transformation Step (to be implemented)</div>; }
function SummaryStep({ mappingData }) { 
  return (
    <div>
      <h3 className="font-medium mb-2">Column Mapping Summary</h3>
      <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
        {JSON.stringify(mappingData, null, 2)}
      </pre>
    </div>
  ); 
}