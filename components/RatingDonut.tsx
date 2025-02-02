import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useThemeColor } from '../hooks/useThemeColor';

interface RatingDonutProps {
  rating: number | null;
  size?: number;
  strokeWidth?: number;
}

const RatingDonut: React.FC<RatingDonutProps> = ({
  rating,
  size = 40,
  strokeWidth = 4
}) => {
  const { color: textColor } = useThemeColor({}, 'text');
  const { color: borderColor } = useThemeColor({}, 'border');

  // Normalize rating to be between 0 and 1
  const normalizedRating = rating !== null ? (rating - 1) / 4 : 0;

  // Calculate dimensions
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = [circumference];
  const strokeDashoffset = circumference * (1 - normalizedRating);

  // Calculate color based on rating
  const getColor = () => {
    if (rating === null) return borderColor;

    const r = normalizedRating <= 0.5
      ? 255
      : Math.round(255 - (normalizedRating - 0.5) * 2 * 255);

    const g = normalizedRating <= 0.5
      ? Math.round(normalizedRating * 2 * 255)
      : 255;

    return `rgb(${r}, ${g}, 0)`;
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={borderColor}
          strokeWidth={strokeWidth}
          opacity={0.3}  // Make background stroke more subtle
        />
        {/* Foreground circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Rating text */}
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: textColor
        }}>
          {rating !== null ? rating.toFixed(1) : 'N/A'}
        </Text>
      </View>
    </View>
  );
};

export default RatingDonut;