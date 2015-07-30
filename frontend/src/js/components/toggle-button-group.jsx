var React = require('react');
var _ = require('lodash');
var ButtonGroup = require('react-bootstrap').ButtonGroup;


module.exports = ToggleButtonGroup = React.createClass({


    getInitialState: function () {
        return {}
    },

    componentDidMount: function () {
        this.setCheckboxNames();
        this.setCheckedBoxes();
    },

    componentDidUpdate: function () {
        this.setCheckboxNames();
        this.setCheckedBoxes();
    },

    render: function () {
        var checkboxes = this.setCheckedValues();
        return (
            <ButtonGroup data-toggle="buttons" role="group" onChange={this.props.onChange} value={this.props.value}>
                {checkboxes}
            </ButtonGroup>
        );
    },

    setCheckedValues: function () {
        return this.props.children.map(function (elem) {
            return React.cloneElement(elem, {key: elem.props.value, checked: this.props.value.indexOf(elem.props.value) >= 0})
        }.bind(this));
    },

    setCheckboxNames: function () {
        var $checkboxes = this.getCheckboxes();

        for (var i = 0; i < $checkboxes.length; i++) {
            $checkboxes[i].setAttribute('name', this.props.name);
        }
    },

    getCheckboxes: function () {
        return this.getDOMNode().querySelectorAll('input[type="checkbox"]');
    },

    setCheckedBoxes: function () {
        var $checkboxes = this.getCheckboxes();

        for (var i = 0; i < $checkboxes.length; i++) {
            var $checkbox = $checkboxes[i];

            if (this.props.value.indexOf($checkbox.value) >= 0) {
                $checkbox.checked = true;
            }
        }
    },

    getCheckedValues: function () {
        var $checkboxes = this.getCheckboxes();
        var checked = [];

        for (var i = 0; i < $checkboxes.length; i++) {
            if ($checkboxes[i].checked) {
                checked.push($checkboxes[i].value);
            }
        }
        return checked;
    }
});