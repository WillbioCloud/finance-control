import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';

interface ChartSegment {
  percentage: number;
  color: string;
}

interface DonutChartProps {
  radius: number;
  strokeWidth: number;
  data: ChartSegment[];
  totalValue: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ radius, strokeWidth, data, totalValue }) => {
  const halfCircle = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = 0;

  return (
    <View style={styles.container}>
      <Svg 
        width={halfCircle * 2} 
        height={halfCircle * 2} 
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          {/* Fundo */}
          <Circle
            cx={halfCircle}
            cy={halfCircle}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Segmentos */}
          {data.map((item, index) => {
            const strokeDashoffset = circumference - (circumference * item.percentage) / 100;
            const angle = (currentAngle * 360) / 100;
            currentAngle += item.percentage;

            return (
              <Circle
                key={index}
                cx={halfCircle}
                cy={halfCircle}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation={angle}
                origin={`${halfCircle}, ${halfCircle}`}
              />
            );
          })}
        </G>
      </Svg>
      
      <View style={styles.textContainer}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.value}>{totalValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  }
});

export default DonutChart;