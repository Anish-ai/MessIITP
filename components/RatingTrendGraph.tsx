import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Slider from '@react-native-community/slider';
import { useThemeColor } from '@/hooks/useThemeColor';
import api from '../api';

interface RatingTrendGraphProps {
  mealType: string;
  messIds: number[];
  messNames: { [key: number]: string };
  key?: string;
}

const RatingTrendGraph: React.FC<RatingTrendGraphProps> = ({ mealType, messIds, messNames }) => {
  const [ratingsData, setRatingsData] = useState<{ [key: string]: { date: string; averageRating: number }[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysCnt, setDaysCnt] = useState(10);
  const [sliderValue, setSliderValue] = useState(10);

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

  const fetchRatings = async (days: number) => {
    try {
      setLoading(true);
      const data: { [key: string]: { date: string; averageRating: number }[] } = {};

      await Promise.allSettled(
        messIds.map(async (messId) => {
          try {
            const response = await api.get('/ratings/getRatingsByMealAndMess', {
              params: {
                mess_id: messId,
                meal_type: mealType,
                days: days,
              },
            });

            if (response.data.averageRatings.length > 0) {
              data[messId.toString()] = response.data.averageRatings;
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

  useEffect(() => {
    fetchRatings(daysCnt);
  }, [mealType, messIds, daysCnt]);

  // Auto-reload every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRatings(daysCnt);
    }, 60000); // 1 minute in milliseconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [mealType, messIds, daysCnt]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>
      </View>
    );
  }

  // Prepare dates for the chart (last X days)
  const generateDateRange = (days: number) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-CA'));
    }
    return dates;
  };

  const chartDates = generateDateRange(daysCnt);

  // Prepare datasets with precise date matching
  const datasets = messIds
    .filter((messId) => ratingsData[messId.toString()] && ratingsData[messId.toString()].length > 0)
    .map((messId, index) => {
      const ratings = ratingsData[messId.toString()];
      
      const dataForChart = chartDates.map((date) => {
        const ratingForDate = ratings.find((r) => r.date === date);
        return ratingForDate ? ratingForDate.averageRating : 0;
      });

      return {
        data: dataForChart,
        color: (opacity = 1) => colors[index % colors.length],
        strokeWidth: 2,
      };
    });

  // Generate labels for the chart (just days)
  const labels = chartDates.map(date => new Date(date).getDate().toString());

  if (datasets.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.noDataText, { color: textColor }]}>No data available for {mealType}.</Text>
      </View>
    );
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
          propsForBackgroundLines: { stroke: 'rgba(112, 112, 112, 0.34)' },
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
      />
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: textColor }]}>Days: {sliderValue}</Text>
        <Slider
          style={styles.slider}
          minimumValue={3}
          maximumValue={12}
          step={1}
          value={sliderValue}
          onValueChange={(value) => setSliderValue(value)}
          onSlidingComplete={(value) => setDaysCnt(Math.round(value))}
          minimumTrackTintColor={tintColor}
          maximumTrackTintColor={textColor}
          thumbTintColor={tintColor}
        />
      </View>
      <View style={styles.legendContainer}>
        {messIds
          .filter((messId) => ratingsData[messId.toString()] && ratingsData[messId.toString()].length > 0)
          .map((messId, index) => (
            <View key={messId} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors[index % colors.length] }]} />
              <Text style={[styles.legendText, { color: textColor }]}>
                {messNames[messId - 2] || `Mess ${messId}`}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
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
  sliderContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: 16,
  },
  sliderLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
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