var React = require('react');
var classString = require('react-classset');
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;
var Input = require('react-bootstrap').Tooltip;

module.exports = ToggleButton = React.createClass({
    getInitialState: function () {
        return {}
    },

    render: function () {
        var tooltipPlacement = this.props.tooltipPlacement || "bottom";

        if (this.props.tooltip) {
            var tooltip = (<Tooltip><div>{this.props.tooltip}</div></Tooltip>);
            return (<OverlayTrigger placement={tooltipPlacement} overlay={tooltip}>
                {this.buildCheckbox()}
            </OverlayTrigger>)
        }
        else {
            return this.buildCheckbox();
        }
    },

    buildCheckbox: function () {
        var optionalProps = {};

        if (this.props.onChange) {
            optionalProps = {onChange: this.props.onChange}
        }

        return (
            <label className={this.toggleBtnClasses()}>
                <input type="checkbox" value={this.props.value} autoComplete="off"
                       className={this.toggleBtnClasses} {...optionalProps} />
                {this.createBtnIcons(this.props.iconClassName)}&nbsp;
                {this.props.label}
            </label>
        )
    },

    createBtnIcons: function (cssClassesNames) {
        var icons = [];

        if (cssClassesNames) {
            cssClassesNames.forEach(function (cssClass) {
                icons.push(<i key={cssClass} className={cssClass}></i>)
            })
        }

        return icons;
    },

    toggleBtnClasses: function () {
        return classString({
            'btn': true,
            'btn-toggle': true,
            'btn-sm': true,
            'toggle-on': this.props.checked
        })
    }
});