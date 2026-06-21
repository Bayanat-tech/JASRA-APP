import { CardContent, Step, StepButton, Stepper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  TAirfareHr,
  TContractHr,
  TEmployeeHr,
  TILPHr,
  TIsuranceHr,
  TPassportHr,
  TPayrollHr,
  TPersnolHr,
  TSponsorHr
} from 'pages/WMS/types/employee-hr.types';
import { useEffect, useState } from 'react';
import employeeServiceInstance from 'service/GM/service.employee_hr';
import { AirfareInfo } from './AirfareInfo';
import { ContractInfo } from './ContractInfo';
import { IdCardInfo } from './IdCardInfo';
import { InsuranceInfo } from './InsuranceInfo';
import { PassportInfo } from './PassportInfo';
import { PayrollForm } from './PayrollForm';
import PersnolInfoForm from './PersnolInfoForm';
import { SponsorInfo } from './SponsorInfo';
import { FormattedMessage } from 'react-intl';

const AddEmployeeHrForm = ({
  onClose,
  isEditMode,
  employee_code
}: {
  onClose: (existingData?: TEmployeeHr, refetchData?: boolean) => void;
  isEditMode: boolean;
  employee_code: string;
}) => {
  //-----------constants--------
  // Define the steps for the form
  const steps = [
    'Persnol Info',
    'Payroll Info',
    'Passport Info',
    'Contract Info',
    'Sponsor Info',
    'Insurance Info',
    'ID/Card Info',
    'Airfare Info'
  ];

  //-----------------States--------------
  // State to manage the active step in the stepper
  const [activeStep, setActiveStep] = useState(0);

  // Fetch employee data if in edit mode
  const { data: employeeData, isFetched: isEmployeeDataFetched } = useQuery<TEmployeeHr | undefined>({
    queryKey: ['employee_data'],
    queryFn: () => employeeServiceInstance.getEmployee(employee_code),
    enabled: isEditMode === true
  });

  //-------------persnol info state---------
  // State to manage personal info
  const [persnolInfo, setPersnolInfo] = useState<TPersnolHr>({
    div_code: '',
    dept_code: '',
    section_code: '',
    emp_photo: '',
    employee_code: '',
    alternate_id: '',
    rpt_name: '',
    grade_code: '',
    desg_code: '',
    labour_desg_code: '',
    category_code: '',
    birth_date: null as unknown as Date,
    join_date: null as unknown as Date,
    probation_end_date: null as unknown as Date,
    probation_confirm_date: null as unknown as Date,
    emp_status: '',
    country_code: ''
  });

  //--------pay roll info state--------
  // State to manage payroll info
  const [payRollInfo, setPayRolllInfo] = useState<TPayrollHr>({
    include_in_payroll: '',
    payroll_start_date: null as unknown as Date,
    payment_mode: '',
    company_bank_code: '',
    salary_acct_no: '',
    salary_bank_code: '',
    currency_id: '',
    exch_rate: null as unknown as number,
    emp_iban_no: ''
  });

  //--------passport Info state---------
  // State to manage passport info
  const [passportInfo, setPassportInfo] = useState<TPassportHr>({
    ppt_no: '',
    ppt_name: '',
    ppt_country: '',
    ppt_status: '',
    ppt_valid_from: null as unknown as Date,
    ppt_valid_to: null as unknown as Date,
    passport_with: ''
  });

  //----------contract info---------
  // State to manage contract info
  const [contractInfo, setContractInfo] = useState<TContractHr>({
    contract_type: '',
    contract_start_date: null as unknown as Date,
    contract_end_date: null as unknown as Date,
    contract_renewable: ''
  });

  //----------sponsor info-------------
  // State to manage sponsor info
  const [sponsorInfo, setSponsorInfo] = useState<TSponsorHr>({
    sponsor_id: null as unknown as number,
    visa_type: '',
    visa_valid_from: null as unknown as Date,
    visa_valid_to: null as unknown as Date
  });

  //----------insurance info--------
  // State to manage insurance info
  const [insuranceInfo, setInsuranceInfo] = useState<TIsuranceHr>({
    ins_card_no: '',
    ins_card_issue_dt: null as unknown as Date,
    ins_card_exp_dt: null as unknown as Date,
    ins_card_type: ''
  });

  //----------Id Card Info---------
  // State to manage ID card info
  const [idCardInfo, setIdCardInfo] = useState<TILPHr>({
    labourcard_no: null as unknown as number,
    pasi_no: '',
    labourcard_valid_from: null as unknown as Date,
    labourcard_valid_to: null as unknown as Date,
    labourcard_status: ''
  });

  //---------Airfare Info-----------
  // State to manage airfare info
  const [airfareInfo, setAirfareInfo] = useState<TAirfareHr>({
    airport_code: '',
    ticket_eligibility: '',
    ticket_dpend_adult: null as unknown as number,
    ta_no: null as unknown as number,
    tc_no: null as unknown as number,
    ti_no: null as unknown as number,
    ticket_eligible_period: null as unknown as number
  });

  //-----------handlers----------
  // State to manage form submission status
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission
  const handleEmployeeFromSubmit = async () => {
    setSubmitting(true);
    const finalPayload = {
      ...persnolInfo,
      ...payRollInfo,
      ...passportInfo,
      ...contractInfo,
      ...sponsorInfo,
      ...insuranceInfo,
      ...idCardInfo,
      ...airfareInfo
    };
    let response;
    if (isEditMode) {
      response = await employeeServiceInstance.editEmployee(finalPayload, employee_code ?? '');
    } else {
      response = await employeeServiceInstance.addEmployee(finalPayload);
    }
    setSubmitting(false);
    if (response) {
      onClose(undefined, true);
    }
  };

  // Handle next step in the stepper
  const handleNext = async () => {
    if (activeStep !== steps.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      return;
    }
    handleEmployeeFromSubmit();
  };

  // Handle previous step in the stepper
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  //-----------------------------useEffect----------------------
  // Effect to populate form data if in edit mode
  useEffect(() => {
    if (isEditMode && isEmployeeDataFetched && !!employeeData && Object.keys(employeeData).length > 0) {
      const {
        emp_photo,
        employee_code,
        alternate_id,
        rpt_name,
        grade_code,
        desg_code,
        labour_desg_code,
        category_code,
        birth_date,
        join_date,
        probation_end_date,
        probation_confirm_date,
        emp_status,
        country_code,
        include_in_payroll,
        payroll_start_date,
        payment_mode,
        company_bank_code,
        salary_acct_no,
        salary_bank_code,
        currency_id,
        exch_rate,
        emp_iban_no,
        ppt_no,
        ppt_name,
        ppt_country,
        ppt_status,
        ppt_valid_from,
        ppt_valid_to,
        passport_with,
        contract_type,
        contract_start_date,
        contract_end_date,
        contract_renewable,
        sponsor_id,
        visa_type,
        visa_valid_from,
        visa_valid_to,
        ins_card_no,
        ins_card_issue_dt,
        ins_card_exp_dt,
        ins_card_type,
        labourcard_no,
        pasi_no,
        labourcard_valid_from,
        labourcard_valid_to,
        labourcard_status,
        airport_code,
        ticket_eligibility,
        ticket_dpend_adult,
        ta_no,
        tc_no,
        ti_no,
        ticket_eligible_period,
        div_code,
        dept_code,
        section_code
      } = employeeData;
      setPersnolInfo({
        emp_photo,
        employee_code,
        alternate_id,
        rpt_name,
        grade_code,
        desg_code,
        labour_desg_code,
        category_code,
        birth_date,
        join_date,
        probation_end_date,
        probation_confirm_date,
        emp_status,
        country_code,
        div_code,
        dept_code,
        section_code
      });
      setPayRolllInfo({
        include_in_payroll,
        payroll_start_date,
        payment_mode,
        company_bank_code,
        salary_acct_no,
        salary_bank_code,
        currency_id,
        exch_rate,
        emp_iban_no
      });
      setPassportInfo({
        ppt_no,
        ppt_name,
        ppt_country,
        ppt_status,
        ppt_valid_from,
        ppt_valid_to,
        passport_with
      });
      setContractInfo({
        contract_type,
        contract_start_date,
        contract_end_date,
        contract_renewable
      });
      setSponsorInfo({
        sponsor_id,
        visa_type,
        visa_valid_from,
        visa_valid_to
      });
      setInsuranceInfo({
        ins_card_no,
        ins_card_issue_dt,
        ins_card_exp_dt,
        ins_card_type
      });
      setIdCardInfo({
        labourcard_no,
        pasi_no,
        labourcard_valid_from,
        labourcard_valid_to,
        labourcard_status
      });
      setAirfareInfo({
        airport_code,
        ticket_eligibility,
        ticket_dpend_adult,
        ta_no,
        tc_no,
        ti_no,
        ticket_eligible_period
      });
    }
  }, [employeeData, employee_code, isEditMode, isEmployeeDataFetched]);

  // Function to render the content of each step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Render personal info form
        return (
          <PersnolInfoForm isEditMode={isEditMode} persnolInfo={persnolInfo} setPersnolInfo={setPersnolInfo} handleNext={handleNext} />
        );
      case 1:
        // Render payroll form
        return <PayrollForm payRollInfo={payRollInfo} setPayRollInfo={setPayRolllInfo} handleNext={handleNext} handleBack={handleBack} />;
      case 2:
        // Render passport info form
        return (
          <PassportInfo passportInfo={passportInfo} setPassportInfo={setPassportInfo} handleNext={handleNext} handleBack={handleBack} />
        );
      case 3:
        // Render contract info form
        return (
          <ContractInfo contractInfo={contractInfo} setContractInfo={setContractInfo} handleNext={handleNext} handleBack={handleBack} />
        );
      case 4:
        // Render sponsor info form
        return <SponsorInfo sponsorInfo={sponsorInfo} setSponsorInfo={setSponsorInfo} handleNext={handleNext} handleBack={handleBack} />;
      case 5:
        // Render insurance info form
        return (
          <InsuranceInfo
            insuranceInfo={insuranceInfo}
            setInsuranceInfo={setInsuranceInfo}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        );
      case 6:
        // Render ID card info form
        return <IdCardInfo idCardInfo={idCardInfo} setIdCardInfo={setIdCardInfo} handleNext={handleNext} handleBack={handleBack} />;
      case 7:
        // Render airfare info form
        return (
          <AirfareInfo
            submitting={submitting}
            airfareInfo={airfareInfo}
            setAirfareInfo={setAirfareInfo}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        );
    }
  };
  console.log('');
  return (
    <CardContent>
      {/* ---------Use Stepper-------- */}
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep > index}>
            <StepButton color="inherit" onClick={() => index < activeStep && setActiveStep(index)}>
              <FormattedMessage id={label} />
            </StepButton>
          </Step>
        ))}
      </Stepper>
      {/* --------Render Stepper Content------- */}
      <div className="pt-10">{renderStepContent()}</div>
    </CardContent>
  );
};

export default AddEmployeeHrForm;
