const WeeklyBudgetChart = () => {
    const chartData = [
        { day: "Sat", completed: 150, progress: 50, pending: 30, conflicts: 20 },
        { day: "Sun", completed: 200, progress: 80, pending: 40, conflicts: 30 },
        { day: "Mon", completed: 250, progress: 120, pending: 60, conflicts: 20 },
        { day: "Tue", completed: 300, progress: 150, pending: 70, conflicts: 30 },
        { day: "Wed", completed: 280, progress: 130, pending: 50, conflicts: 25 },
        { day: "Thu", completed: 150, progress: 80, pending: 40, conflicts: 20 },
        { day: "Fri", completed: 180, progress: 90, pending: 50, conflicts: 30 },
    ];

    const maxValue = 500;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 opacity-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Budget</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-sm text-gray-600">In progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                        <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                        <span className="text-sm text-gray-600">Conflicts</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-64">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                    <span>500</span>
                    <span>400</span>
                    <span>300</span>
                    <span>200</span>
                    <span>100</span>
                    <span>0</span>
                </div>

                {/* Chart bars */}
                <div className="ml-10 h-full flex items-end justify-between gap-3 pb-8">
                    {chartData.map((data, index) => {
                        
                        const completedHeight = (data.completed / maxValue) * 100;
                        const progressHeight = (data.progress / maxValue) * 100;
                        const pendingHeight = (data.pending / maxValue) * 100;
                        const conflictsHeight = (data.conflicts / maxValue) * 100;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                {/* Stacked bars */}
                                <div className="w-full h-full flex flex-col justify-end">
                                    <div className="w-full relative flex flex-col justify-end" style={{ height: '100%' }}>
                                        {/* Conflicts */}
                                        <div
                                            className="w-full bg-gray-200 rounded-t transition-all hover:opacity-80 cursor-pointer"
                                            style={{ height: `${conflictsHeight}%` }}
                                        ></div>
                                        {/* Pending */}
                                        <div
                                            className="w-full bg-blue-200 transition-all hover:opacity-80 cursor-pointer"
                                            style={{ height: `${pendingHeight}%` }}
                                        ></div>
                                        {/* In Progress */}
                                        <div
                                            className="w-full bg-blue-400 transition-all hover:opacity-80 cursor-pointer"
                                            style={{ height: `${progressHeight}%` }}
                                        ></div>
                                        {/* Completed */}
                                        <div
                                            className="w-full bg-blue-600 transition-all hover:opacity-80 cursor-pointer"
                                            style={{ height: `${completedHeight}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {/* Day label */}
                                <span className="text-sm font-medium text-gray-600">{data.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeeklyBudgetChart;
