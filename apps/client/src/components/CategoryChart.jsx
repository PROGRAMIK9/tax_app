import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ docs }) => {
    // 1. Group Data by Category
    const categoryTotals = {};

    docs.forEach(doc => {
        const cat = doc.category || 'Uncategorized';
        const amount = parseFloat(doc.extracted_amount) || 0;
        if (categoryTotals[cat]) {
            categoryTotals[cat] += amount;
        } else {
            categoryTotals[cat] = amount;
        }
    });

    // 2. Prepare Data
    const data = {
        labels: Object.keys(categoryTotals),
        datasets: [
            {
                label: 'Spending (₹)',
                data: Object.values(categoryTotals),
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'
                ],
                borderWidth: 1,
            },
        ],
    };

    // 3. THE FIX: Options to control layout 🛠️
    const options = {
        responsive: true,
        maintainAspectRatio: false, // <--- This prevents the giant overflow!
        plugins: {
            legend: {
                position: 'right', // Moves legend to side (looks better on wide screens)
                labels: {
                    usePointStyle: true,
                    boxWidth: 10
                }
            }
        },
        layout: {
            padding: 10
        }
    };

    // Return ONLY the chart, wrapped in a 100% container
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Pie data={data} options={options} />
        </div>
    );
};

export default CategoryChart;