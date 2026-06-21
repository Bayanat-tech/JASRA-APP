import { CSSProperties } from 'react';
import { iconMapping } from 'utils/constants';

type IconComponentProps = {
  icon: keyof typeof iconMapping;

  style?: CSSProperties;
};

const IconComponent = ({ icon, style }: IconComponentProps) => {
  const SelectedIcon = iconMapping[icon];

  if (!SelectedIcon) return null;

  return <></>;
  // return <SelectedIcon style={style} strokeWidth={1.5} />;
};

export default IconComponent;
