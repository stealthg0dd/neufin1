import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", overallSentiment: 65, techSector: 55, financeSector: 40 },
  { name: "Tue", overallSentiment: 68, techSector: 53, financeSector: 42 },
  { name: "Wed", overallSentiment: 72, techSector: 57, financeSector: 38 },
  { name: "Thu", overallSentiment: 70, techSector: 58, financeSector: 36 },
  { name: "Fri", overallSentiment: 73, techSector: 55, financeSector: 35 },
  { name: "Sat", overallSentiment: 78, techSector: 52, financeSector: 38 },
  { name: "Sun", overallSentiment: 76, techSector: 50, financeSector: 36 },
];

export default function SentimentChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
        <XAxis dataKey="name" stroke="#6C757D" />
        <YAxis domain={[30, 80]} stroke="#6C757D" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="overallSentiment"
          name="Overall Sentiment"
          stroke="#0066FF"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          fillOpacity={0.1}
          fill="rgba(0, 102, 255, 0.1)"
        />
        <Line
          type="monotone"
          dataKey="techSector"
          name="Tech Sector"
          stroke="#FF9F0A"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          fillOpacity={0.1}
          fill="rgba(255, 159, 10, 0.1)"
        />
        <Line
          type="monotone"
          dataKey="financeSector"
          name="Finance Sector"
          stroke="#FF5656"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          fillOpacity={0.1}
          fill="rgba(255, 86, 86, 0.1)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
