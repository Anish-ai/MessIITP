import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useThemeColor } from '@/hooks/useThemeColor';
import api from '../api';
import * as Notifications from 'expo-notifications';

interface RatingTrendGraphProps {
  mealType: string;
  messIds: number[];
  messNames: { [key: number]: string };
}

const RatingTrendGraph: React.FC<RatingTrendGraphProps> = ({ mealType, messIds, messNames }) => {
  const [ratingsData, setRatingsData] = useState<{ [key: string]: number[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousRatings, setPreviousRatings] = useState<{ [key: string]: number }>({});

  const { color: textColor } = useThemeColor({}, 'text');
  const { color: backgroundColor } = useThemeColor({}, 'background');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: icon } = useThemeColor({}, 'icon');

  const colors = [
    tintColor,
    '#8A2BE2', // Blue Violet
    '#4682B4', // Steel Blue
    '#32CD32', // Lime Green
    '#FFD700', // Gold
    '#FF6347', // Tomato
  ];

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const data: { [key: string]: number[] } = {};
  
        // Use Promise.allSettled to handle both successful and failed requests
        const results = await Promise.allSettled(
          messIds.map(async (messId) => {
            try {
              const response = await api.get('/ratings/getRatingsByMealAndMess', {
                params: {
                  mess_id: messId,
                  meal_type: mealType,
                  days: 10,
                },
              });
  
              if (response.data.averageRatings.length > 0) {
                data[messId.toString()] = response.data.averageRatings.map(
                  (item: { date: string; averageRating: number }) => item.averageRating
                );
              }
            } catch (error) {
              console.error(`Failed to fetch ratings for mess ${messId}:`, error);
            }
          })
        );
  
        setRatingsData(data);
      } catch (error) {
        console.error('Failed to fetch ratings:', error);
        setError('Failed to fetch ratings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchRatings();
  }, [mealType, messIds]);

  if (loading) {
    return <Text style={[styles.loadingText, { color: textColor }]}>Loading...</Text>;
  }

  if (error) {
    return <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>;
  }

  const labels = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (9 - i));
    return `${date.getDate()}`;
  });

  const datasets = messIds
    .filter((messId) => ratingsData[messId.toString()] && ratingsData[messId.toString()].length > 0)
    .map((messId, index) => ({
      data: ratingsData[messId.toString()],
      color: (opacity = 1) => colors[index % colors.length],
      strokeWidth: 2,
    }));

  if (datasets.length === 0) {
    return <Text style={[styles.noDataText, { color: textColor }]}>No data available for {mealType}.</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Rating Trend for {mealType}</Text>
      <LineChart
        data={{ labels, datasets }}
        width={350}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor,
          backgroundGradientFrom: backgroundColor,
          backgroundGradientTo: backgroundColor,
          decimalPlaces: 1,
          color: () => icon,
          labelColor: () => textColor,
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '1', stroke: '#fff' },
          propsForBackgroundLines: { stroke: 'rgba(255, 255, 255, 0.2)' },
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
      />
      <View style={styles.legendContainer}>
        {messIds
          .filter((messId) => ratingsData[messId.toString()] && ratingsData[messId.toString()].length > 0)
          .map((messId, index) => (
            <View key={messId} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors[index % colors.length] }]} />
              <Text style={[styles.legendText, { color: textColor }]}>
                {messNames[messId-2] || `Mess ${messId}`}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
});

export default RatingTrendGraph;