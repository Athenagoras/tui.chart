/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');
var barTypeMixer = require('./barTypeMixer');
var predicate = require('../helpers/predicate');
var Series = require('../series/columnChartSeries');

var ColumnChart = tui.util.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(rawData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-column-chart';

        options.series = options.series || {};
        options.yAxis = options.yAxis || {};

        if (predicate.isValidStackedOption(options.series.stacked)) {
            rawData.series = this._sortRawSeriesData(rawData.series);
        }

        if (options.series.diverging) {
            rawData.series = this._makeRawSeriesDataForDiverging(rawData.series, options.series.stacked);
            options.series.stacked = options.series.stacked || chartConst.STACKED_NORMAL_TYPE;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            yAxis: this._createAxisScaleMaker(this.options.yAxis, 'yAxis')
        };
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            axes: [
                {
                    name: 'yAxis'
                },
                {
                    name: 'xAxis',
                    isLabel: true
                }
            ],
            chartType: chartType,
            serieses: [
                {
                    name: 'columnSeries',
                    SeriesClass: Series,
                    data: {
                        allowNegativeTooltip: true
                    }
                }
            ]
        });
    }
});

axisTypeMixer.mixin(ColumnChart);
barTypeMixer.mixin(ColumnChart);

module.exports = ColumnChart;
