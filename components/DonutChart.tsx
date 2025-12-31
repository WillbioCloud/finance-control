import React from 'react';
import { View, Text } from 'react-native';
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
    <View className="items-center justify-center relative">
      <Svg 
        width={halfCircle * 2} 
        height={halfCircle * 2} 
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          {/* Círculo de Fundo (Cinza Claro) */}
          <Circle
            cx={halfCircle}
            cy={halfCircle}
            r={radius}
            stroke="#f1f5f9" // slate-100
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Segmentos Coloridos */}
          {data.map((item, index) => {
            const strokeDashoffset = circumference - (circumference * item.percentage) / 100;
            const angle = (currentAngle * 360) / 100;
            
            // Atualiza o ângulo para o próximo item começar onde este terminou
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
      
      {/* Texto Central (Total) */}
      <View className="absolute items-center justify-center">
        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total</Text>
        <Text className="text-xl font-bold text-slate-800">{totalValue}</Text>
      </View>
    </View>
  );
};

export default DonutChart;