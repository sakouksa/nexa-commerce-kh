import React from 'react';
import { LoadingSpinner, LoadingSpinnerProps } from './LoadingSpinner';

export interface LoadingProps extends LoadingSpinnerProps {}

export const Loading: React.FC<LoadingProps> = (props) => {
  return <LoadingSpinner {...props} />;
};

export default Loading;
