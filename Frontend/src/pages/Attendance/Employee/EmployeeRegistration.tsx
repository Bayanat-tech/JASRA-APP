import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Card, Form, Input, DatePicker, Row, Col, Modal, Typography, Steps, Progress, message, Tag } from 'antd';
import { CameraOutlined, DeleteOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, SoundOutlined, AudioMutedOutlined } from '@ant-design/icons';
import Webcam from 'react-webcam';
import dayjs from 'dayjs';
import attendanceServiceInstance from 'service/Attendance/Service.attendance';


const { Title, Text } = Typography;
const { Step } = Steps;

const EmployeeRegistration = ({
  onClose,
  onRegisterSuccess,
  existingData
}: {
  onClose: () => void;
  onRegisterSuccess: () => void;
  existingData?: any;
}) => {
  const [form] = Form.useForm();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [captureInstruction, setCaptureInstruction] = useState('center');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true); // Voice feature
  const webcamRef = useRef<Webcam>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const [autoCaptureInterval, setAutoCaptureInterval] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Employee profile returned from API
  const [employeeProfile, setEmployeeProfile] = useState<any | null>(null);
  const [validateLoading, setValidateLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');

  // Initialize speech synthesis
  useEffect(() => {
    speechSynthRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  // Voice feedback function
  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled || !speechSynthRef.current) return;

    speechSynthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    const voices = speechSynthRef.current.getVoices();
    const femaleVoice = voices.find(voice =>
      voice.name.includes('Female') ||
      voice.name.includes('Karen') ||
      voice.name.includes('Samantha')
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    speechSynthRef.current.speak(utterance);
  }, [isVoiceEnabled]);

  // Toggle voice feature
  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled(prev => !prev);
    if (!isVoiceEnabled) {
      speak('Voice guidance enabled');
    }
  }, [isVoiceEnabled, speak]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize form with existing data
  useEffect(() => {
    if (existingData) {
      const formattedData = {
        employee_code: existingData.employee_code || existingData.EMPLOYEE_CODE || '',
        employee_id: existingData.employee_id || existingData.EMPLOYEE_ID || '',
        full_name: existingData.full_name || existingData.RPT_NAME || '',
        email: existingData.email || existingData.EMAIL_PERSONAL || '',
        phone_number: existingData.phone_number || existingData.MOBILE_NO || '',
        department: existingData.department || existingData.DEPT_NAME || '',
        position: existingData.position || existingData.DESG_NAME || existingData.DESG_CODE || '',
        hire_date: existingData.hire_date ? dayjs(existingData.hire_date) : existingData.JOIN_DATE ? dayjs(existingData.JOIN_DATE) : null,
      };
      form.setFieldsValue(formattedData);
      if (existingData.EMPLOYEE_CODE || existingData.RPT_NAME) {
        setEmployeeProfile(existingData);
        setValidationStatus('success');
      }
    }
  }, [existingData, form]);

  // Auto capture photos with countdown and voice
  const startAutoCapture = () => {
    setPhotos([]);
    setCaptureInstruction('center');
    setIsCameraOpen(true);
    setCountdown(3);

    // Voice instruction
    speak('Starting automatic face capture. Please position your face in the frame.');

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startCaptureSequence();
          return 0;
        }
        // Voice countdown for last 3 seconds
        if (prev <= 3) {
          speak(prev.toString());
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startCaptureSequence = () => {
    let captureCount = 0;

    const captureNext = () => {
      if (captureCount < 3) {
        setCountdown(5);

        // Voice instructions for each capture
        if (captureCount === 0) {
          speak('Look straight at the camera. Capturing in 5 seconds');
        } else if (captureCount === 1) {
          speak('Now turn your head to the right. Capturing in 5 seconds');
        } else if (captureCount === 2) {
          speak('Now turn your head to the left. Capturing in 5 seconds');
        }

        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              capturePhoto();
              captureCount++;

              if (captureCount < 3) {
                setTimeout(captureNext, 500);
              } else {
                setAutoCaptureInterval(null);
                setCaptureInstruction('done');
                speak('All face images captured successfully! You can now complete the registration.');
                setTimeout(() => setIsCameraOpen(false), 1000);
              }
              return 0;
            }
            // Voice countdown for last 3 seconds of each capture
            if (prev <= 3) {
              speak(prev.toString());
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    captureNext();
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      message.error('Failed to capture image, please try again.');
      speak('Failed to capture image. Please try again.');
      return;
    }
    setPhotos((prev) => [...prev, imageSrc]);

    // Voice feedback for each capture
    if (photos.length === 0) {
      setCaptureInstruction('right');
      speak('Straight face captured successfully!');
      message.success('Straight face captured!');
    } else if (photos.length === 1) {
      setCaptureInstruction('left');
      speak('Right face captured successfully!');
      message.success('Right face captured!');
    } else if (photos.length >= 2) {
      setCaptureInstruction('done');
      speak('Left face captured successfully! All images captured.');
      message.success('Left face captured! All images captured successfully');
    }
  }, [webcamRef, photos.length, speak]);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));

    if (index === 0) setCaptureInstruction('center');
    else if (index === 1) setCaptureInstruction('right');
    else setCaptureInstruction('left');

    speak('Photo removed. Please recapture the image.');
  };

  const openCamera = () => {
    setPhotos([]);
    setCaptureInstruction('center');
    setCountdown(0);
    setIsCameraOpen(true);
    speak('Manual camera mode opened. Position your face and click capture when ready.');
  };

  // Stop auto capture when modal closes
  const handleCameraClose = () => {
    if (autoCaptureInterval) {
      clearInterval(autoCaptureInterval);
      setAutoCaptureInterval(null);
    }
    setCountdown(0);
    setIsCameraOpen(false);
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
  };

  // Validate employee code and populate form fields immediately
  const validateEmployeeCode = async () => {
    const code = form.getFieldValue('employee_code')?.trim();
    if (!code) {
      message.error('Please enter Employee Code to validate.');
      speak('Please enter employee code to validate.');
      return;
    }

    try {
      setValidateLoading(true);
      setValidationStatus('validating');
      speak('Validating employee code. Please wait.');

      let data = await attendanceServiceInstance.getEmployeeInfo(code);

      if (Array.isArray(data)) {
        if (data.length === 0) {
          setEmployeeProfile(null);
          setValidationStatus('error');
          speak('Employee code not found. Please check and try again.');
          message.error('Employee code not found');
          return;
        }
        data = data[0];
      }

      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        setEmployeeProfile(null);
        setValidationStatus('error');
        speak('Employee code not found. Please check and try again.');
        message.error('Employee code not found');
        return;
      }

      const formData = {
        employee_code: data.EMPLOYEE_CODE || code,
        employee_id: data.EMPLOYEE_ID || '',
        full_name: data.RPT_NAME || data.PASSPORT_NAME || '',
        email: data.EMAIL_PERSONAL || '',
        phone_number: data.MOBILE_NO || '',
        department: data.DEPT_NAME || data.SECTION_NAME || '',
        position: data.DESG_NAME || data.DESG_CODE || '',
        hire_date: data.JOIN_DATE ? dayjs(data.JOIN_DATE) : null,
      };

      form.setFieldsValue(formData);
      setEmployeeProfile(data);
      setValidationStatus('success');

      const employeeName = data.RPT_NAME || data.PASSPORT_NAME || 'Employee';
      speak(`Employee code validated successfully! Welcome ${employeeName}. Moving to next step.`);

      setTimeout(() => {
        if (currentStep === 0) {
          handleStepChange('next');
        }
      }, 500);

    } catch (error: any) {
      console.error('Validate error:', error);
      setEmployeeProfile(null);
      setValidationStatus('error');
      speak('Error validating employee code. Please try again.');
      message.error(error?.message || 'Failed to fetch employee information');
    } finally {
      setValidateLoading(false);
    }
  };

  const handleEmployeeCodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const code = e.target.value?.trim();
    if (code && code.length > 3 && !employeeProfile && validationStatus !== 'success') {
      setTimeout(() => {
        validateEmployeeCode();
      }, 500);
    }
  };

  const handleStepChange = async (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      setCurrentStep(currentStep - 1);
      speak('Moving to previous step.');
      return;
    }

    try {
      const stepFields =
        currentStep === 0 ? ['employee_code', 'full_name'] :
          currentStep === 1 ? [] :
            [];

      if (stepFields.length > 0) {
        await form.validateFields(stepFields);
      }

      setCurrentStep(currentStep + 1);

      // Voice guidance for next step
      if (currentStep === 0) {
        speak('Personal information completed. Now please fill in work details.');
      } else if (currentStep === 1) {
        speak('Work details completed. Now proceed to face capture.');
      }
    } catch (error) {
      speak('Please complete all required fields before proceeding.');
      message.error('Please complete all required fields before proceeding.');
    }
  };

  const onFinish = async (values: any) => {
    console.log('Final form values:', values);

    if (!existingData && photos.length < 3) {
      speak('Please capture all three required face photos before completing registration.');
      message.error('Please capture all required face photos.');
      return;
    }

    try {
      setLoading(true);
      speak('Processing registration. Please wait...');

      const formData = new FormData();

      let hireDateFormatted = '';
      if (values.hire_date) {
        if (dayjs.isDayjs(values.hire_date)) {
          hireDateFormatted = values.hire_date.format('YYYY-MM-DD');
        } else if (typeof values.hire_date === 'string') {
          hireDateFormatted = values.hire_date;
        } else {
          hireDateFormatted = dayjs(values.hire_date).format('YYYY-MM-DD');
        }
      }

      formData.append('employee_code', values.employee_code || '');
      if (existingData?.employee_id) {
        formData.append('employee_id', existingData.employee_id);
      } else if (values.employee_id) {
        formData.append('employee_id', values.employee_id);
      }

      formData.append('full_name', values.full_name);

      if (values.email) formData.append('email', values.email);
      if (values.department) formData.append('department', values.department);
      if (values.position) formData.append('position', values.position);
      if (hireDateFormatted) formData.append('hire_date', hireDateFormatted);
      if (values.phone_number) formData.append('phone_number', values.phone_number);

      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const blob = await fetch(photos[i]).then((r) => r.blob());
          formData.append('images', blob, `face_${i}.jpg`);
        }
      }

      if (existingData) {
        await attendanceServiceInstance.modifyEmployee(existingData.employee_id, formData);
        speak('Employee information updated successfully!');
        message.success('Employee updated successfully!');
      } else {
        await attendanceServiceInstance.registerEmployee(formData);
        speak('Employee registration completed successfully! Welcome to the team.');
      }

      onRegisterSuccess();
      onClose();
    } catch (error: any) {
      console.error('Registration error in onFinish:', error);
      speak('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: 'user'
  };

  // Face shape overlay component
  const FaceShapeOverlay = ({ instruction }: { instruction: string }) => {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: 200,
            height: 250,
            border: '3px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '45%',
            position: 'relative',
            background: 'transparent',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '30%',
              left: '25%',
              width: 20,
              height: 10,
              border: '2px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '50%'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '30%',
              right: '25%',
              width: 20,
              height: 10,
              border: '2px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '50%'
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '35%',
              width: 60,
              height: 20,
              borderBottom: '2px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '0 0 30px 30px'
            }}
          />

          {instruction === 'right' && (
            <div
              style={{
                position: 'absolute',
                top: '40%',
                right: '-40px',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              →
            </div>
          )}
          {instruction === 'left' && (
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '-40px',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              ←
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get instruction text with countdown
  const getInstructionText = () => {
    if (countdown > 0) {
      return `Next capture in ${countdown}s...`;
    }

    switch (captureInstruction) {
      case 'center': return '📸 Look straight at the camera';
      case 'right': return '👉 Turn your head to the right';
      case 'left': return '👈 Turn your head to the left';
      case 'done': return '✅ All images captured!';
      default: return 'Position your face in the frame';
    }
  };

  // Simple form layout with proper field mapping
  const renderStepContent = (step: number) => {
    const style = currentStep === step ? {} : { display: 'none' };

    switch (step) {
      case 0:
        return (
          <div style={style}>
            {/* Voice Control */}
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Button
                onClick={toggleVoice}
                icon={isVoiceEnabled ? <SoundOutlined /> : <AudioMutedOutlined />}
                type={isVoiceEnabled ? "primary" : "default"}
                size="small"
              >
                {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
              </Button>
            </div>

            {/* Employee Code Validation Section */}
            <Card
              style={{
                marginBottom: 16,
                background: validationStatus === 'success' ? '#f6ffed' :
                  validationStatus === 'error' ? '#fff2f0' : '#fafafa',
                border: validationStatus === 'success' ? '1px solid #b7eb8f' :
                  validationStatus === 'error' ? '1px solid #ffccc7' : '1px solid #d9d9d9'
              }}
            >
              <Row gutter={16} align="middle">
                <Col xs={24} md={16}>
                  <Form.Item
                    label={<Text strong>Employee Code *</Text>}
                    name="employee_code"
                    rules={[{ required: true, message: 'Please input Employee Code!' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      size="large"
                      placeholder="Enter employee code"
                      onBlur={handleEmployeeCodeBlur}
                      disabled={!!existingData}
                      addonAfter={
                        <Button
                          onClick={validateEmployeeCode}
                          loading={validateLoading}
                          type={validationStatus === 'success' ? 'default' : 'primary'}
                          icon={validationStatus === 'success' ? <CheckCircleOutlined /> : undefined}
                        >
                          {validationStatus === 'success' ? 'Validated' : 'Validate'}
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: windowWidth <= 768 ? 'left' : 'right', marginTop: windowWidth <= 768 ? 8 : 0 }}>
                  {validationStatus === 'success' && (
                    <Tag color="success" style={{ fontSize: '14px', padding: '6px 12px' }}>
                      <CheckCircleOutlined /> Validated
                    </Tag>
                  )}
                  {validationStatus === 'error' && (
                    <Tag color="error" style={{ fontSize: '14px', padding: '6px 12px' }}>
                      Invalid Code
                    </Tag>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Personal Information Fields */}
            <Row gutter={[16, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text strong>Full Name *</Text>}
                  name="full_name"
                  rules={[{ required: true, message: 'Please input Full Name!' }]}
                >
                  <Input size="large" placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text strong>Employee ID *</Text>}
                  name="employee_id"
                  rules={[{ required: true, message: 'Employee ID is required!' }]}
                >
                  <Input size="large" placeholder="Auto-filled from system" readOnly />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text strong>Email</Text>}
                  name="email"
                >
                  <Input size="large" placeholder="employee@company.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={<Text strong>Phone Number</Text>} name="phone_number">
                  <Input size="large" placeholder="Phone Number" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      case 1:
        return (
          <div style={style}>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text strong>Department</Text>}
                  name="department"
                >
                  <Input size="large" placeholder="Enter department" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text strong>Position</Text>}
                  name="position"
                >
                  <Input size="large" placeholder="Enter job position" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<Text strong>Hire Date</Text>}
                  name="hire_date"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    format="YYYY-MM-DD"
                    placeholder="Select Hire Date"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
      case 2:
        return (
          <div style={style}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <CameraOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 8 }} />
              <Title level={4} style={{ marginBottom: 8 }}>Face Capture</Title>
              <Text type="secondary">
                Capture 3 images automatically - straight, right, and left views
              </Text>
              {isVoiceEnabled && (
                <div style={{ marginTop: 8 }}>
                  <SoundOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                  <Text type="success" style={{ fontSize: '12px' }}>
                    Voice guidance active
                  </Text>
                </div>
              )}
            </div>

            {/* Face Capture Options */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CameraOutlined />}
                  onClick={startAutoCapture}
                  style={{ borderRadius: 8, height: 48, padding: '0 24px' }}
                >
                  Auto Capture (15s)
                </Button>
                <Button
                  size="large"
                  icon={<CameraOutlined />}
                  onClick={openCamera}
                  style={{ borderRadius: 8, height: 48, padding: '0 24px' }}
                >
                  Manual Capture
                </Button>
              </div>

              {photos.length > 0 && (
                <div>
                  <Progress
                    percent={Math.min(100, (photos.length / 3) * 100)}
                    status={photos.length >= 3 ? 'success' : 'active'}
                    style={{ maxWidth: 400, margin: '0 auto 8px' }}
                  />
                  <Text type={photos.length >= 3 ? 'success' : undefined} strong>
                    {photos.length} of 3 images captured
                    {photos.length >= 3 && ' - Ready to Register!'}
                  </Text>
                </div>
              )}
            </div>

            {/* Captured Images */}
            {photos.length > 0 && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>Captured Images:</Text>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: windowWidth <= 768 ? 'repeat(auto-fit, minmax(100px, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 12
                }}>
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        border: '2px solid #e8e8e8',
                        borderRadius: 6,
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Face ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 100,
                          objectFit: 'cover'
                        }}
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2
                        }}
                        onClick={() => removePhoto(index)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          textAlign: 'center',
                          fontSize: 11,
                          padding: 2
                        }}
                      >
                        {index === 0 ? 'Straight' : index === 1 ? 'Right' : 'Left'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        maxWidth: windowWidth >= 768 ? 800 : '100%',
        margin: '0 auto',
        padding: windowWidth >= 768 ? '16px' : '12px',
        background: '#f0f2f5',
        position: 'relative',
        zIndex: 1
      }}
    >
      <Card
        style={{
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none'
        }}
        bodyStyle={{
          padding: windowWidth >= 768 ? '24px' : '16px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#1f1f1f', marginBottom: 4, fontSize: windowWidth <= 768 ? '20px' : '24px' }}>
            {existingData ? 'Edit Employee' : 'Register New Employee'}
          </Title>
          <Text type="secondary" style={{ fontSize: windowWidth <= 768 ? '14px' : '16px' }}>
            {existingData
              ? 'Update employee information'
              : 'Complete the form to register a new employee'}
          </Text>
        </div>

        <Steps
          current={currentStep}
          style={{
            marginBottom: 32
          }}
          size={windowWidth <= 768 ? 'small' : 'default'}
        >
          <Step title="Personal Info" />
          <Step title="Work Details" />
          <Step title="Face Capture" />
        </Steps>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {renderStepContent(0)}
          {renderStepContent(1)}
          {renderStepContent(2)}

          <div style={{
            marginTop: 32,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <Button
              size="large"
              disabled={currentStep === 0}
              onClick={() => handleStepChange('prev')}
              style={{ flex: 1, maxWidth: 120 }}
            >
              <ArrowLeftOutlined /> Previous
            </Button>

            {currentStep < 2 ? (
              <Button
                type="primary"
                size="large"
                onClick={() => handleStepChange('next')}
                style={{ flex: 1, maxWidth: 120 }}
              >
                Next <ArrowRightOutlined />
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={() => form.submit()}
                loading={loading}
                disabled={!existingData && photos.length < 3}
                style={{ flex: 1, maxWidth: 180 }}
              >
                {existingData ? 'Update Employee' : 'Complete Registration'}
              </Button>
            )}
          </div>
        </Form>
      </Card>

      {/* Camera Modal */}
      <Modal
        getContainer={() => document.body}
        zIndex={15000}
        open={isCameraOpen}
        onCancel={handleCameraClose}
        footer={null}
        width={Math.min(600, windowWidth - 40)}
        centered
        style={{ top: 20 }}
        bodyStyle={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 8
        }}
        maskStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
      >
        <div style={{ position: 'relative' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{ width: '100%', height: 400, display: 'block' }}
            mirrored
          />

          {/* Face Shape Overlay */}
          <FaceShapeOverlay instruction={captureInstruction} />

          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              right: 12,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: 10,
              borderRadius: 6,
              textAlign: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
              {getInstructionText()}
            </Text>
            {isVoiceEnabled && (
              <div style={{ marginTop: 4 }}>
                <SoundOutlined style={{ color: '#52c41a', fontSize: '12px', marginRight: 4 }} />
                <Text style={{ color: '#52c41a', fontSize: '12px' }}>Voice Active</Text>
              </div>
            )}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 12
            }}
          >
            <Button size="large" onClick={handleCameraClose}>
              Cancel
            </Button>
            {/* Show manual capture button ONLY when NOT in auto capture mode */}
            {!autoCaptureInterval && countdown === 0 && (
              <Button
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                onClick={capturePhoto}
                disabled={captureInstruction === 'done'}
              >
                Manual Capture
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeRegistration;