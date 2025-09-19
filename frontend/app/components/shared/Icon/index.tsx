import React from 'react';

import { iconMap, iconSizes } from './consts';

export type IconNames = keyof typeof iconMap;
export type IconSizes = keyof typeof iconSizes;

export type IconProps = React.HTMLAttributes<HTMLSpanElement> & {
  icon: IconNames;
  size?: IconSizes;
  className?: string;
};


export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  size?: string | number;
  color?: string;
  title?: string;
}

const Icon:React.FC<IconProps & IconBaseProps> = ({
  icon, className, size = 'md', ...props
}) => {
  console.log("HEYEHYE", icon);
  const IconComponent = iconMap[icon];
  return (
    <IconComponent
      size={iconSizes[size]}
      aria-hidden="true"
      className={className ? ("icon" + className) : "icon"}
      {...props}
    />
  );
};

export default React.memo(Icon);
