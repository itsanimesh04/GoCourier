import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";

const Calendar = () => {
    const [currentMonth] = useState("Juni 2025");

    const daysOfWeek = ["S", "S", "R", "K", "J", "S", "M"];
    
    const calendarDays = [
        { date: 30, isCurrentMonth: false },
        { date: 1, isCurrentMonth: true },
        { date: 2, isCurrentMonth: true },
        { date: 3, isCurrentMonth: true },
        { date: 4, isCurrentMonth: true },
        { date: 5, isCurrentMonth: true },
        { date: 6, isCurrentMonth: true },
        { date: 7, isCurrentMonth: true },
        { date: 8, isCurrentMonth: true },
        { date: 9, isCurrentMonth: true },
        { date: 10, isCurrentMonth: true, isActive: true },
        { date: 11, isCurrentMonth: true },
        { date: 12, isCurrentMonth: true, hasEvent: true },
        { date: 13, isCurrentMonth: true, hasEvent: true },
        { date: 14, isCurrentMonth: true },
        { date: 15, isCurrentMonth: true },
        { date: 16, isCurrentMonth: true },
        { date: 17, isCurrentMonth: true },
        { date: 18, isCurrentMonth: true },
        { date: 19, isCurrentMonth: true, hasEvent: true },
        { date: 20, isCurrentMonth: true, hasEvent: true },
        { date: 21, isCurrentMonth: true },
        { date: 22, isCurrentMonth: true },
        { date: 23, isCurrentMonth: true },
        { date: 24, isCurrentMonth: true, hasEvent: true },
        { date: 25, isCurrentMonth: true, hasEvent: true },
        { date: 26, isCurrentMonth: true, hasEvent: true },
        { date: 27, isCurrentMonth: true, hasEvent: true },
        { date: 28, isCurrentMonth: true },
        { date: 29, isCurrentMonth: true },
        { date: 30, isCurrentMonth: true },
        { date: 1, isCurrentMonth: false },
        { date: 2, isCurrentMonth: false },
        { date: 3, isCurrentMonth: false },
        { date: 4, isCurrentMonth: false },
    ];

    const activityData = [
        { color: "bg-green-500", label: "DR. Rick Appointment" },
        { color: "bg-blue-500", label: "Dentist Meetup" },
        { color: "bg-yellow-500", label: "Jhon Surgery" },
    ];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Header with Legend */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6.66667 1.66669V4.16669M13.3333 1.66669V4.16669M2.5 7.50002H17.5M4.16667 3.33335H15.8333C16.7538 3.33335 17.5 4.07955 17.5 5.00002V16.6667C17.5 17.5872 16.7538 18.3334 15.8333 18.3334H4.16667C3.24619 18.3334 2.5 17.5872 2.5 16.6667V5.00002C2.5 4.07955 3.24619 3.33335 4.16667 3.33335Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Calendar</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-600">Appointment</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-600">Meeting</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-gray-600">Surgery</span>
                    </div>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-gray-900">{currentMonth}</h4>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiChevronLeft className="text-gray-600" size={18} />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiChevronRight className="text-gray-600" size={18} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {daysOfWeek.map((day, index) => (
                        <div
                            key={index}
                            className="text-center text-xs font-medium text-gray-500 py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar dates */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => (
                        <button
                            key={index}
                            className={`
                                aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative
                                ${!day.isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                                ${day.isActive ? "bg-blue-600 text-white" : "hover:bg-gray-50"}
                                ${day.hasEvent && !day.isActive ? "font-semibold" : ""}
                            `}
                        >
                            {day.date}
                            {day.hasEvent && !day.isActive && (
                                <div className="absolute bottom-1 flex gap-0.5">
                                    <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity Details */}
            <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Activity Details</h5>
                <div className="space-y-2">
                    {activityData.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className={`w-1 h-8 rounded-full ${activity.color}`}></div>
                            <span className="text-sm text-gray-700">{activity.label}</span>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-blue-600 font-medium text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <FiPlus size={18} />
                    Add new
                </button>
            </div>
        </div>
    );
};

export default Calendar;
