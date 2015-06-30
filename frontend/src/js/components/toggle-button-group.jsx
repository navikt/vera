var React = require('react');

module.exports = ToggleButtonGroup = React.createClass({
    getInitialState: function() {
        return {defaultValue: this.props.defaultValue || []}
    },

    componentDidMount: function() {
        this.setCheckboxNames();
        this.setCheckedBoxes();
    },

    componentDidUpdate: function() {
        this.setCheckboxNames();
        this.setCheckedBoxes();
    },

    render: function() {
        return this.transferPropsTo(
            <div className="btn-group" data-toggle="buttons" role="group" onChange={this.props.onChange}>
                 {this.props.children}
            </div>
        );
    },

    setCheckboxNames: function() {
        var $checkboxes = this.getCheckboxes();

        for(var i = 0; i < $checkboxes.length; i++) {
            $checkboxes[i].setAttribute('name', this.props.name);
        }
    },

    getCheckboxes: function() {
        return this.getDOMNode().querySelectorAll('input[type="checkbox"]');
    },

    setCheckedBoxes: function() {
        var $checkboxes = this.getCheckboxes();
        var desinationValue = this.props.value != null ? this.props.value : this.state.defaultValue;

        for(var i = 0; i < $checkboxes.length; i++) {
            var $checkbox = $checkboxes[i];

            if(desinationValue.indexOf($checkbox.value) >= 0 ) {
                $checkbox.checked = true;
            }
        }
    },

    getCheckedValues: function() {
        var $checkboxes = this.getCheckboxes();
        var checked = [];

        for(var i = 0; i < $checkboxes.length; i++) {
            if($checkboxes[i].checked) {
                checked.push($checkboxes[i].value);
            }
        }
        return checked;
    }
});