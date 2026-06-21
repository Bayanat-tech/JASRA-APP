import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  PrinterOutlined,
  UserDeleteOutlined,
  CloseCircleOutlined, // Add this import
  RedoOutlined // Add this import
} from '@ant-design/icons';
import { ButtonGroup, Divider, IconButton } from '@mui/material';
import CustomTooltip from 'components/CustomTooltip';
import React from 'react';
import { TActionButtonGroupProps, TActionButtons } from 'types/types.actionButtonsGroups';

const ActionButtonsGroup = (props: TActionButtonGroupProps) => {
  const { handleActions, disabled } = props; // Destructure props

  // Define available action buttons with their properties
  const availableActionButtons: TActionButtons[] = [
    {
      action: 'add_action',
      icon: <PlusSquareOutlined />,
      tooltip: 'Confirm PO',
      disabled: disabled?.['add_action'] ?? false
    },
    { action: 'view', icon: <EyeOutlined />, tooltip: 'View', disabled: disabled?.['view'] ?? false },
    { action: 'edit', icon: <EditOutlined />, tooltip: 'Edit', disabled: disabled?.['edit'] ?? false },
    {
      action: 'delete',
      icon: <DeleteOutlined />,
      color: 'error',
      tooltip: 'Delete',
      disabled: disabled?.['delete'] ?? false
    },
    {
      action: 'suspend',
      icon: <UserDeleteOutlined />,
      color: 'error',
      tooltip: 'Suspend',
      disabled: disabled?.['suspend'] ?? false
    },
    {
      action: 'unsuspend',
      icon: <PlayCircleOutlined />,
      color: 'error',
      tooltip: 'Unsuspend',
      disabled: disabled?.['unsuspend'] ?? false
    },
    {
      action: 'print',
      icon: <PrinterOutlined />,
      tooltip: 'Print',
      color: 'warning',
      disabled: disabled?.['print'] ?? false
    },
    {
      action: 'cancel',
      icon: <PlusOutlined rotate={45} />,
      tooltip: 'Cancel',
      color: 'error',
      disabled: disabled?.['cancel'] ?? false
    },
    {
      action: 'reject', // Add reject button
      icon: <CloseCircleOutlined />,
      tooltip: 'Reject',
      color: 'error',
      disabled: disabled?.['reject'] ?? false
    },
    {
      action: 'sentback', // Add sentback button
      icon: <RedoOutlined />,
      tooltip: 'Sent Back',
      color: 'warning',
      disabled: disabled?.['sentback'] ?? false
    }
  ];

  // Filter required buttons based on props
  const requiredButtons: TActionButtons[] = !props?.buttons
    ? availableActionButtons
    : availableActionButtons.filter((eachActionButton) => props?.buttons?.includes(eachActionButton.action));

  return (
    <ButtonGroup variant="text" className="flex items-center">
      {requiredButtons.map((eachActionButton, index, requiredButtonsArr) => (
        <React.Fragment key={index}>
          <CustomTooltip message={eachActionButton.tooltip ?? ''}>
            <IconButton
              size="small"
              disabled={eachActionButton.disabled} // Disable button if specified
              color={!eachActionButton.color ? 'primary' : eachActionButton.color} // Set button color
              onClick={() => handleActions(eachActionButton.action)} // Handle button click
            >
              {eachActionButton.icon} {/* Render button icon */}
            </IconButton>
          </CustomTooltip>
          {index < requiredButtonsArr.length - 1 && <Divider orientation="vertical" flexItem />} {/* Add divider between buttons */}
        </React.Fragment>
      ))}
    </ButtonGroup>
  );
};

export default ActionButtonsGroup;
