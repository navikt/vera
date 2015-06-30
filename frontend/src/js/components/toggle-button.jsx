var React = require('react');
var classString = require('react-classset');

module.exports = ToggleButton = React.createClass({
    getInitialState: function() {
        return {}
    },

    render: function() {
        return this.transferPropsTo(
            <label className={this.toggleBtnClasses(this.props.checked)} title={this.props.tooltip}>
                <input type="checkbox" value={this.props.value} autoComplete="off" className={this.toggleBtnClasses}/>
                {this.createBtnIcons(this.props.iconClassName)}&nbsp;
                {this.props.label}
            </label>
        );
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
            'toggle-on': this.isMounted() && this.getDOMNode().querySelector('input[type="checkbox"]').checked
        })
    }
});