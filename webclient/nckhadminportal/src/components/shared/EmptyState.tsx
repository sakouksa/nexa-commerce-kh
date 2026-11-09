import React from 'react';
import {
  Empty,
  EmptyProps,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyAction,
} from '../ui/empty';

export interface EmptyStateProps extends EmptyProps {}

export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyAction,
};
export const EmptyState = Empty;
export default Empty;
