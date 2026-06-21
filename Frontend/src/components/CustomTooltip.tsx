import ClickAwayListener from '@mui/material/ClickAwayListener';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import { useState } from 'react';

function CustomTooltip({
  message,
  children,
  className,
  props
}: {
  message: React.ReactNode;
  children: React.ReactElement<any, any>;
  className?: string;
  props?: Partial<TooltipProps>;
}) {
  const [open, setOpen] = useState(false); // State to manage the tooltip open/close status

  // Handler to open the tooltip
  const handleTooltipOpen = () => {
    setOpen(true);
  };

  // Handler to close the tooltip
  const handleTooltipClose = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <div>
        <Tooltip
          className={className}
          {...props}
          open={open}
          title={message} // Tooltip message
          arrow
          onClick={handleTooltipOpen} // Open tooltip on click
          onMouseEnter={handleTooltipOpen} // Open tooltip on mouse enter
          onMouseLeave={handleTooltipClose} // Close tooltip on mouse leave
        >
          {children}
        </Tooltip>
      </div>
    </ClickAwayListener>
  );
}

export default CustomTooltip;
