(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @fileoverview  Axis component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    chartConst = require('../const'),
    calculator = require('../helpers/calculator'),
    renderUtil = require('../helpers/renderUtil'),
    axisTemplate = require('./axisTemplate');

var Axis = tui.util.defineClass(/** @lends Axis.prototype */ {
    /**
     * Axis component.
     * @constructs Axis
     * @param {object} params parameters
     *      @param {{
     *          labels: array.<string>,
     *          tickCount: number,
     *          isLabelAxis: boolean,
     *          isVertical: boolean
     *      }} params.data axis data
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     *      @param {object} params.options axis options
     */
    init: function(params) {
        tui.util.extend(this, params);
        /**
         * Axis view className
         */
        this.className = 'tui-chart-axis-area';
    },

    /**
     * To render axis area.
     * @param {HTMLElement} elAxisArea axis area element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound axis bound
     * @param {object} data rendering data
     * @private
     */
    _renderAxisArea: function(elAxisArea, bound, data) {
        var theme = this.theme,
            isVertical = !!data.isVertical,
            isPositionRight = !!data.isPositionRight,
            options = this.options,
            dimension = bound.dimension,
            size = isVertical ? dimension.height : dimension.width,
            elTitleArea = this._renderTitleArea({
                title: options.title,
                theme: theme.title,
                isVertical: isVertical,
                isPositionRight: isPositionRight,
                size: size
            }),
            elLabelArea = this._renderLabelArea(data, size, dimension.width, bound.degree),
            elTickArea;

        this.data = data;
        this.bound = bound;

        if (!isVertical || !data.aligned) {
            elTickArea = this._renderTickArea(size);
        }
        renderUtil.renderDimension(elAxisArea, dimension);
        renderUtil.renderPosition(elAxisArea, bound.position);
        dom.addClass(elAxisArea, isVertical ? 'vertical' : 'horizontal');
        dom.addClass(elAxisArea, isPositionRight ? 'right' : '');
        dom.append(elAxisArea, [elTitleArea, elTickArea, elLabelArea]);
    },

    /**
     * To render axis component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound axis bound
     * @param {object} data rendering data
     * @returns {HTMLElement} axis area base element
     */
    render: function(bound, data) {
        var el = dom.create('DIV', this.className);
        this._renderAxisArea(el, bound, data);
        this.elAxisArea = el;
        return el;
    },

    /**
     * To resize axis component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound axis bound
     * @param {object} data rendering data
     */
    resize: function(bound, data) {
        this.elAxisArea.innerHTML = '';
        this._renderAxisArea(this.elAxisArea, bound, data);
    },

    /**
     * Render css style of title area
     * @param {HTMLElement} elTitleArea title element
     * @param {number} size (width or height)
     * @param {boolean} isPositionRight whether right position or not?
     * @private
     */
    _renderTitleAreaStyle: function(elTitleArea, size, isPositionRight) {
        var cssTexts = [
            renderUtil.concatStr('width:', size, 'px')
        ];

        if (isPositionRight) {
            cssTexts.push(renderUtil.concatStr('right:', -size, 'px'));
            cssTexts.push(renderUtil.concatStr('top:', 0, 'px'));
        } else {
            cssTexts.push(renderUtil.concatStr('left:', 0, 'px'));
            if (!renderUtil.isOldBrowser()) {
                cssTexts.push(renderUtil.concatStr('top:', size, 'px'));
            }
        }

        elTitleArea.style.cssText += ';' + cssTexts.join(';');
    },

    /**
     * Title area renderer
     * @param {object} params parameters
     *      @param {string} params.title axis title
     *      @param {object} params.theme title theme
     *      @param {boolean} params.isVertical whether vertical or not?
     *      @param {boolean} params.isPositionRight whether right position or not?
     *      @param {number} params.size (width or height)
     * @returns {HTMLElement} title element
     * @private
     */
    _renderTitleArea: function(params) {
        var elTitleArea = renderUtil.renderTitle(params.title, params.theme, 'tui-chart-title-area');

        if (elTitleArea && params.isVertical) {
            this._renderTitleAreaStyle(elTitleArea, params.size, params.isPositionRight);
        }

        return elTitleArea;
    },

    /**
     * Redner tick area.
     * @param {number} size size or height
     * @returns {HTMLElement} tick area element
     * @private
     */
    _renderTickArea: function(size) {
        var data = this.data,
            tickCount = data.tickCount,
            tickColor = this.theme.tickColor,
            positions = calculator.makeTickPixelPositions(size, tickCount),
            elTickArea = dom.create('DIV', 'tui-chart-tick-area'),
            posType = data.isVertical ? 'bottom' : 'left',
            borderColorType = data.isVertical ? (data.isPositionRight ? 'borderLeftColor' : 'borderRightColor') : 'borderTopColor',
            template = axisTemplate.tplAxisTick,
            ticksHtml = tui.util.map(positions, function(position, index) {
                var cssText;
                if (data.aligned && data.labels[index] === chartConst.EMPTY_AXIS_LABEL) {
                    return '';
                }
                cssText = [
                    renderUtil.concatStr('background-color:', tickColor),
                    renderUtil.concatStr(posType, ': ', position, 'px')
                ].join(';');
                return template({cssText: cssText});
            }, this).join('');

        elTickArea.innerHTML = ticksHtml;
        elTickArea.style[borderColorType] = tickColor;

        return elTickArea;
    },

    /**
     * To make cssText of vertical label.
     * @param {number} axisWidth axis width
     * @param {number} titleAreaWidth title area width
     * @returns {string} cssText
     * @private
     */
    _makeVerticalLabelCssText: function(axisWidth, titleAreaWidth) {
        return ';width:' + (axisWidth - titleAreaWidth + chartConst.V_LABEL_RIGHT_PADDING) + 'px';
    },

    /**
     * Render label area.
     * @param {object} data rendering data
     * @param {number} size label area size
     * @param {number} axisWidth axis area width
     * @param {number} degree rotation degree
     * @returns {HTMLElement} label area element
     * @private
     */
    _renderLabelArea: function(data, size, axisWidth, degree) {
        var tickPixelPositions = calculator.makeTickPixelPositions(size, data.tickCount),
            labelSize = tickPixelPositions[1] - tickPixelPositions[0],
            posType = 'left',
            cssTexts = this._makeLabelCssTexts({
                isVertical: data.isVertical,
                isLabelAxis: data.isLabelAxis,
                labelSize: labelSize
            }),
            elLabelArea = dom.create('DIV', 'tui-chart-label-area'),
            areaCssText = renderUtil.makeFontCssText(this.theme.label),
            labelsHtml, titleAreaWidth;

        if (data.isVertical) {
            posType = data.isLabelAxis ? 'top' : 'bottom';
            titleAreaWidth = this._getRenderedTitleHeight() + chartConst.TITLE_AREA_WIDTH_PADDING;
            areaCssText += this._makeVerticalLabelCssText(axisWidth, titleAreaWidth);
        }

        tickPixelPositions.length = data.labels.length;

        labelsHtml = this._makeLabelsHtml({
            positions: tickPixelPositions,
            labels: data.labels,
            posType: posType,
            cssTexts: cssTexts,
            labelSize: labelSize,
            degree: degree,
            theme: this.theme.label
        });

        elLabelArea.innerHTML = labelsHtml;
        elLabelArea.style.cssText = areaCssText;

        this._changeLabelAreaPosition({
            elLabelArea: elLabelArea,
            isVertical: data.isVertical,
            isLabelAxis: data.isLabelAxis,
            theme: this.theme.label,
            labelSize: labelSize,
            aligned: data.aligned
        });

        return elLabelArea;
    },

    /**
     * Get height of title area ;
     * @returns {number} height
     * @private
     */
    _getRenderedTitleHeight: function() {
        var title = this.options.title,
            theme = this.theme.title,
            result = title ? renderUtil.getRenderedLabelHeight(title, theme) : 0;
        return result;
    },

    /**
     * To make cssTexts of label.
     * @param {object} params parameter
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {boolean} params.isLabelAxis whether label axis or not
     *      @param {number} params.labelSize label size (width or height)
     * @returns {string[]} cssTexts
     * @private
     */
    _makeLabelCssTexts: function(params) {
        var cssTexts = [];

        if (params.isVertical && params.isLabelAxis) {
            cssTexts.push(renderUtil.concatStr('height:', params.labelSize, 'px'));
            cssTexts.push(renderUtil.concatStr('line-height:', params.labelSize, 'px'));
        } else if (!params.isVertical) {
            cssTexts.push(renderUtil.concatStr('width:', params.labelSize, 'px'));
        }

        return cssTexts;
    },

    /**
     * To calculate rotation moving position.
     * @param {object} params parameters
     *      @param {number} params.degree rotation degree
     *      @param {number} params.labelHeight label height
     *      @param {number} params.left normal left
     *      @param {number} params.moveLeft move left
     *      @param {number} params.top top
     * @returns {{top:number, left: number}} position
     * @private
     */
    _calculateRotationMovingPosition: function(params) {
        var moveLeft = params.moveLeft;
        if (params.degree === chartConst.ANGLE_85) {
            moveLeft += calculator.calculateAdjacent(chartConst.ANGLE_90 - params.degree, params.labelHeight / 2);
        }

        return {
            top: params.top,
            left: params.left - moveLeft
        };
    },

    /**
     * To calculate rotation moving position for ie8.
     * @param {object} params parameters
     *      @param {number} params.degree rotation degree
     *      @param {number} params.labelWidth label width
     *      @param {number} params.labelHeight label height
     *      @param {number} params.left normal left
     *      @param {(string | number)} params.label label
     *      @param {object} theme label theme
     * @returns {{top:number, left: number}} position
     * @private
     */
    _calculateRotationMovingPositionForIE8: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.label, params.theme),
            smallAreaWidth = calculator.calculateAdjacent(chartConst.ANGLE_90 - params.degree, params.labelHeight / 2),
            newLabelWidth = (calculator.calculateAdjacent(params.degree, labelWidth / 2) + smallAreaWidth) * 2,
            collectLeft = labelWidth - newLabelWidth,
            moveLeft = (params.labelWidth / 2) - (smallAreaWidth * 2);

        if (params.degree === chartConst.ANGLE_85) {
            moveLeft += smallAreaWidth;
        }

        return {
            top: chartConst.XAXIS_LABEL_TOP_MARGIN,
            left: params.left + collectLeft - moveLeft
        };
    },

    /**
     * To make cssText for rotation moving.
     * @param {object} params parameters
     *      @param {number} params.degree rotation degree
     *      @param {number} params.labelWidth label width
     *      @param {number} params.labelHeight label height
     *      @param {number} params.left normal left
     *      @param {number} params.moveLeft move left
     *      @param {number} params.top top
     *      @param {(string | number)} params.label label
     *      @param {object} theme label theme
     * @returns {string} cssText
     * @private
     */
    _makeCssTextForRotationMoving: function(params) {
        var position;
        if (renderUtil.isOldBrowser()) {
            position = this._calculateRotationMovingPositionForIE8(params);
        } else {
            position = this._calculateRotationMovingPosition(params);
        }
        return renderUtil.concatStr('left:', position.left, 'px', ';top:', position.top, 'px');
    },

    /**
     * To make html of rotation labels.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions label position array
     *      @param {string[]} params.labels label array
     *      @param {string} params.posType position type (left or bottom)
     *      @param {string[]} params.cssTexts css array
     * @returns {string} labels html
     * @private
     */
    _makeRotationLabelsHtml: function(params) {
        var template = axisTemplate.tplAxisLabel,
            labelHeight = renderUtil.getRenderedLabelHeight(params.labels[0], params.theme),
            labelCssText = params.cssTexts.length ? params.cssTexts.join(';') + ';' : '',
            addClass = ' rotation' + params.degree,
            halfWidth = params.labelSize / 2,
            moveLeft = calculator.calculateAdjacent(params.degree, halfWidth),
            top = calculator.calculateOpposite(params.degree, halfWidth) + chartConst.XAXIS_LABEL_TOP_MARGIN,
            labelsHtml = tui.util.map(params.positions, function(position, index) {
                var label = params.labels[index],
                    rotationCssText = this._makeCssTextForRotationMoving({
                        degree: params.degree,
                        labelHeight: labelHeight,
                        labelWidth: params.labelSize,
                        top: top,
                        left: position,
                        moveLeft: moveLeft,
                        label: label,
                        theme: params.theme
                    });

                return template({
                    addClass: addClass,
                    cssText: labelCssText + rotationCssText,
                    label: label
                });
            }, this).join('');

        return labelsHtml;
    },

    /**
     * To make html of normal labels.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions label position array
     *      @param {string[]} params.labels label array
     *      @param {string} params.posType position type (left or bottom)
     *      @param {string[]} params.cssTexts css array
     * @returns {string} labels html
     * @private
     */
    _makeNormalLabelsHtml: function(params) {
        var template = axisTemplate.tplAxisLabel,
            labelCssText = params.cssTexts.length ? params.cssTexts.join(';') + ';' : '',
            labelsHtml = tui.util.map(params.positions, function(position, index) {
                var addCssText = renderUtil.concatStr(params.posType, ':', position, 'px');
                return template({
                    addClass: '',
                    cssText: labelCssText + addCssText,
                    label: params.labels[index]
                });
            }, this).join('');
        return labelsHtml;
    },

    /**
     * To make html of labels.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions label position array
     *      @param {string[]} params.labels label array
     *      @param {string} params.posType position type (left or bottom)
     *      @param {string[]} params.cssTexts css array
     * @returns {string} labels html
     * @private
     */
    _makeLabelsHtml: function(params) {
        var labelsHtml;
        if (params.degree) {
            labelsHtml = this._makeRotationLabelsHtml(params);
        } else {
            labelsHtml = this._makeNormalLabelsHtml(params);
        }

        return labelsHtml;
    },

    /**
     * Change position of label area.
     * @param {object} params parameter
     *      @param {HTMLElement} params.elLabelArea label area element
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {boolean} params.isLabelAxis whether label axis or not
     *      @param {{fontSize: number, fontFamily: string, color: string}} params.theme label theme
     *      @param {number} params.labelSize label size (width or height)
     * @private
     */
    _changeLabelAreaPosition: function(params) {
        var labelHeight;

        if (params.isLabelAxis && !params.aligned) {
            return;
        }

        if (params.isVertical) {
            labelHeight = renderUtil.getRenderedLabelHeight('ABC', params.theme);
            params.elLabelArea.style.top = renderUtil.concatStr(parseInt(labelHeight / 2, 10), 'px');
        } else {
            params.elLabelArea.style.left = renderUtil.concatStr('-', parseInt(params.labelSize / 2, 10), 'px');
        }
    }
});

module.exports = Axis;

},{"../const":15,"../helpers/calculator":28,"../helpers/domHandler":30,"../helpers/renderUtil":33,"./axisTemplate":2}],2:[function(require,module,exports){
/**
 * @fileoverview This is templates or axis view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_AXIS_TICK: '<div class="tui-chart-tick" style="{{ cssText }}"></div>',
    HTML_AXIS_LABEL: '<div class="tui-chart-label{{ addClass }}" style="{{ cssText }}"><span>{{ label }}</span></div>'
};

module.exports = {
    tplAxisTick: templateMaker.template(tags.HTML_AXIS_TICK),
    tplAxisLabel: templateMaker.template(tags.HTML_AXIS_LABEL)
};

},{"../helpers/templateMaker":34}],3:[function(require,module,exports){
/**
 * @fileoverview chart.js is entry point of Toast UI Chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';

var chartConst = require('./const'),
    chartFactory = require('./factories/chartFactory'),
    pluginFactory = require('./factories/pluginFactory'),
    themeFactory = require('./factories/themeFactory');

var _createChart;

require('./polyfill');
require('./code-snippet-util');
require('./registerCharts');
require('./registerThemes');

/**
 * NHN Entertainment Toast UI Chart.
 * @namespace tui.chart
 */
tui.util.defineNamespace('tui.chart');

/**
 * Create chart.
 * @param {HTMLElement} container container
 * @param {array.<array>} data chart data
 * @param {{
 *   chart: {
 *     width: number,
 *     height: number,
 *     title: string,
 *     format: string
 *   },
 *   yAxis: {
 *     title: string,
 *     min: number
 *   },
 *   xAxis: {
 *     title: strig,
 *     min: number
 *   },
 *   tooltip: {
 *     suffix: string,
 *     template: string
 *   },
 *   theme: string
 * }} options chart options
 * @returns {object} chart instance.
 * @private
 * @ignore
 */
_createChart = function(container, data, options) {
    var themeName, theme, chart;
    options = options || {};
    themeName = options.theme || chartConst.DEFAULT_THEME_NAME;
    theme = themeFactory.get(themeName);

    chart = chartFactory.get(options.chartType, data, theme, options);
    container.appendChild(chart.render());
    chart.animateChart();

    return chart;
};

/**
 * Bar chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.labelInterval label interval of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.min minimal value of horizontal axis
 *          @param {number} options.xAxis.max maximum value of horizontal axis
 *      @param {object} options.series options of series
 *          @param {string} options.series.stacked stacked type
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {number} options.series.barWidth bar width
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [20, 30, 50]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [40, 40, 60]
 *         },
 *         {
 *           name: 'Legend3',
 *           data: [60, 50, 10]
 *         },
 *         {
 *           name: 'Legend4',
 *           data: [80, 10, 70]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Bar Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.barChart(container, data, options);
 */
tui.chart.barChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_BAR;
    return _createChart(container, data, options);
};

/**
 * Column chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.min minimal value of vertical axis
 *          @param {number} options.yAxis.max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
 *      @param {object} options.series options of series
 *          @param {string} options.series.stacked stacked type
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {number} options.series.barWidth bar width
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} column chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [20, 30, 50]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [40, 40, 60]
 *         },
 *         {
 *           name: 'Legend3',
 *           data: [60, 50, 10]
 *         },
 *         {
 *           name: 'Legend4',
 *           data: [80, 10, 70]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Column Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.columnChart(container, data, options);
 */
tui.chart.columnChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COLUMN;
    return _createChart(container, data, options);
};

/**
 * Line chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.min minimal value of vertical axis
 *          @param {number} options.yAxis.max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.hasDot whether has dot or not
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [20, 30, 50]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [40, 40, 60]
 *         },
 *         {
 *           name: 'Legend3',
 *           data: [60, 50, 10]
 *         },
 *         {
 *           name: 'Legend4',
 *           data: [80, 10, 70]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Line Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       },
 *       series: {
 *         hasDot: true
 *       }
 *     };
 * tui.chart.lineChart(container, data, options);
 */
tui.chart.lineChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_LINE;
    return _createChart(container, data, options);
};

/**
 * Area chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.yAxis options of vertical axis
 *          @param {string} options.yAxis.title title of vertical axis
 *          @param {number} options.yAxis.min minimal value of vertical axis
 *          @param {number} options.yAxis.max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.hasDot whether has dot or not
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: [20, 30, 50]
 *         },
 *         {
 *           name: 'Legend2',
 *           data: [40, 40, 60]
 *         },
 *         {
 *           name: 'Legend3',
 *           data: [60, 50, 10]
 *         },
 *         {
 *           name: 'Legend4',
 *           data: [80, 10, 70]
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Area Chart'
 *       },
 *       yAxis: {
 *         title: 'Y Axis'
 *       },
 *       xAxis: {
 *         title: 'X Axis'
 *       }
 *     };
 * tui.chart.areaChart(container, data, options);
 */
tui.chart.areaChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_AREA;
    return _createChart(container, data, options);
};

/**
 * Combo chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<string>} data.categories categories
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object[]} options.yAxis options of vertical axis
 *          @param {string} options.yAxis[].title title of vertical axis
 *          @param {number} options.yAxis[].min minimal value of vertical axis
 *          @param {number} options.yAxis[].max maximum value of vertical axis
 *      @param {object} options.xAxis options of horizontal axis
 *          @param {string} options.xAxis.title title of horizontal axis
 *          @param {number} options.xAxis.labelInterval label interval of horizontal axis
 *      @param {object} options.series options of series
 *          @param {object} options.series.column options of column series
 *              @param {string} options.series.column.stacked stacked type
 *              @param {boolean} options.series.column.showLabel whether show label or not
 *              @param {number} options.series.column.barWidth bar width
 *              @param {boolean} options.series.column.hasSelection whether has selection or not
 *          @param {object} options.series.line options of line series
 *              @param {boolean} options.series.line.hasDot whether has dot or not
 *              @param {boolean} options.series.line.showLabel whether show label or not
 *              @param {boolean} options.series.line.hasSelection whether has selection or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {object} options.tooltip.column options of column tooltip
 *              @param {string} options.tooltip.column.suffix suffix of tooltip
 *              @param {string} options.tooltip.column.template template of tooltip
 *              @param {string} options.tooltip.column.align tooltip align option
 *              @param {object} options.tooltip.column.position relative position
 *                  @param {number} options.tooltip.column.position.left position left
 *                  @param {number} options.tooltip.column.position.top position top
 *          @param {boolean} options.tooltip.grouped whether group tooltip or not
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       categories: ['cate1', 'cate2', 'cate3'],
 *       series: {
 *         column: [
 *           {
 *             name: 'Legend1',
 *             data: [20, 30, 50]]
 *           },
 *           {
 *             name: 'Legend2',
 *             data: [40, 40, 60]
 *           },
 *           {
 *             name: 'Legend3',
 *             data: [60, 50, 10]
 *           },
 *           {
 *             name: 'Legend4',
 *             data: [80, 10, 70]
 *           }
 *         },
 *         line: [
 *           {
 *             name: 'Legend5',
 *             data: [1, 2, 3]
 *           }
 *         ]
 *       }
 *     },
 *     options = {
 *       chart: {
 *         title: 'Combo Chart'
 *       },
 *       yAxis:[
 *         {
 *           title: 'Y Axis',
 *           chartType: 'line'
 *         },
 *         {
 *           title: 'Y Right Axis'
 *         }
 *       ],
 *       xAxis: {
 *         title: 'X Axis'
 *       },
 *       series: {
 *         hasDot: true
 *       }
 *     };
 * tui.chart.comboChart(container, data, options);
 */
tui.chart.comboChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_COMBO;
    return _createChart(container, data, options);
};

/**
 * Pie chart creator.
 * @memberOf tui.chart
 * @param {HTMLElement} container chart container
 * @param {object} data chart data
 *      @param {array.<array>} data.series series data
 * @param {object} options chart options
 *      @param {object} options.chart chart options
 *          @param {number} options.chart.width chart width
 *          @param {number} options.chart.height chart height
 *          @param {string} options.chart.title chart title
 *          @param {string} options.chart.format value format
 *      @param {object} options.series options of series
 *          @param {boolean} options.series.showLabel whether show label or not
 *          @param {boolean} options.series.hasSelection whether has selection or not
 *      @param {object} options.tooltip options of tooltip
 *          @param {string} options.tooltip.suffix suffix of tooltip
 *          @param {string} options.tooltip.template template of tooltip
 *          @param {string} options.tooltip.align tooltip align option
 *          @param {object} options.tooltip.position relative position
 *              @param {number} options.tooltip.position.left position left
 *              @param {number} options.tooltip.position.top position top
 *      @param {object} options.legend options of legend
 *          @param {string} options.legend.align legend align
 *      @param {string} options.theme theme name
 *      @param {string} options.libType graph library type
 * @returns {object} bar chart
 * @example
 * var container = document.getElementById('container-id'),
 *     data = {
 *       series: [
 *         {
 *           name: 'Legend1',
 *           data: 20
 *         },
 *         {
 *           name: 'Legend2',
 *           data: 40
 *         },
 *         {
 *           name: 'Legend3',
 *           data: 60
 *         },
 *         {
 *           name: 'Legend4',
 *           data: 80
 *         }
 *       ]
 *     },
 *     options = {
 *       chart: {
 *         title: 'Pie Chart'
 *       }
 *     };
 * tui.chart.pieChart(container, data, options);
 */
tui.chart.pieChart = function(container, data, options) {
    options = options || {};
    options.chartType = chartConst.CHART_TYPE_PIE;
    return _createChart(container, data, options);
};

/**
 * Register theme.
 * @memberOf tui.chart
 * @param {string} themeName theme name
 * @param {object} theme application chart theme
 *      @param {object} theme.chart chart theme
 *          @param {string} theme.chart.fontFamily font family of chart
 *          @param {string} theme.chart.background background of chart
 *      @param {object} theme.title chart theme
 *          @param {number} theme.title.fontSize font size of chart title
 *          @param {string} theme.title.fontFamily font family of chart title
 *          @param {string} theme.title.color font color of chart title
 *          @param {string} theme.title.background background of chart title
 *      @param {object} theme.yAxis theme of vertical axis
 *          @param {object} theme.yAxis.title theme of vertical axis title
 *              @param {number} theme.yAxis.title.fontSize font size of vertical axis title
 *              @param {string} theme.yAxis.title.fontFamily font family of vertical axis title
 *              @param {string} theme.yAxis.title.color font color of vertical axis title
 *          @param {object} theme.yAxis.label theme of vertical axis label
 *              @param {number} theme.yAxis.label.fontSize font size of vertical axis label
 *              @param {string} theme.yAxis.label.fontFamily font family of vertical axis label
 *              @param {string} theme.yAxis.label.color font color of vertical axis label
 *          @param {string} theme.yAxis.tickcolor color of vertical axis tick
 *      @param {object} theme.xAxis theme of horizontal axis
 *          @param {object} theme.xAxis.title theme of horizontal axis title
 *              @param {number} theme.xAxis.title.fontSize font size of horizontal axis title
 *              @param {string} theme.xAxis.title.fontFamily font family of horizontal axis title
 *              @param {string} theme.xAxis.title.color font color of horizontal axis title
 *          @param {object} theme.xAxis.label theme of horizontal axis label
 *              @param {number} theme.xAxis.label.fontSize font size of horizontal axis label
 *              @param {string} theme.xAxis.label.fontFamily font family of horizontal axis label
 *              @param {string} theme.xAxis.label.color font color of horizontal axis label
 *          @param {string} theme.xAxis.tickcolor color of horizontal axis tick
 *      @param {object} theme.plot plot theme
 *          @param {string} theme.plot.lineColor plot line color
 *          @param {string} theme.plot.background plot background
 *      @param {object} theme.series series theme
 *          @param {array.<string>} theme.series.colors series colors
 *          @param {string} theme.series.borderColor series border color
 *      @param {object} theme.legend legend theme
 *          @param {object} theme.legend.label theme of legend label
 *              @param {number} theme.legend.label.fontSize font size of legend label
 *              @param {string} theme.legend.label.fontFamily font family of legend label
 *              @param {string} theme.legend.label.color font color of legend label
 * @example
 * var theme = {
 *   yAxis: {
 *     tickColor: '#ccbd9a',
 *       title: {
 *         color: '#333333'
 *       },
 *       label: {
 *         color: '#6f491d'
 *       }
 *     },
 *     xAxis: {
 *       tickColor: '#ccbd9a',
 *       title: {
 *         color: '#333333'
 *       },
 *       label: {
 *         color: '#6f491d'
 *       }
 *     },
 *     plot: {
 *       lineColor: '#e5dbc4',
 *       background: '#f6f1e5'
 *     },
 *     series: {
 *       colors: ['#40abb4', '#e78a31', '#c1c452', '#795224', '#f5f5f5'],
 *       borderColor: '#8e6535',
 *       selectionColor: '#cccccc',
 *     },
 *     legend: {
 *       label: {
 *         color: '#6f491d'
 *       }
 *     }
 *   };
 * chart.registerTheme('newTheme', theme);
 */
tui.chart.registerTheme = function(themeName, theme) {
    themeFactory.register(themeName, theme);
};

/**
 * Register graph plugin.
 * @memberOf tui.chart
 * @param {string} libType type of graph library
 * @param {object} plugin plugin to control library
 * @example
 * var pluginRaphael = {
 *   bar: function() {} // Render class
 * };
 * tui.chart.registerPlugin('raphael', pluginRaphael);
 */
tui.chart.registerPlugin = function(libType, plugin) {
    pluginFactory.register(libType, plugin);
};

},{"./code-snippet-util":14,"./const":15,"./factories/chartFactory":23,"./factories/pluginFactory":24,"./factories/themeFactory":25,"./polyfill":47,"./registerCharts":48,"./registerThemes":49}],4:[function(require,module,exports){
/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    lineTypeMixer = require('./lineTypeMixer'),
    axisTypeMixer = require('./axisTypeMixer'),
    verticalTypeMixer = require('./verticalTypeMixer'),
    Series = require('../series/areaChartSeries');

var AreaChart = tui.util.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-area-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Area chart.
     * @constructs AreaChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @mixes lineTypeMixer
     */
    init: function() {
        this._lineTypeInit.apply(this, arguments);
    }
});

axisTypeMixer.mixin(AreaChart);
verticalTypeMixer.mixin(AreaChart);
lineTypeMixer.mixin(AreaChart);

module.exports = AreaChart;

},{"../series/areaChartSeries":50,"./axisTypeMixer":5,"./chartBase":7,"./lineTypeMixer":11,"./verticalTypeMixer":13}],5:[function(require,module,exports){
/**
 * @fileoverview axisTypeMixer is mixer of axis type chart(bar, column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil'),
    Axis = require('../axes/axis'),
    Plot = require('../plots/plot'),
    Legend = require('../legends/legend'),
    GroupTypeCustomEvent = require('../customEvents/groupTypeCustomEvent'),
    PointTypeCustomEvent = require('../customEvents/pointTypeCustomEvent'),
    Tooltip = require('../tooltips/tooltip'),
    GroupTooltip = require('../tooltips/groupTooltip');

/**
 * axisTypeMixer is base class of axis type chart(bar, column, line, area).
 * @mixin
 */
var axisTypeMixer = {
    /**
     * Add axis components.
     * @param {array.<string>} axisNames axis names
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addAxisComponents: function(axisNames, aligned) {
        tui.util.forEach(axisNames, function(name) {
            var axisParams = {
                aligned: aligned
            };
            if (name === 'yrAxis') {
                axisParams.componentType = 'yAxis';
                axisParams.index = 1;
            }
            this._addComponent(name, Axis, axisParams);
        }, this);
    },

    /**
     * Add series components
     * @param {array<object>} serieses serieses
     * @param {object} options options
     * @param {boolean} aligned whether aligned or not
     * @private
     */
    _addSeriesComponents: function(serieses, options, aligned) {
        var seriesBaseParams = {
            libType: options.libType,
            chartType: options.chartType,
            parentChartType: options.parentChartType,
            aligned: aligned,
            hasGroupTooltip: this.hasGroupTooltip,
            userEvent: this.userEvent,
            componentType: 'series'
        };

        tui.util.forEach(serieses, function(series) {
            var seriesParams = tui.util.extend(seriesBaseParams, series.data);
            this._addComponent(series.name, series.SeriesClass, seriesParams);
        }, this);
    },

    /**
     * Add tooltip component
     * @param {object} convertedData convertedData
     * @param {object} options options
     * @private
     */
    _addTooltipComponent: function(convertedData, options) {
        if (this.hasGroupTooltip) {
            this._addComponent('tooltip', GroupTooltip, {
                labels: convertedData.labels,
                joinFormattedValues: convertedData.joinFormattedValues,
                joinLegendLabels: convertedData.joinLegendLabels,
                isVertical: this.isVertical,
                userEvent: this.userEvent
            });
        } else {
            this._addComponent('tooltip', Tooltip, {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                labels: convertedData.labels,
                legendLabels: convertedData.legendLabels,
                joinLegendLabels: convertedData.joinLegendLabels,
                chartType: options.chartType,
                isVertical: this.isVertical,
                userEvent: this.userEvent
            });
        }
    },

    /**
     * Add legend component.
     * @param {object} convertedData convertedData
     * @param {array.<string>} seriesChartTypes series chart types
     * @param {string} chartType chartType
     * @param {object} legendOptions legend options
     * @private
     */
    _addLegendComponent: function(convertedData, seriesChartTypes, chartType, legendOptions) {
        if (!legendOptions || !legendOptions.hidden) {
            this._addComponent('legend', Legend, {
                joinLegendLabels: convertedData.joinLegendLabels,
                legendLabels: convertedData.legendLabels,
                seriesChartTypes: seriesChartTypes,
                chartType: chartType,
                userEvent: this.userEvent
            });
        }
    },

    /**
     * Add components for axis type chart.
     * @param {object} params parameters
     *      @param {object} params.convertedData converted data
     *      @param {object} params.axes axes data
     *      @param {object} params.plotData plot data
     *      @param {function} params.serieses serieses
     * @private
     */
    _addComponentsForAxisType: function(params) {
        var convertedData = params.convertedData,
            options = this.options,
            aligned = !!params.aligned;

        this._addComponent('plot', Plot);
        this._addAxisComponents(params.axes, aligned);
        this._addLegendComponent(convertedData, params.seriesChartTypes, params.chartType, this.options.legend);
        this._addSeriesComponents(params.serieses, options, aligned);
        this._addTooltipComponent(convertedData, options);
    },

    /**
     * Get scales.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {array.<string>} chartTypes chart types
     * @returns {array.<{min: number, max: number}>} scales
     * @param {boolean} isVertical whether vertical or not
     * @private
     */
    _getScales: function(axesData, chartTypes, isVertical) {
        var scales = {},
            yAxisScale = axesData.yAxis.scale;

        scales[chartTypes[0]] = isVertical ? yAxisScale : axesData.xAxis.scale;

        if (chartTypes.length > 1) {
            scales[chartTypes[1]] = axesData.yrAxis ? axesData.yrAxis.scale : yAxisScale;
        }

        return scales;
    },

    /**
     * To make series data for rendering.
     * @param {{yAxis: object, xAxis: object}} axesData axes data
     * @param {array.<string>} chartTypes chart types
     * @param {boolean} isVertical whether vertical or not
     * @returns {object} series data
     * @private
     */
    _makeSeriesDataForRendering: function(axesData, chartTypes, isVertical) {
        var scales = this._getScales(axesData, chartTypes, isVertical),
            aligned = axesData.xAxis.aligned,
            seriesData = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            var key = chartTypes.length > 1 ? chartType + 'Series' : 'series';
            seriesData[key] = {
                scale: scales[chartType],
                aligned: aligned
            };
        });
        return seriesData;
    },

    /**
     * To make rendering data for axis type chart.
     * @param {object} bounds chart bounds
     * @param {object} convertedData convertedData
     * @param {object} options options
     * @return {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(bounds, convertedData, options) {
        var axesData = this._makeAxesData(convertedData, bounds, options),
            optionChartTypes = this.chartTypes || [this.chartType],
            seriesData = this._makeSeriesDataForRendering(axesData, optionChartTypes, this.isVertical);

        return tui.util.extend({
            plot: {
                vTickCount: axesData.yAxis.validTickCount,
                hTickCount: axesData.xAxis.validTickCount
            },
            customEvent: {
                tickCount: this.isVertical ? axesData.xAxis.tickCount : axesData.yAxis.tickCount
            },
            tooltip: {
                chartDimension: bounds.chart.dimension
            }
        }, seriesData, axesData);
    },

    /**
     * Add grouped event handler layer.
     * @param {{yAxis: obejct, xAxis: object}} axesData axes data
     * @param {string} chartType chart type
     * @param {boolean} isVertical whether vertical or not
     * @private
     * @override
     */
    _addCustomEventComponentForGroupTooltip: function() {
        this._addComponent('customEvent', GroupTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this._addComponent('customEvent', PointTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add custom event component.
     * @private
     */
    _addCustomEventComponent: function() {
        if (this.hasGroupTooltip) {
            this._addCustomEventComponentForGroupTooltip();
        } else {
            this._addCustomEventComponentForNormalTooltip();
        }
    },

    /**
     * Attach coordinate event.
     * @private
     */
    _attachCustomEventForGroupTooltip: function() {
        var customEvent = this.componentMap.customEvent,
            tooltip = this.componentMap.tooltip,
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });
        customEvent.on('showGroupTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideGroupTooltip', tooltip.onHide, tooltip);

        tui.util.forEach(serieses, function(series) {
            if (series.onShowGroupTooltipLine) {
                tooltip.on('showGroupTooltipLine', series.onShowGroupTooltipLine, series);
                tooltip.on('hideGroupTooltipLine', series.onHideGroupTooltipLine, series);
            }
            tooltip.on('showGroupAnimation', series.onShowGroupAnimation, series);
            tooltip.on('hideGroupAnimation', series.onHideGroupAnimation, series);
        }, this);
    },

    /**
     * To attach custom event for normal tooltip.
     * @private
     */
    _attachCustomEventForNormalTooltip: function() {
        var customEvent = this.componentMap.customEvent,
            tooltip = this.componentMap.tooltip,
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });

        customEvent.on('showTooltip', tooltip.onShow, tooltip);
        customEvent.on('hideTooltip', tooltip.onHide, tooltip);

        tui.util.forEach(serieses, function(series) {
            if (series.onShowAnimation) {
                tooltip.on(renderUtil.makeCustomEventName('show', series.chartType, 'animation'), series.onShowAnimation, series);
                tooltip.on(renderUtil.makeCustomEventName('hide', series.chartType, 'animation'), series.onHideAnimation, series);
            }
        }, this);
    },

    /**
     * To attach custom event for series selection.
     * @private
     */
    _attachCustomEventForSeriesSelection: function() {
        var customEvent = this.componentMap.customEvent,
            serieses = tui.util.filter(this.componentMap, function(component) {
                return component.componentType === 'series';
            });
        tui.util.forEach(serieses, function(series) {
            customEvent.on(renderUtil.makeCustomEventName('select', series.chartType, 'series'), series.onSelectSeries, series);
            customEvent.on(renderUtil.makeCustomEventName('unselect', series.chartType, 'series'), series.onUnselectSeries, series);
        }, this);
    },

    /**
     * Attach custom event.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        if (this.hasGroupTooltip) {
            this._attachCustomEventForGroupTooltip();
        } else {
            this._attachCustomEventForNormalTooltip();
        }

        this._attachCustomEventForSeriesSelection();
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = axisTypeMixer;

},{"../axes/axis":1,"../customEvents/groupTypeCustomEvent":19,"../customEvents/pointTypeCustomEvent":20,"../helpers/predicate":32,"../helpers/renderUtil":33,"../legends/legend":36,"../plots/plot":38,"../tooltips/groupTooltip":60,"../tooltips/tooltip":62}],6:[function(require,module,exports){
/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    axisTypeMixer = require('./axisTypeMixer'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    Series = require('../series/barChartSeries');

var BarChart = tui.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-bar-chart';

        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(this.convertedData, options.chartType);
    },

    /**
     * To make axes data
     * @param {object} convertedData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertedData, bounds, options) {
        var xAxisData = axisDataMaker.makeValueAxisData({
                values: convertedData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: convertedData.formatFunctions,
                options: options.xAxis
            }),
            yAxisData = axisDataMaker.makeLabelAxisData({
                labels: convertedData.labels,
                isVertical: true
            });

        return {
            xAxis: xAxisData,
            yAxis: yAxisData
        };
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(convertedData, chartType) {
        var seriesData = {
            allowNegativeTooltip: true,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                formatFunctions: convertedData.formatFunctions,
                joinLegendLabels: convertedData.joinLegendLabels
            }
        };

        this._addComponentsForAxisType({
            convertedData: convertedData,
            axes: ['yAxis', 'xAxis'],
            chartType: chartType,
            serieses: [
                {
                    name: 'series',
                    SeriesClass: Series,
                    data: seriesData
                }
            ]
        });
    }
});

axisTypeMixer.mixin(BarChart);

module.exports = BarChart;

},{"../helpers/axisDataMaker":26,"../series/barChartSeries":51,"./axisTypeMixer":5,"./chartBase":7}],7:[function(require,module,exports){
/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    dataConverter = require('../helpers/dataConverter'),
    boundsMaker = require('../helpers/boundsMaker'),
    UserEventListener = require('../helpers/userEventListener');

var ChartBase = tui.util.defineClass(/** @lends ChartBase.prototype */ {
    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} params parameters
     *      @param {object} params.bounds chart bounds
     *      @param {object} params.theme chart theme
     *      @param {{yAxis: obejct, xAxis: object}} axesData axes data
     *      @param {object} params.options chart options
     *      @param {boolean} param.isVertical whether vertical or not
     */
    init: function(params) {
        /**
         * converted data
         * @type {object}
         */
        this.convertedData = this._makeConvertedData(params);

        /**
         * component array
         * @type {array}
         */
        this.components = [];

        /**
         * component instance map
         * @type {object}
         */
        this.componentMap = {};

        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {object}
         */
        this.options = params.options;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * whether chart has group tooltip or not
         * @type {*|boolean}
         */
        this.hasGroupTooltip = params.options.tooltip && params.options.tooltip.grouped;

        /**
         * user event listener
         * @type {object}
         */
        this.userEvent = new UserEventListener();

        this.chartType = this.options.chartType;

        this._addCustomEventComponent();
    },

    /**
     * To make converted data.
     * @param {object} params parameters
     *      @params {object} userData user data
     *      @params {{chart: object, chartType: string}} options chart options
     *      @params {array} seriesChartTypes series chart types
     * @returns {object} converted data
     * @private
     */
    _makeConvertedData: function(params) {
        var options = params.options,
            convertedData = dataConverter.convert(params.userData, options.chart, options.chartType, params.seriesChartTypes);
        return convertedData;
    },

    /**
     *
     * @private
     * @abastract
     */
    _addCustomEventComponent: function() {},

    /**
     * To add component.
     * The component refers to a component of the chart.
     * The component types are axis, legend, plot, series and customEvent.
     * Chart Component Description : https://i-msdn.sec.s-msft.com/dynimg/IC267997.gif
     * @param {string} name component name
     * @param {function} Component component function
     * @param {object} params parameters
     * @private
     */
    _addComponent: function(name, Component, params) {
        var commonParams = {},
            options, index, theme, component;

        params = params || {};

        options = params.options || this.options[params && params.componentType || name];
        theme = params.theme || this.theme[params && params.componentType || name];
        index = params && params.index || 0;

        commonParams.theme = tui.util.isArray(theme) ? theme[index] : theme;
        commonParams.options = tui.util.isArray(options) ? options[index] : options || {};

        params = tui.util.extend(params, commonParams);

        component = new Component(params);

        this.components.push({
            name: name,
            componentType: params.componentType,
            instance: component
        });
        this.componentMap[name] = component;
    },

    /**
     * To make bounds.
     * @param {object} boundsParams parameters for making bounds
     * @returns {object} chart bounds
     * @private
     */
    _makeBounds: function(boundsParams) {
        return boundsMaker.make(tui.util.extend({
            convertedData: this.convertedData,
            theme: this.theme,
            options: this.options,
            hasAxes: this.hasAxes,
            isVertical: this.isVertical
        }, boundsParams));
    },

    /**
     * To make rendering data for axis type chart.
     * @param {object} bounds chart bounds
     * @param {object} convertedData convertedData
     * @param {object} options options
     * @private
     * @abstract
     */
    _makeRenderingData: function() {},

    /**
     * Attach custom evnet.
     * @private
     * @abstract
     */
    _attachCustomEvent: function() {},

    /**
     * Render chart.
     * @param {object} boundsParams parameters for making bounds
     * @returns {HTMLElement} chart element
     */
    render: function(boundsParams) {
        var el = dom.create('DIV', this.className),
            bounds, renderingData;

        if (boundsParams) {
            this._makeBounds = tui.util.bind(this._makeBounds, this, boundsParams);
        }

        dom.addClass(el, 'tui-chart');
        bounds = this._makeBounds();
        renderingData = this._makeRenderingData(bounds, this.convertedData, this.options);

        this._renderTitle(el);
        renderUtil.renderDimension(el, bounds.chart.dimension);
        renderUtil.renderBackground(el, this.theme.chart.background);
        renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);
        this._renderComponents(el, this.components, bounds, renderingData);
        this._sendSeriesData();
        this._attachCustomEvent();
        this.elChart = el;

        return el;
    },

    /**
     * Render title.
     * @param {HTMLElement} el target element
     * @private
     */
    _renderTitle: function(el) {
        var chartOptions = this.options.chart || {},
            elTitle = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'tui-chart-title');
        dom.append(el, elTitle);
    },

    /**
     * Find bound about component
     * @param {object} bounds components bounds
     * @param {string} name component name
     * @param {string} componentType component type
     * @returns {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} found bound
     * @private
     */
    _findBound: function(bounds, name, componentType) {
        return bounds[name] || (componentType && bounds[componentType]);
    },

    /**
     * Render components.
     * @param {HTMLElement} container container element
     * @param {array.<object>} components components
     * @param {array.<object>} bounds bounds
     * @param {object} renderingData data for rendering
     * @private
     */
    _renderComponents: function(container, components, bounds, renderingData) {
        var elements;
        elements = tui.util.map(components, function(component) {
            var name = component.name,
                bound = this._findBound(bounds, name, component.componentType),
                data = renderingData[name],
                elComponent;
            if (!bound) {
                return null;
            }

            elComponent = component.instance.render(bound, data);

            return elComponent;
        }, this);
        dom.append(container, elements);
    },

    /**
     * Send series data to custom event component.
     * @private
     */
    _sendSeriesData: function() {
        var seriesInfos, chartTypes;

        if (!this.componentMap.customEvent) {
            return;
        }

        chartTypes = this.chartTypes || [this.chartType];
        seriesInfos = tui.util.map(chartTypes, function(chartType) {
            var key = chartTypes.length === 1 ? 'series' : chartType + 'Series';
            return {
                chartType: chartType,
                data: this.componentMap[key].getSeriesData()
            };
        }, this);
        this.componentMap.customEvent.initCustomEventData(seriesInfos);
    },

    /**
     * To make event name for animation.
     * @param {string} chartType chart type
     * @param {string} prefix prefix
     * @returns {string} event name
     * @private
     */
    _makeAnimationEventName: function(chartType, prefix) {
        return prefix + chartType.substring(0, 1).toUpperCase() + chartType.substring(1) + 'Animation';
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        tui.util.forEachArray(this.components, function(component) {
            if (component.instance.animateComponent) {
                component.instance.animateComponent();
            }
        });
    },

    /**
     * To register of user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    on: function(eventName, func) {
        this.userEvent.register(eventName, func);
    },

    /**
     * Update dimension.
     * @param {{width: number, height: number}} dimension dimension
     * @returns {boolean} whether changed or not
     * @private
     */
    _updateDimension: function(dimension) {
        var changed = false;
        if (dimension.width) {
            this.options.chart.width = dimension.width;
            changed = true;
        }

        if (dimension.height) {
            this.options.chart.height = dimension.height;
            changed = true;
        }

        return changed;
    },

    /**
     * Resize components.
     * @param {array.<{name: string, instance: object}>} components components
     * @param {array.<object>} bounds bounds
     * @param {object} renderingData data for rendering
     * @private
     */
    _resizeComponents: function(components, bounds, renderingData) {
        tui.util.forEachArray(components, function(component) {
            var name = component.name,
                bound = this._findBound(bounds, name, component.componentType),
                data = renderingData[name];

            if (!component.instance.resize) {
                return;
            }

            component.instance.resize(bound, data);
        }, this);
    },

    /**
     * Public API for resizable.
     * @param {{width: number, height: number}} dimension dimension
     */
    resize: function(dimension) {
        var changed, bounds, renderingData;

        if (!dimension) {
            return;
        }

        changed = this._updateDimension(dimension);

        if (!changed) {
            return;
        }

        bounds = this._makeBounds();

        renderingData = this._makeRenderingData(bounds, this.convertedData, this.options);
        renderUtil.renderDimension(this.elChart, bounds.chart.dimension);
        this._resizeComponents(this.components, bounds, renderingData);
        this._sendSeriesData();
    },

    /**
     * Set tooltip align option.
     * @param {string} align align
     */
    setTooltipAlign: function(align) {
        this.componentMap.tooltip.setAlign(align);
    },

    /**
     * Set position option.
     * @param {{left: number, top: number}} position moving position
     */
    setTooltipPosition: function(position) {
        this.componentMap.tooltip.setPosition(position);
    },

    /**
     * Reset tooltip align option.
     */
    resetTooltipAlign: function() {
        this.componentMap.tooltip.resetAlign();
    },

    /**
     * Reset tooltip position.
     */
    resetTooltipPosition: function() {
        this.componentMap.tooltip.resetPosition();
    }
});

module.exports = ChartBase;

},{"../helpers/boundsMaker":27,"../helpers/dataConverter":29,"../helpers/domHandler":30,"../helpers/renderUtil":33,"../helpers/userEventListener":35}],8:[function(require,module,exports){
/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    axisTypeMixer = require('./axisTypeMixer'),
    verticalTypeMixer = require('./verticalTypeMixer'),
    Series = require('../series/columnChartSeries');

var ColumnChart = tui.util.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    init: function(userData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-column-chart';

        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(this.convertedData, options.chartType);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(convertedData, chartType) {
        var seriesData = {
            allowNegativeTooltip: true,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                formatFunctions: convertedData.formatFunctions,
                joinLegendLabels: convertedData.joinLegendLabels
            }
        };
        this._addComponentsForAxisType({
            convertedData: convertedData,
            axes: ['yAxis', 'xAxis'],
            chartType: chartType,
            serieses: [
                {
                    name: 'series',
                    SeriesClass: Series,
                    data: seriesData
                }
            ]
        });
    }
});

axisTypeMixer.mixin(ColumnChart);
verticalTypeMixer.mixin(ColumnChart);

module.exports = ColumnChart;

},{"../series/columnChartSeries":53,"./axisTypeMixer":5,"./chartBase":7,"./verticalTypeMixer":13}],9:[function(require,module,exports){
/**
 * @fileoverview Combo chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator'),
    ChartBase = require('./chartBase'),
    axisTypeMixer = require('./axisTypeMixer'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    predicate = require('../helpers/predicate'),
    defaultTheme = require('../themes/defaultTheme'),
    ColumnChartSeries = require('../series/columnChartSeries'),
    LineChartSeries = require('../series/lineChartSeries');

var ComboChart = tui.util.defineClass(ChartBase, /** @lends ComboChart.prototype */ {
    /**
     * Combo chart.
     * @constructs ComboChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var seriesChartTypes = tui.util.keys(userData.series).sort(),
            optionChartTypes = this._getYAxisOptionChartTypes(seriesChartTypes, options.yAxis),
            chartTypes = optionChartTypes.length ? optionChartTypes : seriesChartTypes;

        this.chartTypes = chartTypes;
        this.seriesChartTypes = seriesChartTypes;
        this.optionChartTypes = optionChartTypes;
        this.className = 'tui-combo-chart';

        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            seriesChartTypes: seriesChartTypes,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(this.convertedData, this.options, this.theme);
    },

    /**
     * To make options map
     * @param {object} chartTypes chart types
     * @param {object} options chart options
     * @param {object} orderInfo chart order
     * @returns {object} options map
     * @private
     */
    _makeOptionsMap: function(chartTypes, options) {
        var optionsMap = {};
        tui.util.forEachArray(chartTypes, function(chartType) {
            optionsMap[chartType] = options.series && options.series[chartType];
        });
        return optionsMap;
    },

    /**
     * To make theme map
     * @param {object} chartTypes chart types
     * @param {object} theme chart theme
     * @param {object} legendLabels legend labels
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(chartTypes, theme, legendLabels) {
        var themeMap = {},
            colorCount = 0;
        tui.util.forEachArray(chartTypes, function(chartType) {
            var chartTheme = JSON.parse(JSON.stringify(theme)),
                removedColors;

            if (chartTheme.series[chartType]) {
                themeMap[chartType] = chartTheme.series[chartType];
            } else if (!chartTheme.series.colors) {
                themeMap[chartType] = JSON.parse(JSON.stringify(defaultTheme.series));
                themeMap[chartType].label.fontFamily = chartTheme.chart.fontFamily;
            } else {
                removedColors = chartTheme.series.colors.splice(0, colorCount);
                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);
                themeMap[chartType] = chartTheme.series;
                colorCount += legendLabels[chartType].length;
            }
        });
        return themeMap;
    },

    /**
     * To make serieses
     * @param {array.<string>} chartTypes chart types
     * @param {object} convertedData converted data.
     * @param {object} options chart options
     * @param {object} theme chart theme
     * @returns {array.<object>} serieses
     * @private
     */
    _makeSerieses: function(chartTypes, convertedData, options, theme) {
        var seriesClasses = {
                column: ColumnChartSeries,
                line: LineChartSeries
            },
            optionsMap = this._makeOptionsMap(chartTypes, options),
            themeMap = this._makeThemeMap(chartTypes, theme, convertedData.legendLabels),
            serieses;
        serieses = tui.util.map(chartTypes, function(chartType) {
            var values = convertedData.values[chartType],
                formattedValues = convertedData.formattedValues[chartType],
                data;

            if (predicate.isLineTypeChart(chartType)) {
                values = tui.util.pivot(values);
                formattedValues = tui.util.pivot(formattedValues);
            }

            data = {
                allowNegativeTooltip: true,
                componentType: 'series',
                chartType: chartType,
                options: optionsMap[chartType],
                theme: themeMap[chartType],
                data: {
                    values: values,
                    formattedValues: formattedValues,
                    formatFunctions: convertedData.formatFunctions,
                    joinLegendLabels: convertedData.joinLegendLabels
                }
            };

            return {
                name: chartType + 'Series',
                SeriesClass: seriesClasses[chartType],
                data: data
            };
        });

        return serieses;
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} options chart options
     * @param {object} theme chart theme
     * @private
     */
    _addComponents: function(convertedData, options, theme) {
        var axes = ['yAxis', 'xAxis'],
            serieses = this._makeSerieses(this.seriesChartTypes, convertedData, options, theme);

        if (this.optionChartTypes.length) {
            axes.push('yrAxis');
        }

        this._addComponentsForAxisType({
            convertedData: convertedData,
            axes: axes,
            seriesChartTypes: this.seriesChartTypes,
            chartType: options.chartType,
            serieses: serieses
        });
    },

    /**
     * Get y axis option chart types.
     * @param {array.<string>} chartTypes chart types
     * @param {object} yAxisOptions y axis options
     * @returns {array.<string>} chart types
     * @private
     */
    _getYAxisOptionChartTypes: function(chartTypes, yAxisOptions) {
        var resultChartTypes = chartTypes.slice(),
            isReverse = false,
            optionChartTypes;

        yAxisOptions = yAxisOptions ? [].concat(yAxisOptions) : [];

        if (yAxisOptions.length === 1 && !yAxisOptions[0].chartType) {
            resultChartTypes = [];
        } else if (yAxisOptions.length) {
            optionChartTypes = tui.util.map(yAxisOptions, function(option) {
                return option.chartType;
            });

            tui.util.forEachArray(optionChartTypes, function(chartType, index) {
                isReverse = isReverse || (chartType && resultChartTypes[index] !== chartType || false);
            });

            if (isReverse) {
                resultChartTypes.reverse();
            }
        }

        return resultChartTypes;
    },

    /**
     * To make y axis data.
     * @param {object} params parameters
     *      @param {number} params.index chart index
     *      @param {object} params.convertedData converted data
     *      @param {{width: number, height: number}} params.seriesDimension series dimension
     *      @param {array.<string>} chartTypes chart type
     *      @param {boolean} isOneYAxis whether one series or not
     *      @param {object} options chart options
     *      @param {object} addParams add params
     * @returns {object} y axis data
     * @private
     */
    _makeYAxisData: function(params) {
        var convertedData = params.convertedData,
            index = params.index,
            chartType = params.chartTypes[index],
            options = params.options,
            yAxisValues, yAxisOptions, seriesOption;

        if (params.isOneYAxis) {
            yAxisValues = convertedData.joinValues;
            yAxisOptions = [options.yAxis];
        } else {
            yAxisValues = convertedData.values[chartType];
            yAxisOptions = options.yAxis || [];
        }

        seriesOption = options.series && options.series[chartType] || options.series;

        return axisDataMaker.makeValueAxisData(tui.util.extend({
            values: yAxisValues,
            stacked: seriesOption && seriesOption.stacked || '',
            options: yAxisOptions[index],
            chartType: chartType,
            seriesDimension: params.seriesDimension,
            formatFunctions: convertedData.formatFunctions,
            isVertical: true
        }, params.addParams));
    },

    /**
     * To make axes data
     * @param {object} convertedData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertedData, bounds, options) {
        var formatFunctions = convertedData.formatFunctions,
            yAxisParams = {
                convertedData: convertedData,
                seriesDimension: bounds.series.dimension,
                chartTypes: this.chartTypes,
                isOneYAxis: !this.optionChartTypes.length,
                options: options
            },
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: convertedData.labels
            }),
            yAxisData = this._makeYAxisData(tui.util.extend({
                index: 0
            }, yAxisParams)),
            axesData, yrAxisData;

        axesData = {
            yAxis: yAxisData,
            xAxis: xAxisData
        };

        if (!yAxisParams.isOneYAxis) {
            yrAxisData = this._makeYAxisData(tui.util.extend({
                index: 1,
                addParams: {
                    isPositionRight: true
                }
            }, yAxisParams));
            if (yAxisData.tickCount < yrAxisData.tickCount) {
                this._increaseYAxisTickCount(yrAxisData.tickCount - yAxisData.tickCount, yAxisData, formatFunctions);
            } else if (yAxisData.tickCount > yrAxisData.tickCount) {
                this._increaseYAxisTickCount(yAxisData.tickCount - yrAxisData.tickCount, yrAxisData, formatFunctions);
            }

            yrAxisData.aligned = xAxisData.aligned;
            axesData.yrAxis = yrAxisData;
        }

        return axesData;
    },

    /**
     * Increase y axis tick count.
     * @param {number} increaseTickCount increase tick count
     * @param {object} toData to tick info
     * @param {array.<function>} formatFunctions format functions
     * @private
     */
    _increaseYAxisTickCount: function(increaseTickCount, toData, formatFunctions) {
        toData.scale.max += toData.step * increaseTickCount;
        toData.labels = axisDataMaker.formatLabels(calculator.makeLabelsFromScale(toData.scale, toData.step), formatFunctions);
        toData.tickCount += increaseTickCount;
        toData.validTickCount += increaseTickCount;
    },

    /**
     * Render
     * @returns {HTMLElement} chart element
     */
    render: function() {
        //this._attachComboChartCoordinateEvent();
        return ChartBase.prototype.render.call(this, {
            seriesChartTypes: this.seriesChartTypes,
            optionChartTypes: this.optionChartTypes
        });
    }
});

axisTypeMixer.mixin(ComboChart);

module.exports = ComboChart;

},{"../helpers/axisDataMaker":26,"../helpers/calculator":28,"../helpers/predicate":32,"../series/columnChartSeries":53,"../series/lineChartSeries":54,"../themes/defaultTheme":59,"./axisTypeMixer":5,"./chartBase":7}],10:[function(require,module,exports){
/**
 * @fileoverview Line chart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    lineTypeMixer = require('./lineTypeMixer'),
    axisTypeMixer = require('./axisTypeMixer'),
    verticalTypeMixer = require('./verticalTypeMixer'),
    Series = require('../series/lineChartSeries');

var LineChart = tui.util.defineClass(ChartBase, /** @lends LineChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-line-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Line chart.
     * @constructs LineChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @mixes lineTypeMixer
     */
    init: function() {
        this._lineTypeInit.apply(this, arguments);
    }
});

axisTypeMixer.mixin(LineChart);
verticalTypeMixer.mixin(LineChart);
lineTypeMixer.mixin(LineChart);

module.exports = LineChart;

},{"../series/lineChartSeries":54,"./axisTypeMixer":5,"./chartBase":7,"./lineTypeMixer":11,"./verticalTypeMixer":13}],11:[function(require,module,exports){
/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Initialize line type chart.
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     * @private
     */
    _lineTypeInit: function(userData, theme, options) {
        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(this.convertedData, options.chartType);
    },

    _addCustomEventComponentForNormalTooltip: function() {
        this._addComponent('customEvent', AreaTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(convertedData, chartType) {
        var seriesData = {
            data: {
                values: tui.util.pivot(convertedData.values),
                formattedValues: tui.util.pivot(convertedData.formattedValues),
                formatFunctions: convertedData.formatFunctions,
                joinLegendLabels: convertedData.joinLegendLabels
            }
        };
        this._addComponentsForAxisType({
            convertedData: convertedData,
            axes: ['yAxis', 'xAxis'],
            chartType: chartType,
            serieses: [
                {
                    name: 'series',
                    SeriesClass: this.Series,
                    data: seriesData
                }
            ]
        });
    },

    /**
     * Render
     * @returns {HTMLElement} chart element
     */
    render: function() {
        return ChartBase.prototype.render.apply(this, arguments);
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = lineTypeMixer;

},{"../customEvents/areaTypeCustomEvent":16,"./chartBase":7}],12:[function(require,module,exports){
/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil'),
    Legend = require('../legends/legend'),
    Tooltip = require('../tooltips/tooltip'),
    Series = require('../series/pieChartSeries');

var PieChart = tui.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * Column chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        this.className = 'tui-pie-chart';

        options.tooltip = options.tooltip || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options
        });

        this._addComponents(this.convertedData, theme.chart.background, options);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} chartBackground chart background
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, chartBackground, options) {
        var legendAlign, isPieLegendType;
        options.legend = options.legend || {};
        legendAlign = options.legend && options.legend.align;
        isPieLegendType = predicate.isPieLegendAlign(legendAlign);
        if (convertedData.joinLegendLabels && !isPieLegendType && !options.legend.hidden) {
            this._addComponent('legend', Legend, {
                joinLegendLabels: convertedData.joinLegendLabels,
                legendLabels: convertedData.legendLabels,
                chartType: options.chartType,
                userEvent: this.userEvent
            });
        }

        this._addComponent('tooltip', Tooltip, {
            values: convertedData.values,
            formattedValues: convertedData.formattedValues,
            labels: convertedData.labels,
            legendLabels: convertedData.legendLabels,
            joinLegendLabels: convertedData.joinLegendLabels,
            userEvent: this.userEvent,
            chartType: options.chartType
        });

        this._addComponent('series', Series, {
            libType: options.libType,
            chartType: options.chartType,
            componentType: 'series',
            chartBackground: chartBackground,
            userEvent: this.userEvent,
            legendAlign: isPieLegendType && !options.legend.hidden ? legendAlign : null,
            data: {
                values: convertedData.values,
                formattedValues: convertedData.formattedValues,
                legendLabels: convertedData.legendLabels,
                joinLegendLabels: convertedData.joinLegendLabels
            }
        });
    },

    /**
     * To make rendering data for pie chart.
     * @param {object} bounds chart bounds
     * * @param {object} bounds chart bounds
     * @return {object} data for rendering
     * @private
     * @override
     */
    _makeRenderingData: function(bounds) {
        return {
            tooltip: {
                seriesPosition: bounds.series.position,
                chartDimension: bounds.chart.dimension
            },
            series: {
                chartWidth: bounds.chart.dimension.width
            }
        };
    },

    /**
     * Attach custom evnet.
     * @private
     * @override
     */
    _attachCustomEvent: function() {
        var tooltip = this.componentMap.tooltip,
            serieses = tui.util.filter(this.componentMap, function (component) {
                return component.componentType === 'series';
            });
        tui.util.forEach(serieses, function (series) {
            series.on('showTooltip', tooltip.onShow, tooltip);
            series.on('hideTooltip', tooltip.onHide, tooltip);

            if (series.onShowAnimation) {
                tooltip.on(renderUtil.makeCustomEventName('show', series.chartType, 'animation'), series.onShowAnimation, series);
                tooltip.on(renderUtil.makeCustomEventName('hide', series.chartType, 'animation'), series.onHideAnimation, series);
            }
        }, this);
    }
});

module.exports = PieChart;

},{"../const":15,"../helpers/predicate":32,"../helpers/renderUtil":33,"../legends/legend":36,"../series/pieChartSeries":56,"../tooltips/tooltip":62,"./chartBase":7}],13:[function(require,module,exports){
/**
 * @fileoverview verticalTypeMixer is mixer of vertical type chart(column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var axisDataMaker = require('../helpers/axisDataMaker'),
    predicate = require('../helpers/predicate');

/**
 * verticalTypeMixer is mixer of vertical type chart(column, line, area).
 * @mixin
 */
var verticalTypeMixer = {
    /**
     * To make axes data
     * @param {object} convertedData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertedData, bounds, options) {
        var aligned = predicate.isLineTypeChart(options.chartType),
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: convertedData.labels,
                aligned: aligned,
                options: options.xAxis
            }),
            yAxisData = axisDataMaker.makeValueAxisData({
                values: convertedData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: convertedData.formatFunctions,
                options: options.yAxis,
                isVertical: true,
                aligned: aligned
            });

        return {
            xAxis: xAxisData,
            yAxis: yAxisData
        };
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = verticalTypeMixer;

},{"../helpers/axisDataMaker":26,"../helpers/predicate":32}],14:[function(require,module,exports){
'use strict';

/**
 * Pick minimum value from value array.
 * @param {array} arr value array
 * @param {function} condition condition function
 * @param {object} context target context
 * @returns {*} minimum value
 */
var min = function(arr, condition, context) {
    var result, minValue, rest;
    if (!condition) {
        condition = function(item) {
            return item;
        };
    }
    result = arr[0];
    minValue = condition.call(context, result);
    rest = arr.slice(1);
    tui.util.forEachArray(rest, function(item) {
        var compareValue = condition.call(context, item);
        if (compareValue < minValue) {
            minValue = compareValue;
            result = item;
        }
    });
    return result;
};

/**
 * Pick maximum value from value array.
 * @param {array} arr value array
 * @param {function} condition condition function
 * @param {object} context target context
 * @returns {*} maximum value
 */
var max = function(arr, condition, context) {
    var result, maxValue, rest;
    if (!condition) {
        condition = function(item) {
            return item;
        };
    }
    result = arr[0];
    maxValue = condition.call(context, result);
    rest = arr.slice(1);
    tui.util.forEachArray(rest, function(item) {
        var compareValue = condition.call(context, item);
        if (compareValue > maxValue) {
            maxValue = compareValue;
            result = item;
        }
    });
    return result;
};

/**
 * Whether one of them is true or not.
 * @param {array} arr target array
 * @param {function} condition condition function
 * @returns {boolean} result boolean
 */
var any = function(arr, condition) {
    var result = false;
    tui.util.forEachArray(arr, function(item) {
        if (condition(item)) {
            result = true;
            return false;
        }
    });
    return result;
};

/**
 * All of them is true or not.
 * @param {array} arr target array
 * @param {function} condition condition function
 * @returns {boolean} result boolean
 */
var all = function(arr, condition) {
    var result = true;
    tui.util.forEachArray(arr, function(item) {
        if (!condition(item)) {
            result = false;
            return false;
        }
    });
    return result;
};

/**
 * Array pivot.
 * @memberOf module:calculator
 * @param {array.<array>} arr2d target 2d array
 * @returns {array.<array>} pivoted 2d array
 */
var pivot = function(arr2d) {
    var result = [];
    tui.util.forEachArray(arr2d, function(arr) {
        tui.util.forEachArray(arr, function(value, index) {
            if (!result[index]) {
                result[index] = [];
            }
            result[index].push(value);
        });
    });
    return result;
};

/**
 * Get after point length.
 * @param {string | number} value target value
 * @returns {number} result length
 */
var lengthAfterPoint = function(value) {
    var valueArr = (value + '').split('.');
    return valueArr.length === 2 ? valueArr[1].length : 0;
};

/**
 * Find multiple num.
 * @param {...array} target values
 * @returns {number} multiple num
 */
var findMultipleNum = function() {
    var args = [].slice.call(arguments),
        underPointLens = tui.util.map(args, function(value) {
            return tui.util.lengthAfterPoint(value);
        }),
        underPointLen = tui.util.max(underPointLens),
        multipleNum = Math.pow(10, underPointLen);
    return multipleNum;
};

/**
 * Modulo operation for floating point operation.
 * @param {number} target target values
 * @param {number} modNum mod num
 * @returns {number} result mod
 */
var mod = function(target, modNum) {
    var multipleNum = tui.util.findMultipleNum(modNum);
    return ((target * multipleNum) % (modNum * multipleNum)) / multipleNum;
};

/**
 * Addition for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} addition result
 */
var addition = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) + (b * multipleNum)) / multipleNum;
};

/**
 * Subtraction for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} subtraction result
 */
var subtraction = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) - (b * multipleNum)) / multipleNum;
};

/**
 * Multiplication for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} multiplication result
 */
var multiplication = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return ((a * multipleNum) * (b * multipleNum)) / (multipleNum * multipleNum);
};

/**
 * Division for floating point operation.
 * @param {number} a target a
 * @param {number} b target b
 * @returns {number} division result
 */
var division = function(a, b) {
    var multipleNum = findMultipleNum(a, b);
    return (a * multipleNum) / (b * multipleNum);
};

/**
 * Sum.
 * @param {array.<number>} values target values
 * @returns {number} result value
 */
var sum = function(values) {
    var copyArr = values.slice();
    copyArr.unshift(0);
    return tui.util.reduce(copyArr, function(base, add) {
        return parseFloat(base) + parseFloat(add);
    });
};


var properCase = function(str) {
    return str.substring(0, 1).toUpperCase() + str.substring(1);
};

tui.util.min = min;
tui.util.max = max;
tui.util.any = any;
tui.util.all = all;
tui.util.pivot = pivot;
tui.util.lengthAfterPoint = lengthAfterPoint;
tui.util.mod = mod;
tui.util.findMultipleNum = findMultipleNum;
tui.util.addition = addition;
tui.util.subtraction = subtraction;
tui.util.multiplication = multiplication;
tui.util.division = division;
tui.util.sum = sum;
tui.util.properCase = properCase;

var aps = Array.prototype.slice;

/**
 * Creates a debounced function that delays invoking fn until after delay milliseconds has elapsed
 * since the last time the debouced function was invoked.
 * @param {function} fn The function to debounce.
 * @param {number} [delay=0] The number of milliseconds to delay
 * @memberof tui.util
 * @returns {function} debounced function.
 * @example
 *
 * function someMethodToInvokeDebounced() {}
 *
 * var debounced = tui.util.debounce(someMethodToInvokeDebounced, 300);
 *
 * // invoke repeatedly
 * debounced();
 * debounced();
 * debounced();
 * debounced();
 * debounced();
 * debounced();    // last invoke of debounced()
 *
 * // invoke someMethodToInvokeDebounced() after 300 milliseconds.
 */
function debounce(fn, delay) {
    var timer,
        args;

    /* istanbul ignore next */
    delay = delay || 0;

    function debounced() {
        args = aps.call(arguments);

        window.clearTimeout(timer);
        timer = window.setTimeout(function() {
            fn.apply(null, args);
        }, delay);
    }

    return debounced;
}

/**
 * Creates a throttled function that only invokes fn at most once per every interval milliseconds.
 *
 * You can use this throttle short time repeatedly invoking functions. (e.g MouseMove, Resize ...)
 *
 * if you need reuse throttled method. you must remove slugs (e.g. flag variable) related with throttling.
 * @param {function} fn function to throttle
 * @param {number} [interval=0] the number of milliseconds to throttle invocations to.
 * @memberof tui.util
 * @returns {function} throttled function
 * @example
 *
 * function someMethodToInvokeThrottled() {}
 *
 * var throttled = tui.util.throttle(someMethodToInvokeThrottled, 300);
 *
 * // invoke repeatedly
 * throttled();    // invoke (leading)
 * throttled();
 * throttled();    // invoke (near 300 milliseconds)
 * throttled();
 * throttled();
 * throttled();    // invoke (near 600 milliseconds)
 * // ...
 * // invoke (trailing)
 *
 * // if you need reuse throttled method. then invoke reset()
 * throttled.reset();
 */
function throttle(fn, interval) {
    var base,
        _timestamp = tui.util.timestamp,
        debounced,
        isLeading = true,
        stamp,
        args,
        tick = function(_args) {
            fn.apply(null, _args);
            base = null;
        };

    /* istanbul ignore next */
    interval = interval || 0;

    debounced = tui.util.debounce(tick, interval);

    function throttled() {
        args = aps.call(arguments);

        if (isLeading) {
            tick(args);
            isLeading = false;
            return;
        }

        stamp = _timestamp();

        base = base || stamp;

        debounced(args);

        if ((stamp - base) >= interval) {
            tick(args);
        }
    }

    function reset() {
        isLeading = true;
        base = null;
    }

    throttled.reset = reset;
    return throttled;
}

tui.util.debounce = debounce;
tui.util.throttle = throttle;

},{}],15:[function(require,module,exports){
/**
 * @fileoverview Chart const
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

/**
 * Chart const
 * @readonly
 * @enum {number}
 */
var chartConst = {
    /** tui class names
     * @type {string}
     */
    CLASS_NAME_LEGEND: 'tui-chart-legend',
    /** @type {string} */
    CLASS_NAME_SERIES_LABEL: 'tui-chart-series-label',
    /** @type {string} */
    CLASS_NAME_SERIES_LEGEND: 'tui-chart-series-legend',
    /** chart types
     * @type {string}
     */
    CHART_TYPE_BAR: 'bar',
    /** @type {string} */
    CHART_TYPE_COLUMN: 'column',
    /** @type {string} */
    CHART_TYPE_LINE: 'line',
    /** @type {string} */
    CHART_TYPE_AREA: 'area',
    /** @type {string} */
    CHART_TYPE_COMBO: 'combo',
    /** @type {string} */
    CHART_TYPE_PIE: 'pie',
    /** chart padding */
    CHART_PADDING: 10,
    /** chart default width */
    CHART_DEFAULT_WIDTH: 500,
    /** chart default height */
    CHART_DEFAULT_HEIGHT: 400,
    /** hidden width */
    HIDDEN_WIDTH: 1,
    /** rendered text padding */
    TEXT_PADDING: 2,
    /** series expand size */
    SERIES_EXPAND_SIZE: 10,
    /** series label padding */
    SERIES_LABEL_PADDING: 5,
    /** default font size of title */
    DEFAULT_TITLE_FONT_SIZE: 14,
    /** default font size of axis title */
    DEFAULT_AXIS_TITLE_FONT_SIZE: 10,
    /** default font size of label */
    DEFAULT_LABEL_FONT_SIZE: 12,
    /** default font size of series label */
    DEFAULT_SERIES_LABEL_FONT_SIZE: 11,
    /** @type {string} */
    /** default graph plugin
     * @type {string}
     */
    DEFAULT_PLUGIN: 'raphael',
    /** default tick color
     * @type {string}
     */
    DEFAULT_TICK_COLOR: 'black',
    /** default theme name
     * @type {string}
     */
    DEFAULT_THEME_NAME: 'default',
    /** stacked option types
     * @type {string}
     */
    STACKED_NORMAL_TYPE: 'normal',
    /** @type {string} */
    STACKED_PERCENT_TYPE: 'percent',
    /** empty axis label */
    EMPTY_AXIS_LABEL: '',
    /** angel */
    ANGLE_85: 85,
    ANGLE_90: 90,
    ANGLE_360: 360,
    /** radian */
    RAD: Math.PI / 180,
    /** series legend types
     * @type {string}
     */
    LEGEND_ALIGN_OUTER: 'outer',
    /** @type {string} */
    LEGEND_TYPE_CENTER: 'center',
    /** series outer label padding */
    SERIES_OUTER_LABEL_PADDING: 20,
    /** default rate of pie graph */
    PIE_GRAPH_DEFAULT_RATE: 0.8,
    /** small rate of pie graph */
    PIE_GRAPH_SMALL_RATE: 0.65,
    /** dot radius */
    DOT_RADIUS: 4,
    /** yAxis properties
     * @type {array.<string>}
     */
    YAXIS_PROPS: ['tickColor', 'title', 'label'], // yaxis theme의 속성 - chart type filtering할 때 사용됨
    /** series properties
     * @type {array.<string>}
     */
    SERIES_PROPS: ['label', 'colors', 'borderColor', 'singleColors', 'selectionColor'], // series theme의 속성 - chart type filtering할 때 사용됨
    /** title area width padding */
    TITLE_AREA_WIDTH_PADDING: 20,
    /** top margin of x axis label */
    XAXIS_LABEL_TOP_MARGIN: 10,
    /** right padding of vertical label */
    V_LABEL_RIGHT_PADDING: 10,
    /** tooltip prefix
     * @type {string}
     */
    TOOLTIP_PREFIX: 'tui-chart-tooltip',
    /** minimum pixel type step size */
    MIN_PIXEL_TYPE_STEP_SIZE: 40,
    /** maximum pixel type step size */
    MAX_PIXEL_TYPE_STEP_SIZE: 60,
    /** tick info of percent stacked option
     * @type {object}
     */
    PERCENT_STACKED_TICK_INFO: {
        scale: {
            min: 0,
            max: 100
        },
        step: 25,
        tickCount: 5,
        labels: [0, 25, 50, 75, 100]
    },
    /** title add padding */
    TITLE_PADDING: 20,
    /** legend area padding */
    LEGEND_AREA_PADDING: 10,
    /** legend rect width */
    LEGEND_RECT_WIDTH: 12,
    /** lgend label left padding */
    LEGEND_LABEL_LEFT_PADDING: 5,
    /** AXIS LABEL PADDING */
    AXIS_LABEL_PADDING: 7,
    /** rotations degree candidates */
    DEGREE_CANDIDATES: [25, 45, 65, 85],
    /** xAxis label compare margin */
    XAXIS_LABEL_COMPARE_MARGIN: 20,
    /** xAxis label gutter */
    XAXIS_LABEL_GUTTER: 2,
    /** stand multiple nums of axis */
    AXIS_STANDARD_MULTIPLE_NUMS: [1, 2, 5, 10],
    /** label padding top */
    LABEL_PADDING_TOP: 2,
    /** line margin top */
    LINE_MARGIN_TOP: 5,
    /** tooltip gap */
    TOOLTIP_GAP: 5,
    /** tooltip direction
     * @type {string}
     */
    TOOLTIP_DIRECTION_FORWARD: 'forword',
    /** @type {string} */
    TOOLTIP_DIRECTION_CENTER: 'center',
    /** @type {string} */
    TOOLTIP_DIRECTION_BACKWARD: 'backword',
    /** tooltip align options
     * @type {string}
     */
    TOOLTIP_DEFAULT_ALIGN_OPTION: 'center top',
    /** @type {string} */
    TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION: 'right middle',
    /** @type {string} */
    TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION: 'right middle',
    /** @type {string} */
    TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION: 'center bottom',
    /** hide delay */
    HIDE_DELAY: 200
};
module.exports = chartConst;

},{}],16:[function(require,module,exports){
/**
 * @fileoverview AreaTypeCustomEvent is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    AreaTypeDataModel = require('./areaTypeDataModel'),
    chartConst = require('../const');

var AreaTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends AreaTypeCustomEvent.prototype */ {
    /**
     * AreaTypeCustomEvent is custom event for line type chart.
     * @param {object} params parameters
     * @constructs AreaTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function(params) {
        CustomEventBase.call(this, params);
    },

    /**
     * Initialize data of custom event
     * @param {array.<object>} seriesInfos series infos
     */
    initCustomEventData: function(seriesInfos) {
        var seriesInfo = seriesInfos[0];
        this.dataModel = new AreaTypeDataModel(seriesInfo);
        CustomEventBase.prototype.initCustomEventData.call(this, seriesInfos);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerX = e.clientX - chartConst.SERIES_EXPAND_SIZE - bound.left,
            layerY = e.clientY - bound.top,
            groupIndex = this.tickBaseDataModel.findIndex(layerX),
            foundData = this.dataModel.findData(groupIndex, layerY);

        if (!this._isChanged(this.prevFoundData, foundData)) {
            return;
        }

        if (foundData) {
            this.fire('showTooltip', foundData);
            this.prevFoundData = foundData;
        } else if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            delete this.prevFoundData;
        }
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMouseout: function() {
        if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            delete this.prevFoundData;
        }
    }
});

tui.util.CustomEvents.mixin(AreaTypeCustomEvent);

module.exports = AreaTypeCustomEvent;

},{"../const":15,"./areaTypeDataModel":17,"./customEventBase":18}],17:[function(require,module,exports){
/**
 * @fileoverview AreaTypeDataModel is data model for area type custom event.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var AreaTypeDataModel = tui.util.defineClass(/** @lends AreaTypeDataModel.prototype */ {
    /**
     * AreaTypeDataModel is data mode for area type custom event.
     * @constructs AreaTypeDataModel
     * @param {object} seriesInfo series info
     */
    init: function(seriesInfo) {
        this.data = this._makeData(seriesInfo.data.groupPositions, seriesInfo.chartType);
    },

    /**
     * To make area type data for custom event.
     * @param {array.<array.<group>>} groupPositions group positions
     * @param {string} chartType cahrt type
     * @returns {array} area type data for custom even
     * @private
     */
    _makeData: function(groupPositions, chartType) {
        groupPositions = tui.util.pivot(groupPositions);
        return tui.util.map(groupPositions, function(positions, groupIndex) {
            return tui.util.map(positions, function(position, index) {
                return {
                    chartType: chartType,
                    indexes: {
                        groupIndex: groupIndex,
                        index: index
                    },
                    bound: position
                };
            });
        });
    },

    /**
     * Find Data.
     * @param {number} groupIndex group index
     * @param {number} layerY mouse position
     * @returns {object} index
     */
    findData: function(groupIndex, layerY) {
        var result,
            min = 10000;
        tui.util.forEach(this.data[groupIndex], function(data) {
            var diff = Math.abs(layerY - data.bound.top);
            if (min > diff) {
                min = diff;
                result = data;
            }
        });
        return result;
    }
});

module.exports = AreaTypeDataModel;

},{}],18:[function(require,module,exports){
/**
 * @fileoverview CustomEventBase is base class for event handle layers.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var eventListener = require('../helpers/eventListener'),
    TickBaseDataModel = require('./tickBaseDataModel'),
    PointTypeDataModel = require('./pointTypeDataModel'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var CustomEventBase = tui.util.defineClass(/** @lends CustomEventBase.prototype */ {
    /**
     * CustomEventBase is base class for custom event components.
     * @constructs CustomEventBase
     * @param {object} params parameters
     *      @param {{
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      }} params.bound bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.isVertical whether vertical or not
     */
    init: function(params) {
        this.chartType = params.chartType;
        this.isVertical = params.isVertical;
    },

    /**
     * To render event handle layer area
     * @param {HTMLElement} elCoordinateArea coordinate area element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @param {object} data rendering data
     * @private
     */
    _renderCustomEventArea: function(elCoordinateArea, bound, data) {
        var expandedBound;
        this.bound = bound;
        this.tickBaseDataModel = new TickBaseDataModel(bound.dimension, data.tickCount, this.chartType, this.isVertical);
        expandedBound = renderUtil.expandBound(bound);
        renderUtil.renderDimension(elCoordinateArea, expandedBound.dimension);
        renderUtil.renderPosition(elCoordinateArea, expandedBound.position);
    },

    /**
     * To render event handle layer component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound of event handler layer
     * @param {object} data rendering data
     * @return {HTMLElement} coordinate area
     */
    render: function(bound, data) {
        var el = dom.create('DIV', 'tui-chart-series-custom-event-area');

        this._renderCustomEventArea(el, bound, data);
        this.attachEvent(el);
        this.elCoordinateArea = el;
        return el;
    },

    /**
     * Initialize data of custom event
     * @param {array.<object>} seriesInfos series infos
     */
    initCustomEventData: function(seriesInfos) {
        this.pointTypeDataModel = new PointTypeDataModel(seriesInfos);
    },

    /**
     * To resize event handle layer component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound bound for resizable
     * @param {{tickCount: number}} data data
     */
    resize: function(bound, data) {
        this._renderCustomEventArea(this.elCoordinateArea, bound, data);
    },

    /**
     * Whether changed or not.
     * @param {object} prev previous data
     * @param {object} cur current data
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChanged: function(prev, cur) {
        return !prev || !cur || prev.chartType !== cur.chartType ||
            prev.indexes.groupIndex !== cur.indexes.groupIndex || prev.indexes.index !== cur.indexes.index;
    },

    /**
     * Find point type data.
     * @param {HTMLElement} elTarget target element
     * @param {number} clientX mouse position x
     * @param {number} clientY mouse position y
     * @returns {object} found data
     * @private
     */
    _findPointTypeData: function(elTarget, clientX, clientY) {
        var bound = elTarget.getBoundingClientRect(),
            layerX = clientX - bound.left,
            layerY = clientY - bound.top,
            groupIndex = this.tickBaseDataModel.findIndex(this.isVertical ? layerX : layerY);
        return this.pointTypeDataModel.findData(groupIndex, layerX + chartConst.SERIES_EXPAND_SIZE, layerY);
    },

    /**
     * Unselect selected data.
     * @private
     */
    _unselectSelectedData: function() {
        var eventName = this.fire(renderUtil.makeCustomEventName('unselect', this.selectedData.chartType, 'series'), this.selectedData);
        this.fire(eventName, this.selectedData);
        delete this.selectedData;
    },

    /**
     * On click
     * @param {mouseevent} e mouse event
     */
    onClick: function(e) {
        var elTarget = e.target || e.srcElement,
            clientX = e.clientX - chartConst.SERIES_EXPAND_SIZE,
            foundData = this._findPointTypeData(elTarget, clientX, e.clientY);
        if (!this._isChanged(this.selectedData, foundData)) {
            this._unselectSelectedData();
            return;
        } else if (foundData) {
            if (this.selectedData) {
                this._unselectSelectedData();
            }
            this.fire(renderUtil.makeCustomEventName('select', foundData.chartType, 'series'), foundData);
            this.selectedData = foundData;
        }
    },

    /**
     * On mouse move
     * @abstract
     */
    onMousemove: function() {},

    /**
     * On mouse out
     * @abstract
     */
    onMouseout: function() {},

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        eventListener.bindEvent('click', el, tui.util.bind(this.onClick, this));
        eventListener.bindEvent('mousemove', el, tui.util.bind(this.onMousemove, this));
        eventListener.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(CustomEventBase);

module.exports = CustomEventBase;

},{"../const":15,"../helpers/domHandler":30,"../helpers/eventListener":31,"../helpers/renderUtil":33,"./pointTypeDataModel":21,"./tickBaseDataModel":22}],19:[function(require,module,exports){
/**
 * @fileoverview GroupTypeCustomEvent is event handle layer for grouped toolip option.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    chartConst = require('../const');

var GroupTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends GroupTypeCustomEvent.prototype */ {
    /**
     * GroupTypeCustomEvent is event handle layer for grouped toolip option.
     * @constructs GroupTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function() {
        CustomEventBase.apply(this, arguments);
    },

    /**
     * Get layer position.
     * @param {MouseEvent} e mouse event object
     * @param {{top: number, right: number, bottom: number, left: number}} bound bound
     * @param {boolean} isVertical whether vertical or not
     * @returns {number} layer position (left or top)
     * @private
     */
    _getLayerPositionValue: function(e, bound, isVertical) {
        var layerPosition;
        if (isVertical) {
            layerPosition = e.clientX - chartConst.SERIES_EXPAND_SIZE - bound.left;
        } else {
            layerPosition = e.clientY - bound.top;
        }
        return layerPosition;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerPositionValue = this._getLayerPositionValue(e, bound, this.isVertical),
            index = this.tickBaseDataModel.findIndex(layerPositionValue),
            prevIndex = this.prevIndex,
            sizeType = this.isVertical ? 'height' : 'width';

        if (index === -1) {
            this.onMouseout();
            return;
        }

        if (prevIndex === index) {
            return;
        }

        this.prevIndex = index;

        this.fire('showGroupTooltip', {
            index: index,
            range: this.tickBaseDataModel.makeRange(index, this.chartType),
            size: this.bound.dimension[sizeType],
            isVertical: this.isVertical
        });
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMouseout: function() {
        if (!tui.util.isUndefined(this.prevIndex)) {
            this.fire('hideGroupTooltip', this.prevIndex);
            delete this.prevIndex;
        }
    }
});

tui.util.CustomEvents.mixin(GroupTypeCustomEvent);

module.exports = GroupTypeCustomEvent;

},{"../const":15,"./customEventBase":18}],20:[function(require,module,exports){
/**
 * @fileoverview PointTypeCustomEven is event handle layer for line type chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    CustomEventBase = require('./customEventBase');

var PointTypeCustomEven = tui.util.defineClass(CustomEventBase, /** @lends PointTypeCustomEven.prototype */ {
    /**
     * PointTypeCustomEven is event handle layer for line type chart.
     * @constructs PointTypeCustomEven
     * @extends CustomEventBase
     */
    init: function() {
        CustomEventBase.apply(this, arguments);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            clientX = e.clientX - chartConst.SERIES_EXPAND_SIZE,
            foundData = this._findPointTypeData(elTarget, clientX, e.clientY);

        if (!this._isChanged(this.prevFoundData, foundData)) {
            return;
        }

        if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            delete this.prevFoundData;
        }

        if (foundData) {
            this.fire('showTooltip', foundData);
            this.prevFoundData = foundData;
        }
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMouseout: function() {
        if (this.prevFoundData) {
            this.fire('hideTooltip', this.prevFoundData);
            delete this.prevFoundData;
        }
    }
});

tui.util.CustomEvents.mixin(PointTypeCustomEven);

module.exports = PointTypeCustomEven;

},{"../const":15,"./customEventBase":18}],21:[function(require,module,exports){
/**
 * @fileoverview PointTypeDataModel is data mode for point type custom event.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('../helpers/predicate');

var PointTypeDataModel = tui.util.defineClass(/** @lends PointTypeDataModel.prototype */ {
    /**
     * PointTypeDataModel is data mode for point type custom event.
     * @constructs PointTypeDataModel
     * @param {array.<object>} seriesInfos series infos
     */
    init: function(seriesInfos) {
        this.data = this._makeData(seriesInfos);
    },

    /**
     * To make coordinate data about bar type graph
     * @param {array.<array.<object>>} groupBounds group bounds
     * @param {string} chartType chart type
     * @returns {array} coordinate data
     * @private
     */
    _makeRectTypeCoordinateData: function(groupBounds, chartType) {
        return tui.util.map(groupBounds, function(bounds, groupIndex) {
            return tui.util.map(bounds, function(_bound, index) {
                var bound;
                if (!_bound) {
                    return null;
                }

                bound = _bound.end;

                return {
                    sendData: {
                        chartType: chartType,
                        indexes: {
                            groupIndex: groupIndex,
                            index: index
                        },
                        allowNegativeTooltip: true,
                        bound: bound
                    },
                    bound: {
                        left: bound.left,
                        top: bound.top,
                        right: bound.left + bound.width,
                        bottom: bound.top + bound.height
                    }
                };
            });
        });
    },

    /**
     * To make coordinate data about dot type graph
     * @param {array.<array.<object>>} groupPositions group positions
     * @param {string} chartType chart type
     * @returns {array} coordinate data
     * @private
     */
    _makeDotTypeCoordinateData: function(groupPositions, chartType) {
        return tui.util.map(tui.util.pivot(groupPositions), function(positions, groupIndex) {
            return tui.util.map(positions, function(position, index) {
                return {
                    sendData: {
                        chartType: chartType,
                        indexes: {
                            groupIndex: groupIndex,
                            index: index
                        },
                        bound: position
                    },
                    bound: {
                        left: position.left - chartConst.DOT_RADIUS,
                        top: position.top - chartConst.DOT_RADIUS,
                        right: position.left + chartConst.DOT_RADIUS,
                        bottom: position.top + chartConst.DOT_RADIUS
                    }
                };
            });
        });
    },

    /**
     * To join data.
     * @param {array.<array.<array.<object>>>} groupData group data
     * @returns {array.<array.<object>>} joined data
     * @private
     */
    _joinData: function(groupData) {
        var results = [];
        tui.util.forEachArray(groupData, function(coordData) {
            tui.util.forEachArray(coordData, function(data, index) {
                if (!results[index]) {
                    results[index] = [];
                }
                results[index] = results[index].concat(data);
            });
        });

        return results;
    },

    /**
     * To make coordinate data.
     * @param {array.<object>} seriesInfos series infos
     * @returns {array.<array.<object>>} coordinate data
     * @private
     */
    _makeData: function(seriesInfos) {
        var coordinateData;
        seriesInfos.reverse();
        coordinateData = tui.util.map(seriesInfos, function(info) {
            var result;
            if (predicate.isLineTypeChart(info.chartType)) {
                result = this._makeDotTypeCoordinateData(info.data.groupPositions, info.chartType);
            } else {
                result = this._makeRectTypeCoordinateData(info.data.groupBounds, info.chartType);
            }
            return result;
        }, this);
        return this._joinData(coordinateData);
    },

    /**
     * Find tooltip data.
     * @param {number} groupIndex group index
     * @param {number} layerX mouse position x
     * @param {number} layerY mouse position y
     * @returns {object} tooltip data
     */
    findData: function(groupIndex, layerX, layerY) {
        var min = 10000,
            result = null,
            candidates;

        if (groupIndex === -1) {
            return result;
        }

        // layerX, layerY를 포함하는 data 추출
        candidates = tui.util.filter(this.data[groupIndex], function(data) {
            var bound = data && data.bound;
            return bound && bound.left <= layerX && bound.right >= layerX && bound.top <= layerY && bound.bottom >= layerY;
        });

        // 추출된 data 중 top이 layerY와 가장 가까운 data 찾아내기
        tui.util.forEachArray(candidates, function(data) {
            var diff = Math.abs(layerY - data.sendData.bound.top);
            if (min > diff) {
                min = diff;
                result = data.sendData;
            }
        });

        return result;
    }
});

module.exports = PointTypeDataModel;

},{"../const":15,"../helpers/predicate":32}],22:[function(require,module,exports){
/**
 * @fileoverview TickBaseDataModel is tick base data model.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate');

var TickBaseDataModel = tui.util.defineClass(/** @lends TickBaseDataModel.prototype */ {
    /**
     * TickBaseDataModel is tick base data model.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {string} chartType chart type
     * @param {boolan} isVertical whether vertical or not
     * @constructs TickBaseDataModel
     */
    init: function(dimension, tickCount, chartType, isVertical) {
        this.data = this._makeData(dimension, tickCount, chartType, isVertical);
    },

    /**
     * To make tick base data about line type chart.
     * @param {number} width width
     * @param {number} tickCount tick count
     * @returns {array} tick base data
     * @private
     */
    _makeLineTypeData: function(width, tickCount) {
        var tickInterval = width / (tickCount - 1),
            halfInterval = tickInterval / 2;
        return tui.util.map(tui.util.range(0, tickCount), function(index) {
            return {
                min: index * tickInterval - halfInterval,
                max: index * tickInterval + halfInterval
            };
        });
    },

    /**
     * To make tick base data about non line type chart.
     * @param {number} size width or height
     * @param {number} tickCount tick count
     * @returns {array} tick base data
     * @private
     */
    _makeNormalData: function(size, tickCount) {
        var len = tickCount - 1,
            tickInterval = size / len,
            prev = 0;
        return tui.util.map(tui.util.range(0, len), function(index) {
            var max = tui.util.min([size, (index + 1) * tickInterval]),
                scale = {
                    min: prev,
                    max: max
                };
            prev = max;
            return scale;
        });
    },

    /**
     * To make tick base data for custom event.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {string} chartType chart type
     * @param {boolan} isVertical whether vertical or not
     * @returns {array.<object>} tick base data
     * @private
     */
    _makeData: function(dimension, tickCount, chartType, isVertical) {
        var sizeType = isVertical ? 'width' : 'height',
            data;
        if (predicate.isLineTypeChart(chartType)) {
            data = this._makeLineTypeData(dimension[sizeType], tickCount);
        } else {
            data = this._makeNormalData(dimension[sizeType], tickCount);
        }

        return data;
    },

    /**
     * Find index.
     * @param {number} pointValue mouse position point value
     * @returns {number} group index
     */
    findIndex: function(pointValue) {
        var foundIndex = -1;
        tui.util.forEachArray(this.data, function(scale, index) {
            if (scale.min < pointValue && scale.max >= pointValue) {
                foundIndex = index;
                return false;
            }
        });

        return foundIndex;
    },

    /**
     * Get tick base data length.
     * @returns {number} length
     */
    getLength: function() {
        return this.data.length;
    },

    /**
     * To make range of tooltip position.
     * @param {number} index index
     * @param {string} chartType chart type
     * @returns {{start: number, end: number}} range type value
     * @private
     */
    makeRange: function(index, chartType) {
        var scale = this.data[index],
            range, center;
        if (predicate.isLineTypeChart(chartType)) {
            center = parseInt(scale.max - (scale.max - scale.min) / 2, 10);
            range = {
                start: center,
                end: center
            };
        } else {
            range = {
                start: scale.min,
                end: scale.max
            };
        }

        return range;
    }
});

module.exports = TickBaseDataModel;

},{"../helpers/predicate":32}],23:[function(require,module,exports){
/**
 * @fileoverview  Chart factory play role register chart.
 *                Also, you can get chart from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var charts = {},
    factory = {
        /**
         * Get chart instance.
         * @param {string} chartType chart type
         * @param {object} data chart data
         * @param {object} theme chart options
         * @param {object} options chart options
         * @returns {object} chart instance;
         */
        get: function(chartType, data, theme, options) {
            var Chart = charts[chartType],
                chart;

            if (!Chart) {
                throw new Error('Not exist ' + chartType + ' chart.');
            }

            chart = new Chart(data, theme, options);

            return chart;
        },

        /**
         * Register chart.
         * @param {string} chartType char type
         * @param {class} ChartClass chart class
         */
        register: function(chartType, ChartClass) {
            charts[chartType] = ChartClass;
        }
    };

module.exports = factory;

},{}],24:[function(require,module,exports){
/**
 * @fileoverview  Plugin factory play role register rendering plugin.
 *                Also, you can get plugin from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var plugins = {},
    factory = {
        /**
         * Get graph renderer.
         * @param {string} libType type of graph library
         * @param {string} chartType chart type
         * @returns {object} renderer instance
         */
        get: function(libType, chartType) {
            var plugin = plugins[libType],
                Renderer, renderer;

            if (!plugin) {
                throw new Error('Not exist ' + libType + ' plugin.');
            }

            Renderer = plugin[chartType];
            if (!Renderer) {
                throw new Error('Not exist ' + chartType + ' chart renderer.');
            }

            renderer = new Renderer();

            return renderer;
        },
        /**
         * Plugin register.
         * @param {string} libType type of graph library
         * @param {object} plugin plugin to control library
         */
        register: function(libType, plugin) {
            plugins[libType] = plugin;
        }
    };

module.exports = factory;

},{}],25:[function(require,module,exports){
/**
 * @fileoverview  Theme factory play role register theme.
 *                Also, you can get theme from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    defaultTheme = require('../themes/defaultTheme');

var themes = {};

module.exports = {
    /**
     * Get theme.
     * @param {string} themeName theme name
     * @returns {object} theme object
     */
    get: function(themeName) {
        var theme = themes[themeName];

        if (!theme) {
            throw new Error('Not exist ' + themeName + ' theme.');
        }

        return theme;
    },

    /**
     * Theme register.
     * @param {string} themeName theme name
     * @param {object} theme theme
     */
    register: function(themeName, theme) {
        var targetItems;
        theme = JSON.parse(JSON.stringify(theme));

        if (themeName !== chartConst.DEFAULT_THEME_NAME) {
            theme = this._initTheme(theme);
        }

        targetItems = this._getInheritTargetThemeItems(theme);

        this._inheritThemeFont(theme, targetItems);
        this._copyColorInfo(theme);
        themes[themeName] = theme;
    },

    /**
     * Init theme.
     * @param {object} theme theme
     * @returns {object} theme
     * @private
     * @ignore
     */
    _initTheme: function(theme) {
        var cloneTheme = JSON.parse(JSON.stringify(defaultTheme)),
            newTheme;

        this._concatDefaultColors(theme, cloneTheme.series.colors)
        newTheme = this._overwriteTheme(theme, cloneTheme);

        newTheme = this._copyProperty({
            propName: 'yAxis',
            fromTheme: theme,
            toTheme: newTheme,
            rejectionProps: chartConst.YAXIS_PROPS
        });

        newTheme = this._copyProperty({
            propName: 'series',
            fromTheme: theme,
            toTheme: newTheme,
            rejectionProps: chartConst.SERIES_PROPS
        });

        return newTheme;
    },

    /**
     * Filter chart types.
     * @param {object} target target charts
     * @param {array.<string>} rejectionProps reject property
     * @returns {Object} filtered charts.
     * @private
     */
    _filterChartTypes: function(target, rejectionProps) {
        var result;
        if (!target) {
            return [];
        }

        result = tui.util.filter(target, function(item, name) {
            return tui.util.inArray(name, rejectionProps) === -1;
        });
        return result;
    },

    /**
     * Concat colors.
     * @param {object} theme theme
     * @param {array.<string>} seriesColors series colors
     * @private
     */
    _concatColors: function(theme, seriesColors) {
        if (theme.colors) {
            theme.colors = theme.colors.concat(seriesColors);
        }

        if (theme.singleColors) {
            theme.singleColors = theme.singleColors.concat(seriesColors);
        }
    },

    /**
     * Concat default colors.
     * @param {object} theme theme
     * @param {array.<string>} seriesColors series colors
     * @private
     */
    _concatDefaultColors: function(theme, seriesColors) {
        var chartTypes;

        if (!theme.series) {
            return;
        }

        chartTypes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!tui.util.keys(chartTypes).length) {
            this._concatColors(theme.series, seriesColors);
        } else {
            tui.util.forEach(chartTypes, function(item) {
                this._concatColors(item, seriesColors);
            }, this);
        }
    },

    /**
     * Overwrite theme
     * @param {object} from from theme property
     * @param {object} to to theme property
     * @returns {object} result property
     * @private
     */
    _overwriteTheme: function(from, to) {
        tui.util.forEach(to, function(item, key) {
            var fromItem = from[key];
            if (!fromItem) {
                return;
            }

            if (tui.util.isArray(fromItem)) {
                to[key] = fromItem.slice();
            } else if (tui.util.isObject(fromItem)) {
                this._overwriteTheme(fromItem, item);
            } else {
                to[key] = fromItem;
            }
        }, this);

        return to;
    },

    /**
     * Copy property.
     * @param {object} params parameters
     *      @param {string} params.propName property name
     *      @param {object} params.fromTheme from property
     *      @param {object} params.toTheme tp property
     *      @param {array.<string>} params.rejectionProps reject property name
     * @returns {object} copied property
     * @private
     */
    _copyProperty: function(params) {
        var chartTypes;

        if (!params.toTheme[params.propName]) {
            return params.toTheme;
        }

        chartTypes = this._filterChartTypes(params.fromTheme[params.propName], params.rejectionProps);
        if (tui.util.keys(chartTypes).length) {
            tui.util.forEach(chartTypes, function(item, key) {
                var cloneTheme = JSON.parse(JSON.stringify(defaultTheme[params.propName]));
                params.fromTheme[params.propName][key] = this._overwriteTheme(item, cloneTheme);
            }, this);

            params.toTheme[params.propName] = params.fromTheme[params.propName];
        }

        return params.toTheme;
    },

    /**
     * Copy color info to legend
     * @param {object} seriesTheme series theme
     * @param {object} legendTheme legend theme
     * @param {array.<string>} colors colors
     * @private
     */
    _copyColorInfoToOther: function(seriesTheme, legendTheme, colors) {
        legendTheme.colors = colors || seriesTheme.colors;
        if (seriesTheme.singleColors) {
            legendTheme.singleColors = seriesTheme.singleColors;
        }
        if (seriesTheme.borderColor) {
            legendTheme.borderColor = seriesTheme.borderColor;
        }
        if (seriesTheme.selectionColor) {
            legendTheme.selectionColor = seriesTheme.selectionColor;
        }
    },

    /**
     * Get target items about font inherit.
     * @param {object} theme theme
     * @returns {array.<object>} target items
     * @private
     */
    _getInheritTargetThemeItems: function(theme) {
        var items = [
                theme.title,
                theme.xAxis.title,
                theme.xAxis.label,
                theme.legend.label
            ],
            yAxisChartTypeThems = this._filterChartTypes(theme.yAxis, chartConst.YAXIS_PROPS),
            seriesChartTypeThemes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!tui.util.keys(yAxisChartTypeThems).length) {
            items.push(theme.yAxis.title);
            items.push(theme.yAxis.label);
        } else {
            tui.util.forEach(yAxisChartTypeThems, function(chatTypeTheme) {
                items.push(chatTypeTheme.title);
                items.push(chatTypeTheme.label);
            });
        }

        if (!tui.util.keys(seriesChartTypeThemes).length) {
            items.push(theme.series.label);
        } else {
            tui.util.forEach(seriesChartTypeThemes, function(chatTypeTheme) {
                items.push(chatTypeTheme.label);
            });
        }
        return items;
    },

    /**
     * Inherit theme font.
     * @param {object} theme theme
     * @param {array.<object>} targetItems target theme items
     * @private
     */
    _inheritThemeFont: function(theme, targetItems) {
        var baseFont = theme.chart.fontFamily;

        tui.util.forEachArray(targetItems, function(item) {
            if (!item.fontFamily) {
                item.fontFamily = baseFont;
            }
        });
    },

    /**
     * Copy color info.
     * @param {object} theme theme
     * @private
     * @ignore
     */
    _copyColorInfo: function(theme) {
        var seriesChartTypes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);
        if (!tui.util.keys(seriesChartTypes).length) {
            this._copyColorInfoToOther(theme.series, theme.legend);
            this._copyColorInfoToOther(theme.series, theme.tooltip);
        } else {
            tui.util.forEach(seriesChartTypes, function(item, chartType) {
                theme.legend[chartType] = {};
                theme.tooltip[chartType] = {};
                this._copyColorInfoToOther(item, theme.legend[chartType], item.colors || theme.legend.colors);
                this._copyColorInfoToOther(item, theme.tooltip[chartType], item.colors || theme.tooltip.colors);
                delete theme.legend.colors;
                delete theme.tooltip.colors;
            }, this);
        }
    }
};

},{"../const":15,"../themes/defaultTheme":59}],26:[function(require,module,exports){
/**
 * @fileoverview Axis Data Maker
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('./predicate'),
    calculator = require('./calculator');

var abs = Math.abs,
    concat = Array.prototype.concat;

/**
 * Axis data maker.
 * @module axisDataMaker
 */
var axisDataMaker = {
    /**
     * To make labels.
     * @param {array.<string>} labels labels
     * @param {number} labelInterval label interval
     * @returns {array.<string>} labels
     * @private
     */
    _makeLabels: function(labels, labelInterval) {
        var lastIndex;
        if (!labelInterval) {
            return labels;
        }

        lastIndex = labels.length - 1;
        return tui.util.map(labels, function(label, index) {
            if (index > 0 && index < lastIndex && (index % labelInterval) > 0) {
                label = chartConst.EMPTY_AXIS_LABEL;
            }
            return label;
        });
    },

    /**
     * To make data about label axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {array.<string>} labels chart labels
     *      @param {boolean} isVertical whether vertical or not
     * @returns {{
     *      labels: array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      isVertical: boolean
     * }} axis data
     */
    makeLabelAxisData: function(params) {
        var tickCount = params.labels.length,
            options = params.options || {};
        if (!params.aligned) {
            tickCount += 1;
        }

        return {
            labels: this._makeLabels(params.labels, options.labelInterval),
            tickCount: tickCount,
            validTickCount: 0,
            isLabelAxis: true,
            isVertical: !!params.isVertical,
            aligned: !!params.aligned
        };
    },

    /**
     * To make data about value axis.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {array.<array.<number>>} params.values chart values
     *      @param {{width:number, height:number}} params.seriesDimension series dimension
     *      @param {array.<function>} params.formatFunctions format functions
     *      @param {string} params.stacked stacked option
     *      @param {string} params.options axis options
     * @returns {{
     *      labels: array.<string>,
     *      tickCount: number,
     *      validTickCount: number,
     *      isLabelAxis: boolean,
     *      scale: {min: number, max: number},
     *      isVertical: boolean
     * }} axis data
     */
    makeValueAxisData: function(params) {
        var options = params.options || {},
            isVertical = !!params.isVertical,
            isPositionRight = !!params.isPositionRight,
            formatFunctions = params.formatFunctions,
            tickInfo;
        if (params.stacked === 'percent') {
            tickInfo = chartConst.PERCENT_STACKED_TICK_INFO;
            formatFunctions = [];
        } else {
            tickInfo = this._getTickInfo({
                values: this._makeBaseValues(params.values, params.stacked),
                seriesDimension: params.seriesDimension,
                isVertical: isVertical,
                isPositionRight: isPositionRight,
                chartType: params.chartType
            }, options);
        }

        return {
            labels: this.formatLabels(tickInfo.labels, formatFunctions),
            tickCount: tickInfo.tickCount,
            validTickCount: tickInfo.tickCount,
            scale: tickInfo.scale,
            step: tickInfo.step,
            isVertical: isVertical,
            isPositionRight: isPositionRight,
            aligned: !!params.aligned
        };
    },

    /**
     * To make base values.
     * @memberOf module:axisDataMaker
     * @param {array.<number>} groupValues group values
     * @param {string} stacked stacked option.
     * @returns {array.<number>} base values
     * @private
     */
    _makeBaseValues: function(groupValues, stacked) {
        var baseValues = concat.apply([], groupValues); // flatten array
        if (stacked === chartConst.STACKED_NORMAL_TYPE) {
            baseValues = baseValues.concat(tui.util.map(groupValues, function(values) {
                var plusValues = tui.util.filter(values, function(value) {
                    return value > 0;
                });
                return tui.util.sum(plusValues);
            }));
        }
        return baseValues;
    },

    /**
     * Get base size for get candidate tick counts.
     * @memberOf module:axisDataMaker
     * @param {{width: number, height: number}} dimension chat dimension
     * @param {boolean} isVertical whether vertical or not
     * @returns {number} base size
     * @private
     */
    _getBaseSize: function(dimension, isVertical) {
        var baseSize;
        if (isVertical) {
            baseSize = dimension.height;
        } else {
            baseSize = dimension.width;
        }
        return baseSize;
    },

    /**
     * Get candidate tick counts.
     * @memberOf module:axisDataMaker
     * @param {{width: number, height: number}} chartDimension chat dimension
     * @param {boolean} isVertical whether vertical or not
     * @returns {array.<number>} tick counts
     * @private
     */
    _getCandidateTickCounts: function(chartDimension, isVertical) {
        var baseSize = this._getBaseSize(chartDimension, isVertical),
            start = tui.util.max([3, parseInt(baseSize / chartConst.MAX_PIXEL_TYPE_STEP_SIZE, 10)]),
            end = tui.util.max([start, parseInt(baseSize / chartConst.MIN_PIXEL_TYPE_STEP_SIZE, 10)]) + 1,
            tickCounts = tui.util.range(start, end);
        return tickCounts;
    },

    /**
     * Get comparing value.
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{scale: {min: number, max: number}, step: number}} tickInfo tick info
     * @returns {number} comparing value
     * @private
     */
    _getComparingValue: function(min, max, tickInfo) {
        var diffMax = abs(tickInfo.scale.max - max),
            diffMin = abs(min - tickInfo.scale.min),
            weight = Math.pow(10, tui.util.lengthAfterPoint(tickInfo.step));
        return (diffMax + diffMin) * weight;
    },

    /**
     * Select tick info.
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {array.<object>} candidates tick info candidates
     * @returns {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} selected tick info
     * @private
     */
    _selectTickInfo: function(min, max, candidates) {
        var getComparingValue = tui.util.bind(this._getComparingValue, this, min, max),
            tickInfo = tui.util.min(candidates, getComparingValue);
        return tickInfo;
    },

    /**
     * Get tick count and scale.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.values base values
     *      @param {{width: number, height: number}} params.seriesDimension chat dimension
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {string} params.chartType chat type
     * @param {{min: number, max:number}} options axis options
     * @returns {{tickCount: number, scale: object}} tick info
     * @private
     */
    _getTickInfo: function(params, options) {
        var min = tui.util.min(params.values),
            max = tui.util.max(params.values),
            intTypeInfo, tickCounts, candidates, tickInfo;
        // 01. min, max, options 정보를 정수형으로 변경
        intTypeInfo = this._makeIntegerTypeInfo(min, max, options);

        // 02. tick count 후보군 얻기
        tickCounts = params.tickCount ? [params.tickCount] : this._getCandidateTickCounts(params.seriesDimension, params.isVertical);

        // 03. tick info 후보군 계산
        candidates = this._getCandidateTickInfos({
            min: intTypeInfo.min,
            max: intTypeInfo.max,
            tickCounts: tickCounts,
            chartType: params.chartType
        }, intTypeInfo.options);

        // 04. tick info 후보군 중 하나 선택
        tickInfo = this._selectTickInfo(intTypeInfo.min, intTypeInfo.max, candidates);

        // 05. 정수형으로 변경했던 tick info를 원래 형태로 변경
        tickInfo = this._revertOriginalTypeTickInfo(tickInfo, intTypeInfo.divideNum);
        return tickInfo;
    },

    /**
     * To make integer type info
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number, options: {min: number, max: number}, divideNum: number}} integer type info
     * @private
     */
    _makeIntegerTypeInfo: function(min, max, options) {
        var multipleNum, changedOptions;

        if (abs(min) >= 1 || abs(max) >= 1) {
            return {
                min: min,
                max: max,
                options: options,
                divideNum: 1
            };
        }

        multipleNum = tui.util.findMultipleNum(min, max);
        changedOptions = {};

        if (!tui.util.isUndefined(options.min)) {
            changedOptions.min = options.min * multipleNum;
        }

        if (!tui.util.isUndefined(options.max)) {
            changedOptions.max = options.max * multipleNum;
        }

        return {
            min: min * multipleNum,
            max: max * multipleNum,
            options: changedOptions,
            divideNum: multipleNum
        };
    },

    /**
     * Revert tick info to original type.
     * @memberOf module:axisDataMaker
     * @param {{step: number, scale: {min: number, max: number}, labels: array.<number>}} tickInfo tick info
     * @param {number} divideNum divide num
     * @returns {{step: number, scale: {min: number, max: number}, labels: array.<number>}} divided tick info
     * @private
     */
    _revertOriginalTypeTickInfo: function(tickInfo, divideNum) {
        if (divideNum === 1) {
            return tickInfo;
        }

        tickInfo.step = tui.util.division(tickInfo.step, divideNum);
        tickInfo.scale.min = tui.util.division(tickInfo.scale.min, divideNum);
        tickInfo.scale.max = tui.util.division(tickInfo.scale.max, divideNum);
        tickInfo.labels = tui.util.map(tickInfo.labels, function(label) {
            return tui.util.division(label, divideNum);
        });

        return tickInfo;
    },

    /**
     * Normalize step.
     * @memberOf module:axisDataMaker
     * @param {number} step original step
     * @returns {number} normalized step
     * @private
     */
    _normalizeStep: function(step) {
        return calculator.normalizeAxisNumber(step);
    },

    /**
     * To minimize tick scale.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.userMin user min
     *      @param {number} params.userMax user max
     *      @param {{tickCount: number, scale: object}} params.tickInfo tick info
     *      @param {{min: number, max:number}} params.options axis options
     * @returns {{tickCount: number, scale: object, labels: array}} corrected tick info
     * @private
     */
    _minimizeTickScale: function(params) {
        var tickInfo = params.tickInfo,
            ticks = tui.util.range(1, tickInfo.tickCount),
            options = params.options,
            step = tickInfo.step,
            scale = tickInfo.scale,
            tickMax = scale.max,
            tickMin = scale.min,
            isUndefinedMin = tui.util.isUndefined(options.min),
            isUndefinedMax = tui.util.isUndefined(options.max),
            labels;
        tui.util.forEachArray(ticks, function(tickIndex) {
            var curStep = (step * tickIndex),
                curMin = tickMin + curStep,
                curMax = tickMax - curStep;

            // 더이상 변경이 필요 없을 경우
            if (params.userMin <= curMin && params.userMax >= curMax) {
                return false;
            }

            // min 값에 변경 여유가 있을 경우
            if ((isUndefinedMin && params.userMin > curMin) ||
                (!isUndefinedMin && options.min >= curMin)) {
                scale.min = curMin;
            }

            // max 값에 변경 여유가 있을 경우
            if ((isUndefinedMin && params.userMax < curMax) ||
                (!isUndefinedMax && options.max <= curMax)) {
                scale.max = curMax;
            }
        });

        labels = calculator.makeLabelsFromScale(scale, step);
        tickInfo.labels = labels;
        tickInfo.step = step;
        tickInfo.tickCount = labels.length;
        return tickInfo;
    },

    /**
     * To divide tick step.
     * @memberOf module:axisDataMaker
     * @param {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} tickInfo tick info
     * @param {number} orgTickCount original tickCount
     * @returns {{scale: {min: number, max: number}, tickCount: number, step: number, labels: array.<number>}} tick info
     * @private
     */
    _divideTickStep: function(tickInfo, orgTickCount) {
        var step = tickInfo.step,
            scale = tickInfo.scale,
            tickCount = tickInfo.tickCount;
        // step 2의 배수 이면서 변경된 tickCount의 두배수-1이 tickCount보다 orgTickCount와 차이가 덜나거나 같으면 step을 반으로 변경한다.
        if ((step % 2 === 0) &&
            abs(orgTickCount - ((tickCount * 2) - 1)) <= abs(orgTickCount - tickCount)) {
            step = step / 2;
            tickInfo.labels = calculator.makeLabelsFromScale(scale, step);
            tickInfo.tickCount = tickInfo.labels.length;
            tickInfo.step = step;
        }
        return tickInfo;
    },

    /**
     * To make tick info
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.tickCount tick count
     *      @param {number} params.min scale min
     *      @param {number} params.max scale max
     *      @param {number} params.userMin minimum value of user data
     *      @param {number} params.userMax maximum value of user data
     *      @param {boolean} params.isMinus whether scale is minus or not
     *      @param {string} params.chartType chart type
     *      @param {{min: number, max: number}} params.options axis options
     * @returns {{
     *      scale: {min: number, max: number},
     *      tickCount: number,
     *      step: number,
     *      labels: array.<number>
     * }} tick info
     * @private
     */
    _makeTickInfo: function(params) {
        var scale = params.scale,
            step, tickInfo;

        // 01. 기본 scale 정보로 step 얻기
        step = calculator.getScaleStep(scale, params.tickCount);

        // 02. step 정규화 시키기 (ex: 0.3 --> 0.5, 7 --> 10)
        step = this._normalizeStep(step);

        // 03. scale 정규화 시키기
        scale = this._normalizeScale(scale, step, params.tickCount);

        // 04. line차트의 경우 사용자의 min값이 scale의 min값과 같을 경우, min값을 1 step 감소 시킴
        scale.min = this._addMinPadding({
            min: scale.min,
            step: step,
            userMin: params.userMin,
            minOption: params.options.min,
            chartType: params.chartType
        });

        // 04. 사용자의 max값이 scael max와 같을 경우, max값을 1 step 증가 시킴
        scale.max = this._addMaxPadding({
            max: scale.max,
            step: step,
            userMax: params.userMax,
            maxOption: params.options.max,
            chartType: params.chartType
        });

        // 05. axis scale이 사용자 min, max와 거리가 멀 경우 조절
        tickInfo = this._minimizeTickScale({
            userMin: params.userMin,
            userMax: params.userMax,
            tickInfo: {scale: scale, step: step, tickCount: params.tickCount},
            options: params.options
        });

        tickInfo = this._divideTickStep(tickInfo, params.tickCount);
        return tickInfo;
    },

    /**
     * Add scale min padding.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @prams {number} params.min scale min
     *      @param {number} params.userMin minimum value of user data
     *      @param {number} params.minOption min option
     *      @param {number} params.step tick step
     * @returns {number} scale min
     * @private
     */
    _addMinPadding: function(params) {
        var min = params.min;

        if ((!predicate.isLineChart(params.chartType) && params.userMin >= 0) || !tui.util.isUndefined(params.minOption)) {
            return min;
        }
        // normalize된 scale min값이 user min값과 같을 경우 step 감소
        if (params.min === params.userMin) {
            min -= params.step;
        }
        return min;
    },

    /**
     * Add scale max padding.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @prams {number} params.max scale max
     *      @param {number} params.userMax maximum value of user data
     *      @param {number} params.maxOption max option
     *      @param {number} params.step tick step
     * @returns {number} scale max
     * @private
     */
    _addMaxPadding: function(params) {
        var max = params.max;

        if ((!predicate.isLineChart(params.chartType) && params.userMax <= 0) || !tui.util.isUndefined(params.maxOption)) {
            return max;
        }

        // normalize된 scale max값이 user max값과 같을 경우 step 증가
        if (tui.util.isUndefined(params.maxOption) && (params.max === params.userMax)) {
            max += params.step;
        }
        return max;
    },

    /**
     * To normalize min.
     * @memberOf module:axisDataMaker
     * @param {number} min original min
     * @param {number} step tick step
     * @returns {number} normalized min
     * @private
     */
    _normalizeMin: function(min, step) {
        var mod = tui.util.mod(min, step),
            normalized;

        if (mod === 0) {
            normalized = min;
        } else {
            normalized = tui.util.subtraction(min, (min >= 0 ? mod : step + mod));
        }
        return normalized;
    },

    /**
     * To make normalized max.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} scale scale
     * @param {number} step tick step
     * @param {number} tickCount tick count
     * @returns {number} normalized max
     * @private
     */
    _makeNormalizedMax: function(scale, step, tickCount) {
        var minMaxDiff = tui.util.multiplication(step, tickCount - 1),
            normalizedMax = tui.util.addition(scale.min, minMaxDiff),
            maxDiff = scale.max - normalizedMax,
            modDiff, divideDiff;
        // normalize된 max값이 원래의 max값 보다 작을 경우 step을 증가시켜 큰 값으로 만들기
        if (maxDiff > 0) {
            modDiff = maxDiff % step;
            divideDiff = Math.floor(maxDiff / step);
            normalizedMax += step * (modDiff > 0 ? divideDiff + 1 : divideDiff);
        }
        return normalizedMax;
    },

    /**
     * To normalize scale.
     * @memberOf module:axisDataMaker
     * @param {{min: number, max: number}} scale base scale
     * @param {number} step tick step
     * @param {number} tickCount tick count
     * @returns {{min: number, max: number}} normalized scale
     * @private
     */
    _normalizeScale: function(scale, step, tickCount) {
        scale.min = this._normalizeMin(scale.min, step);
        scale.max = this._makeNormalizedMax(scale, step, tickCount);
        return scale;
    },

    /**
     * Get candidates about tick info.
     * @memberOf module:axisDataMaker
     * @param {object} params parameters
     *      @param {number} params.min minimum value of user data
     *      @param {number} params.max maximum value of user data
     *      @param {array.<number>} params.tickCounts tick counts
     *      @param {string} params.chartType chart type
     * @param {{min: number, max:number}} options axis options
     * @returns {array} candidates about tick info
     * @private
     */
    _getCandidateTickInfos: function(params, options) {
        var userMin = params.min,
            userMax = params.max,
            min = params.min,
            max = params.max,
            scale, candidates;

        // min, max만으로 기본 scale 얻기
        scale = this._makeBaseScale(min, max, options);

        candidates = tui.util.map(params.tickCounts, function(tickCount) {
            return this._makeTickInfo({
                tickCount: tickCount,
                scale: tui.util.extend({}, scale),
                userMin: userMin,
                userMax: userMax,
                chartType: params.chartType,
                options: options
            });
        }, this);
        return candidates;
    },

    /**
     * To make base scale
     * @memberOf module:axisDataMaker
     * @param {number} min minimum value of user data
     * @param {number} max maximum value of user data
     * @param {{min: number, max: number}} options axis options
     * @returns {{min: number, max: number}} base scale
     * @private
     */
    _makeBaseScale: function(min, max, options) {
        var isMinus = false,
            tmpMin, scale;

        if (min < 0 && max <= 0) {
            isMinus = true;
            tmpMin = min;
            min = -max;
            max = -tmpMin;
        }

        scale = calculator.calculateScale(min, max);

        if (isMinus) {
            tmpMin = scale.min;
            scale.min = -scale.max;
            scale.max = -tmpMin;
        }

        scale.min = !tui.util.isUndefined(options.min) ? options.min : scale.min;
        scale.max = !tui.util.isUndefined(options.max) ? options.max : scale.max;

        return scale;
    },

    /**
     * Format labels.
     * @memberOf module:axisDataMaker
     * @param {string[]} labels target labels
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted labels
     */
    formatLabels: function(labels, formatFunctions) {
        var result;
        if (!formatFunctions || !formatFunctions.length) {
            return labels;
        }
        result = tui.util.map(labels, function(label) {
            var fns = concat.apply([label], formatFunctions);
            return tui.util.reduce(fns, function(stored, fn) {
                return fn(stored);
            });
        });
        return result;
    }
};

module.exports = axisDataMaker;

},{"../const":15,"./calculator":28,"./predicate":32}],27:[function(require,module,exports){
/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    calculator = require('./calculator'),
    predicate = require('./predicate'),
    renderUtil = require('./renderUtil');

var concat = Array.prototype.concat;

/**
 * Bounds maker.
 * @module boundsMaker
 */
var boundsMaker = {
    /**
     * Get max label of value axis.
     * @memberOf module:boundsMaker
     * @param {object} convertedData convert data
     * @param {string} chartType chart type
     * @returns {number|string} max label
     * @private
     */
    _getValueAxisMaxLabel: function(convertedData, chartType) {
        var values = chartType && convertedData.values[chartType] || convertedData.joinValues,
            formatFunctions = convertedData.formatFunctions,
            flattenValues = concat.apply([], values),
            min = tui.util.min(flattenValues),
            max = tui.util.max(flattenValues),
            scale = calculator.calculateScale(min, max),
            minLabel = calculator.normalizeAxisNumber(scale.min),
            maxLabel = calculator.normalizeAxisNumber(scale.max),
            fns = formatFunctions && formatFunctions.slice() || [];
        maxLabel = (minLabel + '').length > (maxLabel + '').length ? minLabel : maxLabel;
        fns.unshift(maxLabel);
        maxLabel = tui.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });
        return maxLabel;
    },

    /**
     * Get height of x axis area.
     * @memberOf module:boundsMaker
     * @param {object} options x axis options,
     * @param {array.<string>} labels axis labels
     * @param {object} theme axis theme
     * @returns {number} height
     * @private
     */
    _getXAxisHeight: function(options, labels, theme) {
        var title = options && options.title,
            titleAreaHeight = renderUtil.getRenderedLabelHeight(title, theme.title) + chartConst.TITLE_PADDING,
            height = renderUtil.getRenderedLabelsMaxHeight(labels, theme.label) + titleAreaHeight;
        return height;
    },

    /**
     * Get width about y axis.
     * @param {object} options y axis options
     * @param {array.<string>} labels labels
     * @param {object} theme yAxis theme
     * @param {number} index options index
     * @returns {number} y axis width
     * @private
     */
    _getYAxisWidth: function(options, labels, theme, index) {
        var title = '',
            titleAreaWidth, width;

        if (options) {
            options = [].concat(options);
            title = options[index || 0].title;
        }

        titleAreaWidth = renderUtil.getRenderedLabelHeight(title, theme.title) + chartConst.TITLE_PADDING;
        width = renderUtil.getRenderedLabelsMaxWidth(labels, theme.label) + titleAreaWidth + chartConst.AXIS_LABEL_PADDING;

        return width;
    },

    /**
     * Get width about y right axis.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {array.<string>} params.chartTypes y axis chart types
     *      @param {object} params.theme y axis theme
     *      @param {object} params.options y axis options
     * @returns {number} y right axis width
     * @private
     */
    _getYRAxisWidth: function(params) {
        var chartTypes = params.chartTypes || [],
            len = chartTypes.length,
            width = 0,
            index, chartType, theme, label;
        if (len > 0) {
            index = len - 1;
            chartType = chartTypes[index];
            theme = params.theme[chartType] || params.theme;
            label = this._getValueAxisMaxLabel(params.convertedData, chartType);
            width = this._getYAxisWidth(params.options, [label], theme, index);
        }
        return width;
    },

    /**
     * To make axes dimension.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertedData converted data
     *      @param {object} params.theme chart theme
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {object} params.options chart options
     *      *      @param {object} params.axesLabelInfo axes label info
     * @returns {{
     *      yAxis: {width: number},
     *      yrAxis: {width: number},
     *      xAxis: {height: number}
     * }} axes dimension
     * @private
     */
    _makeAxesDimension: function(params) {
        var yAxisWidth = 0,
            xAxisHeight = 0,
            yrAxisWidth = 0,
            axesLabelInfo, chartType;

        // axis 영역이 필요 있는 경우에만 처리
        if (params.hasAxes) {
            axesLabelInfo = params.axesLabelInfo;
            chartType = params.optionChartTypes && params.optionChartTypes[0] || '';
            yAxisWidth = this._getYAxisWidth(params.options.yAxis, axesLabelInfo.yAxis, params.theme.yAxis[chartType] || params.theme.yAxis);
            xAxisHeight = this._getXAxisHeight(params.options.xAxis, axesLabelInfo.xAxis, params.theme.xAxis);
            yrAxisWidth = this._getYRAxisWidth({
                convertedData: params.convertedData,
                chartTypes: params.optionChartTypes,
                theme: params.theme.yAxis,
                options: params.options.yAxis
            });
        }

        return {
            yAxis: {
                width: yAxisWidth
            },
            yrAxis: {
                width: yrAxisWidth
            },
            xAxis: {
                height: xAxisHeight
            }
        };
    },

    /**
     * Whether skipped legend sizing or not.
     * @param {string} chartType chart type
     * @param {?object} options legend options
     * @returns {boolean} result boolean
     * @private
     */
    _isSkippedLegendSizing: function(chartType, options) {
        return (predicate.isPieChart(chartType) && predicate.isPieLegendAlign(options.align)) || options.hidden;
    },

    /**
     * To make legend dimension.
     * @memberOf module:boundsMaker
     * @param {array.<string>} joinLegendLabels legend labels
     * @param {object} labelTheme label theme
     * @param {string} chartType chart type
     * @param {object} legendOptions series option
     * @returns {{width: number}} legend dimension
     * @private
     */
    _makeLegendDimension: function(joinLegendLabels, labelTheme, chartType, legendOptions) {
        var legendWidth = 0,
            legendLabels, maxLabelWidth;

        legendOptions = legendOptions || {};

        if (!this._isSkippedLegendSizing(chartType, legendOptions)) {
            legendLabels = tui.util.map(joinLegendLabels, function(item) {
                return item.label;
            });
            maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(legendLabels, labelTheme);
            legendWidth = maxLabelWidth + chartConst.LEGEND_RECT_WIDTH +
                chartConst.LEGEND_LABEL_LEFT_PADDING + (chartConst.LEGEND_AREA_PADDING * 2);
        }

        return {
            width: legendWidth
        };
    },

    /**
     * To make series dimension.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {{width: number, height: number}} params.chartDimension chart dimension
     *      @param {{
     *          yAxis: {width: number, height:number},
     *          xAxis: {width: number, height:number},
     *          yrAxis: {width: number, height:number}
     *      }} params.axesDimension axes dimension
     *      @param {number} params.legendWidth legend width
     *      @param {number} params.titleHeight title height
     * @returns {{width: number, height: number}} series dimension
     * @private
     */
    _makeSeriesDimension: function(params) {
        var axesDimension = params.axesDimension,
            rightAreaWidth = params.legendWidth + axesDimension.yrAxis.width,
            width = params.chartDimension.width - (chartConst.CHART_PADDING * 2) - axesDimension.yAxis.width - rightAreaWidth,
            height = params.chartDimension.height - (chartConst.CHART_PADDING * 2) - params.titleHeight - axesDimension.xAxis.height;

        return {
            width: width,
            height: height
        };
    },

    /**
     * To make chart dimension.
     * @param {{width: number, height: number}} chartOptions chart options
     * @returns {{width: (number), height: (number)}} chart dimension
     * @private
     */
    _makeChartDimension: function(chartOptions) {
        return {
            width: chartOptions.width || chartConst.CHART_DEFAULT_WIDTH,
            height: chartOptions.height || chartConst.CHART_DEFAULT_HEIGHT
        };
    },

    /**
     * To make title dimension
     * @param {{title: string}} option title option
     * @param {{fontFamily: string, fontSize: number}} theme title theme
     * @returns {{height: number}} title dimension
     * @private
     */
    _makeTitleDimension: function(option, theme) {
        return {
            height: renderUtil.getRenderedLabelHeight(option, theme) + chartConst.TITLE_PADDING
        };
    },

    /**
     * To make plot dimention
     * @param {{width: number, height: number}} seriesDimension series dimension
     * @returns {{width: number, height: number}} plot dimension
     * @private
     */
    _makePlotDimension: function(seriesDimension) {
        return {
            width: seriesDimension.width + chartConst.HIDDEN_WIDTH,
            height: seriesDimension.height + chartConst.HIDDEN_WIDTH
        };
    },

    /**
     * Get components dimension
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertedData converted data
     *      @param {object} params.theme chart theme
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {object} params.options chart options
     *      @param {object} params.axesLabelInfo axes label info
     * @returns {Object} components dimensions
     * @private
     */
    _getComponentsDimensions: function(params) {
        var chartOptions = params.options.chart || {},
            chartDimension = this._makeChartDimension(chartOptions),
            titleDimension = this._makeTitleDimension(chartOptions.title, params.theme.title),
            axesDimension = this._makeAxesDimension(params),
            legendDimension = this._makeLegendDimension(params.convertedData.joinLegendLabels, params.theme.legend.label, params.options.chartType, params.options.legend),
            seriesDimension = this._makeSeriesDimension({
                chartDimension: chartDimension,
                axesDimension: axesDimension,
                legendWidth: legendDimension.width,
                titleHeight: titleDimension.height
            });

        return tui.util.extend({
            chart: chartDimension,
            title: titleDimension,
            series: seriesDimension,
            plot: this._makePlotDimension(seriesDimension),
            legend: legendDimension
        }, axesDimension);
    },

    /**
     * To make basic bound.
     * @param {{width: number, height: number}} dimension series dimension.
     * @param {number} top top
     * @param {number} left left
     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} series bound.
     * @private
     */
    _makeBasicBound: function(dimension, top, left) {
        return {
            dimension: dimension,
            position: {
                top: top,
                left: left
            }
        };
    },

    /**
     * To make yAxis bound.
     * @param {{yAxis: {width: number}, plot: {height: number}}} dimensions dimensions
     * @param {number} top top
     * @returns {{dimension: {width: number, height: (number)}, position: {top: number, left: number}}} yAxis bound
     * @private
     */
    _makeYAxisBound: function(dimensions, top) {
        return {
            dimension: {
                width: dimensions.yAxis.width,
                height: dimensions.plot.height
            },
            position: {
                top: top,
                left: this.chartLeftPadding
            }
        };
    },

    /**
     * To make xAxis bound.
     * @param {{xAxis: {height: number}, plot: {width: number}}} dimensions dimensions
     * @param {number} top top
     * @param {number} left left
     * @param {{degree: number}} rotationInfo rotation info
     * @returns {{dimension: {width: number, height: (number)}, position: {top: number, left: number}}} xAxis bound
     * @private
     */
    _makeXAxisBound: function(dimensions, top, left, rotationInfo) {
        var bound = {
            dimension: {
                width: dimensions.plot.width,
                height: dimensions.xAxis.height
            },
            position: {
                top: top + dimensions.series.height,
                left: left - chartConst.HIDDEN_WIDTH
            }
        };

        if (rotationInfo) {
            bound.degree = rotationInfo.degree;
        }

        return bound;
    },

    /**
     * To make yrAxis bound.
     * @param {{yrAxis: {width: number}, plot: {height: number}, legend: {width: number}}} dimensions dimensions
     * @param {number} top top
     * @returns {{dimension: {width: number, height: (number)}, position: {top: number, left: number}}} yrAxis bound
     * @private
     */
    _makeYRAxisBound: function(dimensions, top) {
        return {
            dimension: {
                width: dimensions.yrAxis.width,
                height: dimensions.plot.height
            },
            position: {
                top: top,
                right: dimensions.legend.width + chartConst.HIDDEN_WIDTH + chartConst.CHART_PADDING
            }
        };
    },

    /**
     * To make axes bounds.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {boolean} params.hasAxes whether has axed or not
     *      @param {array.<string>} params.optionChartTypes y axis chart types
     *      @param {{width: number, height: number}} params.dimension chart dimension
     *      @param {number} params.top top position
     *      @param {number} params.right right position
     *      @param {{degree: number}} params.rotationInfo rotation info
     * @returns {object} axes bounds
     * @private
     */
    _makeAxesBounds: function(params) {
        var bounds;

        // pie차트와 같이 axis 영역이 필요 없는 경우에는 빈 값을 반환 함
        if (!params.hasAxes) {
            return {};
        }

        bounds = {
            plot: this._makeBasicBound(params.dimensions.plot, params.top, params.left - chartConst.HIDDEN_WIDTH),
            yAxis: this._makeYAxisBound(params.dimensions, params.top),
            xAxis: this._makeXAxisBound(params.dimensions, params.top, params.left, params.rotationInfo)
        };

        // 우측 y axis 영역 bounds 정보 추가
        if (params.optionChartTypes && params.optionChartTypes.length) {
            bounds.yrAxis = this._makeYRAxisBound(params.dimensions, params.top);
        }

        return bounds;
    },

    /**
     * To make chart bound.
     * @param {{width: number, height: number}} dimension chart dimension.
     * @returns {{dimension: {width: number, height: number}}} chart bound
     * @private
     */
    _makeChartBound: function(dimension) {
        return {
            dimension: dimension
        };
    },

    /**
     * To make legend bound.
     * @param {{title: {height: number}, series: {width: number}, yrAxis: {width: number}}} dimensions dimensions
     * @param {number} yAxisWidth yAxis width
     * @returns {{position: {top: number, left: number}}} legend bound
     * @private
     */
    _makeLegendBound: function(dimensions) {
        return {
            position: {
                top: dimensions.title.height,
                left: dimensions.yAxis.width + dimensions.series.width + dimensions.yrAxis.width + this.chartLeftPadding
            }
        };
    },

    /**
     * To make axes label info.
     * @param {object} params parameters
     *      @param {boolean} params.hasAxes whether has axes or not
     *      @param {array} params.optionChartTypes chart types
     *      @param {object} convertedData converted data
     *      @param {boolean} isVertical whether vertical or not
     * @returns {{xAxis: array, yAxis: array}} label info
     * @private
     */
    _makeAxesLabelInfo: function(params) {
        var chartType, maxValueLabel, yLabels, xLabels;

        if (!params.hasAxes) {
            return null;
        }

        chartType = params.optionChartTypes && params.optionChartTypes[0] || '';

        // value 중 가장 큰 값을 추출하여 value label로 지정 (lable 너비 체크 시 사용)
        maxValueLabel = this._getValueAxisMaxLabel(params.convertedData, chartType);

        // 세로옵션에 따라서 x축과 y축에 적용할 레이블 정보 지정
        if (params.isVertical) {
            yLabels = [maxValueLabel];
            xLabels = params.convertedData.labels;
        } else {
            yLabels = params.convertedData.labels;
            xLabels = [maxValueLabel];
        }

        return {
            xAxis: xLabels,
            yAxis: yLabels
        };
    },

    /**
     * Find rotation degree.
     * @param {number} limitWidth limit width
     * @param {number} labelWidth label width
     * @param {number} labelHeight label height
     * @param {number} index candidates index
     * @returns {number} rotation degree
     * @private
     */
    _findRotationDegree: function(limitWidth, labelWidth, labelHeight) {
        var foundDegree,
            halfWidth = labelWidth / 2,
            halfHeight = labelHeight / 2;

        tui.util.forEachArray(chartConst.DEGREE_CANDIDATES, function(degree) {
            var compareWidth = (calculator.calculateAdjacent(degree, halfWidth) + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, halfHeight)) * 2;
            foundDegree = degree;
            if (compareWidth <= limitWidth + chartConst.XAXIS_LABEL_COMPARE_MARGIN) {
                return false;
            }
        });

        return foundDegree;
    },

    /**
     * To make rotation info about horizontal label.
     * @param {number} seriesWidth series area width
     * @param {array.<string>} labels axis labels
     * @param {object} theme axis label theme
     * @returns {?object} rotation info
     * @private
     */
    _makeHorizontalLabelRotationInfo: function(seriesWidth, labels, theme) {
        var maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(labels, theme),
            limitWidth = seriesWidth / labels.length - chartConst.XAXIS_LABEL_GUTTER,
            degree, labelHeight;

        if (maxLabelWidth <= limitWidth) {
            return null;
        }

        labelHeight = renderUtil.getRenderedLabelsMaxHeight(labels, theme);
        degree = this._findRotationDegree(limitWidth, maxLabelWidth, labelHeight);

        return {
            maxLabelWidth: maxLabelWidth,
            labelHeight: labelHeight,
            degree: degree
        };
    },

    /**
     * To calculate overflow position left.
     * @param {number} yAxisWidth yAxis width
     * @param {{degree: number, labelHeight: number}} rotationInfo rotation info
     * @param {string} firstLabel firstLabel
     * @param {obejct} theme label theme
     * @returns {number} overflow position left
     * @private
     */
    _calculateOverflowLeft: function(yAxisWidth, rotationInfo, firstLabel, theme) {
        var degree = rotationInfo.degree,
            labelHeight = rotationInfo.labelHeight,
            firstLabelWidth = renderUtil.getRenderedLabelWidth(firstLabel, theme),
            newLabelWidth = (calculator.calculateAdjacent(degree, firstLabelWidth / 2) + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2,
            diffLeft = newLabelWidth - yAxisWidth;
        return diffLeft;
    },


    /**
     * To calculate height of xAxis.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @returns {number} xAxis height
     * @private
     */
    _calculateXAxisHeight: function(rotationInfo) {
        var degree = rotationInfo.degree,
            maxLabelWidth = rotationInfo.maxLabelWidth,
            labelHeight = rotationInfo.labelHeight,
            axisHeight = (calculator.calculateOpposite(degree, maxLabelWidth / 2) + calculator.calculateOpposite(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;
        return axisHeight;
    },

    /**
     * To calculate height difference between origin label and rotation label.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @returns {number} height difference
     * @private
     */
    _calculateHeightDifference: function(rotationInfo) {
        var xAxisHeight = this._calculateXAxisHeight(rotationInfo);
        return xAxisHeight - rotationInfo.labelHeight;
    },

    /**
     * Update degree of rotationInfo.
     * @param {number} seriesWidth series width
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @param {number} labelLength labelLength
     * @param {number} overflowLeft overflow left
     * @private
     */
    _updateDegree: function(seriesWidth, rotationInfo, labelLength, overflowLeft) {
        var limitWidth, newDegree;
        if (overflowLeft > 0) {
            limitWidth = seriesWidth / labelLength + chartConst.XAXIS_LABEL_GUTTER;
            newDegree = this._findRotationDegree(limitWidth, rotationInfo.maxLabelWidth, rotationInfo.labelHeight);
            rotationInfo.degree = newDegree;
        }
    },

    /**
     * Update width of dimentios.
     * @param {{plot: {width: number}, series: {width: number}, xAxis: {width: number}}} dimensions dimensions
     * @param {number} overflowLeft overflow left
     * @private
     */
    _updateDimensionsWidth: function(dimensions, overflowLeft) {
        if (overflowLeft > 0) {
            this.chartLeftPadding += overflowLeft;
            dimensions.plot.width -= overflowLeft;
            dimensions.series.width -= overflowLeft;
            dimensions.xAxis.width -= overflowLeft;
        }
    },

    /**
     * Update height of dimensions.
     * @param {{plot: {height: number}, series: {height: number}, xAxis: {height: number}}} dimensions dimensions
     * @param {number} diffHeight diff height
     * @private
     */
    _updateDimensionsHeight: function(dimensions, diffHeight) {
        dimensions.plot.height -= diffHeight;
        dimensions.series.height -= diffHeight;
        dimensions.xAxis.height += diffHeight;
    },

    /**
     * Update dimensions and degree.
     * @param {{plot: {width: number, height: number}, series: {width: number, height: number}, xAxis: {width: number, height: number}}} dimensions dimensions
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @param {array} labels labels
     * @param {object} theme theme
     * @private
     */
    _updateDimensionsAndDegree: function(dimensions, rotationInfo, labels, theme) {
        var overflowLeft, diffHeight;
        if (!rotationInfo) {
            return;
        }
        overflowLeft = this._calculateOverflowLeft(dimensions.yAxis.width, rotationInfo, labels[0], theme);
        this._updateDimensionsWidth(dimensions, overflowLeft);
        this._updateDegree(dimensions.series.width, rotationInfo, labels.length, overflowLeft);
        diffHeight = this._calculateHeightDifference(rotationInfo);
        this._updateDimensionsHeight(dimensions, diffHeight);
    },

    _makeCustomEventBound: function(bound) {
        var dimension = bound.dimension,
            position = bound.position;
        return {
            dimension: {
                width: dimension.width + chartConst.SERIES_EXPAND_SIZE * 2,
                height: dimension.height + chartConst.SERIES_EXPAND_SIZE
            },
            position: {
                left: position.left - chartConst.SERIES_EXPAND_SIZE,
                top: position.top
            }
        }
    },

    /**
     * To make bounds about chart components.
     * @memberOf module:boundsMaker
     * @param {object} params parameters
     *      @param {object} params.convertedData converted data
     *      @param {object} params.theme chart theme
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {object} params.options chart options
     *      @param {boolean} params.hasAxes whether has axes area or not
     *      @param {array} params.optionChartTypes y axis option chart types
     * @returns {{
     *   plot: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, right: number}
     *   },
     *   yAxis: {
     *     dimension: {width: (number), height: number},
     *     position: {top: number}
     *   },
     *   xAxis: {
     *     dimension: {width: number, height: (number)},
     *     position: {right: number}
     *   },
     *   series: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, right: number}
     *   },
     *   legend: {
     *     position: {top: number}
     *   },
     *   tooltip: {
     *     dimension: {width: number, height: number},
     *     position: {top: number, left: number}
     *   }
     * }} bounds
     */
    make: function(params) {
        var axesLabelInfo = this._makeAxesLabelInfo(params),
            dimensions = this._getComponentsDimensions(tui.util.extend({
                axesLabelInfo: axesLabelInfo
            }, params)),
            rotationInfo, top, left, seriesBound, axesBounds, bounds;

        this.chartLeftPadding = chartConst.CHART_PADDING;
        if (params.hasAxes) {
            rotationInfo = this._makeHorizontalLabelRotationInfo(dimensions.series.width, axesLabelInfo.xAxis, params.theme.label);
            this._updateDimensionsAndDegree(dimensions, rotationInfo, axesLabelInfo.xAxis, params.theme.label);
        }

        top = dimensions.title.height + chartConst.CHART_PADDING;
        left = dimensions.yAxis.width + this.chartLeftPadding;
        seriesBound = this._makeBasicBound(dimensions.series, top, left);

        axesBounds = this._makeAxesBounds({
            hasAxes: params.hasAxes,
            rotationInfo: rotationInfo,
            optionChartTypes: params.optionChartTypes,
            dimensions: dimensions,
            top: top,
            left: left
        });

        bounds = tui.util.extend({
            chart: this._makeChartBound(dimensions.chart),
            series: seriesBound,
            legend: this._makeLegendBound(dimensions),
            tooltip: this._makeBasicBound(dimensions.series, top, left - chartConst.SERIES_EXPAND_SIZE),
            customEvent: seriesBound
        }, axesBounds);
        return bounds;
    }
};

module.exports = boundsMaker;

},{"../const":15,"./calculator":28,"./predicate":32,"./renderUtil":33}],28:[function(require,module,exports){
/**
 * @fileoverview calculator.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * Calculator.
 * @module calculator
 */
var calculator = {
    /**
     * To calculate scale from chart min, max data.
     *  - http://peltiertech.com/how-excel-calculates-automatic-chart-axis-limits/
     * @memberOf module:calculator
     * @param {number} min min minimum value of user data
     * @param {number} max max maximum value of user data
     * @param {number} tickCount tick count
     * @returns {{min: number, max: number}} scale axis scale
     */
    calculateScale: function(min, max) {
        var saveMin = 0,
            scale = {},
            iodValue; // increase or decrease value;

        if (min < 0) {
            saveMin = min;
            max -= min;
            min = 0;
        }

        iodValue = (max - min) / 20;
        scale.max = max + iodValue + saveMin;

        if (max / 6 > min) {
            scale.min = 0 + saveMin;
        } else {
            scale.min = min - iodValue + saveMin;
        }
        return scale;
    },

    /**
     * To normalize number.
     * @memberOf module:calculator
     * @param {number} value target value
     * @returns {number} normalized number
     */
    normalizeAxisNumber: function(value) {
        var standard = 0,
            flag = 1,
            normalized, mod;

        if (value === 0) {
            return value;
        } else if (value < 0) {
            flag = -1;
        }

        value *= flag;

        tui.util.forEachArray(chartConst.AXIS_STANDARD_MULTIPLE_NUMS, function(num) {
            if (value < num) {
                if (num > 1) {
                    standard = num;
                }
                return false;
            } else if (num === 10) {
                standard = 10;
            }
        });

        if (standard < 1) {
            normalized = this.normalizeAxisNumber(value * 10) * 0.1;
        } else {
            mod = tui.util.mod(value, standard);
            normalized = tui.util.addition(value, (mod > 0 ? standard - mod : 0));
        }

        return normalized *= flag;
    },

    /**
     * To make tick positions of pixel type.
     * @memberOf module:calculator
     * @param {number} size area width or height
     * @param {number} count tick count
     * @returns {array.<number>} positions
     */
    makeTickPixelPositions: function(size, count) {
        var positions = [],
            pxScale, pxStep;

        if (count > 0) {
            pxScale = {min: 0, max: size - 1};
            pxStep = this.getScaleStep(pxScale, count);
            positions = tui.util.map(tui.util.range(0, size, pxStep), function(position) {
                return Math.round(position);
            });
            positions[positions.length - 1] = size - 1;
        }
        return positions;
    },

    /**
     * To make labels from scale.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} scale axis scale
     * @param {number} step step between max and min
     * @returns {string[]} labels
     * @private
     */
    makeLabelsFromScale: function(scale, step) {
        var multipleNum = tui.util.findMultipleNum(step),
            min = scale.min * multipleNum,
            max = scale.max * multipleNum,
            labels = tui.util.range(min, max + 1, step * multipleNum);
        labels = tui.util.map(labels, function(label) {
            return label / multipleNum;
        });
        return labels;
    },

    /**
     * Get scale step.
     * @memberOf module:calculator
     * @param {{min: number, max: number}} scale axis scale
     * @param {number} count value count
     * @returns {number} scale step
     */
    getScaleStep: function(scale, count) {
        return (scale.max - scale.min) / (count - 1);
    },

    /**
     * To calculate adjacent.
     * @param {number} degree degree
     * @param {number} hypotenuse hypotenuse
     * @returns {number} adjacent
     *
     *   H : Hypotenuse
     *   A : Adjacent
     *   O : Opposite
     *   D : Degree
     *
     *        /|
     *       / |
     *    H /  | O
     *     /   |
     *    /\ D |
     *    -----
     *       A
     */
    calculateAdjacent: function(degree, hypotenuse) {
        return Math.cos(degree * chartConst.RAD) * hypotenuse;
    },

    /**
     * To calculate opposite.
     * @param {number} degree degree
     * @param {number} hypotenuse hypotenuse
     * @returns {number} opposite
     */
    calculateOpposite: function(degree, hypotenuse) {
        return Math.sin(degree * chartConst.RAD) * hypotenuse;
    }
};

module.exports = calculator;

},{"../const":15}],29:[function(require,module,exports){
/**
 * @fileoverview Data converter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var concat = Array.prototype.concat;

/**
 * Data converter.
 * @module dataConverter
 */
var dataConverter = {
    /**
     * Convert user data.
     * @memberOf module:dataConverter
     * @param {array.<array>} userData user data
     * @param {object} chartOptions chart option
     * @param {string} chartType chart type
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {{
     *      labels: array.<string>,
     *      values: array.<number>,
     *      legendLabels: array.<string>,
     *      formatFunctions: array.<function>,
     *      formattedValues: array.<string>
     * }} converted data
     */
    convert: function(userData, chartOptions, chartType, seriesChartTypes) {
        var labels = userData.categories,
            seriesData = userData.series,
            values = this._pickValues(seriesData),
            joinValues = this._joinValues(values, seriesChartTypes),
            legendLabels = this._pickLegendLabels(seriesData),
            joinLegendLabels = this._joinLegendLabels(legendLabels, chartType, seriesChartTypes),
            format = chartOptions && chartOptions.format || '',
            formatFunctions = this._findFormatFunctions(format),
            formattedValues = format ? this._formatValues(values, formatFunctions) : values,
            joinFormattedValues = this._joinValues(formattedValues, seriesChartTypes);
        return {
            labels: labels,
            values: values,
            joinValues: joinValues,
            legendLabels: legendLabels,
            joinLegendLabels: joinLegendLabels,
            formatFunctions: formatFunctions,
            formattedValues: formattedValues,
            joinFormattedValues: joinFormattedValues
        };
    },

    /**
     * Separate label.
     * @memberOf module:dataConverter
     * @param {array.<array.<array>>} userData user data
     * @returns {{labels: (array.<string>), sourceData: array.<array.<array>>}} result data
     * @private
     */
    _separateLabel: function(userData) {
        var labels = userData[0].pop();
        return {
            labels: labels,
            sourceData: userData
        };
    },

    /**
     * Pick value.
     * @memberOf module:dataConverter
     * @param {{name: string, data: (array.<number> | number)}} items items
     * @returns {array} picked value
     * @private
     */
    _pickValue: function(items) {
        return tui.util.map([].concat(items.data), parseFloat);
    },

    /**
     * Pick values from axis data.
     * @memberOf module:dataConverter
     * @param {array.<array>} seriesData series data
     * @returns {string[]} values
     */
    _pickValues: function(seriesData) {
        var values, result;
        if (tui.util.isArray(seriesData)) {
            values = tui.util.map(seriesData, this._pickValue, this);
            result = tui.util.pivot(values);
        } else {
            result = {};
            tui.util.forEach(seriesData, function(groupValues, type) {
                values = tui.util.map(groupValues, this._pickValue, this);
                result[type] = tui.util.pivot(values);
            }, this);
        }
        return result;
    },

    /**
     * Join values.
     * @memberOf module:dataConverter
     * @param {array.<array>} groupValues values
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {array.<number>} join values
     * @private
     */
    _joinValues: function(groupValues, seriesChartTypes) {
        var joinValues;

        if (!seriesChartTypes) {
            return groupValues;
        }

        joinValues = tui.util.map(groupValues, function(values) {
            return values;
        }, this);

        joinValues = [];
        tui.util.forEachArray(seriesChartTypes, function(_chartType) {
            tui.util.forEach(groupValues[_chartType], function(values, index) {
                if (!joinValues[index]) {
                    joinValues[index] = [];
                }
                joinValues[index] = joinValues[index].concat(values);
            });
        });

        return joinValues;
    },

    /**
     * Pick legend label.
     * @memberOf module:dataConverter
     * @param {object} item item
     * @returns {string} label
     * @private
     */
    _pickLegendLabel: function(item) {
        return item.name;
    },

    /**
     * Pick legend labels from axis data.
     * @memberOf module:dataConverter
     * @param {array.<array>} seriesData series data
     * @returns {string[]} labels
     */
    _pickLegendLabels: function(seriesData) {
        var result;
        if (tui.util.isArray(seriesData)) {
            result = tui.util.map(seriesData, this._pickLegendLabel, this);
        } else {
            result = {};
            tui.util.forEach(seriesData, function(groupValues, type) {
                result[type] = tui.util.map(groupValues, this._pickLegendLabel, this);
            }, this);
        }
        return result;
    },

    /**
     * Join legend labels.
     * @memberOf module:dataConverter
     * @param {array} legendLabels legend labels
     * @param {string} chartType chart type
     * @param {array.<string>} seriesChartTypes chart types
     * @returns {array} labels
     * @private
     */
    _joinLegendLabels: function(legendLabels, chartType, seriesChartTypes) {
        var joinLabels;
        if (!seriesChartTypes || !seriesChartTypes.length) {
            joinLabels = tui.util.map(legendLabels, function(label) {
                return {
                    chartType: chartType,
                    label: label
                };
            });
        } else {
            joinLabels = [];
            tui.util.forEachArray(seriesChartTypes, function(_chartType) {
                var labels = tui.util.map(legendLabels[_chartType], function(label) {
                    return {
                        chartType: _chartType,
                        label: label
                    };
                });
                joinLabels = joinLabels.concat(labels);
            });
        }
        return joinLabels;
    },

    /**
     * To format group values.
     * @memberOf module:dataConverter
     * @param {array.<array>} groupValues group values
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     * @private
     */
    _formatGroupValues: function(groupValues, formatFunctions) {
        return tui.util.map(groupValues, function(values) {
            return tui.util.map(values, function(value) {
                var fns = [value].concat(formatFunctions);
                return tui.util.reduce(fns, function(stored, fn) {
                    return fn(stored);
                });
            });
        });
    },

    /**
     * To format converted values.
     * @memberOf module:dataConverter
     * @param {array.<array>} chartValues chart values
     * @param {function[]} formatFunctions format functions
     * @returns {string[]} formatted values
     * @private
     */
    _formatValues: function(chartValues, formatFunctions) {
        var result;
        if (tui.util.isArray(chartValues)) {
            result = this._formatGroupValues(chartValues, formatFunctions);
        } else {
            result = {};
            tui.util.forEach(chartValues, function(groupValues, chartType) {
                result[chartType] = this._formatGroupValues(groupValues, formatFunctions);
            }, this);
        }
        return result;
    },

    /**
     * Pick max length under point.
     * @memberOf module:dataConverter
     * @param {string[]} values chart values
     * @returns {number} max length under point
     * @private
     */
    _pickMaxLenUnderPoint: function(values) {
        var max = 0;

        tui.util.forEachArray(values, function(value) {
            var len = tui.util.lengthAfterPoint(value);
            if (len > max) {
                max = len;
            }
        }, this);

        return max;
    },

    /**
     * Whether zero fill format or not.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isZeroFill: function(format) {
        return format.length > 2 && format.charAt(0) === '0';
    },

    /**
     * Whether decimal format or not.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isDecimal: function(format) {
        var indexOf = format.indexOf('.');
        return indexOf > -1 && indexOf < format.length - 1;
    },

    /**
     * Whether comma format or not.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @returns {boolean} result boolean
     * @private
     */
    _isComma: function(format) {
        return format.indexOf(',') === format.split('.')[0].length - 4;
    },

    /**
     * Format zero fill.
     * @memberOf module:dataConverter
     * @param {number} len length of result
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatZeroFill: function(len, value) {
        var zero = '0',
            isMinus = value < 0;

        value = Math.abs(value) + '';

        if (value.length >= len) {
            return value;
        }

        while (value.length < len) {
            value = zero + value;
        }

        return (isMinus ? '-' : '') + value;
    },

    /**
     * Format Decimal.
     * @memberOf module:dataConverter
     * @param {number} len length of under decimal point
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatDecimal: function(len, value) {
        var pow;

        if (len === 0) {
            return Math.round(value, 10);
        }

        pow = Math.pow(10, len);
        value = Math.round(value * pow) / pow;
        value = parseFloat(value).toFixed(len);
        return value;
    },

    /**
     * Format Comma.
     * @memberOf module:dataConverter
     * @param {string} value target value
     * @returns {string} formatted value
     * @private
     */
    _formatComma: function(value) {
        var comma = ',',
            underPointValue = '',
            values, lastIndex;

        value += '';

        if (value.indexOf('.') > -1) {
            values = value.split('.');
            value = values[0];
            underPointValue = '.' + values[1];
        }

        if (value.length < 4) {
            return value + underPointValue;
        }

        values = (value).split('').reverse();
        lastIndex = values.length - 1;
        values = tui.util.map(values, function(char, index) {
            var result = [char];
            if (index < lastIndex && (index + 1) % 3 === 0) {
                result.push(comma);
            }
            return result;
        });

        return concat.apply([], values).reverse().join('') + underPointValue;
    },

    /**
     * Find format functions.
     * @memberOf module:dataConverter
     * @param {string} format format
     * @param {string[]} values chart values
     * @returns {function[]} functions
     */
    _findFormatFunctions: function(format) {
        var funcs = [],
            len;

        if (!format) {
            return [];
        }

        if (this._isDecimal(format)) {
            len = this._pickMaxLenUnderPoint([format]);
            funcs = [tui.util.bind(this._formatDecimal, this, len)];
        } else if (this._isZeroFill(format)) {
            len = format.length;
            funcs = [tui.util.bind(this._formatZeroFill, this, len)];
            return funcs;
        }

        if (this._isComma(format)) {
            funcs.push(this._formatComma);
        }

        return funcs;
    }
};

module.exports = dataConverter;

},{}],30:[function(require,module,exports){
/**
 * @fileoverview DOM Handler.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * DOM Handler.
 * @module domHandler
 */
var domHandler = {
    /**
     * Create element.
     * @memberOf module:domHandler
     * @param {string} tag html tag
     * @param {string} newClass class name
     * @returns {HTMLElement} created element
     */
    create: function(tag, newClass) {
        var el = document.createElement(tag);

        if (newClass) {
            this.addClass(el, newClass);
        }

        return el;
    },

    /**
     * Get class names.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @returns {array} names
     * @private
     */
    _getClassNames: function(el) {
        var className = el.className || '',
            classNames = className && tui.util.isString(className) ? className.split(' ') : [];
        return classNames;
    },

    /**
     * Add css class to target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} newClass add class name
     */
    addClass: function(el, newClass) {
        var classNames = this._getClassNames(el),
            index = tui.util.inArray(newClass, classNames);

        if (index > -1) {
            return;
        }

        classNames.push(newClass);
        el.className = classNames.join(' ');
    },

    /**
     * Remove css class from target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} rmClass remove class name
     */
    removeClass: function(el, rmClass) {
        var classNames = this._getClassNames(el),
            index = tui.util.inArray(rmClass, classNames);

        if (index === -1) {
            return;
        }

        classNames.splice(index, 1);
        el.className = classNames.join(' ');
    },

    /**
     * Whether class exist or not.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} findClass target css class
     * @returns {boolean} has class
     */
    hasClass: function(el, findClass) {
        var classNames = this._getClassNames(el),
            index = tui.util.inArray(findClass, classNames);
        return index > -1;
    },

    /**
     * Find parent by class name.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} className target css class
     * @param {string} lastClass last css class
     * @returns {HTMLElement} result element
     */
    findParentByClass: function(el, className, lastClass) {
        var parent = el.parentNode;
        if (!parent) {
            return null;
        } else if (this.hasClass(parent, className)) {
            return parent;
        } else if (parent.nodeName === 'BODY' || this.hasClass(parent, lastClass)) {
            return null;
        } else {
            return this.findParentByClass(parent, className, lastClass);
        }
    },

    /**
     * Append child element.
     * @memberOf module:domHandler
     * @param {HTMLElement} container container element
     * @param {HTMLElement} children child element
     */
    append: function(container, children) {
        if (!container || !children) {
            return;
        }
        children = tui.util.isArray(children) ? children : [children];

        tui.util.forEachArray(children, function(child) {
            if (!child) {
                return;
            }
            container.appendChild(child);
        }, this);
    }
};

module.exports = domHandler;

},{}],31:[function(require,module,exports){
/**
 * @fileoverview Event listener.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Event listener.
 * @module eventListener
 */
var eventListener = {
    /**
     * Event listener for IE.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     * @private
     */
    _attachEvent: function (eventName, el, callback) {
        if (typeof callback == "object" && callback.handleEvent) {
            el.attachEvent("on" + eventName, function () {
                callback.handleEvent.call(callback);
            });
        } else {
            el.attachEvent("on" + eventName, callback);
        }
    },

    /**
     * Event listener for other browsers.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     * @private
     */
    _addEventListener: function (eventName, el, callback) {
        try {
            el.addEventListener(eventName, callback);
        } catch (e) {
            if (typeof callback == "object" && callback.handleEvent) {
                el.addEventListener(eventName, function (event) {
                    callback.handleEvent.call(callback, event);
                });
            } else {
                throw e;
            }
        }
    },
    /**
     * Bind event function.
     * @memberOf module:eventListener
     * @param {string} eventName event name
     * @param {HTMLElement} el target element
     * @param {function} callback callback function
     */
    bindEvent: function (eventName, el, callback) {
        var bindEvent;
        if ("addEventListener" in el) {
            bindEvent = this._addEventListener;
        } else if ("attachEvent" in el) {
            bindEvent = this._attachEvent;
        }
        this.bindEvent = bindEvent;
        bindEvent(eventName, el, callback);
    }
};

module.exports = eventListener;

},{}],32:[function(require,module,exports){
/**
 * @fileoverview Predicate.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * predicate.
 * @module predicate
 */
var predicate = {
    /**
     * Whether bar chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isBarChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_BAR;
    },

    /**
     * Whether line chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_LINE;
    },

    /**
     * Whether line type chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineTypeChart: function(chartType) {
        return this.isLineChart(chartType) || chartType === chartConst.CHART_TYPE_AREA;
    },

    /**
     * Whether pie chart or not.
     * @memberOf module:predicate
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isPieChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_PIE;
    },

    /**
     * Whether outer legend align or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isOuterLegendAlign: function(align) {
        return align === chartConst.LEGEND_ALIGN_OUTER;
    },

    /**
     * Whether center legend align or not.
     * @memberOf module:predicate
     * @param {string} align legend type
     * @returns {boolean} result boolean
     */
    isCenterLegendAlign: function(align) {
        return align === chartConst.LEGEND_TYPE_CENTER;
    },

    /**
     * Whether legend align of pie chart or not.
     * @memberOf module:predicate
     * @param {?string} align chart type
     * @returns {boolean} result boolean
     */
    isPieLegendAlign: function(align) {
        var result = false;
        if (align) {
            result = this.isOuterLegendAlign(align) || this.isCenterLegendAlign(align);
        }
        return result;
    }
};

module.exports = predicate;

},{"../const":15}],33:[function(require,module,exports){
/**
 * @fileoverview Util for rendering.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('./domHandler'),
    chartConst = require('./../const');

var browser = tui.util.browser,
    isOldBrowser = browser.msie && browser.version <= 8;

/**
 * Util for rendering.
 * @module renderUtil
 */
var renderUtil = {
    /**
     * Concat string.
     * @memberOf module:renderUtil
     * @params {...string} target strings
     * @returns {string} concat string
     */
    concatStr: function() {
        return String.prototype.concat.apply('', arguments);
    },

    /**
     * To make cssText for font.
     * @memberOf module:renderUtil
     * @param {{fontSize: number, fontFamily: string, color: string}} theme font theme
     * @returns {string} cssText
     */
    makeFontCssText: function(theme) {
        var cssTexts = [];

        if (!theme) {
            return '';
        }

        if (theme.fontSize) {
            cssTexts.push(this.concatStr('font-size:', theme.fontSize, 'px'));
        }

        if (theme.fontFamily) {
            cssTexts.push(this.concatStr('font-family:', theme.fontFamily));
        }

        if (theme.color) {
            cssTexts.push(this.concatStr('color:', theme.color));
        }

        return cssTexts.join(';');
    },

    checkEl: null,
    /**
     * Create element for size check.
     * @memberOf module:renderUtil
     * @returns {HTMLElement} element
     * @private
     */
    _createSizeCheckEl: function() {
        var elDiv, elSpan;
        if (this.checkEl) {
            return this.checkEl;
        }

        elDiv = dom.create('DIV', 'tui-chart-size-check-element');
        elSpan = dom.create('SPAN');

        elDiv.appendChild(elSpan);
        this.checkEl = elDiv;
        return elDiv;
    },

    /**
     * Get rendered label size (width or height).
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {object} theme theme
     * @param {string} offsetType offset type (offsetWidth or offsetHeight)
     * @returns {number} size
     * @private
     */
    _getRenderedLabelSize: function(label, theme, offsetType) {
        var elDiv, elSpan, labelSize;

        if (tui.util.isUndefined(label) || label === '') {
            return 0;
        }

        elDiv = this._createSizeCheckEl();
        elSpan = elDiv.firstChild;

        theme = theme || {};
        elSpan.innerHTML = label;
        elSpan.style.fontSize = (theme.fontSize || chartConst.DEFAULT_LABEL_FONT_SIZE) + 'px';

        if (theme.fontFamily) {
            elSpan.style.padding = 0;
            elSpan.style.fontFamily = theme.fontFamily;
        }

        document.body.appendChild(elDiv);
        labelSize = elSpan[offsetType];
        document.body.removeChild(elDiv);
        return labelSize;
    },

    /**
     * Get rendered label width.
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} width
     */
    getRenderedLabelWidth: function(label, theme) {
        var labelWidth = this._getRenderedLabelSize(label, theme, 'offsetWidth');
        return labelWidth;
    },

    /**
     * Get rendered label height.
     * @memberOf module:renderUtil
     * @param {string} label label
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} height
     */
    getRenderedLabelHeight: function(label, theme) {
        var labelHeight = this._getRenderedLabelSize(label, theme, 'offsetHeight');
        return labelHeight;
    },

    /**
     * Get Rendered Labels Max Size(width or height).
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @param {function} iteratee iteratee
     * @returns {number} max size (width or height)
     * @private
     */
    _getRenderedLabelsMaxSize: function(labels, theme, iteratee) {
        var sizes = tui.util.map(labels, function(label) {
                return iteratee(label, theme);
            }, this),
            maxSize = tui.util.max(sizes);
        return maxSize;
    },

    /**
     * Get rendered labels max width.
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max width
     * @private
     */
    getRenderedLabelsMaxWidth: function(labels, theme) {
        var iteratee = tui.util.bind(this.getRenderedLabelWidth, this),
            maxWidth = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return maxWidth;
    },

    /**
     * Get rendered labels max height.
     * @memberOf module:boundsMaker
     * @param {string[]} labels labels
     * @param {{fontSize: number, fontFamily: string, color: string}} theme label theme
     * @returns {number} max height
     */
    getRenderedLabelsMaxHeight: function(labels, theme) {
        var iteratee = tui.util.bind(this.getRenderedLabelHeight, this),
            maxHeight = this._getRenderedLabelsMaxSize(labels, theme, iteratee);
        return maxHeight;
    },

    /**
     * Render dimension.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {{width: number, height: number}} dimension dimension
     */
    renderDimension: function(el, dimension) {
        el.style.cssText = [
            this.concatStr('width:', dimension.width, 'px'),
            this.concatStr('height:', dimension.height, 'px')
        ].join(';');
    },

    /**
     * Render position(top, right).
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {{top: number, left: number, right: number}} position position
     */
    renderPosition: function(el, position) {
        if (tui.util.isUndefined(position)) {
            return;
        }

        if (position.top) {
            el.style.top = position.top + 'px';
        }

        if (position.left) {
            el.style.left = position.left + 'px';
        }

        if (position.right) {
            el.style.right = position.right + 'px';
        }
    },

    /**
     * Render background.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {string} background background option
     */
    renderBackground: function(el, background) {
        if (!background) {
            return;
        }

        el.style.background = background;
    },

    /**
     * Render font family.
     * @memberOf module:renderUtil
     * @param {HTMLElement} el target element
     * @param {string} fontFamily font family option
     */
    renderFontFamily: function(el, fontFamily) {
        if (!fontFamily) {
            return;
        }

        el.style.fontFamily = fontFamily;
    },

    /**
     * Render title.
     * @memberOf module:renderUtil
     * @param {string} title title
     * @param {{fontSize: number, color: string, background: string}} theme title theme
     * @param {string} className css class name
     * @returns {HTMLElement} title element
     */
    renderTitle: function(title, theme, className) {
        var elTitle, cssText;

        if (!title) {
            return null;
        }

        elTitle = dom.create('DIV', className);
        elTitle.innerHTML = title;

        cssText = renderUtil.makeFontCssText(theme);

        if (theme.background) {
            cssText += ';' + this.concatStr('background:', theme.background);
        }

        elTitle.style.cssText = cssText;

        return elTitle;
    },

    /**
     * To expand dimension.
     * @param {{width: number, height: number}} dimension series dimension
     * @returns {{width: number, height: number}} expended dimension
     */
    expandBound: function(bound) {
        var dimension = bound.dimension,
            position = bound.position;
        return {
            dimension: {
                width: dimension.width + chartConst.SERIES_EXPAND_SIZE * 2,
                height: dimension.height + chartConst.SERIES_EXPAND_SIZE
            },
            position: {
                left: position.left - chartConst.SERIES_EXPAND_SIZE,
                top: position.top
            }
        };
    },

    makeCustomEventName: function(prefix, str, suffix) {
        return prefix + tui.util.properCase(str) + tui.util.properCase(suffix);
    },

    /**
     * Whether IE8 or not.
     * @memberOf module:renderUtil
     * @returns {boolean} result boolean
     */
    isOldBrowser: function() {
        return isOldBrowser;
    }
};

module.exports = renderUtil;

},{"./../const":15,"./domHandler":30}],34:[function(require,module,exports){
/**
 * @fileoverview This is template maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

module.exports = {
    /**
     * This is template maker.
     * @param {string} html html
     * @returns {function} template function
     * @eaxmple
     *
     *   var template = templateMaker.template('<span>{{ name }}</span>'),
     *       result = template({name: 'John');
     *   console.log(result); // <span>John</span>
     *
     */
    template: function (html) {
        return function (data) {
            var result = html;
            tui.util.forEach(data, function (value, key) {
                var regExp = new RegExp('{{\\s*' + key + '\\s*}}', 'g');
                result = result.replace(regExp, value);
            });
            return result;
        };
    }
};

},{}],35:[function(require,module,exports){
/**
 * @fileoverview UserEventListener is listener of user event.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var UserEventListener = tui.util.defineClass(/** @lends UserEventListener.prototype */ {
    /**
     * Register user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    register: function(eventName, func) {
        this.on(eventName, func);
    }
});

tui.util.CustomEvents.mixin(UserEventListener);

module.exports = UserEventListener;

},{}],36:[function(require,module,exports){
/**
 * @fileoverview  Legend component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    eventListener = require('../helpers/eventListener'),
    renderUtil = require('../helpers/renderUtil'),
    defaultTheme = require('../themes/defaultTheme'),
    legendTemplate = require('./../legends/legendTemplate');

var concat = Array.prototype.concat;

var Legend = tui.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component.
     * @constructs Legend
     * @param {object} params parameters
     *      @param {number} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        tui.util.extend(this, params);
        /**
         * Legend view className
         */
        this.className = 'tui-chart-legend-area';
    },

    /**
     * To render legend area.
     * @param {HTMLElement} elLegnedArea legend area element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @private
     */
    _renderLegendArea: function(elLegnedArea, bound) {
        var legendData;
        this.bound = bound;
        this.legendData = legendData = this._makeLegendData();
        elLegnedArea.innerHTML = this._makeLegendHtml(legendData);
        renderUtil.renderPosition(elLegnedArea, bound.position);
        this._renderLabelTheme(elLegnedArea, this.theme.label);
    },

    /**
     * To render legend component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @returns {HTMLElement} legend element
     */
    render: function(bound) {
        var el = dom.create('DIV', this.className);
        this._renderLegendArea(el, bound);
        this._attachEvent(el);
        this.elLegendArea = el;
        return el;
    },

    /**
     * To resize legend component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     */
    resize: function(bound) {
        this._renderLegendArea(this.elLegendArea, bound);
    },

    /**
     * Set theme for legend labels
     * @param {array.<object>} labels labels
     * @param {object} theme legend theme
     * @returns {array.<object>} labels
     * @private
     */
    _setThemeForLabels: function(labels, theme) {
        var result;
        result = tui.util.map(labels, function(item, index) {
            var itemTheme = {
                color: theme.colors[index]
            };

            if (theme.singleColors) {
                itemTheme.singleColor = theme.singleColors[index];
            }
            if (theme.borderColor) {
                itemTheme.borderColor = theme.borderColor;
            }
            item.theme = itemTheme;
            item.index = index;
            return item;
        }, this);

        return result;
    },

    /**
     * To make legend labels.
     * @returns {array.<object>} legend labels.
     * @private
     */
    _makeLegendData: function() {
        var joinLegendLabels = this.joinLegendLabels,
            theme = this.theme,
            defaultLegendTheme = {
                colors: defaultTheme.series.colors
            },
            startIndex, result;

        if (!this.seriesChartTypes) {
            result = this._setThemeForLabels(joinLegendLabels, theme);
        } else {
            startIndex = 0;
            result = concat.apply([], tui.util.map(this.seriesChartTypes, function(chartType) {
                var chartTheme = theme[chartType] || defaultLegendTheme,
                    endIndex = startIndex + this.legendLabels[chartType].length,
                    data = this._setThemeForLabels(joinLegendLabels.slice(startIndex, endIndex), chartTheme);
                startIndex = endIndex;
                return data;
            }, this));
        }
        return result;
    },

    /**
     * To make legend html.
     * @param {array} legendData legend data
     * @returns {string} legend html
     * @private
     */
    _makeLegendHtml: function(legendData) {
        var template = legendTemplate.tplLegend,
            labelHeight = renderUtil.getRenderedLabelHeight(legendData[0].label, legendData[0].theme),
            height = labelHeight + (chartConst.LABEL_PADDING_TOP * 2),
            baseMarginTop = parseInt((height - chartConst.LEGEND_RECT_WIDTH) / 2, 10) - 1,
            html = tui.util.map(legendData, function(legendInfo, index) {
                var borderCssText = legendInfo.borderColor ? renderUtil.concatStr(';border:1px solid ', legendInfo.borderColor) : '',
                    rectMargin, marginTop, data;
                if (legendInfo.chartType === 'line') {
                    marginTop = baseMarginTop + chartConst.LINE_MARGIN_TOP;
                } else {
                    marginTop = baseMarginTop;
                }
                rectMargin = renderUtil.concatStr(';margin-top:', marginTop, 'px');

                data = {
                    cssText: renderUtil.concatStr('background-color:', legendInfo.theme.singleColor || legendInfo.theme.color, borderCssText, rectMargin),
                    height: height,
                    labelHeight: labelHeight,
                    chartType: legendInfo.chartType || 'rect',
                    label: legendInfo.label,
                    index: index
                };
                return template(data);
            }, this).join('');
        return html;
    },

    /**
     * Render css style of label area.
     * @param {HTMLElement} el label area element
     * @param {{fontSize:number, fontFamily: string, color: string}} theme label theme
     * @private
     */
    _renderLabelTheme: function(el, theme) {
        var cssText = renderUtil.makeFontCssText(theme);
        el.style.cssText += ';' + cssText;
    },

    /**
     * Find legend element.
     * @param {HTMLElement} elTarget target element
     * @returns {HTMLElement} legend element
     * @private
     */
    _findLegendElement: function(elTarget) {
        var elLegend;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_LEGEND)) {
            elLegend = elTarget;
        } else {
            elLegend = dom.findParentByClass(elTarget, chartConst.CLASS_NAME_LEGEND);
        }

        return elLegend;
    },

    /**
     * Select legend.
     * @param {number} index index
     * @private
     */
    _selectLegend: function(index) {
        var data = this.legendData[index];
        this.userEvent.fire('selectLegend', {
            legend: data.label,
            chartType: data.chartType,
            index: data.index
        });
    },

    /**
     * On click event handler.
     * @param {MouseEvent} e mouse event
     * @private
     */
    _onClick: function(e) {
        var elTarget = e.target || e.srcElement,
            elLegend = this._findLegendElement(elTarget),
            index;

        if (!elLegend) {
            return;
        }

        index = parseInt(elLegend.getAttribute('data-index'), 10);
        this._selectLegend(index);
    },

    /**
     * Attach browser event.
     * @param {HTMLElement} el target element
     * @private
     */
    _attachEvent: function(el) {
        eventListener.bindEvent('click', el, tui.util.bind(this._onClick, this));
    }
});

module.exports = Legend;

},{"../const":15,"../helpers/domHandler":30,"../helpers/eventListener":31,"../helpers/renderUtil":33,"../themes/defaultTheme":59,"./../legends/legendTemplate":37}],37:[function(require,module,exports){
/**
 * @fileoverview This is templates of legend view.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_LEGEND: '<div class="tui-chart-legend" style="height:{{ height }}px" data-index="{{ index }}">' +
        '<div class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>' +
        '<div class="tui-chart-legend-label" style="height:{{ labelHeight }}px">{{ label }}</div></div>'
};

module.exports = {
    tplLegend: templateMaker.template(tags.HTML_LEGEND)
};

},{"../helpers/templateMaker":34}],38:[function(require,module,exports){
/**
 * @fileoverview Plot component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    calculator = require('../helpers/calculator'),
    renderUtil = require('../helpers/renderUtil'),
    plotTemplate = require('./plotTemplate');

var Plot = tui.util.defineClass(/** @lends Plot.prototype */ {
    /**
     * Plot component.
     * @constructs Plot
     * @param {object} params parameters
     *      @param {number} params.vTickCount vertical tick count
     *      @param {number} params.hTickCount horizontal tick count
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        tui.util.extend(this, params);
        /**
         * Plot view className
         * @type {string}
         */
        this.className = 'tui-chart-plot-area';
    },

    /**
     * To render plot area.
     * @param {HTMLElement} elPlotArea plot area element
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound plot bound
     * @param {object} data rendering data
     * @private
     */
    _renderPlotArea: function(elPlotArea, bound, data) {
        this.bound = bound;
        this.data = data;

        renderUtil.renderDimension(elPlotArea, bound.dimension);
        renderUtil.renderPosition(elPlotArea, bound.position);
        this._renderLines(elPlotArea, bound.dimension);
    },

    /**
     * To render plot component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound plot bound
     * @param {object} data rendering data
     * @returns {HTMLElement} plot element
     */
    render: function(bound, data) {
        var el = dom.create('DIV', this.className);
        this._renderPlotArea(el, bound, data);
        this.elPlotArea = el;
        return el;
    },

    /**
     * To resize plot component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound plot bound
     * @param {object} data rendering data
     */
    resize: function(bound, data) {
        this.elPlotArea.innerHTML = '';
        this._renderPlotArea(this.elPlotArea, bound, data);
    },

    /**
     * Render plot lines.
     * @param {HTMLElement} el element
     * @param {{width: number, height: number}} dimension plot area dimension
     * @private
     */
    _renderLines: function(el, dimension) {
        var hPositions = this._makeHorizontalPixelPositions(dimension.width),
            vPositions = this._makeVerticalPixelPositions(dimension.height),
            theme = this.theme,
            lineHtml = '';

        lineHtml += this._makeLineHtml({
            positions: hPositions,
            size: dimension.height,
            className: 'vertical',
            positionType: 'left',
            sizeType: 'height',
            lineColor: theme.lineColor
        });
        lineHtml += this._makeLineHtml({
            positions: vPositions,
            size: dimension.width,
            className: 'horizontal',
            positionType: 'bottom',
            sizeType: 'width',
            lineColor: theme.lineColor
        });

        el.innerHTML = lineHtml;

        renderUtil.renderBackground(el, theme.background);
    },

    /**
     * To make html of plot line.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions positions
     *      @param {number} params.size width or height
     *      @param {string} params.className line className
     *      @param {string} params.positionType position type (left or bottom)
     *      @param {string} params.sizeType size type (size or height)
     *      @param {string} params.lineColor line color
     * @returns {string} html
     * @private
     */
    _makeLineHtml: function(params) {
        var template = plotTemplate.tplPlotLine,
            lineHtml = tui.util.map(params.positions, function(position) {
                var cssTexts = [
                        renderUtil.concatStr(params.positionType, ':', position, 'px'),
                        renderUtil.concatStr(params.sizeType, ':', params.size, 'px')
                    ], data;

                if (params.lineColor) {
                    cssTexts.push(renderUtil.concatStr('background-color:', params.lineColor));
                }

                data = {className: params.className, cssText: cssTexts.join(';')};
                return template(data);
            }, this).join('');
        return lineHtml;
    },

    /**
     * To make pixel value of vertical positions
     * @param {number} height plot height
     * @returns {array.<number>} positions
     * @private
     */
    _makeVerticalPixelPositions: function(height) {
        var positions = calculator.makeTickPixelPositions(height, this.data.vTickCount);
        positions.shift();
        return positions;
    },

    /**
     * To make pixel value of horizontal positions.
     * @param {number} width plot width
     * @returns {array.<number>} positions
     * @private
     */
    _makeHorizontalPixelPositions: function(width) {
        var positions = calculator.makeTickPixelPositions(width, this.data.hTickCount);
        positions.shift();
        return positions;
    }
});

module.exports = Plot;

},{"../helpers/calculator":28,"../helpers/domHandler":30,"../helpers/renderUtil":33,"./plotTemplate":39}],39:[function(require,module,exports){
/**
 * @fileoverview This is templates of plot view .
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_PLOT_LINE: '<div class="tui-chart-plot-line {{ className }}" style="{{ cssText }}"></div>'
};

module.exports = {
    tplPlotLine: templateMaker.template(tags.HTML_PLOT_LINE)
};

},{"../helpers/templateMaker":34}],40:[function(require,module,exports){
/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChart = require('./raphaelBarChart'),
    LineChart = require('./raphaelLineChart'),
    AreaChart = require('./raphaelAreaChart'),
    PieChart = require('./raphaelPieChart');

var pluginName = 'raphael',
    pluginRaphael;

pluginRaphael = {
    bar: BarChart,
    column: BarChart,
    line: LineChart,
    area: AreaChart,
    pie: PieChart
};

tui.chart.registerPlugin(pluginName, pluginRaphael);

},{"./raphaelAreaChart":41,"./raphaelBarChart":42,"./raphaelLineChart":43,"./raphaelPieChart":45}],41:[function(require,module,exports){
/**
 * @fileoverview Raphael area chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANIMATION_TIME = 700;

var concat = Array.prototype.concat;

/**
 * @classdesc RaphaelAreaChart is graph renderer for area chart.
 * @class RaphaelAreaChart
 * @extends RaphaelLineTypeBase
 */
var RaphaelAreaChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelAreaChart.prototype */ {
    /**
     * Render function of area chart.
     * @param {HTMLElement} container container
     * @param {{groupPositions: array.<array>, dimension: object, theme: object, options: object}} data render data
     * @return {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            groupPositions = data.groupPositions,
            theme = data.theme,
            colors = theme.colors,
            opacity = data.options.hasDot ? 1 : 0,
            groupPaths = this._getAreasPath(groupPositions, data.zeroTop),
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            paper, groupAreas, tooltipLine, selectionDot, groupDots;

        this.paper = paper = Raphael(container, dimension.width, dimension.height);

        groupAreas = this._renderAreas(paper, groupPaths, colors);
        tooltipLine = this._renderTooltipLine(paper, dimension.height);
        selectionDot = this._makeSelectionDot(paper);
        groupDots = this._renderDots(paper, groupPositions, colors, borderStyle);

        if (data.options.hasSelection) {
            this.selectionDot = selectionDot;
            this.selectionColor = theme.selectionColor;
        }

        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.groupPaths = groupPaths;
        this.groupAreas = groupAreas;
        this.tooltipLine = tooltipLine;
        this.groupDots = groupDots;
        this.dotOpacity = opacity;

        return paper;
    },

    /**
     * Render area graph.
     * @param {object} paper paper
     * @param {{start: string, addStart: string}} path path
     * @param {string} color color
     * @returns {array.<object>} raphael object
     * @private
     */
    _renderArea: function(paper, path, color) {
        var result = [],
            area = paper.path([path.start]),
            fillStyle = {
                fill: color,
                opacity: 0.5,
                stroke: color,
                'stroke-opacity': 0
            },
            addArea;

        area.attr(fillStyle);
        result.push(area);

        if (path.addStart) {
            addArea = paper.path([path.addStart]);
            addArea.attr(fillStyle);
            result.push(addArea);
        }
        return result;
    },

    /**
     * Render area graphs.
     * @param {object} paper paper
     * @param {array.<object>} groupPaths group paths
     * @param {array.<string>} colors colors
     * @returns {array} raphael objects
     * @private
     */
    _renderAreas: function(paper, groupPaths, colors) {
        var groupAreas = tui.util.map(groupPaths, function(paths, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return tui.util.map(paths, function(path) {
                var result = {
                    area: this._renderArea(paper, path.area, color),
                    line: raphaelRenderUtil.renderLine(paper, path.line.start, color)
                };
                return result;
            }, this);
        }, this);

        return groupAreas;
    },

    /**
     * Whether minus or not.
     * @param {number} value value
     * @returns {boolean} result boolean
     * @private
     */
    _isMinus: function(value) {
        return value < 0;
    },

    /**
     * Whether plus or not.
     * @param {number} value value
     * @returns {boolean} result boolean
     * @private
     */
    _isPlus: function(value) {
        return value >= 0;
    },

    /**
     * To make height.
     * @param {number} top top
     * @param {number} zeroTop zero position top
     * @returns {number} height
     * @private
     */
    _makeHeight: function(top, zeroTop) {
        return Math.abs(top - zeroTop);
    },

    /**
     * Find middle left
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @param {number} zeroTop zero position top
     * @returns {number} middle left
     * @private
     */
    _findMiddleLeft: function(fromPos, toPos, zeroTop) {
        var tops = [zeroTop - fromPos.top, zeroTop - toPos.top],
            middleLeft, width, fromHeight, toHeight;

        if (tui.util.all(tops, this._isMinus) || tui.util.all(tops, this._isPlus)) {
            return -1;
        }

        fromHeight = this._makeHeight(fromPos.top, zeroTop);
        toHeight = this._makeHeight(toPos.top, zeroTop);
        width = toPos.left - fromPos.left;

        middleLeft = fromPos.left + (width * (fromHeight / (fromHeight + toHeight)));
        return middleLeft;
    },

    /**
     * To make area path.
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @param {number} zeroTop zero position top
     * @returns {string} area path
     * @private
     */
    _makeAreaPath: function(fromPos, toPos, zeroTop) {
        var fromStartPoint = ['M', fromPos.left, ' ', zeroTop],
            fromEndPoint = zeroTop === fromPos.top ? [] : ['L', fromPos.left, ' ', fromPos.top],
            toStartPoint = ['L', toPos.left, ' ', toPos.top],
            toEndPoint = zeroTop === toPos.top ? [] : ['L', toPos.left, ' ', zeroTop];
        return concat.call([], fromStartPoint, fromEndPoint, toStartPoint, toEndPoint).join('');
    },

    /**
     * To make area paths.
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @param {number} zeroTop zero position top
     * @returns {{
     *      start: string,
     *      end: string,
     *      addStart: string,
     *      addEnd: string
     * }} area paths
     * @private
     */
    _makeAreaPaths: function(fromPos, toPos, zeroTop) {
        var middleLeft = this._findMiddleLeft(fromPos, toPos, zeroTop),
            result = {
                start: this._makeAreaPath(fromPos, fromPos, zeroTop)
            },
            middlePos;

        if (this._isPlus(middleLeft)) {
            middlePos = {left: middleLeft, top: zeroTop};
            result.end = this._makeAreaPath(fromPos, middlePos, zeroTop);
            result.addStart = this._makeAreaPath(middlePos, middlePos, zeroTop);
            result.addEnd = this._makeAreaPath(middlePos, toPos, zeroTop);
        } else {
            result.end = this._makeAreaPath(fromPos, toPos, zeroTop);
        }

        return result;
    },

    /**
     * Get area path.
     * @param {array.<array.<object>>} groupPositions positions
     * @param {number} zeroTop zero top
     * @returns {array.<array.<string>>} paths
     * @private
     */
    _getAreasPath: function(groupPositions, zeroTop) {
        var groupPaths = tui.util.map(groupPositions, function(positions) {
            var fromPos = positions[0],
                rest = positions.slice(1);
            return tui.util.map(rest, function(position) {
                var result = {
                    area: this._makeAreaPaths(fromPos, position, zeroTop),
                    line: this.makeLinePath(fromPos, position)
                };
                fromPos = position;
                return result;
            }, this);
        }, this);
        return groupPaths;
    },

    /**
     * Animate area chart.
     * @param {object} area raphael object
     * @param {string} areaPath path
     * @param {number} time play time
     * @param {number} startTime start time
     * @private
     */
    _animateArea: function(area, areaPath, time, startTime) {
        var areaAddEndPath = areaPath.addEnd,
            areaEndPath = areaPath.end;
        if (areaAddEndPath) {
            time = time / 2;
            setTimeout(function() {
                area[1].animate({path: areaAddEndPath, 'stroke-opacity': 0.25}, time);
            }, startTime + time);
        }
        setTimeout(function() {
            area[0].animate({path: areaEndPath, 'stroke-opacity': 0.25}, time);
        }, startTime);
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var time = ANIMATION_TIME / this.groupAreas[0].length,
            that = this,
            startTime = 0;

        this.renderItems(function(dot, groupIndex, index) {
            var area, areaPath;
            if (index) {
                area = that.groupAreas[groupIndex][index - 1];
                areaPath = that.groupPaths[groupIndex][index - 1];
                that.animateLine(area.line, areaPath.line.end, time, startTime);
                that._animateArea(area.area, areaPath.area, time, startTime);
                startTime += time;
            } else {
                startTime = 0;
            }

            if (that.dotOpacity) {
                setTimeout(function() {
                    dot.attr({'fill-opacity': that.dotOpacity});
                }, startTime);
            }
        });

        if (callback) {
            setTimeout(callback, startTime);
        }
    },

    /**
     * To update area attribute
     * @param {object} area raphael object
     * @param {string} areaPath area path
     * @private
     */
    _updateAreaAttr: function(area, areaPath) {
        var areaAddEndPath = areaPath.addEnd;
        area[0].attr({path: areaPath.end});
        if (areaAddEndPath) {
            area[1].attr({path: areaAddEndPath});
        }
    },

    /**
     * To resize graph of area chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {array.<array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var dimension = params.dimension,
            groupPositions = params.groupPositions,
            that = this;

        this.groupPositions = groupPositions;
        this.groupPaths = this._getAreasPath(groupPositions, params.zeroTop);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        this.renderItems(function(dot, groupIndex, index) {
            var position = groupPositions[groupIndex][index],
                dotAttrs = {
                    cx: position.left,
                    cy: position.top
                },
                area, areaPath;
            if (index) {
                area = that.groupAreas[groupIndex][index - 1];
                areaPath = that.groupPaths[groupIndex][index - 1];
                area.line.attr({path: areaPath.line.end});
                that._updateAreaAttr(area.area, areaPath.area);
            }

            if (that.dotOpacity) {
                dotAttrs = tui.util.extend({'fill-opacity': that.dotOpacity}, dotAttrs, that.borderStyle);
            }

            dot.attr(dotAttrs);
        });
    }
});

module.exports = RaphaelAreaChart;

},{"./raphaelLineTypeBase":44,"./raphaelRenderUtil":46}],42:[function(require,module,exports){
/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael;

var ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelBarChart is graph renderer for bar, column chart.
 * @class RaphaelBarChart
 */
var RaphaelBarChart = tui.util.defineClass(/** @lends RaphaelBarChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
     * @return {object} paper raphael paper
     */
    render: function(container, data) {
        var groupBounds = data.groupBounds,
            dimension = data.dimension,
            paper, baseParams;

        if (!groupBounds) {
            return null;
        }

        this.paper = paper = Raphael(container, dimension.width, dimension.height);

        baseParams = {
            paper: paper,
            theme: data.theme,
            groupBounds: groupBounds,
            groupValues: data.groupValues,
            chartType: data.chartType
        };

        this._renderBars(baseParams);

        this._renderBarBorders(baseParams);

        this.theme = data.theme;
        this.groupBounds = groupBounds;
        this.chartType = data.chartType;

        return paper;
    },

    /**
     * Render rect
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {string} params.color series color
     *      @param {string} params.borderColor series borderColor
     *      @param {{left: number, top: number, width: number, height: number}} params.bound bound
     * @returns {object} bar rect
     * @private
     */
    _renderBar: function(params) {
        var bound = params.bound,
            rect;
        if (bound.width < 0 || bound.height < 0) {
            return null;
        }

        rect = params.paper.rect(bound.left, bound.top, bound.width, bound.height);
        rect.attr({
            fill: params.color,
            stroke: 'none'
        });

        return rect;
    },

    /**
     * Render bars.
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{colors: string[], singleColors: string[], borderColor: string}} params.theme bar chart theme
     *      @param {array.<array.<{left: number, top:number, width: number, height: number}>>} params.groupBounds bounds
     * @private
     */
    _renderBars: function(params) {
        var singleColors = (params.groupBounds[0].length === 1) && params.theme.singleColors || [],
            colors = params.theme.colors;
        this.groupBars = tui.util.map(params.groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];
            return tui.util.map(bounds, function(bound, index) {
                var color, rect, value;

                if (!bound) {
                    return null;
                }

                color = singleColor || colors[index];
                value = params.groupValues[groupIndex][index];

                rect = this._renderBar({
                    paper: params.paper,
                    chartType: params.chartType,
                    color: color,
                    borderColor: params.theme.borderColor,
                    bound: bound.start,
                    value: value
                });

                return {
                    rect: rect,
                    color: color,
                    bound: bound.end,
                    value: value,
                    groupIndex: groupIndex,
                    index: index
                };
            }, this);
        }, this);
    },

    /**
     * To make rect points.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @returns {{
     *      leftTop: {left: number, top: number},
     *      rightTop: {left: number, top: number},
     *      rightBottom: {left: number, top: number},
     *      leftBottom: {left: number, top: number}
     * }} rect points
     * @private
     */
    _makeRectPoints: function(bound) {
        return {
            leftTop: {
                left: Math.ceil(bound.left),
                top: Math.ceil(bound.top)
            },
            rightTop: {
                left: Math.ceil(bound.left + bound.width),
                top: Math.ceil(bound.top)
            },
            rightBottom: {
                left: Math.ceil(bound.left + bound.width),
                top: Math.ceil(bound.top + bound.height)
            },
            leftBottom: {
                left: Math.ceil(bound.left),
                top: Math.ceil(bound.top + bound.height)
            }
        };
    },

    /**
     * To make top line path.
     * @param {{left: numbrer, top: number}} leftTop left top
     * @param {{left: numbrer, top: number}} rightTop right top
     * @param {string} chartType chart type
     * @param {number} value value
     * @returns {string} top line path
     * @private
     */
    _makeTopLinePath: function(leftTop, rightTop, chartType, value) {
        var cloneLeftTop = tui.util.extend({}, leftTop);
        cloneLeftTop.left -= chartType === 'column' || value < 0 ? 1 : 0;
        return raphaelRenderUtil.makeLinePath(cloneLeftTop, rightTop);
    },

    /**
     * To make border lines paths.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @returns {{top: string, right: string, bottom: string, left: string}} paths
     * @private
     */
    _makeBorderLinesPaths: function(bound, chartType, value) {
        var points = this._makeRectPoints(bound),
            paths = {};

        if (chartType === 'bar' || value >= 0) {
            paths.top = this._makeTopLinePath(points.leftTop, points.rightTop, chartType, value);
        }

        if (chartType === 'column' || value >= 0) {
            paths.right = raphaelRenderUtil.makeLinePath(points.rightTop, points.rightBottom);
        }

        if (chartType === 'bar' || value < 0) {
            paths.bottom = raphaelRenderUtil.makeLinePath(points.leftBottom, points.rightBottom);
        }

        if (chartType === 'column' || value < 0) {
            paths.left = raphaelRenderUtil.makeLinePath(points.leftTop, points.leftBottom);
        }

        return paths;
    },

    /**
     * Render border lines;
     * @param {object} params parameters
     *      @param {object} params.paper paper
     *      @param {{left: number, top:number, width: number, height: number}} params.bound bar bound
     *      @param {string} params.borderColor border color
     *      @param {string} params.chartType chart type
     *      @param {number} params.value value
     * @returns {object} raphael object
     * @private
     */
    _renderBorderLines: function(params) {
        var borderLinePaths = this._makeBorderLinesPaths(params.bound, params.chartType, params.value),
            lines = {};
        tui.util.forEach(borderLinePaths, function(path, name) {
            lines[name] = raphaelRenderUtil.renderLine(params.paper, path, params.borderColor, 1);
        });
        return lines;
    },

    /**
     * Render bar borders.
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{colors: string[], singleColors: string[], borderColor: string}} params.theme bar chart theme
     *      @param {array.<array.<{left: number, top:number, width: number, height: number}>>} params.groupBounds bounds
     * @private
     */
    _renderBarBorders: function(params) {
        var borderColor = params.theme.borderColor;
        if (!borderColor) {
            return;
        }
        this.groupBorders = tui.util.map(params.groupBounds, function(bounds, groupIndex) {
            return tui.util.map(bounds, function(bound, index) {
                var value;

                if (!bound) {
                    return null;
                }

                value = params.groupValues[groupIndex][index];

                return this._renderBorderLines({
                    paper: params.paper,
                    bound: bound.start,
                    borderColor: borderColor,
                    chartType: params.chartType,
                    value: value
                });
            }, this);
        }, this);
    },

    /**
     * Animate rect.
     * @param {object} rect raphael object
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @private
     */
    _animateRect: function(rect, bound) {
        rect.animate({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        }, ANIMATION_TIME);
    },

    /**
     * Animate borders.
     * @param {array.<object>} lines raphael objects
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @private
     */
    _animateBorders: function(lines, bound, chartType, value) {
        var paths = this._makeBorderLinesPaths(bound, chartType, value);
        tui.util.forEach(lines, function(line, name) {
            line.animate({path: paths[name]}, ANIMATION_TIME);
        });
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        tui.util.forEachArray(this.groupBars, function(bars, groupIndex) {
            var borders = this.groupBorders && this.groupBorders[groupIndex];
            tui.util.forEachArray(bars, function(bar, index) {
                var lines = borders && borders[index];
                this._animateRect(bar.rect, bar.bound);
                if (lines) {
                    this._animateBorders(lines, bar.bound, this.chartType, bar.value);
                }
            }, this);
        }, this);

        if (callback) {
            setTimeout(callback, ANIMATION_TIME);
        }
    },

    /**
     * To update rect attribute
     * @param {object} rect raphael object
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @private
     */
    _updateRectAttr: function(rect, bound) {
        rect.attr({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        });
    },

    /**
     * To update borders attribute
     * @param {array.<object>} lines raphael objects
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @private
     */
    _updateBordersAttr: function(lines, bound, chartType, value) {
        var paths = this._makeBorderLinesPaths(bound, chartType, value);
        tui.util.forEach(lines, function(line, name) {
            line.attr({path: paths[name]});
        });
    },

    /**
     * To resize graph of bar type chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {array.<array.<{left:number, top:number, width: number, height: number}>>} params.groupBounds group bounds
     */
    resize: function(params) {
        var dimension = params.dimension,
            groupBounds = params.groupBounds;

        this.groupBounds = groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        tui.util.forEachArray(this.groupBars, function(bars, groupIndex) {
            var borders = this.groupBorders && this.groupBorders[groupIndex];
            tui.util.forEachArray(bars, function(bar, index) {
                var lines = borders && borders[index],
                    bound = groupBounds[groupIndex][index].end;
                bar.bound = bound;
                this._updateRectAttr(bar.rect, bound);
                if (lines) {
                    this._updateBordersAttr(lines, bound, this.chartType, bar.value);
                }
            }, this);
        }, this);
    },

    /**
     * Change borders color.
     * @param {array.<object>} lines raphael objects
     * @param {borderColor} borderColor border color
     * @private
     */
    _changeBordersColor: function(lines, borderColor) {
        tui.util.forEach(lines, function(line) {
            line.attr({stroke: borderColor});
        });
    },

    /**
     * To change bar color.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} color fill color
     * @param {?string} borderColor stroke color
     * @private
     */
    _changeBarColor: function(indexes, color, borderColor) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            lines;

        bar.rect.attr({
            fill: color
        });

        if (borderColor) {
            lines = this.groupBorders[indexes.groupIndex][indexes.index];
            this._changeBordersColor(lines, borderColor);
        }
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            objColor = Raphael.color(bar.color),
            color = this.theme.selectionColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, 0.2),
            borderColor = this.theme.borderColor,
            objBorderColor;

        if (borderColor) {
            objBorderColor = Raphael.color(borderColor);
            borderColor = raphaelRenderUtil.makeChangedLuminanceColor(objBorderColor.hex, 0.2);
        }

        this._changeBarColor(indexes, color, borderColor);
    },

    /**
     * Unselect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            borderColor = this.theme.borderColor;
        this._changeBarColor(indexes, bar.color, borderColor);
    }
});

module.exports = RaphaelBarChart;

},{"./raphaelRenderUtil":46}],43:[function(require,module,exports){
/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelLineCharts is graph renderer for line chart.
 * @class RaphaelLineChart
 * @extends RaphaelLineTypeBase
 */
var RaphaelLineChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelLineChart.prototype */ {
    /**
     * Render function of line chart.
     * @param {HTMLElement} container container
     * @param {{groupPositions: array.<array>, dimension: object, theme: object, options: object}} data render data
     * @return {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            groupPositions = data.groupPositions,
            theme = data.theme,
            colors = theme.colors,
            opacity = data.options.hasDot ? 1 : 0,
            groupPaths = this._getLinesPath(groupPositions),
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            paper, groupLines, tooltipLine, selectionDot, groupDots;

        this.paper = paper = Raphael(container, dimension.width, dimension.height);

        groupLines = this._renderLines(paper, groupPaths, colors);
        tooltipLine = this._renderTooltipLine(paper, dimension.height);
        selectionDot = this._makeSelectionDot(paper);
        groupDots = this._renderDots(paper, groupPositions, colors, borderStyle);

        if (data.options.hasSelection) {
            this.selectionDot = selectionDot;
            this.selectionColor = theme.selectionColor;
        }

        this.borderStyle = borderStyle;
        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.groupPaths = groupPaths;
        this.groupLines = groupLines;
        this.tooltipLine = tooltipLine;
        this.groupDots = groupDots;
        this.dotOpacity = opacity;

        return paper;
    },

    /**
     * Get lines path.
     * @param {array.<array.<object>>} groupPositions positions
     * @returns {array.<array.<string>>} paths
     * @private
     */
    _getLinesPath: function(groupPositions) {
        var groupPaths = tui.util.map(groupPositions, function(positions) {
            var fromPos = positions[0],
                rest = positions.slice(1);
            return tui.util.map(rest, function(position) {
                var result = this.makeLinePath(fromPos, position);
                fromPos = position;
                return result;
            }, this);
        }, this);
        return groupPaths;
    },

    /**
     * Render lines.
     * @param {object} paper raphael paper
     * @param {array.<array.<string>>} groupPaths paths
     * @param {string[]} colors line colors
     * @param {number} strokeWidth stroke width
     * @returns {array.<array.<object>>} lines
     * @private
     */
    _renderLines: function(paper, groupPaths, colors, strokeWidth) {
        var groupLines = tui.util.map(groupPaths, function(paths, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return tui.util.map(paths, function(path) {
                return raphaelRenderUtil.renderLine(paper, path.start, color, strokeWidth);
            }, this);
        }, this);

        return groupLines;
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var time = ANIMATION_TIME / this.groupLines[0].length,
            that = this,
            startTime = 0;
        this.renderItems(function(dot, groupIndex, index) {
            var line, path;

            if (index) {
                line = that.groupLines[groupIndex][index - 1];
                path = that.groupPaths[groupIndex][index - 1].end;
                that.animateLine(line, path, time, startTime);
                startTime += time;
            } else {
                startTime = 0;
            }

            if (that.dotOpacity) {
                setTimeout(function() {
                    dot.attr(tui.util.extend({'fill-opacity': that.dotOpacity}, that.borderStyle));
                }, startTime);
            }
        });

        if (callback) {
            setTimeout(callback, startTime);
        }
    },

    /**
     * To resize graph of line chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {array.<array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var dimension = params.dimension,
            groupPositions = params.groupPositions,
            that = this;

        this.groupPositions = groupPositions;
        this.groupPaths = this._getLinesPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        this.renderItems(function(dot, groupIndex, index) {
            var position = groupPositions[groupIndex][index],
                dotAttrs = {
                    cx: position.left,
                    cy: position.top
                },
                line, path;
            if (index) {
                line = that.groupLines[groupIndex][index - 1];
                path = that.groupPaths[groupIndex][index - 1].end;
                line.attr({path: path});
            }

            if (that.dotOpacity) {
                dotAttrs = tui.util.extend({'fill-opacity': that.dotOpacity}, dotAttrs, that.borderStyle);
            }

            dot.attr(dotAttrs);
        });
    }
});

module.exports = RaphaelLineChart;

},{"./raphaelLineTypeBase":44,"./raphaelRenderUtil":46}],44:[function(require,module,exports){
/**
 * @fileoverview RaphaelLineTypeBase is base class for line type renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var DEFAULT_DOT_RADIUS = 3,
    HOVER_DOT_RADIUS = 4,
    SELECTION_DOT_RADIOUS = 7;

/**
 * @classdesc RaphaelLineTypeBase is base for line type renderer.
 * @class RaphaelLineTypeBase
 */
var RaphaelLineTypeBase = tui.util.defineClass(/** @lends RaphaelLineTypeBase.prototype */ {
    /**
     * To make line paths.
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @returns {{start: string, end: string}} line paths.
     */
    makeLinePath: function(fromPos, toPos) {
        var startLinePath = raphaelRenderUtil.makeLinePath(fromPos, fromPos),
            endLinePath = raphaelRenderUtil.makeLinePath(fromPos, toPos);
        return {
            start: startLinePath,
            end: endLinePath
        };
    },

    /**
     * Render tooltip line.
     * @param {object} paper raphael paper
     * @param {number} height height
     * @returns {object} raphael object
     * @private
     */
    _renderTooltipLine: function(paper, height) {
        var linePath = raphaelRenderUtil.makeLinePath({
                left: 10,
                top: height
            }, {
                left: 10,
                top: 0
            });
        return raphaelRenderUtil.renderLine(paper, linePath, 'transparent', 1);
    },

    /**
     * To make border style.
     * @param {string} borderColor border color
     * @param {number} opacity opacity
     * @returns {{stroke: string, stroke-width: number, strike-opacity: number}} border style
     */
    makeBorderStyle: function(borderColor, opacity) {
        var borderStyle;
        if (borderColor) {
            borderStyle = {
                stroke: borderColor,
                'stroke-width': 1,
                'stroke-opacity': opacity
            };
        }
        return borderStyle;
    },

    /**
     * To make dot style for mouseout event.
     * @param {number} opacity opacity
     * @param {object} borderStyle border style
     * @returns {{fill-opacity: number, stroke-opacity: number, r: number}} style
     */
    makeOutDotStyle: function(opacity, borderStyle) {
        var outDotStyle = {
            'fill-opacity': opacity,
            'stroke-opacity': 0,
            r: DEFAULT_DOT_RADIUS
        };

        if (borderStyle) {
            tui.util.extend(outDotStyle, borderStyle);
        }

        return outDotStyle;
    },

    /**
     * Render dot.
     * @param {object} paper raphael papaer
     * @param {{left: number, top: number}} position dot position
     * @param {string} color dot color
     * @param {object} borderStyle border style
     * @returns {object} raphael dot
     */
    renderDot: function(paper, position, color) {
        var dot = paper.circle(position.left, position.top, DEFAULT_DOT_RADIUS),
            dotStyle = {
                fill: color,
                'fill-opacity': 0,
                'stroke-opacity': 0
            };

        dot.attr(dotStyle);

        return {
            dot: dot,
            color: color
        };
    },

    /**
     * Render dots.
     * @param {object} paper raphael paper
     * @param {array.<array.<object>>} groupPositions positions
     * @param {string[]} colors colors
     * @param {object} borderStyle border style
     * @returns {array.<object>} dots
     * @private
     */
    _renderDots: function(paper, groupPositions, colors) {
        var dots = tui.util.map(groupPositions, function(positions, groupIndex) {
            var color = colors[groupIndex];
            return tui.util.map(positions, function(position) {
                var dot = this.renderDot(paper, position, color);
                return dot;
            }, this);
        }, this);

        return dots;
    },

    /**
     * Get center position
     * @param {{left: number, top: number}} fromPos from position
     * @param {{left: number, top: number}} toPos to position
     * @returns {{left: number, top: number}} position
     * @private
     */
    _getCenter: function(fromPos, toPos) {
        return {
            left: (fromPos.left + toPos.left) / 2,
            top: (fromPos.top + toPos.top) / 2
        };
    },

    /**
     * Show dot.
     * @param {object} dot raphael object
     * @private
     */
    _showDot: function(dot) {
        dot.attr({
            'fill-opacity': 1,
            'stroke-opacity': 0.3,
            'stroke-width': 2,
            r: HOVER_DOT_RADIUS
        });
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            item = this.groupDots[groupIndex][index];
        this._showDot(item.dot);
    },

    /**
     * Get pivot group dots.
     * @returns {array.<array>} dots
     * @private
     */
    _getPivotGroupDots: function() {
        if (!this.pivotGroupDots) {
            this.pivotGroupDots = tui.util.pivot(this.groupDots);
        }

        return this.pivotGroupDots;
    },

    /**
     * Show group dots.
     * @param {number} index index
     * @private
     */
    _showGroupDots: function(index) {
        var groupDots = this._getPivotGroupDots();
        tui.util.forEachArray(groupDots[index], function(item) {
            this._showDot(item.dot);
        }, this);
    },

    /**
     * Show line for group tooltip.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    showGroupTooltipLine: function(bound) {
        var linePath = raphaelRenderUtil.makeLinePath({
            left: bound.position.left,
            top: bound.dimension.height
        }, {
            left: bound.position.left,
            top: bound.position.top
        });
        this.tooltipLine.attr({
            path: linePath,
            stroke: '#999',
            'stroke-opacity': 1
        });
    },

    /**
     * Show group animation.
     * @param {number} index index
     */
    showGroupAnimation: function(index) {
        this._showGroupDots(index);
    },

    /**
     * Hide dot.
     * @param {object} dot raphael object
     * @private
     */
    _hideDot: function(dot) {
        dot.attr(this.outDotStyle);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} data hide info
     */
    hideAnimation: function(data) {
        var index = data.groupIndex, // Line chart has pivot values.
            groupIndex = data.index,
            item = this.groupDots[groupIndex][index];
        if (item) {
            this._hideDot(item.dot);
        }
    },

    /**
     * Hide group dots.
     * @param {number} index index
     * @private
     */
    _hideGroupDots: function(index) {
        var dots = this._getPivotGroupDots();
        tui.util.forEachArray(dots[index], function(item) {
            this._hideDot(item.dot);
        }, this);
    },

    /**
     * Hide line for group tooltip.
     * @private
     */
    hideGroupTooltipLine: function() {
        this.tooltipLine.attr({
            'stroke-opacity': 0
        });
    },

    /**
     * Hide group animation.
     * @param {number} index index
     */
    hideGroupAnimation: function(index) {
        this._hideGroupDots(index);
    },

    /**
     * Animate line.
     * @param {object} line raphael object
     * @param {string} linePath line path
     * @param {number} time play time
     * @param {number} startTime start time
     */
    animateLine: function(line, linePath, time, startTime) {
        setTimeout(function() {
            line.animate({path: linePath}, time);
        }, startTime);
    },

    /**
     * To render items of line type chart.
     * @param {function} funcRenderItem function
     */
    renderItems: function(funcRenderItem) {
        tui.util.forEachArray(this.groupDots, function(dots, groupIndex) {
            tui.util.forEachArray(dots, function(item, index) {
                funcRenderItem(item.dot, groupIndex, index);
            }, this);
        }, this);
    },

    /**
     * To make selection dot.
     * @param {object} paper raphael paper
     * @returns {object} selection dot
     * @private
     */
    _makeSelectionDot: function(paper) {
        var selectionDot = paper.circle(0, 0, SELECTION_DOT_RADIOUS);
        selectionDot.attr({
            'fill': '#ffffff',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'stroke-width': 2
        });
        return selectionDot;
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var item = this.groupDots[indexes.index][indexes.groupIndex],
            position = this.groupPositions[indexes.index][indexes.groupIndex];
        this.selectedItem = item;
        this.selectionDot.attr({
            cx: position.left,
            cy: position.top,
            'fill-opacity': 0.5,
            'stroke-opacity': 1,
            stroke: this.selectionColor || item.color
        });
    },

    /**
     * Unselect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var item = this.groupDots[indexes.index][indexes.groupIndex];

        if (this.selectedItem === item) {
            this.selectionDot.attr({
                'fill-opacity': 0,
                'stroke-opacity': 0
            });
        }
    }
});

module.exports = RaphaelLineTypeBase;

},{"./raphaelRenderUtil":46}],45:[function(require,module,exports){
/**
 * @fileoverview RaphaelPieCharts is graph renderer for pie chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANGLE_180 = 180,
    RAD = Math.PI / ANGLE_180,
    ANIMATION_TIME = 500,
    LOADING_ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelPieCharts is graph renderer for pie chart.
 * @class RaphaelPieChart
 */
var RaphaelPieChart = tui.util.defineClass(/** @lends RaphaelPieChart.prototype */ {
    /**
     * Render function of pie chart.
     * @param {HTMLElement} container container
     * @param {{sectorsInfo: array.<object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {object} callbacks callbacks
     *      @param {function} callbacks.funcShowTooltip show tooltip function
     *      @param {function} callbacks.funcHideTooltip hide tooltip function
     *      @param {function} callbacks.funcSelectSeries select series function
     * @return {object} paper raphael paper
     */
    render: function(container, data, callbacks) {
        var dimension = data.dimension,
            paper;

        this.paper = paper = Raphael(container, dimension.width, dimension.height);

        if (!paper.customAttributes.sector) {
            paper.customAttributes.sector = tui.util.bind(this._makeSectorPath, this);
        }

        this.selectionColor = data.theme.selectionColor;
        this.circleBound = data.circleBound;
        this._renderPie(paper, data, callbacks);

        return paper;
    },

    /**
     * To make sector path.
     * @param {number} cx center x
     * @param {number} cy center y
     * @param {number} r radius
     * @param {number} startAngle start angle
     * @param {number} endAngle end angel
     * @returns {{path: array}} sector path
     * @private
     */
    _makeSectorPath: function(cx, cy, r, startAngle, endAngle) {
        var x1 = cx + r * Math.sin(startAngle * RAD), // 원 호의 시작 x 좌표
            y1 = cy - r * Math.cos(startAngle * RAD), // 원 호의 시작 y 좌표
            x2 = cx + r * Math.sin(endAngle * RAD),// 원 호의 종료 x 좌표
            y2 = cy - r * Math.cos(endAngle * RAD), // 원 호의 종료 y 좌표
            largeArcFlag = endAngle - startAngle > ANGLE_180 ? 1 : 0,
            path = ["M", cx, cy,
                "L", x1, y1,
                "A", r, r, 0, largeArcFlag, 1, x2, y2,
                "Z"
            ];
        // path에 대한 자세한 설명은 아래 링크를 참고
        // http://www.w3schools.com/svg/svg_path.asp
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
        return {path: path};
    },

    /**
     * Render sector
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{cx: number, cy: number, r:number}} params.circleBound circle bounds
     *      @param {number} params.startAngle start angle
     *      @param {number} params.endAngle end angle
     *      @param {{fill: string, stroke: string, strike-width: string}} params.attrs attrs
     * @returns {object} raphael object
     * @private
     */
    _renderSector: function (params) {
        var circleBound = params.circleBound,
            angles = params.angles;
        return params.paper.path().attr({
            sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
        }).attr(params.attrs);
    },

    /**
     * Render pie graph.
     * @param {object} paper raphael paper
     * @param {{sectorsInfo: array.<object>, circleBound: {cx: number, cy: number, r: number}, dimension: object, theme: object, options: object}} data render data
     * @param {object} callbacks callbacks
     *      @param {function} callbacks.funcShowTooltip show tooltip function
     *      @param {function} callbacks.funcHideTooltip hide tooltip function
     *      @param {function} callbacks.funcSelectSeries select series function
     * @private
     */
    _renderPie: function(paper, data, callbacks) {
        var circleBound = data.circleBound,
            colors = data.theme.colors,
            chartBackground = data.chartBackground,
            sectors = [];

        tui.util.forEachArray(data.sectorsInfo, function(sectorInfo, index) {
            var percentValue = sectorInfo.percentValue,
                color = colors[index],
                sector = this._renderSector({
                    paper: paper,
                    circleBound: circleBound,
                    angles: sectorInfo.angles.start,
                    attrs: {
                        fill: color,
                        stroke: chartBackground,
                        'stroke-width': 1
                    }
                });

            this._bindHoverEvent(sector, index, callbacks);

            sectors.push({
                sector: sector,
                color: color,
                angles: sectorInfo.angles.end,
                percentValue: percentValue
            });
        }, this);

        this.sectors = sectors;
    },

    /**
     * Render legend lines.
     * @param {array.<object>} outerPositions outer position
     */
    renderLegendLines: function(outerPositions) {
        var that = this,
            paths;

        if (this.legendLines) {
            return;
        }

        paths = this._makeLinePaths(outerPositions);
        this.legendLines = tui.util.map(paths, function(path) {
            return raphaelRenderUtil.renderLine(that.paper, path, 'transparent', 1);
        });
    },

    /**
     * To make line paths.
     * @param {array.<object>} outerPositions outer positions
     * @returns {Array} line paths.
     * @private
     */
    _makeLinePaths: function(outerPositions) {
        var paths = tui.util.map(outerPositions, function(positions) {
            return [
                raphaelRenderUtil.makeLinePath(positions.start, positions.middle),
                raphaelRenderUtil.makeLinePath(positions.middle, positions.end),
                'Z'
            ].join('');
        }, this);
        return paths;
    },

    /**
     * Bind hover event.
     * @param {object} target raphael item
     * @param {number} index index
     * @param {object} callbacks callbacks
     *      @param {function} callbacks.funcShowTooltip show tooltip function
     *      @param {function} callbacks.funcHideTooltip hide tooltip function
     *      @param {function} callbacks.funcSelectSeries select series function
     * @private
     */
    _bindHoverEvent: function(target, index, callbacks) {
        var args = [{}, 0, index],
            isOn = false,
            throttled = tui.util.throttle(function() {
                if (!isOn) {
                    return;
                }
                callbacks.funcShowTooltip.apply(null, arguments);
            }, 100);

        target.mouseover(function (e) {
            var _args = args.concat({
                clientX: e.clientX,
                clientY: e.clientY
            });
            isOn = true;
            callbacks.funcShowTooltip.apply(null, _args);
        }).mousemove(function(e) {
            var _args = args.concat({
                clientX: e.clientX,
                clientY: e.clientY - 10
            });
            throttled.apply(null, _args);
        }).mouseout(function () {
            isOn = false;
            callbacks.funcHideTooltip();
        }).click(function() {
            callbacks.funcSelectSeries(index);
        });
    },

    /**
     * To expand selector radius.
     * @param {object} sector pie sector
     */
    _expandSector: function(sector) {
        var cx = this.circleBound.cx,
            cy = this.circleBound.cy;
        sector.animate({
            transform: "s1.1 1.1 " + cx + " " + cy
        }, ANIMATION_TIME, "elastic");
    },

    /**
     * To restore selector radius.
     * @param {object} sector pie sector
     */
    _restoreSector: function(sector) {
        sector.animate({transform: ""}, ANIMATION_TIME, "elastic");
    },

    /**
     * Show animation.
     * @param {{index: number}} data data
     */
    showAnimation: function(data) {
        var sector = this.sectors[data.index].sector;
        this._expandSector(sector);
    },

    /**
     * Hide animation.
     * @param {{index: number}} data data
     */
    hideAnimation: function(data) {
        var sector = this.sectors[data.index].sector;
        this._restoreSector(sector);
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var delayTime = 0,
            circleBound = this.circleBound;
        tui.util.forEachArray(this.sectors, function(item) {
            var angles = item.angles,
                animationTime = LOADING_ANIMATION_TIME * item.percentValue,
                anim = Raphael.animation({
                    sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
                }, animationTime);
            item.sector.animate(anim.delay(delayTime));
            delayTime += animationTime;
        }, this);

        if (callback) {
            setTimeout(callback, delayTime);
        }
    },

    /**
     * Animate legend lines.
     */
    animateLegendLines: function() {
        if (!this.legendLines) {
            return;
        }
        tui.util.forEachArray(this.legendLines, function(line) {
            line.animate({
                'stroke': 'black',
                'stroke-opacity': 1
            });
        });
    },


    /**
     * To resize graph of pie chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {{cx:number, cy:number, r: number}} params.circleBound circle bound
     */
    resize: function(params) {
        var dimension = params.dimension,
            circleBound = params.circleBound;

        this.circleBound = circleBound;
        this.paper.setSize(dimension.width, dimension.height);

        tui.util.forEachArray(this.sectors, function(item) {
            var angles = item.angles;
            item.sector.attr({
                sector: [circleBound.cx, circleBound.cy, circleBound.r, angles.startAngle, angles.endAngle]
            });
        }, this);
    },

    /**
     * To move legend lines.
     * @param {array.<object>} outerPositions outer positions
     */
    moveLegendLines: function(outerPositions) {
        var paths;
        if (!this.legendLines) {
            return;
        }

        paths = this._makeLinePaths(outerPositions)
        tui.util.forEachArray(this.legendLines, function(line, index) {
            line.attr({path: paths[index]});
            return line;
        });
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var item = this.sectors[indexes.index],
            objColor = Raphael.color(item.color),
            color = this.selectionColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, 0.2);
        item.sector.attr({
            fill: color
        });
    },

    /**
     * Unelect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var sector = this.sectors[indexes.index];
        sector.sector.attr({
            fill: sector.color
        });
    }
});

module.exports = RaphaelPieChart;

},{"./raphaelRenderUtil":46}],46:[function(require,module,exports){
/**
 * @fileoverview Util for raphael rendering.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Util for raphael rendering.
 * @module raphaelRenderUtil
 */
var raphaelRenderUtil = {
    /**
     * To make line path.
     * @memberOf module:raphaelRenderUtil
     * @param {{top: number, left: number}} fromPos from position
     * @param {{top: number, left: number}} toPos to position
     * @param {number} width width
     * @returns {string} path
     */
    makeLinePath: function(fromPos, toPos, width) {
        var fromPoint = [fromPos.left, fromPos.top],
            toPoint = [toPos.left, toPos.top];

        width = width || 1;

        tui.util.forEachArray(fromPoint, function(from, index) {
            if (from === toPoint[index]) {
                fromPoint[index] = toPoint[index] = Math.round(from) - (width % 2 / 2);
            }
        });
        return 'M' + fromPoint.join(' ') + 'L' + toPoint.join(' ');
    },

    /**
     * Render line.
     * @memberOf module:raphaelRenderUtil
     * @param {object} paper raphael paper
     * @param {string} path line path
     * @param {string} color line color
     * @param {number} strokeWidth stroke width
     * @returns {object} raphael line
     */
    renderLine: function(paper, path, color, strokeWidth) {
        var line = paper.path([path]),
            strokeStyle = {
                stroke: color,
                'stroke-width': strokeWidth || 2
            };

        if (color === 'transparent') {
            strokeStyle.stroke = '#fff';
            strokeStyle['stroke-opacity'] = 0;
        }
        line.attr(strokeStyle);

        return line;
    },

    /**
     * To make changed luminance color.
     * http://www.sitepoint.com/javascript-generate-lighter-darker-color/
     * @param {string} hex hax color
     * @param {number} lum luminance
     * @returns {string} changed color
     */
    makeChangedLuminanceColor: function (hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');

        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        lum = lum || 0;

        // convert to decimal and change luminosity
        return '#' + tui.util.map(tui.util.range(3), function(index) {
            var c = parseInt(hex.substr(index * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            return ("00" + c).substr(c.length);
        }).join('');
    }
};

module.exports = raphaelRenderUtil;

},{}],47:[function(require,module,exports){
if (!window.JSON) {
    window.JSON = {
        parse: function(sJSON) { return eval('(' + sJSON + ')'); },
        stringify: (function () {
            var toString = Object.prototype.toString;
            var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
            var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
            var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
            var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
            return function stringify(value) {
                if (value == null) {
                    return 'null';
                } else if (typeof value === 'number') {
                    return isFinite(value) ? value.toString() : 'null';
                } else if (typeof value === 'boolean') {
                    return value.toString();
                } else if (typeof value === 'object') {
                    if (typeof value.toJSON === 'function') {
                        return stringify(value.toJSON());
                    } else if (isArray(value)) {
                        var res = '[';
                        for (var i = 0; i < value.length; i++)
                            res += (i ? ', ' : '') + stringify(value[i]);
                        return res + ']';
                    } else if (toString.call(value) === '[object Object]') {
                        var tmp = [];
                        for (var k in value) {
                            if (value.hasOwnProperty(k))
                                tmp.push(stringify(k) + ': ' + stringify(value[k]));
                        }
                        return '{' + tmp.join(', ') + '}';
                    }
                }
                return '"' + value.toString().replace(escRE, escFunc) + '"';
            };
        })()
    };
}

},{}],48:[function(require,module,exports){
'use strict';

var chartConst = require('./const'),
    chartFactory = require('./factories/chartFactory'),
    BarChart = require('./charts/barChart'),
    ColumnChart = require('./charts/columnChart'),
    LineChart = require('./charts/lineChart'),
    AreaChart = require('./charts/areaChart'),
    ComboChart = require('./charts/comboChart'),
    PieChart = require('./charts/pieChart');

chartFactory.register(chartConst.CHART_TYPE_BAR, BarChart);
chartFactory.register(chartConst.CHART_TYPE_COLUMN, ColumnChart);
chartFactory.register(chartConst.CHART_TYPE_LINE, LineChart);
chartFactory.register(chartConst.CHART_TYPE_AREA, AreaChart);
chartFactory.register(chartConst.CHART_TYPE_COMBO, ComboChart);
chartFactory.register(chartConst.CHART_TYPE_PIE, PieChart);

},{"./charts/areaChart":4,"./charts/barChart":6,"./charts/columnChart":8,"./charts/comboChart":9,"./charts/lineChart":10,"./charts/pieChart":12,"./const":15,"./factories/chartFactory":23}],49:[function(require,module,exports){
'use strict';

var chartConst = require('./const'),
    themeFactory = require('./factories/themeFactory'),
    defaultTheme = require('./themes/defaultTheme');

themeFactory.register(chartConst.DEFAULT_THEME_NAME, defaultTheme);

},{"./const":15,"./factories/themeFactory":25,"./themes/defaultTheme":59}],50:[function(require,module,exports){
/**
 * @fileoverview Area chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase');

var AreaChartSeries = tui.util.defineClass(Series, /** @lends AreaChartSeries.prototype */ {
    /**
     * Area chart series component.
     * @constructs AreaChartSeries
     * @extends Series
     * @mixes LineTypeSeriesBase
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make series data.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @returns {object} series data
     */
    makeSeriesData: function(bound) {
        var dimension = bound.dimension,
            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension.height, this.data.scale),
            zeroTop = scaleDistance.toMax;
        if (this.data.scale.min >= 0 && !zeroTop) {
            zeroTop = dimension.height;
        }

        return {
            groupPositions: this.makePositions(dimension),
            zeroTop: zeroTop
        };
    }
});

LineTypeSeriesBase.mixin(AreaChartSeries);

module.exports = AreaChartSeries;

},{"./lineTypeSeriesBase":55,"./series":57}],51:[function(require,module,exports){
/**
 * @fileoverview Bar chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

var BarChartSeries = tui.util.defineClass(Series, /** @lends BarChartSeries.prototype */ {
    /**
     * Bar chart series component.
     * @constructs BarChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make bound of bar chart.
     * @param {object} params parameters
     *      @param {{top: number, height: number}} params.baseBound base bound
     *      @param {number} params.startLeft start left
     *      @param {number} params.endLeft end left
     *      @param {number} params.endWidth end width
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBarChartBound: function(params) {
        return {
            start: tui.util.extend({
                left: params.startLeft,
                width: 0
            }, params.baseBound),
            end: tui.util.extend({
                left: params.endLeft,
                width: params.endWidth
            }, params.baseBound)
        };
    },

    /**
     * To make normal bar chart bound.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupValues: array.<array.<number>>,
     *      groupSize: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} baseInfo base info
     * @param {number} value value
     * @param {number} paddingTop padding top
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeNormalBarChartBound: function(baseInfo, value, paddingTop, index) {
        var startLeft, endWidth, bound, baseBound;

        startLeft = baseInfo.distanceToMin + chartConst.SERIES_EXPAND_SIZE;
        endWidth = Math.abs(value * baseInfo.dimension.width);
        baseBound = {
            top: paddingTop + ((baseInfo.step) * index),
            height: baseInfo.barSize
        };
        bound = this._makeBarChartBound({
            baseBound: baseBound,
            startLeft: startLeft,
            endLeft: startLeft + (value < 0 ? -endWidth : 0),
            endWidth: endWidth
        });

        return bound;
    },

    /**
     * To make bounds of normal bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalBarChartBounds: function(dimension) {
        var baseInfo = this.makeBaseInfoForNormalChartBounds(dimension, 'width', 'height'),
            bounds;

        bounds = tui.util.map(baseInfo.groupValues, function(values, groupIndex) {
            var paddingTop = (baseInfo.groupSize * groupIndex) + baseInfo.additionPadding;
            return tui.util.map(values, function (value, index) {
                return this._makeNormalBarChartBound(baseInfo, value, paddingTop, index);
            }, this);
        }, this);

        return bounds;
    },

    /**
     * To make bounds of stacked bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeStackedBarChartBounds: function(dimension) {
        var groupValues, groupHeight, barHeight,
            optionHeight, additionPadding, bounds;
        groupValues = this.percentValues;
        groupHeight = (dimension.height / groupValues.length);
        barHeight = groupHeight / 2;
        optionHeight = this._makeOptionSize(barHeight, this.options.barWidth);
        additionPadding = this._makeAdditionPadding(barHeight, optionHeight, 1);
        barHeight = optionHeight || barHeight;
        bounds = tui.util.map(groupValues, function (values, groupIndex) {
            var paddingTop = (groupHeight * groupIndex) + additionPadding,
                endLeft = chartConst.SERIES_EXPAND_SIZE;
            return tui.util.map(values, function (value) {
                var endWidth, baseBound, bound;

                if (value < 0) {
                    return null;
                }

                endWidth = value * dimension.width;
                baseBound = {
                    top: paddingTop,
                    height: optionHeight || barHeight
                };
                bound = this._makeBarChartBound({
                    baseBound: baseBound,
                    startLeft: chartConst.SERIES_EXPAND_SIZE,
                    endLeft: endLeft,
                    endWidth: endWidth
                });

                endLeft = endLeft + endWidth;
                return bound;
            }, this);
        }, this);
        return bounds;
    },


    /**
     * To make bounds of bar chart.
     * @param {{width: number, height:number}} dimension bar chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalBarChartBounds(dimension);
        } else {
            return this._makeStackedBarChartBounds(dimension);
        }
    },

    /**
     * To make series rendering position
     * @param {obeject} params parameters
     *      @param {number} params.value value
     *      @param {{left: number, top: number, width:number, height: number}} params.bound bound
     *      @param {string} params.formattedValue formatted value
     *      @param {number} params.labelHeight label height
     * @returns {{left: number, top: number}} rendering position
     */
    makeSeriesRenderingPosition: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.formattedValue, this.theme.label),
            bound = params.bound,
            left = bound.left,
            top = bound.top + (bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2;

        if (params.value >= 0) {
            left += bound.width + chartConst.SERIES_LABEL_PADDING;
        } else {
            left -= labelWidth + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * To make sum label html.
     * @param {object} params parameters
     *      @param {array.<number>} params.values values
     *      @param {array.<function>} params.formatFunctions formatting functions
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {number} params.labelHeight label height
     * @returns {string} sum label html
     */
    makeSumLabelHtml: function(params) {
        var sum = this.makeSumValues(params.values, params.formatFunctions),
            bound = params.bound,
            labelHeight = renderUtil.getRenderedLabelHeight(sum, this.theme.label),
            top = bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2),
            left = bound.left + bound.width + chartConst.SERIES_LABEL_PADDING;

        return this.makeSeriesLabelHtml({
            left: left,
            top: top
        }, sum, -1, -1);
    }
});

BarTypeSeriesBase.mixin(BarChartSeries);

module.exports = BarChartSeries;

},{"../const":15,"../helpers/renderUtil":33,"./barTypeSeriesBase":52,"./series":57}],52:[function(require,module,exports){
/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

var BarTypeSeriesBase = tui.util.defineClass(/** @lends BarTypeSeriesBase.prototype */ {
    /**
     * To make series data.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @returns {object} add data
     */
    makeSeriesData: function(bound) {
        var groupBounds = this._makeBounds(bound.dimension);

        this.groupBounds = groupBounds;

        return {
            groupBounds: groupBounds,
            groupValues: this.percentValues
        };
    },

    /**
     * To make bar gutter.
     * @param {number} groupSize bar group size
     * @param {number} itemCount group item count
     * @returns {number} bar gutter
     * @private
     */
    _makeBarGutter: function(groupSize, itemCount) {
        var baseSize = groupSize / (itemCount + 1) / 2,
            gutter;
        if (baseSize <= 2) {
            gutter = 0;
        } else if (baseSize <= 6) {
            gutter = 2;
        } else {
            gutter = 4;
        }
        return gutter;
    },

    /**
     * To make bar size.
     * @param {number} groupSize bar group size
     * @param {number} barGutter bar padding
     * @param {number} itemCount group item count
     * @returns {number} bar size (width or height)
     * @private
     */
    _makeBarSize: function(groupSize, barGutter, itemCount) {
        return (groupSize - (barGutter * (itemCount - 1))) / (itemCount + 1);
    },

    /**
     * To make option size.
     * @param {number} barSize bar size
     * @param {?number} optionBarWidth barWidth option
     * @returns {number} option size
     * @private
     */
    _makeOptionSize: function(barSize, optionBarWidth) {
        var optionsSize = 0;
        if (optionBarWidth) {
            optionsSize = tui.util.min([barSize, optionBarWidth]);
        }
        return optionsSize;
    },

    /**
     * To make addition padding.
     * @param {number} barSize bar size
     * @param {number} optionSize option size
     * @param {number} itemCount item count
     * @returns {number} addition padding
     * @private
     */
    _makeAdditionPadding: function(barSize, optionSize, itemCount) {
        var padding = 0;
        if (optionSize && optionSize < barSize) {
            padding = (barSize - optionSize) * itemCount / 2;
        }
        return (barSize / 2) + padding;
    },

    /**
     * To make base info for normal chart bounds.
     * @param {{width: number, height: number}} dimension series dimension
     * @param {string} sizeType size type (width or height)
     * @param {string} anotherSizeType another size type (width or height)
     * @returns {{
     *      dimension: {width: number, height: number},
     *      groupValues: array.<array.<number>>,
     *      groupSize: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} base info
     */
    makeBaseInfoForNormalChartBounds: function(dimension, sizeType, anotherSizeType) {
        var groupValues = this.percentValues,
            groupSize = dimension[anotherSizeType] / groupValues.length,
            itemCount = groupValues[0] && groupValues[0].length || 0,
            barGutter = this._makeBarGutter(groupSize, itemCount),
            barSize = this._makeBarSize(groupSize, barGutter, itemCount),
            optionSize = this._makeOptionSize(barSize, this.options.barWidth),
            additionPadding = this._makeAdditionPadding(barSize, optionSize, itemCount),
            scaleDistance = this.getScaleDistanceFromZeroPoint(dimension[sizeType], this.data.scale);
        barSize = optionSize || barSize;
        return {
            dimension: dimension,
            groupValues: groupValues,
            groupSize: groupSize,
            barSize: barSize,
            additionPadding: additionPadding,
            step: barSize + barGutter,
            distanceToMin: scaleDistance.toMin,
            isMinus: this.data.scale.min < 0 && this.data.scale.max <= 0
        };
    },

    /**
     * Render normal series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderNormalSeriesLabel: function(params, elSeriesLabelArea) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            html;
        html = tui.util.map(params.values, function(values, groupIndex) {
            return tui.util.map(values, function(value, index) {
                var bound, formattedValue, renderingPosition;
                bound = groupBounds[groupIndex][index].end;
                formattedValue = formattedValues[groupIndex][index];
                renderingPosition = this.makeSeriesRenderingPosition({
                    value: value,
                    bound: bound,
                    formattedValue: formattedValue,
                    labelHeight: labelHeight
                });
                return this.makeSeriesLabelHtml(renderingPosition, formattedValue, groupIndex, index);
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * To make sum values.
     * @param {array.<number>} values values
     * @param {array.<function>} formatFunctions format functions
     * @returns {number} sum result.
     */
    makeSumValues: function(values, formatFunctions) {
        var sum = tui.util.sum(tui.util.filter(values, function(value) {
                return value > 0;
            })),
            fns = [sum].concat(formatFunctions || []);

        return tui.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });
    },

    /**
     * To make stacked labels html.
     * @param {object} params parameters
     *      @param {number} params.groupIndex group index
     *      @param {array.<number>} params.values values,
     *      @param {array.<function>} params.formatFunctions formatting functions,
     *      @param {array.<object>} params.bounds bounds,
     *      @param {array} params.formattedValues formatted values,
     *      @param {number} params.labelHeight label height
     * @returns {string} labels html
     * @private
     */
    _makeStackedLabelsHtml: function(params) {
        var values = params.values,
            bound, htmls;

        htmls = tui.util.map(values, function(value, index) {
            var labelWidth, left, top, labelHtml, formattedValue;

            if (value < 0) {
                return '';
            }

            bound = params.bounds[index].end;
            formattedValue = params.formattedValues[index];
            labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label);
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
            top = bound.top + ((bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2);
            labelHtml = this.makeSeriesLabelHtml({
                left: left,
                top: top
            }, formattedValue, params.groupIndex, index);
            return labelHtml;
        }, this);

        if (this.options.stacked === 'normal' && bound) {
            htmls.push(this.makeSumLabelHtml({
                values: values,
                formatFunctions: params.formatFunctions,
                bound: bound,
                labelHeight: params.labelHeight
            }));
        }
        return htmls.join('');
    },

    /**
     * Render stacked series label.
     * @param {object} params parameters
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderStackedSeriesLabel: function(params, elSeriesLabelArea) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            formatFunctions = params.formatFunctions || [],
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            html;
        html = tui.util.map(params.values, function(values, index) {
            var labelsHtml = this._makeStackedLabelsHtml({
                groupIndex: index,
                values: values,
                formatFunctions: formatFunctions,
                bounds: groupBounds[index],
                formattedValues: formattedValues[index],
                labelHeight: labelHeight
            });
            return labelsHtml;
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(params, elSeriesLabelArea) {
        if (!this.options.showLabel) {
            return;
        }

        if (this.options.stacked) {
            this._renderStackedSeriesLabel(params, elSeriesLabelArea);
        } else {
            this._renderNormalSeriesLabel(params, elSeriesLabelArea);
        }
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _getBound: function(groupIndex, index) {
        if (groupIndex === -1 || index === -1) {
            return null;
        }
        return this.groupBounds[groupIndex][index].end;
    }
});

BarTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, BarTypeSeriesBase.prototype);
};

module.exports = BarTypeSeriesBase;

},{"../const":15,"../helpers/renderUtil":33}],53:[function(require,module,exports){
/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

var ColumnChartSeries = tui.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
    /**
     * Column chart series component.
     * @constructs ColumnChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make start end tops.
     * @param {number} endTop end top
     * @param {number} endHeight end height
     * @param {number} value value
     * @param {boolean} isMinus whether minus or not
     * @returns {{startTop: number, endTop: number}} start end tops
     * @private
     */
    _makeStartEndTops: function(endTop, endHeight, value) {
        var startTop;
        if (value < 0) {
            startTop = endTop;
        } else {
            startTop = endTop;
            endTop -= endHeight;
        }

        return {
            startTop: startTop,
            endTop: endTop
        };
    },

    /**
     * To make bound of column chart.
     * @param {object} params parameters
     *      @param {{left: number, width: number}} params.baseBound base bound
     *      @param {number} params.startTop start top
     *      @param {number} params.endTop end top
     *      @param {number} params.endHeight end height
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeColumnChartBound: function(params) {
        return {
            start: tui.util.extend({
                top: params.startTop,
                height: 0
            }, params.baseBound),
            end: tui.util.extend({
                top: params.endTop,
                height: params.endHeight
            }, params.baseBound)
        };
    },

    /**
     * To make normal column chart bound.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupValues: array.<array.<number>>,
     *      groupSize: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} baseInfo base info
     * @param {number} value value
     * @param {number} paddingLeft padding left
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeNormalColumnChartBound: function(baseInfo, value, paddingLeft, index) {
        var endHeight, endTop, startEndTops, bound;

        endHeight = Math.abs(value * baseInfo.dimension.height);
        endTop = baseInfo.isMinus ? 0 : baseInfo.dimension.height - baseInfo.distanceToMin;
        startEndTops = this._makeStartEndTops(endTop, endHeight, value);
        bound = this._makeColumnChartBound(tui.util.extend({
            baseBound: {
                left: paddingLeft + (baseInfo.step * index) + chartConst.SERIES_EXPAND_SIZE,
                width: baseInfo.barSize
            },
            endHeight: endHeight
        }, startEndTops));
        return bound;
    },

    /**
     * To make bounds of normal column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeNormalColumnChartBounds: function(dimension) {
        var baseInfo = this.makeBaseInfoForNormalChartBounds(dimension, 'height', 'width'),
            bounds;

        bounds = tui.util.map(baseInfo.groupValues, function(values, groupIndex) {
            var paddingLeft = (baseInfo.groupSize * groupIndex) + baseInfo.additionPadding;
            return tui.util.map(values, function (value, index) {
                return this._makeNormalColumnChartBound(baseInfo, value, paddingLeft, index);
            }, this);
        }, this);

        return bounds;
    },

    /**
     * To make bounds of stacked column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeStackedColumnChartBounds: function(dimension) {
        var groupValues, groupWidth, barWidth,
            optionWidth, additionPadding, bounds;

        groupValues = this.percentValues;
        groupWidth = (dimension.width / groupValues.length);
        barWidth = groupWidth / 2;
        optionWidth = this._makeOptionSize(barWidth, this.options.barWidth);
        additionPadding = this._makeAdditionPadding(barWidth, optionWidth, 1);
        barWidth = optionWidth || barWidth;
        bounds = tui.util.map(groupValues, function(values, groupIndex) {
            var paddingLeft = (groupWidth * groupIndex) + additionPadding + chartConst.SERIES_EXPAND_SIZE,
                top = 0;
            return tui.util.map(values, function (value) {
                var endHeight, baseBound, bound;
                if (value < 0) {
                    return null;
                }

                endHeight = value * dimension.height;
                baseBound = {
                    left: paddingLeft,
                    width: barWidth
                };
                bound = this._makeColumnChartBound({
                    baseBound: baseBound,
                    startTop: dimension.height,
                    endTop: dimension.height - endHeight - top,
                    endHeight: endHeight
                });

                top += endHeight;
                return bound;
            }, this);
        }, this);
        return bounds;
    },

    /**
     * To make bounds of column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @returns {array.<array.<object>>} bounds
     * @private
     */
    _makeBounds: function(dimension) {
        if (!this.options.stacked) {
            return this._makeNormalColumnChartBounds(dimension);
        } else {
            return this._makeStackedColumnChartBounds(dimension);
        }
    },

    /**
     * To make series rendering position
     * @param {obeject} params parameters
     *      @param {number} params.value value
     *      @param {{left: number, top: number, width:number, width:number, height: number}} params.bound bound
     *      @param {string} params.formattedValue formatted value
     *      @param {number} params.labelHeight label height
     * @returns {{left: number, top: number}} rendering position
     */
    makeSeriesRenderingPosition: function(params) {
        var labelWidth = renderUtil.getRenderedLabelWidth(params.formattedValue, this.theme.label),
            bound = params.bound,
            top = bound.top,
            left = bound.left + (bound.width - labelWidth) / 2;

        if (params.value >= 0) {
            top -= params.labelHeight + chartConst.SERIES_LABEL_PADDING;
        } else {
            top += bound.height + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * To make sum label html.
     * @param {object} params parameters
     *      @param {array.<number>} params.values values
     *      @param {array.<function>} params.formatFunctions formatting functions
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {number} params.labelHeight label height
     * @returns {string} sum label html
     */
    makeSumLabelHtml: function(params) {
        var sum = this.makeSumValues(params.values, params.formatFunctions),
            bound = params.bound,
            labelWidth = renderUtil.getRenderedLabelWidth(sum, this.theme.label),
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2),
            top = bound.top - params.labelHeight - chartConst.SERIES_LABEL_PADDING;

        return this.makeSeriesLabelHtml({
            left: left,
            top: top
        }, sum, -1, -1);
    }
});

BarTypeSeriesBase.mixin(ColumnChartSeries);

module.exports = ColumnChartSeries;

},{"../const":15,"../helpers/renderUtil":33,"./barTypeSeriesBase":52,"./series":57}],54:[function(require,module,exports){
/**
 * @fileoverview Line chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    LineTypeSeriesBase = require('./lineTypeSeriesBase');

var LineChartSeries = tui.util.defineClass(Series, /** @lends LineChartSeries.prototype */ {
    /**
     * Line chart series component.
     * @constructs LineChartSeries
     * @extends Series
     * @mixes LineTypeSeriesBase
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make series data.
     * @param {{dimension: {width: number, height: number}}} bound bound
     * @returns {object} series data
     */
    makeSeriesData: function(bound) {
        return {
            groupPositions: this.makePositions(bound.dimension)
        };
    }
});

LineTypeSeriesBase.mixin(LineChartSeries);

module.exports = LineChartSeries;

},{"./lineTypeSeriesBase":55,"./series":57}],55:[function(require,module,exports){
/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');
/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @mixin
 */
var LineTypeSeriesBase = tui.util.defineClass(/** @lends LineTypeSeriesBase.prototype */ {
    /**
     * To make positions of line chart.
     * @param {{width: number, height:nunber}} dimension line chart dimension
     * @returns {array.<array.<object>>} positions
     */
    makePositions: function(dimension) {
        var groupValues = this.percentValues,
            width = dimension.width,
            height = dimension.height,
            len = groupValues[0].length,
            start = chartConst.SERIES_EXPAND_SIZE,
            step, result;

        if (this.data.aligned) {
            step = width / (len - 1);
        } else {
            step = width / len;
            start += (step / 2);
        }

        result = tui.util.map(groupValues, function(values) {
            return tui.util.map(values, function(value, index) {
                return {
                    left: start + (step * index),
                    top: height - (value * height)
                };
            });
        });
        this.groupPositions = result;
        return result;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupPositions group positions
     *      @param {array.<array>} params.formattedValues formatted values
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(params, elSeriesLabelArea) {
        var groupPositions, labelHeight, html;
        if (!this.options.showLabel) {
            return;
        }
        groupPositions = params.groupPositions;
        labelHeight = renderUtil.getRenderedLabelHeight(params.formattedValues[0][0], this.theme.label);

        html = tui.util.map(params.formattedValues, function(values, groupIndex) {
            return tui.util.map(values, function(value, index) {
                var position = groupPositions[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(value, this.theme.label),
                    labelHtml = this.makeSeriesLabelHtml({
                        left: position.left - (labelWidth / 2),
                        top: position.top - labelHeight - chartConst.SERIES_LABEL_PADDING
                    }, value, index, groupIndex);
                return labelHtml;
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _getBound: function(groupIndex, index) {
        return this.groupPositions[index][groupIndex];
    },

    /**
     * Find index.
     * @param {number} groupIndex group index
     * @param {number} layerY mouse position
     * @returns {number} index
     * @private
     */
    _findIndex: function(groupIndex, layerY) {
        var foundIndex = -1,
            diff = 1000;

        if (!this.tickItems) {
            this.tickItems = tui.util.pivot(this.groupPositions);
        }

        tui.util.forEach(this.tickItems[groupIndex], function(position, index) {
            var compare = Math.abs(layerY - position.top);
            if (diff > compare) {
                diff = compare;
                foundIndex = index;
            }
        });
        return foundIndex;
    },

    /**
     * Whether changed or not.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChanged: function(groupIndex, index) {
        var prevIndexes = this.prevIndexes;

        this.prevIndexes = {
            groupIndex: groupIndex,
            index: index
        };

        return !prevIndexes || (prevIndexes.groupIndex !== groupIndex) || (prevIndexes.index !== index);
    },

    /**
     * To call showGroupTooltipLine function of graphRenderer.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    onShowGroupTooltipLine: function(bound) {
        if (!this.graphRenderer.showGroupTooltipLine) {
            return;
        }
        this.graphRenderer.showGroupTooltipLine(bound);
    },

    /**
     * To call hideGroupTooltipLine function of graphRenderer.
     */
    onHideGroupTooltipLine: function() {
        if (!this.graphRenderer.hideGroupTooltipLine) {
            return;
        }
        this.graphRenderer.hideGroupTooltipLine();
    }
});

LineTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, LineTypeSeriesBase.prototype);
};

module.exports = LineTypeSeriesBase;

},{"../const":15,"../helpers/renderUtil":33}],56:[function(require,module,exports){
/**
 * @fileoverview Pie chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    eventListener = require('../helpers/eventListener');

var PieChartSeries = tui.util.defineClass(Series, /** @lends PieChartSeries.prototype */ {
    /**
     * Line chart series component.
     * @constructs PieChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * To make percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(data) {
        var result = tui.util.map(data.values, function(values) {
            var sum = tui.util.sum(values);
            return tui.util.map(values, function(value) {
                return value / sum;
            });
        });
        return result;
    },

    /**
     * To make sectors information.
     * @param {array.<number>} percentValues percent values
     * @param {{cx: number, cy: number, r: number}} circleBound circle bound
     * @returns {array.<object>} sectors information
     * @private
     */
    _makeSectorsInfo: function(percentValues, circleBound) {
        var cx = circleBound.cx,
            cy = circleBound.cy,
            r = circleBound.r,
            angle = 0,
            delta = 10,
            paths;

        paths = tui.util.map(percentValues, function(percentValue) {
            var addAngle = chartConst.ANGLE_360 * percentValue,
                endAngle = angle + addAngle,
                popupAngle = angle + (addAngle / 2),
                angles = {
                    start: {
                        startAngle: angle,
                        endAngle: angle
                    },
                    end: {
                        startAngle: angle,
                        endAngle: endAngle
                    }
                },
                positionData = {
                    cx: cx,
                    cy: cy,
                    angle: popupAngle
                };
            angle = endAngle;
            return {
                percentValue: percentValue,
                angles: angles,
                centerPosition: this._getArcPosition(tui.util.extend({
                    r: (r / 2) + delta
                }, positionData)),
                outerPosition: {
                    start: this._getArcPosition(tui.util.extend({
                        r: r
                    }, positionData)),
                    middle: this._getArcPosition(tui.util.extend({
                        r: r + delta
                    }, positionData))
                }
            };
        }, this);

        return paths;
    },

    /**
     * To make series data.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @returns {{
     *      chartBackground: string,
     *      circleBound: ({cx: number, cy: number, r: number}),
     *      sectorsInfo: array.<object>
     * }} add data for graph rendering
     */
    makeSeriesData: function(bound) {
        var circleBound = this._makeCircleBound(bound.dimension, {
                showLabel: this.options.showLabel,
                legendAlign: this.legendAlign
            }),
            sectorsInfo = this._makeSectorsInfo(this.percentValues[0], circleBound);
        return {
            chartBackground: this.chartBackground,
            circleBound: circleBound,
            sectorsInfo: sectorsInfo
        };
    },

    /**
     * To make circle bound
     * @param {{width: number, height:number}} dimension chart dimension
     * @param {{showLabel: boolean, legendAlign: string}} options options
     * @returns {{cx: number, cy: number, r: number}} circle bounds
     * @private
     */
    _makeCircleBound: function(dimension, options) {
        var width = dimension.width,
            height = dimension.height,
            isSmallPie = predicate.isOuterLegendAlign(options.legendAlign) && options.showLabel,
            radiusRate = isSmallPie ? chartConst.PIE_GRAPH_SMALL_RATE : chartConst.PIE_GRAPH_DEFAULT_RATE,
            diameter = tui.util.multiplication(tui.util.min([width, height]), radiusRate);
        return {
            cx: tui.util.division(width, 2),
            cy: tui.util.division(height, 2),
            r: tui.util.division(diameter, 2)
        };
    },

    /**
     * Get arc position.
     * @param {object} params parameters
     *      @param {number} params.cx center x
     *      @param {number} params.cy center y
     *      @param {number} params.r radius
     *      @param {number} params.angle angle(degree)
     * @returns {{left: number, top: number}} arc position
     * @private
     */
    _getArcPosition: function(params) {
        return {
            left: params.cx + (params.r * Math.sin(params.angle * chartConst.RAD)),
            top: params.cy - (params.r * Math.cos(params.angle * chartConst.RAD))
        };
    },


    /**
     * To make add data for series label.
     * @param {object} seriesData series data
     * @returns {{
     *      container: HTMLElement,
     *      legendLabels: array.<string>,
     *      options: {legendAlign: string, showLabel: boolean},
     *      chartWidth: number,
     *      formattedValues: array
     * }} add data for make series label
     * @private
     */
    _makeSeriesDataForSeriesLabel: function(seriesData) {
        return tui.util.extend({
            legendLabels: this.data.legendLabels,
            options: {
                legendAlign: this.legendAlign,
                showLabel: this.options.showLabel
            },
            chartWidth: this.data.chartWidth,
            formattedValues: this.data.formattedValues[0]
        }, seriesData);
    },

    /**
     * To render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData) {
        var funcShowTooltip = tui.util.bind(this.showTooltip, this, {
                allowNegativeTooltip: !!this.allowNegativeTooltip,
                chartType: this.chartType
            }),
            callbacks = {
                funcShowTooltip: funcShowTooltip,
                funcHideTooltip: tui.util.bind(this.hideTooltip, this),
                funcSelectSeries: tui.util.bind(this.selectSeries, this)
            },
            params = this._makeParamsForGraphRendering(dimension, seriesData);

        this.graphRenderer.render(this.elSeriesArea, params, callbacks);

        // series label mouse event 동작 시 사용
        this.showTooltip = funcShowTooltip;
    },

    /**
     * To render series component of pie chart.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     * @override
     */
    render: function() {
        var el = Series.prototype.render.apply(this, arguments);
        this.attachEvent(el);

        return el;
    },

    /**
     * showTooltip is mouseover event callback on series graph.
     * @param {object} params parameters
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {{clientX: number, clientY: number}} eventPosition mouse event position
     */
    showTooltip: function(params, bound, groupIndex, index, eventPosition) {
        this.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            bound: bound,
            eventPosition: eventPosition
        }, params));
    },

    /**
     * hideTooltip is mouseout event callback on series graph.
     * @param {string} id tooltip id
     */
    hideTooltip: function() {
        this.fire('hideTooltip');
    },

    /**
     * To make series data by selection.
     * @param {number} index index
     * @returns {{indexes: {index: number, groupIndex: number}}} series data
     * @private
     */
    _makeSeriesDataBySelection: function(index) {
        return {
            indexes: {
                index: index,
                groupIndex: index
            }
        };
    },

    /**
     * selectSeries is click event callback on series graph.
     * @param {number} index index
     */
    selectSeries: function(index) {
        var seriesData = this._makeSeriesDataBySelection(index);
        if (this.selectedIndex === index) {
            this.onUnselectSeries(seriesData);
            delete this.selectedIndex;
        } else {
            if (!tui.util.isUndefined(this.selectedIndex)) {
                this.onUnselectSeries(this._makeSeriesDataBySelection(this.selectedIndex));
            }
            this.onSelectSeries(seriesData);
            this.selectedIndex = index;
        }
    },

    /**
     * Get series label.
     * @param {object} params parameters
     *      @param {string} params.legend legend
     *      @param {string} params.label label
     *      @param {string} params.separator separator
     *      @param {{legendAlign: ?string, showLabel: boolean}} params.options options
     * @returns {string} series label
     * @private
     */
    _getSeriesLabel: function(params) {
        var seriesLabel = '';
        if (params.options.legendAlign) {
            seriesLabel = '<span class="tui-chart-series-legend">' + params.legend + '</span>';
        }

        if (params.options.showLabel) {
            seriesLabel += (seriesLabel ? params.separator : '') + params.label;
        }

        return seriesLabel;
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions positions
     *      @param {array.<string>} params.legends legendLabels
     *      @param {array.<string>} params.formattedValues formatted values
     *      @param {string} params.separator separator
     *      @param {object} params.options options
     *      @param {function} params.funcMoveToPosition function
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderLegendLabel: function(params, elSeriesLabelArea) {
        var positions = params.positions,
            formattedValues = params.formattedValues,
            html;
        html = tui.util.map(params.legendLabels, function(legend, index) {
            var label = this._getSeriesLabel({
                    legend: legend,
                    label: formattedValues[index],
                    separator: params.separator,
                    options: params.options
                }),
                position = params.funcMoveToPosition(positions[index], label);
            return this.makeSeriesLabelHtml(position, label, 0, index);
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Move to center position.
     * @param {{left: number, top: number}} position position
     * @param {string} label label
     * @returns {{left: number, top: number}} center position
     * @private
     */
    _moveToCenterPosition: function(position, label) {
        var left = position.left - (renderUtil.getRenderedLabelWidth(label, this.theme.label) / 2),
            top = position.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);
        return {
            left: left,
            top: top
        };
    },

    /**
     * Render center legend.
     * @param {object} params parameters
     *      @param {object} params.sectorsInfo sector info
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderCenterLegend: function(params, elSeriesLabelArea) {
        this._renderLegendLabel(tui.util.extend({
            positions: tui.util.pluck(params.sectorsInfo, 'centerPosition'),
            funcMoveToPosition: tui.util.bind(this._moveToCenterPosition, this),
            separator: '<br>'
        }, params), elSeriesLabelArea);
    },

    /**
     * Add end position.
     * @param {number} centerLeft center left
     * @param {array.<object>} positions positions
     * @private
     */
    _addEndPosition: function(centerLeft, positions) {
        tui.util.forEach(positions, function(position) {
            var end = tui.util.extend({}, position.middle);
            if (end.left < centerLeft) {
                end.left -= chartConst.SERIES_OUTER_LABEL_PADDING;
            } else {
                end.left += chartConst.SERIES_OUTER_LABEL_PADDING;
            }
            position.end = end;
        });
    },

    /**
     * Move to outer position.
     * @param {number} centerLeft center left
     * @param {object} position position
     * @param {string} label label
     * @returns {{left: number, top: number}} outer position
     * @private
     */
    _moveToOuterPosition: function(centerLeft, position, label) {
        var positionEnd = position.end,
            left = positionEnd.left,
            top = positionEnd.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);

        if (left < centerLeft) {
            left -= renderUtil.getRenderedLabelWidth(label, this.theme.label) + chartConst.SERIES_LABEL_PADDING;
        } else {
            left += chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * Render outer legend.
     * @param {object} params parameters
     *      @param {object} params.sectorsInfo sector info
     *      @param {number} params.chartWidth chart width
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderOuterLegend: function(params, elSeriesLabelArea) {
        var outerPositions = tui.util.pluck(params.sectorsInfo, 'outerPosition'),
            centerLeft = params.chartWidth / 2;
        this._addEndPosition(centerLeft, outerPositions);
        this._renderLegendLabel(tui.util.extend({
            positions: outerPositions,
            funcMoveToPosition: tui.util.bind(this._moveToOuterPosition, this, centerLeft),
            separator: ':&nbsp;'
        }, params), elSeriesLabelArea);
        this.graphRenderer.renderLegendLines(outerPositions);
    },

    /**
     * Render series label.
     * @param {object} params parameters
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(params, elSeriesLabelArea) {
        var legendAlign = params.options.legendAlign;
        if (predicate.isOuterLegendAlign(legendAlign)) {
            this._renderOuterLegend(params, elSeriesLabelArea);
        } else if (predicate.isCenterLegendAlign(legendAlign)) {
            this._renderCenterLegend(params, elSeriesLabelArea);
        }
    },

    /**
     * Get bound.
     * @returns {null} bound
     * @private
     */
    _getBound: function() {
        return null;
    },

    /**
     * Animate showing about series label area.
     * @override
     */
    animateShowingAboutSeriesLabelArea: function() {
        this.graphRenderer.animateLegendLines();
        Series.prototype.animateShowingAboutSeriesLabelArea.call(this);
    },

    /**
     * Show series label area.
     * @param {object} seriesData series data
     * @override
     */
    showSeriesLabelArea: function(seriesData) {
        var outerPositions = tui.util.pluck(seriesData.sectorsInfo, 'outerPosition'),
            centerLeft = this.data.chartWidth / 2;
        this._addEndPosition(centerLeft, outerPositions);
        this.graphRenderer.moveLegendLines(outerPositions);
        Series.prototype.showSeriesLabelArea.call(this);
    },

    /**
     * To handle mouse event.
     * @param {MouseEvent} e mouse event
     * @param {function} callback callback
     * @private
     */
    _handleMouseEvent: function(e, callback) {
        var elTarget = e.target || e.srcElement,
            elLabel = this._findLabelElement(elTarget),
            groupIndex, index;

        if (!elLabel) {
            return;
        }

        groupIndex = parseInt(elLabel.getAttribute('data-group-index'), 10);
        index = parseInt(elLabel.getAttribute('data-index'), 10);

        if (groupIndex === -1 || index === -1) {
            return;
        }

        callback(groupIndex, index, elTarget);
    },

    /**
     * Find legend element.
     * @param {HTMLElement} elTarget target element
     * @returns {HTMLElement} legend element
     * @private
     */
    _findLegendElement: function(elTarget) {
        var elLegend;
        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_SERIES_LEGEND)) {
            elLegend = elTarget;
        }

        return elLegend;
    },

    /**
     * On click event handler.
     * @param {MouseEvent} e mouse event
     * @override
     */
    onClick: function(e) {
        var that = this;
        this._handleMouseEvent(e, function(groupIndex, index, elTarget) {
            var elLegend = that._findLegendElement(elTarget),
                legendData;

            if (!elLegend) {
                that.selectSeries(index);
            } else {
                legendData = that.data.joinLegendLabels[index];
                that.userEvent.fire('selectLegend', {
                    legend: legendData.label,
                    chartType: legendData.chartType,
                    legendIndex: index,
                    index: index
                });
            }
        });
    },

    /**
     * This is event handler for mouseover.
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var that = this;
        this._handleMouseEvent(e, function(groupIndex, index) {
            var bound = that._getBound(groupIndex, index) || that._makeLabelBound(e.clientX, e.clientY - 10);
            that.showTooltip(bound, groupIndex, index);
        });
    },

    /**
     * This is event handler for mouseout.
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var that = this;
        this._handleMouseEvent(e, function(groupIndex, index) {
            that.hideTooltip(groupIndex, index);
        });
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        eventListener.bindEvent('click', el, tui.util.bind(this.onClick, this));
        eventListener.bindEvent('mouseover', el, tui.util.bind(this.onMouseover, this));
        eventListener.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(PieChartSeries);

module.exports = PieChartSeries;

},{"../const":15,"../helpers/domHandler":30,"../helpers/eventListener":31,"../helpers/predicate":32,"../helpers/renderUtil":33,"./series":57}],57:[function(require,module,exports){
/**
 * @fileoverview Series base component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var seriesTemplate = require('./seriesTemplate'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    pluginFactory = require('../factories/pluginFactory');

var Series = tui.util.defineClass(/** @lends Series.prototype */ {
    /**
     * Series base component.
     * @constructs Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function(params) {
        var libType;

        tui.util.extend(this, params);
        libType = params.libType || chartConst.DEFAULT_PLUGIN;

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, params.chartType);

        /**
         * Series view className
         * @type {string}
         */
        this.className = 'tui-chart-series-area';
    },

    /**
     * To make series data.
     * @returns {object} add data
     */
    makeSeriesData: function() {
        return {};
    },

    /**
     * Get seriesData
     * @returns {object} series data
     */
    getSeriesData: function() {
        return this.seriesData;
    },

    /**
     * Render series label.
     * @private
     * @abstract
     */
    _renderSeriesLabel: function() {},

    /**
     * Set base data.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     * @private
     */
    _setBaseData: function(bound, data) {
        this.data = tui.util.extend(this.data, data);
        this.bound = bound;
        this.percentValues = this._makePercentValues(this.data, this.options.stacked);
    },

    /**
     * To render series label area
     * @param {{width: number, height: number}} dimension series dimension
     * @param {object} seriesData series data
     * @param {?HTMLElement} elSeriesLabelArea series label area element
     * @returns {HTMLElement} series label area element
     * @private
     */
    _renderSeriesLabelArea: function(dimension, seriesData, elSeriesLabelArea) {
        var addDataForSeriesLabel = this._makeSeriesDataForSeriesLabel(seriesData, dimension);
        if (!elSeriesLabelArea) {
            elSeriesLabelArea = dom.create('div', 'tui-chart-series-label-area');
        }

        this._renderSeriesLabel(addDataForSeriesLabel, elSeriesLabelArea);
        return elSeriesLabelArea;
    },

    /**
     * To render series area.
     * @param {HTMLElement} elSeriesArea series area element
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     * @param {function} funcRenderGraph function for graph rendering
     * @private
     */
    _renderSeriesArea: function(elSeriesArea, bound, data, funcRenderGraph) {
        var expandedBound, seriesData, elSeriesLabelArea;

        this._setBaseData(bound, data);

        expandedBound = renderUtil.expandBound(bound);
        this.seriesData = seriesData = this.makeSeriesData(bound);

        renderUtil.renderDimension(elSeriesArea, expandedBound.dimension);
        this._renderPosition(elSeriesArea, expandedBound.position, this.chartType);
        funcRenderGraph(expandedBound.dimension, seriesData);

        elSeriesLabelArea = this._renderSeriesLabelArea(expandedBound.dimension, seriesData, this.elSeriesLabelArea);

        if (!this.elSeriesLabelArea) {
            this.elSeriesLabelArea = elSeriesLabelArea;
            dom.append(elSeriesArea, elSeriesLabelArea);
        }
    },

    /**
     * To make parameters for graph rendering.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @returns {object} parameters for graph rendering
     * @private
     */
    _makeParamsForGraphRendering: function(dimension, seriesData) {
        return tui.util.extend({
            dimension: dimension,
            chartType: this.chartType,
            theme: this.theme,
            options: this.options
        }, seriesData);
    },

    /**
     * To render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     */
    _renderGraph: function(dimension, seriesData) {
        var params = this._makeParamsForGraphRendering(dimension, seriesData);
        this.graphRenderer.render(this.elSeriesArea, params);
    },

    /**
     * To render series component.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     */
    render: function(bound, data) {
        var el = dom.create('DIV', this.className);

        this.elSeriesArea = el;

        this._renderSeriesArea(el, bound, data, tui.util.bind(this._renderGraph, this));

        return el;
    },

    /**
     * To resize raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     */
    _resizeGraph: function(dimension, seriesData) {
        this.graphRenderer.resize(tui.util.extend({
            dimension: dimension
        }, seriesData));
        this.showSeriesLabelArea(seriesData);
    },

    /**
     * To resize series component.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @param {object} data data for rendering
     */
    resize: function(bound, data) {
        var el = this.elSeriesArea;

        this._renderSeriesArea(el, bound, data, tui.util.bind(this._resizeGraph, this));
    },

    /**
     * To make add data for series label.
     * @param {object} seriesData series data
     * @param {{width: number, height: number}} dimension dimension
     * @returns {{
     *      container: HTMLElement,
     *      values: array.<array>,
     *      formattedValues: array.<array>,
     *      formatFunctions: array.<function>,
     *      dimension: {width: number, height: number}
     * }} add data for series label
     * @private
     */
    _makeSeriesDataForSeriesLabel: function(seriesData, dimension) {
        return tui.util.extend({
            values: this.data.values,
            formattedValues: this.data.formattedValues,
            formatFunctions: this.data.formatFunctions,
            dimension: dimension
        }, seriesData);
    },

    /**
     * Render bounds
     * @param {HTMLElement} el series element
     * @param {{top: number, left: number}} position series position
     * @private
     */
    _renderPosition: function(el, position) {
        var hiddenWidth = renderUtil.isOldBrowser() ? chartConst.HIDDEN_WIDTH : 0;
        renderUtil.renderPosition(el, {
            top: position.top - (hiddenWidth * 2),
            left: position.left - hiddenWidth
        });
    },

    /**
     * To make percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @param {string} stacked stacked option
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makePercentValues: function(data, stacked) {
        var result;
        if (stacked === chartConst.STACKED_NORMAL_TYPE) {
            result = this._makeNormalStackedPercentValues(data);
        } else if (stacked === chartConst.STACKED_PERCENT_TYPE) {
            result = this._makePercentStackedPercentValues(data);
        } else {
            result = this._makeNormalPercentValues(data);
        }

        return result;
    },

    /**
     * To make percent values about normal stacked option.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array} percent values about normal stacked option.
     * @private
     */
    _makeNormalStackedPercentValues: function(data) {
        var min = data.scale.min,
            max = data.scale.max,
            distance = max - min,
            percentValues = tui.util.map(data.values, function(values) {
                var plusValues = tui.util.filter(values, function(value) {
                        return value > 0;
                    }),
                    sum = tui.util.sum(plusValues),
                    groupPercent = (sum - min) / distance;
                return tui.util.map(values, function(value) {
                    return value === 0 ? 0 : groupPercent * (value / sum);
                });
            });
        return percentValues;
    },

    /**
     * To make percent values about percent stacked option.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array} percent values about percent stacked option
     * @private
     */
    _makePercentStackedPercentValues: function(data) {
        var percentValues = tui.util.map(data.values, function(values) {
            var plusValues = tui.util.filter(values, function(value) {
                    return value > 0;
                }),
                sum = tui.util.sum(plusValues);
            return tui.util.map(values, function(value) {
                return value === 0 ? 0 : value / sum;
            });
        });
        return percentValues;
    },

    /**
     * To make normal percent value.
     * @param {{values: array, scale: {min: number, max: number}}} data series data
     * @returns {array.<array.<number>>} percent values
     * @private
     */
    _makeNormalPercentValues: function(data) {
        var min = data.scale.min,
            max = data.scale.max,
            distance = max - min,
            isLineTypeChart = predicate.isLineTypeChart(this.chartType),
            flag = 1,
            subValue = 0,
            percentValues;

        if (!isLineTypeChart && min < 0 && max <= 0) {
            flag = -1;
            subValue = max;
            distance = min - max;
        } else if (isLineTypeChart || min >= 0) {
            subValue = min;
        }

        percentValues = tui.util.map(data.values, function(values) {
            return tui.util.map(values, function(value) {
                return (value - subValue) * flag / distance;
            });
        });

        return percentValues;
    },

    /**
     * Get scale distance from zero point.
     * @param {number} size chart size (width or height)
     * @param {{min: number, max: number}} scale scale
     * @returns {{toMax: number, toMin: number}} pixel distance
     */
    getScaleDistanceFromZeroPoint: function(size, scale) {
        var min = scale.min,
            max = scale.max,
            distance = max - min,
            toMax = 0,
            toMin = 0;

        if (min < 0 && max > 0) {
            toMax = (distance + min) / distance * size;
            toMin = (distance - max) / distance * size;
        }

        return {
            toMax: toMax,
            toMin: toMin
        };
    },

    /**
     * To make label bound.
     * @param {number} clientX clientX
     * @param {number} clientY clientY
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _makeLabelBound: function(clientX, clientY) {
        return {
            left: clientX - this.bound.position.left,
            top: clientY - this.bound.position.top
        };
    },

    /**
     * Find label element.
     * @param {HTMLElement} elTarget target element
     * @returns {HTMLElement} label element
     * @private
     */
    _findLabelElement: function(elTarget) {
        var elLabel = null;

        if (dom.hasClass(elTarget, chartConst.CLASS_NAME_SERIES_LABEL)) {
            elLabel = elTarget;
        } else {
            elLabel = dom.findParentByClass(elTarget, chartConst.CLASS_NAME_SERIES_LABEL);
        }

        return elLabel;
    },

    /**
     * To call showAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onShowAnimation: function(data) {
        if (!this.graphRenderer.showAnimation) {
            return;
        }
        this.graphRenderer.showAnimation(data);
    },

    /**
     * To call hideAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onHideAnimation: function(data) {
        if (!this.graphRenderer.hideAnimation) {
            return;
        }
        this.graphRenderer.hideAnimation(data);
    },

    /**
     * To call showGroupAnimation function of graphRenderer.
     * @param {number} index index
     */
    onShowGroupAnimation: function(index) {
        if (!this.graphRenderer.showGroupAnimation) {
            return;
        }
        this.graphRenderer.showGroupAnimation(index);
    },

    /**
     * To call hideGroupAnimation function of graphRenderer.
     * @param {number} index index
     */
    onHideGroupAnimation: function(index) {
        if (!this.graphRenderer.hideGroupAnimation) {
            return;
        }
        this.graphRenderer.hideGroupAnimation(index);
    },

    /**
     * Animate component.
     */
    animateComponent: function() {
        if (this.graphRenderer.animate) {
            this.graphRenderer.animate(tui.util.bind(this.animateShowingAboutSeriesLabelArea, this));
        }
    },

    /**
     * To make html about series label.
     * @param {{left: number, top: number}} position position
     * @param {string} value value
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {string} html string
     */
    makeSeriesLabelHtml: function(position, value, groupIndex, index) {
        var cssObj = tui.util.extend(position, this.theme.label);
        return seriesTemplate.tplSeriesLabel({
            cssText: seriesTemplate.tplCssText(cssObj),
            value: value,
            groupIndex: groupIndex,
            index: index
        });
    },

    /**
     * Show series label area.
     */
    showSeriesLabelArea: function() {
        if (renderUtil.isOldBrowser()) {
            this.elSeriesLabelArea.style.filter = 'alpha(opacity=' + 100 + ')';
        } else {
            this.elSeriesLabelArea.style.opacity = 1;
        }
        dom.addClass(this.elSeriesLabelArea, 'show');
    },

    /**
     * Animate showing about series label area.
     */
    animateShowingAboutSeriesLabelArea: function() {
        if ((!this.options.showLabel && !this.legendAlign) || !this.elSeriesLabelArea) {
            return;
        }

        dom.addClass(this.elSeriesLabelArea, 'show');

        (new tui.component.Effects.Fade({
            element: this.elSeriesLabelArea,
            duration: 300
        })).action({
            start: 0,
            end: 1,
            complete: function() {}
        });
    },

    /**
     * To make exportation data for series type userEvent.
     * @param {object} seriesData series data
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} export data
     * @private
     */
    _makeExportationSeriesData: function(seriesData) {
        var legendIndex = seriesData.indexes.index,
            legendData = this.data.joinLegendLabels[legendIndex];
        return {
            chartType: legendData.chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: seriesData.indexes.groupIndex
        };
    },

    /**
     * To call selectSeries callback of userEvent.
     * @param {object} seriesData series data
     */
    onSelectSeries: function(seriesData) {
        this.userEvent.fire('selectSeries', this._makeExportationSeriesData(seriesData));
        if (this.options.hasSelection) {
            this.graphRenderer.selectSeries(seriesData.indexes);
        }
    },

    /**
     * To call unselectSeries callback of userEvent.
     * @param {object} seriesData series data.
     */
    onUnselectSeries: function(seriesData) {
        this.userEvent.fire('unselectSeries', this._makeExportationSeriesData(seriesData));
        if (this.options.hasSelection) {
            this.graphRenderer.unselectSeries(seriesData.indexes);
        }
    }
});

module.exports = Series;

},{"../const":15,"../factories/pluginFactory":24,"../helpers/domHandler":30,"../helpers/predicate":32,"../helpers/renderUtil":33,"./seriesTemplate":58}],58:[function(require,module,exports){
/**
 * @fileoverview This is templates of series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_SERIES_LABEL: '<div class="tui-chart-series-label" style="{{ cssText }}" data-group-index="{{ groupIndex }}" data-index="{{ index }}">{{ value }}</div>',
    TEXT_CSS_TEXT: 'left:{{ left }}px;top:{{ top }}px;font-family:{{ fontFamily }};font-size:{{ fontSize }}px'
};

module.exports = {
    tplSeriesLabel: templateMaker.template(tags.HTML_SERIES_LABEL),
    tplCssText: templateMaker.template(tags.TEXT_CSS_TEXT)
};

},{"../helpers/templateMaker":34}],59:[function(require,module,exports){
var DEFAULT_COLOR = '#000000',
    DEFAULT_BACKGROUND = '#ffffff',
    EMPTY = '',
    DEFAULT_AXIS = {
        tickColor: DEFAULT_COLOR,
        title: {
            fontSize: 12,
            fontFamily: EMPTY,
            color: DEFAULT_COLOR
        },
        label: {
            fontSize: 12,
            fontFamily: EMPTY,
            color: DEFAULT_COLOR
        }
    };

var defaultTheme = {
    chart: {
        background: DEFAULT_BACKGROUND,
        fontFamily: 'Verdana'
    },
    title: {
        fontSize: 18,
        fontFamily: EMPTY,
        color: DEFAULT_COLOR
    },
    yAxis: DEFAULT_AXIS,
    xAxis: DEFAULT_AXIS,
    plot: {
        lineColor: '#dddddd',
        background: '#ffffff'
    },
    series: {
        label: {
            fontSize: 11,
            fontFamily: EMPTY,
            color: DEFAULT_COLOR
        },
        colors: ['#ac4142', '#d28445', '#f4bf75', '#90a959', '#75b5aa', '#6a9fb5', '#aa759f', '#8f5536'],
        borderColor: EMPTY,
        selectionColor: EMPTY
    },
    legend: {
        label: {
            fontSize: 12,
            fontFamily: EMPTY,
            color: DEFAULT_COLOR
        }
    },
    tooltip: {}
};

module.exports = defaultTheme;

},{}],60:[function(require,module,exports){
/**
 * @fileoverview Group tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    GroupTooltipPositionModel = require('./groupTooltipPositionModel'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    defaultTheme = require('../themes/defaultTheme'),
    tooltipTemplate = require('./tooltipTemplate');

var GroupTooltip = tui.util.defineClass(TooltipBase, /** @lends GroupTooltip.prototype */ {
    /**
     * Group tooltip component.
     * @constructs GroupTooltip
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        TooltipBase.call(this, params);
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.align) {
            return;
        }

        if (this.isVertical) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION;
        } else {
            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION;
        }
    },

    /**
     * To render tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     * @returns {HTMLElement} tooltip element
     * @override
     */
    render: function(bound, data) {
        var el = TooltipBase.prototype.render.call(this, bound, data);

        this.positionModel = new GroupTooltipPositionModel(this.chartDimension, bound, this.isVertical, this.options);
        return el;
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        return tui.util.map(this.joinFormattedValues, function(values, index) {
            return {
                category: this.labels[index],
                values: values
            };
        }, this);
    },

    /**
     * To make colors.
     * @param {array.<string>} legendLabels legend labels
     * @param {object} theme tooltip theme
     * @returns {array.<string>} colors
     * @private
     */
    _makeColors: function(legendLabels, theme) {
        var colorIndex = 0,
            defaultColors, colors, prevChartType;
        if (theme.colors) {
            return theme.colors;
        }

        defaultColors = defaultTheme.series.colors.slice(0, legendLabels.length);

        return tui.util.map(tui.util.pluck(legendLabels, 'chartType'), function(chartType) {
            var color;
            if (prevChartType !== chartType) {
                colors = theme[chartType] ? theme[chartType].colors : defaultColors;
                colorIndex = 0;
            }
            prevChartType = chartType;
            color = colors[colorIndex];
            colorIndex += 1;
            return color;
        });
    },

    /**
     * To make tooltip html.
     * @param {number} groupIndex group index
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(groupIndex) {
        var item = this.data[groupIndex],
            template = tooltipTemplate.tplGroupItem,
            cssTextTemplate = tooltipTemplate.tplGroupCssText,
            colors = this._makeColors(this.joinLegendLabels, this.theme),
            itemsHtml;

        itemsHtml = tui.util.map(item.values, function(value, index) {
            var legendLabel = this.joinLegendLabels[index];
            return template({
                value: value,
                legend: legendLabel.label,
                chartType: legendLabel.chartType,
                cssText: cssTextTemplate({color: colors[index]}),
                suffix: this.suffix
            });
        }, this).join('');

        return tooltipTemplate.tplGroup({
            category: item.category,
            items: itemsHtml
        });
    },

    /**
     * Get tooltip sector element.
     * @returns {HTMLElement} sector element
     * @private
     */
    _getTooltipSectorElement: function() {
        var elTooltipSector;
        if (!this.elTooltipSector) {
            this.elTooltipSector = elTooltipSector = dom.create('DIV', 'tui-chart-group-tooltip-sector');
            dom.append(this.elTooltipArea, elTooltipSector);
        }
        return this.elTooltipSector;
    },

    /**
     * To make bound about tooltip sector of vertical type chart.
     * @param {number} height height
     * @param {{start: number, end: number}} range range
     * @param {boolean} isLine whether line or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeVerticalTooltipSectorBound: function(height, range, isLine) {
        var width;
        if (isLine) {
            width = 1;
            height += 6;
        } else {
            width = range.end - range.start;
        }
        return {
            dimension: {
                width: width,
                height: height
            },
            position: {
                left: range.start + chartConst.SERIES_EXPAND_SIZE,
                top: 0
            }
        };
    },

    /**
     * To make bound about tooltip sector of horizontal type chart.
     * @param {number} width width
     * @param {{start: number, end:number}} range range
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeHorizontalTooltipSectorBound: function(width, range) {
        return {
            dimension: {
                width: width,
                height: range.end - range.start + chartConst.HIDDEN_WIDTH
            },
            position: {
                left: chartConst.SERIES_EXPAND_SIZE - chartConst.HIDDEN_WIDTH,
                top: range.start
            }
        };
    },

    /**
     * To make bound about tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {boolean} isLine whether line type or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeTooltipSectorBound: function(size, range, isVertical, isLine) {
        var bound;
        if (isVertical) {
            bound = this._makeVerticalTooltipSectorBound(size, range, isLine);
        } else {
            bound = this._makeHorizontalTooltipSectorBound(size, range);
        }
        return bound;
    },

    /**
     * Show tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {number} index index
     * @private
     */
    _showTooltipSector: function(size, range, isVertical, index) {
        var elTooltipSector = this._getTooltipSectorElement(),
            isLine = (range.start === range.end),
            bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);
        if (isLine) {
            this.fire('showGroupTooltipLine', bound);
        } else {
            renderUtil.renderDimension(elTooltipSector, bound.dimension);
            renderUtil.renderPosition(elTooltipSector, bound.position);
            dom.addClass(elTooltipSector, 'show');
        }

        this.fire('showGroupAnimation', index);
    },

    /**
     * Hide tooltip sector.
     * @param {number} index index
     * @private
     */
    _hideTooltipSector: function(index) {
        var elTooltipSector = this._getTooltipSectorElement();
        dom.removeClass(elTooltipSector, 'show');
        this.fire('hideGroupAnimation', index);
        this.fire('hideGroupTooltipLine');
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @param {{left: number, top: number}} prevPosition prev position
     */
    showTooltip: function(elTooltip, params, prevPosition) {
        var dimension, position;

        if (!tui.util.isUndefined(this.prevIndex)) {
            this.fire('hideGroupAnimation', this.prevIndex);
        }
        elTooltip.innerHTML = this._makeTooltipHtml(params.index);

        this._fireBeforeShowTooltip(params.index, params.range);

        dom.addClass(elTooltip, 'show');

        this._showTooltipSector(params.size, params.range, params.isVertical, params.index);

        dimension = this.getTooltipDimension(elTooltip);
        position = this.positionModel.calculatePosition(dimension, params.range);
        this.moveToPosition(elTooltip, position, prevPosition);

        this._fireAfterShowTooltip(params.index, params.range, {
            element: elTooltip,
            position: position
        });

        this.prevIndex = params.index;
    },

    /**
     * To call beforeShowTooltip callback of userEvent.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @private
     */
    _fireBeforeShowTooltip: function(index, range) {
        this.userEvent.fire('beforeShowTooltip', {
            index: index,
            range: range
        });
    },

    /**
     * To call afterShowTooltip callback of userEvent.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @param {object} additionParams addition parameters
     * @private
     */
    _fireAfterShowTooltip: function(index, range, additionParams) {
        this.userEvent.fire('afterShowTooltip', tui.util.extend({
            index: index,
            range: range
        }, additionParams));
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {number} index index
     */
    hideTooltip: function(elTooltip, index) {
        delete this.prevIndex;
        this._hideTooltipSector(index);
        this.hideAnimation(elTooltip);
    }
});

tui.util.CustomEvents.mixin(GroupTooltip);

module.exports = GroupTooltip;

},{"../const":15,"../helpers/domHandler":30,"../helpers/renderUtil":33,"../themes/defaultTheme":59,"./groupTooltipPositionModel":61,"./tooltipBase":63,"./tooltipTemplate":64}],61:[function(require,module,exports){
/**
 * @fileoverview GroupTooltipPositionModel is position model for group tooltip..
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

var GroupTooltipPositionModel = tui.util.defineClass(/** @lends GroupTooltipPositionModel.prototype */ {
    /**
     * GroupTooltipPositionModel is position model for group tooltip.
     * @constructs GroupTooltipPositionModel
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {boolean} isVertical whether vertical or not
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     */
    init: function(chartDimension, areaBound, isVertical, options) {
        /**
         * chart dimension
         * @type {{width: number, height: number}}
         */
        this.chartDimension = chartDimension;

        /**
         * tooltip area bound
         * @type {{dimension: {width: number, height: number}, position: {left: number, top: number}}}
         */
        this.areaBound = areaBound;

        /**
         * Whether vertical or not
         * @type {boolean}
         */
        this.isVertical = isVertical;

        /**
         * tooltip options
         * @type {{align: ?string, position: {left: number, top: number}}}
         */
        this.options = options;

        /**
         * For caching
         * @type {object}
         */
        this.positions;

        this._setData(chartDimension, areaBound, isVertical, options);
    },

    /**
     * Get horizontal direction.
     * @param {?string} alignOption align option
     * @returns {string} direction
     * @private
     */
    _getHorizontalDirection: function(alignOption) {
        var direction;
        alignOption = alignOption || '';
        if (alignOption.indexOf('left') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_BACKWARD;
        } else if (alignOption.indexOf('center') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_CENTER;
        } else {
            direction = chartConst.TOOLTIP_DIRECTION_FORWARD;
        }
        return direction;
    },

    /**
     * To make vertical data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {?string} alignOption align option
     * @returns {{
     *      positionType: string, sizeType: string, direction: (string),
     *      areaPosition: number, areaSize: number, chartSize: number,
     *      basePosition: (number)
     * }} vertical data
     * @private
     */
    _makeVerticalData: function(chartDimension, areaBound, alignOption) {
        var hDirection = this._getHorizontalDirection(alignOption);
        return {
            positionType: 'left',
            sizeType: 'width',
            direction: hDirection,
            areaPosition: areaBound.position.left,
            areaSize: areaBound.dimension.width,
            chartSize: chartDimension.width,
            basePosition: chartConst.SERIES_EXPAND_SIZE
        };
    },

    /**
     * Get vertical direction.
     * @param {?string} alignOption align option
     * @returns {string} direction
     * @private
     */
    _getVerticalDirection: function(alignOption) {
        var direction;
        alignOption = alignOption || '';
        if (alignOption.indexOf('top') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_BACKWARD;
        } else if (alignOption.indexOf('bottom') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_FORWARD;
        } else {
            direction = chartConst.TOOLTIP_DIRECTION_CENTER;
        }
        return direction;
    },

    /**
     * To make horizontal data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {?string} alignOption align option
     * @returns {{
     *      positionType: string, sizeType: string, direction: (string),
     *      areaPosition: number, areaSize: number, chartSize: number,
     *      basePosition: (number)
     * }} vertical data
     * @private
     */
    _makeHorizontalData: function(chartDimension, areaBound, alignOption) {
        var vDirection = this._getVerticalDirection(alignOption);
        return {
            positionType: 'top',
            sizeType: 'height',
            direction: vDirection,
            areaPosition: areaBound.position.top,
            areaSize: areaBound.dimension.height,
            chartSize: chartDimension.height,
            basePosition: 0
        };
    },

    /**
     * Set data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {boolean} isVertical whether vertical or not
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     * @private
     */
    _setData: function(chartDimension, areaBound, isVertical, options) {
        var verticalData = this._makeVerticalData(chartDimension, areaBound, options.align),
            horizontalData = this._makeHorizontalData(chartDimension, areaBound, options.align);
        if (isVertical) {
            this.mainData = verticalData;
            this.subData = horizontalData;
        } else {
            this.mainData = horizontalData;
            this.subData = verticalData;
        }

        this.positionOption = tui.util.extend({
            left: 0,
            top: 0
        }, options.position);

        this.positions = {};
    },

    /**
     * To calculate main position value.
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {{start: number, end: number}} range range
     * @param {object} data data
     *      @param {string} data.direction direction
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _calculateMainPositionValue: function(tooltipSize, range, data) {
        var isLine = (range.start === range.end),
            padding = isLine ? 9 : 5,
            value = data.basePosition;
        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value += range.end + padding;
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value += range.start - tooltipSize - padding;
        } else if (isLine) {
            value += range.start - tooltipSize / 2;
        } else {
            value += range.start + ((range.end - range.start - tooltipSize) / 2);
        }
        return value;
    },

    /**
     * To calculate sub position value.
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.areaSize tooltip area size (width or height)
     *      @param {string} data.direction direction
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _calculateSubPositionValue: function(tooltipSize, data) {
        var middle = data.areaSize / 2,
            value;
        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = middle + data.basePosition;
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value = middle - tooltipSize + data.basePosition;
        } else {
            value = middle - (tooltipSize / 2) + data.basePosition;
        }
        return value;
    },

    /**
     * To make position value diff.
     * @param {number} value positoin value
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     * @returns {number} diff
     * @private
     */
    _makePositionValueDiff: function(value, tooltipSize, data) {
        return value + data.areaPosition + tooltipSize - data.chartSize;
    },

    /**
     * Adjust backward position value.
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustBackwardPositionValue: function(value, range, tooltipSize, data) {
        var changedValue;
        if (value < -data.areaPosition) {
            changedValue = this._calculateMainPositionValue(tooltipSize, range, {
                direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
                basePosition: data.basePosition
            });
            if (this._makePositionValueDiff(changedValue, tooltipSize, data) > 0) {
                value = -data.areaPosition;
            } else {
                value = changedValue;
            }
        }
        return value;
    },

    /**
     * Adjust forward position value.
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustForwardPositionValue: function(value, range, tooltipSize, data) {
        var diff = this._makePositionValueDiff(value, tooltipSize, data),
            changedValue;
        if (diff > 0) {
            changedValue = this._calculateMainPositionValue(tooltipSize, range, {
                direction: chartConst.TOOLTIP_DIRECTION_BACKWARD,
                basePosition: data.basePosition
            });
            if (changedValue < -data.areaPosition) {
                value -= diff;
            } else {
                value = changedValue;
            }
        }
        return value;
    },

    /**
     * Adjust main position value
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     * @returns {number} position value
     * @private
     */
    _adjustMainPositionValue: function(value, range, tooltipSize, data) {
        if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value = this._adjustBackwardPositionValue(value, range, tooltipSize, data);
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = this._adjustForwardPositionValue(value, range, tooltipSize, data);
        } else {
            value = tui.util.max([value, -data.areaPosition]);
            value = tui.util.min([value, data.chartSize - data.areaPosition - tooltipSize]);
        }
        return value;
    },

    /**
     * Adjust sub position value.
     * @param {number} value position value
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustSubPositionValue: function(value, tooltipSize, data) {
        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = tui.util.min([value, data.chartSize - data.areaPosition - tooltipSize]);
        } else {
            value = tui.util.max([value, -data.areaPosition]);
        }
        return value;
    },

    /**
     * To make caching key.
     * @param {{start: number, end: number}} range range
     * @returns {string} key
     * @private
     */
    _makeCachingKey: function(range) {
        return range.start + '-' + range.end;
    },

    /**
     * Add position option.
     * @param {number} position position
     * @param {string} positionType position type (left or top)
     * @returns {number} position
     * @private
     */
    _addPositionOptionValue: function(position, positionType) {
        return position + this.positionOption[positionType];
    },

    /**
     * To calculate group tooltip position.
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{start: number, end: number}} range tooltip sector range
     * @returns {{left: number, top: number}} group tooltip position
     */
    calculatePosition: function(tooltipDimension, range) {
        var key = this._makeCachingKey(range),
            main = this.mainData,
            sub = this.subData,
            position = this.positions[key],
            mainPosition, subPosition;

        if (!position) {
            position = {};
            mainPosition = this._calculateMainPositionValue(tooltipDimension[main.sizeType], range, main);
            subPosition = this._calculateSubPositionValue(tooltipDimension[sub.sizeType], sub);

            mainPosition = this._addPositionOptionValue(mainPosition, main.positionType);
            subPosition = this._addPositionOptionValue(subPosition, sub.positionType);

            position[main.positionType] = this._adjustMainPositionValue(mainPosition, range, tooltipDimension[main.sizeType], main);
            position[sub.positionType] = this._adjustSubPositionValue(subPosition, tooltipDimension[sub.sizeType], sub);
            this.positions[key] = position;
        }

        return position;
    },

    /**
     * Update tooltip options for position calculation.
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     */
    updateOptions: function(options) {
        this.options = options;
        this._setData(this.chartDimension, this.areaBound, this.isVertical, options);
    },

    /**
     * Update tooltip bound for position calculation.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound tooltip area bound
     */
    updateBound: function(bound) {
        this.areaBound = bound;
        this._setData(this.chartDimension, bound, this.isVertical, this.options);
    }
});

module.exports = GroupTooltipPositionModel;

},{"../const":15}],62:[function(require,module,exports){
/**
 * @fileoverview Tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    dom = require('../helpers/domHandler'),
    eventListener = require('../helpers/eventListener'),
    renderUtil = require('../helpers/renderUtil'),
    templateMaker = require('../helpers/templateMaker'),
    tooltipTemplate = require('./tooltipTemplate');

var Tooltip = tui.util.defineClass(TooltipBase, /** @lends Tooltip.prototype */ {
    /**
     * Tooltip component.
     * @constructs Tooltip
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        var values;
        TooltipBase.call(this, params);
        this.tplTooltip = this._getTooltipTemplate(this.options.template);
        if (tui.util.isArray(this.values)) {
            values = this.values;
            this.values = {};
            this.values[this.chartType] = values;
        }
    },

    /**
     * Get tooltip template.
     * @param {object} optionTemplate template option
     * @returns {object} template
     * @private
     */
    _getTooltipTemplate: function(optionTemplate) {
        return optionTemplate ? templateMaker.template(optionTemplate) : tooltipTemplate.tplDefault;
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.align) {
            return;
        }

        if (this.isVertical) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        } else {
            this.options.align = chartConst.TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION;
        }
    },

    /**
     * To render tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     * @returns {HTMLElement} tooltip element
     * @override
     */
    render: function(bound, data) {
        var el = TooltipBase.prototype.render.call(this, bound, data);

        if (data) {
            this.seriesPosition = data.seriesPosition;
        }

        this.attachEvent(el);
        return el;
    },

    /**
     * To resize tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     * @override
     */
    resize: function(bound, data) {
        if (data) {
            this.seriesPosition = data.seriesPosition;
        }
        TooltipBase.prototype.resize.call(this, bound);
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        var labels = this.labels,
            tooltipData = {},
            legendLabels = {};

        if (tui.util.isArray(this.formattedValues)) {
            tooltipData[this.chartType] = this.formattedValues;
            legendLabels[this.chartType] = this.legendLabels;
        } else {
            tooltipData = this.formattedValues;
            legendLabels = this.legendLabels;
        }

        tui.util.forEach(tooltipData, function(groupValues, chartType) {
            tooltipData[chartType] = tui.util.map(groupValues, function(values, groupIndex) {
                return tui.util.map(values, function(value, index) {
                    return {
                        category: labels ? labels[groupIndex] : '',
                        legend: legendLabels[chartType][index],
                        value: value
                    };
                });
            });
        });
        return tooltipData;
    },

    /**
     * Fire custom event showAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} chartType chart type
     * @private
     */
    _fireShowAnimation: function(indexes, chartType) {
        var eventName = renderUtil.makeCustomEventName('show', chartType, 'animation');
        this.fire(eventName, indexes);
    },

    /**
     * Fire custom event hideAnimation.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} chartType chart type
     * @private
     */
    _fireHideAnimation: function(indexes, chartType) {
        var eventName = renderUtil.makeCustomEventName('hide', chartType, 'animation');
        this.fire(eventName, indexes);
    },

    /**
     * Set data indexes.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{groupIndex: number, index:number}} indexes indexes
     * @private
     */
    _setIndexesCustomAttribute: function(elTooltip, indexes) {
        elTooltip.setAttribute('data-groupIndex', indexes.groupIndex);
        elTooltip.setAttribute('data-index', indexes.index);
    },

    /**
     * Get data indexes
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {{groupIndex: number, index: number}} indexes
     * @private
     */
    _getIndexesCustomAttribute: function(elTooltip) {
        var groupIndex = elTooltip.getAttribute('data-groupIndex'),
            index = elTooltip.getAttribute('data-index'),
            indexes = null;

        if (!tui.util.isNull(groupIndex) && !tui.util.isNull(index)) {
            indexes = {
                groupIndex: parseInt(groupIndex, 10),
                index: parseInt(index, 10)
            };
        }
        return indexes;
    },

    /**
     * Set showed custom attribute.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {boolean} status whether showed or not
     * @private
     */
    _setShowedCustomAttribute: function(elTooltip, status) {
        elTooltip.setAttribute('data-showed', status);
    },

    /**
     * Whether showed tooltip or not.
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {boolean} whether showed tooltip or not
     * @private
     */
    _isShowedTooltip: function(elTooltip) {
        var isShowed = elTooltip.getAttribute('data-showed');
        return isShowed === 'true' || isShowed === true; // ie7에서는 boolean형태의 true를 반환함
    },

    /**
     * On mouseover event handler for tooltip area
     * @param {MouseEvent} e mouse event
     */
    onMouseover: function(e) {
        var elTarget = e.target || e.srcElement,
            indexes, chartType;

        if (!dom.hasClass(elTarget, chartConst.TOOLTIP_PREFIX)) {
            elTarget = dom.findParentByClass(elTarget, chartConst.TOOLTIP_PREFIX);
        }

        indexes = this._getIndexesCustomAttribute(elTarget);
        chartType = elTarget.getAttribute('data-chart-type');

        this._setShowedCustomAttribute(elTarget, true);
        this._fireShowAnimation(indexes, chartType);
    },

    /**
     * On mouseout event handler for tooltip area
     * @param {MouseEvent} e mouse event
     */
    onMouseout: function(e) {
        var elTarget = e.target || e.srcElement;


        if (!dom.hasClass(elTarget, chartConst.TOOLTIP_PREFIX)) {
            elTarget = dom.findParentByClass(elTarget, chartConst.TOOLTIP_PREFIX);
        }

        this.hideTooltip(elTarget);
    },

    /**
     * To calculate tooltip position abount pie chart.
     * @param {object} params parameters
     *      @param {{left: number, top: number}} params.bound bound
     *      @param {{clientX: number, clientY: number}} params.eventPosition mouse position
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutPieChart: function(params) {
        params.bound.left = params.eventPosition.clientX - this.seriesPosition.left;
        params.bound.top = params.eventPosition.clientY - this.seriesPosition.top;
        return this._calculateTooltipPositionAboutNotBarChart(params);
    },

    /**
     * To calculate tooltip position about not bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutNotBarChart: function(params) {
        var bound = params.bound,
            positionOption = params.positionOption,
            minusWidth = params.dimension.width - (bound.width || 0),
            lineGap = bound.width ? 0 : chartConst.TOOLTIP_GAP,
            alignOption = params.alignOption || '',
            tooltipHeight = params.dimension.height,
            result = {};
        result.left = bound.left + positionOption.left;
        result.top = bound.top - tooltipHeight + positionOption.top;

        if (alignOption.indexOf('left') > -1) {
            result.left -= minusWidth + lineGap;
        } else if (alignOption.indexOf('center') > -1) {
            result.left -= minusWidth / 2;
        } else {
            result.left += lineGap;
        }

        if (alignOption.indexOf('bottom') > -1) {
            result.top += tooltipHeight + lineGap;
        } else if (alignOption.indexOf('middle') > -1) {
            result.top += tooltipHeight / 2;
        } else {
            result.top -= chartConst.TOOLTIP_GAP;
        }

        return result;
    },

    /**
     * To calculate tooltip position about bar chart.
     * @param {object} params parameters
     *      @param {{bound: object}} params.data graph information
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPositionAboutBarChart: function(params) {
        var bound = params.bound,
            positionOption = params.positionOption,
            minusHeight = params.dimension.height - (bound.height || 0),
            alignOption = params.alignOption || '',
            tooltipWidth = params.dimension.width,
            result = {};

        result.left = bound.left + bound.width + positionOption.left;
        result.top = bound.top + positionOption.top;

        // TODO : alignOptions을 객체로 만들어서 검사하도록 변경하기 ex) alignOption.left = true
        if (alignOption.indexOf('left') > -1) {
            result.left -= tooltipWidth;
        } else if (alignOption.indexOf('center') > -1) {
            result.left -= tooltipWidth / 2;
        } else {
            result.left += chartConst.TOOLTIP_GAP;
        }

        if (alignOption.indexOf('top') > -1) {
            result.top -= minusHeight;
        } else if (alignOption.indexOf('middle') > -1) {
            result.top -= minusHeight / 2;
        }

        return result;
    },

    /**
     * Adjust position.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{left: number, top: number}} areaPosition area position
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{left: number, top: number}} position position
     * @returns {{left: number, top: number}} adjusted position
     * @private
     */
    _adjustPosition: function(chartDimension, areaPosition, tooltipDimension, position) {
        position.left = tui.util.max([position.left, -areaPosition.left]);
        position.left = tui.util.min([position.left, chartDimension.width - areaPosition.left - tooltipDimension.width]);
        position.top = tui.util.max([position.top, -areaPosition.top]);
        position.top = tui.util.min([position.top, chartDimension.height - areaPosition.top - tooltipDimension.height]);
        return position;
    },

    /**
     * Calculate tooltip position.
     * @param {object} params parameters
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.chartType chart type
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.alignOption position option (ex: 'left top')
     * @returns {{top: number, left: number}} position
     * @private
     */
    _calculateTooltipPosition: function(params) {
        var position = {},
            sizeType, positionType, addPadding;

        if (params.eventPosition) {
            return this._calculateTooltipPositionAboutPieChart(params);
        }

        if (predicate.isBarChart(params.chartType)) {
            position = this._calculateTooltipPositionAboutBarChart(params);
            sizeType = 'width';
            positionType = 'left';
            addPadding = 1;
        } else {
            position = this._calculateTooltipPositionAboutNotBarChart(params);
            sizeType = 'height';
            positionType = 'top';
            addPadding = -1;
        }

        if (params.allowNegativeTooltip) {
            position = this._moveToSymmetry(position, {
                bound: params.bound,
                indexes: params.indexes,
                dimension: params.dimension,
                chartType: params.chartType,
                sizeType: sizeType,
                positionType: positionType,
                addPadding: addPadding
            });
        }

        position = this._adjustPosition(this.chartDimension, this.bound.position, params.dimension, position);
        return position;
    },

    /**
     * Get value by indexes.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} chartType chart type
     * @returns {(string | number)} value
     * @private
     */
    _getValueByIndexes: function(indexes, chartType) {
        return this.values[chartType][indexes.groupIndex][indexes.index];
    },

    /**
     * Move to symmetry.
     * @param {{left: number, top: number}} position tooltip position
     * @param {object} params parameters
     *      @param {{left: number, top: number, width: number, height: number}} params.bound graph bound
     *      @param {string} params.id tooltip id
     *      @param {{width: number, height: number}} params.dimension tooltip dimension
     *      @param {string} params.sizeType size type (width or height)
     *      @param {string} params.positionType position type (left or top)
     *      @param {number} params.addPadding add padding
     * @returns {{left: number, top: number}} moved position
     * @private
     */
    _moveToSymmetry: function(position, params) {
        var bound = params.bound,
            sizeType = params.sizeType,
            positionType = params.positionType,
            value = this._getValueByIndexes(params.indexes, params.chartType),
            center;
        if (value < 0) {
            center = bound[positionType] + (bound[sizeType] / 2) + (params.addPadding || 0);
            position[positionType] = position[positionType] - (position[positionType] - center) * 2 - params.dimension[sizeType];
        }
        return position;
    },

    /**
     * To make tooltip html.
     * @param {string} chartType chart type
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(chartType, indexes) {
        var data = this.data[chartType][indexes.groupIndex][indexes.index];
        data.suffix = this.suffix;
        return this.tplTooltip(data);
    },

    /**
     * Whether changed indexes or not.
     * @param {{groupIndex: number, index: number}} prevIndexes prev indexes
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChangedIndexes: function(prevIndexes, indexes) {
        return !!prevIndexes && (prevIndexes.groupIndex !== indexes.groupIndex || prevIndexes.index !== indexes.index);
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{indexes: {groupIndex: number, index: number}, bound: object}} params tooltip data
     * @param {{left: number, top: number}} prevPosition prev position
     */
    showTooltip: function(elTooltip, params, prevPosition) {
        var indexes = params.indexes,
            prevIndexes = this._getIndexesCustomAttribute(elTooltip),
            prevChartType, position;
        if (this._isChangedIndexes(prevIndexes, indexes)) {
            prevChartType = elTooltip.getAttribute('data-chart-type');
            this._fireHideAnimation(prevIndexes, prevChartType);
        }

        elTooltip.innerHTML = this._makeTooltipHtml(params.chartType, indexes);

        elTooltip.setAttribute('data-chart-type', params.chartType);
        this._setIndexesCustomAttribute(elTooltip, indexes);
        this._setShowedCustomAttribute(elTooltip, true);

        this._fireBeforeShowTooltip(indexes);

        dom.addClass(elTooltip, 'show');

        position = this._calculateTooltipPosition(tui.util.extend({
            dimension: this.getTooltipDimension(elTooltip),
            positionOption: tui.util.extend({
                left: 0,
                top: 0
            }, this.options.position),
            alignOption: this.options.align || ''
        }, params));

        this.moveToPosition(elTooltip, position, prevPosition);
        this._fireShowAnimation(indexes, params.chartType);
        this._fireAfterShowTooltip(indexes, {
            element: elTooltip,
            position: position
        });
    },

    /**
     * To make parameters for show tooltip user event.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {object} additionParams addition parameters
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} parameters for show tooltip
     * @private
     */
    _makeShowTooltipParams: function(indexes, additionParams) {
        var legendIndex = indexes.index,
            legendData = this.joinLegendLabels[legendIndex],
            params;
        params = tui.util.extend({
            chartType: legendData.chartType,
            legend: legendData.label,
            legendIndex: legendIndex,
            index: indexes.groupIndex
        }, additionParams);
        return params;
    },

    /**
     * To call beforeShowTooltip callback of userEvent.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @private
     */
    _fireBeforeShowTooltip: function(indexes) {
        var params = this._makeShowTooltipParams(indexes);
        this.userEvent.fire('beforeShowTooltip', params);
    },

    /**
     * To call afterShowTooltip callback of userEvent.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {object} additionParams addition parameters
     * @private
     */
    _fireAfterShowTooltip: function(indexes, additionParams) {
        var params = this._makeShowTooltipParams(indexes, additionParams);
        this.userEvent.fire('afterShowTooltip', params);
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {function} callback callback
     */
    hideTooltip: function(elTooltip) {
        var that = this,
            indexes = this._getIndexesCustomAttribute(elTooltip),
            chartType = elTooltip.getAttribute('data-chart-type');

        this._setShowedCustomAttribute(elTooltip, false);
        this._fireHideAnimation(indexes, chartType);

        if (this._isChangedIndexes(this.prevIndexes, indexes)) {
            delete this.prevIndexes;
        }

        setTimeout(function() {
            if (that._isShowedTooltip(elTooltip)) {
                return;
            }
            that.hideAnimation(elTooltip);

            that = null;
            indexes = null;
        }, chartConst.HIDE_DELAY);
    },

    /**
     * Attach event
     * @param {HTMLElement} el target element
     */
    attachEvent: function(el) {
        eventListener.bindEvent('mouseover', el, tui.util.bind(this.onMouseover, this));
        eventListener.bindEvent('mouseout', el, tui.util.bind(this.onMouseout, this));
    }
});

tui.util.CustomEvents.mixin(Tooltip);

module.exports = Tooltip;

},{"../const":15,"../helpers/domHandler":30,"../helpers/eventListener":31,"../helpers/predicate":32,"../helpers/renderUtil":33,"../helpers/templateMaker":34,"./tooltipBase":63,"./tooltipTemplate":64}],63:[function(require,module,exports){
/**
 * @fileoverview TooltipBase is base class of tooltip components.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');

var TooltipBase = tui.util.defineClass(/** @lends TooltipBase.prototype */ {
    /**
     * TooltipBase is base class of tooltip components.
     * @constructs TooltipBase
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        tui.util.extend(this, params);
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-chart-tooltip-area';

        /**
         * TooltipBase container.
         * @type {HTMLElement}
         */
        this.elLayout = null;

        /**
         * TooltipBase base data.
         * @type {array.<array.<object>>}
         */
        this.data = this.makeTooltipData();


        this.suffix = this.options.suffix ? '&nbsp;' + this.options.suffix : '';

        this._setDefaultTooltipPositionOption();
        this._saveOriginalPositionOptions();
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @abstract
     */
    _setDefaultTooltipPositionOption: function() {},

    /**
     * To save position options.
     * @private
     */
    _saveOriginalPositionOptions: function() {
        this.orgPositionOptions = {
            align: this.options.align,
            position: this.options.position
        };
    },

    /**
     * To make tooltip data.
     * @abstract
     */
    makeTooltipData: function() {},

    /**
     * To render tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     * @returns {HTMLElement} tooltip element
     */
    render: function(bound, data) {
        var el = dom.create('DIV', this.className);

        renderUtil.renderPosition(el, bound.position);

        this.bound = bound;
        this.chartDimension = data.chartDimension;
        this.elTooltipArea = el;

        return el;
    },

    /**
     * To resize tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @override
     */
    resize: function(bound) {
        this.bound = bound;
        renderUtil.renderPosition(this.elTooltipArea, bound.position);
        if (this.positionModel) {
            this.positionModel.updateBound(bound);
        }
    },

    /**
     * Get tooltip element.
     * @returns {HTMLElement} tooltip element
     * @private
     */
    _getTooltipElement: function() {
        var elTooltip;
        if (!this.elTooltip) {
            this.elTooltip = elTooltip = dom.create('DIV', 'tui-chart-tooltip');
            dom.append(this.elTooltipArea, elTooltip);
        }
        return this.elTooltip;
    },

    /**
     * onShow is callback of custom event showTooltip for SeriesView.
     * @param {object} params coordinate event parameters
     */
    onShow: function(params) {
        var elTooltip = this._getTooltipElement(),
            prevPosition;
        if (elTooltip.offsetWidth) {
            prevPosition = {
                left: elTooltip.offsetLeft,
                top: elTooltip.offsetTop
            };
        }

        this.showTooltip(elTooltip, params, prevPosition);
    },

    /**
     * Get tooltip dimension
     * @param {HTMLElement} elTooltip tooltip element
     * @returns {{width: number, height: number}} rendered tooltip dimension
     */
    getTooltipDimension: function(elTooltip) {
        return {
            width: elTooltip.offsetWidth,
            height: elTooltip.offsetHeight
        };
    },

    /**
     * Cancel hide tooltip.
     * @private
     */
    _cancelHide: function() {
        if (!this.activeHider) {
            return;
        }
        clearInterval(this.activeHider.timerId);
        this.activeHider.setOpacity(1);
    },

    /**
     * Cancel slide tooltip.
     * @private
     */
    _cancelSlide: function() {
        if (!this.activeSliders) {
            return;
        }

        tui.util.forEach(this.activeSliders, function(slider) {
            clearInterval(slider.timerId);
        });

        this._completeSlide();
    },

    /**
     * Move to Position.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{left: number, top: number}} position position
     * @param {{left: number, top: number}} prevPosition prev position
     */
    moveToPosition: function(elTooltip, position, prevPosition) {
        if (prevPosition) {
            this._cancelHide();
            this._cancelSlide();
            this._slideTooltip(elTooltip, prevPosition, position);
        } else {
            renderUtil.renderPosition(elTooltip, position);
        }
    },

    /**
     * Get slider.
     * @param {HTMLElement} element element
     * @param {string} type slide type (horizontal or vertical)
     * @returns {object} effect object
     * @private
     */
    _getSlider: function(element, type) {
        if (!this.slider) {
            this.slider = {};
        }

        if (!this.slider[type]) {
            this.slider[type] = new tui.component.Effects.Slide({
                flow: type,
                element: element,
                duration: 100
            });
        }
        return this.slider[type];
    },

    /**
     * Complete slide tooltip.
     * @private
     */
    _completeSlide: function() {
        delete this.activeSliders;
    },

    /**
     * Slide tooltip
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{left: number, top: number}} prevPosition prev position
     * @param {{left: number, top: number}} position position
     * @private
     */
    _slideTooltip: function(elTooltip, prevPosition, position) {
        var vSlider = this._getSlider(elTooltip, 'vertical'),
            hSlider = this._getSlider(elTooltip, 'horizontal'),
            moveTop = prevPosition.top - position.top,
            moveLeft = prevPosition.left - position.left,
            vDirection = moveTop > 0 ? 'forword' : 'backword',
            hDirection = moveTop > 0 ? 'forword' : 'backword',
            activeSliders = [],
            complate = tui.util.bind(this._completeSlide, this);

        if (moveTop) {
            vSlider.setDistance(moveTop);
            vSlider.action({
                direction: vDirection,
                start: prevPosition.top,
                complete: complate
            });
            activeSliders.push(vSlider);
        }

        if (moveLeft) {
            hSlider.setDistance(moveLeft);
            hSlider.action({
                direction: hDirection,
                start: prevPosition.left,
                complete: complate
            });
            activeSliders.push(vSlider);
        }

        if (activeSliders.length) {
            this.activeSliders = activeSliders;
        }
    },

    /**
     * onHide is callback of custom event hideTooltip for SeriesView
     * @param {number} index index
     */
    onHide: function(index) {
        var elTooltip = this._getTooltipElement();
        this.hideTooltip(elTooltip, index);
    },

    /**
     * Get hider.
     * @param {HTMLElement} element element
     * @returns {object} effect object
     * @private
     */
    _getHider: function(element) {
        if (!this.hider) {
            this.hider = new tui.component.Effects.Fade({
                element: element,
                duration: 100
            });
        }

        return this.hider;
    },

    /**
     * To hide animation.
     * @param {HTMLElement} elTooltip tooltip element
     */
    hideAnimation: function(elTooltip) {
        this.activeHider = this._getHider(elTooltip);
        this.activeHider.action({
            start: 1,
            end: 0,
            complete: function() {
                dom.removeClass(elTooltip, 'show');
                elTooltip.style.cssText = '';
            }
        });
    },

    /**
     * Set tooltip align option.
     * @param {string} align align
     */
    setAlign: function(align) {
        this.options.align = align;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Set position option.
     * @param {{left: number, top: number}} position moving position
     */
    setPosition: function(position) {
        this.options.position = tui.util.extend({}, this.options.position, position);
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Reset tooltip align option.
     */
    resetAlign: function() {
        var align = this.orgPositionOptions.align;
        this.options.align = align;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    },

    /**
     * Reset tooltip position.
     */
    resetPosition: function() {
        var position = this.orgPositionOptions.position;
        this.options.position = position;
        if (this.positionModel) {
            this.positionModel.updateOptions(this.options);
        }
    }
});

tui.util.CustomEvents.mixin(TooltipBase);

module.exports = TooltipBase;

},{"../helpers/domHandler":30,"../helpers/renderUtil":33}],64:[function(require,module,exports){
/**
 * @fileoverview This is templates of tooltip.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

var templateMaker = require('../helpers/templateMaker');

var tags = {
    HTML_DEFAULT_TEMPLATE: '<div class="tui-chart-default-tooltip">' +
        '<div>{{ category }}</div>' +
        '<div>' +
            '<span>{{ legend }}</span>:' +
            '&nbsp;<span>{{ value }}</span>' +
            '<span>{{ suffix }}</span>' +
        '</div>' +
    '</div>',
    HTML_GROUP: '<div class="tui-chart-default-tooltip tui-chart-group-tooltip">' +
        '<div>{{ category }}</div>' +
        '{{ items }}' +
    '</div>',
    HTML_GROUP_ITEM: '<div>' +
        '<div class="tui-chart-legend-rect {{ chartType }}" style="{{ cssText }}"></div>&nbsp;<span>{{ legend }}</span>:' +
        '&nbsp;<span>{{ value }}</span>' +
        '<span>{{ suffix }}</span>' +
    '</div>',
    GROUP_CSS_TEXT: 'background-color:{{ color }}'
};

module.exports = {
    tplDefault: templateMaker.template(tags.HTML_DEFAULT_TEMPLATE),
    tplGroup: templateMaker.template(tags.HTML_GROUP),
    tplGroupItem: templateMaker.template(tags.HTML_GROUP_ITEM),
    tplGroupCssText: templateMaker.template(tags.GROUP_CSS_TEXT)
};

},{"../helpers/templateMaker":34}]},{},[3,40])