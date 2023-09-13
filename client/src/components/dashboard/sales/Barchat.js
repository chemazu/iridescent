import React, { useState } from 'react'
import { Line } from 'react-chartjs-2'

export const Barchat = ({
    labels,
    datas
}) => {

    const [chartData] = useState({
        labels: labels,
        datasets: [
            {
                label: 'Sales Report for the past 6 months',
                data: datas,
                cubicInterpolationMode: 'monotone',
                borderColor: '#476EFA',
                backgroundColor: '#476EFA'
            }
        ]
    })
    const options = {
                title: {
                    display: true,
                    text:'Past Six Months'
                },
                legend: {
                    display: true,
                    position: 'right'
             }
        }

    return <>
       <div className="chart">
        <Line
            data={chartData}
            options={options}
        />
       </div>
    </>
}
export default Barchat