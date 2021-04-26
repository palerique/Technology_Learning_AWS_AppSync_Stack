"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
exports.default = {
    clearMocks: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
    // testRegex: './tests/.*\\.(test|spec)?\\.(ts|tsx|js)$',
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamVzdC5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJqZXN0LmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7R0FHRztBQUNILGtCQUFlO0lBQ2IsVUFBVSxFQUFFLElBQUk7SUFDaEIsaUJBQWlCLEVBQUUsVUFBVTtJQUM3QixnQkFBZ0IsRUFBRSxJQUFJO0lBQ3RCLG9CQUFvQixFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7SUFDaEUsZUFBZSxFQUFFLE1BQU07SUFDdkIseURBQXlEO0lBQ3pELFNBQVMsRUFBRTtRQUNULFlBQVksRUFBRSxTQUFTO0tBQ3hCO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBGb3IgYSBkZXRhaWxlZCBleHBsYW5hdGlvbiByZWdhcmRpbmcgZWFjaCBjb25maWd1cmF0aW9uIHByb3BlcnR5IGFuZCB0eXBlIGNoZWNrLCB2aXNpdDpcbiAqIGh0dHBzOi8vamVzdGpzLmlvL2RvY3MvZW4vY29uZmlndXJhdGlvbi5odG1sXG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY2xlYXJNb2NrczogdHJ1ZSxcbiAgY292ZXJhZ2VEaXJlY3Rvcnk6ICdjb3ZlcmFnZScsXG4gIGNvdmVyYWdlUHJvdmlkZXI6ICd2OCcsXG4gIG1vZHVsZUZpbGVFeHRlbnNpb25zOiBbJ3RzJywgJ3RzeCcsICdqcycsICdqc3gnLCAnanNvbicsICdub2RlJ10sXG4gIHRlc3RFbnZpcm9ubWVudDogJ25vZGUnLFxuICAvLyB0ZXN0UmVnZXg6ICcuL3Rlc3RzLy4qXFxcXC4odGVzdHxzcGVjKT9cXFxcLih0c3x0c3h8anMpJCcsXG4gIHRyYW5zZm9ybToge1xuICAgICdeLitcXFxcLnRzPyQnOiAndHMtamVzdCcsXG4gIH0sXG59O1xuIl19