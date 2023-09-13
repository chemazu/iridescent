import React, { useState } from "react";
import { Line } from "react-chartjs-2";

const PageVisitChart = ({ labels, datas }) => {
  const [chartData] = useState({
    labels: labels,
    datasets: [
      {
        label: "School Landing Page Visit",
        data: datas,
        cubicInterpolationMode: "monotone",
        borderColor: "#476EFA",
        backgroundColor: "#476EFA",
      },
    ],
  });

  const options = {
    title: {
      display: true,
      text: "Past Six Months",
    },
    legend: {
      display: true,
      position: "right",
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  return (
    <div className="dashbord-chart">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PageVisitChart;
