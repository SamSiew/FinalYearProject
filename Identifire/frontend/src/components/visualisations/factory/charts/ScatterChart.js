import React from 'react'
import { ScatterChart as SC, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Scatter, ResponsiveContainer } from 'recharts'

export default function BarChart({ records, scatters, xAxisKey, units}) {
    return (
        <ResponsiveContainer height="100%" width={records.length * 75}>
            <SC data={records}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} interval={1}/>
                <YAxis unit={units} domain={['dataMin', 'dataMax']}/>
                <Tooltip />
                <Legend verticalAlign="top" align="left" height={32}/>
                {
                    scatters && scatters.map((scatter, index) => (
                        <Scatter key={index} dataKey={scatter.key} fill={scatter.fillColour} />
                    ))
                }
            </SC>
        </ResponsiveContainer>
    )
}