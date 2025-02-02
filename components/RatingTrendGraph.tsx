import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useThemeColor } from '@/hooks/useThemeColor';
import api from '../api';

interface RatingTrendGraphProps {
  mealType: string;
  messIds: number[];
  messNames: { [key: number]: string };
}

const RatingTrendGraph: React.FC<RatingTrendGraphProps> = ({ mealType, messIds, messNames }) => {
  const [ratingsData, setRatingsData] = useState<{ [key: string]: number[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { color: textColor } = useThemeColor({}, 'text');
  const { color: backgroundColor } = useThemeColor({}, 'background');
  const { color: tintColor } = useThemeColor({}, 'tint');
  const { color: icon } = useThemeColor({}, 'icon');

  const colors = [
    tintColor,
    '#FF6347', // Tomato
    '#4682B4', // Steel Blue
    '#32CD32', // Lime Green
    '#FFD700', // Gold
    '#8A2BE2', // Blue Violet
  ];

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const data: { [key: string]: number[] } = {};

        for (const messId of messIds) {
          const response = await api.get('/ratings/getRatingsByMealAndMess', {
            params: {
              mess_id: messId,
              meal_type: mealType,
              days: 10,
            },
          });

          console.log('Ratings Response:', response.data); // Log ratings response

          // Map the average ratings to an array of numbers
          data[messId] = response.data.averageRatings.map((item: { date: string; averageRating: number }) => item.averageRating);
        }

        setRatingsData(data);
      } catch (error) {
        console.error('Failed to fetch ratings:', error);
        setError('Failed to fetch ratings. Please try again.');
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

  // Generate labels for the past 10 days in the format 'DD\nMMM'
  const labels = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (9 - i));

    // Extract day and month
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }); // 'Feb', 'Mar', etc.

    // Format as 'DD\nMMM' (date and month on separate lines)
    return `${day}`;
  });

  const datasets = messIds.map((messId, index) => ({
    data: ratingsData[messId] || Array(10).fill(0), // Fill with 0 if no data
    color: (opacity = 1) => colors[index % colors.length],
    strokeWidth: 2,
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Rating Trend for {mealType}</Text>
      <LineChart
        data={{
          labels,
          datasets,
        }}
        // width should be the same as the parent container
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
          color: () => icon, // White text for labels
          labelColor: () => textColor, // White text for labels
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '1',
            stroke: '#fff',
          },
          propsForBackgroundLines: {
            stroke: 'rgba(255, 255, 255, 0.2)', // Light grid lines for dark background
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
          alignSelf: 'center',
        }}
      />

      {/* Legend */}
      <View style={styles.legendContainer}>
        {messIds.map((messId, index) => (
          <View key={messId} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: colors[index % colors.length] },
              ]}
            />
            <Text style={[styles.legendText, { color: textColor }]}>
              {messNames[messId] || `Mess ${messId}`}
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