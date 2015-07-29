var React = require('react');
var _ = require('lodash');
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;


module.exports = LastDeploymentDropdown = React.createClass({

    lastDeployFilterMapping: [
        {momentValue: "1d", label: "last day"},
        {momentValue: "2d", label: "last 2 days"},
        {momentValue: "3d", label: "last 3 days"},
        {momentValue: "4d", label: "last 4 days"},
        {momentValue: "1w", label: "last week"},
        {momentValue: "2w", label: "last 2 weeks"},
        {momentValue: "3w", label: "last 3 weeks"},
        {momentValue: "1M", label: "last month"},
        {momentValue: "2M", label: "last 2 months"},
        {momentValue: "3M", label: "last 3 months"},
        {momentValue: "4M", label: "last 4 months"},
        {momentValue: "5M", label: "last 5 months"},
        {momentValue: "6M", label: "last 6 months"},
        {momentValue: "1y", label: "last year"},
        {momentValue: "2y", label: "last 2 years"},
        {momentValue: "", label: "beginning of time"}],

    getLabelBy:function(momentValue) {
        return _.chain(this.lastDeployFilterMapping).filter(function(element) {
            return element.momentValue === momentValue;
        }).first().value().label;
    },

    render: function () {
        var selected = this.props.selected;

        return (
            <DropdownButton ref="unit"  className="btn-toggle"
                            onSelect={this.props.onSelect}
                            bsSize="small"
                            title={this.getLabelBy(selected)}>
                {this.lastDeployFilterMapping.map(function(choice) {
                    return <MenuItem key={choice.momentValue} eventKey={choice.momentValue} active={selected === choice.momentValue}>{choice.label}</MenuItem>
                })}
            </DropdownButton>)
    }
});
