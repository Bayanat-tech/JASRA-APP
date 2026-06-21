import { useState } from 'react';
import HRPersnolInfoForm from './HRPersnolInfoForm';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';
import { HRPayrollForm } from './HRPayrollForm';
import { HRPassportInfo } from './HRPassportInfo';
import { HRContractInfo } from './HRContractInfo';
import { HRSponsorInfo } from './HRSponsorInfo';
import { HRInsuranceInfo } from './HRInsuranceInfo';
import { HRIdCardInfo } from './HRIdCardInfo';
import { HRAirfareInfo } from './HRAirfareInfo';
import {  useIntl } from 'react-intl';

interface HRAddEmployeeFormProps {
  onClose: (existingData: any, refetchData: any) => void;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}

const HRAddEmployeeForm: React.FC<HRAddEmployeeFormProps> = ({ onClose, isEditMode, employeeData }) => {
    const intl = useIntl();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

 const stepTitles = [
    intl.formatMessage({ id: 'Personal' }),
    intl.formatMessage({ id: 'Payroll' }),
    intl.formatMessage({ id: 'Passport' }),
    intl.formatMessage({ id: 'Contract' }),
    intl.formatMessage({ id: 'Sponsor' }),
    intl.formatMessage({ id: 'Insurance' }),
    intl.formatMessage({ id: 'ID/Card' }),
    intl.formatMessage({ id: 'Airfare' })
  ];


  const stepFullTitles = [
    intl.formatMessage({ id: 'Personal Information' }),
    intl.formatMessage({ id: 'Payroll Information' }),
    intl.formatMessage({ id: 'Passport Information' }),
    intl.formatMessage({ id: 'Contract Information' }),
    intl.formatMessage({ id: 'Sponsor Information' }),
    intl.formatMessage({ id: 'Insurance Information' }),
    intl.formatMessage({ id: 'ID/Card Information' }),
    intl.formatMessage({ id: 'Airfare Information' })
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, submit or complete the form
      console.log('Form completed');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="w-full p-3 bg-white rounded-md shadow-md flex flex-col" style={{ minHeight: '600px' }}>
      {/* Horizontal Stepper - Responsive */}
      <div className="mb-4">
        {/* Mobile view - simplified stepper with current step indicator */}
        <div className="md:hidden flex justify-between items-center mb-3">
          <div className="text-sm font-medium text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-sm font-semibold text-[#082A89]">{stepFullTitles[currentStep - 1]}</div>
        </div>

        <div className="hidden md:flex justify-between items-center">
          {stepTitles.map((title, index) => (
            <div
              key={index}
              className={`flex flex-col items-center cursor-pointer ${index < stepTitles.length - 1 ? 'flex-1' : ''}`}
              onClick={() => handleStepClick(index + 1)}
            >
              <div className="flex items-center w-full">
                {/* Step circle */}
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-1 ${
                    currentStep > index + 1 ? 'bg-green-500' : currentStep === index + 1 ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`font-bold text-xs ${currentStep >= index + 1 ? 'text-white' : 'text-gray-500'}`}>{index + 1}</span>
                </div>
                {/* Connector line (except last step) */}
                {index < stepTitles.length - 1 && (
                  <div className={`flex-1 h-0.5 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                )}
              </div>
              {/* Step title */}
              <div
                className={`mt-1 text-xs text-center font-medium ${
                  currentStep === index + 1 ? 'text-[#082A89] font-bold' : 'text-gray-600'
                }`}
              >
                {title}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile step dots indicator */}
        <div className="md:hidden flex justify-center space-x-2 mt-2">
          {stepTitles.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                currentStep > index + 1 ? 'bg-green-500' : currentStep === index + 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => handleStepClick(index + 1)}
            ></div>
          ))}
        </div>
      </div>

      {/* Current step indicator - hidden on mobile as we show it in the mobile header */}
      <div className="hidden md:flex items-center mb-3">
        <h2 className="text-lg font-semibold text-[#082A89]">{stepFullTitles[currentStep - 1]}</h2>
      </div>

      {/* Form content with flex-grow to push buttons to bottom */}
      <div className="mb-4 p-3 border border-gray-200 rounded-md flex-grow overflow-y-auto">
        {currentStep === 1 && <HRPersnolInfoForm employeeData={employeeData} isEditMode={isEditMode} />}
        {currentStep === 2 && <HRPayrollForm employeeData={employeeData} isEditMode={isEditMode} />}
        {currentStep === 3 && <HRPassportInfo employeeData={employeeData} isEditMode={isEditMode} />}
        {currentStep === 4 && <HRContractInfo employeeData={employeeData} isEditMode={isEditMode} />}
        {currentStep === 5 && <HRSponsorInfo employeeData={employeeData} isEditMode={isEditMode} />}
        {currentStep === 6 && <HRInsuranceInfo employeeData={employeeData} isEditMode={isEditMode} />}
        {currentStep === 7 && <HRIdCardInfo employeeData={employeeData} isEditMode={isEditMode} />}
        {currentStep === 8 && <HRAirfareInfo employeeData={employeeData} isEditMode={isEditMode} />}
      </div>

      {/* Sticky Navigation buttons */}
      <div className="sticky bottom-0 bg-white pt-2 border-t border-gray-200 mt-2 pb-1">
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded font-medium ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors'
            }`}
          >
            {intl.formatMessage({ id: 'Previous' }) || 'Previous'}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => onClose({}, {})}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              
                 {intl.formatMessage({ id: 'Cancel' }) || 'Cancel'}
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-[#082A89] text-white rounded font-medium hover:bg-blue-800 transition-colors"
            >
             {currentStep === totalSteps 
                ? intl.formatMessage({ id: 'Complete' }) || 'Complete' 
                       : intl.formatMessage({ id: 'Next' }) || 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRAddEmployeeForm;
