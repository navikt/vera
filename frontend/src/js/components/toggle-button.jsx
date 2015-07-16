var React = require('react');
var classString = require('react-classset');

module.exports = ToggleButton = React.createClass({
    getInitialState: function () {
        return {}
    },

    componentDidMount: function () {
        this.setState({domNode: this.getDOMNode().querySelector('input[type="checkbox"]')});
    },

    render: function () {
        return (
            <label className={this.toggleBtnClasses()} title={this.props.tooltip}>
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
            'toggle-on': this.state.domNode && this.state.domNode.checked
        })
    }
});