import React from 'react';
import { FlattenCard, FlattenCardProps } from './FlattenCard';
import { RibbonStatsCard, RibbonStatsCardProps } from './RibbonStatsCard';
import { StatsCard, StatsCardProps, MiniStatsCard, MiniStatsCardProps } from './StatsCard';
import { FlattenStatCard, FlattenStatCardProps } from './FlattenStatCard';

export type GlobalCardType =
  | 'container'
  | 'ribbon'
  | 'stats'
  | 'flatten'
  | 'mini';

export type GlobalCardProps = {
  cardType?: GlobalCardType;
} & (
  | ({ cardType?: 'container' } & FlattenCardProps)
  | ({ cardType: 'ribbon' } & Omit<RibbonStatsCardProps, 'cardType'>)
  | ({ cardType: 'stats' } & Omit<StatsCardProps, 'cardType'>)
  | ({ cardType: 'flatten' } & Omit<FlattenStatCardProps, 'cardType'>)
  | ({ cardType: 'mini' } & Omit<MiniStatsCardProps, 'cardType'>)
);

export const GlobalCard: React.FC<GlobalCardProps> = ({ cardType = 'container', ...props }) => {
  switch (cardType) {
    case 'ribbon':
      return <RibbonStatsCard {...(props as RibbonStatsCardProps)} />;
    case 'stats':
      return <StatsCard {...(props as StatsCardProps)} />;
    case 'flatten':
      return <FlattenStatCard {...(props as FlattenStatCardProps)} />;
    case 'mini':
      return <MiniStatsCard {...(props as MiniStatsCardProps)} />;
    case 'container':
    default:
      return <FlattenCard {...(props as FlattenCardProps)} />;
  }
};

export default GlobalCard;
